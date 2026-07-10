import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ID_STRINGS, EN_STRINGS } from "../data/locales";
import { Shield, Smartphone, BarChart3, AlertOctagon, ArrowLeft, ChevronRight, X, Info, Map, Lock, BookOpen } from "lucide-react";
import SavePinLogo from "./SavePinLogo";

interface OnboardingProps {
  onComplete: () => void;
  onSelectCategory: (category: "physical" | "verbal" | "kdrt" | "cyber") => void;
  language: "id" | "en";
  setLanguage: (lang: "id" | "en") => void;
  slideIndex: number;
  setSlideIndex: (idx: number) => void;
}

interface EduSegment {
  text: string;
  factId?: string;
}

interface FactDetail {
  title: string;
  source: string;
  description: string;
}

// ==========================================
// INDONESIAN DATA & REFERENCES
// ==========================================
const PHYS_GAMBARAN_ID: EduSegment[] = [
  { text: "Kekerasan fisik adalah salah satu bentuk pelanggaran HAM paling umum di Indonesia", factId: "phys_ham" },
  { text: ", namun mayoritas korban tidak melapor karena takut, malu, atau tidak tahu harus ke mana. " },
  { text: "Survei BPS 2021 menunjukkan bahwa 1 dari 4 perempuan di Indonesia pernah mengalami kekerasan fisik dalam hidupnya", factId: "phys_bps" },
  { text: ". Yang lebih memprihatinkan, " },
  { text: "hanya 35% korban kekerasan fisik yang mencari bantuan profesional", factId: "phys_help" },
  { text: " — sisanya menanggung sendiri atau bergantung pada dukungan keluarga yang sering kali tidak memadai." }
];

const PHYS_KONTEKS_ID: EduSegment[] = [
  { text: "Data Komnas Perempuan 2023 mencatat 339.782 kasus kekerasan terhadap perempuan", factId: "phys_komnas" },
  { text: ", naik signifikan dari tahun sebelumnya. Angka ini diyakini hanya sebagian kecil dari kasus nyata, karena " },
  { text: "tingkat under-reporting kekerasan di Indonesia diperkirakan mencapai 65-70%", factId: "phys_under" },
  { text: ". Hambatan pelaporan terbesar adalah rasa malu, ketakutan pada pelaku, dan " },
  { text: "kurangnya pengetahuan tentang hak korban dan mekanisme perlindungan yang tersedia", factId: "phys_rights" },
  { text: "." }
];

const VERB_GAMBARAN_ID: EduSegment[] = [
  { text: "Kekerasan verbal sering kali tidak meninggalkan bekas fisik, namun " },
  { text: "luka psikologis yang ditimbulkan bisa bertahan seumur hidup", factId: "verb_scars" },
  { text: ". Gaslighting, hinaan konstan, dan ancaman verbal dapat merusak harga diri secara ekstrem. Penelitian menunjukkan bahwa " },
  { text: "90% korban kekerasan fisik juga mengalami kekerasan verbal sebelumnya", factId: "verb_redflag" },
  { text: ", menjadikannya tanda bahaya awal (red flag) yang sangat krusial untuk disadari." }
];

const VERB_KONTEKS_ID: EduSegment[] = [
  { text: "Masyarakat sering menganggap remeh pertengkaran verbal sebagai 'bumbu hubungan'. Namun, " },
  { text: "Komnas Perempuan menegaskan kekerasan psikis menempati peringkat tertinggi kedua kasus kekerasan", factId: "verb_komnas" },
  { text: ". Sayangnya, " },
  { text: "hukum pidana Indonesia (UU PKDRT) masih sulit menjerat pelaku kekerasan psikis", factId: "verb_law" },
  { text: " karena rumitnya pembuktian medis terkait trauma kejiwaan dari psikiater." }
];

const KDRT_GAMBARAN_ID: EduSegment[] = [
  { text: "KDRT adalah fenomena gunung es karena dianggap sebagai 'aib keluarga' yang harus ditutupi. Pelaku biasanya adalah pasangan atau anggota keluarga terdekat. " },
  { text: "Hukum Indonesia melindunginya melalui UU No. 23 Tahun 2004 tentang PKDRT", factId: "kdrt_law" },
  { text: ", namun penegakan hukum sering terhambat oleh mediasi paksaan keluarga. Korban sering terjebak dalam " },
  { text: "lingkaran kekerasan (cycle of violence)", factId: "kdrt_cycle" },
  { text: " yang membuat mereka kembali ke pelaku berkali-kali." }
];

const KDRT_KONTEKS_ID: EduSegment[] = [
  { text: "Di Indonesia, " },
  { text: "kasus KDRT mendominasi laporan kekerasan terhadap perempuan di ranah privat (mencapai 70%)", factId: "kdrt_dominate" },
  { text: ". Sayangnya, " },
  { text: "banyak korban terhambat melapor karena ketergantungan ekonomi", factId: "kdrt_depend" },
  { text: " pada pelaku atau takut kehilangan hak asuh anak. SafeMap hadir untuk menghubungkan korban dengan " },
  { text: "rumah aman (shelter) rahasia dan LBH gratis", factId: "kdrt_shelter" },
  { text: " untuk perlindungan darurat tanpa biaya." }
];

const CYBER_GAMBARAN_ID: EduSegment[] = [
  { text: "Kekerasan Berbasis Gender Online (KBGO) meningkat sangat pesat seiring ketergantungan digital. Bentuknya berkisar dari penguntitan digital (cyberstalking) hingga " },
  { text: "pemerasan dengan ancaman penyebaran foto intim (non-consensual intimate image sharing / sextortion)", factId: "cyber_kbgo" },
  { text: ". Dampaknya sangat merusak kesehatan mental korban, memicu isolasi sosial hingga pikiran bunuh diri." }
];

const CYBER_KONTEKS_ID: EduSegment[] = [
  { text: "Di Indonesia, " },
  { text: "Laporan SAFEnet mencatat lonjakan kasus KBGO hingga ratusan persen dalam beberapa tahun terakhir", factId: "cyber_surge" },
  { text: ". Regulasi di Indonesia, khususnya " },
  { text: "UU ITE, sering kali disalahgunakan untuk mengkriminalisasi korban", factId: "cyber_ite" },
  { text: " dengan pasal pencemaran nama baik jika korban menceritakannya ke publik. Sangat krusial bagi korban untuk " },
  { text: "mengamankan barang bukti digital (screenshot, link) dan mencari bantuan hukum", factId: "cyber_evidence" },
  { text: " daripada menghapusnya langsung." }
];

