import React, { useState, useEffect } from "react";
import { ID_STRINGS, EN_STRINGS } from "./data/locales";
import { QUIZ_DATA, calculateQuizResult, QuizResult } from "./data/quizData";
import { SupportResource, ScreenType } from "./types";

// Component imports
import LeafletMap from "./components/LeafletMap";
import Calculator from "./components/Calculator";
import Onboarding from "./components/Onboarding";
import SafePinChat from "./components/SafePinChat";
import AdminPanel from "./components/AdminPanel";
import SavePinLogo from "./components/SavePinLogo";

// Lucide icons
import {
  Shield,
  MapPin,
  HelpCircle,
  FileText,
  Phone,
  MessageSquare,
  Plus,
  Search,
  Globe,
  ArrowLeft,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  CheckCircle,
  TrendingUp,
  X,
  Compass
} from "lucide-react";

export default function App() {
  // Locale state
  const [language, setLanguage] = useState<"id" | "en">("id");
  const strings = language === "en" ? EN_STRINGS : ID_STRINGS;

  // Onboarding & Router States
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [onboardingSlide, setOnboardingSlide] = useState<number>(0);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("home");

  // Disguise & Chats States
  const [disguiseActive, setDisguiseActive] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");

  // DB resources state
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<SupportResource | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Proposal modal state
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState<boolean>(false);

  // Proposal Form State
  const [propName, setPropName] = useState("");
  const [propCategory, setPropCategory] = useState("shelter");
  const [propAddress, setPropAddress] = useState("");
  const [propPhone, setPropPhone] = useState("");
  const [propHours, setPropHours] = useState("");
  const [propFree, setPropFree] = useState(true);
  const [propInputType, setPropInputType] = useState<"gmaps" | "manual">("gmaps");
  const [propGmapsLink, setPropGmapsLink] = useState("");
  const [propManualCoords, setPropManualCoords] = useState("");
  const [propNotes, setPropNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // User Coords state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [coordsStatus, setCoordsStatus] = useState<string>("");

  // Quiz States
  const [activeQuizType, setActiveQuizType] = useState<"physical" | "verbal" | "kdrt" | "cyber" | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: number }>({});
  const [quizCurrentIndex, setQuizCurrentIndex] = useState<number>(0);
  const [quizCriticalCount, setQuizCriticalCount] = useState<number>(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Emergency confirm states
  const [emergencyTarget, setEmergencyTarget] = useState<{ name: string; number: string; desc: string } | null>(null);

  // Load Seeded Session & Location on Boot
  useEffect(() => {
    // Session ID generation
    let savedSession = localStorage.getItem("safemap_session_id");
    if (!savedSession) {
      savedSession = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("safemap_session_id", savedSession);
    }
    setSessionId(savedSession);

    // Load active directory resources
    fetchResources();

    // Initial detection on boot
    requestGPSLocation();
  }, []);

  const requestGPSLocation = () => {
    if (navigator.geolocation) {
      setCoordsStatus(language === "en" ? "Requesting GPS access..." : "Meminta akses GPS...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setCoordsStatus(strings.map.gpsSuccess);
        },
        (error) => {
          console.warn("GPS access denied or timed out.", error);
          setCoordsStatus(strings.map.gpsError);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setCoordsStatus(language === "en" ? "GPS not supported" : "GPS tidak didukung");
    }
  };

  // Trigger browser notification for GPS access when entering the map feature
  useEffect(() => {
    if (currentScreen === "map") {
      requestGPSLocation();
    }
  }, [currentScreen]);

  const fetchResources = () => {
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        setResources(data);
      })
      .catch((err) => console.error("Error loading resources directory:", err));
  };

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
    localStorage.setItem("safemap_onboarded", "true");
    setCurrentScreen("home");
  };

  // Submit Proposal Suggestion handler
  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(false);

    if (!propName || !propAddress || !propPhone) {
      setFormError(strings.addResource.validationError);
      return;
    }

    // Coordinates extraction
    let lat = -6.2088; // Central Jakarta fallback
    let lng = 106.8456;

    if (propInputType === "gmaps" && propGmapsLink) {
      // Regex search coordinate signatures
      const regexCoords = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const match = propGmapsLink.match(regexCoords);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      } else {
        // Try to parse simply query coordinates like ll=...
        const regexLL = /ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const matchLL = propGmapsLink.match(regexLL);
        if (matchLL) {
          lat = parseFloat(matchLL[1]);
          lng = parseFloat(matchLL[2]);
        }
      }
    } else if (propInputType === "manual" && propManualCoords) {
      const parts = propManualCoords.split(",");
      if (parts.length === 2) {
        const parsedLat = parseFloat(parts[0].trim());
        const parsedLng = parseFloat(parts[1].trim());
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          lat = parsedLat;
          lng = parsedLng;
        } else {
          setFormError(strings.addResource.validationError);
          return;
        }
      } else {
        setFormError(strings.addResource.validationError);
        return;
      }
    }

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: propName,
          category: propCategory,
          address: propAddress,
          phone: propPhone,
          hours: propHours,
          free: propFree,
          lat,
          lng,
          notes: propNotes,
        }),
      });

      if (res.ok) {
        setFormSuccess(true);
        // Reset form
        setPropName("");
        setPropAddress("");
        setPropPhone("");
        setPropHours("");
        setPropGmapsLink("");
        setPropManualCoords("");
        setPropNotes("");
        // Close modal after 2.5s
        setTimeout(() => {
          setIsSuggestModalOpen(false);
          setFormSuccess(false);
        }, 2500);
      } else {
        setFormError(strings.addResource.errorToast);
      }
    } catch (err) {
      setFormError(strings.addResource.errorToast);
    }
  };

  // Quiz Wizard Navigation
  const startQuiz = (type: "physical" | "verbal" | "kdrt" | "cyber") => {
    setActiveQuizType(type);
    setQuizAnswers({});
    setQuizCurrentIndex(0);
    setQuizCriticalCount(0);
    setQuizResult(null);
    setCurrentScreen("quiz-question");
  };

  const handleSelectAnswer = (pts: number, isCritical?: boolean) => {
    const questions = QUIZ_DATA.find((c) => c.type === activeQuizType)?.questions || [];
    const currentQ = questions[quizCurrentIndex];
    
    // Store answer
    setQuizAnswers((prev) => ({ ...prev, [currentQ.id]: pts }));
    
    if (isCritical) {
      setQuizCriticalCount((prev) => prev + 1);
    }

    // Go next or submit
    if (quizCurrentIndex < questions.length - 1) {
      setQuizCurrentIndex(quizCurrentIndex + 1);
    } else {
      // Calculate final output
      const resultObj = calculateQuizResult(
        activeQuizType || "physical",
        { ...quizAnswers, [currentQ.id]: pts },
        quizCriticalCount + (isCritical ? 1 : 0)
      );
      setQuizResult(resultObj);
      setCurrentScreen("quiz-result");
    }
  };

  const handlePrevQuizQuestion = () => {
    if (quizCurrentIndex > 0) {
      setQuizCurrentIndex(quizCurrentIndex - 1);
    }
  };

  // Distance calculator helper
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(1);
  };

  // Filter Directory Resources
  const filteredMapResources = resources.filter((res) => {
    const matchesCategory = selectedCategory === "all" || res.category === selectedCategory;
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Hotlines dictionary for Emergency screen
  const hotlinesList = [
    {
      id: "sapa",
      name: strings.emergency.hotlines.sapa.name,
      number: "129",
      desc: strings.emergency.hotlines.sapa.desc,
      icon: "🛡️",
    },
    {
      id: "police",
      name: strings.emergency.hotlines.police.name,
      number: "110",
      desc: strings.emergency.hotlines.police.desc,
      icon: "🚔",
    },
    {
      id: "health",
      name: strings.emergency.hotlines.health.name,
      number: "119",
      desc: strings.emergency.hotlines.health.desc,
      icon: "🚑",
    },
    {
      id: "komnas",
      name: strings.emergency.hotlines.komnas.name,
      number: "021-3903963",
      desc: strings.emergency.hotlines.komnas.desc,
      icon: "⚖️",
    }
  ];

  // If disguise is active, render calculator immediately
  if (disguiseActive) {
    return <Calculator onExit={() => setDisguiseActive(false)} language={language} />;
  }

  // If visitor is not onboarded, show onboarding slides
  if (!isOnboarded) {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        onSelectCategory={(category) => {
          setIsOnboarded(true);
          localStorage.setItem("safemap_onboarded", "true");
          startQuiz(category);
        }}
        language={language}
        setLanguage={setLanguage}
        slideIndex={onboardingSlide}
        setSlideIndex={setOnboardingSlide}
      />
    );
  }

  // Admin routing panel view
  if (currentScreen === "admin") {
    return <AdminPanel language={language} onBackToApp={() => setCurrentScreen("about")} />;
  }

  return (
    <div className="min-h-screen bg-[#1B2620] text-[#F0EEE8] font-sans relative flex flex-col justify-between overflow-x-hidden">
      
      {/* Background Ambience Soft Blurs */}
      <div className="blob blob-1 animate-glow-slow"></div>
      <div className="blob blob-2 animate-glow-slower"></div>

      {/* FULL-WIDTH RESPONSIVE CONTAINER */}
      <div className="w-full flex-1 flex flex-col justify-between relative pb-28">
        
        {/* Soft background blurs inside the container */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#7FA396]/5 rounded-full filter blur-[90px] pointer-events-none"></div>
        <div className="absolute bottom-24 right-1/4 w-64 h-64 bg-[#C9A66B]/5 rounded-full filter blur-[100px] pointer-events-none"></div>

        {/* UPPER HEADER BAR */}
        <header className="glass-navbar sticky top-0 z-20 w-full shrink-0">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SavePinLogo size="sm" />
              <span className="font-display font-extrabold text-lg tracking-tight text-[#F0EEE8]">
                SafeMap
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Back Button */}
              {currentScreen !== "home" && (
                <button
                  onClick={() => {
                    if (currentScreen === "quiz-question" || currentScreen === "quiz-result") {
                      setCurrentScreen("quiz-select");
                    } else {
                      setCurrentScreen("home");
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#202C26] hover:bg-[#2C3D34] text-xs font-semibold text-[#F0EEE8] border border-white/5 active:scale-95 transition-all flex items-center gap-1"
                >
                  <span>←</span>
                  <span className="hidden sm:inline">{language === "en" ? "Back" : "Kembali"}</span>
                </button>
              )}

              {/* Language switch */}
              <button
                onClick={() => setLanguage(language === "id" ? "en" : "id")}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold glass-panel text-[#F0EEE8] border border-white/5 hover:text-[#7FA396] transition-all flex items-center gap-1 active:scale-95"
              >
                <span>🌐</span>
                <span>{language === "id" ? "ID" : "EN"}</span>
              </button>

              {/* Kalkulator Disguise Toggle Pill exactly matching the photo */}
              <button
                onClick={() => setDisguiseActive(true)}
                className="px-4 py-1.5 rounded-full bg-[#1A2621] hover:bg-[#24362E] text-[#7FA396] border border-[#7FA396]/20 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
              >
                <span className="w-2 h-2 rounded-full bg-[#7FA396] animate-pulse"></span>
                <span>{language === "en" ? "calculator" : "Kalkulator"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* SCREEN ROUTER */}
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col relative z-10">
          
          {/* SCREEN 1: HOME (Beranda) */}
          {currentScreen === "home" && (
            <div className="space-y-6 text-left animate-fade-in">
              
              {/* Warm Supportive Greeting Card */}
              <div className="glass-panel-elevated rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#7FA396]/10 rounded-full filter blur-xl pointer-events-none"></div>
                <h2 className="text-xl font-display font-extrabold text-[#F0EEE8] tracking-tight mb-2">
                  {strings.home.greetingTitle}
                </h2>
                <p className="text-xs text-[#B8C2BC] leading-relaxed">
                  {strings.home.greetingDesc}
                </p>

                {/* Sub-Access Actions inside banner */}
                <div className="mt-5 flex gap-2.5">
                  <button
                    onClick={() => setCurrentScreen("quiz-select")}
                    className="flex-1 py-3 bg-[#7FA396] hover:bg-[#9DBDB0] text-[#1B2620] rounded-xl text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 shadow-md shadow-[#7FA396]/10 active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{strings.quiz.title}</span>
                  </button>

                  <button
                    onClick={() => setChatOpen(true)}
                    className="flex-1 py-3 bg-[#1C2521] hover:bg-[#232F2A] text-[#F0EEE8] border border-white/5 rounded-xl text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#7FA396]" />
                    <span>SafePin Chat</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="space-y-3">
                <h3 className="font-display font-bold text-xs text-[#8A9590] uppercase tracking-wider">
                  {strings.home.quickAccessTitle}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setCurrentScreen("map")}
                    className="glass-panel hover:bg-white/5 rounded-xl p-4 flex items-center justify-between transition-all group border border-white/5 text-left active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#7FA396]/10 flex items-center justify-center text-[#7FA396]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F0EEE8]">
                          {strings.home.mapButton}
                        </h4>
                        <p className="text-[10px] text-[#8A9590] mt-0.5">
                          {language === "en" ? "Interactive directory maps" : "Peta interaktif rumah aman & bantuan hukum"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#5C7A6E] group-hover:text-[#F0EEE8] transition-colors" />
                  </button>
                </div>
              </div>

              {/* Category Grid Slider */}
              <div className="space-y-3">
                <h3 className="font-display font-bold text-xs text-[#8A9590] uppercase tracking-wider">
                  {strings.home.categoriesTitle}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(strings.home.categories).map(([key, value]) => {
                    let catEmoji = "🛡️";
                    if (key === "shelter") catEmoji = "🏠";
                    if (key === "legal") catEmoji = "⚖️";
                    if (key === "clinic") catEmoji = "🏥";
                    if (key === "community") catEmoji = "👥";
                    if (key === "job") catEmoji = "💼";

                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedCategory(key);
                          setCurrentScreen("map");
                        }}
                        className="glass-panel hover:bg-white/5 rounded-xl p-4 transition-all border border-white/5 text-left flex flex-col justify-between h-28 active:scale-[0.97]"
                      >
                        <span className="text-2xl">{catEmoji}</span>
                        <div>
                          <h4 className="text-xs font-bold text-[#F0EEE8] line-clamp-1">{value.name}</h4>
                          <p className="text-[9.5px] text-[#8A9590] leading-snug mt-1 line-clamp-2">{value.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Suggest Support Proposal Card */}
              <div className="glass-panel hover:border-white/15 rounded-2xl p-5 border border-white/5 text-left transition-all active:scale-[0.99] relative">
                <h4 className="font-display font-bold text-sm text-[#F0EEE8] flex items-center gap-1.5">
                  <span>ℹ️</span>
                  <span>{strings.home.addResourceCardTitle}</span>
                </h4>
                <p className="text-xs text-[#B8C2BC] leading-relaxed mt-2">
                  {strings.home.addResourceCardDesc}
                </p>
                <button
                  onClick={() => setIsSuggestModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#2C3D34] hover:bg-[#3D5247] border border-white/5 text-[11px] font-bold text-[#F0EEE8] transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === "en" ? "Suggest New Resource" : "Kirim Usulan Baru"}</span>
                </button>
              </div>

            </div>
          )}

          {/* SCREEN 2: INTERACTIVE DIRECTORY MAP & DIRECTORY (Peta & List) */}
          {currentScreen === "map" && (
            <div className="space-y-4 text-left animate-fade-in flex flex-col">
              
              <div className="flex items-center justify-between mb-1 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentScreen("home")}
                    className="p-1.5 rounded-lg bg-[#202C26] hover:bg-[#2C3D34] text-[#B8C2BC] border border-white/5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-base font-display font-extrabold text-[#F0EEE8]">
                    {strings.map.title}
                  </h2>
                </div>

                <button
                  onClick={requestGPSLocation}
                  className="px-3 py-1.5 rounded-xl bg-[#2C3D34] hover:bg-[#3D5247] border border-white/10 text-xs font-bold text-[#7FA396] hover:text-[#9DBDB0] transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title={language === "en" ? "Refresh GPS location" : "Perbarui lokasi GPS"}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{language === "en" ? "Locate Me" : "Cari Saya"}</span>
                </button>
              </div>

              {/* Leaflet map window container */}
              <div className="shrink-0">
                <LeafletMap
                  resources={filteredMapResources}
                  selectedResource={selectedResource}
                  onSelectResource={(res) => setSelectedResource(res)}
                  userCoords={userCoords}
                />
                
                {/* GPS Coord Badge */}
                {coordsStatus && (
                  <span className="block text-[9px] font-mono text-[#7FA396] text-right mt-1.5">
                    🛰️ {coordsStatus}
                  </span>
                )}
              </div>

              {/* Category Pill Selectors */}
              <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold whitespace-nowrap transition-colors border ${
                    selectedCategory === "all"
                      ? "bg-[#7FA396] text-[#1B2620] border-[#7FA396]"
                      : "bg-[#1C2521] text-[#B8C2BC] border-white/5 hover:text-[#F0EEE8]"
                  }`}
                >
                  🌐 {strings.map.allCategories}
                </button>
                {Object.keys(strings.home.categories).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold whitespace-nowrap transition-colors border ${
                      selectedCategory === cat
                        ? "bg-[#7FA396] text-[#1B2620] border-[#7FA396]"
                        : "bg-[#1C2521] text-[#B8C2BC] border-white/5 hover:text-[#F0EEE8]"
                    }`}
                  >
                    {cat === "shelter" && "🏠 "}
                    {cat === "legal" && "⚖️ "}
                    {cat === "clinic" && "🏥 "}
                    {cat === "community" && "👥 "}
                    {cat === "job" && "💼 "}
                    {(strings.home.categories as any)[cat].name}
                  </button>
                ))}
              </div>

              {/* Search Field */}
              <div className="relative shrink-0">
                <Search className="w-4 h-4 text-[#5C7A6E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={strings.map.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1C2521] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8] transition-colors"
                />
              </div>

              {/* Matched local directory items */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[30vh]">
                {filteredMapResources.length === 0 ? (
                  <div className="text-center py-10 glass-panel rounded-xl text-xs text-[#8A9590]">
                    😞 {strings.map.noResults}
                  </div>
                ) : (
                  filteredMapResources.map((res) => {
                    const isSelected = selectedResource?.id === res.id;
                    const distance = userCoords
                      ? calculateDistance(userCoords.lat, userCoords.lng, res.lat, res.lng)
                      : null;

                    return (
                      <div
                        key={res.id}
                        onClick={() => setSelectedResource(res)}
                        className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#24332B] border-[#7FA396]/40 shadow-md"
                            : "glass-panel hover:bg-white/5 border-white/5"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[8.5px] text-[#7FA396] font-bold font-mono uppercase">
                              {res.category}
                            </span>
                            <h4 className="font-bold text-sm text-[#F0EEE8] mt-1.5">{res.name}</h4>
                            <p className="text-[11px] text-[#B8C2BC] leading-relaxed mt-1">{res.address}</p>
                          </div>
                          
                          {distance && (
                            <span className="text-[10px] text-[#7FA396] font-mono whitespace-nowrap">
                              📍 {distance} km
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <div className="mt-4 pt-3 border-t border-white/5 space-y-2.5 animate-slide-up text-xs text-[#B8C2BC]">
                            <p className="text-xs text-[#F0EEE8] font-medium italic">"{res.notes}"</p>
                            
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#7FA396]" />
                              <span>{res.hours}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-[#7FA396]" />
                              <span>{res.free ? strings.map.free : strings.map.paid}</span>
                            </div>

                            {/* Actions bar */}
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEmergencyTarget({
                                    name: res.name,
                                    number: res.phone,
                                    desc: res.address,
                                  });
                                }}
                                className="flex-1 py-2.5 bg-[#7FA396] hover:bg-[#9DBDB0] text-[#1B2620] font-bold rounded-lg text-[10.5px] transition-all text-center"
                              >
                                📞 {strings.map.call}
                              </button>
                              
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${res.lat},${res.lng}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 py-2.5 bg-[#1C2521] hover:bg-[#25322B] text-[#F0EEE8] border border-white/5 rounded-lg text-[10.5px] font-semibold transition-all text-center block"
                              >
                                🧭 {strings.map.getDirections}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* SCREEN 3: QUIZ SELECT / SELF-ASSESSMENT LIST */}
          {currentScreen === "quiz-select" && (
            <div className="space-y-5 text-left animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => setCurrentScreen("home")}
                  className="p-1.5 rounded-lg bg-[#202C26] hover:bg-[#2C3D34] text-[#B8C2BC] border border-white/5"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-display font-extrabold text-[#F0EEE8]">
                  {strings.quiz.title}
                </h2>
              </div>

              {/* Disclaimer */}
              <div className="glass-panel rounded-xl p-4 border border-white/5 text-xs text-[#B8C2BC] leading-relaxed flex gap-3">
                <Info className="w-5 h-5 text-[#7FA396] shrink-0 mt-0.5" />
                <p>{strings.quiz.disclaimer}</p>
              </div>

              {/* Critical Alert banner for immediate danger */}
              <div className="bg-[#E0703D]/10 rounded-xl p-4 border border-[#E0703D]/25 text-xs text-[#F0EEE8] leading-relaxed">
                <div className="flex items-center gap-2 text-[#E0703D] font-bold">
                  <span>🚨</span>
                  <span>{strings.quiz.emergencyBanner}</span>
                </div>
                <button
                  onClick={() => setCurrentScreen("emergency")}
                  className="mt-3 px-4 py-2 rounded-lg bg-[#E0703D] hover:bg-[#F0804D] text-[#F0EEE8] font-bold text-[10.5px] transition-all"
                >
                  Hubungi Kontak Darurat
                </button>
              </div>

              <h3 className="font-display font-bold text-xs text-[#8A9590] uppercase tracking-wider">
                {strings.quiz.selectType}
              </h3>

              {/* Violence categories selection grid */}
              <div className="grid grid-cols-1 gap-3.5">
                {QUIZ_DATA.map((cat) => {
                  let catEmoji = "🛡️";
                  if (cat.type === "physical") catEmoji = "👊";
                  if (cat.type === "verbal") catEmoji = "🗣️";
                  if (cat.type === "kdrt") catEmoji = "🏠";
                  if (cat.type === "cyber") catEmoji = "💻";

                  const textName = language === "en" ? cat.nameEn : cat.nameId;
                  const textDesc = (strings.quiz.categories as any)[cat.type]?.desc || "";

                  return (
                    <button
                      key={cat.type}
                      onClick={() => startQuiz(cat.type)}
                      className="glass-panel hover:bg-white/5 rounded-xl p-4 transition-all border border-white/5 text-left flex items-start gap-4 active:scale-[0.98]"
                    >
                      <span className="text-3xl p-2 bg-[#1B2620] rounded-xl border border-white/5 shrink-0">
                        {catEmoji}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-[#F0EEE8]">{textName}</h4>
                        <p className="text-[10px] text-[#8A9590] leading-normal mt-1">{textDesc}</p>
                        <span className="inline-block mt-2.5 text-[9.5px] font-bold text-[#7FA396] hover:underline font-mono uppercase tracking-wider">
                          Mulai Skrining →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          )}

          {/* SCREEN 4: QUIZ ACTIVE QUESTION PANEL (Skrining Kuis) */}
          {currentScreen === "quiz-question" && activeQuizType && (
            <div className="space-y-6 text-left animate-fade-in flex-1 flex flex-col justify-between">
              
              {/* Question card */}
              <div className="space-y-5 flex-1">
                {(() => {
                  const category = QUIZ_DATA.find((c) => c.type === activeQuizType);
                  const questions = category?.questions || [];
                  const q = questions[quizCurrentIndex];
                  if (!q) return null;

                  const textQuestion = language === "en" ? q.textEn : q.textId;

                  return (
                    <div className="space-y-5">
                      {/* Progress header */}
                      <div className="flex justify-between items-center text-xs font-semibold text-[#8A9590]">
                        <span className="font-mono uppercase text-[#7FA396] tracking-widest bg-[#7FA396]/10 px-2.5 py-0.5 rounded-full border border-[#7FA396]/20">
                          {q.dimension}
                        </span>
                        <span>
                          {strings.quiz.questionCount
                            .replace("{current}", (quizCurrentIndex + 1).toString())
                            .replace("{total}", questions.length.toString())}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-[#202C26] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#7FA396] h-full transition-all duration-300"
                          style={{
                            width: `${((quizCurrentIndex + 1) / questions.length) * 100}%`,
                          }}
                        />
                      </div>

                      <h3 className="font-display font-bold text-base text-[#F0EEE8] leading-relaxed pt-3">
                        {textQuestion}
                      </h3>

                      {/* Options selector list */}
                      <div className="space-y-3 pt-2">
                        {q.options.map((opt, oIdx) => {
                          const textOpt = language === "en" ? opt.textEn : opt.textId;
                          
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectAnswer(opt.points, opt.triggerCritical)}
                              className="w-full p-4 rounded-xl bg-[#202C26] hover:bg-[#2C3D34] active:scale-95 border border-white/5 hover:border-[#7FA396]/30 text-left text-xs font-medium text-[#F0EEE8] transition-all flex items-center justify-between"
                            >
                              <span>{textOpt}</span>
                              <ChevronRight className="w-4 h-4 text-[#5C7A6E] shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Quiz controls footer */}
              <div className="pt-6 border-t border-white/5 flex justify-between items-center shrink-0">
                <button
                  onClick={handlePrevQuizQuestion}
                  disabled={quizCurrentIndex === 0}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    quizCurrentIndex === 0 ? "opacity-30 cursor-not-allowed text-[#5C7A6E]" : "text-[#B8C2BC] hover:text-[#F0EEE8] bg-[#1C2521] border border-white/5"
                  }`}
                >
                  ← {strings.quiz.prev}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Apakah Anda yakin ingin keluar dari skrining? Jawaban saat ini tidak akan disimpan.")) {
                      setCurrentScreen("quiz-select");
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-[#E0703D] hover:bg-red-950/10 transition-all border border-[#E0703D]/20"
                >
                  {strings.quiz.exit}
                </button>
              </div>

            </div>
          )}

          {/* SCREEN 5: QUIZ RESULTS ANALYSIS (Hasil Analisis) */}
          {currentScreen === "quiz-result" && quizResult && (
            <div className="space-y-6 text-left animate-fade-in">
              <h2 className="text-lg font-display font-extrabold text-[#F0EEE8] tracking-tight">
                🎉 {strings.quiz.resultTitle}
              </h2>

              {/* Severity Summary Card */}
              <div
                className={`rounded-2xl p-6 border text-left space-y-2 relative overflow-hidden ${
                  quizResult.severity === "high"
                    ? "bg-red-950/10 border-[#E0703D]/30 text-[#F0EEE8]"
                    : quizResult.severity === "medium"
                    ? "bg-[#C9A66B]/10 border-[#C9A66B]/30 text-[#F0EEE8]"
                    : "bg-[#2C3D34]/30 border-[#7FA396]/30 text-[#F0EEE8]"
                }`}
              >
                <span className="block text-[11px] uppercase font-bold tracking-widest font-mono text-[#8A9590]">
                  {strings.quiz.severityLabel}
                </span>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-display font-extrabold tracking-tight">
                    {quizResult.severity === "high"
                      ? strings.quiz.severity.high
                      : quizResult.severity === "medium"
                      ? strings.quiz.severity.medium
                      : strings.quiz.severity.low}
                  </span>
                  <span className="text-xs text-[#8A9590]">
                    (Score: {quizResult.score})
                  </span>
                </div>

                <p className="text-xs text-[#B8C2BC] leading-relaxed pt-1.5">
                  {quizResult.severity === "high"
                    ? "Situasi Anda memiliki tanda bahaya tinggi atau risiko fisik yang mengancam. Sangat disarankan untuk segera menghubungi layanan penyelamatan darurat / rumah aman terdekat."
                    : quizResult.severity === "medium"
                    ? "Terdapat indikasi kekerasan sedang yang perlu mendapat perhatian. Melakukan konseling pemulihan trauma psikologis adalah langkah hebat demi mengembalikan kendali emosional Anda."
                    : "Hasil menunjukkan tingkat keparahan ringan. Silakan pelajari batasan diri sehat dan hubungi pendamping kami jika dirasa membutuhkan teman mengobrol."}
                </p>
              </div>

              {/* Dimensional scores breakdown */}
              <div className="space-y-3.5">
                <h3 className="font-display font-bold text-xs text-[#8A9590] uppercase tracking-wider">
                  {strings.quiz.dimensionBreakdown}
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(quizResult.breakdown).map(([dim, val]) => {
                    const numVal = val as number;
                    return (
                      <div key={dim} className="space-y-1 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-[#B8C2BC]">{dim}</span>
                          <span className="text-[#7FA396] font-mono font-bold">{numVal} pts</span>
                        </div>
                        <div className="w-full bg-[#1C2521] h-2 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="bg-[#7FA396] h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((numVal / 10) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Personalized Checklists */}
              <div className="space-y-3.5">
                <h3 className="font-display font-bold text-xs text-[#8A9590] uppercase tracking-wider">
                  {strings.quiz.actionFlow}
                </h3>
                <div className="space-y-2.5">
                  {(language === "en" ? quizResult.actionsEn : quizResult.actionsId).map((act, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#202C26] border border-white/5 flex gap-3 text-left">
                      <CheckCircle className="w-5 h-5 text-[#7FA396] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#F0EEE8] leading-relaxed">{act}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialized Recommended nearby contacts */}
              {quizResult.contacts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-display font-bold text-xs text-[#8A9590] uppercase tracking-wider">
                    {language === "en" ? "Recommended Contacts" : "Kontak Rekomendasi Terdekat"}
                  </h3>
                  <div className="space-y-3">
                    {quizResult.contacts.map((con, idx) => (
                      <div key={idx} className="glass-panel rounded-xl p-4 border border-white/15 flex items-center justify-between text-left">
                        <div>
                          <h4 className="font-bold text-sm text-[#F0EEE8]">{con.name}</h4>
                          <p className="text-[10px] text-[#8A9590] leading-normal mt-0.5">{con.desc}</p>
                          <span className="block text-[11px] font-bold text-[#E0703D] mt-1 font-mono">{con.number}</span>
                        </div>
                        <button
                          onClick={() => setEmergencyTarget({ name: con.name, number: con.number, desc: con.desc })}
                          className="px-3.5 py-2 rounded-lg bg-[#E0703D] hover:bg-[#F0804D] text-[#F0EEE8] text-xs font-bold transition-all active:scale-95"
                        >
                          📞 Hubungi
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action retake */}
              <button
                onClick={() => setCurrentScreen("quiz-select")}
                className="w-full py-4 rounded-xl bg-[#2C3D34] hover:bg-[#3D5247] border border-white/5 text-xs font-bold transition-all active:scale-95 text-center mt-4"
              >
                🔄 {strings.quiz.retake}
              </button>

            </div>
          )}

          {/* SCREEN 6: ABOUT (Tentang SafeMap & Privacy) */}
          {currentScreen === "about" && (
            <div className="space-y-6 text-left animate-fade-in">
              <h2 className="text-lg font-display font-extrabold text-[#F0EEE8] tracking-tight">
                {strings.about.title}
              </h2>

              <p className="text-xs text-[#B8C2BC] leading-relaxed">
                {strings.about.p1}
              </p>
              <p className="text-xs text-[#B8C2BC] leading-relaxed">
                {strings.about.p2}
              </p>

              {/* Feature pillars */}
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-[#202C26] border border-white/5">
                  <h3 className="font-bold text-sm text-[#F0EEE8] flex items-center gap-1.5">
                    {strings.about.disguiseTitle}
                  </h3>
                  <p className="text-xs text-[#8A9590] leading-relaxed mt-2">
                    {strings.about.disguiseDesc}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#202C26] border border-white/5">
                  <h3 className="font-bold text-sm text-[#F0EEE8]">
                    {strings.about.privacyTitle}
                  </h3>
                  <p className="text-xs text-[#8A9590] leading-relaxed mt-2">
                    {strings.about.privacyDesc}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#202C26] border border-white/5">
                  <h3 className="font-bold text-sm text-[#F0EEE8]">
                    {strings.about.teamTitle}
                  </h3>
                  <p className="text-xs text-[#8A9590] leading-relaxed mt-2">
                    {strings.about.teamDesc}
                  </p>
                </div>
              </div>

              {/* SECURE MODERATOR LOGIN LINK */}
              <div className="pt-6 border-t border-white/5 text-center">
                <button
                  onClick={() => setCurrentScreen("admin")}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-[#8A9590] font-semibold border border-white/5 transition-all active:scale-95"
                >
                  🛡️ {strings.about.adminLink}
                </button>
              </div>

            </div>
          )}

          {/* SCREEN 7: EMERGENCY COMPREHENSIVE HOTLINES */}
          {currentScreen === "emergency" && (
            <div className="space-y-5 text-left animate-fade-in">
              <h2 className="text-lg font-display font-extrabold text-[#F0EEE8] tracking-tight">
                {strings.emergency.title}
              </h2>
              <p className="text-xs text-[#B8C2BC] leading-relaxed">
                {strings.emergency.desc}
              </p>

              {/* Hotlines card grid */}
              <div className="space-y-4 pt-2">
                {hotlinesList.map((hl) => (
                  <div
                    key={hl.id}
                    className="glass-panel-elevated rounded-xl p-5 border border-white/10 flex items-center justify-between text-left"
                  >
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{hl.icon}</span>
                        <h4 className="font-bold text-sm text-[#F0EEE8] leading-tight">
                          {hl.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-[#B8C2BC] leading-normal">{hl.desc}</p>
                      <span className="block text-base font-extrabold text-[#E0703D] font-mono tracking-tight pt-1">
                        {hl.number}
                      </span>
                    </div>

                    <button
                      onClick={() => setEmergencyTarget({ name: hl.name, number: hl.number, desc: hl.desc })}
                      className="px-4 py-3 bg-[#E0703D] hover:bg-[#F0804D] text-[#F0EEE8] text-xs font-bold rounded-xl transition-all shadow-md shadow-[#E0703D]/10 active:scale-95 shrink-0 text-center"
                    >
                      📞 Hubungi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* PERSISTENT BOTTOM GLASS NAVIGATION BAR */}
        <nav className="absolute bottom-0 left-0 right-0 z-20 glass-nav border-t border-white/5 shrink-0 py-2.5">
          <div className="w-full px-4 flex justify-between items-center">
            
            <button
              onClick={() => setCurrentScreen("home")}
              className={`flex flex-col items-center gap-1 flex-1 transition-all py-1 rounded-lg ${
                currentScreen === "home" ? "text-[#7FA396]" : "text-[#8A9590] hover:text-[#F0EEE8]"
              }`}
            >
              <Shield className="w-4.5 h-4.5" />
              <span className="text-[9.5px] font-semibold">{strings.nav.home}</span>
            </button>
 
            <button
              onClick={() => {
                setSelectedCategory("all");
                setCurrentScreen("map");
              }}
              className={`flex flex-col items-center gap-1 flex-1 transition-all py-1 rounded-lg ${
                currentScreen === "map" ? "text-[#7FA396]" : "text-[#8A9590] hover:text-[#F0EEE8]"
              }`}
            >
              <MapPin className="w-4.5 h-4.5" />
              <span className="text-[9.5px] font-semibold">{strings.nav.search}</span>
            </button>
 
            <button
              onClick={() => setCurrentScreen("quiz-select")}
              className={`flex flex-col items-center gap-1 flex-1 transition-all py-1 rounded-lg ${
                currentScreen.startsWith("quiz") ? "text-[#7FA396]" : "text-[#8A9590] hover:text-[#F0EEE8]"
              }`}
            >
              <FileText className="w-4.5 h-4.5" />
              <span className="text-[9.5px] font-semibold">Skrining</span>
            </button>
 
            <button
              onClick={() => setCurrentScreen("about")}
              className={`flex flex-col items-center gap-1 flex-1 transition-all py-1 rounded-lg ${
                currentScreen === "about" ? "text-[#7FA396]" : "text-[#8A9590] hover:text-[#F0EEE8]"
              }`}
            >
              <Info className="w-4.5 h-4.5" />
              <span className="text-[9.5px] font-semibold">{strings.nav.about}</span>
            </button>
 
            <button
              onClick={() => setCurrentScreen("emergency")}
              className={`flex flex-col items-center gap-1 flex-1 transition-all py-1 rounded-lg ${
                currentScreen === "emergency" ? "text-[#E0703D] font-bold" : "text-[#8A9590] hover:text-[#E0703D]"
              }`}
            >
              <Phone className="w-4.5 h-4.5 animate-pulse" />
              <span className="text-[9.5px] font-semibold">{strings.nav.emergency}</span>
            </button>
 
          </div>
        </nav>
 
        {/* SAFEPIN FLOATING CHAT TRIGGER CHIP (Pulsing green orb) */}
        {currentScreen !== "admin" && (
          <div className="absolute bottom-28 left-5 z-30">
            <button
              onClick={() => setChatOpen(true)}
              className="w-12 h-12 rounded-full bg-[#1B2620]/95 backdrop-blur-md border border-[#7FA396]/35 text-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-black/30"
              title="Obrolan SafePin"
            >
              🦉
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#7FA396] rounded-full border-2 border-[#1B2620] animate-pulse"></span>
            </button>
          </div>
        )}

        {/* SAFEPIN CHAT SHEET MODAL OVERLAY */}
        <SafePinChat
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          language={language}
          sessionId={sessionId}
          onTriggerEmergency={() => setCurrentScreen("emergency")}
        />

        {/* INTERCEPTED EMERGENCY CONFIRM MODAL OVERLAY (Confirm-Before-Call) */}
        {emergencyTarget && (
          <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-6 animate-fade-in font-sans">
            <div className="w-full max-w-sm rounded-2xl glass-panel-elevated p-6 text-center space-y-4 border border-white/10 shadow-2xl">
              <div className="w-14 h-14 bg-[#E0703D]/10 rounded-full flex items-center justify-center mx-auto text-2xl border border-[#E0703D]/20 animate-pulse">
                🚨
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-base text-[#F0EEE8]">
                  {strings.emergency.warningTitle}
                </h3>
                <p className="text-[#E0703D] font-mono font-bold text-sm">
                  {emergencyTarget.name} ({emergencyTarget.number})
                </p>
              </div>

              <p className="text-xs text-[#B8C2BC] leading-relaxed">
                {strings.emergency.warningDesc}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEmergencyTarget(null)}
                  className="flex-1 py-3 border border-white/5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-[#B8C2BC] transition-colors"
                >
                  {strings.emergency.cancel}
                </button>
                <a
                  href={`tel:${emergencyTarget.number}`}
                  onClick={() => setEmergencyTarget(null)}
                  className="flex-1 py-3 bg-[#E0703D] hover:bg-[#F0804D] text-[#F0EEE8] text-xs font-bold rounded-xl transition-all shadow-md text-center flex items-center justify-center"
                >
                  {strings.emergency.callNow}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* SUGGEST RESOURCE MODAL FORM OVERLAY */}
        {isSuggestModalOpen && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in font-sans">
            <div className="w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl glass-panel-elevated p-6 text-left flex flex-col justify-between overflow-hidden border border-white/10 shadow-2xl relative">
              
              {/* Modal header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
                <h3 className="font-display font-extrabold text-sm text-[#F0EEE8]">
                  {strings.addResource.title}
                </h3>
                <button
                  onClick={() => setIsSuggestModalOpen(false)}
                  className="p-1.5 rounded-lg bg-[#202C26] hover:bg-[#2C3D34] text-[#B8C2BC]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Scrollable Fields */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                <p className="text-[11px] text-[#B8C2BC] leading-relaxed">
                  {strings.addResource.subtitle}
                </p>

                {formError && (
                  <div className="p-3 bg-[#E0703D]/10 border border-[#E0703D]/20 rounded-xl text-xs text-[#E0703D] text-center font-semibold">
                    ⚠️ {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-[#7FA396] text-center font-semibold animate-scale-up">
                    🎉 {strings.addResource.successToast}
                  </div>
                )}

                <form onSubmit={handleSuggestSubmit} className="space-y-4">
                  
                  {/* Name field */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      {strings.addResource.name} *
                    </label>
                    <input
                      type="text"
                      required
                      value={propName}
                      onChange={(e) => setPropName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8]"
                      placeholder="e.g. LBH APIK Cabang Depok"
                    />
                  </div>

                  {/* Category Field */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      {strings.addResource.category} *
                    </label>
                    <select
                      value={propCategory}
                      onChange={(e) => setPropCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 focus:outline-none focus:border-[#7FA396] text-xs text-[#F0EEE8]"
                    >
                      <option value="shelter">🏠 {strings.home.categories.shelter.name}</option>
                      <option value="legal">⚖️ {strings.home.categories.legal.name}</option>
                      <option value="clinic">🏥 {strings.home.categories.clinic.name}</option>
                      <option value="community">👥 {strings.home.categories.community.name}</option>
                      <option value="job">💼 {strings.home.categories.job.name}</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      {strings.addResource.address} *
                    </label>
                    <input
                      type="text"
                      required
                      value={propAddress}
                      onChange={(e) => setPropAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8]"
                      placeholder="Jl. Margonda Raya No. 45, Beji, Depok"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      {strings.addResource.phone} *
                    </label>
                    <input
                      type="text"
                      required
                      value={propPhone}
                      onChange={(e) => setPropPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8]"
                      placeholder="0812-xxxx-xxxx"
                    />
                  </div>

                  {/* Hours */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      {strings.addResource.hours}
                    </label>
                    <input
                      type="text"
                      value={propHours}
                      onChange={(e) => setPropHours(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8]"
                      placeholder="Senin - Jumat 09:00 - 17:00"
                    />
                  </div>

                  {/* Pricing cost Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="prop-free"
                      checked={propFree}
                      onChange={(e) => setPropFree(e.target.checked)}
                      className="w-4 h-4 text-[#7FA396] bg-[#111815] border-white/10 rounded"
                    />
                    <label htmlFor="prop-free" className="text-xs text-[#B8C2BC]">
                      {strings.addResource.free} (100% Free of charge)
                    </label>
                  </div>

                  {/* Location input Toggle */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1">
                      {strings.addResource.locationInputType} *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPropInputType("gmaps")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                          propInputType === "gmaps"
                            ? "bg-[#7FA396] text-[#1B2620] border-[#7FA396]"
                            : "bg-[#111815] text-[#B8C2BC] border-white/5"
                        }`}
                      >
                        Google Maps Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropInputType("manual")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                          propInputType === "manual"
                            ? "bg-[#7FA396] text-[#1B2620] border-[#7FA396]"
                            : "bg-[#111815] text-[#B8C2BC] border-white/5"
                        }`}
                      >
                        Manual Coordinates
                      </button>
                    </div>
                  </div>

                  {propInputType === "gmaps" ? (
                    <div>
                      <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                        {strings.addResource.gmapsLink} *
                      </label>
                      <input
                        type="url"
                        required
                        value={propGmapsLink}
                        onChange={(e) => setPropGmapsLink(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8]"
                        placeholder="https://maps.app.goo.gl/..."
                      />
                      <span className="block text-[9.5px] text-[#8A9590] mt-1.5 leading-normal">
                        ℹ️ {strings.addResource.gmapsHelper}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                        {strings.addResource.manualCoords} *
                      </label>
                      <input
                        type="text"
                        required
                        value={propManualCoords}
                        onChange={(e) => setPropManualCoords(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8]"
                        placeholder="-6.2088, 106.8456"
                      />
                      <span className="block text-[9.5px] text-[#8A9590] mt-1.5 leading-normal">
                        ℹ️ {strings.addResource.manualHelper}
                      </span>
                    </div>
                  )}

                  {/* Notes info */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#B8C2BC] uppercase tracking-wider mb-1.5">
                      {strings.addResource.notes}
                    </label>
                    <textarea
                      rows={2}
                      value={propNotes}
                      onChange={(e) => setPropNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#111815] border border-white/5 focus:border-[#7FA396] focus:outline-none text-xs text-[#F0EEE8]"
                      placeholder="e.g. Layanan ini khusus menerima korban siber perempuan dengan penanganan psikolog sebaya"
                    />
                  </div>

                  {/* Submission buttons */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-white/5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsSuggestModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-xs font-semibold text-[#B8C2BC]"
                    >
                      {strings.emergency.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#7FA396] hover:bg-[#9DBDB0] text-[#1B2620] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{strings.addResource.submit}</span>
                    </button>
                  </div>

                </form>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
