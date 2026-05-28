import React from "react";

interface TopbarProps {
  activePage: string;
  isAdmin: boolean;
}

export default function Topbar({ activePage, isAdmin }: TopbarProps) {
  return (
    <div className="top-bar">
      
      <style>{`
        @media (max-width: 768px) {
          .naik-di-hp {
            transform: translateY(-150px) !important; 
            z-index: 10; 
          }
          .tarik-konten-bawah {
            margin-bottom: -150px !important; 
          }
        }
      `}</style>

      <div style={{ flex: 1 }}>
        {activePage === "home" && !isAdmin ? (
          <div className="step-indicators tarik-konten-bawah">
            
            <div className="step-item">
              <div className="step-icon">
                <img src="/assets/icon-camera-utama.png" alt="Deteksi Kualitas" style={{ width: "35px", height: "35px", objectFit: "contain" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                <span className="step-label">Deteksi Kualitas</span>
                <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.7)", fontWeight: "normal" }}>Analisis Kelayakan Konsumsi</span>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-icon">
                <img src="/assets/icon-nutrisi.png" alt="Info Nutrisi" style={{ width: "35px", height: "35px", objectFit: "contain" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                <span className="step-label">Info Nutrisi</span>
                <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.7)", fontWeight: "normal" }}>Kalori, protein, dll</span>
              </div>
            </div>
            
            <div className="step-item naik-di-hp">
              <div className="step-icon">
                <img src="/assets/icon-logriwayat.png" alt="Log Riwayat" style={{ width: "35px", height: "35px", objectFit: "contain" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                <span className="step-label">Log Riwayat</span>
                <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.7)", fontWeight: "normal" }}>Daftar Hasil Pengecekan</span>
              </div>
            </div>
            
          </div>
        ) : !["camera", "log", "sampah", "profil"].includes(activePage) ? (
          <></>
        ) : null}
      </div>
    </div>
  );
}