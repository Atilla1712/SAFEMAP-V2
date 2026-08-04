import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { SupportResource } from "./src/data/resources";
import {
  getResourcesFromFirestore,
  saveResourceToFirestore,
  deleteResourceFromFirestore,
  getPendingSubmissionsFromFirestore,
  addPendingSubmissionToFirestore,
  deletePendingSubmissionFromFirestore,
  getApprovedHistoryFromFirestore,
  addApprovedHistoryToFirestore,
  getChatsFromFirestore,
  getChatFromFirestore,
  saveChatToFirestore,
  getAdminCredentialsFromFirestore,
  saveAdminCredentialsToFirestore,
  seedDefaultResourcesToFirestore,
} from "./src/lib/db-service";

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS for web deployment and cross-origin access
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Token");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const ADMIN_TOKEN = "safemap-admin-auth-secret-token-2026";

// Auth Middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${ADMIN_TOKEN}` || req.headers["x-admin-token"] === ADMIN_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized access. Please log in." });
  }
}

// Ensure default resources are seeded to Firebase on startup (non-blocking)
seedDefaultResourcesToFirestore().catch((err) => {
  console.warn("Startup seed error (can be ignored in serverless):", err);
});

// Lazy Gemini Client initialization to avoid server crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// 1. Get Approved Resources (Public) - backed by Firebase Firestore
app.get("/api/resources", async (req, res) => {
  try {
    const resources = await getResourcesFromFirestore();
    res.json(resources);
  } catch (err) {
    console.error("GET /api/resources error:", err);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

// 2. Submit a New Resource Proposal (Public)
app.post("/api/resources", async (req, res) => {
  const { name, category, address, phone, hours, free, lat, lng, notes } = req.body;
  
  if (!name || !category || !address || !phone || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newSubmission = {
    id: "pnd_" + Math.random().toString(36).substr(2, 9),
    name,
    category,
    address,
    phone,
    hours: hours || "Not specified",
    free: !!free,
    lat: Number(lat),
    lng: Number(lng),
    notes: notes || "",
    tags: [category],
    submittedAt: new Date().toISOString()
  };

  try {
    await addPendingSubmissionToFirestore(newSubmission);
    res.status(201).json({ success: true, submission: newSubmission });
  } catch (err) {
    console.error("POST /api/resources error:", err);
    res.status(500).json({ error: "Failed to submit proposal" });
  }
});

// 3. Get or Create Chat Session
app.get("/api/chats/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  try {
    let session = await getChatFromFirestore(sessionId);
    
    if (!session) {
      session = {
        sessionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        needsHuman: false,
        language: "id",
        messages: []
      };
      await saveChatToFirestore(session);
    }
    
    res.json(session);
  } catch (err) {
    console.error("GET /api/chats/:sessionId error:", err);
    res.status(500).json({ error: "Failed to load chat session" });
  }
});

// 4. Request Human Hand-Off for Chat
app.post("/api/chats/:sessionId/human", async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await getChatFromFirestore(sessionId);
    
    if (session) {
      session.needsHuman = true;
      session.updatedAt = new Date().toISOString();
      session.messages = session.messages || [];
      
      // Append a system notification message
      session.messages.push({
        id: "sys_" + Math.random().toString(36).substr(2, 9),
        role: "model",
        text: "SYSTEM_NOTIFICATION: Sesi Anda telah ditandai untuk moderator konselor manusia.",
        timestamp: new Date().toISOString()
      });

      await saveChatToFirestore(session);
      res.json({ success: true, chat: session });
    } else {
      res.status(404).json({ error: "Session not found" });
    }
  } catch (err) {
    console.error("POST /api/chats/:sessionId/human error:", err);
    res.status(500).json({ error: "Failed to request human counselor" });
  }
});

