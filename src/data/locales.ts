export interface LocaleStrings {
  onboarding: {
    title: string;
    skip: string;
    next: string;
    start: string;
    questionnaireTitle: string;
    questionnaireSubtitle: string;
    skipQuestionnaire: string;
    slides: {
      title: string;
      desc: string;
    }[];
  };
  nav: {
    home: string;
    search: string;
    about: string;
    emergency: string;
  };
  home: {
    greetingTitle: string;
    greetingDesc: string;
    categoriesTitle: string;
    addResourceCardTitle: string;
    addResourceCardDesc: string;
    quickAccessTitle: string;
    emergencyButton: string;
    chatButton: string;
    mapButton: string;
    categories: {
      shelter: { name: string; desc: string };
      legal: { name: string; desc: string };
      clinic: { name: string; desc: string };
      community: { name: string; desc: string };
      job: { name: string; desc: string };
    };
  };
  map: {
    title: string;
    allCategories: string;
    searchPlaceholder: string;
    noResults: string;
    distance: string;
    hours: string;
    free: string;
    paid: string;
    call: string;
    getDirections: string;
    gpsError: string;
    gpsSuccess: string;
    back: string;
  };
  addResource: {
    title: string;
    subtitle: string;
    name: string;
    category: string;
    address: string;
    phone: string;
    hours: string;
    price: string;
    free: string;
    paid: string;
    locationInputType: string;
    gmapsLink: string;
    gmapsHelper: string;
    manualCoords: string;
    manualHelper: string;
    notes: string;
    submit: string;
    successToast: string;
    errorToast: string;
    validationError: string;
  };
  quiz: {
    title: string;
    selectType: string;
    disclaimer: string;
    emergencyBanner: string;
    startQuiz: string;
    questionCount: string;
    prev: string;
    next: string;
    submit: string;
    exit: string;
    resultTitle: string;
    severityLabel: string;
    dimensionBreakdown: string;
    actionFlow: string;
    retake: string;
    severity: {
      low: string;
      medium: string;
      high: string;
    };
    categories: {
      physical: { name: string; desc: string };
      verbal: { name: string; desc: string };
      kdrt: { name: string; desc: string };
      cyber: { name: string; desc: string };
    };
  };
  about: {
    title: string;
    p1: string;
    p2: string;
    disguiseTitle: string;
    disguiseDesc: string;
    privacyTitle: string;
    privacyDesc: string;
    teamTitle: string;
    teamDesc: string;
    adminLink: string;
  };
  emergency: {
    title: string;
    desc: string;
    warningTitle: string;
    warningDesc: string;
    cancel: string;
    callNow: string;
    hotlines: {
      sapa: { name: string; desc: string };
      police: { name: string; desc: string };
      komnas: { name: string; desc: string };
      health: { name: string; desc: string };
    };
  };
  chat: {
    title: string;
    statusActive: string;
    statusHuman: string;
    disclaimer: string;
    placeholder: string;
    handoverButton: string;
    handoverSuccess: string;
    crisisWarning: string;
    quickReplies: {
      kdrt: string;
      shelter: string;
      report: string;
      danger: string;
    };
  };
  calculator: {
    instructions: string;
    holdToExit: string;
  };
  admin: {
    title: string;
    loginTitle: string;
    username: string;
    password: string;
    loginButton: string;
    logoutButton: string;
    tabPending: string;
    tabApproved: string;
    tabDatabase: string;
    tabChat: string;
    statsPending: string;
    statsApproved: string;
    statsTotal: string;
    approve: string;
    reject: string;
    edit: string;
    save: string;
    cancel: string;
    delete: string;
    chatsTitle: string;
    noChats: string;
    humanRequired: string;
    botMode: string;
    replyPlaceholder: string;
    send: string;
    emptyPending: string;
    emptyApproved: string;
    searchResource: string;
  };
}