const FACTS_DETAILS_ID: Record<string, FactDetail> = {
  phys_ham: {
    title: "Hak Bebas dari Kekerasan",
    source: "Pasal 28G UUD 1945 & UU HAM No. 39 Tahun 1999",
    description: "Setiap orang berhak atas perlindungan diri pribadi, keluarga, kehormatan, martabat, dan hak milik, serta berhak atas rasa aman dan perlindungan dari ancaman ketakutan untuk berbuat atau tidak berbuat sesuatu yang merupakan hak asasi."
  },
  phys_bps: {
    title: "Survei Pengalaman Hidup Perempuan",
    source: "Survei BPS & Kementerian PPPA 2021",
    description: "Survei Pengalaman Hidup Perempuan Nasional (SPHPN) menunjukkan prevalensi kekerasan fisik dan/atau seksual terhadap perempuan oleh pasangan atau selain pasangan selama hidupnya mencapai 26,1% (sekitar 1 dari 4 perempuan)."
  },
  phys_help: {
    title: "Mencari Bantuan Profesional",
    source: "Kementerian PPPA / UNFPA Indonesia",
    description: "Hanya sebagian kecil penyintas kekerasan yang berani melapor atau mencari bantuan layanan medis, psikologis, atau hukum karena kuatnya stigma sosial, rasa bersalah yang diinternalisasi, atau ancaman kekerasan lanjutan dari pelaku."
  },
  phys_komnas: {
    title: "Catatan Tahunan Komnas Perempuan",
    source: "CATAHU Komnas Perempuan 2023",
    description: "Komnas Perempuan menerima ratusan ribu aduan kekerasan setiap tahunnya. Sebagian besar kasus terjadi di ranah personal/privat (KDRT dan relasi intim), yang menunjukkan bahwa rumah sering kali menjadi tempat yang paling tidak aman bagi korban."
  },
  phys_under: {
    title: "Fenomena Gunung Es (Under-reporting)",
    source: "Studi Kriminologi Universitas Indonesia",
    description: "Kasus kekerasan yang tercatat secara resmi hanyalah puncak gunung es. Diperkirakan 65-70% kasus tidak pernah dilaporkan karena berbagai hambatan sistemik, psikologis, sosial-budaya, dan minimnya akses layanan di daerah terpencil."
  },
  phys_rights: {
    title: "Hak Korban Kekerasan",
    source: "UU TPKS No. 12 Tahun 2022 & UU PKDRT No. 23 Tahun 2004",
    description: "Korban kekerasan berhak atas penanganan, pelindungan, dan pemulihan sejak adanya laporan. Ini mencakup hak atas penyediaan layanan kesehatan, bimbingan mental-spiritual, pendampingan hukum, ganti rugi (restitusi), dan shelter rahasia."
  },
  verb_scars: {
    title: "Dampak Trauma Verbal",
    source: "Ikatan Psikolog Klinis (IPK) Indonesia",
    description: "Pelecehan verbal dan emosional kronis mengaktifkan sistem respons stres otak secara konstan. Hal ini dapat mengecilkan hipokampus (pusat memori) dan merusak amigdala, memicu kecemasan kronis, depresi, PTSD, dan penurunan fungsi kognitif."
  },
  verb_redflag: {
    title: "Hubungan Antara Kekerasan Verbal & Fisik",
    source: "World Health Organization (WHO) Multi-country Study",
    description: "Kekerasan fisik hampir tidak pernah terjadi secara tiba-tiba tanpa adanya eskalasi. Kekerasan verbal, hinaan, kontrol posesif ekstrem, dan intimidasi emosional adalah tanda bahaya awal (red flag) yang mendahului serangan fisik."
  },
  verb_komnas: {
    title: "Statistik Kekerasan Psikis",
    source: "Laporan Pengaduan Komnas Perempuan",
    description: "Kekerasan psikis/verbal konsisten menempati urutan kedua teratas jenis kekerasan yang paling banyak diadukan. Dampaknya yang tidak kasat mata sering kali membuat korban meragukan realitas mereka sendiri (gaslighting)."
  },
  verb_law: {
    title: "Pembuktian Hukum Kekerasan Psikis",
    source: "Pasal 45 UU PKDRT No. 23 Tahun 2004",
    description: "Kekerasan psikis diancam pidana penjara paling lama 3 tahun. Namun, pembuktian hukum membutuhkan 'Visum et Repertum Psikiatrikum' dari dokter spesialis jiwa/psikiater forensik untuk membuktikan adanya trauma psikologis atau ketakutan hebat."
  },
  kdrt_law: {
    title: "UU Penghapusan KDRT",
    source: "UU RI No. 23 Tahun 2004",
    description: "Undang-undang ini adalah terobosan hukum yang menegaskan bahwa kekerasan dalam rumah tangga bukanlah wilayah privat melainkan kejahatan pidana. Negara wajib memberikan perlindungan, membatasi pelaku, dan menindak secara hukum."
  },
  kdrt_cycle: {
    title: "Siklus Kekerasan (Cycle of Violence)",
    source: "Lenore Walker's Psychological Theory",
    description: "Siklus ini terdiri dari 3 fase berulang: 1) Penumpukan Ketegangan (argumen kecil, dingin), 2) Insiden Ledakan (serangan fisik/verbal berat), 3) Fase Honeymoon (pelaku meminta maaf, berjanji berubah, bersikap manis). Siklus ini membuat korban sulit melepaskan diri secara emosional."
  },
  kdrt_dominate: {
    title: "Kekerasan di Ranah Privat",
    source: "Kementerian PPPA / SIMFONI PPA 2023",
    description: "Sistem Informasi Online Perlindungan Perempuan dan Anak mencatat bahwa KDRT (khususnya terhadap istri) mendominasi lebih dari 70% laporan kekerasan seksual, fisik, dan emosional di ranah privat di Indonesia."
  },
  kdrt_depend: {
    title: "Ketergantungan Ekonomi & Eksploitasi",
    source: "Studi Jurnal Perempuan Indonesia",
    description: "Banyak penyintas terpaksa bertahan dalam hubungan abusif karena pelaku membatasi akses mereka terhadap uang atau pekerjaan (kekerasan ekonomi). Hal ini menimbulkan ketakutan tidak bisa menghidupi anak-anak jika mereka pergi."
  },
  kdrt_shelter: {
    title: "Fungsi Rumah Aman (Shelter)",
    source: "Yayasan Pulih & Dinas Sosial DKI Jakarta",
    description: "Rumah Aman (Shelter) adalah tempat bernaung sementara yang dirahasiakan lokasinya untuk melindungi korban dari kejaran atau ancaman pelaku. Layanan ini menyediakan tempat tinggal layak, makanan, konseling krisis, dan pengamanan 24 jam gratis."
  },
  cyber_kbgo: {
    title: "Kekerasan Berbasis Gender Online (KBGO)",
    source: "Southeast Asia Freedom of Expression Network (SAFEnet)",
    description: "KBGO mencakup segala bentuk pelecehan digital, intimidasi siber, doxxing (penyebaran data pribadi), penguntitan siber (cyberstalking), serta penyebaran atau ancaman penyebaran foto/video intim tanpa persetujuan korban (sextortion)."
  },
  cyber_surge: {
    title: "Lonjakan Kejahatan Digital",
    source: "Aduan KBGO Komnas Perempuan & SAFEnet",
    description: "Seiring penetrasi internet yang masif, aduan KBGO melonjak lebih dari 300% dalam beberapa tahun terakhir. Remaja dan perempuan muda menjadi target utama pemerasan berbasis seksual online (sextortion)."
  },
  cyber_ite: {
    title: "Tantangan UU ITE & UU TPKS",
    source: "Lembaga Bantuan Hukum (LBH) Jakarta",
    description: "Sebelum adanya UU TPKS No. 12 Tahun 2022, korban KBGO sering dikriminalisasi balik menggunakan UU ITE dengan tuduhan menyebarkan muatan asusila. UU TPKS kini memperkuat posisi korban, menegaskan penyebaran konten intim tanpa izin sebagai tindak pidana murni."
  },
  cyber_evidence: {
    title: "Metode Pengamanan Bukti Digital",
    source: "Panduan Keamanan Digital SAFEnet",
    description: "Bukti digital mudah dihapus atau dimanipulasi. Jangan terburu-buru menghapus akun. Amankan tangkapan layar (screenshot) utuh, simpan link URL profil pelaku, nomor telepon, metadata foto, serta backup ke folder cloud pribadi yang terkunci sandi."
  }
};

// ==========================================
// ENGLISH DATA & REFERENCES
// ==========================================
const PHYS_GAMBARAN_EN: EduSegment[] = [
  { text: "Physical violence is one of the most common forms of human rights violations in Indonesia", factId: "phys_ham" },
  { text: ", yet the majority of victims do not report due to fear, shame, or not knowing where to go. " },
  { text: "BPS Survey 2021 shows that 1 in 4 women in Indonesia has experienced physical violence in her lifetime", factId: "phys_bps" },
  { text: ". Even more concerning, " },
  { text: "only 35% of physical violence victims seek professional help", factId: "phys_help" },
  { text: " — the rest bear it alone or rely on often inadequate family support." }
];

