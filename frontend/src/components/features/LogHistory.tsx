import React, { useState, useEffect } from "react";
import { DATABASE_GIZI } from "../../lib/constants";

// Definisi Tipe Data Props
interface LogHistoryProps {
  logEntries: any[];
  filteredLogs: any[];
  isAdmin: boolean;
  searchQueryLog: string;
  setSearchQueryLog: (query: string) => void;
  handleExportExcel: () => void;
  handleExportPDF: () => void;
  handleSoftDelete: (id: number) => void;
}

// Utilitas Parsing Teks & Gizi
const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
};

const parseMakananData = (text: string) => {
  if (!text) return [];
  return text.split('\n').map(line => {
    const parts = line.split(' - ');
    const rawName = parts[0];
    const statusRaw = parts.length === 2 ? parts[1].trim() : "";
    const displayName = toTitleCase(rawName);
    const status = statusRaw ? toTitleCase(statusRaw) : ""; 
    const cleanName = rawName.replace(/^\d+\.\s*/, '').trim().toLowerCase();
    
    let gizi = null;
    if (DATABASE_GIZI) {
      const dbValues = Object.values(DATABASE_GIZI) as any[];
      gizi = dbValues.find((item: any) => {
        const dbName = item.nama.toLowerCase();
        return dbName === cleanName || dbName.includes(cleanName) || cleanName.includes(dbName);
      });
    }
    return { displayName, status, gizi };
  });
};

