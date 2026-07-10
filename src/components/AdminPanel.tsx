import React, { useState, useEffect } from "react";
import { ID_STRINGS, EN_STRINGS } from "../data/locales";
import { SupportResource, ChatSession, ChatMessage } from "../types";
import { LogOut, Check, X, Edit2, Trash2, Save, MessageSquare, ShieldAlert, Database, History, RefreshCw } from "lucide-react";

interface AdminPanelProps {
  language: "id" | "en";
  onBackToApp: () => void;
}

export default function AdminPanel({ language, onBackToApp }: AdminPanelProps) {
  const strings = language === "en" ? EN_STRINGS : ID_STRINGS;
  const adminStrings = strings.admin;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Tabs: "pending" | "approved" | "database" | "chat"
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "database" | "chat">("pending");

  // Data States
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [approvedHistory, setApprovedHistory] = useState<any[]>([]);
  const [allResources, setAllResources] = useState<SupportResource[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  
  // Selection and Editing states
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [chatReplyText, setChatReplyText] = useState("");
  const [editingResource, setEditingResource] = useState<SupportResource | null>(null);
  const [dbSearch, setDbSearch] = useState("");

  const [loading, setLoading] = useState(false);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token);
        setIsLoggedIn(true);
        localStorage.setItem("safemap_admin_token", data.token);
      } else {
        setLoginError(data.error || "Login Gagal.");
      }
    } catch (err) {
      setLoginError("Koneksi gagal.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken("");
    localStorage.removeItem("safemap_admin_token");
    onBackToApp();
  };

  // Fetch pending submissions
  const fetchPending = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingSubmissions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch approved history logs
  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/approved-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApprovedHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch edit database resources
  const fetchResources = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/resources", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllResources(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all chat inbox threads
  const fetchChats = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChatSessions(data);
        
        // If a chat is currently viewed, update it
        if (selectedChat) {
          const updated = data.find((c: any) => c.sessionId === selectedChat.sessionId);
          if (updated) {
            setSelectedChat(updated);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk loader after successful login
  const loadAllData = () => {
    setLoading(true);
    Promise.all([fetchPending(), fetchHistory(), fetchResources(), fetchChats()]).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("safemap_admin_token");
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadAllData();
      
      // Auto-poll chats every 5 seconds to get real-time survivor replies!
      const interval = setInterval(() => {
        fetchChats();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, token]);

  // Action: Approve Resource Proposal
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/approve/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Reject Resource Proposal
  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reject/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Edit / Save Database Resource
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;

    try {
      const res = await fetch(`/api/admin/resources/${editingResource.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingResource),
      });

      if (res.ok) {
        setEditingResource(null);
        fetchResources();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Delete Support Resource
  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus layanan ini dari database publik?")) return;
    try {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchResources();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Counselor Reply to chat
  const handleSendChatReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !chatReplyText.trim()) return;

    try {
      const res = await fetch(`/api/admin/chats/${selectedChat.sessionId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: chatReplyText }),
      });

      if (res.ok) {
        setChatReplyText("");
        fetchChats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter resource list in database view
  const filteredResources = allResources.filter((r) =>
    r.name.toLowerCase().includes(dbSearch.toLowerCase()) ||
    r.address.toLowerCase().includes(dbSearch.toLowerCase()) ||
    r.category.toLowerCase().includes(dbSearch.toLowerCase())
  );

  // Login view
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#151E19] flex flex-col justify-between p-6 font-sans relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#7FA396]/10 rounded-full filter blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-6 max-w-md mx-auto w-full border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="font-display font-bold text-lg text-[#F0EEE8]">SafeMap Admin</span>
          </div>
          <button
            onClick={onBackToApp}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#202C26] text-[#B8C2BC] hover:text-[#F0EEE8] transition-all border border-white/5"
          >
            {strings.map.back}
          </button>
        </div>

        {/* Login Card */}
        <div className="flex-1 flex items-center justify-center max-w-md mx-auto w-full py-12">
          <form
            onSubmit={handleLogin}
            className="w-full glass-panel rounded-2xl p-6 space-y-5 border border-white/10"
          >
            <div className="text-center">
              <h2 className="text-xl font-display font-bold text-[#F0EEE8]">
                {adminStrings.loginTitle}
              </h2>
              <p className="text-xs text-[#8A9590] mt-1.5">
                Panel verifikasi usulan layanan & konseling obrolan manusia.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-[#E0703D]/10 border border-[#E0703D]/25 rounded-xl text-xs text-[#E0703D] text-center font-medium">
                ⚠️ {loginError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-2">
                  {adminStrings.username}
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1C2521] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8] transition-colors"
                  placeholder="admin"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-2">
                  {adminStrings.password}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1C2521] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#7FA396] hover:bg-[#9DBDB0] text-[#1B2620] font-bold rounded-xl text-xs transition-colors shadow-lg shadow-[#7FA396]/10 active:scale-95"
            >
              🔐 {adminStrings.loginButton}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-[#5C7A6E]">
          SafeMap Moderation Hub • Secured local session
        </div>
      </div>
    );
  }

  // Dashboard Main View
  return (
    <div className="min-h-screen bg-[#111815] text-[#F0EEE8] font-sans pb-12">
      
      {/* Top Banner Bar */}
      <header className="sticky top-0 bg-[#151E19]/90 backdrop-blur-md border-b border-white/5 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛠️</span>
          <div>
            <h1 className="text-base font-display font-bold tracking-tight">
              {adminStrings.title}
            </h1>
            <p className="text-[10px] text-[#7FA396] font-mono">
              ROLE: Jabodetabek Moderator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="p-2 rounded-lg bg-[#1B2620] hover:bg-[#202C26] text-[#B8C2BC] transition-all border border-white/5"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-red-950/20 text-[#E0703D] hover:bg-red-950/40 transition-colors border border-[#E0703D]/20 text-xs font-semibold flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{adminStrings.logoutButton}</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-6">
        
        {/* Navigation Tabs bar */}
        <div className="flex gap-2 p-1 bg-[#151E19] border border-white/5 rounded-xl overflow-x-auto mb-6 scrollbar-none">
          <button
            onClick={() => { setActiveTab("pending"); setSelectedChat(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "pending"
                ? "bg-[#7FA396] text-[#1B2620]"
                : "text-[#B8C2BC] hover:text-[#F0EEE8]"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{adminStrings.tabPending.replace("{count}", pendingSubmissions.length.toString())}</span>
          </button>

          <button
            onClick={() => { setActiveTab("approved"); setSelectedChat(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "approved"
                ? "bg-[#7FA396] text-[#1B2620]"
                : "text-[#B8C2BC] hover:text-[#F0EEE8]"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{adminStrings.tabApproved}</span>
          </button>

          <button
            onClick={() => { setActiveTab("database"); setSelectedChat(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "database"
                ? "bg-[#7FA396] text-[#1B2620]"
                : "text-[#B8C2BC] hover:text-[#F0EEE8]"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{adminStrings.tabDatabase}</span>
          </button>

          <button
            onClick={() => { setActiveTab("chat"); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "chat"
                ? "bg-[#7FA396] text-[#1B2620]"
                : "text-[#B8C2BC] hover:text-[#F0EEE8]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>
              {adminStrings.tabChat.replace(
                "{count}",
                chatSessions.filter((c) => c.needsHuman).length.toString()
              )}
            </span>
          </button>
        </div>

        {/* LOADING SHIMMER */}
        {loading && (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-[#7FA396] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* TAB 1: PENDING SUBMISSIONS QUEUE */}
        {!loading && activeTab === "pending" && (
          <div className="space-y-4">
            {pendingSubmissions.length === 0 ? (
              <div className="glass-panel rounded-xl py-12 px-6 text-center text-sm text-[#8A9590]">
                📋 {adminStrings.emptyPending}
              </div>
            ) : (
              pendingSubmissions.map((p) => (
                <div key={p.id} className="glass-panel rounded-xl p-5 border border-white/10 flex flex-col md:flex-row justify-between gap-5 text-left">
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#E0703D]/10 text-[#E0703D] text-[10px] font-bold font-mono uppercase tracking-wider">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-[#5C7A6E]">
                        Submitted: {new Date(p.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#F0EEE8]">{p.name}</h3>
                    <p className="text-xs text-[#B8C2BC] leading-relaxed"><strong className="text-[#7FA396]">Alamat:</strong> {p.address}</p>
                    <p className="text-xs text-[#B8C2BC]"><strong className="text-[#7FA396]">Telp:</strong> {p.phone}</p>
                    <p className="text-xs text-[#B8C2BC]"><strong className="text-[#7FA396]">Jam Kerja:</strong> {p.hours}</p>
                    <p className="text-xs text-[#B8C2BC]"><strong className="text-[#7FA396]">Biaya:</strong> {p.free ? "Gratis" : "Berbayar / Subsidi"}</p>
                    <p className="text-xs text-[#B8C2BC]"><strong className="text-[#7FA396]">Koordinat:</strong> Lat: {p.lat}, Lng: {p.lng}</p>
                    
                    {p.notes && (
                      <div className="p-3 bg-[#1B2620] rounded-lg border border-white/5 text-xs text-[#8A9590] leading-relaxed">
                        <strong>Catatan pengirim:</strong> "{p.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col items-stretch justify-center gap-2 md:w-32 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="flex-1 py-2.5 bg-[#7FA396] hover:bg-[#9DBDB0] text-[#1B2620] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{adminStrings.approve}</span>
                    </button>
                    <button
                      onClick={() => handleReject(p.id)}
                      className="flex-1 py-2.5 bg-red-950/20 hover:bg-red-950/40 text-[#E0703D] border border-[#E0703D]/20 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>{adminStrings.reject}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: APPROVED LIST LOGS */}
        {!loading && activeTab === "approved" && (
          <div className="space-y-4">
            {approvedHistory.length === 0 ? (
              <div className="glass-panel rounded-xl py-12 px-6 text-center text-sm text-[#8A9590]">
                📜 {adminStrings.emptyApproved}
              </div>
            ) : (
              approvedHistory.map((h, idx) => (
                <div key={idx} className="glass-panel rounded-xl p-4 border border-white/5 text-left flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#F0EEE8]">
                      {h.approvedAs.name}
                    </h3>
                    <p className="text-xs text-[#8A9590] mt-1">
                      Kategori: <span className="font-semibold text-[#7FA396] uppercase">{h.approvedAs.category}</span> • Disetujui: {new Date(h.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#5C7A6E] font-mono">
                    ID: {h.approvedAs.id}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: SEARCHABLE SERVICE DIRECTORY DATABASE CRUD */}
        {!loading && activeTab === "database" && (
          <div className="space-y-6">
            
            {/* Search and count */}
            <div className="flex gap-4">
              <input
                type="text"
                placeholder={adminStrings.searchResource}
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#151E19] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8] transition-colors"
              />
              <div className="px-4 py-3 bg-[#151E19] border border-white/5 rounded-xl text-xs font-mono flex items-center shrink-0">
                Total: {filteredResources.length}
              </div>
            </div>

            {/* RESOURCE EDITING MODAL-LIKE INLINE CONTAINER */}
            {editingResource && (
              <form
                onSubmit={handleSaveResource}
                className="glass-panel-elevated rounded-2xl p-6 space-y-4 border border-[#7FA396]/20 text-left"
              >
                <h3 className="font-bold font-display text-sm text-[#7FA396] flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4" />
                  <span>Ubah Detail Layanan</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      Nama Layanan
                    </label>
                    <input
                      type="text"
                      required
                      value={editingResource.name}
                      onChange={(e) => setEditingResource({ ...editingResource, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 text-xs text-[#F0EEE8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      Kategori
                    </label>
                    <select
                      value={editingResource.category}
                      onChange={(e: any) => setEditingResource({ ...editingResource, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 text-xs text-[#F0EEE8]"
                    >
                      <option value="shelter">shelter</option>
                      <option value="legal">legal</option>
                      <option value="clinic">clinic</option>
                      <option value="community">community</option>
                      <option value="job">job</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      Alamat Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={editingResource.address}
                      onChange={(e) => setEditingResource({ ...editingResource, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 text-xs text-[#F0EEE8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      Nomor Telepon
                    </label>
                    <input
                      type="text"
                      required
                      value={editingResource.phone}
                      onChange={(e) => setEditingResource({ ...editingResource, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 text-xs text-[#F0EEE8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      Jam Kerja
                    </label>
                    <input
                      type="text"
                      required
                      value={editingResource.hours}
                      onChange={(e) => setEditingResource({ ...editingResource, hours: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 text-xs text-[#F0EEE8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editingResource.lat}
                      onChange={(e) => setEditingResource({ ...editingResource, lat: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 text-xs text-[#F0EEE8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editingResource.lng}
                      onChange={(e) => setEditingResource({ ...editingResource, lng: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 text-xs text-[#F0EEE8]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      Catatan / Deskripsi Penanganan
                    </label>
                    <textarea
                      rows={3}
                      value={editingResource.notes}
                      onChange={(e) => setEditingResource({ ...editingResource, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 text-xs text-[#F0EEE8] focus:outline-none focus:border-[#7FA396]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-free"
                      checked={editingResource.free}
                      onChange={(e) => setEditingResource({ ...editingResource, free: e.target.checked })}
                      className="w-4 h-4 text-[#7FA396] bg-[#111815] border-white/10 rounded"
                    />
                    <label htmlFor="edit-free" className="text-xs text-[#B8C2BC]">
                      Layanan 100% Gratis / Pro-Bono
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingResource(null)}
                    className="px-4 py-2 rounded-lg border border-white/5 hover:bg-white/5 text-xs font-semibold text-[#B8C2BC] transition-colors"
                  >
                    {adminStrings.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#7FA396] hover:bg-[#9DBDB0] text-[#1B2620] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{adminStrings.save}</span>
                  </button>
                </div>
              </form>
            )}

            {/* List and CRUD Table */}
            <div className="space-y-3">
              {filteredResources.map((res) => (
                <div key={res.id} className="glass-panel rounded-xl p-4 border border-white/5 flex items-center justify-between gap-4 text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] uppercase font-bold tracking-wider font-mono text-[#7FA396]">
                        {res.category}
                      </span>
                      <span className="text-[9px] text-[#5C7A6E] font-mono">ID: {res.id}</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#F0EEE8] truncate">{res.name}</h4>
                    <p className="text-xs text-[#8A9590] truncate">{res.address}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditingResource(res)}
                      className="p-2 rounded-lg bg-[#202C26] hover:bg-[#2C3D34] text-[#7FA396] border border-white/5 transition-all active:scale-95"
                      title="Ubah"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteResource(res.id)}
                      className="p-2 rounded-lg bg-red-950/10 hover:bg-red-950/30 text-[#E0703D] border border-[#E0703D]/10 transition-all active:scale-95"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COUNSELOR CHAT INBOX (HUMAN CO-RESPONSIBILITY) */}
        {!loading && activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* List of active sessions (Left Panel) */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="font-display font-bold text-sm text-left text-[#B8C2BC]">
                {adminStrings.chatsTitle}
              </h3>

              {chatSessions.length === 0 ? (
                <div className="glass-panel rounded-xl py-12 px-6 text-center text-sm text-[#8A9590]">
                  📭 {adminStrings.noChats}
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {chatSessions.map((c) => {
                    const lastMsg = c.messages[c.messages.length - 1];
                    const unreadCount = c.needsHuman ? "🚨" : "";

                    return (
                      <button
                        key={c.sessionId}
                        onClick={() => setSelectedChat(c)}
                        className={`w-full p-4 rounded-xl text-left border transition-all flex items-start gap-3 ${
                          selectedChat?.sessionId === c.sessionId
                            ? "bg-[#2C3D34]/70 border-[#7FA396]/45"
                            : "bg-[#151E19]/60 hover:bg-[#1B2620]/60 border-white/5"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#111815] border border-white/10 flex items-center justify-center text-sm shrink-0">
                          👤
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[10px] font-mono text-[#8A9590] truncate max-w-[120px]">
                              ID: {c.sessionId}
                            </span>
                            {c.needsHuman && (
                              <span className="px-1.5 py-0.5 rounded bg-[#C9A66B]/15 text-[#C9A66B] text-[8px] font-bold uppercase tracking-wider font-mono">
                                {adminStrings.humanRequired}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#B8C2BC] truncate mt-1">
                            {lastMsg ? lastMsg.text : "Belum ada pesan."}
                          </p>
                          <span className="block text-[8.5px] text-[#5C7A6E] text-right mt-1.5">
                            Updated: {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Dialogue Thread (Right Panel) */}
            <div className="lg:col-span-7">
              {selectedChat ? (
                <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col h-[65vh]">
                  
                  {/* Active thread header */}
                  <div className="px-5 py-4 bg-[#1B2620] border-b border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-xs text-[#F0EEE8]">
                        Sesi Chat: {selectedChat.sessionId}
                      </h4>
                      <p className="text-[9px] text-[#7FA396] mt-0.5">
                        Language preference: {selectedChat.language.toUpperCase()}
                      </p>
                    </div>
                    
                    <span className="text-[10px] px-2.5 py-1 rounded bg-[#111815] text-[#C9A66B] font-semibold border border-[#C9A66B]/25">
                      {selectedChat.needsHuman ? "🔴 Live Counselor" : "🤖 AI Assist"}
                    </span>
                  </div>

                  {/* Thread messages thread */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#0F1512]/60">
                    {selectedChat.messages.map((m) => {
                      const isUser = m.role === "user";
                      const isSystem = m.text.startsWith("SYSTEM_NOTIFICATION:");
                      const isCounselor = m.role === "admin";

                      if (isSystem) {
                        return (
                          <div key={m.id} className="text-center py-1">
                            <span className="inline-block px-2.5 py-0.5 bg-[#1C2521] text-[#7FA396] text-[9px] font-mono rounded-full border border-[#7FA396]/15">
                              {m.text.replace("SYSTEM_NOTIFICATION: ", "")}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={m.id}
                          className={`flex gap-2 max-w-[85%] ${
                            isUser ? "mr-auto" : "ml-auto flex-row-reverse"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border text-[10px] ${
                            isUser
                              ? "bg-[#1C2521] border-[#7FA396]/20 text-[#7FA396]"
                              : isCounselor
                              ? "bg-[#C9A66B]/15 border-[#C9A66B]/30 text-[#C9A66B]"
                              : "bg-[#111815] border-white/5 text-[#8A9590]"
                          }`}>
                            {isUser ? "👤" : isCounselor ? "👨‍💼" : "🤖"}
                          </div>

                          <div className={`rounded-xl p-3 text-xs leading-relaxed text-left ${
                            isUser
                              ? "bg-[#202C26] border border-[#7FA396]/15 text-[#F0EEE8]"
                              : isCounselor
                              ? "bg-[#C9A66B]/20 text-[#F0EEE8] font-medium"
                              : "bg-[#151E19] border border-white/5 text-[#B8C2BC]"
                          }`}>
                            {isCounselor && (
                              <div className="text-[8px] font-bold text-[#C9A66B] mb-0.5">TANGGAPAN ANDA</div>
                            )}
                            <p>{m.text}</p>
                            <span className="block text-[8px] text-right mt-1 text-[#8A9590]">
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Counselor Reply Input Area */}
                  <form
                    onSubmit={handleSendChatReply}
                    className="p-4 bg-[#151E19] border-t border-white/5 flex gap-2.5"
                  >
                    <input
                      type="text"
                      value={chatReplyText}
                      onChange={(e) => setChatReplyText(e.target.value)}
                      placeholder={adminStrings.replyPlaceholder}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#111815] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#C9A66B] hover:bg-[#DBC193] text-[#1B2620] font-bold rounded-xl text-xs transition-colors shadow-lg active:scale-95 shrink-0"
                    >
                      {adminStrings.send}
                    </button>
                  </form>

                </div>
              ) : (
                <div className="glass-panel rounded-2xl border border-white/5 h-[65vh] flex flex-col items-center justify-center p-6 text-center text-sm text-[#8A9590]">
                  💬 Pilih salah satu sesi obrolan di sebelah kiri untuk berdiskusi dengan penyintas secara real-time.
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
