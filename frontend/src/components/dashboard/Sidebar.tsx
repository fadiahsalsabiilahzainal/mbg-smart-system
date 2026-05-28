import React from "react";

interface SidebarProps {
  currentUser: any;
  activePage: string;
  setActivePage: (page: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  handleLogoutClick: () => void;
}

export default function Sidebar({
  currentUser,
  activePage,
  setActivePage,
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogoutClick
}: SidebarProps) {
  if (!currentUser) return null;
  const isAdmin = currentUser.role === "Admin";

  return (
    <>
      <div className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`} onClick={() => setIsSidebarOpen(false)}></div>
      
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`} style={{ display: "flex", flexDirection: "column", height: "100vh", maxHeight: "100vh", boxSizing: "border-box" }}>
        
        <div className="sidebar-brand" style={{ flexShrink: 0 }}>
          <h2 style={{ fontSize: "1.05rem", whiteSpace: "nowrap", marginBottom: "4px" }}>Makan Bergizi Gratis</h2>
          <p>Smart System</p>
        </div>

        <nav className="sidebar-nav" style={{ flex: "1 1 auto", overflowY: "auto" }}>
          <button className={`nav-item ${activePage === "home" ? "active" : ""}`} onClick={() => { setActivePage("home"); setIsSidebarOpen(false); }}>
            <img src="/assets/icon-home.png" alt="Home" style={{ width: "30px", height: "30px", objectFit: "contain", marginRight: "8px" }} /> Halaman Utama
          </button>

          {!isAdmin && (
            <button className={`nav-item ${activePage === "camera" ? "active" : ""}`} onClick={() => { setActivePage("camera"); setIsSidebarOpen(false); }}>
              <img src="/assets/icon-camera-utama.png" alt="Kamera" style={{ width: "30px", height: "30px", objectFit: "contain", marginRight: "8px" }} /> Kamera Deteksi
            </button>
          )}

          {isAdmin && (
            <button className={`nav-item ${activePage === "approval" ? "active" : ""}`} onClick={() => { setActivePage("approval"); setIsSidebarOpen(false); }}>
              <img src="/assets/icon-verifikasi.png" alt="Verifikasi" style={{ width: "35px", height: "35px", objectFit: "contain", marginRight: "8px" }} /> Verifikasi Pegawai
            </button>
          )}

          <button className={`nav-item ${activePage === "log" ? "active" : ""}`} onClick={() => { setActivePage("log"); setIsSidebarOpen(false); }}>
            <img src="/assets/icon-logriwayat.png" alt="Log" style={{ width: "30px", height: "30px", objectFit: "contain", marginRight: "8px" }} /> Log Riwayat
          </button>

          <button className={`nav-item ${activePage === "sampah" ? "active" : ""}`} onClick={() => { setActivePage("sampah"); setIsSidebarOpen(false); }}>
            <img src="/assets/icon-trashutama.png" alt="Sampah" style={{ width: "28px", height: "28px", objectFit: "contain", marginRight: "8px" }} /> Data Terhapus
          </button>

          <button className={`nav-item ${activePage === "profil" ? "active" : ""}`} onClick={() => { setActivePage("profil"); setIsSidebarOpen(false); }}>
            <img src="/assets/icon-profile.png" alt="Profil" style={{ width: "28px", height: "28px", objectFit: "contain", marginRight: "8px" }} /> Akun Saya
          </button>
        </nav>

        <div className="sidebar-footer" style={{ flexShrink: 0, marginTop: "auto", paddingBottom: "15px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "-10px" }}>
            
            <div className="profile-badge" style={{ order: 1, width: "100%" }}>
              {currentUser.jenis_kelamin && (
                <div className="profile-avatar-wrapper">
                  <div className="profile-avatar" style={{ overflow: "hidden", border: "none" }}>
                    {currentUser.jenis_kelamin === "Laki-laki" ? (
                      <img src="/assets/icon-cowo.png" alt="Cowo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <img src="/assets/icon-cewe.png" alt="Cewe" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <div className="status-dot" title="Online"></div>
                </div>
              )}
              <div className="profile-info">
                <div className="profile-name">{currentUser.nama_lengkap}</div>
                <div className="profile-label">{currentUser.role}</div>
              </div>
            </div>

            <button className="btn-logout" onClick={handleLogoutClick} style={{ order: 2, width: "100%", fontSize: "1.1rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
              <img src="/assets/icon-keluar.png" alt="Keluar" style={{ width: "24px", height: "24px", objectFit: "contain", marginRight: "8px" }} />
              Keluar
            </button>

          </div>
        </div>
      </aside>
    </>
  );
}