import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, HelpCircle, AlertTriangle, ArrowUpRight } from "lucide-react";
import { ID_STRINGS, EN_STRINGS } from "../data/locales";
import { ChatMessage, ChatSession } from "../types";

interface SafePinChatProps {
  isOpen: boolean;
  onClose: () => void;
  language: "id" | "en";
  sessionId: string;
  onTriggerEmergency: () => void;
}

export default function SafePinChat({
  isOpen,
  onClose,
  language,
  sessionId,
  onTriggerEmergency,
}: SafePinChatProps) {
  const strings = language === "en" ? EN_STRINGS : ID_STRINGS;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHumanRequested, setIsHumanRequested] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch or create chat session
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/chats/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
        setMessages(data.messages);
        // Sync if human mode was already activated previously in session
        if (data.needsHuman) {
          setIsHumanRequested(true);
        }
      })
      .catch((err) => console.error("Error loading chat session:", err));
  }, [sessionId, isOpen]);

  // Periodic polling for new messages when in "needsHuman" mode, so admin replies stream in!
  useEffect(() => {
    if (!isOpen || !sessionId) return;

    const interval = setInterval(() => {
      fetch(`/api/chats/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages.length !== messages.length) {
            setMessages(data.messages);
            setSession(data);
          }
          if (data.needsHuman) {
            setIsHumanRequested(true);
          }
        })
        .catch((err) => console.error("Error polling chat:", err));
    }, 4000); // Poll every 4 seconds

    return () => clearInterval(interval);
  }, [isOpen, sessionId, messages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Append user message locally first for responsive UI
    const localUserMsg: ChatMessage = {
      id: "local_" + Math.random().toString(36).substr(2, 9),
      role: "user",
      text: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localUserMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          language,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.chat.messages);
        setSession(data.chat);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const requestHumanHandover = async () => {
    try {
      const response = await fetch(`/api/chats/${sessionId}/human`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.chat.messages);
        setSession(data.chat);
        setIsHumanRequested(true);
      }
    } catch (err) {
      console.error("Error handover:", err);
    }
  };

  const handleQuickReply = (key: keyof typeof strings.chat.quickReplies) => {
    if (key === "danger") {
      onClose();
      onTriggerEmergency();
    } else {
      handleSendMessage(strings.chat.quickReplies[key]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-30 flex items-end justify-center font-sans animate-fade-in">
      <div className="w-full max-w-[480px] h-[85vh] rounded-t-3xl glass-panel-elevated flex flex-col overflow-hidden relative shadow-2xl">
        
        {/* Top Drag Handle */}
        <div className="w-12 h-1 bg-[#2C3D34] rounded-full mx-auto mt-3 mb-2 shrink-0"></div>

        {/* Chat Sheet Header */}
        <div className="px-5 pb-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1B2620] border border-[#7FA396]/30 flex items-center justify-center text-lg shadow-inner">
              🦉
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#F0EEE8] tracking-tight">
                {strings.chat.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#7FA396] animate-pulse"></span>
                <span className="text-[10px] text-[#B8C2BC]">
                  {isHumanRequested ? strings.chat.statusHuman : strings.chat.statusActive}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#202C26] text-[#B8C2BC] hover:text-[#F0EEE8] transition-all border border-white/5 active:scale-95"
          >
            {strings.map.back}
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Always Visible Disclaimer Banner */}
          <div className="bg-[#E0703D]/10 rounded-xl p-3 border border-[#E0703D]/25 flex gap-2.5 text-left mb-2">
            <HelpCircle className="w-5 h-5 text-[#E0703D] shrink-0 mt-0.5" />
            <p className="text-[10.5px] text-[#F0EEE8] leading-relaxed">
              {strings.chat.disclaimer}
            </p>
          </div>

          {messages.length === 0 && (
            <div className="text-center py-12 px-6 flex flex-col items-center">
              <span className="text-3xl animate-bounce">👋</span>
              <p className="text-xs text-[#B8C2BC] mt-3 leading-relaxed max-w-[280px]">
                {language === "en" 
                  ? "Hello! I am SafePin, your secure AI companion. Select a helper topic below or type anything to start talking."
                  : "Halo! Saya SafePin, pendamping AI Anda. Pilih topik di bawah atau ketik langsung untuk mengobrol."}
              </p>
            </div>
          )}

          {messages.map((msg) => {
            // Check if system notification message
            const isSystem = msg.text.startsWith("SYSTEM_NOTIFICATION:");
            const displayText = isSystem ? msg.text.replace("SYSTEM_NOTIFICATION: ", "") : msg.text;

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="inline-block px-3 py-1 bg-[#1C2521] text-[#7FA396] text-[10px] font-mono rounded-full border border-[#7FA396]/15">
                    ℹ️ {displayText}
                  </span>
                </div>
              );
            }

            const isUser = msg.role === "user";
            const isAdmin = msg.role === "admin"; // Human counselor

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-xs ${
                    isUser
                      ? "bg-[#202C26] border-[#7FA396]/20 text-[#7FA396]"
                      : isAdmin
                      ? "bg-[#C9A66B]/15 border-[#C9A66B]/30 text-[#C9A66B]"
                      : "bg-[#1C2521] border-white/5 text-[#B8C2BC]"
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : isAdmin ? "👨‍💼" : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-3.5 text-xs leading-relaxed text-left shadow-md ${
                    isUser
                      ? "bg-[#7FA396] text-[#1B2620] font-medium rounded-tr-none"
                      : isAdmin
                      ? "bg-[#C9A66B]/15 border border-[#C9A66B]/30 text-[#F0EEE8] rounded-tl-none"
                      : "bg-[#24332B] border border-white/5 text-[#F0EEE8] rounded-tl-none"
                  }`}
                >
                  {isAdmin && (
                    <div className="text-[9px] font-bold text-[#C9A66B] mb-1 font-mono tracking-wider">
                      COUNCILOR MODERATOR
                    </div>
                  )}
                  <p className="whitespace-pre-line">{displayText}</p>
                  
                  <span
                    className={`block text-[9px] text-right mt-1.5 ${
                      isUser ? "text-[#1B2620]/60" : "text-[#8A9590]"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5 max-w-[80%] mr-auto items-center">
              <div className="w-7 h-7 rounded-full bg-[#1C2521] border border-white/5 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-[#B8C2BC]" />
              </div>
              <div className="bg-[#24332B] border border-white/5 rounded-2xl p-3 flex gap-1 z-10">
                <span className="w-2 h-2 rounded-full bg-[#7FA396] animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-[#7FA396] animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-[#7FA396] animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Handover & Quick Reply Tray */}
        <div className="px-5 pt-3 border-t border-white/5 bg-[#17211C]/60 shrink-0">
          
          {/* Handover to Human Button */}
          {!isHumanRequested && (
            <button
              onClick={requestHumanHandover}
              className="w-full py-2 bg-[#C9A66B]/10 hover:bg-[#C9A66B]/20 text-[#C9A66B] border border-[#C9A66B]/20 rounded-xl text-[10px] font-bold tracking-wider uppercase mb-3 flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              <span>{strings.chat.handoverButton}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

          {isHumanRequested && (
            <div className="text-center text-[10px] text-[#C9A66B] font-semibold bg-[#C9A66B]/5 border border-[#C9A66B]/10 rounded-xl py-2 mb-3">
              ✨ {strings.chat.handoverSuccess}
            </div>
          )}

          {/* Quick-Reply Chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
            <button
              onClick={() => handleQuickReply("kdrt")}
              className="px-3 py-1.5 rounded-full bg-[#202C26] hover:bg-[#2C3D34] text-[10.5px] text-[#B8C2BC] whitespace-nowrap transition-colors active:scale-95 border border-white/5 shrink-0"
            >
              🏠 KDRT
            </button>
            <button
              onClick={() => handleQuickReply("shelter")}
              className="px-3 py-1.5 rounded-full bg-[#202C26] hover:bg-[#2C3D34] text-[10.5px] text-[#B8C2BC] whitespace-nowrap transition-colors active:scale-95 border border-white/5 shrink-0"
            >
              🛡️ Shelter
            </button>
            <button
              onClick={() => handleQuickReply("report")}
              className="px-3 py-1.5 rounded-full bg-[#202C26] hover:bg-[#2C3D34] text-[10.5px] text-[#B8C2BC] whitespace-nowrap transition-colors active:scale-95 border border-white/5 shrink-0"
            >
              📢 {language === "en" ? "Report" : "Lapor"}
            </button>
            <button
              onClick={() => handleQuickReply("danger")}
              className="px-3 py-1.5 rounded-full bg-[#E0703D]/10 hover:bg-[#E0703D]/20 text-[10.5px] text-[#E0703D] font-bold whitespace-nowrap transition-colors active:scale-95 border border-[#E0703D]/20 shrink-0"
            >
              🚨 {language === "en" ? "DANGER" : "BAHAYA"}
            </button>
          </div>
        </div>

        {/* TextInput Box */}
        <div className="p-4 bg-[#141E19] shrink-0 border-t border-white/5">
          <div className="flex gap-2.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
              placeholder={strings.chat.placeholder}
              className="flex-1 px-4 py-3 rounded-xl bg-[#1C2521] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8] transition-colors"
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              className="w-10 h-10 rounded-xl bg-[#7FA396] hover:bg-[#9DBDB0] text-[#1B2620] flex items-center justify-center transition-all active:scale-95 shadow-md shadow-[#7FA396]/10 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
