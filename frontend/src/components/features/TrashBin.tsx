import React, { useState, useEffect } from "react";
import { DATABASE_GIZI } from "../../lib/constants";

// Definisi Tipe Data Props
interface TrashBinProps {
  trashEntries: any[];
  filteredTrashEntries: any[];
  isAdmin: boolean;
  searchQueryTrash: string;
  setSearchQueryTrash: (query: string) => void;
  handleRestore: (id: number) => void;
  handleHardDelete: (id: number) => void;
}

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

export default function TrashBin({
  trashEntries,
  filteredTrashEntries,
  isAdmin,
  searchQueryTrash,
  setSearchQueryTrash,
  handleRestore,
  handleHardDelete,
}: TrashBinProps) {
  
  const LEBAR_KOLOM_MENU = "700px"; 
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
  }, [searchQueryTrash]);

  const displayedTrashLogs = filteredTrashEntries.slice(0, visibleCount);

  const toggleRow = (index: number) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((i) => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  return (
    <div className="dash-view active" style={{ width: "100%", maxWidth: "100%", padding: isMobile ? "0 20px 60px 20px" : "0 20px 40px 20px", minHeight: "100vh", boxSizing: "border-box" }}>
      <div className="log-section" style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
        
        <div style={{ marginBottom: isMobile ? "1rem" : "2rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ backgroundColor: "#153759", color: "white", padding: "12px 30px", borderRadius: "30px", fontWeight: "700", fontSize: isMobile ? "1.05rem" : "1.25rem", marginBottom: "12px", display: "inline-flex", alignItems: "center", gap: "10px", boxShadow: "0 6px 15px rgba(21, 55, 89, 0.25)" }}>
            <img src="/assets/icon-trash.png" alt="Ikon" style={{ width: "35px", height: "35px", objectFit: "contain" }} /> 
            Data Terhapus
          </div>
          <p style={{ fontSize: isMobile ? "0.85rem" : "1rem", color: "#153759", margin: "0 0 15px 0", fontWeight: "500", lineHeight: "1.8" }}>Item akan dihapus permanen secara otomatis setelah 7 hari.</p>
          
          <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: "5px" }}>
            <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
              <img src="/assets/icon-search.png" alt="Search Icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "20px", height: "20px", objectFit: "contain" }} />
              <input 
                type="text" 
                placeholder={isAdmin ? "Cari pemeriksa atau lokasi..." : "Cari makanan atau lokasi..."} 
                value={searchQueryTrash} 
                onChange={(e) => setSearchQueryTrash(e.target.value)} 
                style={{ width: "100%", padding: "12px 12px 12px 44px", borderRadius: "8px", border: "1px solid rgba(21, 55, 89, 0.2)", outline: "none", fontSize: isMobile ? "0.9rem" : "1.05rem", color: "#153759", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontWeight: "600" }} 
              />
            </div>
          </div>
        </div>
        
        <div className="table-container shadow-sm border border-gray-200 rounded-xl overflow-x-auto bg-white" style={{ width: "100%", maxWidth: "100%" }}>
          <table className="log-table" style={{ width: "100%", minWidth: isAdmin ? (isMobile ? "850px" : "1050px") : (isMobile ? "650px" : "900px"), textAlign: "left", borderCollapse: "collapse" }}>
            
            <thead style={{ backgroundColor: "#153759", color: "white" }}>
              <tr>
                <th style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "600", whiteSpace: "nowrap", width: "auto", fontSize: isMobile ? "0.85rem" : "1rem" }}>Waktu Dihapus & Lokasi GPS</th>
                <th style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "600", whiteSpace: "nowrap", width: isMobile ? "240px" : LEBAR_KOLOM_MENU, fontSize: isMobile ? "0.85rem" : "1rem" }}>Detail Menu & Gizi</th>
                {isAdmin && <th style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "600", textAlign: "center", whiteSpace: "nowrap", width: isMobile ? "130px" : "150px", fontSize: isMobile ? "0.85rem" : "1rem" }}>Peran & Asal</th>}
                {isAdmin && <th style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "600", whiteSpace: "nowrap", width: isMobile ? "140px" : "160px", fontSize: isMobile ? "0.85rem" : "1rem" }}>Pemeriksa</th>}
                <th style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "600", textAlign: "center", whiteSpace: "nowrap", width: "120px", fontSize: isMobile ? "0.85rem" : "1rem" }}>Tersisa</th>
                {!isAdmin && <th style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "600", textAlign: "center", whiteSpace: "nowrap", width: "180px", fontSize: isMobile ? "0.85rem" : "1rem" }}>Tindakan</th>}
              </tr>
            </thead>
            
            <tbody style={{ borderTop: "1px solid #f3f4f6" }}>
              {displayedTrashLogs.length > 0 ? (
                displayedTrashLogs.map((log, i) => {
                  const diff = new Date().getTime() - new Date(log.deleted_at).getTime();
                  const daysLeft = 7 - Math.floor(diff / (1000 * 3600 * 24));
                  const parsedItems = parseMakananData(log.jenis_makanan);
                  const isExpanded = expandedRows.includes(i);
                  
                  // Logika Validasi UI dari Status DB
                  const statusDB = (log.status || "").toUpperCase();
                  let isLayak = true;
                  let statusKeamananUI = "Layak Konsumsi";
                  let statusGiziUI = "gizi terpenuhi";

                  if (statusDB.includes("BASI") || statusDB.includes("TIDAK LAYAK")) {
                    isLayak = false;
                    statusKeamananUI = "Tidak Layak Konsumsi";
                    statusGiziUI = "gizi tidak terpenuhi";
                  } else if (statusDB.includes("KURANG KALORI")) {
                    isLayak = true;
                    statusKeamananUI = "Layak Konsumsi";
                    statusGiziUI = "gizi tidak terpenuhi";
                  }

                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: "white", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}>
                      
                      <td style={{ padding: isMobile ? "15px" : "16px 14px", verticalAlign: "top" }}>
                        <div style={{ fontSize: isMobile ? "0.8rem" : "0.95rem", color: "#334155", fontWeight: "700", marginBottom: "6px" }}>
                          {new Date(log.deleted_at).toLocaleString("id-ID")}
                        </div>
                        <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: "#64748b", display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                            <img src="/assets/icon-lokasi.png" alt="Lokasi" style={{ width: "14px", height: "14px", objectFit: "contain", marginTop: "2px" }} />
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
                              width: "100%", minWidth: isMobile ? "180px" : "200px",
                              display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px",
                              padding: isMobile ? "8px 16px" : "10px 20px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1",
                              borderRadius: "8px", cursor: "pointer", outline: "none", transition: "all 0.2s ease",
                              whiteSpace: "nowrap" 
                            }}
                          >
                            <span style={{ fontSize: isMobile ? "0.85rem" : "0.95rem", fontWeight: "700", color: "#153759" }}>
                              Lihat Menu ({parsedItems.length} Item)
                            </span>
                            <span style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: "#64748b", fontWeight: "bold" }}>
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
                                  
                                  {item.gizi ? (
                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                      <span style={{ backgroundColor: "white", padding: "4px 8px", borderRadius: "6px", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: "700", color: "#475569", border: "1px solid #cbd5e1" }}>Kal: {item.gizi.kalori}</span>
                                      <span style={{ backgroundColor: "white", padding: "4px 8px", borderRadius: "6px", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: "700", color: "#475569", border: "1px solid #cbd5e1" }}>Pro: {item.gizi.protein}g</span>
                                      <span style={{ backgroundColor: "white", padding: "4px 8px", borderRadius: "6px", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: "700", color: "#475569", border: "1px solid #cbd5e1" }}>Lem: {item.gizi.lemak}g</span>
                                      <span style={{ backgroundColor: "white", padding: "4px 8px", borderRadius: "6px", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: "700", color: "#475569", border: "1px solid #cbd5e1" }}>Kar: {item.gizi.karbo}g</span>
                                    </div>
                                  ) : (
                                    <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.8rem" }}>-</span>
                                  )}
                                </div>
                              ))}
                              
                              {/* --- MODIFIKASI STATUS KELAYAKAN & GIZI --- */}
                              <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px dashed #cbd5e1", paddingTop: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                                  <span style={{ fontSize: isMobile ? "0.8rem" : "0.85rem", fontWeight: "700", color: "#64748b" }}>Status Kelayakan:</span>
                                  <span style={{
                                    fontSize: isMobile ? "0.65rem" : "0.75rem",
                                    fontWeight: "800",
                                    padding: "4px 10px",
                                    borderRadius: "20px",
                                    backgroundColor: isLayak ? "#dcfce7" : "#fee2e2",
                                    color: isLayak ? "#16a34a" : "#dc2626",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                  }}>
                                    <img src={isLayak ? "/assets/icon-checklist.png" : "/assets/icon-silang.png"} alt="Status" style={{ width: "12px", height: "12px", objectFit: "contain" }} />
                                    {statusKeamananUI}
                                  </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: isMobile ? "0.8rem" : "0.85rem", fontWeight: "700", color: "#64748b" }}>Total Kalori Nampan:</span>
                                  <span style={{ fontSize: isMobile ? "0.85rem" : "1rem", fontWeight: "800", color: "#1e293b" }}>
                                    {log.kalori || 0} <span style={{ fontSize: isMobile ? "0.65rem" : "0.8rem", fontWeight: "700", color: "#334155" }}>kkal ({statusGiziUI})</span>
                                  </span>
                                </div>
                              </div>
                              {/* ----------------------------------------- */}

                            </div>
                          )}
                        </div>
                      </td>

                      {isAdmin && (
                        <td style={{ padding: isMobile ? "15px" : "16px 14px", textAlign: "center", verticalAlign: "top" }}>
                          <button 
                            onClick={() => setSelectedProfile({ nama: log.pegawai_nama, peran: log.peran || log.role, lokasi: log.lokasi, gender: log.jenis_kelamin })}
                            title="Klik untuk melihat detail profil"
                            style={{ 
                              background: "transparent", border: "none", cursor: "pointer", padding: "0",
                              transition: "transform 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                          >
                            <span style={{
                              padding: "6px 14px", borderRadius: "20px", fontSize: isMobile ? "13px" : "0.9rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px",
                              backgroundColor: (log.role === "Guru" || log.role === "Guru Sekolah" || log.peran === "Guru") ? "#dbeafe" : "#ffedd5",
                              color: (log.role === "Guru" || log.role === "Guru Sekolah" || log.peran === "Guru") ? "#1d4ed8" : "#c2410c",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)", whiteSpace: "nowrap"
                            }}>
                              {log.peran === "Pegawai SPPG" ? "Pegawai SPPG" : (log.peran || log.role || "Pegawai SPPG")}
                              <span style={{ fontSize: "11px", opacity: 0.6, marginTop: "1px" }}>▼</span>
                            </span>
                          </button>
                        </td>
                      )}
                      
                      {isAdmin && <td style={{ padding: isMobile ? "15px" : "16px 14px", fontWeight: "800", color: "#153759", verticalAlign: "top", fontSize: isMobile ? "0.85rem" : "1rem" }}>{log.pegawai_nama}</td>}

                      <td style={{ padding: isMobile ? "15px" : "16px 14px", textAlign: "center", fontWeight: "800", color: "#153759", verticalAlign: "top", fontSize: isMobile ? "0.9rem" : "1.05rem" }}>
                        {daysLeft} Hari
                      </td>

                      {!isAdmin && (
                        <td style={{ padding: isMobile ? "15px" : "16px 14px", textAlign: "center", verticalAlign: "top" }}>
                          <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                            <button onClick={() => handleRestore(log.id)} style={{ background: "#2ecc71", color: "white", border: "none", padding: isMobile ? "6px 12px" : "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "800", fontSize: isMobile ? "0.75rem" : "0.95rem", boxShadow: "0 2px 6px rgba(46, 204, 113, 0.2)", whiteSpace: "nowrap" }}>Pulihkan</button>
                            <button onClick={() => handleHardDelete(log.id)} style={{ background: "#e74c3c", color: "white", border: "none", padding: isMobile ? "6px 12px" : "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "800", fontSize: isMobile ? "0.75rem" : "0.95rem", boxShadow: "0 2px 6px rgba(231, 76, 60, 0.2)", whiteSpace: "nowrap" }}>Hapus</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "1rem", fontWeight: "600" }}>
                    Keranjang sampah kosong.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(filteredTrashEntries.length > visibleCount || visibleCount > 5) && (
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

            {filteredTrashEntries.length > visibleCount && (
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
              {selectedProfile.peran === "Pegawai SPPG" ? "Pegawai SPPG" : selectedProfile.peran}
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