export const ID_STRINGS: LocaleStrings = {
  onboarding: {
    title: "SafeMap Onboarding",
    skip: "Lewati",
    next: "Lanjut",
    start: "Mulai Aplikasi",
    questionnaireTitle: "Apa yang Sedang Anda Alami?",
    questionnaireSubtitle: "Pilih salah satu untuk memulai kuis skrining cepat, atau lewati untuk langsung masuk ke dashboard.",
    skipQuestionnaire: "Lewati Kuesioner & Masuk Dashboard",
    slides: [
      {
        title: "Selamat Datang di SafeMap",
        desc: "SafeMap adalah pendamping gratis, anonim, tanpa login untuk mendampingi korban kekerasan fisik, verbal, KDRT, dan cyberbullying mencari bantuan terdekat dengan aman."
      },
      {
        title: "4 Jenis Kekerasan",
        desc: "Kami membantu mendeteksi dan memberi panduan untuk Kekerasan Fisik, Kekerasan Verbal, Kekerasan Dalam Rumah Tangga (KDRT), dan Cyberbullying secara komprehensif."
      },
      {
        title: "Kekerasan di Indonesia",
        desc: "Statistik nasional menunjukkan tingkat pelaporan kekerasan masih sangat rendah karena rasa takut dan minimnya akses info. Anda tidak sendiri, kami ada untuk membantu."
      },
      {
        title: "Perbedaan SafeMap",
        desc: "Peta hiperlokal terintegrasi Jabodetabek, bebas pelacakan data, enkripsi lokal penuh, dan tombol darurat 'Kalkulator' untuk menyamarkan aplikasi demi privasi Anda."
      }
    ]
  },
  nav: {
    home: "Beranda",
    search: "Cari",
    about: "Tentang",
    emergency: "Darurat"
  },
  home: {
    greetingTitle: "Halo Sahabat SafeMap 🛡️",
    greetingDesc: "Kami hadir untuk mendengarkan, menilai, dan memandu pemulihan Anda dengan kerahasiaan penuh. Anda memegang kendali atas keselamatan Anda.",
    categoriesTitle: "Layanan Bantuan Terdekat",
    addResourceCardTitle: "Punya Info Layanan Baru?",
    addResourceCardDesc: "Bantu sesama penyintas dengan menambahkan rumah aman, klinik hukum, atau layanan pro-bono yang Anda ketahui di Jabodetabek.",
    quickAccessTitle: "Akses Cepat",
    emergencyButton: "🚨 Kontak Darurat",
    chatButton: "💬 SafePin AI Chat",
    mapButton: "🗺️ Lihat Semua Peta",
    categories: {
      shelter: { name: "Rumah Aman (Shelter)", desc: "Tempat bernaung sementara yang terlindung dan rahasia." },
      legal: { name: "Bantuan Hukum", desc: "Konsultasi dan pendampingan hukum gratis dari LBH." },
      clinic: { name: "Klinik Pro-Bono", desc: "Layanan kesehatan fisik, mental, dan forensik gratis." },
      community: { name: "Komunitas Survivor", desc: "Kelompok dukungan sesama penyintas untuk pemulihan jiwa." },
      job: { name: "Program Kerja", desc: "Pelatihan keterampilan dan pemberdayaan ekonomi korban." }
    }
  },
  map: {
    title: "Peta & Layanan Bantuan",
    allCategories: "Semua Kategori",
    searchPlaceholder: "Cari nama, alamat, atau wilayah di Jakarta...",
    noResults: "Tidak ada layanan yang ditemukan di sekitar Anda.",
    distance: "Jarak",
    hours: "Jam Operasional",
    free: "Gratis",
    paid: "Berbayar / Subsidi",
    call: "Telepon",
    getDirections: "Rute Peta",
    gpsError: "Gagal mendeteksi lokasi GPS. Menampilkan pusat Jakarta.",
    gpsSuccess: "Lokasi GPS berhasil terdeteksi.",
    back: "Kembali"
  },
  addResource: {
    title: "Tambah Layanan Baru",
    subtitle: "Kontribusi Anda menyelamatkan nyawa. Layanan yang dikirim akan melalui moderasi admin sebelum muncul di peta.",
    name: "Nama Layanan / Organisasi",
    category: "Kategori Layanan",
    address: "Alamat Lengkap",
    phone: "Nomor Telepon Kontak",
    hours: "Jam Operasional (misal: Senin - Jumat 09:00 - 17:00)",
    price: "Biaya Layanan",
    free: "Gratis / Pro-Bono",
    paid: "Berbayar / Subsidi",
    locationInputType: "Metode Lokasi",
    gmapsLink: "Link Bagikan Google Maps",
    gmapsHelper: "Tempel link bagikan (share link) dari aplikasi Google Maps, sistem kami akan mengekstrak koordinat otomatis.",
    manualCoords: "Koordinat Manual (Lat, Lng)",
    manualHelper: "Tekan lama pada Google Maps untuk menyalin titik koordinat, lalu tempel di bawah ini (Format: Latitude, Longitude).",
    notes: "Keterangan / Catatan Tambahan (opsional)",
    submit: "Kirim Usulan Layanan",
    successToast: "Usulan layanan berhasil dikirim! Menunggu persetujuan moderator.",
    errorToast: "Gagal mengirim usulan. Silakan periksa koneksi Anda.",
    validationError: "Harap isi semua kolom wajib dengan benar."
  },
  quiz: {
    title: "Asesmen Mandiri",
    selectType: "Pilih Jenis Kekerasan yang Dialami",
    disclaimer: "PENTING: Alat asesmen ini adalah alat skrining awal untuk memahami tingkat keparahan situasi Anda, bukan diagnosis klinis resmi. Kerahasiaan Anda dilindungi secara lokal.",
    emergencyBanner: "Jika Anda berada dalam ancaman bahaya fisik segera, jangan isi kuis ini. Silakan hubungi nomor darurat di bawah ini.",
    startQuiz: "Mulai Asesmen Mandiri",
    questionCount: "Pertanyaan {current} dari {total}",
    prev: "Sebelumnya",
    next: "Selanjutnya",
    submit: "Selesaikan & Lihat Hasil",
    exit: "Keluar",
    resultTitle: "Hasil Analisis Asesmen",
    severityLabel: "Tingkat Risiko / Keparahan",
    dimensionBreakdown: "Rincian Skor per Dimensi",
    actionFlow: "Langkah Rekomendasi Pemulihan",
    retake: "Ulangi Asesmen",
    severity: {
      low: "Ringan",
      medium: "Sedang",
      high: "Berat / Kritis"
    },
    categories: {
      physical: { name: "Kekerasan Fisik", desc: "Tindakan penyerangan fisik, pemukulan, cubitan, atau ancaman fisik langsung." },
      verbal: { name: "Kekerasan Verbal", desc: "Hinaan berulang, pelecehan kata-kata, gaslighting, dan intimidasi psikologis." },
      kdrt: { name: "Kekerasan Dalam Rumah Tangga", desc: "Kekerasan fisik, seksual, psikis, atau penelantaran ekonomi dalam lingkup rumah tangga." },
      cyber: { name: "Cyberbullying / Kekerasan Siber", desc: "Pelecehan online, doxxing, penyebaran foto pribadi (revenge porn), atau ancaman siber." }
    }
  },
  about: {
    title: "Tentang SafeMap",
    p1: "SafeMap adalah platform pelindung digital independen yang dirancang khusus untuk membantu korban kekerasan di wilayah Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi). Kami percaya bahwa akses informasi bantuan harus bebas hambatan, aman, dan tanpa jejak digital.",
    p2: "Kami tidak menyimpan data pribadi Anda di server. Seluruh aktivitas kuis, lokasi GPS Anda, dan riwayat obrolan hanya berada di perangkat Anda, menjaga privasi mutlak dari pihak yang tidak diinginkan.",
    disguiseTitle: "🔒 Fitur Penyamaran Kalkulator",
    disguiseDesc: "Terdapat tombol melayang 'Kalkulator' yang selalu aktif di pojok aplikasi. Ketika ditekan, layar akan berubah menjadi kalkulator fungsional. Untuk kembali ke SafeMap, tekan dan tahan tombol '=' selama 3 detik.",
    privacyTitle: "🚫 Tanpa Pelacakan & Log",
    privacyDesc: "Tidak ada cookies pelacak, tidak ada pendaftaran akun pengunjung, dan tidak ada pengiriman data kuis ke server kami secara berkala.",
    teamTitle: "👥 Kolaborasi Tim & Mitra",
    teamDesc: "SafeMap dikembangkan bekerja sama dengan para pegiat sosial perlindungan perempuan dan anak, LBH, dan penyintas kekerasan di Jabodetabek.",
    adminLink: "Masuk sebagai Admin"
  },
  emergency: {
    title: "Hubungi Bantuan Darurat",
    desc: "Jika Anda atau orang terdekat berada dalam bahaya fisik yang mengancam nyawa, segera hubungi salah satu kontak darurat nasional di bawah ini.",
    warningTitle: "Konfirmasi Panggilan Darurat",
    warningDesc: "Pastikan Anda berada di tempat yang aman dan tenang sebelum menelepon. Siapkan informasi nama, lokasi saat ini, dan kronologi singkat situasi bahaya Anda agar petugas dapat bertindak cepat.",
    cancel: "Batal / Kembali",
    callNow: "Ya, Hubungi Sekarang!",
    hotlines: {
      sapa: { name: "SAPA 129 (KemenPPPA)", desc: "Layanan Sahabat Perempuan dan Anak untuk pelaporan kasus kekerasan dan rujukan rumah aman." },
      police: { name: "Polisi 110 (Polda Metro Jaya)", desc: "Layanan tanggap darurat kepolisian untuk penyelamatan darurat fisik seketika." },
      komnas: { name: "Komnas Perempuan", desc: "Komisi Nasional Anti Kekerasan Terhadap Perempuan untuk aduan hukum dan perlindungan hak." },
      health: { name: "Krisis Kesehatan & Ambulans 119", desc: "Layanan ambulans darurat dan rujukan medis pasca kekerasan fisik berat." }
    }
  },
  chat: {
    title: "SafePin Asisten AI 🦉",
    statusActive: "Aktif • Pendamping AI Pintar",
    statusHuman: "Dipandu Moderator Manusia",
    disclaimer: "DISCLAIMER: SafePin adalah asisten pintar berbasis kecerdasan buatan, bukan konselor, pengacara, atau dokter berlisensi. Tidak untuk menggantikan layanan darurat.",
    placeholder: "Ketik pesan Anda di sini dengan aman...",
    handoverButton: "Hubungkan ke Manusia (Moderator)",
    handoverSuccess: "Sesi Anda telah ditandai untuk moderator. Silakan terus mengobrol, moderator akan bergabung segera.",
    crisisWarning: "🚨 Sistem mendeteksi potensi bahaya kritis. Harap gunakan tombol panggilan darurat di bawah demi keselamatan Anda.",
    quickReplies: {
      kdrt: "Apa yang harus saya lakukan saat terkena KDRT?",
      shelter: "Saya butuh tempat berlindung darurat",
      report: "Bagaimana cara melaporkan kekerasan verbal?",
      danger: "Saya dalam bahaya sekarang 🚨"
    }
  },
  calculator: {
    instructions: "Gunakan tombol kalkulator untuk melakukan perhitungan normal.",
    holdToExit: "Tekan dan tahan tombol '=' selama 3 detik untuk kembali."
  },
  admin: {
    title: "SafeMap Moderasi Panel",
    loginTitle: "Masuk Moderator",
    username: "ID Pengguna Admin",
    password: "Kata Sandi",
    loginButton: "Masuk Panel",
    logoutButton: "Keluar",
    tabPending: "Usulan Baru ({count})",
    tabApproved: "Riwayat Setuju",
    tabDatabase: "Database Layanan",
    tabChat: "Konseling Chat ({count})",
    statsPending: "Menunggu",
    statsApproved: "Disetujui",
    statsTotal: "Total Layanan",
    approve: "Setujui",
    reject: "Tolak",
    edit: "Ubah",
    save: "Simpan",
    cancel: "Batal",
    delete: "Hapus",
    chatsTitle: "Inbox Sesi Obrolan Konseling",
    noChats: "Belum ada sesi obrolan yang masuk.",
    humanRequired: "Butuh Moderator Manusia",
    botMode: "Mode AI Aktif",
    replyPlaceholder: "Ketik tanggapan Anda sebagai konselor manusia...",
    send: "Kirim",
    emptyPending: "Tidak ada usulan baru yang menunggu persetujuan.",
    emptyApproved: "Belum ada riwayat persetujuan.",
    searchResource: "Cari layanan di database..."
  }
};

