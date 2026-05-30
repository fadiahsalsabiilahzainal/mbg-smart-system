// Konfigurasi Database Referensi Gizi (TKPI 2020, USDA, FatSecret)
export const DATABASE_GIZI: Record<
  string, 
  { nama: string; bdd: number; kalori: number; protein: number; lemak: number; karbo: number; berat_porsi: number }
> = {
  // Karbohidrat Utama
  nasi_putih: { nama: "Nasi Putih", bdd: 100, kalori: 180, protein: 3.0, lemak: 0.3, karbo: 39.8, berat_porsi: 100 },
  
  // Protein Nabati
  tahu: { nama: "Olahan Tahu", bdd: 100, kalori: 173, protein: 10.0, lemak: 13.5, karbo: 6.0, berat_porsi: 60 }, 
  tempe: { nama: "Olahan Tempe", bdd: 100, kalori: 262, protein: 18.8, lemak: 17.4, karbo: 13.0, berat_porsi: 55 },
  
  // Protein Hewani
  ayam: { nama: "Olahan Ayam", bdd: 58, kalori: 282, protein: 22.0, lemak: 16.8, karbo: 9.3, berat_porsi: 85 },
  ikan: { nama: "Olahan Ikan", bdd: 80, kalori: 176, protein: 21.2, lemak: 9.5, karbo: 0.8, berat_porsi: 105 },
  telur_ceplok: { nama: "Telur Ceplok", bdd: 100, kalori: 196, protein: 13.6, lemak: 14.8, karbo: 0.8, berat_porsi: 60 },
  telur_dadar: { nama: "Telur Dadar", bdd: 100, kalori: 251, protein: 16.3, lemak: 19.4, karbo: 1.4, berat_porsi: 70 },

  // Sayuran
  wortel: { nama: "Olahan Wortel", bdd: 100, kalori: 41, protein: 0.7, lemak: 1.5, karbo: 7.1, berat_porsi: 50 },
  sawi: { nama: "Tumis Sawi Putih", bdd: 100, kalori: 120, protein: 5.2, lemak: 6.9, karbo: 10.5, berat_porsi: 60 },

  // Buah-buahan
  pisang: { nama: "Pisang Mas", bdd: 85, kalori: 127, protein: 1.4, lemak: 0.2, karbo: 33.6, berat_porsi: 80 },
  apel: { nama: "Apel Segar", bdd: 88, kalori: 58, protein: 0.3, lemak: 0.4, karbo: 14.9, berat_porsi: 100 },
  jeruk: { nama: "Jeruk Mandarin", bdd: 71, kalori: 44, protein: 0.8, lemak: 0.3, karbo: 10.9, berat_porsi: 75 },
};