// 5. Post message to chat session (Runs server-side Gemini AI if not handled by human)
app.post("/api/chat", async (req, res) => {
  const { sessionId, message, language } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: "SessionId and message are required" });
  }

  const currentLang = language === "en" ? "en" : "id";

  try {
    let session = await getChatFromFirestore(sessionId);

    if (!session) {
      session = {
        sessionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        needsHuman: false,
        language: currentLang,
        messages: []
      };
    }

    session.language = currentLang;
    session.messages = session.messages || [];

    // Append user message
    const userMsgId = "msg_" + Math.random().toString(36).substr(2, 9);
    const userMsg = {
      id: userMsgId,
      role: "user" as const,
      text: message,
      timestamp: new Date().toISOString()
    };
    session.messages.push(userMsg);
    session.updatedAt = new Date().toISOString();

    // CRISIS DETECTION IN MESSAGE
    const lowercaseMsg = message.toLowerCase();
    const crisisKeywords = [
      "bunuh diri", "suicide", "akhiri hidup", "self harm", "menyakiti diri", "darurat", "bahaya", 
      "diperkosa", "raping", "pukulan", "disiksa", "dibunuh", "killing", "abuse", "danger", "die", "mati"
    ];
    const containsCrisis = crisisKeywords.some(kw => lowercaseMsg.includes(kw));

    let aiReply = "";

    if (containsCrisis) {
      if (currentLang === "id") {
        aiReply = "🚨 PERINGATAN DARURAT KRITIS: Keselamatan Anda adalah prioritas utama. Sistem mendeteksi tanda bahaya atau ancaman segera. Harap segera hubungi layanan darurat berikut:\n\n" +
                  "• Polisi: 110 (Respons Darurat Fisik)\n" +
                  "• SAPA KemenPPPA: 129 (Evakuasi & Rumah Aman)\n" +
                  "• Krisis Kesehatan & Medis: 119\n\n" +
                  "Harap segera tinggalkan lokasi jika tidak aman dan cari perlindungan di kantor kepolisian terdekat atau rumah ibadah terdekat. Kami di sini mendukung Anda, tetapi mohon hubungi pihak berwenang.";
      } else {
        aiReply = "🚨 CRITICAL EMERGENCY NOTICE: Your immediate safety is our absolute priority. System detected distress or immediate danger signals. Please contact emergency services right away:\n\n" +
                  "• Police: 110 (Physical Security Dispatch)\n" +
                  "• SAPA Ministry PPPA: 129 (Emergency Evacuation & Shelters)\n" +
                  "• Health Crisis & Ambulance: 119\n\n" +
                  "Please leave the location immediately if it is unsafe and seek shelter at the nearest police station or public building. We support you, but please contact professional responders.";
      }
    } else {
      try {
        const client = getGeminiClient();
        
        const chatHistory = session.messages
          .slice(-10)
          .map((m: any) => `${m.role === "user" ? "User" : "SafePin"}: ${m.text}`)
          .join("\n");

        const systemPrompt = `You are "SafePin", an empathetic, supportive, and practical AI companion and screening assistant for SafeMap. SafeMap is an anonymous support app for people affected by violence (physical, verbal, domestic/KDRT, and cyberbullying) in the Greater Jakarta (Jabodetabek) area.

CRITICAL RESPONSIBILITIES & CONSTRAINTS:
1. Speak in ${currentLang === "en" ? "English" : "Bahasa Indonesia"}.
2. Be warm, calm, highly supportive, and objective. Never sound cold or overly technical.
3. IMPORTANT: You are NOT a licensed counselor, doctor, lawyer, or clinical expert. You must NEVER provide medical diagnoses, legal verdicts, or promise specific case outcomes. Always remind the user gently if they ask for professional verdicts.
4. Encourage using the app's features: the "Asesmen Mandiri" (Self-assessment) to understand risk severity, the interactive map to find free shelters/legal aid in Jabodetabek, and the "Darurat" contact panel.
5. CRISIS PROTOCOL: If the user indicates any self-harm, suicidal ideation, or immediate threat of severe physical harm (even if not caught by keyword filters), immediately halt normal conversation and guide them explicitly to call the National Emergency services: Polisi 110 or SAPA 129. Do not give open-ended advice.
6. Jabodetabek Scoped: Focus on Greater Jakarta services (P2TP2A, LBH APIK, Yayasan Pulih, RSCM).

Conversation History:
${chatHistory}

SafePin response:`;

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          }
        });

        aiReply = response.text || "SafePin is unable to respond right now. Please check your internet connection.";
      } catch (err: any) {
        console.error("Gemini API Error:", err);
        if (currentLang === "id") {
          aiReply = "Halo, SafePin sedang mengalami gangguan koneksi. Jika situasi Anda membutuhkan perhatian mendesak, silakan gunakan tombol Kontak Darurat di bagian bawah layar untuk segera menghubungi pihak berwenang. Anda tidak sendiri.";
        } else {
          aiReply = "Hello, SafePin is currently experiencing connection delays. If your situation is urgent, please use the Emergency Hotlines button at the bottom of the screen to connect with professional help. You are not alone.";
        }
      }
    }

    const aiMsgId = "msg_" + Math.random().toString(36).substr(2, 9);
    const aiMsg = {
      id: aiMsgId,
      role: "model" as const,
      text: aiReply,
      timestamp: new Date().toISOString()
    };
    session.messages.push(aiMsg);
    session.updatedAt = new Date().toISOString();

    await saveChatToFirestore(session);

    res.json({ success: true, chat: session, reply: aiMsg });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