export const EN_STRINGS: LocaleStrings = {
  onboarding: {
    title: "SafeMap Onboarding",
    skip: "Skip",
    next: "Next",
    start: "Get Started",
    questionnaireTitle: "What Are You Experiencing?",
    questionnaireSubtitle: "Select an option to start a quick screening quiz, or skip to enter the dashboard directly.",
    skipQuestionnaire: "Skip Questionnaire & Enter Dashboard",
    slides: [
      {
        title: "Welcome to SafeMap",
        desc: "SafeMap is a free, anonymous, no-login companion app for victims of physical, verbal, domestic (KDRT), and cyberbullying to securely find nearby aid."
      },
      {
        title: "4 Covered Violence Types",
        desc: "We provide comprehensive self-screening, action guides, and resources for Physical, Verbal, Domestic Violence, and Cyberbullying."
      },
      {
        title: "Violence in Indonesia",
        desc: "National statistics show high underreporting rates due to fear and lack of resource access. You are not alone; we are here to support."
      },
      {
        title: "What Makes Us Different",
        desc: "A Greater Jakarta hyperlocal map, zero data tracking, full local data privacy, and a functional 'Calculator' panic mask to protect your screen privacy."
      }
    ]
  },
  nav: {
    home: "Home",
    search: "Search",
    about: "About",
    emergency: "Emergency"
  },
  home: {
    greetingTitle: "Hello, SafeMap Friend 🛡️",
    greetingDesc: "We are here to listen, assess, and guide your recovery with absolute confidentiality. You hold the controls to your safety.",
    categoriesTitle: "Nearby Relief Resources",
    addResourceCardTitle: "Know a Helpful Resource?",
    addResourceCardDesc: "Help fellow survivors by suggesting shelters, pro-bono clinics, or free legal aid offices across Greater Jakarta.",
    quickAccessTitle: "Quick Access",
    emergencyButton: "🚨 Emergency Hotlines",
    chatButton: "💬 SafePin AI Chat",
    mapButton: "🗺️ View Map & List",
    categories: {
      shelter: { name: "Safe Houses (Shelters)", desc: "Secure and confidential temporary housing." },
      legal: { name: "Legal Aid", desc: "Free legal consulting and court representation from LBH." },
      clinic: { name: "Pro-Bono Clinics", desc: "Free medical, forensic, and psychological care." },
      community: { name: "Survivor Communities", desc: "Peer support networks for therapeutic recovery." },
      job: { name: "Economic Programs", desc: "Job training and financial empowerment workshops." }
    }
  },
  map: {
    title: "Resource Map & Directory",
    allCategories: "All Categories",
    searchPlaceholder: "Search by name, address, area in Jakarta...",
    noResults: "No support resources found near you.",
    distance: "Distance",
    hours: "Hours",
    free: "Free of charge",
    paid: "Paid / Subsidized",
    call: "Call",
    getDirections: "Map Route",
    gpsError: "Failed to detect GPS location. Showing Central Jakarta.",
    gpsSuccess: "GPS location detected successfully.",
    back: "Back"
  },
  addResource: {
    title: "Suggest a Support Resource",
    subtitle: "Your contribution saves lives. Submitted resources will be moderated by our team before appearing on the public map.",
    name: "Resource / Organization Name",
    category: "Service Category",
    address: "Full Street Address",
    phone: "Contact Phone Number",
    hours: "Operating Hours (e.g., Mon - Fri 09:00 - 17:00)",
    price: "Service Cost Type",
    free: "Free / Pro-Bono",
    paid: "Paid / Subsidized",
    locationInputType: "Location Input Method",
    gmapsLink: "Google Maps Share Link",
    gmapsHelper: "Paste the share link from Google Maps app; our system will automatically parse and extract coordinates.",
    manualCoords: "Manual Coordinates (Lat, Lng)",
    manualHelper: "Long-press on Google Maps to copy the coordinate pin, then paste it below (Format: Latitude, Longitude).",
    notes: "Additional Notes or Info (optional)",
    submit: "Submit Proposal",
    successToast: "Resource suggested successfully! Awaiting moderator approval.",
    errorToast: "Failed to submit. Please check your network connection.",
    validationError: "Please fill all required fields correctly."
  },
  quiz: {
    title: "Self-Assessment",
    selectType: "Select Violence Type to Self-Assess",
    disclaimer: "IMPORTANT: This screening questionnaire is an initial risk evaluation tool, not a professional clinical diagnosis. Your local privacy is fully protected.",
    emergencyBanner: "If you are in immediate physical danger, skip this questionnaire and dial emergency services below immediately.",
    startQuiz: "Start Assessment",
    questionCount: "Question {current} of {total}",
    prev: "Previous",
    next: "Next",
    submit: "Finish & View Analysis",
    exit: "Exit",
    resultTitle: "Screening Results Analysis",
    severityLabel: "Indicated Severity / Risk level",
    dimensionBreakdown: "Dimensional Score Breakdown",
    actionFlow: "Recommended Recovery Roadmap",
    retake: "Retake Assessment",
    severity: {
      low: "Low / Low Risk",
      medium: "Moderate Risk",
      high: "High / Critical Risk"
    },
    categories: {
      physical: { name: "Physical Violence", desc: "Acts of physical assault, beating, hitting, pinching, or active physical threats." },
      verbal: { name: "Verbal Violence", desc: "Repeated verbal abuse, insults, severe gaslighting, and psychological intimidation." },
      kdrt: { name: "Domestic Violence (KDRT)", desc: "Physical, sexual, emotional, or financial neglect in a domestic setting." },
      cyber: { name: "Cyberbullying / Cyber Violence", desc: "Online harassment, doxxing, revenge porn sharing, or digital threats." }
    }
  },
  about: {
    title: "About SafeMap",
    p1: "SafeMap is a safe digital protection platform built to support victims of violence across the Greater Jakarta area (Jabodetabek). We believe that access to emergency and support resources must be friction-free, secure, and completely untrackable.",
    p2: "We never store visitor data on our servers. Your quiz answers, GPS logs, and chats stay strictly local to your device, ensuring maximum privacy from prying eyes.",
    disguiseTitle: "🔒 Calculator Panic Disguise",
    disguiseDesc: "A persistent floating 'Calculator' button is always accessible. Tapping it instantly swaps the screen with a fully working calculator. Long-press the '=' button for 3 seconds to return to SafeMap safely.",
    privacyTitle: "🚫 Zero Logs & Tracking",
    privacyDesc: "No tracking cookies, no user account required, and zero silent data uploads to any servers.",
    teamTitle: "👥 Collaborators & Partners",
    teamDesc: "SafeMap is developed in collaboration with social workers, free legal aid groups, and survivors in Jabodetabek.",
    adminLink: "Admin Dashboard Login"
  },
  emergency: {
    title: "Call Emergency Help",
    desc: "If you or someone you know is in immediate life-threatening physical danger, please contact one of the national hotlines below.",
    warningTitle: "Confirm Emergency Call",
    warningDesc: "Ensure you are in a safe, quiet space before making the call. Have your name, current coordinates/address, and active situation ready so responders can deploy help swiftly.",
    cancel: "Cancel / Go Back",
    callNow: "Yes, Call Now!",
    hotlines: {
      sapa: { name: "SAPA 129 (Ministry PPPA)", desc: "National helpline for reporting violence against women/children and housing referral." },
      police: { name: "Police 110 (Metro Jaya)", desc: "National emergency responder for physical rescue and active danger dispatch." },
      komnas: { name: "Komnas Perempuan", desc: "National anti-violence commission against women for legal counsel and rights protection." },
      health: { name: "Health Crisis & Ambulance 119", desc: "Emergency medical transport and crisis clinical referral post-violence." }
    }
  },
  chat: {
    title: "SafePin AI Assistant 🦉",
    statusActive: "Active • AI Supportive Companion",
    statusHuman: "Moderator Joined (Human Counselor)",
    disclaimer: "DISCLAIMER: SafePin is an AI assistant, not a licensed therapist, lawyer, or physician. It does not replace professional crisis responders.",
    placeholder: "Type your message securely...",
    handoverButton: "Hand-off to Human (Moderator)",
    handoverSuccess: "Your session has been flagged for human moderator review. Feel free to keep chatting; they will join shortly.",
    crisisWarning: "🚨 System has detected critical danger signals. Please click the Emergency Call panel below for immediate physical safety.",
    quickReplies: {
      kdrt: "What should I do if facing Domestic Violence?",
      shelter: "I need immediate emergency safe housing",
      report: "How do I document verbal abuse or harassment?",
      danger: "I am in danger right now 🚨"
    }
  },
  calculator: {
    instructions: "Perform regular arithmetic operations securely.",
    holdToExit: "Hold down the '=' button for 3 seconds to return."
  },
  admin: {
    title: "SafeMap Moderation Panel",
    loginTitle: "Moderator Login",
    username: "Admin Username",
    password: "Password",
    loginButton: "Enter Panel",
    logoutButton: "Logout",
    tabPending: "Pending Queue ({count})",
    tabApproved: "Approved Logs",
    tabDatabase: "Service Database",
    tabChat: "Chat Counseling ({count})",
    statsPending: "Pending",
    statsApproved: "Approved",
    statsTotal: "Total Directory",
    approve: "Approve",
    reject: "Reject",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    chatsTitle: "Survivor Chat Counseling Inbox",
    noChats: "No counselling sessions yet.",
    humanRequired: "Needs Human Moderator",
    botMode: "AI Auto-responding",
    replyPlaceholder: "Type your supportive reply as moderator counselor...",
    send: "Send",
    emptyPending: "No new submissions waiting for review.",
    emptyApproved: "No approved history logged yet.",
    searchResource: "Search directory database..."
  }
};
