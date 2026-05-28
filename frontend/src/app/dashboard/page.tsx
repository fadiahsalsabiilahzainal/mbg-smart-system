"use client";

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { DATABASE_GIZI } from "../../lib/constants";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import LogHistory from "../../components/features/LogHistory";
import TrashBin from "../../components/features/TrashBin";
import AdminApproval from "../../components/features/AdminApproval";
import UserProfile from "../../components/features/UserProfile";
import CameraScanner from "../../components/features/CameraScanner";
import DashboardModals from "../../components/ui/DashboardModals";
import DashboardHome from "../../components/features/DashboardHome";

export default function DashboardPage() {
  const router = useRouter();

  // Konfigurasi API
  const FONNTE_TOKEN = "4RfHCsUiw93xYJCoYVrz"; 
  const EMAILJS_SERVICE_ID = "service_yml4pje";
  const EMAILJS_TEMPLATE_ID = "template_bwpq55k";
  const EMAILJS_PUBLIC_KEY = "taYt9HZyJVptfAQP9";

  // State Utama
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activePage, setActivePage] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // State Data
  const [logEntries, setLogEntries] = useState<any[]>([]);
  const [trashEntries, setTrashEntries] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, segar: 0, basi: 0 });
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);

  // State Search
  const [searchQueryLog, setSearchQueryLog] = useState("");
  const [searchQueryPending, setSearchQueryPending] = useState("");
  const [searchQueryTrash, setSearchQueryTrash] = useState("");

  // State Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ nama_lengkap: "", lokasi: "", no_hp: "", jenis_kelamin: "", email: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: 0, type: "hard" });
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    isOpen: false,
    targetId: "",
    newStatus: "approved" as "approved" | "ditolak",
    nama: ""
  });

  // Auth & Initialization
  useEffect(() => {
    const userStr = localStorage.getItem("mbg_user");
    if (!userStr) {
      router.push("/");
    } else {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      if (user.role === "Admin") {
        setActivePage("home");
      } else {
        setActivePage("camera");
      }
    }
  }, [router]);

  // Data Fetching
  const fetchLogs = async () => {
    if (!currentUser) return;
    try {
      let query = supabase
        .from("riwayat")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (currentUser.role !== "Admin") {
        query = query.eq("pegawai_nama", currentUser.nama_lengkap); // INI SUDAH DIPERBAIKI (sebelumnya pe_nama)
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        setLogEntries(data);
        let segarCount = 0;
        let basiCount = 0;
        data.forEach(log => {
            if(log.status === "SEGAR") segarCount++;
            if(log.status === "BASI") basiCount++;
        });
        setStats({ total: data.length, segar: segarCount, basi: basiCount });
      }
    } catch (err: any) {
      console.error("Gagal mengambil riwayat:", err.message);
    }
  };

  const fetchTrash = async () => {
    if (!currentUser) return;
    try {
      let query = supabase
        .from("riwayat")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (currentUser.role !== "Admin") {
        query = query.eq("pegawai_nama", currentUser.nama_lengkap);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        const now = new Date().getTime();
        const validTrash = [];

        for (const item of data) {
          const deleteDate = new Date(item.deleted_at).getTime();
          const diffDays = (now - deleteDate) / (1000 * 3600 * 24);

          if (diffDays >= 7) {
            await supabase.from("riwayat").delete().eq("id", item.id);
          } else {
            validTrash.push(item);
          }
        }
        setTrashEntries(validTrash);
      }
    } catch (err: any) {
      console.error("Gagal memuat keranjang sampah:", err.message);
    }
  };

  const fetchPendingUsers = async () => {
    setIsLoadingPending(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setPendingUsers(data);
    } catch (err: any) {
      console.error("Gagal memuat data pending:", err.message);
    } finally {
      setIsLoadingPending(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return; 
    if (activePage === "log" || activePage === "home") fetchLogs();
    if (activePage === "sampah") fetchTrash();
    if (activePage === "approval") fetchPendingUsers(); 
  }, [activePage, currentUser]);

  // Handlers: CRUD Operations
  const handleSoftDelete = (id: number) => setDeleteConfirm({ isOpen: true, id: id, type: "soft" });
  const handleHardDelete = (id: number) => setDeleteConfirm({ isOpen: true, id: id, type: "hard" });

  const processDelete = async () => {
    const { id, type } = deleteConfirm;
    setDeleteConfirm({ ...deleteConfirm, isOpen: false }); 
    try {
      if (type === "soft") {
        const { error } = await supabase.from("riwayat").update({ deleted_at: new Date().toISOString() }).eq("id", id);
        if (error) throw error;
        showToast("Data dipindahkan ke Tempat Sampah.");
        fetchLogs();
      } else {
        const { error } = await supabase.from("riwayat").delete().eq("id", id);
        if (error) throw error;
        showToast("Data dihapus permanen.");
        fetchTrash();
      }
    } catch (err: any) { alert(`Gagal menghapus data: ${err.message}`); }
  };

  const handleRestore = async (id: number) => {
    try {
      const { error } = await supabase.from("riwayat").update({ deleted_at: null }).eq("id", id);
      if (error) throw error;
      showToast("Data berhasil dikembalikan!");
      fetchTrash();
    } catch (err: any) { alert("Gagal mengembalikan data: " + err.message); }
  };

  const handleUpdateStatusPegawai = (id: string, newStatus: "approved" | "ditolak", nama: string) => {
    setConfirmModalConfig({ isOpen: true, targetId: id, newStatus: newStatus, nama: nama });
  };

  const processStatusUpdate = async () => {
    const { targetId, newStatus, nama } = confirmModalConfig;
    try {
      const { error } = await supabase.from("users").update({ status: newStatus }).eq("id", targetId);
      if (error) throw error;
      showToast(`Status ${nama} diubah menjadi ${newStatus.toUpperCase()}`);
      setPendingUsers(pendingUsers.filter(user => user.id !== targetId));
    } catch (err: any) { alert("Gagal mengubah status: " + err.message); } 
    finally { setConfirmModalConfig({ ...confirmModalConfig, isOpen: false }); }
  };

  // Logic: Filters
  const filteredLogs = logEntries.filter((log) => {
    if (!searchQueryLog) return true;
    const query = searchQueryLog.toLowerCase();
    return (
      (log.jenis_makanan?.toLowerCase().includes(query)) ||
      (log.pegawai_nama?.toLowerCase().includes(query)) ||
      (log.status?.toLowerCase().includes(query)) ||
      (log.lokasi?.toLowerCase().includes(query)) ||        
      (log.koordinat_lokasi?.toLowerCase().includes(query))  
    );
  });

  const filteredPendingUsers = pendingUsers.filter((user) => {
    if (!searchQueryPending) return true;
    const query = searchQueryPending.toLowerCase();
    return (
      (user.nama_lengkap?.toLowerCase().includes(query)) ||
      (user.username?.toLowerCase().includes(query)) ||
      (user.lokasi?.toLowerCase().includes(query))
    );
  });

  const filteredTrashEntries = trashEntries.filter((log) => {
    if (!searchQueryTrash) return true;
    const query = searchQueryTrash.toLowerCase();
    return (
      (log.jenis_makanan?.toLowerCase().includes(query)) ||
      (log.pegawai_nama?.toLowerCase().includes(query)) ||
      (log.status?.toLowerCase().includes(query))
    );
  });

  // Handlers: Export
  const handleExportExcel = () => {
    if (filteredLogs.length === 0) { alert("Belum ada data."); return; }
    let csv = "\uFEFFWaktu;Status;Daftar Makanan;Peran;Lokasi / Instansi;Pemeriksa;Akurasi;Kalori (kkal);Protein (g);Lemak (g);Karbo (g);Koordinat GPS\n";
    filteredLogs.forEach((log) => {
      const d = new Date(log.created_at);
      const waktu = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
      const makananAman = `"${(log.jenis_makanan || "").replace(/"/g, '""').replace(/\n/g, ", ")}"`;
      const instansiAman = `"${(log.lokasi || "-").replace(/"/g, '""')}"`;
      const gpsAman = `"${(log.koordinat_lokasi || "-").replace(/"/g, '""').replace(/\n/g, " ")}"`;
      const peranAman = log.peran || "Pegawai SPPG";
      csv += `${waktu};${log.status};${makananAman};${peranAman};${instansiAman};${log.pegawai_nama};${Math.round(log.confidence * 100)}%;${log.kalori};${log.protein};${log.lemak};${log.karbo};${gpsAman}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_MBG_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleExportPDF = () => {
    try {
      if (!currentUser) return;
      const isAdminUser = currentUser.role === "Admin";
      const doc = new jsPDF('l', 'mm', 'a4');
      doc.setFontSize(16);
      doc.setTextColor(21, 55, 89); 
      doc.setFont('helvetica', 'bold');
      doc.text(isAdminUser ? "Laporan Riwayat (Admin)" : "Laporan Riwayat (Pegawai)", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 27);

      const tableColumn = isAdminUser 
        ? ["Waktu", "Lokasi GPS", "Menu & Gizi", "Peran", "Pemeriksa", "Akurasi"]
        : ["Waktu", "Lokasi GPS", "Menu & Gizi", "Akurasi"];

      const tableRows = filteredLogs.map((log) => {
        const waktu = new Date(log.created_at).toLocaleString("id-ID");
        const lokasi = log.koordinat_lokasi ? log.koordinat_lokasi.replace(/\n/g, " \n") : (log.lokasi || "-");
        
        const menuList = (log.jenis_makanan || "").split('\n').map((line: string, idx: number) => {
          const parts = line.split(' - ');
          let rawName = parts[0].replace(/^\d+\.\s*/, '').trim(); 
          const statusRaw = parts.length === 2 ? parts[1].trim() : "";
          const displayName = rawName.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
          
          let giziText = "(Data gizi tidak tersedia)";
          if (DATABASE_GIZI) {
            const dbValues = Object.values(DATABASE_GIZI) as any[];
            const foundGizi = dbValues.find((item: any) => item.nama.toLowerCase() === rawName.toLowerCase() || item.nama.toLowerCase().includes(rawName.toLowerCase()));
            if (foundGizi) giziText = `(Kal: ${foundGizi.kalori} | Pro: ${foundGizi.protein}g | Lem: ${foundGizi.lemak}g)`;
          }
          return `${idx + 1}. ${displayName}${statusRaw ? ` - ${statusRaw.toUpperCase()}` : ''}\n ${giziText}`;
        });

        const detailMenu = `${menuList.join('\n\n')}\n\nTotal: ${log.kalori || 0} kkal`;
        const akurasi = `${Math.round(log.confidence * 100)}%`;

        return isAdminUser ? [waktu, lokasi, detailMenu, log.peran || "Pegawai", log.pegawai_nama, akurasi] : [waktu, lokasi, detailMenu, akurasi];
      });

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 33, theme: 'grid', styles: { fontSize: 8 } });
      doc.save(`Laporan_MBG_${Date.now()}.pdf`);
    } catch (error) { console.error("PDF Error:", error); alert("Gagal cetak PDF!"); }
  };
  
  // Auth & Profile Handlers
  const handleLogoutClick = () => { setIsLogoutModalOpen(true); setIsSidebarOpen(false); };
  const confirmLogout = () => { localStorage.removeItem("mbg_user"); router.push("/"); };
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 3000); };
  
  const openEditModal = () => {
    setEditForm({
      nama_lengkap: currentUser.nama_lengkap || "",
      lokasi: currentUser.lokasi || "",
      no_hp: currentUser.no_hp || "",
      jenis_kelamin: currentUser.jenis_kelamin || "",
      email: currentUser.email || "" 
    });
    setIsEditModalOpen(true);
  };
  
  const handleSaveProfil = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSavingProfile(true);
    try {
      const { data, error } = await supabase.from("users").update({ 
        nama_lengkap: editForm.nama_lengkap, 
        lokasi: editForm.lokasi, 
        no_hp: editForm.no_hp,
        jenis_kelamin: editForm.jenis_kelamin 
      }).eq("username", currentUser.username).select().single();
      if (error) throw error;
      localStorage.setItem("mbg_user", JSON.stringify(data)); setCurrentUser(data); setIsEditModalOpen(false); showToast("Profil diperbarui!");
    } catch (err: any) { alert("Gagal menyimpan: " + err.message); } finally { setIsSavingProfile(false); }
  };

  if (!currentUser) return null;
  const isAdmin = currentUser.role === "Admin";

  // Menampilkan ke Layar
  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .bg-laptop { display: none !important; }
            .bg-hp { display: block !important; }
            .force-desktop-view { min-width: 1024px !important; padding-right: 20px !important; }
          }
          @media (min-width: 769px) {
            .bg-laptop { display: block !important; }
            .bg-hp { display: none !important; }
          }
        `}
      </style>

      <div className="bg-laptop" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 }}></div>

      <div className="bg-hp" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1, overflow: "hidden", filter: "blur(0.5px)", opacity: 0.6 }}>
      </div>
      
      <div className="dashboard-wrapper" style={{ backgroundColor: "#dfecf7" }}>
        <button className="hamburger" onClick={() => setIsSidebarOpen(true)}>☰</button>
        <Sidebar 
          currentUser={currentUser} 
          activePage={activePage} 
          setActivePage={setActivePage} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          handleLogoutClick={handleLogoutClick} 
        />

        <main className="main-content" style={{ zIndex: 10, position: "relative", background: "transparent", width: "100%", overflowX: activePage === "home" ? "auto" : "hidden" }}>
          <div className={activePage === "home" ? "force-desktop-view" : ""} style={{ width: "100%" }}>
            
            <Topbar activePage={activePage} isAdmin={isAdmin} />

            <div className="dashboard-body">
              {activePage === "home" && <DashboardHome isAdmin={isAdmin} logEntries={logEntries} />}
              {activePage === "camera" && !isAdmin && <CameraScanner currentUser={currentUser} onSaveSuccess={fetchLogs} showToast={showToast} />}
              {activePage === "approval" && isAdmin && <AdminApproval pendingUsers={pendingUsers} filteredPendingUsers={filteredPendingUsers} searchQueryPending={searchQueryPending} setSearchQueryPending={setSearchQueryPending} handleUpdateStatusPegawai={handleUpdateStatusPegawai} />}
              {activePage === "log" && <LogHistory logEntries={logEntries} filteredLogs={filteredLogs} isAdmin={isAdmin} searchQueryLog={searchQueryLog} setSearchQueryLog={setSearchQueryLog} handleExportExcel={handleExportExcel} handleExportPDF={handleExportPDF} handleSoftDelete={handleSoftDelete} />}
              {activePage === "sampah" && <TrashBin trashEntries={trashEntries} filteredTrashEntries={filteredTrashEntries} isAdmin={isAdmin} searchQueryTrash={searchQueryTrash} setSearchQueryTrash={setSearchQueryTrash} handleRestore={handleRestore} handleHardDelete={handleHardDelete} />}
              {activePage === "profil" && <UserProfile currentUser={currentUser} openEditModal={openEditModal} />}
            </div>
          </div>
        </main>

        <DashboardModals 
          isEditModalOpen={isEditModalOpen} setIsEditModalOpen={setIsEditModalOpen} editForm={editForm} setEditForm={setEditForm} handleSaveProfil={handleSaveProfil} isSavingProfile={isSavingProfile}
          deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm} processDelete={processDelete}
          confirmModalConfig={confirmModalConfig} setConfirmModalConfig={setConfirmModalConfig} processStatusUpdate={processStatusUpdate}
          isLogoutModalOpen={isLogoutModalOpen} setIsLogoutModalOpen={setIsLogoutModalOpen} confirmLogout={confirmLogout} toastMsg={toastMsg}
        />
      </div>
    </>
  );
}