// ==========================================
// ADMIN API ENDPOINTS (PROTECTED)
// ==========================================

// 1. Moderator Login (Backed by Firebase Firestore with environment defaults)
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body || {};
  const cleanUser = (username || "").toString().trim();
  const cleanPass = (password || "").toString().trim();

  try {
    const creds = await getAdminCredentialsFromFirestore();
    const envUser = (process.env.ADMIN_USERNAME || "ADMINSAFEMAP").trim();
    const envPass = (process.env.ADMIN_PASSWORD || "RADEN4EVER").trim();

    const matchFirestore = cleanUser.toLowerCase() === (creds.username || "").trim().toLowerCase() && cleanPass === (creds.password || "").trim();
    const matchEnv = cleanUser.toLowerCase() === envUser.toLowerCase() && cleanPass === envPass;
    const matchDefault = cleanUser.toLowerCase() === "adminsafemap" && cleanPass === "RADEN4EVER";

    if (matchFirestore || matchEnv || matchDefault) {
      res.json({ success: true, token: creds.token || ADMIN_TOKEN });
    } else {
      res.status(401).json({ error: "Username atau password salah!" });
    }
  } catch (err) {
    console.error("POST /api/admin/login error:", err);
    // Fallback check against env vars / defaults if Firestore errors
    const envUser = (process.env.ADMIN_USERNAME || "ADMINSAFEMAP").trim();
    const envPass = (process.env.ADMIN_PASSWORD || "RADEN4EVER").trim();
    if ((cleanUser.toLowerCase() === envUser.toLowerCase() && cleanPass === envPass) ||
        (cleanUser.toLowerCase() === "adminsafemap" && cleanPass === "RADEN4EVER")) {
      return res.json({ success: true, token: ADMIN_TOKEN });
    }
    res.status(401).json({ error: "Username atau password salah!" });
  }
});

// 2. List Pending Proposals
app.get("/api/admin/pending", requireAdmin, async (req, res) => {
  try {
    const list = await getPendingSubmissionsFromFirestore();
    res.json(list);
  } catch (err) {
    console.error("GET /api/admin/pending error:", err);
    res.status(500).json({ error: "Failed to fetch pending submissions" });
  }
});

// 3. Approve Proposal
app.post("/api/admin/approve/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const pendingList = await getPendingSubmissionsFromFirestore();
    const approved = pendingList.find((p: any) => p.id === id);
    if (!approved) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    await deletePendingSubmissionFromFirestore(id);

    const finalId = "res_" + Math.random().toString(36).substr(2, 9);
    const finalResource: SupportResource = {
      id: finalId,
      name: approved.name,
      category: approved.category,
      address: approved.address,
      phone: approved.phone,
      hours: approved.hours,
      free: approved.free,
      lat: approved.lat,
      lng: approved.lng,
      notes: approved.notes,
      tags: approved.tags || [approved.category]
    };

    await saveResourceToFirestore(finalResource);
    await addApprovedHistoryToFirestore({
      originalProposal: approved,
      approvedAs: finalResource,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, resource: finalResource });
  } catch (err) {
    console.error("POST /api/admin/approve/:id error:", err);
    res.status(500).json({ error: "Failed to approve proposal" });
  }
});

// 4. Reject Proposal
app.post("/api/admin/reject/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await deletePendingSubmissionFromFirestore(id);
    res.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/reject/:id error:", err);
    res.status(500).json({ error: "Failed to reject proposal" });
  }
});

