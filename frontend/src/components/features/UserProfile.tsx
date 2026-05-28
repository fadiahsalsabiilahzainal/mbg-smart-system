import React, { useState, useEffect } from "react";

// Definisi Tipe Data Props
interface UserProfileProps {
  currentUser: any;
  openEditModal: () => void;
}

export default function UserProfile({ currentUser, openEditModal }: UserProfileProps) {
  
  // Deteksi Ukuran Layar
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!currentUser) return null;

  return (
    <div className="dash-view active" style={{ width: "100%", maxWidth: "100%", padding: "0 20px", boxSizing: "border-box" }}>
      
      <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ backgroundColor: "#153759", color: "white", padding: "10px 24px", borderRadius: "30px", fontWeight: "700", fontSize: isMobile ? "1.05rem" : "1.25rem", marginBottom: "10px", display: "inline-flex", alignItems: "center", gap: "12px", boxShadow: "0 6px 15px rgba(21, 55, 89, 0.25)" }}>
          <img src="/assets/icon-user.png" alt="Icon Akun" style={{ width: "40px", height: "40px", objectFit: "contain" }} /> Akun Saya
        </div>
        <p style={{ fontSize: isMobile ? "0.85rem" : "1rem", color: "#153759", margin: "0 auto", maxWidth: isMobile ? "100%" : "700px", lineHeight: "1.6", fontWeight: "500" }}>
          Lihat detail profilmu dan kelola akses keamanan akun anda sebagai pengguna terdaftar.
        </p>
      </div>
      
      <div className="profil-section" style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", paddingBottom: "2rem" }}>
        <div className="profil-card" style={{ backgroundColor: "#ffffff", padding: isMobile ? "1.5rem 1.2rem" : "3rem 2rem", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", textAlign: "center", width: isMobile ? "92%" : "100%", maxWidth: isMobile ? "420px" : "100%", margin: "0 auto", boxSizing: "border-box" }}>
          
          <div className="profil-avatar-big" style={{ width: isMobile ? "80px" : "100px", height: isMobile ? "80px" : "100px", borderRadius: "50%", backgroundColor: "#153759", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontSize: isMobile ? "2rem" : "2.5rem", fontWeight: "bold", overflow: "hidden", margin: "0 auto 1.5rem", boxShadow: "0 4px 10px rgba(21, 55, 89, 0.2)", border: "3px solid #f1f5f9" }}>
            {currentUser.jenis_kelamin === "Laki-laki" ? (
              <img src="/assets/icon-cowo.png" alt="Cowo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : currentUser.jenis_kelamin === "Perempuan" ? (
              <img src="/assets/icon-cewe.png" alt="Cewe" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              currentUser.nama_lengkap.charAt(0).toUpperCase()
            )}
          </div>
          
          <div style={{ padding: isMobile ? "0" : "0 2rem" }}>
            {[
              { label: "Nama Lengkap", value: currentUser.nama_lengkap },
              { label: "Username", value: currentUser.username },
              { label: "Email", value: currentUser.email || "-" },
              { label: "Jenis Kelamin", value: currentUser.jenis_kelamin || "Belum diatur" },
              { label: "Role", value: currentUser.role },
              { label: "Lokasi", value: currentUser.lokasi },
              { label: "No. HP", value: currentUser.no_hp },
            ].map((row, index) => (
              <div 
                key={index} 
                className="profil-row" 
                style={{ 
                  display: "flex", 
                  flexDirection: "row", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  gap: "15px",
                  padding: isMobile ? "1rem 0" : "1.2rem 0", 
                  borderBottom: "1px solid #f1f5f9" 
                }}
              >
                <span className="row-label" style={{ color: "#64748b", fontWeight: "600", fontSize: isMobile ? "0.85rem" : "1rem", whiteSpace: "nowrap" }}>
                  {row.label}
                </span>
                
                <span 
                  className="row-value" 
                  style={{ 
                    color: "#0f172a", 
                    fontWeight: "700", 
                    fontSize: isMobile ? "0.85rem" : "1rem", 
                    textAlign: "right",
                    wordBreak: "break-all" 
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          
          <div className="profil-row" style={{ display: "flex", justifyContent: "center", marginTop: isMobile ? "1.5rem" : "2.5rem", borderBottom: "none" }}>
            <button className="btn-primary" style={{ backgroundColor: "#153759", color: "white", padding: isMobile ? "12px 24px" : "14px 24px", borderRadius: "8px", fontWeight: "bold", width: "100%", maxWidth: "400px", border: "none", cursor: "pointer", fontSize: isMobile ? "0.95rem" : "1.05rem", boxShadow: "0 4px 10px rgba(21, 55, 89, 0.2)" }} onClick={openEditModal}>
              Edit Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}