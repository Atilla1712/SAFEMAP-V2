export interface QuizOption {
  textId: string; // Key in translations or direct bilingual string
  textEn: string;
  points: number;
  triggerCritical?: boolean; // If selected, can trigger auto-escalation
}

export interface QuizQuestion {
  id: string;
  questionId: string;
  textId: string; // Indonesian question
  textEn: string; // English question
  dimension: "Fisik" | "Emosional" | "Psikologis" | "Digital" | "Keamanan" | "Sosial";
  options: QuizOption[];
}

export interface QuizCategory {
  type: "physical" | "verbal" | "kdrt" | "cyber";
  nameId: string;
  nameEn: string;
  questions: QuizQuestion[];
}

export const QUIZ_DATA: QuizCategory[] = [
  {
    type: "physical",
    nameId: "Kekerasan Fisik",
    nameEn: "Physical Violence",
    questions: [
      {
        id: "p1",
        questionId: "p_q1",
        textId: "Apakah ada orang yang pernah mencubit, mencengkeram erat, atau mendorong Anda hingga kesakitan?",
        textEn: "Has anyone ever pinched, grabbed tightly, or pushed you causing physical pain?",
        dimension: "Fisik",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang (1-2 kali)", textEn: "Rarely (1-2 times)", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "p2",
        questionId: "p_q2",
        textId: "Apakah ada orang yang sengaja melempar barang ke arah Anda saat mereka marah?",
        textEn: "Has anyone intentionally thrown objects at you during an argument or fit of anger?",
        dimension: "Fisik",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "p3",
        questionId: "p_q3",
        textId: "Apakah Anda pernah dipukul, ditampar, atau ditendang oleh seseorang di sekitar Anda?",
        textEn: "Have you been punched, slapped, or kicked by someone in your immediate environment?",
        dimension: "Fisik",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2, triggerCritical: true },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      },
      {
        id: "p4",
        questionId: "p_q4",
        textId: "Apakah seseorang pernah mengancam secara fisik dengan membawa senjata tajam atau tumpul?",
        textEn: "Has someone physically threatened you with a sharp or blunt weapon?",
        dimension: "Keamanan",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2, triggerCritical: true },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      },
      {
        id: "p5",
        questionId: "p_q5",
        textId: "Apakah Anda pernah dikunci di luar rumah atau di dalam ruangan sebagai hukuman?",
        textEn: "Have you been locked out of your home or locked inside a room as a form of punishment?",
        dimension: "Keamanan",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      },
      {
        id: "p6",
        questionId: "p_q6",
        textId: "Apakah pelaku mencoba menghentikan Anda saat Anda berusaha melarikan diri atau mencari pertolongan?",
        textEn: "Has someone tried to physically stop you when you attempted to run away or seek help?",
        dimension: "Keamanan",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "p7",
        questionId: "p_q7",
        textId: "Apakah luka fisik Anda pernah diabaikan atau dilarang dibawa ke dokter/puskesmas?",
        textEn: "Have your physical injuries been ignored or have you been forbidden from visiting a doctor?",
        dimension: "Fisik",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "p8",
        questionId: "p_q8",
        textId: "Apakah Anda merasa cemas atau gemetar saat mendengar suara langkah kaki atau suara keras orang tersebut?",
        textEn: "Do you feel highly anxious or tremble when hearing footsteps or loud voices from this person?",
        dimension: "Psikologis",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "p9",
        questionId: "p_q9",
        textId: "Apakah Anda harus memakai pakaian khusus (seperti lengan panjang) untuk menutupi lebam atau memar?",
        textEn: "Have you had to wear specific clothing (e.g., long sleeves) to hide bruises or welts?",
        dimension: "Sosial",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "p10",
        questionId: "p_q10",
        textId: "Apakah Anda merasa terancam bahwa kekerasan fisik ini bisa berujung pada cedera parah atau kematian?",
        textEn: "Do you fear that this physical violence could eventually lead to severe injury or death?",
        dimension: "Keamanan",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2, triggerCritical: true },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      }
    ]
  },
  {
    type: "verbal",
    nameId: "Kekerasan Verbal & Psikis",
    nameEn: "Verbal & Psychological Violence",
    questions: [
      {
        id: "v1",
        questionId: "v_q1",
        textId: "Apakah ada orang yang sering meneriaki atau membentak Anda di depan umum maupun di dalam rumah?",
        textEn: "Does someone frequently yell or scream at you either in public or at home?",
        dimension: "Psikologis",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "v2",
        questionId: "v_q2",
        textId: "Apakah Anda sering dihina dengan sebutan kasar, merendahkan kecerdasan, atau fisik Anda?",
        textEn: "Are you frequently insulted with offensive names, mocking your intelligence or physical appearance?",
        dimension: "Emosional",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "v3",
        questionId: "v_q3",
        textId: "Apakah orang tersebut selalu menyalahkan Anda atas kegagalan atau emosi kemarahan mereka sendiri?",
        textEn: "Does this person constantly blame you for their own failures or angry outbursts?",
        dimension: "Emosional",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "v4",
        questionId: "v_q4",
        textId: "Apakah Anda diancam akan disakiti, ditinggalkan, atau dilaporkan ke polisi secara tidak berdasar?",
        textEn: "Are you threatened with physical harm, abandonment, or groundless police reports?",
        dimension: "Keamanan",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      },
      {
        id: "v5",
        questionId: "v_q5",
        textId: "Apakah Anda dipaksa menjauh atau dilarang berkomunikasi dengan keluarga dekat atau sahabat Anda?",
        textEn: "Are you forced to isolate yourself or forbidden from communicating with family or close friends?",
        dimension: "Sosial",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "v6",
        questionId: "v_q6",
        textId: "Apakah pelaku memanipulasi kenyataan sehingga Anda meragukan kewarasan atau ingatan Anda sendiri (gaslighting)?",
        textEn: "Does this person manipulate reality to make you doubt your own sanity or memory (gaslighting)?",
        dimension: "Psikologis",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "v7",
        questionId: "v_q7",
        textId: "Apakah barang-barang pribadi berharga atau hewan peliharaan Anda pernah dirusak untuk menakut-nakuti Anda?",
        textEn: "Have your valuable personal belongings or pets been damaged/harmed to intimidate you?",
        dimension: "Keamanan",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "v8",
        questionId: "v_q8",
        textId: "Apakah Anda selalu merasa seperti 'berjalan di atas pecahan kaca' (terus-menerus tegang) di dekat orang tersebut?",
        textEn: "Do you constantly feel like you are 'walking on eggshells' around this person?",
        dimension: "Psikologis",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "v9",
        questionId: "v_q9",
        textId: "Apakah prestasi atau pekerjaan Anda selalu diremehkan dan dianggap tidak bernilai oleh mereka?",
        textEn: "Are your work or personal achievements constantly belittled and treated as worthless?",
        dimension: "Emosional",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "v10",
        questionId: "v_q10",
        textId: "Apakah ancaman verbal pelaku pernah memicu pikiran Anda untuk menyakiti diri sendiri atau menyerah pada hidup?",
        textEn: "Have their verbal threats ever triggered thoughts of self-harm or giving up on life?",
        dimension: "Psikologis",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2, triggerCritical: true },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      }
    ]
  },
  {
    type: "kdrt",
    nameId: "Kekerasan Dalam Rumah Tangga (KDRT)",
    nameEn: "Domestic Violence (KDRT)",
    questions: [
      {
        id: "k1",
        questionId: "k_q1",
        textId: "Apakah pasangan Anda membatasi secara ketat akses keuangan rumah tangga hingga Anda kesulitan membeli kebutuhan pokok?",
        textEn: "Does your partner severely restrict financial access so you struggle to buy basic necessities?",
        dimension: "Sosial",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "k2",
        questionId: "k_q2",
        textId: "Apakah Anda dilarang bekerja, menempuh pendidikan, atau berdaya secara ekonomi oleh pasangan Anda?",
        textEn: "Are you forbidden from working, pursuing education, or becoming economically independent?",
        dimension: "Sosial",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "k3",
        questionId: "k_q3",
        textId: "Apakah terjadi kekerasan fisik langsung (pukulan, tendangan) di dalam rumah tangga Anda?",
        textEn: "Is there direct physical violence (punching, kicking, etc.) within your household?",
        dimension: "Fisik",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2, triggerCritical: true },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      },
      {
        id: "k4",
        questionId: "k_q4",
        textId: "Apakah pasangan Anda memaksa melakukan hubungan seksual di bawah paksaan atau ancaman?",
        textEn: "Does your partner force you into sexual relations under duress, pressure, or threat?",
        dimension: "Fisik",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2, triggerCritical: true },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      },
      {
        id: "k5",
        questionId: "k_q5",
        textId: "Apakah Anda merasa cemas dan takut bahwa kemarahan pasangan dapat membahayakan keselamatan anak-anak Anda?",
        textEn: "Are you anxious that your partner's anger might harm the safety of your children?",
        dimension: "Keamanan",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      },
      {
        id: "k6",
        questionId: "k_q6",
        textId: "Apakah pasangan Anda menyita dokumen penting seperti KTP, buku nikah, atau sertifikat untuk menahan Anda?",
        textEn: "Does your partner confiscate vital documents like IDs, marriage certificates, or passports to trap you?",
        dimension: "Keamanan",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "k7",
        questionId: "k_q7",
        textId: "Apakah Anda dilarang menemui orang tua atau kerabat dekat tanpa alasan rasional?",
        textEn: "Are you forbidden from visiting your parents or close relatives without rational reasons?",
        dimension: "Sosial",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "k8",
        questionId: "k_q8",
        textId: "Apakah pasangan Anda sering menuduh Anda berselingkuh secara berlebihan tanpa bukti apapun?",
        textEn: "Does your partner frequently accuse you of cheating obsessively without any evidence?",
        dimension: "Psikologis",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "k9",
        questionId: "k_q9",
        textId: "Apakah terjadi penghancuran barang rumah tangga (gelas, piring, pintu dijebol) saat pertengkaran?",
        textEn: "Are household objects smashed or doors broken down during domestic arguments?",
        dimension: "Keamanan",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "k10",
        questionId: "k_q10",
        textId: "Apakah Anda pernah dipaksa keluar rumah di malam hari tanpa membawa uang atau ponsel?",
        textEn: "Have you been forced out of the house at night without money, key, or your phone?",
        dimension: "Keamanan",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2, triggerCritical: true },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      }
    ]
  },
  {
    type: "cyber",
    nameId: "Kekerasan Siber / Cyberbullying",
    nameEn: "Cyberbullying / Cyber Violence",
    questions: [
      {
        id: "c1",
        questionId: "c_q1",
        textId: "Apakah ada orang yang membanjiri akun media sosial Anda dengan pesan teror, hinaan, atau ancaman berulang?",
        textEn: "Has someone flooded your social media accounts with constant threatening, harassing, or insulting messages?",
        dimension: "Digital",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "c2",
        questionId: "c_q2",
        textId: "Apakah informasi pribadi Anda (seperti alamat rumah, nomor HP, tempat kerja) disebarkan secara online tanpa izin (doxxing)?",
        textEn: "Has your private info (address, phone number, workplace) been spread online without consent (doxxing)?",
        dimension: "Digital",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      },
      {
        id: "c3",
        questionId: "c_q3",
        textId: "Apakah ada orang yang mengancam akan menyebarkan foto atau video pribadi intim Anda (revenge porn)?",
        textEn: "Has someone threatened to distribute intimate photos or videos of you (revenge porn)?",
        dimension: "Keamanan",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2, triggerCritical: true },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      },
      {
        id: "c4",
        questionId: "c_q4",
        textId: "Apakah password email atau akun media sosial Anda pernah diretas/diambil alih paksa untuk memata-matai Anda?",
        textEn: "Has someone hacked or taken over your social media passwords to stalk and spy on you?",
        dimension: "Digital",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "c5",
        questionId: "c_q5",
        textId: "Apakah ada aplikasi pelacak GPS tersembunyi (spyware) yang diinstal di ponsel Anda tanpa persetujuan?",
        textEn: "Have hidden GPS trackers or spy apps been installed on your phone without consent?",
        dimension: "Digital",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      },
      {
        id: "c6",
        questionId: "c_q6",
        textId: "Apakah orang tersebut memaksa Anda mengirim foto bukti lokasi real-time secara berkala karena rasa curiga berlebih?",
        textEn: "Does this person force you to send real-time photos or live location updates due to obsessive jealousy?",
        dimension: "Psikologis",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "c7",
        questionId: "c_q7",
        textId: "Apakah nama baik Anda dirusak melalui rumor palsu atau fitnah keji di platform publik / forum online?",
        textEn: "Has your reputation been damaged via slanderous or fabricated rumors on online forums/chats?",
        dimension: "Sosial",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "c8",
        questionId: "c_q8",
        textId: "Apakah Anda dihubungi berulang kali lewat akun palsu setelah Anda memblokir kontak pelaku?",
        textEn: "Are you contacted repeatedly from fake/alternate accounts after blocking the person?",
        dimension: "Digital",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "c9",
        questionId: "c_q9",
        textId: "Apakah pelecehan siber ini membuat Anda cemas membuka notifikasi HP atau takut keluar rumah?",
        textEn: "Has this cyber harassment made you deeply anxious of phone notifications or afraid of going outside?",
        dimension: "Psikologis",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2 },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3 }
        ]
      },
      {
        id: "c10",
        questionId: "c_q10",
        textId: "Apakah Anda merasa terancam bahwa pelaku siber ini akan melacak atau melukai Anda secara fisik di dunia nyata?",
        textEn: "Do you feel threatened that this online stalker will track down or physically harm you in real life?",
        dimension: "Keamanan",
        options: [
          { textId: "Tidak pernah", textEn: "Never", points: 0 },
          { textId: "Jarang", textEn: "Rarely", points: 1 },
          { textId: "Sering", textEn: "Often", points: 2, triggerCritical: true },
          { textId: "Sangat Sering", textEn: "Very Often", points: 3, triggerCritical: true }
        ]
      }
    ]
  }
];