// 5. Get Approved History Logs
app.get("/api/admin/approved-history", requireAdmin, async (req, res) => {
  try {
    const list = await getApprovedHistoryFromFirestore();
    res.json(list);
  } catch (err) {
    console.error("GET /api/admin/approved-history error:", err);
    res.status(500).json({ error: "Failed to fetch approved history" });
  }
});

// 6. Get Editable Database
app.get("/api/admin/resources", requireAdmin, async (req, res) => {
  try {
    const resources = await getResourcesFromFirestore();
    res.json(resources);
  } catch (err) {
    console.error("GET /api/admin/resources error:", err);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

// 7. Update Resource
app.put("/api/admin/resources/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, category, address, phone, hours, free, lat, lng, notes, tags } = req.body;

  try {
    const resources = await getResourcesFromFirestore();
    const existing = resources.find((r) => r.id === id);
    if (!existing) {
      return res.status(404).json({ error: "Resource not found" });
    }

    const updated: SupportResource = {
      ...existing,
      name: name || existing.name,
      category: category || existing.category,
      address: address || existing.address,
      phone: phone || existing.phone,
      hours: hours || existing.hours,
      free: free !== undefined ? !!free : existing.free,
      lat: lat !== undefined ? Number(lat) : existing.lat,
      lng: lng !== undefined ? Number(lng) : existing.lng,
      notes: notes !== undefined ? notes : existing.notes,
      tags: tags || existing.tags || [category]
    };

    await saveResourceToFirestore(updated);
    res.json({ success: true, resource: updated });
  } catch (err) {
    console.error("PUT /api/admin/resources/:id error:", err);
    res.status(500).json({ error: "Failed to update resource" });
  }
});

// 8. Delete Resource
app.delete("/api/admin/resources/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteResourceFromFirestore(id);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/resources/:id error:", err);
    res.status(500).json({ error: "Failed to delete resource" });
  }
});

// 9. Get Chats Inbox
app.get("/api/admin/chats", requireAdmin, async (req, res) => {
  try {
    const chatList = await getChatsFromFirestore();
    
    chatList.sort((a: any, b: any) => {
      if (a.needsHuman && !b.needsHuman) return -1;
      if (!a.needsHuman && b.needsHuman) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    res.json(chatList);
  } catch (err) {
    console.error("GET /api/admin/chats error:", err);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
});

// 10. Counselor Reply to Chat
app.post("/api/admin/chats/:sessionId/reply", requireAdmin, async (req, res) => {
  const { sessionId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Message text is required" });
  }

  try {
    const session = await getChatFromFirestore(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const adminMsgId = "cns_" + Math.random().toString(36).substr(2, 9);
    const adminMsg = {
      id: adminMsgId,
      role: "admin" as const,
      text,
      timestamp: new Date().toISOString()
    };

    session.messages = session.messages || [];
    session.messages.push(adminMsg);
    session.updatedAt = new Date().toISOString();
    session.needsHuman = true;

    await saveChatToFirestore(session);
    res.json({ success: true, chat: session, reply: adminMsg });
  } catch (err) {
    console.error("POST /api/admin/chats/:sessionId/reply error:", err);
    res.status(500).json({ error: "Failed to send counselor reply" });
  }
});

// 11. Update Admin Credentials (username / password)
app.post("/api/admin/credentials", requireAdmin, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  try {
    await saveAdminCredentialsToFirestore(username, password);
    res.json({ success: true, message: "Admin credentials updated in Firebase." });
  } catch (err) {
    console.error("POST /api/admin/credentials error:", err);
    res.status(500).json({ error: "Failed to update admin credentials" });
  }
});

// 12. Seed Default Resources manually if desired
app.post("/api/admin/seed", requireAdmin, async (req, res) => {
  try {
    await seedDefaultResourcesToFirestore();
    res.json({ success: true, message: "Default resources seeded to Firebase." });
  } catch (err) {
    console.error("POST /api/admin/seed error:", err);
    res.status(500).json({ error: "Failed to seed resources" });
  }
});

// ==========================================
// STATIC SERVING & VITE DEVELOPMENT SETUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Only start the server locally or in dev server; let Vercel import the app directly as a serverless function
if (!process.env.VERCEL) {
  startServer();
}

export default app;
