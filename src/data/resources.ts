export interface SupportResource {
  id: string;
  name: string;
  category: "shelter" | "legal" | "clinic" | "community" | "job";
  address: string;
  phone: string;
  hours: string;
  free: boolean;
  lat: number;
  lng: number;
  notes: string;
  tags: string[];
}

export const SEEDED_RESOURCES: SupportResource[] = [
  {
    id: "r1",
    name: "P2TP2A DKI Jakarta (Pusat Perlindungan Perempuan & Anak)",
    category: "shelter",
    address: "Jl. Raya Bekasi Km. 21, Rawa Terate, Cakung, Jakarta Timur, DKI Jakarta",
    phone: "0813-1762-1242",
    hours: "Senin - Minggu 24 Jam (24/7)",
    free: true,
    lat: -6.1915,
    lng: 106.9184,
    notes: "Layanan pengaduan, konseling psikologis, perlindungan hukum, dan rujukan rumah aman (shelter) korban kekerasan fisik/seksual.",
    tags: ["Rumah Aman", "SAPA", "Konseling", "Pemerintah"]
  },
  {
    id: "r2",
    name: "LBH APIK Jakarta",
    category: "legal",
    address: "Jl. Raya Tengah No. 19, RT 01 / RW 09, Kramat Jati, Jakarta Timur, DKI Jakarta",
    phone: "0813-8882-2637",
    hours: "Senin - Jumat 09:00 - 17:00",
    free: true,
    lat: -6.2842,
    lng: 106.8681,
    notes: "Lembaga bantuan hukum khusus untuk perempuan dan anak korban KDRT, kekerasan siber gender, dan pelecehan seksual.",
    tags: ["Bantuan Hukum", "LBH", "KDRT", "Siber GBI"]
  },
  {
    id: "r3",
    name: "Yayasan Pulih (Pusat Konseling Psikososial)",
    category: "community",
    address: "Jl. Teluk Belang No. 9, RT 02 / RW 08, Pasar Minggu, Jakarta Selatan, DKI Jakarta",
    phone: "0811-8436-633",
    hours: "Senin - Sabtu 09:00 - 17:00",
    free: true, // Pro-bono options / highly subsidized
    lat: -6.2912,
    lng: 106.8285,
    notes: "Fokus pada pemulihan trauma psikologis pasca kekerasan, KDRT, dan pelecehan siber melalui konseling sebaya dan psikolog berlisensi.",
    tags: ["Dukungan Psikologi", "Konseling", "Penyintas", "Trauma"]
  },
  {
    id: "r4",
    name: "Sentra Terpadu Mulya Jaya (Kemensos)",
    category: "shelter",
    address: "Jl. Bambu Apus No. 165, RT 05 / RW 03, Cipayung, Jakarta Timur, DKI Jakarta",
    phone: "021-8711018",
    hours: "Senin - Minggu 24 Jam",
    free: true,
    lat: -6.3116,
    lng: 106.9023,
    notes: "Unit pelaksana teknis Kementerian Sosial yang menyediakan rumah aman, rehabilitasi sosial, dan makanan gratis bagi korban kekerasan.",
    tags: ["Pemerintah", "Rehabilitasi", "Rumah Aman"]
  },
  {
    id: "r5",
    name: "Crisis Center RSCM (UPT Perlindungan Perempuan & Anak)",
    category: "clinic",
    address: "Gedung Sentra Medis RSCM, Jl. Diponegoro No. 71, Senen, Jakarta Pusat, DKI Jakarta",
    phone: "021-1500135",
    hours: "Senin - Minggu 24 Jam (IGD)",
    free: true, // With BPJS/Keterangan Polisi or pro-bono scheme
    lat: -6.1963,
    lng: 106.8488,
    notes: "Penanganan medis darurat, perawatan fisik pasca-kekerasan, rujukan psikis, serta pembuatan Visum et Repertum (forensik gratis).",
    tags: ["Visum", "Forensik", "Layanan Medis", "Rumah Sakit"]
  },
  {
    id: "r6",
    name: "LBH Jakarta",
    category: "legal",
    address: "Jl. Pangeran Diponegoro No. 74, RT 09 / RW 02, Menteng, Jakarta Pusat, DKI Jakarta",
    phone: "021-3145151",
    hours: "Senin - Jumat 08:30 - 16:30",
    free: true,
    lat: -6.1979,
    lng: 106.8454,
    notes: "Bantuan hukum pro-bono terkemuka di Jakarta bagi kaum marjinal dan korban pelanggaran hak asasi termasuk kekerasan struktural.",
    tags: ["Hukum", "Pro-Bono", "Advokasi"]
  },
  {
    id: "r7",
    name: "Kalisum (Karya Latihan Sosial Perempuan Yayasan Dian Aksara)",
    category: "job",
    address: "Ruko Duren Sawit Elok Blok B No. 12, Jl. Raden Inten II, Jakarta Timur, DKI Jakarta",
    phone: "021-8660993",
    hours: "Senin - Jumat 09:00 - 16:00",
    free: true,
    lat: -6.2238,
    lng: 106.9204,
    notes: "Program pemberdayaan ekonomi perempuan penyintas kekerasan berupa kelas menjahit, kuliner, dan kecantikan gratis demi kemandirian finansial.",
    tags: ["Pelatihan Kerja", "Ekonomi", "Keterampilan"]
  },
  {
    id: "r8",
    name: "Puskesmas Kecamatan Menteng (Layanan PKT KDRT)",
    category: "clinic",
    address: "Jl. Pegangsaan Barat No. 14, Menteng, Jakarta Pusat, DKI Jakarta",
    phone: "021-31922332",
    hours: "Senin - Jumat 08:00 - 15:00",
    free: true,
    lat: -6.1994,
    lng: 106.8431,
    notes: "Unit Pelayanan Terpadu (UPT) Puskesmas rujukan KDRT terdekat, menyediakan pemeriksaan luka, psikolog klinis puskesmas, dan surat rujukan visum.",
    tags: ["Klinik", "Medis", "Puskesmas", "BPJS"]
  }
];
