// Konfigurasi Database Referensi Gizi 
// (Berdasarkan PMK No.41 Tahun 2014 ttg Pedoman Gizi Seimbang, TKPI 2020, USDA)
export const DATABASE_GIZI: Record<
  string, 
  { nama: string; bdd: number; kalori: number; protein: number; lemak: number; karbo: number; berat_porsi: number }
> = {
  // Karbohidrat Utama
  nasi_putih: { nama: "Nasi Putih", bdd: 100, kalori: 180, protein: 3.0, lemak: 0.3, karbo: 39.8, berat_porsi: 100 },
  
  // Protein Nabati
  tahu: { nama: "Olahan Tahu", bdd: 100, kalori: 232, protein: 10.19, lemak: 18.64, karbo: 9.42, berat_porsi: 100 }, 
  tempe: { nama: "Olahan Tempe", bdd: 100, kalori: 175, protein: 13.11, lemak: 8.2, karbo: 15.6, berat_porsi: 50 },
  
  // Protein Hewani
  ayam: { nama: "Olahan Ayam", bdd: 58, kalori: 268, protein: 22.0, lemak: 15.8, karbo: 8.28, berat_porsi: 40 },
  ikan: { nama: "Olahan Ikan", bdd: 80, kalori: 167, protein: 19.32, lemak: 9.36, karbo: 0, berat_porsi: 40 },
  telur_ceplok: { nama: "Telur Ceplok", bdd: 100, kalori: 196, protein: 13.6, lemak: 14.8, karbo: 0.83, berat_porsi: 55 },
  telur_dadar: { nama: "Telur Dadar", bdd: 100, kalori: 251, protein: 16.3, lemak: 19.4, karbo: 1.4, berat_porsi: 55 },

  // Sayuran
  tumis_wortel: { nama: "Olahan Wortel", bdd: 100, kalori: 54, protein: 0.74, lemak: 2.48, karbo: 7.99, berat_porsi: 100 },
  wortel_rebus: { nama: "Wortel Rebus", bdd: 100, kalori: 28, protein: 0.7, lemak: 0.5, karbo: 6.3, berat_porsi: 100 },
  tumis_sawi: { nama: "Tumis Sawi Putih", bdd: 100, kalori: 120, protein: 5.19, lemak: 6.89, karbo: 10.53, berat_porsi: 100 },

  // Buah-buahan
  pisang_mas: { nama: "Pisang Mas", bdd: 85, kalori: 127, protein: 1.4, lemak: 0.2, karbo: 33.6, berat_porsi: 40 },
  apel_segar: { nama: "Apel Segar", bdd: 88, kalori: 58, protein: 0.3, lemak: 0.4, karbo: 14.9, berat_porsi: 85 },
  jeruk_mandarin: { nama: "Jeruk Mandarin", bdd: 71, kalori: 61, protein: 0.8, lemak: 0.2, karbo: 14.1, berat_porsi: 100 },
};