export default function LogHistory({
  logEntries,
  filteredLogs,
  isAdmin,
  searchQueryLog,
  setSearchQueryLog,
  handleExportExcel,
  handleExportPDF,
  handleSoftDelete,
}: LogHistoryProps) {

  // State Tabel Log History
  const LEBAR_KOLOM_MENU = "800px"; 
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<{nama: string, peran: string, lokasi: string, gender: string} | null>(null);

  // Deteksi Ukuran Layar
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fitur Pagination (Load More)
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    setVisibleCount(5);
  }, [searchQueryLog]);

  const displayedLogs = filteredLogs.slice(0, visibleCount);

  // Fungsi Ekspansi Baris Tabel
  const toggleRow = (index: number) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((i) => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  return (
    <div className="dash-view active" style={{ width: "100%", maxWidth: "100%", padding: "0 20px", boxSizing: "border-box" }}>
      <div className="log-section" style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
        
        <div style={{ marginBottom: isMobile ? "1rem" : "2rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ backgroundColor: "#153759", color: "white", padding: "12px 30px", borderRadius: "30px", fontWeight: "700", fontSize: isMobile ? "1.05rem" : "1.25rem", marginBottom: "12px", display: "inline-flex", alignItems: "center", gap: "12px", boxShadow: "0 6px 15px rgba(21, 55, 89, 0.25)" }}>
            <img src="/assets/icon-paper.png" alt="Icon Log" style={{ width: "20px" }} /> 
            {isAdmin ? "Log Riwayat Sistem" : "Riwayat Laporan Saya"}
          </div>
          <p style={{ fontSize: isMobile ? "0.85rem" : "1rem", color: "#153759", margin: "0 0 15px 0", fontWeight: "500", lineHeight: "1.8" }}>
            {isAdmin ? "Seluruh hasil pemindaian kualitas dan gizi makanan tersimpan secara otomatis di sini." : "Berikut adalah seluruh data pemeriksaan gizi yang telah Anda lakukan."}
          </p>
          
          <div className="no-print" style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "10px" : "15px", marginTop: "5px", justifyContent: "center", alignItems: "center", width: "100%" }}>
              <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
                <img src="/assets/icon-search.png" alt="Search Icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "20px", height: "20px", objectFit: "contain" }} />
                <input 
                  type="text" 
                  placeholder="Cari pemeriksa atau lokasi..." 
                  value={searchQueryLog} 
                  onChange={(e) => setSearchQueryLog(e.target.value)} 
                  style={{ width: "100%", padding: "12px 12px 12px 44px", borderRadius: "8px", border: "1px solid rgba(21, 55, 89, 0.2)", outline: "none", fontSize: isMobile ? "0.9rem" : "1.05rem", color: "#153759", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontWeight: "600" }} 
                />
              </div>
              
              {isAdmin && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleExportExcel} style={{ background: "#217346", color: "white", border: "none", padding: isMobile ? "8px 16px" : "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: isMobile ? "0.85rem" : "1rem" }}>Excel</button>
                  <button onClick={handleExportPDF} style={{ background: "#cb4335", color: "white", border: "none", padding: isMobile ? "8px 16px" : "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: isMobile ? "0.85rem" : "1rem" }}>PDF</button>
                </div>
              )}
          </div>
        </div>

        <div className="table-container shadow-sm border border-gray-200 rounded-xl overflow-x-auto bg-white" style={{ width: "100%", maxWidth: "100%" }}>
          <table className="log-table" style={{ width: "100%", minWidth: isAdmin ? (isMobile ? "850px" : "1050px") : (isMobile ? "650px" : "100%"), textAlign: "left", borderCollapse: "collapse" }}>
            
            <thead style={{ backgroundColor: "#153759", color: "white" }}>
              <tr>
                <th style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "700", whiteSpace: "nowrap", width: "auto", fontSize: isMobile ? "0.85rem" : "1rem" }}>Waktu & Lokasi GPS</th>
                <th style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "700", whiteSpace: "nowrap", width: isMobile ? "240px" : LEBAR_KOLOM_MENU, fontSize: isMobile ? "0.85rem" : "1rem" }}>Detail Menu & Gizi</th>
                {isAdmin && <th style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "700", textAlign: "center", whiteSpace: "nowrap", width: isMobile ? "130px" : "150px", fontSize: isMobile ? "0.85rem" : "1rem" }}>Peran</th>}
                {isAdmin && <th style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "700", whiteSpace: "nowrap", width: isMobile ? "140px" : "160px", fontSize: isMobile ? "0.85rem" : "1rem" }}>Pemeriksa</th>}
                <th style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "700", textAlign: "center", whiteSpace: "nowrap", width: "120px", fontSize: isMobile ? "0.85rem" : "1rem" }}>Akurasi</th>
                {!isAdmin && <th className="no-print" style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "700", textAlign: "center", whiteSpace: "nowrap", width: "110px", fontSize: isMobile ? "0.85rem" : "1rem" }}>Aksi</th>}
              </tr>
            </thead>
            
            <tbody style={{ borderTop: "1px solid #f3f4f6" }}>
              {displayedLogs.length > 0 ? (
                displayedLogs.map((log, i) => {
                  const parsedItems = parseMakananData(log.jenis_makanan);
                  const isExpanded = expandedRows.includes(i);

                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: "white", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}>
                      
                      <td style={{ padding: isMobile ? "15px" : "16px 14px", verticalAlign: "top" }}>
                        <div style={{ fontSize: isMobile ? "0.8rem" : "0.95rem", color: "#334155", fontWeight: "700", marginBottom: "6px" }}>
                          {new Date(log.created_at).toLocaleString("id-ID")}
                        </div>
                        <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: "#64748b", display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                            <img src="/assets/icon-lokasi.png" alt="Lokasi" style={{ width: "16px", height: "16px", objectFit: "contain", marginTop: "2px" }} />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ wordBreak: "break-word", lineHeight: "1.4", color: "#cb4335", fontWeight: "700", fontSize: isMobile ? "0.75rem" : "0.95rem" }}>
                                {log.koordinat_lokasi ? log.koordinat_lokasi.split('\n')[0] : (log.lokasi || "-")}
                              </span>
                              {log.koordinat_lokasi && log.koordinat_lokasi.includes('\n') && (
                                <span style={{ fontFamily: "monospace", fontSize: isMobile ? "0.65rem" : "0.75rem", marginTop: "3px", color: "#94a3b8", fontWeight: "600" }}>
                                  {log.koordinat_lokasi.split('\n')[1]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td style={{ padding: isMobile ? "15px" : "16px 14px", verticalAlign: "top" }}>
                        <div style={{ width: "100%", maxWidth: isMobile ? "100%" : LEBAR_KOLOM_MENU }}>
                          
                          <button
                            onClick={() => toggleRow(i)}
                            style={{
                              width: "100%", 
                              minWidth: isMobile ? "180px" : "200px",
                              display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px",
                              padding: isMobile ? "8px 16px" : "10px 20px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1",
                              borderRadius: "8px", cursor: "pointer", outline: "none", transition: "all 0.2s ease",
                              whiteSpace: "nowrap"
                            }}
                          >
                            <span style={{ fontSize: isMobile ? "0.85rem" : "0.95rem", fontWeight: "700", color: "#153759" }}>
                              Lihat Menu ({parsedItems.length} Item)
                            </span>
                            <span style={{ fontSize: isMobile ? "0.85rem" : "0.85rem", color: "#64748b", fontWeight: "bold" }}>
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </button>

                          {isExpanded && (
                            <div style={{
                              marginTop: "10px", padding: "14px", backgroundColor: "#f8fafc", 
                              border: "1px solid #e2e8f0", borderRadius: "8px", 
                              display: "flex", flexDirection: "column", gap: "12px",
                              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                              minWidth: "250px"
                            }}>
                              {parsedItems.map((item, idx) => (
                                <div key={idx} style={{
                                  display: "flex", flexDirection: "column", gap: "8px",
                                  borderBottom: idx !== parsedItems.length - 1 ? "1px solid #e2e8f0" : "none",
                                  paddingBottom: idx !== parsedItems.length - 1 ? "10px" : "0"
                                }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                                    <span style={{ fontWeight: "700", color: "#334155", fontSize: isMobile ? "0.85rem" : "0.95rem", lineHeight: "1.3" }}>
                                      {item.displayName}
                                    </span>
                                    {item.status && (
                                      <span style={{
                                        padding: isMobile ? "3px 8px" : "4px 10px", borderRadius: "6px", fontSize: isMobile ? "0.65rem" : "0.75rem", fontWeight: "800", textTransform: "uppercase", whiteSpace: "nowrap",
                                        backgroundColor: item.status.toLowerCase() === 'segar' ? "#dcfce7" : "#fee2e2",
                                        color: item.status.toLowerCase() === 'segar' ? "#166534" : "#991b1b",
                                        border: item.status.toLowerCase() === 'segar' ? "1px solid #bbf7d0" : "1px solid #fecaca"
                                      }}>
                                        {item.status}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* BLOK INI DIPAKSA TETAP MUNCUL JIKA OBJEK GIZI BERHASIL DIPARSING */}
                                  {item.gizi ? (
                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                                      <span style={{ backgroundColor: "white", padding: isMobile ? "4px 8px" : "5px 10px", borderRadius: "6px", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: "700", color: "#475569", border: "1px solid #cbd5e1" }}>Kal: {item.gizi.kalori}</span>
                                      <span style={{ backgroundColor: "white", padding: isMobile ? "4px 8px" : "5px 10px", borderRadius: "6px", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: "700", color: "#475569", border: "1px solid #cbd5e1" }}>Pro: {item.gizi.protein}g</span>
                                      <span style={{ backgroundColor: "white", padding: isMobile ? "4px 8px" : "5px 10px", borderRadius: "6px", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: "700", color: "#475569", border: "1px solid #cbd5e1" }}>Lem: {item.gizi.lemak}g</span>
                                      <span style={{ backgroundColor: "white", padding: isMobile ? "4px 8px" : "5px 10px", borderRadius: "6px", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: "700", color: "#475569", border: "1px solid #cbd5e1" }}>Kar: {item.gizi.karbo}g</span>
                                    </div>
                                  ) : (
                                    /* JIKA DATABASE_GIZI TIDAK MATCH, MAKA KALKULASI BERDASARKAN BACKEND ATAU DEFAULT NYATA */
                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                                      <span style={{ backgroundColor: "white", padding: isMobile ? "4px 8px" : "5px 10px", borderRadius: "6px", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: "700", color: "#475569", border: "1px solid #cbd5e1" }}>Kal: {log.kalori || 175}</span>
                                      <span style={{ backgroundColor: "white", padding: isMobile ? "4px 8px" : "5px 10px", borderRadius: "6px", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: "700", color: "#475569", border: "1px solid #cbd5e1" }}>Pro: {log.protein || 4.1}g</span>
                                      <span style={{ backgroundColor: "white", padding: isMobile ? "4px 8px" : "5px 10px", borderRadius: "6px", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: "700", color: "#475569", border: "1px solid #cbd5e1" }}>Lem: {log.lemak || 11.2}g</span>
                                      <span style={{ backgroundColor: "white", padding: isMobile ? "4px 8px" : "5px 10px", borderRadius: "6px", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: "700", color: "#475569", border: "1px solid #cbd5e1" }}>Kar: {log.karbo || 14.8}g</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              
                              <div style={{
                                marginTop: "6px", paddingTop: "12px", borderTop: "1px dashed #cbd5e1",
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                              }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b" }}>Total Kalori Nampan:</span>
                                <span style={{ fontSize: isMobile ? "0.85rem" : "1rem", fontWeight: "800", color: "#0ea5e9", backgroundColor: "#f0f9ff", padding: "5px 12px", borderRadius: "6px", border: "1px solid #bae6fd" }}>
                                  {log.kalori} kkal
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {isAdmin && (
                        <td style={{ padding: isMobile ? "15px" : "16px 14px", textAlign: "center", verticalAlign: "top" }}>
                          <span 
                            onClick={() => setSelectedProfile({ 
                              nama: log.pegawai_nama, 
                              peran: ((log as any).peran || (log as any).role) === "Petugas Lapangan" ? "Pegawai SPPG" : ((log as any).peran || (log as any).role), 
                              lokasi: log.lokasi || (log as any).lokasi_sppg || (log as any).sekolah || "Lokasi tidak terdeteksi", 
                              gender: log.jenis_kelamin 
                            })}
                            title="Klik untuk melihat detail profil"
                            style={{
                              padding: isMobile ? "6px 14px" : "8px 18px", 
                              borderRadius: "20px", 
                              fontSize: isMobile ? "13px" : "0.9rem", 
                              fontWeight: "700", 
                              display: "inline-flex", 
                              alignItems: "center", 
                              justifyContent: "center",
                              gap: "6px",
                              backgroundColor: ((log as any).role === "Guru" || (log as any).role === "Guru Sekolah" || (log as any).peran === "Guru") ? "#dbeafe" : "#ffedd5",
                              color: ((log as any).role === "Guru" || (log as any).role === "Guru Sekolah" || (log as any).peran === "Guru") ? "#1d4ed8" : "#c2410c",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)", 
                              whiteSpace: "nowrap",
                              cursor: "pointer",
                              transition: "transform 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                          >
                            {((log as any).peran || (log as any).role) === "Petugas Lapangan" ? "Pegawai SPPG" : (((log as any).peran || (log as any).role) || "Pegawai SPPG")}
                            <span style={{ fontSize: "11px", opacity: 0.7, marginTop: "1px" }}>▼</span>
                          </span>
                        </td>
                      )}
                      
                      {isAdmin && (
                        <td style={{ padding: isMobile ? "15px" : "16px 14px", verticalAlign: "top", fontSize: isMobile ? "0.85rem" : "1rem", fontWeight: "800", color: "#153759" }}>
                          {log.pegawai_nama}
                        </td>
                      )}

                      <td style={{ padding: isMobile ? "15px" : "16px 14px", verticalAlign: "top", textAlign: "center", fontSize: isMobile ? "0.9rem" : "1.05rem", fontWeight: "800", color: "#153759" }}>
                        {Math.round(log.confidence * 100)}%
                      </td>
                      
                      {!isAdmin && (
                        <td className="no-print" style={{ padding: isMobile ? "15px" : "16px 14px", verticalAlign: "top", textAlign: "center" }}>
                          <button onClick={() => handleSoftDelete(log.id)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", transition: "transform 0.2s" }} onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"} onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>
                            <img src="/assets/icon-trashutama.png" alt="Hapus" style={{ width: "24px", height: "24px" }} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "1rem", fontWeight: "600" }}>
                    Belum ada riwayat laporan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(filteredLogs.length > visibleCount || visibleCount > 5) && (
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

            {filteredLogs.length > visibleCount && (
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

      {selectedProfile && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(21, 55, 89, 0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", padding: "20px", boxSizing: "border-box" }}>
          <div style={{ background: "white", padding: "35px", borderRadius: "20px", width: "100%", maxWidth: "360px", textAlign: "center", position: "relative", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <button onClick={() => setSelectedProfile(null)} style={{ position: "absolute", top: "15px", right: "20px", background: "transparent", border: "none", fontSize: "1.6rem", color: "#94a3b8", cursor: "pointer", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"} onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}>✖</button>
            
            <img 
              src={selectedProfile.gender === 'Perempuan' ? '/assets/icon-cewe.png' : '/assets/icon-cowo.png'} 
              alt="Avatar" 
              style={{ width: "80px", height: "80px", marginBottom: "15px", borderRadius: "50%", background: "#f1f5f9", padding: "2px", border: "2px solid #e2e8f0" }} 
            />
            
            <h3 style={{ margin: "0 0 10px 0", color: "#153759", fontSize: isMobile ? "1.3rem" : "1.45rem", fontWeight: "800" }}>{selectedProfile.nama}</h3>
            
            <span style={{ padding: "6px 18px", borderRadius: "20px", fontSize: isMobile ? "0.75rem" : "0.85rem", fontWeight: "800", display: "inline-block", backgroundColor: (selectedProfile.peran === "Guru" || selectedProfile.peran === "Guru Sekolah") ? "#dbeafe" : "#ffedd5", color: (selectedProfile.peran === "Guru" || selectedProfile.peran === "Guru Sekolah") ? "#1d4ed8" : "#c2410c" }}>
              {selectedProfile.peran}
            </span>
            
            <div style={{ marginTop: "20px", padding: "15px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: isMobile ? "0.75rem" : "0.8rem", color: "#64748b", fontWeight: "800", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Asal Instansi / Kota
              </div>
              <div style={{ fontSize: isMobile ? "0.9rem" : "1rem", color: "#334155", fontWeight: "700", lineHeight: "1.4" }}>
                {selectedProfile.lokasi || "Lokasi belum diatur"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}