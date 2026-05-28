"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import bcrypt from "bcryptjs";
import emailjs from "@emailjs/browser";

export default function LoginPage() {
  const router = useRouter();

  const FONNTE_TOKEN = "4RfHCsUiw93xYJCoYVrz"; 
  const EMAILJS_SERVICE_ID = "service_yml4pje";
  const EMAILJS_TEMPLATE_ID = "template_bwpq55k";
  const EMAILJS_PUBLIC_KEY = "taYt9HZyJVptfAQP9";

  // State Ukuran Layar
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // State Autentikasi & View
  const [view, setView] = useState<"login" | "register" | "reset">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [showConfirmPassRegister, setShowConfirmPassRegister] = useState(false);

  const [popupConfig, setPopupConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    icon: "", 
    actionType: "none"
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [noHp, setNoHp] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [email, setEmail] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");

  const [roleDaftar, setRoleDaftar] = useState<"Pegawai SPPG" | "Guru">("Pegawai SPPG");
  const [sekolah, setSekolah] = useState("");

  const [daftarProvinsi, setDaftarProvinsi] = useState<any[]>([]);
  const [daftarKota, setDaftarKota] = useState<any[]>([]);
  const [provinsiTerpilih, setProvinsiTerpilih] = useState({ id: "", name: "" });
  const [searchProvinsi, setSearchProvinsi] = useState("");
  const [isProvinsiOpen, setIsProvinsiOpen] = useState(false);
  const [kotaTerpilih, setKotaTerpilih] = useState({ id: "", name: "" });
  const [searchKota, setSearchKota] = useState("");
  const [isKotaOpen, setIsKotaOpen] = useState(false);

  // Load Data Wilayah
  useEffect(() => {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then((res) => res.json())
      .then((data) => setDaftarProvinsi(data))
      .catch((err) => console.error("Gagal load provinsi", err));
  }, []);

  useEffect(() => {
    if (provinsiTerpilih.id) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinsiTerpilih.id}.json`)
        .then((res) => res.json())
        .then((data) => setDaftarKota(data))
        .catch((err) => console.error("Gagal load kota", err));
    }
  }, [provinsiTerpilih.id]);

  // State Reset Password
  const [resetStep, setResetStep] = useState(1);
  const [resetPhone, setResetPhone] = useState("");
  const [resetMethod, setResetMethod] = useState<"whatsapp" | "email">("whatsapp");
  const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");

  // Reset State Saat Ganti View
  useEffect(() => {
    setUsername("");
    setPassword("");
    setConfirmPass("");
    setNamaLengkap("");
    setNoHp("");
    setEmail(""); 
    setLokasi("");
    setJenisKelamin(""); 
    setRoleDaftar("Pegawai SPPG");
    setSekolah("");
    
    setProvinsiTerpilih({ id: "", name: "" });
    setSearchProvinsi("");
    setKotaTerpilih({ id: "", name: "" });
    setSearchKota("");
    
    setResetPhone("");
    setNewPassword("");
    setOtpInput(["", "", "", "", "", ""]);
    setErrorMsg("");
    setSuccessMsg("");
  }, [view]);

  // Fungsi Popup
  const showCustomPopup = (title: string, message: string, icon: string = "/assets/checklist.png", actionType: string = "none") => {
    setPopupConfig({ isOpen: true, title, message, icon, actionType });
  };

  const closeCustomPopup = () => {
    setPopupConfig({ ...popupConfig, isOpen: false });
    if (popupConfig.actionType === "reload") {
      window.location.reload();
    }
  };

  // Komponen Password Toggle
  const PasswordToggle = ({ isVisible, setIsVisible }: { isVisible: boolean, setIsVisible: (val: boolean) => void }) => (
    <button
      type="button"
      className="password-toggle-btn"
      onClick={() => setIsVisible(!isVisible)}
      style={{ background: "none", border: "none", padding: "0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      title={isVisible ? "Sembunyikan Sandi" : "Tampilkan Sandi"}
    >
      {isVisible ? (
        <img src="/assets/icon-mata-terbuka.png" alt="Show Password" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
      ) : (
        <img src="/assets/icon-mata-tertutup.png" alt="Hide Password" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
      )}
    </button>
  );

  // Handler Reset Password
  const handleResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!resetPhone) {
      setErrorMsg(resetMethod === "whatsapp" ? "Mohon masukkan nomor telepon Anda!" : "Mohon masukkan alamat email Anda!");
      return;
    }

    if (resetMethod === "whatsapp" && (resetPhone.startsWith("0") || !resetPhone.startsWith("62"))) {
      setErrorMsg("Nomor telepon harus diawali dengan angka 62, bukan 0!");
      return;
    }

    setIsLoading(true);

    try {
      let query = supabase.from("users").select("*");
      if (resetMethod === "whatsapp") {
        query = query.eq("no_hp", resetPhone);
      } else {
        query = query.eq("email", resetPhone.trim().toLowerCase());
      }
      
      const { data: user, error } = await query.single();
      if (error || !user) throw new Error(resetMethod === "whatsapp" ? "Nomor HP tidak ditemukan di sistem!" : "Alamat email tidak ditemukan di sistem!");

      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = new Date(Date.now() + 5 * 60000).toISOString();

      await supabase.from("users").update({ otp_code: generatedOTP, otp_expiry: expiryTime }).eq("id", user.id);
      setTargetUser(user);

      if (resetMethod === "whatsapp") {
        const response = await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: { Authorization: FONNTE_TOKEN },
          body: new URLSearchParams({
            target: resetPhone,
            message: `Halo *${user.nama_lengkap}*,\n\nKode OTP reset password MBG Smart System kamu adalah: *${generatedOTP}*\n\nBerlaku 5 menit.`,
          }),
        });
        const resData = await response.json();
        if(!resData.status) throw new Error("Gagal mengirim WA. Pastikan token Fonnte aktif.");
      } else {
        const waktuExpired = new Date();
        waktuExpired.setMinutes(waktuExpired.getMinutes() + 5);
        const jamExpired = waktuExpired.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB";

        await emailjs.send(
          EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,
          { to_name: user.nama_lengkap, passcode: generatedOTP, time: jamExpired, email: user.email },
          EMAILJS_PUBLIC_KEY
        );
      }
      setSuccessMsg(`Kode OTP berhasil dikirim ke ${resetMethod.toUpperCase()}`);
      setResetStep(2);
    } catch (err: any) { setErrorMsg(err.message); } finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async () => {
    const finalOtp = otpInput.join("");
    if (finalOtp.length < 6) return;
    setIsLoading(true);
    try {
      const { data: user } = await supabase.from("users").select("*").eq("id", targetUser.id).single();
      if (user.otp_code !== finalOtp) throw new Error("Kode OTP salah!");
      if (new Date() > new Date(user.otp_expiry)) throw new Error("Kode OTP sudah kadaluarsa!");
      setSuccessMsg("Verifikasi Berhasil! Silakan buat sandi baru.");
      setResetStep(3);
    } catch (err: any) { setErrorMsg(err.message); } finally { setIsLoading(false); }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) { setErrorMsg("Mohon masukkan sandi baru Anda!"); return; }
    if (newPassword.length < 8) { setErrorMsg("Sandi minimal 8 karakter!"); return; }
    setIsLoading(true);
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);
      await supabase.from("users").update({ password: hashedPassword, otp_code: null, otp_expiry: null }).eq("id", targetUser.id);
      showCustomPopup("Sandi Diperbarui!", "Kata sandi Anda berhasil diperbarui. Halaman akan dimuat ulang, silakan login kembali.", "/assets/checklist.png", "reload");
    } catch (err: any) { setErrorMsg(err.message); } finally { setIsLoading(false); }
  };

  // Handler Login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(""); 

    if (!username.trim() || !password) {
      setErrorMsg("Mohon lengkapi username dan kata sandi.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("users").select("*").eq("username", username.trim().toLowerCase()).single();
      if (error || !data) throw new Error("Username tidak ditemukan di sistem");
      
      const isPasswordMatch = bcrypt.compareSync(password, data.password);
      if (!isPasswordMatch) throw new Error("Kata sandi salah");

      if (data.status === "pending") throw new Error("Akun Anda sedang menunggu proses persetujuan Admin.");
      else if (data.status === "ditolak") throw new Error("Maaf, pendaftaran akun Anda ditolak oleh Admin.");

      localStorage.setItem("mbg_user", JSON.stringify(data));
      router.push("/dashboard");
    } catch (err: any) { setErrorMsg(err.message); } finally { setIsLoading(false); }
  };

  // Handler Register
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!namaLengkap || !username || !email || !noHp || !password || !confirmPass) {
      setErrorMsg("Harap isi semua kolom dengan lengkap!"); return;
    }

    if (noHp.startsWith("0") || !noHp.startsWith("62")) {
      setErrorMsg("Nomor telepon harus diawali dengan angka 62, bukan 0!"); return;
    }

    if (!jenisKelamin) {
      setErrorMsg("Harap pilih jenis kelamin Anda!"); return;
    }

    let finalLokasi = lokasi;
    if (roleDaftar === "Guru") {
      if (!provinsiTerpilih.name || !kotaTerpilih.name || !sekolah) {
        setErrorMsg("Harap isi Provinsi, Kota, and Nama Sekolah dengan lengkap!");
        return;
      }
      finalLokasi = `${sekolah}, ${kotaTerpilih.name}, ${provinsiTerpilih.name}`;
    } else {
      if (!lokasi) {
        setErrorMsg("Harap isi Lokasi Dapur MBG!");
        return;
      }
    }

    if (password !== confirmPass) { setErrorMsg("Konfirmasi kata sandi tidak cocok!"); return; }
    if (password.length < 8 || (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))) {
      setErrorMsg("Sandi harus minimal 8 karakter & mengandung huruf serta angka!"); return;
    }
    
    setIsLoading(true);
    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("username, no_hp, email")
        .or(`username.eq.${username.toLowerCase()},no_hp.eq.${noHp},email.eq.${email.toLowerCase()}`);

      if (existingUser && existingUser.length > 0) {
        if (existingUser.some(u => u.username === username.toLowerCase())) throw new Error("Username sudah digunakan!");
        if (existingUser.some(u => u.no_hp === noHp)) throw new Error("Nomor WhatsApp ini sudah terdaftar!");
        if (existingUser.some(u => u.email === email.toLowerCase())) throw new Error("Alamat Email ini sudah digunakan!");
      }
      
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      
      const { error } = await supabase.from("users").insert([{
        username: username.toLowerCase(), 
        password: hashedPassword, 
        nama_lengkap: namaLengkap, 
        email: email, 
        no_hp: noHp, 
        lokasi: finalLokasi, 
        jenis_kelamin: jenisKelamin, 
        role: roleDaftar, 
        status: "pending",
        provinsi: roleDaftar === "Guru" ? provinsiTerpilih.name : null,
        kota: roleDaftar === "Guru" ? kotaTerpilih.name : null,
        nama_sekolah: roleDaftar === "Guru" ? sekolah : null
      }]);
      if (error) throw error;
      
      showCustomPopup("Pendaftaran Berhasil!", "Akun telah didaftarkan, silakan menunggu proses persetujuan administrator sistem.", "/assets/checklist.png", "none");
      setView("login"); 
    } catch (err: any) { setErrorMsg(err.message); } finally { setIsLoading(false); }
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .bg-laptop { display: none !important; }
            .bg-hp { display: block !important; }
          }
          @media (min-width: 769px) {
            .bg-laptop { display: block !important; }
            .bg-hp { display: none !important; }
          }
        `}
      </style>

      {/* Latar Belakang Desktop */}
      <div className="bg-laptop" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1, overflow: "hidden" }}>
        <div className="food-flake" style={{ top: "8%", left: "5%", width: "90px", position: "absolute" }}><img src="/assets/tempe.png" alt="Tempe" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "20%", left: "20%", width: "90px", position: "absolute" }}><img src="/assets/tahu.png" alt="Tahu" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "40%", left: "7%", width: "90px", position: "absolute" }}><img src="/assets/apel.png" alt="Apel" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "50%", left: "25%", width: "130px", position: "absolute" }}><img src="/assets/ikan.png" alt="Ikan" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "70%", left: "10%", width: "100px", position: "absolute" }}><img src="/assets/nasi.png" alt="Nasi" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "85%", left: "20%", width: "100px", position: "absolute" }}><img src="/assets/telur.png" alt="Telur" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "5%", left: "30%", width: "130px", position: "absolute" }}><img src="/assets/ayam.png" alt="Ayam" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "3%", left: "50%", width: "100px", position: "absolute" }}><img src="/assets/brokoli.png" alt="Brokoli" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "85%", left: "40%", width: "120px", position: "absolute" }}><img src="/assets/wortel.png" alt="Wortel" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "80%", left: "60%", width: "100px", position: "absolute" }}><img src="/assets/pisang.png" alt="Pisang" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "7%", right: "7%", width: "100px", position: "absolute" }}><img src="/assets/Nasi.png" alt="Nasi" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "40%", right: "3%", width: "100px", position: "absolute" }}><img src="/assets/pisang.png" alt="Pisang" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "15%", right: "25%", width: "100px", position: "absolute" }}><img src="/assets/telur.png" alt="Telur" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "30%", right: "15%", width: "90px", position: "absolute" }}><img src="/assets/tempe.png" alt="Tempe" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "45%", right: "20%", width: "130px", position: "absolute" }}><img src="/assets/ayam.png" alt="Ayam" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "70%", right: "7%", width: "90px", position: "absolute" }}><img src="/assets/apel.png" alt="Apel" style={{ width: "100%", height: "auto" }} /></div>
        <div className="food-flake" style={{ top: "80%", right: "20%", width: "90px", position: "absolute" }}><img src="/assets/tahu.png" alt="Tahu" style={{ width: "100%", height: "auto" }} /></div>
      </div>

      {/* Latar Belakang Mobile */}
      <div className="bg-hp" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1, overflow: "hidden", filter: "blur(0.5px)", opacity: 0.6 }}>
        <div style={{ top: "0%", right: "70%", width: "180px", position: "absolute" }}><img src="/assets/brokoli.png" alt="Brokoli" style={{ width: "100%", height: "auto" }} /></div>
        <div style={{ top: "0%", left: "70%", width: "180px", position: "absolute" }}><img src="/assets/ayam.png" alt="Ayam" style={{ width: "100%", height: "auto" }} /></div>
        <div style={{ top: "22%", right: "75%", width: "150px", position: "absolute" }}><img src="/assets/tahu.png" alt="Tahu" style={{ width: "100%", height: "auto" }} /></div>
        <div style={{ top: "22%", left: "75%", width: "150px", position: "absolute" }}><img src="/assets/pisang.png" alt="Pisang" style={{ width: "100%", height: "auto" }} /></div>
        <div style={{ top: "45%", right: "65%", width: "180px", position: "absolute" }}><img src="/assets/telur.png" alt="Telur" style={{ width: "100%", height: "auto" }} /></div>
        <div style={{ top: "42%", left: "70%", width: "180px", position: "absolute" }}><img src="/assets/tempe.png" alt="Tempe" style={{ width: "100%", height: "auto" }} /></div>
        <div style={{ top: "58%", right: "60%", width: "280px", position: "absolute" }}><img src="/assets/ikan.png" alt="Ikan" style={{ width: "100%", height: "auto" }} /></div>
        <div style={{ top: "63%", left: "75%", width: "150px", position: "absolute" }}><img src="/assets/apel.png" alt="Apel" style={{ width: "100%", height: "auto" }} /></div>
        <div style={{ top: "85%", right: "70%", width: "180px", position: "absolute" }}><img src="/assets/nasi.png" alt="Nasi" style={{ width: "100%", height: "auto" }} /></div>
        <div style={{ top: "80%", left: "60%", width: "70px", position: "absolute" }}><img src="/assets/wortel.png" alt="Wortel" style={{ width: "350%", height: "auto" }} /></div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px 15px", boxSizing: "border-box", overflowY: "auto" }}>
        
        <div className="auth-card" style={{ width: "100%", maxWidth: isMobile ? "450px" : "650px", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", borderRadius: "24px", padding: isMobile ? "40px 24px" : "60px 55px", boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)", position: "relative", zIndex: 10, margin: "auto", transition: "all 0.3s ease", boxSizing: "border-box" }}>
          
          <div className="auth-brand" style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1 style={{ fontSize: isMobile ? "1.7rem" : "2.2rem", whiteSpace: "nowrap", marginBottom: "4px", color: "var(--clr-navy)" }}>Makan Bergizi Gratis</h1>
            <p style={{ color: "var(--clr-gray-500)", margin: 0, fontSize: isMobile ? "0.9rem" : "1.05rem" }}>Smart System</p>
          </div>

          {view === "login" && (
            <>
              <h2 className="auth-title" style={{ textAlign: "center", marginBottom: "20px", color: "var(--clr-navy)", fontSize: isMobile ? "1.3rem" : "1.6rem" }}>Masuk ke Akun Anda</h2>
              {errorMsg && <div className="auth-error" style={{ color: "var(--clr-spoiled)", textAlign: "center", marginBottom: "15px", fontWeight: "bold" }}>{errorMsg}</div>}

              <form onSubmit={handleLogin} noValidate>
                <div style={{ position: "relative", width: "100%", marginBottom: "15px" }}>
                  <span style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                    <img src="/assets/icon-user-login.png" alt="User Icon" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Username Anda" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    style={{ width: "100%", padding: isMobile ? "12px 12px 12px 50px" : "16px 16px 16px 52px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box", fontSize: isMobile ? "0.95rem" : "1.05rem" }}
                  />
                </div>
                
                <div style={{ position: "relative", width: "100%", marginBottom: "20px" }}>
                  <span style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                    <img src="/assets/icon-lock.png" alt="Lock Icon" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
                  </span>
                  <input 
                    type={showPasswordLogin ? "text" : "password"} 
                    placeholder="Kata Sandi" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{ width: "100%", padding: isMobile ? "12px 45px 12px 50px" : "16px 45px 16px 52px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box", fontSize: isMobile ? "0.95rem" : "1.05rem" }}
                  />
                  <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                    <PasswordToggle isVisible={showPasswordLogin} setIsVisible={setShowPasswordLogin} />
                  </div>
                </div>
                
                <div className="auth-actions" style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
                  <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: "100%", background: "var(--clr-navy)", color: "white", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "none", fontWeight: "bold", fontSize: isMobile ? "1rem" : "1.1rem", cursor: "pointer" }}>{isLoading ? "Masuk..." : "Masuk"}</button>
                  <a href="#" className="link-action" onClick={(e) => { e.preventDefault(); setView("reset"); setErrorMsg(""); }} style={{ color: "var(--clr-teal)", textDecoration: "none", fontWeight: "600", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>Lupa Sandi?</a>
                </div>
              </form>

              <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: isMobile ? "0.85rem" : "1.1rem" }}>
                Belum punya akun? <a href="#" style={{ color: "var(--clr-teal)", fontWeight: "bold", textDecoration: "none" }} onClick={(e) => { e.preventDefault(); setView("register"); }}>Daftar Sekarang</a>
              </p>
              
              <div className="auth-footer" style={{ marginTop: "2rem", borderTop: "1px solid var(--clr-gray-200)", paddingTop: "1.5rem", textAlign: "center" }}>
                <p style={{ marginBottom: "12px", color: "var(--clr-gray-500)", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>Untuk kendala akses, hubungi administrator.</p>
                
                <a 
                  href="https://wa.me/6285121515075?text=Halo%20Admin%20MBG%20Smart%20System!" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px", background: "#25D366", color: "white", padding: isMobile ? "8px 20px" : "14px 28px", borderRadius: "30px", textDecoration: "none", fontSize: isMobile ? "0.9rem" : "1.15rem", fontWeight: "600", boxShadow: "0 4px 10px rgba(37, 211, 102, 0.3)", transition: "all 0.3s ease", margin: "0 auto"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .104 5.383.101 11.947c0 2.098.546 4.142 1.584 5.945L0 24l6.335-1.652c1.74.943 3.71 1.444 5.714 1.447h.005c6.553 0 11.89-5.386 11.893-11.95a11.813 11.813 0 00-3.48-8.413z"/>
                  </svg>
                  Hubungi Admin
                </a>
              </div>

              <div style={{ marginTop: '35px', textAlign: 'center', fontSize: isMobile ? '0.8rem' : '1rem', color: '#94a3b8', lineHeight: '1.6' }}>
                <p style={{ margin: '0', fontWeight: '500' }}>&copy; 2026 Developed by <strong style={{ color: "var(--clr-navy)" }}>FYM Project</strong></p>
                <p style={{ margin: '0', fontSize: isMobile ? '0.75rem' : '0.9rem', opacity: '0.8' }}>Telkom University</p>
              </div>
            </>
          )}

          {view === "register" && (
            <>
              <h2 className="auth-title" style={{ textAlign: "center", marginBottom: "20px", color: "var(--clr-navy)", fontSize: isMobile ? "1.3rem" : "1.6rem" }}>Daftar Akun Baru</h2>
              {errorMsg && <div className="auth-error" style={{ color: "var(--clr-spoiled)", textAlign: "center", marginBottom: "15px", fontWeight: "bold" }}>{errorMsg}</div>}
              
              <form onSubmit={handleRegister} noValidate>
                <div style={{ width: "100%", marginBottom: "14px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={() => setRoleDaftar("Pegawai SPPG")} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: roleDaftar === "Pegawai SPPG" ? "#153759" : "transparent", color: roleDaftar === "Pegawai SPPG" ? "#ffffff" : "var(--clr-gray-500)", border: roleDaftar === "Pegawai SPPG" ? "none" : "1px solid #7da2a9", outline: "none", cursor: "pointer", fontWeight: "bold", transition: "0.2s", fontSize: isMobile ? "0.85rem" : "1rem" }}>
                      Pegawai SPPG
                    </button>
                    <button type="button" onClick={() => setRoleDaftar("Guru")} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: roleDaftar === "Guru" ? "#153759" : "transparent", color: roleDaftar === "Guru" ? "#ffffff" : "var(--clr-gray-500)", border: roleDaftar === "Guru" ? "none" : "1px solid #7da2a9", outline: "none", cursor: "pointer", fontWeight: "bold", transition: "0.2s", fontSize: isMobile ? "0.85rem" : "1rem" }}>
                      Guru Sekolah
                    </button>
                  </div>
                </div>

                <div style={{ width: "100%", marginBottom: "14px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={() => setJenisKelamin("Laki-laki")} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: jenisKelamin === "Laki-laki" ? "#2ecc71" : "transparent", color: jenisKelamin === "Laki-laki" ? "#ffffff" : "var(--clr-gray-500)", border: jenisKelamin === "Laki-laki" ? "none" : "1px solid #7da2a9", outline: "none", cursor: "pointer", fontWeight: "bold", transition: "0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: isMobile ? "0.85rem" : "1rem" }}>
                      <img src="/assets/icon-cowo.png" alt="Icon Cowo" style={{ width: "24px", height: "24px", objectFit: "contain" }} /> Laki-laki
                    </button>
                    <button type="button" onClick={() => setJenisKelamin("Perempuan")} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: jenisKelamin === "Perempuan" ? "#2ecc71" : "transparent", color: jenisKelamin === "Perempuan" ? "#ffffff" : "var(--clr-gray-500)", border: jenisKelamin === "Perempuan" ? "none" : "1px solid #7da2a9", outline: "none", cursor: "pointer", fontWeight: "bold", transition: "0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: isMobile ? "0.85rem" : "1rem" }}>
                      <img src="/assets/icon-cewe.png" alt="Icon Cewe" style={{ width: "24px", height: "24px", objectFit: "contain" }} /> Perempuan
                    </button>
                  </div>
                </div>

                <div style={{ position: "relative", width: "100%", marginBottom: "15px" }}>
                  <input type="text" placeholder="Nama Lengkap" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} style={{ width: "100%", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box", fontSize: isMobile ? "0.95rem" : "1.05rem" }} />
                </div>
                <div style={{ position: "relative", width: "100%", marginBottom: "15px" }}>
                  <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box", fontSize: isMobile ? "0.95rem" : "1.05rem" }} />
                </div>
                <div style={{ position: "relative", width: "100%", marginBottom: "15px" }}>
                  <input type="email" placeholder="Alamat Email aktif" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box", fontSize: isMobile ? "0.95rem" : "1.05rem" }} />
                </div>

                <div style={{ position: "relative", width: "100%", marginBottom: noHp.startsWith("0") ? "4px" : "16px" }}>
                  <input type="tel" placeholder="Nomor WhatsApp (Misal: 62812...)" value={noHp} onChange={(e) => setNoHp(e.target.value.replace(/\D/g, ""))} style={{ width: "100%", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box", fontSize: isMobile ? "0.95rem" : "1.05rem" }} />
                </div>
                {noHp.startsWith("0") && (<p style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: "var(--clr-spoiled)", marginTop: "-6px", marginBottom: "12px", marginLeft: "4px", fontWeight: "bold" }}>Harap gunakan 62 di awal, bukan 0.</p>)}

                {roleDaftar === "Pegawai SPPG" ? (
                  <div style={{ position: "relative", width: "100%", marginBottom: "15px" }}>
                    <input type="text" placeholder="Lokasi SPPG (Cont: Dahyeukolot 1, Bojongsoang)" value={lokasi} onChange={(e) => setLokasi(e.target.value)} style={{ width: "100%", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box", fontSize: isMobile ? "0.95rem" : "1.05rem" }} />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px", width: "100%" }}>
                    
                    <div style={{ position: "relative" }}>
                      <input 
                        type="text" 
                        placeholder="Cari Provinsi..." 
                        value={searchProvinsi} 
                        onChange={(e) => { 
                          setSearchProvinsi(e.target.value); 
                          setIsProvinsiOpen(true);
                          if(e.target.value === "") { setProvinsiTerpilih({id: "", name: ""}); setKotaTerpilih({id: "", name: ""}); setSearchKota(""); }
                        }}
                        onFocus={() => setIsProvinsiOpen(true)}
                        onBlur={() => setTimeout(() => setIsProvinsiOpen(false), 200)}
                        style={{ width: "100%", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: isMobile ? "0.95rem" : "1.05rem", boxSizing: "border-box" }}
                      />
                      {isProvinsiOpen && (
                        <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", maxHeight: "180px", overflowY: "auto", background: "white", zIndex: 50, border: "1px solid #e2e8f0", borderRadius: "8px", marginTop: "4px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
                          {daftarProvinsi.filter(p => p.name.toLowerCase().includes(searchProvinsi.toLowerCase())).map((p) => (
                            <div key={p.id} style={{ padding: "12px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", color: "var(--clr-navy)", fontSize: "0.9rem" }} 
                                 onMouseDown={() => { 
                                   setProvinsiTerpilih({ id: p.id, name: p.name }); 
                                   setSearchProvinsi(p.name); 
                                   setIsProvinsiOpen(false);
                                   setKotaTerpilih({id: "", name: ""});
                                   setSearchKota("");
                                 }}>
                              {p.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ position: "relative" }}>
                      <input 
                        type="text" 
                        placeholder="Cari Kota / Kabupaten..." 
                        value={searchKota} 
                        disabled={!provinsiTerpilih.id}
                        onChange={(e) => { setSearchKota(e.target.value); setIsKotaOpen(true); }}
                        onFocus={() => setIsKotaOpen(true)}
                        onBlur={() => setTimeout(() => setIsKotaOpen(false), 200)}
                        style={{ width: "100%", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: isMobile ? "0.95rem" : "1.05rem", background: !provinsiTerpilih.id ? "#f1f5f9" : "white", boxSizing: "border-box" }}
                      />
                      {isKotaOpen && provinsiTerpilih.id && (
                        <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", maxHeight: "180px", overflowY: "auto", background: "white", zIndex: 50, border: "1px solid #e2e8f0", borderRadius: "8px", marginTop: "4px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
                          {daftarKota.filter(k => k.name.toLowerCase().includes(searchKota.toLowerCase())).map((k) => (
                            <div key={k.id} style={{ padding: "12px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", color: "var(--clr-navy)", fontSize: "0.9rem" }} 
                                 onMouseDown={() => { setKotaTerpilih({ id: k.id, name: k.name }); setSearchKota(k.name); setIsKotaOpen(false); }}>
                              {k.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ position: "relative", width: "100%", marginBottom: "0" }}>
                      <input 
                        type="text" 
                        placeholder="Nama Sekolah (Contoh: SDN 01 Bojongsoang)" 
                        value={sekolah} 
                        onChange={(e) => setSekolah(e.target.value)} 
                        style={{ width: "100%", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box", fontSize: isMobile ? "0.95rem" : "1.05rem" }}
                      />
                    </div>
                  </div>
                )}
                
                <div style={{ position: "relative", width: "100%", marginBottom: "8px" }}>
                  <input type={showPasswordRegister ? "text" : "password"} placeholder="Kata Sandi" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: isMobile ? "12px 45px 12px 15px" : "16px 45px 16px 15px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box", fontSize: isMobile ? "0.95rem" : "1.05rem" }} />
                  <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                    <PasswordToggle isVisible={showPasswordRegister} setIsVisible={setShowPasswordRegister} />
                  </div>
                </div>
                <p style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: "var(--clr-gray-500)", marginTop: "0", marginBottom: "12px", marginLeft: "4px" }}>*Minimal 8 karakter, kombinasi huruf & angka</p>
                
                <div style={{ position: "relative", width: "100%", marginBottom: "20px" }}>
                  <input type={showConfirmPassRegister ? "text" : "password"} placeholder="Konfirmasi Sandi" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} style={{ width: "100%", padding: isMobile ? "12px 45px 12px 15px" : "16px 45px 16px 15px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box", fontSize: isMobile ? "0.95rem" : "1.05rem" }} />
                  <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                    <PasswordToggle isVisible={showConfirmPassRegister} setIsVisible={setShowConfirmPassRegister} />
                  </div>
                </div>
                
                <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: "100%", background: "var(--clr-navy)", color: "white", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "none", fontWeight: "bold", fontSize: isMobile ? "1rem" : "1.1rem", cursor: "pointer", boxShadow: "0 4px 10px rgba(21, 55, 89, 0.15)" }}>{isLoading ? "Mendaftarkan..." : "Daftar Akun"}</button>
              </form>
              
              <p style={{ textAlign: "center", marginTop: "1rem", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>Sudah punya akun? <a href="#" style={{ color: "var(--clr-teal)", fontWeight: "bold", textDecoration: "none" }} onClick={(e) => { e.preventDefault(); setView("login"); }}>Login</a></p>
            </>
          )}

          {view === "reset" && (
            <>
              <h2 className="auth-title" style={{ textAlign: "center", marginBottom: "20px", color: "var(--clr-navy)", fontSize: isMobile ? "1.3rem" : "1.6rem" }}>Reset Akses Akun</h2>
              {errorMsg && <div className="auth-error" style={{ color: "var(--clr-spoiled)", textAlign: "center", marginBottom: "15px", fontWeight: "bold" }}>{errorMsg}</div>}
              {successMsg && <div className="auth-success" style={{color:'green', fontSize: isMobile ? "0.85rem" : "1rem", marginBottom:'15px', textAlign:'center', fontWeight: "bold"}}>{successMsg}</div>}

              {resetStep === 1 && (
                <form onSubmit={handleResetRequest} noValidate>
                  <p className="auth-subtitle" style={{ lineHeight: "1.6", textAlign: "center", marginBottom: "15px", color: "var(--clr-gray-500)", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>
                    {resetMethod === "whatsapp" 
                      ? "Masukkan nomor telepon terdaftar Anda." 
                      : "Masukkan alamat email terdaftar Anda."
                    }
                  </p>
                  
                  <div style={{ position: "relative", width: "100%", marginBottom: "20px" }}>
                    <input 
                      type={resetMethod === "whatsapp" ? "tel" : "email"} 
                      placeholder={resetMethod === "whatsapp" ? "Contoh: 628123456789" : "Masukkan email anda"} 
                      value={resetPhone} 
                      onChange={(e) => setResetPhone(resetMethod === "whatsapp" ? e.target.value.replace(/\D/g, "") : e.target.value)} 
                      style={{ width: "100%", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", textAlign: "center", boxSizing: "border-box", fontSize: isMobile ? "0.95rem" : "1.1rem" }} 
                    />
                  </div>

                  <p className="method-label" style={{ marginBottom: "10px", textAlign: "center", fontWeight: "bold", color: "var(--clr-navy)", fontSize: isMobile ? "0.95rem" : "1.1rem" }}>Pilih Metode:</p>
                  
                  <div className="method-toggle" style={{ display: "flex", gap: "10px", marginBottom: "1.5rem" }}>
                    <button type="button" className={`method-btn ${resetMethod === "whatsapp" ? "active" : ""}`} onClick={() => { setResetMethod("whatsapp"); setResetPhone(""); setErrorMsg(""); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "8px", border: resetMethod === "whatsapp" ? "none" : "1px solid #cbd5e1", background: resetMethod === "whatsapp" ? "#e0f2fe" : "white", color: resetMethod === "whatsapp" ? "#0369a1" : "var(--clr-navy)", fontWeight: "bold", cursor: "pointer", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>
                      <img src="/assets/icon-telepon.png" alt="WhatsApp Icon" style={{ width: isMobile ? "20px" : "24px", height: isMobile ? "20px" : "24px", objectFit: "contain" }} /> WhatsApp
                    </button>
                    <button type="button" className={`method-btn ${resetMethod === "email" ? "active" : ""}`} onClick={() => { setResetMethod("email"); setResetPhone(""); setErrorMsg(""); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "8px", border: resetMethod === "email" ? "none" : "1px solid #cbd5e1", background: resetMethod === "email" ? "#e0f2fe" : "white", color: resetMethod === "email" ? "#0369a1" : "var(--clr-navy)", fontWeight: "bold", cursor: "pointer", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>
                      <img src="/assets/icon-email.png" alt="Email Icon" style={{ width: isMobile ? "20px" : "24px", height: isMobile ? "20px" : "24px", objectFit: "contain" }} /> Email
                    </button>
                  </div>

                  <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: "100%", background: "var(--clr-navy)", color: "white", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "none", fontWeight: "bold", fontSize: isMobile ? "1rem" : "1.1rem", cursor: "pointer" }}>{isLoading ? "Mengirim..." : "Kirim Kode Reset"}</button>
                </form>
              )}

              {resetStep === 2 && (
                <div style={{ textAlign: "center" }}>
                  <p className="auth-subtitle" style={{ marginBottom: "20px", color: "var(--clr-gray-500)", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>Masukkan 6 digit kode yang dikirim ke perangkat Anda.</p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "1.5rem" }}>
                    {otpInput.map((digit, i) => (
                      <input key={i} type="text" maxLength={1} value={digit} onChange={(e) => {
                        const newOtp = [...otpInput]; newOtp[i] = e.target.value; setOtpInput(newOtp);
                        if (e.target.value && i < 5) { const inputs = document.querySelectorAll('.otp-input'); (inputs[i+1] as HTMLInputElement).focus(); }
                      }} className="otp-input" style={{ width: isMobile ? "45px" : "55px", height: isMobile ? "55px" : "65px", textAlign: "center", fontSize: isMobile ? "1.5rem" : "1.8rem", borderRadius: "8px", border: "2px solid var(--clr-teal)", outline: "none", fontWeight: "bold", color: "var(--clr-navy)", boxSizing: "border-box" }} />
                    ))}
                  </div>
                  <button onClick={handleVerifyOTP} className="btn-primary" disabled={isLoading} style={{ width: "100%", background: "var(--clr-navy)", color: "white", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "none", fontWeight: "bold", fontSize: isMobile ? "1rem" : "1.1rem", cursor: "pointer" }}>Verifikasi Kode</button>
                </div>
              )}

              {resetStep === 3 && (
                <form onSubmit={handleUpdatePassword} noValidate>
                  <p className="auth-subtitle" style={{ textAlign: "center", marginBottom: "20px", color: "var(--clr-gray-500)", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>Buat kata sandi baru Anda.</p>
                  
                  <div style={{ position: "relative", width: "100%", marginBottom: "20px" }}>
                    <input type={showPasswordLogin ? "text" : "password"} placeholder="Sandi Baru" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} style={{ width: "100%", padding: isMobile ? "12px 45px 12px 15px" : "16px 45px 16px 15px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box", fontSize: isMobile ? "0.95rem" : "1.05rem" }} />
                    <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                      <PasswordToggle isVisible={showPasswordLogin} setIsVisible={setShowPasswordLogin} />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: "100%", background: "var(--clr-navy)", color: "white", padding: isMobile ? "12px" : "16px", borderRadius: "10px", border: "none", fontWeight: "bold", fontSize: isMobile ? "1rem" : "1.1rem", cursor: "pointer" }}>Simpan Sandi Baru</button>
                </form>
              )}

              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <a href="#" className="link-action" onClick={(e) => { e.preventDefault(); setView("login"); setResetStep(1); }} style={{ color: "var(--clr-teal)", textDecoration: "none", fontWeight: "bold", fontSize: isMobile ? "0.85rem" : "1.05rem" }}>Kembali ke Halaman Login</a>
              </div>
            </>
          )}

          {popupConfig.isOpen && (
            <div className="custom-popup-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div className="custom-popup-card" style={{ background: "white", padding: "30px", borderRadius: "20px", width: "320px", textAlign: "center", position: "relative", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
                <div className="popup-icon" style={{ display: "flex", justifyContent: "center" }}>
                  {popupConfig.icon.startsWith("/assets/") ? (
                    <img src={popupConfig.icon} alt="Status Icon" style={{ width: "80px", height: "80px", objectFit: "contain", marginBottom: "15px" }} />
                  ) : ( <div style={{ fontSize: "50px", marginBottom: "15px" }}>{popupConfig.icon}</div> )}
                </div>
                <h3 className="popup-title" style={{ margin: "0 0 10px 0", color: "#153759", fontSize: "1.3rem", fontWeight: "800" }}>{popupConfig.title}</h3>
                <p className="popup-message" style={{ color: "#475569", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "20px" }}>{popupConfig.message}</p>
                <button onClick={closeCustomPopup} className="btn-popup" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "var(--clr-navy)", color: "white", fontWeight: "bold", cursor: "pointer" }}>Tutup</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}