export interface QuizResult {
  severity: "low" | "medium" | "high";
  score: number;
  triggerEscalation: boolean;
  breakdown: { [dim: string]: number };
  actionsId: string[];
  actionsEn: string[];
  contacts: { name: string; number: string; desc: string }[];
}

export function calculateQuizResult(type: string, answers: { [qId: string]: number }, triggerCount: number): QuizResult {
  let score = 0;
  const breakdown: { [dim: string]: number } = {};
  let totalQuestions = 0;

  // Find questions
  const cat = QUIZ_DATA.find(c => c.type === type);
  if (!cat) {
    return {
      severity: "low",
      score: 0,
      triggerEscalation: false,
      breakdown: {},
      actionsId: [],
      actionsEn: [],
      contacts: []
    };
  }

  cat.questions.forEach(q => {
    const pts = answers[q.id] || 0;
    score += pts;
    breakdown[q.dimension] = (breakdown[q.dimension] || 0) + pts;
  });

  const triggerEscalation = triggerCount > 0 || score >= 20;
  let severity: "low" | "medium" | "high" = "low";
  if (triggerEscalation) {
    severity = "high";
  } else if (score >= 10) {
    severity = "medium";
  }

  const actionsId: string[] = [];
  const actionsEn: string[] = [];
  const contacts: { name: string; number: string; desc: string }[] = [];

  // Populate actions based on severity
  if (severity === "low") {
    actionsId.push(
      "Pantau perkembangan relasi Anda secara berkala.",
      "Pelajari batasan relasi yang sehat (healthy boundaries).",
      "Gunakan SafePin AI Chat untuk sekadar berkeluh kesah atau mendapatkan tips komunikasi.",
      "Simpan nomor darurat nasional SAPA 129 di kontak HP Anda sebagai antisipasi."
    );
    actionsEn.push(
      "Monitor your relationship dynamics periodically.",
      "Learn about maintaining healthy personal boundaries.",
      "Use SafePin AI Chat to vent, share, or learn communication tips.",
      "Save the national SAPA 129 hotline to your phone contacts just in case."
    );
  } else if (severity === "medium") {
    actionsId.push(
      "Bicarakan situasi Anda dengan orang tepercaya (sahabat atau keluarga dekat).",
      "Dokumentasikan setiap bukti kekerasan (foto, rekaman suara, tangkapan layar chat).",
      "Lakukan konseling psikologis gratis atau murah melalui Yayasan Pulih.",
      "Hubungi LBH APIK jika membutuhkan panduan hukum preventif.",
      "Rencanakan taktik keselamatan mandiri (menyimpan dokumen penting di tempat aman)."
    );
    actionsEn.push(
      "Discuss your situation with a trusted friend or family member.",
      "Document all evidence safely (photos, voice recordings, chat screenshots).",
      "Seek free or affordable psychological counseling via Yayasan Pulih.",
      "Contact LBH APIK for preventive legal consultation.",
      "Create a safety plan (keep copies of vital documents in a secure, hidden place)."
    );
    contacts.push({
      name: "Yayasan Pulih",
      number: "0811-8436-633",
      desc: "Konseling psikologis pemulihan trauma"
    });
    contacts.push({
      name: "LBH APIK",
      number: "0813-8882-2637",
      desc: "Bantuan hukum khusus perempuan & anak"
    });
  } else {
    // High Severity / Critical
    actionsId.push(
      "UTAMAKAN KESELAMATAN FISIK ANDA. Jika terancam, segera tinggalkan lokasi atau rumah.",
      "Hubungi Kepolisian Polda Metro Jaya (110) atau SAPA (129) untuk bantuan fisik evakuasi.",
      "Hubungi UPT P2TP2A DKI Jakarta untuk rujukan penempatan di Rumah Aman (Shelter) rahasia.",
      "Lakukan pemeriksaan medis ke IGD RSCM jika mengalami luka fisik sekecil apapun demi visum.",
      "Hapus riwayat penelusuran SafeMap dan gunakan kalkulator disguise jika perangkat dipantau pelaku."
    );
    actionsEn.push(
      "PRIORITIZE YOUR PHYSICAL SAFETY immediately. Leave the location/house if threatened.",
      "Call the Police (110) or SAPA (129) for emergency physical evacuation rescue.",
      "Contact UPT P2TP2A DKI Jakarta for confidential Safe House (Shelter) placement.",
      "Get a medical exam at RSCM ER immediately for physical injuries to document visum.",
      "Clear SafeMap browsing history and use the calculator disguise if your device is monitored."
    );
    contacts.push({
      name: "SAPA 129",
      number: "129",
      desc: "Kementerian PPPA - Evakuasi & Rumah Aman"
    });
    contacts.push({
      name: "Polisi DKI",
      number: "110",
      desc: "Layanan Darurat Kepolisian RI"
    });
    contacts.push({
      name: "IGD RSCM",
      number: "021-1500135",
      desc: "Urusan medis darurat & Visum et Repertum"
    });
  }

  return {
    severity,
    score,
    triggerEscalation,
    breakdown,
    actionsId,
    actionsEn,
    contacts
  };
}
