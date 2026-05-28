"use client";

import React, { useState, useEffect } from "react";
import { DATABASE_GIZI } from "../../lib/constants";

// Setup Library & Tipe Data
interface DashboardHomeProps {
  isAdmin: boolean;
  logEntries: any[];
}

export default function DashboardHome({ isAdmin, logEntries }: DashboardHomeProps) {
  
  // Deteksi Ukuran Layar
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Render UI Dashboard
  return (
    <div 
      className="dash-view active" 
      style={{ 
        width: "100%", 
        maxWidth: "100%", 
        padding: isMobile ? "0" : "0 20px", 
        boxSizing: "border-box",
        overflowX: "hidden"
      }}
    >
      {isAdmin ? (
        <div style={{ textAlign: "center", padding: "0.5rem 0", width: "100%", boxSizing: "border-box" }}>
          
          <div style={{ 
            marginBottom: "1.5rem", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            textAlign: "center", 
            width: "100%",
            boxSizing: "border-box"
          }}>
            
            <div style={{ 
              backgroundColor: "#153759", 
              color: "white", 
              padding: isMobile ? "8px 16px" : "12px 30px", 
              borderRadius: "30px", 
              fontWeight: "700", 
              fontSize: isMobile ? "0.9rem" : "1.25rem", 
              marginBottom: "12px", 
              display: "inline-flex", 
              alignItems: "center", 
              justifyContent: "center",
              gap: isMobile ? "6px" : "12px", 
              boxShadow: "0 6px 15px rgba(21, 55, 89, 0.25)",
              maxWidth: "100%",
              boxSizing: "border-box"
            }}>
              <img src="/assets/icon-admin-dashboard.png" alt="Icon Dashboard" style={{ width: isMobile ? "24px" : "45px", height: isMobile ? "24px" : "45px", objectFit: "contain" }} />
              <span>Dashboard Administrator</span>
            </div>
            
            <p style={{ 
              fontSize: isMobile ? "0.85rem" : "1.05rem", 
              color: "#153759", 
              margin: "0 auto 15px", 
              width: isMobile ? "calc(100vw - 40px)" : "100%", 
              maxWidth: isMobile ? "calc(100vw - 40px)" : "950px", 
              lineHeight: "1.5", 
              fontWeight: "500",
              whiteSpace: "normal",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              boxSizing: "border-box"
            }}>
              Pusat kendali utama untuk memantau kualitas gizi, aktivitas pemeriksa, dan operasional Dapur MBG secara menyeluruh.
            </p>
          </div>
          
          {/* CONTAINER UTAMA CARD GRID */}
          <div style={{ 
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "0.8rem" : "1.5rem",
            width: isMobile ? "calc(100vw - 40px)" : "100%", 
            margin: "0 auto 2rem",
            alignItems: "center",
            boxSizing: "border-box"
          }}>
            
            {/* BARIS 1: SEGAR & BASI SEJAJAR */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? "0.8rem" : "1.5rem",
              width: "100%",
              boxSizing: "border-box"
            }}>
              {/* KUALITAS SEGAR */}
              <div className="profil-card" style={{ width: "100%", boxSizing: "border-box", padding: isMobile ? "0.8rem" : "2.5rem 1.5rem", borderRadius: "12px", borderBottom: "4px solid #2ecc71", textAlign: "center", backgroundColor: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: isMobile ? "0.75rem" : "1rem", color: "var(--clr-gray-500)", fontWeight: "700", margin: "0 0 2px 0" }}>KUALITAS SEGAR</p>
                <h3 style={{ fontSize: isMobile ? "1.8rem" : "3.5rem", color: "#4cbb17", margin: "2px 0", fontWeight: "bold", lineHeight: "1.2" }}>{logEntries.filter((log) => log.status === "SEGAR").length}</h3>
                <p style={{ fontSize: isMobile ? "0.7rem" : "0.95rem", color: "var(--clr-gray-400)", fontWeight: "600", margin: 0 }}>Layak konsumsi</p>
              </div>

              {/* KUALITAS BASI */}
              <div className="profil-card" style={{ width: "100%", boxSizing: "border-box", padding: isMobile ? "0.8rem" : "2.5rem 1.5rem", borderRadius: "12px", borderBottom: "4px solid #e74c3c", textAlign: "center", backgroundColor: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: isMobile ? "0.75rem" : "1rem", color: "var(--clr-gray-500)", fontWeight: "700", margin: "0 0 2px 0" }}>KUALITAS BASI</p>
                <h3 style={{ fontSize: isMobile ? "1.8rem" : "3.5rem", color: "#e74c3c", margin: "2px 0", fontWeight: "bold", lineHeight: "1.2" }}>{logEntries.filter((log) => log.status === "BASI").length}</h3>
                <p style={{ fontSize: isMobile ? "0.75rem" : "0.95rem", color: "var(--clr-gray-400)", fontWeight: "600", margin: 0 }}>Tidak layak</p>
              </div>
            </div>

            {/* BARIS 2: TOTAL PEMERIKSAAN DI TENGAH BAWAH */}
            <div style={{
              width: isMobile ? "100%" : "calc(50% - 0.75rem)",
              boxSizing: "border-box"
            }}>
              <div className="profil-card" style={{ width: "100%", boxSizing: "border-box", padding: isMobile ? "0.8rem" : "2.5rem 1.5rem", borderRadius: "12px", borderBottom: "4px solid #7ea69f", textAlign: "center", backgroundColor: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: isMobile ? "0.75rem" : "1rem", color: "var(--clr-gray-500)", fontWeight: "700", margin: "0 0 2px 0" }}>TOTAL PEMERIKSAAN</p>
                <h3 style={{ fontSize: isMobile ? "1.8rem" : "3.5rem", color: "#153759", margin: "2px 0", fontWeight: "bold", lineHeight: "1.2" }}>{logEntries.length}</h3>
                <p style={{ fontSize: isMobile ? "0.75rem" : "0.95rem", color: "var(--clr-gray-400)", fontWeight: "600", margin: 0 }}>Laporan masuk</p>
              </div>
            </div>

          </div>
        </div>
      ) : (

        <div style={{ textAlign: "center", padding: "1rem 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={{ fontSize: isMobile ? "1.8rem" : "2.2rem", marginBottom: "1rem", color: "var(--clr-navy)", fontWeight: "800" }}>Selamat Datang di MBG Smart System</h2>
          <p style={{ color: "#334155", maxWidth: "750px", lineHeight: "1.8", fontSize: isMobile ? "0.85rem" : "1.1rem", marginBottom: "2.5rem", fontWeight: "500" }}>
            Gunakan menu <strong>Kamera Deteksi</strong> untuk memulai analisis kualitas dan gizi makanan. Sistem akan mendeteksi kesegaran makanan dan menampilkan informasi nutrisi secara real-time.
          </p>
          
          <div style={{ width: "100%", maxWidth: "100%", padding: "0", textAlign: "left", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ background: "rgba(232, 244, 248, 0.95)", borderLeft: "5px solid var(--clr-teal)", padding: isMobile ? "1.2rem 1.5rem" : "1.5rem 2rem", borderRadius: "12px", width: "100%", marginBottom: "2rem", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: isMobile ? "1.1rem" : "1.3rem", color: "var(--clr-navy)", marginBottom: "14px", fontWeight: "800" }}>
                Informasi Database & Istilah Gizi
              </h3>
              <div style={{ fontSize: isMobile ? "0.85rem" : "1rem", color: "var(--clr-navy-dark)", marginBottom: "18px", lineHeight: "1.6", fontWeight: "600" }}>
                <strong>Sumber Data Nutrisi:</strong><br/>
                Kalkulasi gizi pada sistem ini menggunakan metode Triangulasi Referensi Gizi yang merujuk pada tiga sumber utama, yaitu <strong>Tabel Komposisi Pangan Indonesia (TKPI) 2020</strong>, <strong>USDA FoodData Central</strong>, dan <strong>FatSecret Indonesia</strong>.
              </div>
              <div style={{ borderTop: "1px solid rgba(21, 55, 89, 0.1)", paddingTop: "12px", marginTop: "12px", fontSize: isMobile ? "0.85rem" : "0.95rem", color: "#475569", lineHeight: "1.6", fontWeight: "500" }}>
                <strong>Apa itu BDD?</strong><br />
                <span style={{ fontStyle: "italic" }}>
                  <strong>BDD (Berat Dapat Dimakan)</strong> adalah persentase bagian bahan makanan yang bener-bener bisa dikonsumsi setelah membuang bagian yang tidak dapat dimakan (seperti kulit pisang, tulang ayam, atau cangkang telur). 
                  Sistem kami secara otomatis menghitung kalori berdasarkan nilai BDD ini agar hasil lebih akurat.
                </span>
              </div>
            </div>

            <div className="table-container" style={{ width: "100%", overflowX: "auto", paddingBottom: "10px" }}>
              <table className="log-table" style={{ width: "100%", minWidth: "600px", borderCollapse: "collapse", fontSize: isMobile ? "0.85rem" : "1rem" }}>
                <thead>
                  <tr style={{ textAlign: "center", backgroundColor: "#153759", color: "white" }}>
                    <th style={{ padding: isMobile ? "12px" : "14px 12px", textAlign: "left", whiteSpace: "nowrap", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>Jenis Makanan</th>
                    <th style={{ padding: isMobile ? "12px" : "14px 12px", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>Kalori<br/>(kkal)</th>
                    <th style={{ padding: isMobile ? "12px" : "14px 12px", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>Protein<br/>(g)</th>
                    <th style={{ padding: isMobile ? "12px" : "14px 12px", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>Lemak<br/>(g)</th>
                    <th style={{ padding: isMobile ? "12px" : "14px 12px", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>Karbo<br/>(g)</th>
                    <th style={{ padding: isMobile ? "12px" : "14px 12px", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>BDD<br/>(%)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(DATABASE_GIZI).map((item: any, i) => (
                    <tr key={i} style={{ textAlign: "center", borderBottom: "1px solid #f1f5f9", backgroundColor: "white" }}>
                      <td style={{ padding: isMobile ? "12px" : "14px 12px", textAlign: "left", fontWeight: "700", color: "#153759", whiteSpace: "nowrap" }}>{item.nama}</td>
                      <td style={{ padding: isMobile ? "12px" : "14px 12px", fontWeight: "600" }}>{item.kalori}</td>
                      <td style={{ padding: isMobile ? "12px" : "14px 12px", fontWeight: "600" }}>{item.protein}</td>
                      <td style={{ padding: isMobile ? "12px" : "14px 12px", fontWeight: "600" }}>{item.lemak}</td>
                      <td style={{ padding: isMobile ? "12px" : "14px 12px", fontWeight: "600" }}>{item.karbo}</td>
                      <td style={{ padding: isMobile ? "12px" : "14px 12px", fontWeight: "600" }}>{item.bdd}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}