import React, { useState, useEffect } from "react";

// Definisi Tipe Data Props
interface AdminApprovalProps {
  pendingUsers: any[];
  filteredPendingUsers: any[];
  searchQueryPending: string;
  setSearchQueryPending: (query: string) => void;
  handleUpdateStatusPegawai: (id: string, status: "approved" | "ditolak", nama: string) => void;
}

export default function AdminApproval({
  pendingUsers,
  filteredPendingUsers,
  searchQueryPending,
  setSearchQueryPending,
  handleUpdateStatusPegawai
}: AdminApprovalProps) {

  // Deteksi Ukuran Layar (Mobile/Desktop)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fitur Load More Pagination
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    setVisibleCount(5);
  }, [searchQueryPending]);

  const displayedUsers = filteredPendingUsers.slice(0, visibleCount);

  // Render UI Halaman Admin
  return (
    <div className="dash-view active" style={{ width: "100%", maxWidth: "100%", padding: "0 20px", boxSizing: "border-box" }}>
      <div className="log-section" style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ backgroundColor: "#153759", color: "white", padding: "12px 30px", borderRadius: "30px", fontWeight: "700", fontSize: isMobile ? "1.05rem" : "1.25rem", marginBottom: "12px", display: "inline-flex", alignItems: "center", gap: "12px", boxShadow: "0 6px 15px rgba(21, 55, 89, 0.25)" }}>
            <img src="/assets/admin-verification.png" alt="Icon Verifikasi" style={{ width: "30px", height: "45px", objectFit: "contain" }} /> Verifikasi Pengguna
          </div>
          <p style={{ fontSize: isMobile ? "0.85rem" : "1.05rem", color: "#153759", margin: isMobile ? "0 0 15px 0" : "0 auto 15px", maxWidth: isMobile ? "100%" : "930px", lineHeight: "1.6", fontWeight: "500" }}>
            Berikut adalah daftar pengguna yang sedang menunggu verifikasi akun. Harap tinjau dan berikan persetujuan akses.
          </p>
          
          {pendingUsers.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: "10px" }}>
              <div style={{ flex: 1, width: "100%", position: "relative" }}>
                <img src="/assets/icon-search.png" alt="Search Icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "20px", height: "20px", objectFit: "contain" }} />
                <input 
                  type="text" 
                  placeholder="Cari nama atau lokasi..." 
                  value={searchQueryPending} 
                  onChange={(e) => setSearchQueryPending(e.target.value)} 
                  style={{ width: "100%", padding: "12px 12px 12px 44px", borderRadius: "8px", border: "1px solid rgba(21, 55, 89, 0.2)", outline: "none", fontSize: isMobile ? "0.9rem" : "1.05rem", color: "#153759", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontWeight: "600" }} 
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="table-container shadow-sm border border-gray-200 rounded-xl overflow-x-auto bg-white" style={{ width: "100%", maxWidth: "100%" }}>
          <table className="log-table" style={{ width: "100%", textAlign: "left", minWidth: "900px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#153759", color: "white" }}>
                <th style={{ padding: isMobile ? "15px" : "16px 14px", fontSize: isMobile ? "0.85rem" : "1rem", fontWeight: "700" }}>Nama Lengkap</th>
                <th style={{ padding: isMobile ? "15px" : "16px 14px", fontSize: isMobile ? "0.85rem" : "1rem", fontWeight: "700" }}>Username</th>
                <th style={{ padding: isMobile ? "15px" : "16px 14px", fontSize: isMobile ? "0.85rem" : "1rem", fontWeight: "700" }}>No. Telp</th>
                <th style={{ padding: isMobile ? "15px" : "16px 14px", fontSize: isMobile ? "0.85rem" : "1rem", fontWeight: "700", textAlign: "center" }}>Peran</th>
                <th style={{ padding: isMobile ? "15px" : "16px 14px", fontSize: isMobile ? "0.85rem" : "1rem", fontWeight: "700" }}>Lokasi / Instansi</th>
                <th style={{ padding: isMobile ? "15px" : "16px 14px", fontSize: isMobile ? "0.85rem" : "1rem", fontWeight: "700", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.length > 0 ? (
                displayedUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "white" }}>
                    <td style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "700", color: "var(--clr-navy)", fontSize: isMobile ? "0.85rem" : "0.95rem" }}>{user.nama_lengkap}</td>
                    <td style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "600", color: "#334155", fontSize: isMobile ? "0.85rem" : "0.95rem" }}>{user.username}</td>
                    <td style={{ padding: isMobile ? "15px" : "16px 14px", color: "#475569", fontSize: isMobile ? "0.85rem" : "0.95rem", fontWeight: "600" }}>{user.no_hp}</td>
                    
                    <td style={{ padding: isMobile ? "15px" : "16px 14px", textAlign: "center" }}>
                      <span style={{
                        display: "inline-block", 
                        whiteSpace: "nowrap",    
                        padding: "6px 14px", 
                        borderRadius: "20px", 
                        fontSize: isMobile ? "0.8rem" : "0.9rem", 
                        fontWeight: "700",
                        backgroundColor: user.role === "Guru" ? "#e0f2fe" : "#ffedd5",
                        color: user.role === "Guru" ? "#0369a1" : "#c2410c"
                      }}>
                        {user.role === "Pegawai SPPG" ? "Pegawai SPPG" : (user.role || "Pegawai SPPG")}
                      </span>
                    </td>

                    <td style={{ padding: isMobile ? "15px" : "16px 14px", color: "#153759", fontWeight: "700", fontSize: isMobile ? "0.85rem" : "0.95rem" }}>{user.lokasi}</td>
                    
                    <td style={{ padding: isMobile ? "15px" : "16px 14px", display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                      <button onClick={() => handleUpdateStatusPegawai(user.id, "approved", user.nama_lengkap)} style={{ background: "var(--clr-fresh)", color: "white", padding: isMobile ? "8px 14px" : "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "800", fontSize: isMobile ? "0.85rem" : "0.95rem", whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(46, 204, 113, 0.2)" }}>Setujui</button>
                      <button onClick={() => handleUpdateStatusPegawai(user.id, "ditolak", user.nama_lengkap)} style={{ background: "var(--clr-spoiled)", color: "white", padding: isMobile ? "8px 14px" : "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "800", fontSize: isMobile ? "0.85rem" : "0.95rem", whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(231, 76, 60, 0.2)" }}>Tolak</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--clr-gray-500)", fontWeight: "600", fontSize: "1rem" }}>
                    {searchQueryPending ? "Tidak ada hasil pencarian yang cocok." : "Belum ada pendaftar yang menunggu verifikasi."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(filteredPendingUsers.length > visibleCount || visibleCount > 5) && (
          <div className="no-print" style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "25px", paddingBottom: "20px" }}>
            {visibleCount > 5 && (
              <button 
                onClick={() => setVisibleCount(Math.max(5, visibleCount - 5))}
                style={{
                  backgroundColor: "white", color: "#e74c3c", border: "1px solid #e74c3c", padding: "12px 28px", borderRadius: "30px", fontSize: "1rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#fee2e2"; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
              >
                Lihat Lebih Sedikit
              </button>
            )}
            {filteredPendingUsers.length > visibleCount && (
              <button 
                onClick={() => setVisibleCount(visibleCount + 5)}
                style={{
                  backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "12px 28px", borderRadius: "30px", fontSize: "1rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#e2e8f0"; e.currentTarget.style.color = "#1e293b"; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
              >
                Lihat Lebih Banyak
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}