const PHYS_KONTEKS_EN: EduSegment[] = [
  { text: "Komnas Perempuan 2023 data recorded 339,782 cases of violence against women", factId: "phys_komnas" },
  { text: ", a significant increase from previous years. This number is believed to represent only a small fraction of actual cases, as " },
  { text: "the under-reporting rate of violence in Indonesia is estimated at 65-70%", factId: "phys_under" },
  { text: ". The biggest barriers to reporting are shame, fear of retaliation, and " },
  { text: "lack of knowledge about victim rights and available protection mechanisms", factId: "phys_rights" },
  { text: "." }
];

const VERB_GAMBARAN_EN: EduSegment[] = [
  { text: "Verbal abuse often leaves no physical marks, but " },
  { text: "the psychological scars left behind can last a lifetime", factId: "verb_scars" },
  { text: ". Gaslighting, constant insults, and verbal threats can extremely damage self-esteem. Studies show that " },
  { text: "90% of physical abuse victims also experienced verbal abuse beforehand", factId: "verb_redflag" },
  { text: ", making it a highly crucial early red flag to recognize." }
];

const VERB_KONTEKS_EN: EduSegment[] = [
  { text: "Society often downplays verbal arguments as mere 'relationship drama'. However, " },
  { text: "Komnas Perempuan reports psychological abuse is the second highest reported category", factId: "verb_komnas" },
  { text: ". Unfortunately, " },
  { text: "Indonesian criminal law (UU PKDRT) still struggles to prosecute psychological abuse", factId: "verb_law" },
  { text: " due to the high burden of proving psychiatric trauma." }
];

const KDRT_GAMBARAN_EN: EduSegment[] = [
  { text: "KDRT is an iceberg phenomenon because it is often treated as a private family matter to be hidden. The perpetrator is usually a spouse or immediate family member. " },
  { text: "Indonesian law protects victims under Law No. 23 of 2004 on PKDRT", factId: "kdrt_law" },
  { text: ", but enforcement is often hindered by forced family mediation. Victims are often trapped in the " },
  { text: "cycle of violence", factId: "kdrt_cycle" },
  { text: " making them return to the abuser multiple times." }
];

const KDRT_KONTEKS_EN: EduSegment[] = [
  { text: "In Indonesia, " },
  { text: "KDRT cases dominate reports of violence against women in the private domain (up to 70%)", factId: "kdrt_dominate" },
  { text: ". Unfortunately, " },
  { text: "many victims are hindered from reporting due to financial dependency", factId: "kdrt_depend" },
  { text: " on the perpetrator or fear of losing custody. SafeMap connects victims with " },
  { text: "secret safe houses (shelters) and free legal aid", factId: "kdrt_shelter" },
  { text: " for free, anonymous emergency protection." }
];

const CYBER_GAMBARAN_EN: EduSegment[] = [
  { text: "Online Gender-Based Violence (KBGO) has risen rapidly with digital dependency. It ranges from cyberstalking to " },
  { text: "extortion with threats of sharing intimate photos (non-consensual intimate image sharing / sextortion)", factId: "cyber_kbgo" },
  { text: ". Its impact is highly damaging to mental health, causing social isolation and suicidal ideation." }
];

const CYBER_KONTEKS_EN: EduSegment[] = [
  { text: "In Indonesia, " },
  { text: "SAFEnet reports record a massive surge of hundreds of percent in KBGO cases over recent years", factId: "cyber_surge" },
  { text: ". In Indonesia, " },
  { text: "the UU ITE is unfortunately sometimes misused to criminalize victims", factId: "cyber_ite" },
  { text: " with defamation charges if they speak out. It is absolutely crucial to " },
  { text: "secure digital evidence (screenshots, links) and seek professional legal support", factId: "cyber_evidence" },
  { text: " rather than simply deleting everything out of panic." }
];

const FACTS_DETAILS_EN: Record<string, FactDetail> = {
  phys_ham: {
    title: "Right to be Free from Violence",
    source: "Article 28G of 1945 Constitution & Law No. 39 of 1999 on Human Rights",
    description: "Every individual has the right to protection of their person, family, honor, dignity, and property, and the right to a sense of security and protection from threats of fear to do or not do something which is a fundamental human right."
  },
  phys_bps: {
    title: "Women's Life Experience Survey",
    source: "BPS & Ministry of PPPA 2021 Survey",
    description: "The National Women's Life Experience Survey (SPHPN) shows that the prevalence of physical and/or sexual violence against women by spouses or non-spouses during their lifetime reached 26.1% (approximately 1 in 4 women)."
  },
  phys_help: {
    title: "Seeking Professional Help",
    source: "Ministry of PPPA / UNFPA Indonesia",
    description: "Only a small fraction of violence survivors dare to report or seek professional medical, psychological, or legal help due to strong social stigma, internalized guilt, or fear of retaliatory violence from the perpetrator."
  },
  phys_komnas: {
    title: "Annual Report of Komnas Perempuan",
    source: "CATAHU Komnas Perempuan 2023",
    description: "Komnas Perempuan receives hundreds of thousands of abuse complaints annually. The vast majority of cases occur in the personal/private domain (domestic and intimate partner violence), indicating that home is often the least safe place for victims."
  },
  phys_under: {
    title: "Iceberg Phenomenon (Under-reporting)",
    source: "Criminological Study by Universitas Indonesia",
    description: "Officially recorded violence cases represent only the tip of the iceberg. An estimated 65-70% of cases are never reported due to systemic, psychological, and socio-cultural barriers, as well as a lack of safe resources."
  },
  phys_rights: {
    title: "Rights of Violence Victims",
    source: "UU TPKS No. 12 of 2022 & UU PKDRT No. 23 of 2004",
    description: "Victims of violence have the right to handling, protection, and recovery from the moment an incident is reported. This includes medical services, mental-spiritual guidance, free legal aid, restitution, and secret shelter access."
  },
  verb_scars: {
    title: "Impact of Verbal Trauma",
    source: "Association of Clinical Psychologists (IPK) Indonesia",
    description: "Chronic verbal and emotional abuse constantly activates the brain's stress response system. This can shrink the hippocampus (memory center) and damage the amygdala, triggering chronic anxiety, depression, PTSD, and cognitive decline."
  },
  verb_redflag: {
    title: "Connection Between Verbal & Physical Violence",
    source: "World Health Organization (WHO) Multi-country Study",
    description: "Physical violence rarely occurs suddenly without prior escalation. Verbal abuse, insults, extreme controlling behaviors, and emotional intimidation are vital early red flags that precede physical assaults."
  },
  verb_komnas: {
    title: "Psychological Abuse Statistics",
    source: "Komnas Perempuan Complaint Reports",
    description: "Psychological and verbal abuse consistently ranks as the second most reported form of violence. Its invisible nature often causes victims to doubt their own reality and experience severe gaslighting."
  },
  verb_law: {
    title: "Legal Proof of Psychological Violence",
    source: "Article 45 of Law No. 23 of 2004 on PKDRT",
    description: "Psychological abuse carries a penalty of up to 3 years in prison. However, legal proof requires a forensic psychiatric report (Visum et Repertum Psikiatrikum) to scientifically prove the presence of psychological trauma or extreme fear."
  },
  kdrt_law: {
    title: "Domestic Violence Elimination Law",
    source: "Indonesian Law No. 23 of 2004",
    description: "This landmark legislation establishes that domestic violence is not a private family matter but a public criminal offense. The state is obligated to provide protection, restrain perpetrators, and prosecute offenses."
  },
  kdrt_cycle: {
    title: "The Cycle of Violence",
    source: "Lenore Walker's Psychological Theory",
    description: "Abuse in relationships typically rotates in a cycle: 1) Tension Building (minor arguments, cold shoulder), 2) Acute Explosion (major physical/verbal assault), 3) Honeymoon Phase (abuser apologizes, promises change, acts loving). This cycle makes emotional escape extremely difficult."
  },
  kdrt_dominate: {
    title: "Violence in the Private Domain",
    source: "Ministry of PPPA / SIMFONI PPA 2023",
    description: "The Online Information System for Women and Children Protection records that domestic violence (especially against wives) dominates over 70% of reported private domain violence cases in Indonesia."
  },
  kdrt_depend: {
    title: "Financial Dependency & Exploitation",
    source: "Journal of Indonesian Women Studies",
    description: "Many survivors feel forced to stay in abusive relationships because the perpetrator controls or restricts their access to finances or employment (economic violence), causing fear of being unable to feed their children if they leave."
  },
  kdrt_shelter: {
    title: "Role of Safe Houses (Shelters)",
    source: "Yayasan Pulih & DKI Jakarta Social Services",
    description: "A Safe House (Shelter) is a temporary housing facility with a strictly confidential location to protect victims from perpetrators. It provides free lodging, food, crisis counseling, and 24-hour physical security."
  },
  cyber_kbgo: {
    title: "Online Gender-Based Violence (KBGO)",
    source: "Southeast Asia Freedom of Expression Network (SAFEnet)",
    description: "KBGO includes digital harassment, cyberbullying, doxxing (unauthorized personal data exposure), cyberstalking, and the non-consensual distribution or threat of distributing intimate media (sextortion)."
  },
  cyber_surge: {
    title: "Surge of Digital Crimes",
    source: "SAFEnet & Komnas Perempuan KBGO Data",
    description: "Along with massive internet penetration, reports of online gender-based violence have jumped over 300% in recent years. Teenagers and young women are primary targets of online sextortion."
  },
  cyber_ite: {
    title: "UU ITE and UU TPKS Challenges",
    source: "Legal Aid Institute (LBH) Jakarta",
    description: "Prior to Law No. 12 of 2022 on TPKS, KBGO victims were often counter-prosecuted under UU ITE for distributing 'indecent content'. The TPKS Law now protects victims, establishing the sharing of intimate media without consent as a clear criminal act."
  },
  cyber_evidence: {
    title: "Securing Digital Evidence Safely",
    source: "SAFEnet Digital Security Guide",
    description: "Digital evidence is easily deleted or manipulated. Do not rush to delete accounts. Secure full screenshots showing dates, times, perpetrator profile URLs, phone numbers, media metadata, and back up to a password-locked private cloud folder."
  }
};

