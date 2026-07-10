import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { SEEDED_RESOURCES, SupportResource } from "./src/data/resources";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");

app.use(express.json());

// Ensure Database File Exists & is Seeded
let dbCache: any = null;

function initializeDatabase() {
  const dir = path.dirname(DB_PATH);
  
  // Try to create the directory if it doesn't exist
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not create directory for database:", e);
  }

  let dbData: any = null;
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      dbData = JSON.parse(raw);
      if (!dbData.resources || !dbData.pendingSubmissions || !dbData.approvedHistory || !dbData.chats) {
        throw new Error("Invalid structure");
      }
    } catch (e) {
      console.log("Database file corrupted or outdated, re-initializing...");
    }
  }

  if (!dbData) {
    dbData = {
      resources: SEEDED_RESOURCES,
      pendingSubmissions: [],
      approvedHistory: [],
      chats: {}
    };
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not write initial database to disk (this is expected in serverless/read-only environments like Vercel).");
    }
  }

  dbCache = dbData;
}

initializeDatabase();

// Helper to Read/Write DB
function readDb() {
  if (dbCache) return dbCache;
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    dbCache = JSON.parse(raw);
    return dbCache;
  } catch (e) {
    dbCache = { resources: SEEDED_RESOURCES, pendingSubmissions: [], approvedHistory: [], chats: {} };
    return dbCache;
  }
}

function writeDb(data: any) {
  dbCache = data;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("Unable to write database to disk (expected in serverless/read-only environments):", e);
  }
}

// Credentials (Default fallbacks for easy evaluation)
const ADMIN_USER = process.env.ADMIN_USERNAME || "ADMINSAFEMAP";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "RADEN4EVER";
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

// 1. Get Approved Resources (Public)
app.get("/api/resources", (req, res) => {
  const db = readDb();
  res.json(db.resources);
});

// 2. Submit a New Resource Proposal (Public)
app.post("/api/resources", (req, res) => {
  const { name, category, address, phone, hours, free, lat, lng, notes } = req.body;
  
  if (!name || !category || !address || !phone || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const db = readDb();
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

  db.pendingSubmissions.push(newSubmission);
  writeDb(db);

  res.status(201).json({ success: true, submission: newSubmission });
});

// 3. Get or Create Chat Session
app.get("/api/chats/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const db = readDb();
  
  if (!db.chats[sessionId]) {
    db.chats[sessionId] = {
      sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      needsHuman: false,
      language: "id",
      messages: []
    };
    writeDb(db);
  }
  
  res.json(db.chats[sessionId]);
});

// 4. Request Human Hand-Off for Chat
app.post("/api/chats/:sessionId/human", (req, res) => {
  const { sessionId } = req.params;
  const db = readDb();
  
  if (db.chats[sessionId]) {
    db.chats[sessionId].needsHuman = true;
    db.chats[sessionId].updatedAt = new Date().toISOString();
    
    // Append a system notification message
    db.chats[sessionId].messages.push({
      id: "sys_" + Math.random().toString(36).substr(2, 9),
      role: "model",
      text: "SYSTEM_NOTIFICATION: Sesi Anda telah ditandai untuk moderator konselor manusia.",
      timestamp: new Date().toISOString()
    });

    writeDb(db);
    res.json({ success: true, chat: db.chats[sessionId] });
  } else {
    res.status(404).json({ error: "Session not found" });
  }
});

// 5. Post message to chat session (Runs server-side Gemini AI if not handled by human)
app.post("/api/chat", async (req, res) => {
  const { sessionId, message, language } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: "SessionId and message are required" });
  }

  const currentLang = language === "en" ? "en" : "id";
  const db = readDb();

  // Create session if not exists
  if (!db.chats[sessionId]) {
    db.chats[sessionId] = {
      sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      needsHuman: false,
      language: currentLang,
      messages: []
    };
  }

  const session = db.chats[sessionId];
  session.language = currentLang;

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

  // Save progress so far
  writeDb(db);

  // If session requires human counseling, AI will not respond unless forced, or we let AI keep responding until human speaks
  // The user requirement: "Until a moderator joins, SafePin keeps responding."
  // So we run Gemini to generate a response.
  
  // CRISIS DETECTION IN MESSAGE
  const lowercaseMsg = message.toLowerCase();
  const crisisKeywords = [
    "bunuh diri", "suicide", "akhiri hidup", "self harm", "menyakiti diri", "darurat", "bahaya", 
    "diperkosa", "raping", "pukulan", "disiksa", "dibunuh", "killing", "abuse", "danger", "die", "mati"
  ];
  const containsCrisis = crisisKeywords.some(kw => lowercaseMsg.includes(kw));

  let aiReply = "";
  let containsImmediateCrisis = containsCrisis;

  if (containsImmediateCrisis) {
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
    // Normal query, invoke Gemini AI server-side
    try {
      const client = getGeminiClient();
      
      // Structure dialogue history for context
      const chatHistory = session.messages
        .slice(-10) // Take last 10 messages for context
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
      // Fallback response if key is missing or quota exceeded
      if (currentLang === "id") {
        aiReply = "Halo, SafePin sedang mengalami gangguan koneksi. Jika situasi Anda membutuhkan perhatian mendesak, silakan gunakan tombol Kontak Darurat di bagian bawah layar untuk segera menghubungi pihak berwenang. Anda tidak sendiri.";
      } else {
        aiReply = "Hello, SafePin is currently experiencing connection delays. If your situation is urgent, please use the Emergency Hotlines button at the bottom of the screen to connect with professional help. You are not alone.";
      }
    }
  }

  // Append model message
  const aiMsgId = "msg_" + Math.random().toString(36).substr(2, 9);
  const aiMsg = {
    id: aiMsgId,
    role: "model" as const,
    text: aiReply,
    timestamp: new Date().toISOString()
  };
  session.messages.push(aiMsg);
  session.updatedAt = new Date().toISOString();

  writeDb(db);

  res.json({ success: true, chat: session, reply: aiMsg });
});

