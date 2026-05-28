import React from "react";

// Komponen Modal Dashboard (Edit Profil, Konfirmasi Hapus, Status, Logout)
export default function DashboardModals({
  isEditModalOpen, setIsEditModalOpen, editForm, setEditForm, handleSaveProfil, isSavingProfile,
  deleteConfirm, setDeleteConfirm, processDelete,
  confirmModalConfig, setConfirmModalConfig, processStatusUpdate,
  isLogoutModalOpen, setIsLogoutModalOpen, confirmLogout, toastMsg
}: any) {
  
  return (
    <>
      {isEditModalOpen && (
        <div className="modal-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "#153759", color: "#ffffff", borderRadius: "16px", padding: "2rem", width: "90%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255, 0.1)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontWeight: "700", fontSize: "1.2rem", marginBottom: "1.5rem", color: "#ffffff" }}>
              <img src="/assets/icon-user.png" alt="Ikon Edit Profil" style={{ width: "35px", height: "35px", objectFit: "contain" }} /><span>Edit Profil Saya</span>
            </div>
            <form onSubmit={handleSaveProfil} style={{ width: "100%" }}>
              <div style={{ width: "100%", marginBottom: "1rem", textAlign: "left" }}>
                <label style={{ color: "rgba(255,255,255, 0.8)", fontWeight: "600", marginBottom: "6px", display: "block" }}>Nama Lengkap</label>
                <input type="text" value={editForm.nama_lengkap} onChange={(e) => setEditForm({ ...editForm, nama_lengkap: e.target.value })} required style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "rgba(255,255,255, 0.05)", color: "#ffffff", border: "1px solid rgba(255,255,255, 0.2)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ width: "100%", marginBottom: "1rem", textAlign: "left" }}>
                <label style={{ color: "rgba(255,255,255, 0.8)", fontWeight: "600", marginBottom: "6px", display: "block" }}>Alamat Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "rgba(255,255,255, 0.05)", color: "#ffffff", border: "1px solid rgba(255,255,255, 0.2)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ width: "100%", marginBottom: "1rem", textAlign: "left" }}>
                <label style={{ color: "rgba(255,255,255, 0.8)", fontWeight: "600", marginBottom: "6px", display: "block" }}>Jenis Kelamin</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" onClick={() => setEditForm({ ...editForm, jenis_kelamin: "Laki-laki" })} style={{ flex: 1, padding: "10px", borderRadius: "6px", background: editForm.jenis_kelamin === "Laki-laki" ? "#2ecc71" : "rgba(255,255,255, 0.05)", color: "#ffffff", border: editForm.jenis_kelamin === "Laki-laki" ? "none" : "1px solid rgba(255,255,255, 0.2)", outline: "none", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><img src="/assets/icon-cowo.png" alt="Icon Cowo" style={{ width: "23px", height: "23px", objectFit: "contain" }} />Laki-laki</button>
                  <button type="button" onClick={() => setEditForm({ ...editForm, jenis_kelamin: "Perempuan" })} style={{ flex: 1, padding: "10px", borderRadius: "6px", background: editForm.jenis_kelamin === "Perempuan" ? "#2ecc71" : "rgba(255,255,255, 0.05)", color: "#ffffff", border: editForm.jenis_kelamin === "Perempuan" ? "none" : "1px solid rgba(255,255,255, 0.2)", outline: "none", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><img src="/assets/icon-cewe.png" alt="Icon Cewe" style={{ width: "25px", height: "25px", objectFit: "contain" }} />Perempuan</button>
                </div>
              </div>
              <div style={{ width: "100%", marginBottom: "1rem", textAlign: "left" }}>
                <label style={{ color: "rgba(255,255,255, 0.8)", fontWeight: "600", marginBottom: "6px", display: "block" }}>Lokasi Dapur MBG / Sekolah</label>
                <input type="text" value={editForm.lokasi} onChange={(e) => setEditForm({ ...editForm, lokasi: e.target.value })} required style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "rgba(255,255,255, 0.05)", color: "#ffffff", border: "1px solid rgba(255,255,255, 0.2)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ width: "100%", marginBottom: "1rem", textAlign: "left" }}>
                <label style={{ color: "rgba(255,255,255, 0.8)", fontWeight: "600", marginBottom: "6px", display: "block" }}>Nomor WhatsApp (Aktif)</label>
                <input type="text" value={editForm.no_hp} onChange={(e) => setEditForm({ ...editForm, no_hp: e.target.value.replace(/\D/g, "") })} required style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "rgba(255,255,255, 0.05)", color: "#ffffff", border: "1px solid rgba(255,255,255, 0.2)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem", gap: "15px" }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.4)", padding: "10px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Batal</button>
                <button type="submit" disabled={isSavingProfile} style={{ flex: 1, background: "#2ecc71", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>{isSavingProfile ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.isOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ textAlign: "center", backgroundColor: "#153759", padding: "2rem", borderRadius: "16px", color: "white", border: "1px solid rgba(255,255,255,0.1)", margin: "0 15px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <img src="/assets/icon-trashutama.png" alt="Delete Icon" style={{ width: "60px", height: "60px", objectFit: "contain" }}/>
            </div>
            <h3 className="modal-title" style={{ color: "#ffffff", fontSize: "1.3rem", marginBottom: "10px", fontWeight: "bold" }}>
              {deleteConfirm.type === "hard" ? "Hapus Permanen?" : "Pindahkan ke Sampah?"}
            </h3>
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "2rem", fontSize: "0.95rem", lineHeight: "1.5", maxWidth: "350px", margin: "0 auto 2rem" }}>
              {deleteConfirm.type === "hard" 
                ? "Peringatan: Data akan dihapus PERMANEN dan tidak dapat dikembalikan. Lanjutkan?" 
                : "Data riwayat ini akan dipindahkan ke Tempat Sampah (dapat dipulihkan kembali dalam 7 hari)."}
            </p>
            <div className="modal-actions" style={{ display: "flex", justifyContent: "center", gap: "15px", width: "100%" }}>
              <button type="button" onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })} style={{ flex: 1, background: "transparent", color: "#ffffff", border: "1px solid rgba(255,255,255,0.5)", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Batal</button>
              <button type="button" onClick={processDelete} style={{ flex: 1, background: "#e74c3c", color: "white", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {confirmModalConfig.isOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ textAlign: "center", backgroundColor: "#153759", padding: "2rem", borderRadius: "16px", color: "white", border: "1px solid rgba(255,255,255,0.1)", margin: "0 15px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <img src={confirmModalConfig.newStatus === "approved" ? "/assets/icon-verifikasi.png" : "/assets/icon-trashutama.png"} alt="Confirm Icon" style={{ width: "60px", height: "60px", objectFit: "contain" }}/>
            </div>
            <h3 className="modal-title" style={{ color: "#ffffff", fontSize: "1.3rem", marginBottom: "10px", fontWeight: "bold" }}>Konfirmasi {confirmModalConfig.newStatus === "approved" ? "Persetujuan" : "Penolakan"}</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "2rem", fontSize: "0.95rem", lineHeight: "1.5", maxWidth: "350px", margin: "0 auto 2rem" }}>Yakin ingin <strong style={{ color: confirmModalConfig.newStatus === "approved" ? "#2ecc71" : "#e74c3c" }}>{confirmModalConfig.newStatus === "approved" ? "MENERIMA" : "MENOLAK"}</strong> akses untuk pegawai bernama <strong>{confirmModalConfig.nama}</strong>?</p>
            <div className="modal-actions" style={{ display: "flex", justifyContent: "center", gap: "15px", width: "100%" }}>
              <button type="button" onClick={() => setConfirmModalConfig({ ...confirmModalConfig, isOpen: false })} style={{ flex: 1, background: "transparent", color: "#ffffff", border: "1px solid rgba(255,255,255,0.5)", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Batal</button>
              <button type="button" onClick={processStatusUpdate} style={{ flex: 1, background: confirmModalConfig.newStatus === "approved" ? "#2ecc71" : "#e74c3c", color: "white", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Ya, {confirmModalConfig.newStatus === "approved" ? "Setujui" : "Tolak"}</button>
            </div>
          </div>
        </div>
      )}

      {isLogoutModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ textAlign: "center", backgroundColor: "#153759", padding: "2rem", borderRadius: "16px", color: "white", border: "1px solid rgba(255,255,255,0.1)", margin: "0 15px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}><img src="/assets/bye.png" alt="Logout Icon" style={{ width: "80px", height: "80px", objectFit: "contain" }} /></div>
            <h3 className="modal-title" style={{ color: "#ffffff", fontSize: "1.4rem", marginBottom: "10px", fontWeight: "bold" }}>Yakin Ingin Keluar?</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "2rem", fontSize: "0.95rem", lineHeight: "1.5", maxWidth: "350px", margin: "0 auto 2rem" }}>Sesi anda akan diakhiri dan anda harus login kembali.</p>
            <div className="modal-actions" style={{ display: "flex", justifyContent: "center", gap: "15px", width: "100%" }}>
              <button type="button" onClick={() => setIsLogoutModalOpen(false)} style={{ flex: 1, background: "transparent", color: "#ffffff", border: "1px solid rgba(255,255,255,0.5)", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Batal</button>
              <button type="button" onClick={confirmLogout} style={{ flex: 1, background: "#e74c3c", color: "white", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && <div className="toast" style={{ display: "block", opacity: 1, whiteSpace: "nowrap" }}>{toastMsg}</div>}
    </>
  );
}