export default function Onboarding({
  onComplete,
  onSelectCategory,
  language,
  setLanguage,
  slideIndex,
  setSlideIndex,
}: OnboardingProps) {
  const strings = language === "en" ? EN_STRINGS : ID_STRINGS;
  const totalSlides = 5;
  const slidesArray = Array.from({ length: totalSlides });

  // State managers
  const [viewingQuestionnaire, setViewingQuestionnaire] = useState(false);
  const [viewingEducation, setViewingEducation] = useState(false);
  const [selectedEduCategory, setSelectedEduCategory] = useState<"physical" | "verbal" | "kdrt" | "cyber">("physical");
  const [activeFact, setActiveFact] = useState<{ title: string; source: string; description: string } | null>(null);

  const handleNext = () => {
    if (slideIndex < totalSlides - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      setViewingEducation(true);
    }
  };

  const handleSkipIntro = () => {
    onComplete();
  };

  const handlePrev = () => {
    if (viewingQuestionnaire) {
      setViewingQuestionnaire(false);
      setViewingEducation(true);
    } else if (viewingEducation) {
      setViewingEducation(false);
      setSlideIndex(totalSlides - 1);
    } else if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  };

  // Render illustrative icons per slide
  const renderSlideIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Shield className="w-16 h-16 text-[#7FA396]" />;
      case 1:
        return <AlertOctagon className="w-16 h-16 text-[#E0703D]" />;
      case 2:
        return <BarChart3 className="w-16 h-16 text-[#C9A66B]" />;
      case 3:
        return <Smartphone className="w-16 h-16 text-[#7FA396]" />;
      default:
        return <Shield className="w-16 h-16 text-[#7FA396]" />;
    }
  };

  // Education Category Dictionary
  const eduCategories = [
    {
      id: "physical" as const,
      icon: "👊",
      name: language === "en" ? "Physical" : "Fisik",
      title: language === "en" ? "Physical Violence" : "Kekerasan Fisik",
      desc: language === "en" 
        ? "Act of intentionally hurting someone's body — hitting, kicking, strangling, or other physical actions causing injury."
        : "Tindakan menyakiti tubuh orang lain secara sengaja — memukul, menendang, mencekik, atau tindakan fisik lain yang menyebabkan cedera.",
      gambaranUmum: language === "en" ? PHYS_GAMBARAN_EN : PHYS_GAMBARAN_ID,
      tandaTanda: language === "en"
        ? [
            "Unexplained bruises, cuts, or injuries that lack a reasonable explanation",
            "Wearing long/heavy clothing even in hot weather to hide wounds or injuries",
            "Appearing fearful, jumpy, or anxious around specific individuals",
            "Avoiding eye contact and withdrawing from social interactions and friendships",
            "Frequent unexplained absences from school, university, or work"
          ]
        : [
            "Memar, luka, atau cedera yang tidak bisa dijelaskan dengan masuk akal",
            "Sering mengenakan pakaian tertutup meski cuaca panas untuk menyembunyikan luka",
            "Terlihat ketakutan atau gelisah saat ada orang tertentu di sekitarnya",
            "Menghindari kontak mata dan tampak menarik diri dari pergaulan sosial",
            "Sering absen dari sekolah atau tempat kerja tanpa alasan yang jelas"
          ],
      konteks: language === "en" ? PHYS_KONTEKS_EN : PHYS_KONTEKS_ID,
    },
    {
      id: "verbal" as const,
      icon: "🗣️",
      name: language === "en" ? "Verbal" : "Verbal",
      title: language === "en" ? "Verbal & Psychological Abuse" : "Kekerasan Verbal & Psikis",
      desc: language === "en"
        ? "Acts of demeaning, intimidating, manipulating, or terrorizing someone's mental state through persistent verbal actions."
        : "Tindakan merendahkan, mengintimidasi, memanipulasi, atau meneror mental seseorang melalui kata-kata secara terus-menerus.",
      gambaranUmum: language === "en" ? VERB_GAMBARAN_EN : VERB_GAMBARAN_ID,
      tandaTanda: language === "en"
        ? [
            "Drastic loss of self-confidence and constantly blaming oneself for everything",
            "Excessive anxiety, depression, or sudden extreme mood swings",
            "Frequently apologizing even for minor things that are not their fault",
            "Isolating themselves from friends and family due to isolation tactics of the abuser",
            "Feeling helplessness, worthlessness, and constantly doubting their own memory (gaslighting)"
          ]
        : [
            "Kehilangan rasa percaya diri secara drastis dan selalu menyalahkan diri sendiri",
            "Kecemasan berlebih, depresi, atau perubahan suasana hati yang ekstrem secara tiba-tiba",
            "Sering meminta maaf bahkan untuk hal-hal kecil yang bukan kesalahannya",
            "Mengisolasi diri dari teman dan keluarga karena dilarang atau diintimidasi pelaku",
            "Merasa tidak berdaya, tidak berharga, dan selalu ragu terhadap ingatan sendiri (akibat gaslighting)"
          ],
      konteks: language === "en" ? VERB_KONTEKS_EN : VERB_KONTEKS_ID,
    },
    {
      id: "kdrt" as const,
      icon: "🏠",
      name: language === "en" ? "KDRT" : "KDRT",
      title: language === "en" ? "Domestic Violence (KDRT)" : "Kekerasan Dalam Rumah Tangga (KDRT)",
      desc: language === "en"
        ? "Any form of abuse (physical, sexual, psychological, or economic neglect) occurring within a household or family environment."
        : "Segala bentuk kekerasan (fisik, seksual, psikis, atau penelantaran ekonomi) yang terjadi di dalam lingkup rumah tangga atau keluarga.",
      gambaranUmum: language === "en" ? KDRT_GAMBARAN_EN : KDRT_GAMBARAN_ID,
      tandaTanda: language === "en"
        ? [
            "Fully controlled by the spouse (finances, social life, clothing, personal decisions)",
            "Experiencing repeated physical injuries attributed to 'clumsiness' or 'household accidents'",
            "Drastic withdrawal from social circles after marriage or moving in together",
            "Spouse exhibiting extreme jealousy and abnormal possessiveness",
            "Appearing highly anxious, depressed, or fearful when responding to calls or texts from their spouse"
          ]
        : [
            "Dikontrol secara penuh oleh pasangan (keuangan, pergaulan, pakaian, hingga keputusan pribadi)",
            "Mengalami cedera fisik yang berulang dengan alasan 'terjatuh' atau 'kecelakaan rumah tangga'",
            "Menarik diri dari lingkaran sosial secara drastis setelah menikah atau tinggal bersama",
            "Pasangan menunjukkan kecemburuan ekstrem dan sikap posesif yang tidak wajar",
            "Sering terlihat cemas, depresi, atau ketakutan saat merespons telepon atau pesan dari pasangan"
          ],
      konteks: language === "en" ? KDRT_KONTEKS_EN : KDRT_KONTEKS_ID,
    },
    {
      id: "cyber" as const,
      icon: "💻",
      name: language === "en" ? "Cyber" : "Cyber",
      title: language === "en" ? "Cyberbullying & Digital Abuse" : "Cyberbullying & Kekerasan Siber",
      desc: language === "en"
        ? "Intimidation, harassment, spreading rumors, extortion, or non-consensual distribution of private media (KBGO) through digital channels."
        : "Intimidasi, pelecehan, penyebaran rumor, pemerasan, atau penyebaran konten pribadi tanpa izin (KBGO) melalui media digital.",
      gambaranUmum: language === "en" ? CYBER_GAMBARAN_EN : CYBER_GAMBARAN_ID,
      tandaTanda: language === "en"
        ? [
            "Sudden avoidance of digital devices or conversely, obsessive anxious checking of their phone",
            "Abruptly deleting social media accounts or completely restricting online interactions",
            "Appearing highly stressed, anxious, or angry after being online or receiving notifications",
            "Experiencing doxxing (private data leaks) or persistent stalking across various digital platforms",
            "Facing financial or emotional blackmail with threats of distributing sensitive private content"
          ]
        : [
            "Menghindari perangkat digital secara tiba-tiba atau sebaliknya, menjadi sangat terobsesi memeriksa ponsel dengan wajah cemas",
            "Menghapus akun media sosial secara mendadak atau membatasi interaksi digital sepenuhnya",
            "Terlihat sangat stres, cemas, atau marah setelah online atau menerima notifikasi pesan",
            "Mengalami kebocoran data pribadi (doxxing) atau penguntitan terus-menerus di berbagai platform online",
            "Mengalami pemerasan finansial atau emosional dengan ancaman penyebaran konten pribadi sensitif"
          ],
      konteks: language === "en" ? CYBER_KONTEKS_EN : CYBER_KONTEKS_ID,
    }
  ];

  const activeEduCat = eduCategories.find((c) => c.id === selectedEduCategory);

  const renderSegments = (segments: EduSegment[]) => {
    return segments.map((seg, idx) => {
      if (seg.factId) {
        return (
          <button
            key={idx}
            type="button"
            onClick={() => {
              const fact = language === "en" ? FACTS_DETAILS_EN[seg.factId!] : FACTS_DETAILS_ID[seg.factId!];
              if (fact) {
                setActiveFact({
                  title: fact.title,
                  source: fact.source,
                  description: fact.description
                });
              }
            }}
            className="text-[#E0703D] hover:text-[#F3814E] font-medium transition-all underline decoration-dotted underline-offset-4 cursor-pointer hover:bg-white/5 px-1 py-0.5 rounded text-left inline"
          >
            {seg.text}
          </button>
        );
      }
      return <span key={idx} className="text-[#B8C2BC]">{seg.text}</span>;
    });
  };

  return (
    <div className="fixed inset-0 bg-[#1B2620] z-40 flex flex-col items-center justify-center p-6 overflow-hidden">
      
      {/* Background Atmosphere Blur Circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#7FA396]/15 rounded-full filter blur-[100px] pointer-events-none animate-glow-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#C9A66B]/10 rounded-full filter blur-[120px] pointer-events-none animate-glow-slower"></div>

      {/* Dynamic Main Container (width scales beautifully for education screen) */}
      <div className={`w-full ${viewingEducation ? "max-w-3xl" : "max-w-[540px]"} h-full flex flex-col justify-between relative z-10 transition-all duration-300`}>
        
        {/* Onboarding Header with persistent language toggle & desktop actions */}
        <div className="flex items-center justify-between pt-4 pb-2 w-full shrink-0">
          <div className="flex items-center gap-2">
            <SavePinLogo size="sm" />
            <span className="font-display font-bold text-lg tracking-tight text-[#F0EEE8]">SafeMap</span>
          </div>
          
          <div className="flex items-center gap-2">
            {viewingEducation && (
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewingQuestionnaire(true);
                    setViewingEducation(false);
                  }}
                  className="px-2.5 py-1 bg-[#1C2521]/80 border border-white/5 text-xs text-[#B8C2BC] hover:text-[#7FA396] hover:border-[#7FA396]/30 font-semibold rounded-lg flex items-center gap-1 active:scale-95 transition-all"
                >
                  <span className="text-[10px]">📄</span>
                  <span>{language === "en" ? "Quiz" : "Kuesioner"}</span>
                </button>
                <button
                  type="button"
                  onClick={onComplete}
                  className="px-2.5 py-1 bg-[#7FA396]/15 border border-[#7FA396]/20 text-xs text-[#7FA396] hover:bg-[#7FA396] hover:text-[#1B2620] font-bold rounded-lg flex items-center gap-1 active:scale-95 transition-all"
                >
                  <span className="text-[10px]">🗺️</span>
                  <span>{language === "en" ? "Open Map" : "Buka Peta"}</span>
                </button>
              </div>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "id" ? "en" : "id")}
              className="px-3 py-1.5 rounded-full text-xs font-semibold glass-panel text-[#F0EEE8] hover:text-[#7FA396] transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>🌐</span>
              <span>{language === "id" ? "ID | EN" : "EN | ID"}</span>
            </button>
          </div>
        </div>

        {/* Slide Content Box */}
        <div className="flex-1 flex flex-col items-center justify-center my-6 min-h-0 relative">
          <AnimatePresence mode="wait">
            {!viewingQuestionnaire && !viewingEducation ? (
              <motion.div
                key={`slide-${slideIndex}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full flex flex-col items-center text-center relative px-4"
              >
                {slideIndex === 0 && (
                  <div className="flex flex-col items-center justify-center animate-fade-in py-4">
                    <span className="font-mono tracking-widest text-[#7FA396] text-[11px] sm:text-xs font-extrabold mb-4 uppercase">
                      {language === "en" ? "WELCOME" : "SELAMAT DATANG"}
                    </span>
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
                      <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-[#F0EEE8] tracking-tight">
                        SafeMap
                      </h2>
                      <SavePinLogo size="lg" className="hover:scale-105 transition-transform" />
                    </div>
                    <p className="text-[#B8C2BC] text-sm sm:text-base leading-relaxed max-w-[420px] font-sans">
                      {language === "en" ? (
                        <>
                          An interactive map platform that helps survivors of violence find the nearest{" "}
                          <span className="text-[#7FA396] font-semibold">shelter</span>,{" "}
                          <span className="text-[#7FA396] font-semibold">legal aid</span>,{" "}
                          <span className="text-[#7FA396] font-semibold">clinics</span>, and{" "}
                          <span className="text-[#7FA396] font-semibold">support communities</span> — free, anonymous, no login required.
                        </>
                      ) : (
                        <>
                          Platform peta interaktif yang membantu penyintas kekerasan menemukan{" "}
                          <span className="text-[#7FA396] font-semibold">rumah aman (shelter)</span>,{" "}
                          <span className="text-[#7FA396] font-semibold">bantuan hukum</span>,{" "}
                          <span className="text-[#7FA396] font-semibold">klinik</span>, dan{" "}
                          <span className="text-[#7FA396] font-semibold">komunitas dukungan</span> terdekat — gratis, anonim, tanpa login.
                        </>
                      )}
                    </p>
                  </div>
                )}

                {slideIndex === 1 && (
                  <div className="flex flex-col items-center justify-center animate-fade-in w-full py-2">
                    <span className="font-mono tracking-widest text-[#7FA396] text-[10px] sm:text-[11px] font-bold mb-2 uppercase">
                      {language === "en" ? "OUR FOCUS" : "FOKUS KAMI"}
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-[#F0EEE8] mb-6">
                      {language === "en" ? "4 Types of Violence We Address" : "4 Jenis Kekerasan yang Kami Tangani"}
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-3.5 w-full mb-6 max-w-[440px]">
                      <div className="p-4.5 rounded-2xl bg-[#1C2521] border border-white/5 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#7FA396]/20 transition-all duration-300">
                        <span className="text-3xl mb-1">👊</span>
                        <span className="font-bold text-[#F0EEE8] text-xs">
                          {language === "en" ? "Physical" : "Fisik"}
                        </span>
                      </div>
                      <div className="p-4.5 rounded-2xl bg-[#1C2521] border border-white/5 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#7FA396]/20 transition-all duration-300">
                        <span className="text-3xl mb-1">🗣️</span>
                        <span className="font-bold text-[#F0EEE8] text-xs">
                          {language === "en" ? "Verbal" : "Verbal"}
                        </span>
                      </div>
                      <div className="p-4.5 rounded-2xl bg-[#1C2521] border border-white/5 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#7FA396]/20 transition-all duration-300">
                        <span className="text-3xl mb-1">🏠</span>
                        <span className="font-bold text-[#F0EEE8] text-xs">
                          {language === "en" ? "Domestic Violence" : "KDRT"}
                        </span>
                      </div>
                      <div className="p-4.5 rounded-2xl bg-[#1C2521] border border-white/5 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#7FA396]/20 transition-all duration-300">
                        <span className="text-3xl mb-1">💻</span>
                        <span className="font-bold text-[#F0EEE8] text-xs">
                          {language === "en" ? "Cyber" : "Siber"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#8A9590] leading-relaxed max-w-[380px]">
                      {language === "en"
                        ? "These four types are the most common forms of violence, yet they receive the least adequate response in Indonesia."
                        : "Keempat jenis ini adalah bentuk kekerasan yang paling umum terjadi, namun menerima penanganan yang paling minim di Indonesia."}
                    </p>
                  </div>
                )}

                {slideIndex === 2 && (
                  <div className="flex flex-col items-center justify-center animate-fade-in w-full py-2">
                    <span className="font-mono tracking-widest text-[#7FA396] text-[10px] sm:text-[11px] font-bold mb-2 uppercase">
                      {language === "en" ? "WHY THIS MATTERS" : "MENGAPA INI PENTING"}
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-[#F0EEE8] mb-6">
                      {language === "en" ? "A Real Problem, Not an Assumption" : "Masalah Nyata, Bukan Asumsi"}
                    </h2>

                    <div className="grid grid-cols-3 gap-2.5 w-full mb-6 max-w-[460px]">
                      <div className="p-4 rounded-2xl bg-[#1C2521] border border-white/5 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#7FA396]/15 transition-all duration-300">
                        <span className="font-display font-extrabold text-2xl text-[#7FA396] tracking-tight">1 : 3</span>
                        <span className="text-[9.5px] text-[#B8C2BC] leading-snug mt-1.5">
                          {language === "en" ? "Women abused" : "Perempuan rentan"}
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#1C2521] border border-white/5 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#7FA396]/15 transition-all duration-300">
                        <span className="font-display font-extrabold text-2xl text-[#7FA396] tracking-tight">65%</span>
                        <span className="text-[9.5px] text-[#B8C2BC] leading-snug mt-1.5">
                          {language === "en" ? "Unreported" : "Tak melapor"}
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#1C2521] border border-white/5 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#7FA396]/15 transition-all duration-300">
                        <span className="font-display font-extrabold text-2xl text-[#7FA396] tracking-tight">3x</span>
                        <span className="text-[9.5px] text-[#B8C2BC] leading-snug mt-1.5">
                          {language === "en" ? "Risk in crisis" : "Risiko krisis"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#8A9590] leading-relaxed max-w-[380px]">
                      {language === "en"
                        ? "2023 Komnas Perempuan data shows violence rates keep rising every year, while access to help remains very limited."
                        : "Data Komnas Perempuan 2023 menunjukkan angka kekerasan terus meningkat setiap tahun, sementara akses bantuan masih sangat terbatas."}
                    </p>
                  </div>
                )}

                {slideIndex === 3 && (
                  <div className="flex flex-col items-center justify-center animate-fade-in w-full py-2">
                    <span className="font-mono tracking-widest text-[#7FA396] text-[10px] sm:text-[11px] font-bold mb-2 uppercase">
                      {language === "en" ? "WHY SAFEMAP" : "MENGAPA SAFEMAP"}
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-[#F0EEE8] mb-6">
                      {language === "en" ? "A Gap Nobody Has Filled" : "Celah yang Belum Terisi"}
                    </h2>

                    <div className="flex flex-col gap-3 w-full max-w-[450px] mb-2 text-left">
                      <div className="p-3.5 rounded-2xl bg-[#1C2521] border border-white/5 flex items-center gap-4 shadow-lg hover:border-[#7FA396]/15 transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-[#7FA396]/10 flex items-center justify-center text-[#7FA396] text-lg shrink-0">
                          🗺️
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#F0EEE8]">
                            {language === "en" ? "Hyperlocal Map" : "Peta Hiperlokal"}
                          </h4>
                          <p className="text-[10.5px] text-[#8A9590] leading-snug mt-0.5">
                            {language === "en" ? "Nearest shelter & legal aid from your current location" : "Hunian aman & bantuan hukum terdekat dari lokasi Anda"}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#1C2521] border border-white/5 flex items-center gap-4 shadow-lg hover:border-[#7FA396]/15 transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-[#7FA396]/10 flex items-center justify-center text-[#7FA396] text-lg shrink-0">
                          🔒
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#F0EEE8]">
                            {language === "en" ? "Zero Tracking" : "Tanpa Pelacakan"}
                          </h4>
                          <p className="text-[10.5px] text-[#8A9590] leading-snug mt-0.5">
                            {language === "en" ? "No account, no logs, and a functional Calculator mask" : "Tanpa akun, tanpa log, dilengkapi samaran Kalkulator"}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#1C2521] border border-white/5 flex items-center gap-4 shadow-lg hover:border-[#7FA396]/15 transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-[#7FA396]/10 flex items-center justify-center text-[#7FA396] text-lg shrink-0">
                          📚
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#F0EEE8]">
                            {language === "en" ? "Data-Based Education" : "Edukasi Berbasis Data"}
                          </h4>
                          <p className="text-[10.5px] text-[#8A9590] leading-snug mt-0.5">
                            {language === "en" ? "Recognize signs of abuse before it's too late with references" : "Kenali tanda kekerasan sebelum terlambat dengan rujukan"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {slideIndex === 4 && (
                  <div className="flex flex-col items-center justify-center animate-fade-in w-full py-1">
                    <span className="font-mono tracking-widest text-[#7FA396] text-[10px] sm:text-[11px] font-bold mb-2 uppercase">
                      {language === "en" ? "YOU ARE NOT ALONE" : "ANDA TIDAK SENDIRI"}
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-[#F0EEE8] mb-4">
                      {language === "en" ? "Recognize. Resist. Recover." : "Kenali. Lawan. Pulih."}
                    </h2>

                    <SavePinLogo size="xl" className="mb-4 animate-bounce-slow" />

                    <p className="text-xs text-[#B8C2BC] leading-relaxed max-w-[420px] mb-6 text-center">
                      {language === "en"
                        ? "Take control of your journey. Explore educational resources on the four types of abuse, complete a private screening questionnaire, or head straight to the map below."
                        : "Ambil kendali atas pemulihan Anda. Pelajari tanda-tanda dari empat jenis kekerasan, lakukan kuesioner skrining mandiri, atau langsung buka peta di bawah."}
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-[460px]">
                      <button
                        onClick={() => setViewingEducation(true)}
                        className="p-4 rounded-xl bg-[#1C2521] border border-white/5 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#7FA396]/30 transition-all duration-300 active:scale-[0.97] cursor-pointer"
                      >
                        <span className="text-2xl mb-1.5">📚</span>
                        <span className="font-bold text-[#F0EEE8] text-xs">
                          {language === "en" ? "Read Education" : "Mulai Belajar"}
                        </span>
                        <span className="text-[10px] text-[#8A9590] mt-1 leading-snug">
                          {language === "en" ? "Learn signs & data" : "Edukasi & data rujukan"}
                        </span>
                      </button>

                      <button
                        onClick={() => setViewingQuestionnaire(true)}
                        className="p-4 rounded-xl bg-[#1C2521] border border-white/5 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#7FA396]/30 transition-all duration-300 active:scale-[0.97] cursor-pointer"
                      >
                        <span className="text-2xl mb-1.5">📋</span>
                        <span className="font-bold text-[#F0EEE8] text-xs">
                          {language === "en" ? "Screening Quiz" : "Kuesioner Skrining"}
                        </span>
                        <span className="text-[10px] text-[#8A9590] mt-1 leading-snug">
                          {language === "en" ? "Assess your situation" : "Asesmen risiko pribadi"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : viewingEducation ? (
              <motion.div
                key="education"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full flex flex-col items-center relative max-h-full overflow-y-auto pr-1"
              >
                {/* Back Button */}
                <div className="w-full flex items-center gap-2 mb-4 self-start">
                  <button
                    onClick={handlePrev}
                    className="p-1.5 rounded-lg bg-[#1B2620]/80 hover:bg-[#2C3D34] text-[#B8C2BC] border border-white/5 active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold text-[#7FA396] uppercase tracking-wider font-mono">
                    {language === "en" ? "Back to Slides" : "Kembali ke Slides"}
                  </span>
                </div>

                {/* Header details */}
                <span className="text-[10px] tracking-[0.2em] font-extrabold text-[#7FA396] uppercase mb-1">
                  {language === "en" ? "ABUSE EDUCATION" : "EDUKASI KEKERASAN"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#F0EEE8] tracking-tight text-center leading-snug">
                  {language === "en" ? "Know Before It's Too Late" : "Kenali Sebelum Terlambat"}
                </h2>
                <p className="text-xs text-[#8A9590] text-center max-w-lg mt-2 mb-6">
                  {language === "en" 
                    ? "Clickable facts — tap colored, dotted text to view live reference data." 
                    : "Fakta yang bisa diklik — tap teks yang berwarna untuk melihat data terkini dari sumber terpercaya."}
                </p>

                {/* Horizontal Tab Selector */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
                  {eduCategories.map((cat) => {
                    const isActive = selectedEduCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedEduCategory(cat.id)}
                        className={`py-2 px-4 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all active:scale-95 ${
                          isActive
                            ? "bg-[#7FA396]/10 text-[#7FA396] border-[#7FA396]/40 shadow-md shadow-[#7FA396]/5"
                            : "bg-[#1B2620]/40 text-[#8A9590] border-white/5 hover:text-[#F0EEE8] hover:border-white/10"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Category Card Content */}
                {activeEduCat && (
                  <div className="w-full glass-panel-elevated rounded-2xl p-5 sm:p-6 text-left border border-white/5 mb-6 shadow-xl">
                    {/* Card Header Category name and brief desc */}
                    <div className="flex items-start gap-4 pb-4 border-b border-white/5 mb-5">
                      <span className="text-3xl p-3 bg-[#1B2620]/80 rounded-xl border border-white/5 shadow-inner">
                        {activeEduCat.icon}
                      </span>
                      <div>
                        <h3 className="text-lg font-display font-bold text-[#F0EEE8] tracking-tight">
                          {activeEduCat.title}
                        </h3>
                        <p className="text-xs text-[#8A9590] mt-1 leading-relaxed">
                          {activeEduCat.desc}
                        </p>
                      </div>
                    </div>

                    {/* Section 1: GAMBARAN UMUM */}
                    <div className="mb-5">
                      <h4 className="text-[10px] font-bold text-[#7FA396] uppercase tracking-wider mb-2 font-mono">
                        {language === "en" ? "GENERAL OVERVIEW" : "GAMBARAN UMUM"}
                      </h4>
                      <div className="text-xs text-[#B8C2BC] leading-relaxed font-sans bg-[#1B2620]/20 p-3.5 rounded-xl border border-white/5 whitespace-pre-line">
                        {renderSegments(activeEduCat.gambaranUmum)}
                      </div>
                    </div>

                    {/* Section 2: TANDA-TANDA */}
                    <div className="mb-5">
                      <h4 className="text-[10px] font-bold text-[#7FA396] uppercase tracking-wider mb-2 font-mono">
                        {language === "en" ? "SIGNS TO RECOGNIZE" : "TANDA-TANDA YANG PERLU DIKENALI"}
                      </h4>
                      <ul className="space-y-1.5">
                        {activeEduCat.tandaTanda.map((tanda, i) => (
                          <li key={i} className="text-xs text-[#B8C2BC] flex items-start gap-2.5 leading-relaxed">
                            <span className="text-[#E0703D] mt-1 text-[10px]">●</span>
                            <span>{tanda}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section 3: KONTEKS DI INDONESIA */}
                    <div>
                      <h4 className="text-[10px] font-bold text-[#7FA396] uppercase tracking-wider mb-2 font-mono">
                        {language === "en" ? "CONTEXT IN INDONESIA" : "KONTEKS DI INDONESIA"}
                      </h4>
                      <div className="text-xs text-[#B8C2BC] leading-relaxed font-sans bg-[#1B2620]/20 p-3.5 rounded-xl border border-white/5 whitespace-pre-line">
                        {renderSegments(activeEduCat.konteks)}
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA: Butuh Bantuan Segera? */}
                <div className="w-full glass-panel-elevated bg-[#202C26]/90 rounded-2xl p-6 text-center border border-[#7FA396]/20 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#7FA396]/5 rounded-full filter blur-xl pointer-events-none"></div>
                  <h3 className="text-base font-display font-bold text-[#F0EEE8] tracking-tight mb-1.5">
                    {language === "en" ? "Need Immediate Assistance?" : "Butuh Bantuan Segera?"}
                  </h3>
                  <p className="text-xs text-[#B8C2BC] max-w-md mx-auto leading-relaxed mb-5">
                    {language === "en"
                      ? "SafeMap provides a secure map of shelters, free legal aid (LBH), and pro-bono clinics nearest to you — completely free and anonymous."
                      : "SafeMap menyediakan peta shelter, LBH gratis, dan klinik pro-bono terdekat dari posisi kamu — gratis dan anonim."}
                  </p>

                  {/* Grid containing the two direct action buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setViewingQuestionnaire(true);
                        setViewingEducation(false);
                      }}
                      className="w-full py-3 bg-[#1C2521] hover:bg-[#25322B] text-[#7FA396] border border-[#7FA396]/20 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>📋</span>
                      <span>{language === "en" ? "Check Your Abuse Level (Questionnaire)" : "Cek Tingkat Kekerasanmu (Kuesioner)"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={onComplete}
                      className="w-full py-3 bg-[#7FA396] hover:bg-[#9DBDB0] text-[#1B2620] rounded-xl text-xs font-extrabold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-lg shadow-[#7FA396]/10 cursor-pointer"
                    >
                      <span>🗺️</span>
                      <span>{language === "en" ? "Go to SafeMap Dashboard" : "Buka SafeMap Sekarang (Dashboard)"}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="questionnaire"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full glass-panel-elevated rounded-2xl p-6 flex flex-col items-center text-center relative max-h-full overflow-y-auto"
              >
                <div className="flex items-center gap-2 self-start mb-2">
                  <button
                    onClick={handlePrev}
                    className="p-1.5 rounded-lg bg-[#1B2620]/80 hover:bg-[#2C3D34] text-[#B8C2BC] border border-white/5 active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold text-[#7FA396] uppercase tracking-wider font-mono">
                    {language === "en" ? "Back to Education" : "Kembali ke Edukasi"}
                  </span>
                </div>

                <h2 className="text-lg font-display font-extrabold text-[#F0EEE8] tracking-tight leading-snug mb-2">
                  {strings.onboarding.questionnaireTitle}
                </h2>
                
                <p className="text-xs text-[#B8C2BC] leading-relaxed font-sans max-w-[340px] mb-5">
                  {strings.onboarding.questionnaireSubtitle}
                </p>

                {/* Questionnaire Options Grid */}
                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={() => onSelectCategory("physical")}
                    className="w-full p-4 rounded-xl bg-[#202C26] hover:bg-[#2C3D34] text-left border border-white/5 hover:border-[#7FA396]/30 transition-all active:scale-[0.98] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 bg-[#1B2620] rounded-lg">👊</span>
                      <div>
                        <h4 className="text-xs font-bold text-[#F0EEE8]">
                          {language === "en" ? "Physical Violence" : "Kekerasan Fisik"}
                        </h4>
                        <p className="text-[10px] text-[#8A9590] mt-0.5">
                          {language === "en" ? "Assault, hitting, physical threats" : "Pemukulan, tamparan, ancaman fisik langsung"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#7FA396]" />
                  </button>

                  <button
                    onClick={() => onSelectCategory("verbal")}
                    className="w-full p-4 rounded-xl bg-[#202C26] hover:bg-[#2C3D34] text-left border border-white/5 hover:border-[#7FA396]/30 transition-all active:scale-[0.98] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 bg-[#1B2620] rounded-lg">🗣️</span>
                      <div>
                        <h4 className="text-xs font-bold text-[#F0EEE8]">
                          {language === "en" ? "Verbal Abuse" : "Kekerasan Verbal"}
                        </h4>
                        <p className="text-[10px] text-[#8A9590] mt-0.5">
                          {language === "en" ? "Repeated insults, gaslighting, threats" : "Hinaan berulang, pelecehan kata, intimidasi"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#7FA396]" />
                  </button>

                  <button
                    onClick={() => onSelectCategory("kdrt")}
                    className="w-full p-4 rounded-xl bg-[#202C26] hover:bg-[#2C3D34] text-left border border-white/5 hover:border-[#7FA396]/30 transition-all active:scale-[0.98] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 bg-[#1B2620] rounded-lg">🏠</span>
                      <div>
                        <h4 className="text-xs font-bold text-[#F0EEE8]">
                          {language === "en" ? "Domestic Violence (KDRT)" : "Kekerasan Dalam Rumah Tangga (KDRT)"}
                        </h4>
                        <p className="text-[10px] text-[#8A9590] mt-0.5">
                          {language === "en" ? "Abuse within family/household" : "Kekerasan fisik/psikis di lingkup keluarga"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#7FA396]" />
                  </button>

                  <button
                    onClick={() => onSelectCategory("cyber")}
                    className="w-full p-4 rounded-xl bg-[#202C26] hover:bg-[#2C3D34] text-left border border-white/5 hover:border-[#7FA396]/30 transition-all active:scale-[0.98] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 bg-[#1B2620] rounded-lg">💻</span>
                      <div>
                        <h4 className="text-xs font-bold text-[#F0EEE8]">
                          {language === "en" ? "Cyberbullying / Cyber Violence" : "Cyberbullying / Kekerasan Siber"}
                        </h4>
                        <p className="text-[10px] text-[#8A9590] mt-0.5">
                          {language === "en" ? "Online harassment, doxxing, digital threats" : "Pelecehan online, teror siber, doxxing"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#7FA396]" />
                  </button>
                </div>

                {/* Skip Questionnaire Action */}
                <button
                  onClick={onComplete}
                  className="mt-6 w-full py-3 bg-[#1C2521] hover:bg-[#25322B] text-[#7FA396] border border-[#7FA396]/20 rounded-xl text-xs font-bold transition-all active:scale-95 text-center block cursor-pointer"
                >
                  {strings.onboarding.skipQuestionnaire}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Area with Dots & Action Buttons */}
        {!viewingQuestionnaire && !viewingEducation && (
          <div className="pb-8 shrink-0 w-full">
            {/* Action Footer Grid */}
            <div className="grid grid-cols-3 items-center w-full">
              {/* Left Action (Skip or Back) */}
              <div className="justify-self-start">
                {slideIndex === 4 ? (
                  <button
                    onClick={handlePrev}
                    className="py-3 text-sm text-[#8A9590] hover:text-[#F0EEE8] font-semibold transition-colors active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <span>←</span>
                    <span>{language === "en" ? "Back" : "Kembali"}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSkipIntro}
                    className="py-3 text-sm text-[#8A9590] hover:text-[#F0EEE8] font-semibold transition-colors active:scale-95 cursor-pointer"
                  >
                    {strings.onboarding.skip}
                  </button>
                )}
              </div>

              {/* Center Slider Progress Dots */}
              <div className="justify-self-center flex gap-2">
                {slidesArray.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSlideIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      slideIndex === idx ? "w-6 bg-[#7FA396]" : "w-2.5 bg-[#2C3D34]"
                    }`}
                  />
                ))}
              </div>

              {/* Right Action (Next or Open Map) */}
              <div className="justify-self-end">
                {slideIndex === 4 ? (
                  <button
                    onClick={onComplete}
                    className="px-6 py-3 bg-[#E0703D] hover:bg-[#F0804D] text-white font-bold rounded-full text-sm shadow-lg shadow-[#E0703D]/10 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{language === "en" ? "Open Map ✓" : "Buka Peta ✓"}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-[#7FA396] hover:bg-[#9DBDB0] text-[#1B2620] font-bold rounded-full text-sm shadow-lg shadow-[#7FA396]/10 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{strings.onboarding.next}</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* FACT MODAL POPUP REFERENCE */}
      <AnimatePresence>
        {activeFact && (
          <div className="fixed inset-0 bg-[#131B17]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-[#202C26] border border-[#7FA396]/20 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setActiveFact(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#1B2620] hover:bg-[#2C3D34] text-[#8A9590] hover:text-[#F0EEE8] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 text-[#7FA396] text-xs font-bold uppercase tracking-wider mb-2">
                <Info className="w-4 h-4" />
                <span>{language === "en" ? "Fact & Reference" : "Fakta & Referensi"}</span>
              </div>
              
              <h3 className="text-base font-display font-bold text-[#F0EEE8] mb-1">
                {activeFact.title}
              </h3>
              
              <p className="text-[10px] text-[#C9A66B] font-medium font-sans mb-4">
                {language === "en" ? "Source" : "Sumber"}: {activeFact.source}
              </p>
              
              <p className="text-xs text-[#B8C2BC] leading-relaxed font-sans bg-[#1B2620]/60 p-4 rounded-xl border border-white/5">
                {activeFact.description}
              </p>
              
              <button
                onClick={() => setActiveFact(null)}
                className="mt-5 w-full py-2.5 bg-[#7FA396] hover:bg-[#9DBDB0] text-[#1B2620] font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
              >
                {language === "en" ? "I Understand" : "Mengerti"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