// ==========================================
// ADMIN API ENDPOINTS (PROTECTED)
// ==========================================

// 1. Moderator Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: "Username atau password salah!" });
  }
});

// 2. List Pending Proposals
app.get("/api/admin/pending", requireAdmin, (req, res) => {
  const db = readDb();
  res.json(db.pendingSubmissions);
});

// 3. Approve Proposal
app.post("/api/admin/approve/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  
  const index = db.pendingSubmissions.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Proposal not found" });
  }

  const approved = db.pendingSubmissions.splice(index, 1)[0];
  approved.approvedAt = new Date().toISOString();
  
  // Transition ID from pending to normal resource ID
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

  db.resources.push(finalResource);
  db.approvedHistory.push({
    originalProposal: approved,
    approvedAs: finalResource,
    timestamp: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true, resource: finalResource });
});

// 4. Reject Proposal
app.post("/api/admin/reject/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  
  const index = db.pendingSubmissions.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Proposal not found" });
  }

  db.pendingSubmissions.splice(index, 1);
  writeDb(db);
  res.json({ success: true });
});

// 5. Get Approved History Logs
app.get("/api/admin/approved-history", requireAdmin, (req, res) => {
  const db = readDb();
  res.json(db.approvedHistory);
});

// 6. Get Editable Database
app.get("/api/admin/resources", requireAdmin, (req, res) => {
  const db = readDb();
  res.json(db.resources);
});

// 7. Update Resource
app.put("/api/admin/resources/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, category, address, phone, hours, free, lat, lng, notes, tags } = req.body;

  const db = readDb();
  const index = db.resources.findIndex((r: any) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Resource not found" });
  }

  db.resources[index] = {
    ...db.resources[index],
    name: name || db.resources[index].name,
    category: category || db.resources[index].category,
    address: address || db.resources[index].address,
    phone: phone || db.resources[index].phone,
    hours: hours || db.resources[index].hours,
    free: free !== undefined ? !!free : db.resources[index].free,
    lat: lat !== undefined ? Number(lat) : db.resources[index].lat,
    lng: lng !== undefined ? Number(lng) : db.resources[index].lng,
    notes: notes !== undefined ? notes : db.resources[index].notes,
    tags: tags || db.resources[index].tags || [category]
  };

  writeDb(db);
  res.json({ success: true, resource: db.resources[index] });
});

// 8. Delete Resource
app.delete("/api/admin/resources/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  
  const index = db.resources.findIndex((r: any) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Resource not found" });
  }

  db.resources.splice(index, 1);
  writeDb(db);
  res.json({ success: true });
});

// 9. Get Chats Inbox
app.get("/api/admin/chats", requireAdmin, (req, res) => {
  const db = readDb();
  const chatList = Object.values(db.chats);
  
  // Sort: sessions that need human intervention first, then by recency
  chatList.sort((a: any, b: any) => {
    if (a.needsHuman && !b.needsHuman) return -1;
    if (!a.needsHuman && b.needsHuman) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  res.json(chatList);
});

// 10. Counselor Reply to Chat
app.post("/api/admin/chats/:sessionId/reply", requireAdmin, (req, res) => {
  const { sessionId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Message text is required" });
  }

  const db = readDb();
  if (!db.chats[sessionId]) {
    return res.status(404).json({ error: "Session not found" });
  }

  const session = db.chats[sessionId];
  
  // Append admin counselor message
  const adminMsgId = "cns_" + Math.random().toString(36).substr(2, 9);
  const adminMsg = {
    id: adminMsgId,
    role: "admin" as const, // counselor role
    text,
    timestamp: new Date().toISOString()
  };

  session.messages.push(adminMsg);
  session.updatedAt = new Date().toISOString();
  session.needsHuman = true; // Stay in counselor mode

  writeDb(db);
  res.json({ success: true, chat: session, reply: adminMsg });
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
