/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { supabase } from "../../lib/supabase";
import { DATABASE_GIZI } from "../../lib/constants";

interface CameraScannerProps {
  currentUser: any;
  onSaveSuccess: () => void;
  showToast: (msg: string) => void;
}

export default function CameraScanner({
  currentUser,
  onSaveSuccess,
  showToast,
}: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraMode, setCameraMode] = useState("input");
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [koordinat, setKoordinat] = useState<string>("Mencari lokasi...");

  const [isMobile, setIsMobile] = useState(false);
  const [jenjangSekolah, setJenjangSekolah] = useState<"SD" | "SMP_SMA">("SD");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setKoordinat("Mencari lokasi & alamat...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const rawCoords = `${lat}, ${lon}`;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
              { headers: { "User-Agent": "MBG-Smart-System-App" } },
            );
            const data = await response.json();

            if (data && data.display_name) {
              const addressParts = data.display_name.split(", ");
              const shortAddress = addressParts.slice(0, 4).join(", ");
              setKoordinat(`${shortAddress}\n${rawCoords}`);
            } else {
              setKoordinat(rawCoords);
            }
          } catch (err) {
            console.error("Gagal menerjemahkan alamat:", err);
            setKoordinat(rawCoords);
          }
        },
        (error) => {
          console.warn("Gagal mendapat lokasi:", error.message);
          setKoordinat("Izin lokasi ditolak (Pastikan GPS menyala)");
        },
      );
    } else {
      setKoordinat("GPS tidak didukung perangkat");
    }
  }, []);

  useEffect(() => {
    if (cameraMode === "input") startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [cameraMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Kamera ditolak:", err);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    processAI(canvas.toDataURL("image/jpeg", 1.0));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => processAI(event.target?.result as string);
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const processAI = async (imageSrc: string) => {
    stopCamera();
    setCameraMode("result");
    setIsProcessing(true);
    setDetectionResult({ image: imageSrc, items: [], total: null });

    try {
      const resBlob = await fetch(imageSrc);
      const blob = await resBlob.blob();

      const formData = new FormData();
      formData.append("file", blob, "foto_makanan.jpg");

      const responseAPI = await fetch(
        "https://fdiahss-mbg-api-backend.hf.space/deteksi",
        {
          method: "POST",
          body: formData,
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        },
      );

      if (!responseAPI.ok)
        throw new Error("Gagal terhubung ke Server Backend API");

      const dataYOLO = await responseAPI.json();
      const hasilDeteksi = dataYOLO.hasil_deteksi || dataYOLO;

      let totalKaloriNampan = 0;
      let akumulasiConfidence = 0;
      let statusNampanBasi = false;

      const mappedItems = hasilDeteksi
        .map((itemAI: any) => {
          if (itemAI.akurasi < 0.5 || (itemAI.akurasi > 1 && itemAI.akurasi < 50)) return null;

          const class_key = itemAI.lauk;
          const info_gizi = DATABASE_GIZI[class_key];

          if (info_gizi) {
            let beratAwal = info_gizi.berat_porsi || 100;
            if (class_key === "nasi_putih") {
              beratAwal = jenjangSekolah === "SD" ? 100 : 150;
            }

            const beratRiil = beratAwal * (info_gizi.bdd / 100);
            
            let kaloriItem = info_gizi.kalori * (beratRiil / 100);
            let proteinItem = info_gizi.protein * (beratRiil / 100);
            let lemakItem = info_gizi.lemak * (beratRiil / 100);
            let karboItem = info_gizi.karbo * (beratRiil / 100);

            if (itemAI.kondisi === "BASI") {
              statusNampanBasi = true;
              kaloriItem = 0;
              proteinItem = 0;
              lemakItem = 0;
              karboItem = 0;
            }

            const akurasiNormal =
              itemAI.akurasi > 1 ? itemAI.akurasi / 100 : itemAI.akurasi;

            totalKaloriNampan += kaloriItem;
            akumulasiConfidence += akurasiNormal;

            return {
              x: itemAI.koordinat.x,
              y: itemAI.koordinat.y,
              status: itemAI.kondisi,
              confidence: akurasiNormal,
              jenis_makanan: `${info_gizi.nama} (${beratAwal}g | Net: ${Number.isInteger(beratRiil) ? beratRiil : beratRiil.toFixed(1)}g)`,
              kalori: kaloriItem,
              protein: proteinItem,
              lemak: lemakItem,
              karbo: karboItem,
            };
          }
          return null;
        })
        .filter(Boolean);

      const batasMinimalKalori = jenjangSekolah === "SD" ? 550 : 700;
      let kesimpulanStatus = "TERPENUHI";

      if (statusNampanBasi) {
        kesimpulanStatus = "TIDAK LAYAK (BASI)";
      } else if (totalKaloriNampan < batasMinimalKalori) {
        kesimpulanStatus = "TIDAK TERPENUHI";
      }

      setDetectionResult({
        image: imageSrc,
        items: mappedItems,
        total: {
          kalori: totalKaloriNampan,
          avgConfidence:
            mappedItems.length > 0
              ? akumulasiConfidence / mappedItems.length
              : 0,
          status_keseluruhan: kesimpulanStatus,
        },
      });
    } catch (error) {
      console.error("Error API:", error);
      alert(
        "Gagal memproses gambar! Pastikan link backend valid dan server jalan.",
      );
      setCameraMode("input");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveResult = async () => {
    if (
      !detectionResult ||
      !detectionResult.items ||
      detectionResult.items.length === 0 ||
      !currentUser
    )
      return;

    const btn = document.getElementById(
      "btn-simpan-hasil",
    ) as HTMLButtonElement;
    if (btn) {
      btn.disabled = true;
      btn.innerText = "Menyimpan...";
    }

    const jenisMakananGabungan = detectionResult.items
      .map((i: any) => `${i.jenis_makanan} - ${i.status}`)
      .join("\n");
      
    const statusUtama =
      detectionResult.total.status_keseluruhan === "TERPENUHI"
        ? "SEGAR"
        : detectionResult.total.status_keseluruhan.includes("BASI")
        ? "BASI"
        : "KURANG KALORI";

    try {
      const { error } = await supabase.from("riwayat").insert([
        {
          pegawai_nama: currentUser.nama_lengkap,
          peran: currentUser.role,
          lokasi: `${currentUser.lokasi} (${jenjangSekolah})`,
          status: statusUtama,
          jenis_makanan: jenisMakananGabungan,
          confidence: parseFloat(
            detectionResult.total.avgConfidence.toFixed(4),
          ),
          kalori: parseFloat(detectionResult.total.kalori.toFixed(1)),
          koordinat_lokasi: koordinat,
        },
      ]);

      if (error) throw error;
      showToast("Hasil & Lokasi berhasil disimpan!");
      setCameraMode("input");
      onSaveSuccess();
    } catch (err: any) {
      alert("Gagal menyimpan ke database: " + err.message);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<img src="/assets/icon-simpan.png" alt="Simpan" style="width: 25px; height: 25px; object-fit: contain;" /> Simpan`;
      }
    }
  };

  const handleShare = async () => {
    if (
      !detectionResult ||
      !detectionResult.items ||
      detectionResult.items.length === 0
    )
      return;

    const btn = document.querySelector(".btn-share") as HTMLButtonElement;
    const originalText = btn
      ? btn.innerHTML
      : `<img src="/assets/icon-share.png" alt="Bagikan" style="width: 24px; height: 24px; object-fit: contain;" /> Bagikan`;
    if (btn) btn.innerHTML = "Memproses Gambar...";

    try {
      const captureArea = document.getElementById("capture-area");
      if (!captureArea) throw new Error("Area gambar tidak ditemukan");

      const canvas = await html2canvas(captureArea, {
        useCORS: true,
        scale: 2, 
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9),
      );
      if (!blob) throw new Error("Gagal mengonversi gambar");

      const file = new File([blob], "hasil-deteksi-mbg.jpg", {
        type: "image/jpeg",
      });

      const waktuSekarang = new Date().toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
      });
      const daftarMakanan = detectionResult.items
        .map((i: any) => `• ${i.jenis_makanan} (${i.status})`)
        .join("\n");

      const shareText = `LAPORAN PEMERIKSAAN KUALITAS GIZI (${jenjangSekolah})
PROGRAM MAKAN BERGIZI GRATIS (MBG)
--------------------------------------------------
Tanggal/Waktu  : ${waktuSekarang}
Lokasi Tugas   : ${koordinat.split("\n")[0]}
Pegawai/Guru   : ${currentUser.nama_lengkap}

HASIL DETEKSI SISTEM AI:
${daftarMakanan}
• Status Pemenuhan : ${detectionResult.total.status_keseluruhan}
--------------------------------------------------
*Laporan ini dihasilkan secara otomatis oleh MBG Smart System.`;

      if (navigator.share && navigator.canShare) {
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Laporan Deteksi MBG",
            text: shareText,
            files: [file],
          });
          showToast("Berhasil membuka menu bagikan!");
        } else {
          await navigator.share({
            title: "Laporan Deteksi MBG",
            text: shareText,
          });
          showToast("Berhasil membuka menu bagikan (tanpa gambar)!");
        }
      } else {
        alert("Browser perangkat ini tidak mendukung fitur Share bawaan.");
      }
    } catch (error) {
      console.log("Membatalkan share atau error:", error);
    } finally {
      if (btn) btn.innerHTML = originalText;
    }
  };

  return (
    <div
      className="dash-view active"
      style={{
        width: "100%",
        maxWidth: "100%",
        padding: "0 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "0.75rem",
          gap: "10px",
        }}
      >
        <div
          style={{
            backgroundColor: "#153759",
            color: "white",
            padding: "12px 30px",
            borderRadius: "30px",
            fontWeight: "700",
            fontSize: isMobile ? "1rem" : "1.25rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 6px 15px rgba(21, 55, 89, 0.25)",
          }}
        >
          <img
            src="/assets/icon-camera.png"
            alt="Ikon Kamera"
            style={{ width: "35px", height: "40px", objectFit: "contain" }}
          />{" "}
          Kamera Deteksi
        </div>

        {cameraMode === "input" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginTop: "5px",
              width: "100%",
              flexWrap: "nowrap",
            }}
          >
            <span
              style={{
                fontSize: isMobile ? "0.85rem" : "0.9rem",
                fontWeight: "700",
                color: "var(--clr-navy)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Target Jenjang:
            </span>
            <select
              value={jenjangSekolah}
              onChange={(e) => setJenjangSekolah(e.target.value as any)}
              style={{
                padding: isMobile ? "4px 8px" : "6px 12px",
                borderRadius: "8px",
                border: "2px solid #153759",
                fontWeight: "700",
                color: "#153759",
                backgroundColor: "white",
                cursor: "pointer",
                fontSize: isMobile ? "0.75rem" : "0.85rem",
                maxWidth: isMobile ? "160px" : "100%",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                flexShrink: 1,
              }}
            >
              <option value="SD">Anak SD (Nasi 100g)</option>
              <option value="SMP_SMA">Anak SMP/SMA (Nasi 150g)</option>
            </select>
          </div>
        )}
      </div>

      {cameraMode === "input" && (
        <div
          className="camera-section"
          style={{
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <p
            className="camera-hint"
            style={{
              margin: "0 0 20px 0",
              color: "var(--clr-navy)",
              fontWeight: "700",
              fontSize: isMobile ? "0.96rem" : "1.2rem",
            }}
          >
            Arahkan kamera ke makanan
          </p>

          <div
            className="camera-viewport"
            style={{
              position: "relative",
              width: "100%",
              height: isMobile ? "auto" : "65vh",
              aspectRatio: isMobile ? "4/5" : "auto",
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "#000",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
          >
            <video
              ref={videoRef as any}
              autoPlay
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            ></video>
            {!cameraStream && (
              <div
                className="viewport-overlay"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  padding: "20px",
                }}
              >
                <div className="overlay-icon">
                  <img
                    src="/assets/icon-camera-shutter.png"
                    alt="Ikon Kamera Overlay"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "contain",
                      marginBottom: "15px",
                    }}
                  />
                </div>
                <div
                  className="overlay-title"
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: isMobile ? "1.12rem" : "1.4rem",
                    marginBottom: "10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Menunggu Akses Kamera...
                </div>
                <div
                  className="overlay-subtitle"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: isMobile ? "0.88rem" : "1.1rem",
                  }}
                >
                  Harap izinkan akses kamera pada browser Anda
                </div>
              </div>
            )}
          </div>

          <div
            className="action-cluster"
            style={{
              marginTop: "25px",
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <button
              className="shutter-btn"
              title="Ambil Foto"
              onClick={handleCapture}
            >
              <span className="shutter-inner"></span>
            </button>
            <button
              className="btn-upload"
              title="Unggah dari Galeri"
              onClick={handleUploadClick}
              style={{
                padding: "12px 24px",
                fontSize: isMobile ? "0.88rem" : "1.1rem",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>{" "}
              &nbsp;Unggah Galeri
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef as any}
            accept=".jpg, .jpeg, .png"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      )}

      {cameraMode === "result" && (
        <div
          className="result-section"
          style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}
        >
          <div
            id="capture-area"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: isMobile ? "100%" : "720px",
              height: "auto",
              minHeight: "300px",
              borderRadius: "16px",
              overflow: "hidden",
              marginBottom: "15px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#0f172a",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              margin: "0 auto 15px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "inline-block",
              }}
            >
              <img
                src={detectionResult?.image}
                alt="Hasil"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                }}
              />

              {isProcessing && (
                <div
                  className="processing-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 20,
                  }}
                >
                  <div className="processing-spinner"></div>
                  <div
                    className="processing-text"
                    style={{
                      color: "white",
                      marginTop: "15px",
                      fontWeight: "bold",
                      fontSize: isMobile ? "1.04rem" : "1.3rem",
                    }}
                  >
                    Menganalisis kualitas...
                  </div>
                </div>
              )}

              {!isProcessing &&
                detectionResult?.items?.map((item: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      position: "absolute",
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: "translate(-50%, -100%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      pointerEvents: "none",
                      zIndex: 5,
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        padding: isMobile ? "2px 6px" : "10px 14px",
                        borderRadius: "4px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                        border:
                          item.status === "SEGAR"
                            ? isMobile
                              ? "1px solid #2ecc71"
                              : "2px solid #2ecc71"
                            : isMobile
                              ? "1px solid #e74c3c"
                              : "2px solid #e74c3c",
                        marginBottom: isMobile ? "2px" : "6px",
                        minWidth: isMobile ? "80px" : "140px",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "800",
                          color: "var(--clr-navy)",
                          fontSize: isMobile ? "0.6rem" : "1.05rem",
                          marginBottom: isMobile ? "1px" : "4px",
                          textAlign: "center",
                          lineHeight: "1.1",
                        }}
                      >
                        {item.jenis_makanan}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: isMobile ? "1px" : "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: isMobile ? "0.55rem" : "0.9rem",
                            fontWeight: "800",
                            color:
                              item.status === "SEGAR" ? "#2ecc71" : "#e74c3c",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.status}
                        </span>
                        <span
                          style={{
                            fontSize: isMobile ? "0.45rem" : "0.75rem",
                            fontWeight: "700",
                            color: "#64748b",
                            marginTop: "2px",
                          }}
                        >
                          Akurasi: {(item.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0,
                          fontSize: isMobile ? "0.55rem" : "0.85rem",
                          color: "#333",
                          borderTop: "1px dashed #ccc",
                          paddingTop: isMobile ? "2px" : "6px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Kalori:</span>{" "}
                          <b>{item.kalori.toFixed(1)} kkal</b>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Protein:</span>{" "}
                          <b>{item.protein.toFixed(1)} g</b>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Lemak:</span> <b>{item.lemak.toFixed(1)} g</b>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Karbo:</span> <b>{item.karbo.toFixed(1)} g</b>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        width: isMobile ? "6px" : "14px",
                        height: isMobile ? "6px" : "14px",
                        background:
                          item.status === "SEGAR" ? "#2ecc71" : "#e74c3c",
                        borderRadius: "50%",
                        border: isMobile
                          ? "1px solid white"
                          : "2px solid white",
                        boxShadow: "0 0 4px rgba(0,0,0,0.6)",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: isMobile ? "-3px" : "-8px",
                          left: "50%",
                          width: isMobile ? "1px" : "2px",
                          height: isMobile ? "3px" : "8px",
                          background:
                            item.status === "SEGAR" ? "#2ecc71" : "#e74c3c",
                          transform: "translateX(-50%)",
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>

            {!isProcessing && detectionResult && (
              <div
                style={{
                  position: "absolute",
                  bottom: isMobile ? "6px" : "15px",
                  left: isMobile ? "6px" : "15px",
                  right: isMobile ? "6px" : "15px",
                  background: "rgba(255, 255, 255, 0.8)",
                  color: "var(--clr-navy)",
                  padding: isMobile ? "4px 8px" : "14px 24px",
                  borderRadius: isMobile ? "8px" : "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: isMobile ? "2px" : "4px",
                  backdropFilter: "blur(4px)",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  zIndex: 10,
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    marginBottom: isMobile ? "1px" : "8px",
                    paddingBottom: isMobile ? "2px" : "8px",
                    borderBottom: "1px dashed #cbd5e1",
                  }}
                >
                  <span
                    style={{
                      fontSize: isMobile ? "0.6rem" : "1rem",
                      fontWeight: "700",
                      color: "#153759",
                    }}
                  >
                    {isMobile ? "Total:" : `Total Kalori (${jenjangSekolah}):`}
                  </span>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        fontSize: isMobile ? "0.75rem" : "1.35rem",
                        fontWeight: "800",
                        color: "#153759",
                      }}
                    >
                      {detectionResult.total.kalori.toFixed(1)}{" "}
                      <span style={{ fontSize: isMobile ? "0.55rem" : "0.9rem" }}>
                        kkal
                      </span>
                    </span>

                    <span
                      style={{
                        fontSize: isMobile ? "0.6rem" : "0.85rem",
                        fontWeight: "800",
                        padding: isMobile ? "2px 6px" : "4px 10px",
                        borderRadius: "20px",
                        backgroundColor:
                          detectionResult.total.status_keseluruhan === "TERPENUHI"
                            ? "#dcfce7"
                            : "#fee2e2",
                        color:
                          detectionResult.total.status_keseluruhan === "TERPENUHI"
                            ? "#16a34a"
                            : "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <img
                        src={
                          detectionResult.total.status_keseluruhan === "TERPENUHI"
                            ? "/assets/icon-checklist.png"
                            : "/assets/icon-silang.png"
                        }
                        alt="Status"
                        style={{
                          width: isMobile ? "12px" : "16px",
                          height: isMobile ? "12px" : "16px",
                          objectFit: "contain",
                        }}
                      />
                      {detectionResult.total.status_keseluruhan === "TERPENUHI"
                        ? "TERPENUHI"
                        : detectionResult.total.status_keseluruhan.includes("BASI")
                        ? "TIDAK LAYAK"
                        : "TIDAK TERPENUHI"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    fontSize: isMobile ? "0.55rem" : "0.95rem",
                    width: "100%",
                    lineHeight: "1.2",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <img
                      src="/assets/icon-lokasi.png"
                      alt="Icon Lokasi"
                      style={{
                        width: isMobile ? "10px" : "20px",
                        height: isMobile ? "10px" : "20px",
                        objectFit: "contain",
                      }}
                    />
                    <span style={{ textAlign: "left" }}>
                      {koordinat?.split("\n")?.[0] || "Menunggu lokasi..."}
                    </span>
                  </div>
                  {koordinat?.includes("\n") && (
                    <span
                      style={{
                        fontSize: isMobile ? "0.45rem" : "0.75rem",
                        color: "var(--clr-gray-500)",
                        fontFamily: "monospace",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {koordinat.split("\n")[1]}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {!isProcessing && detectionResult && (
            <div
              className="result-actions"
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "20px",
                maxWidth: "700px",
                margin: "20px auto 0",
              }}
            >
              <button
                className="btn-back"
                onClick={() => setCameraMode("input")}
                style={{
                  flex: "1",
                  minWidth: "140px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "white",
                  color: "#475569",
                  fontWeight: "800",
                  fontSize: isMobile ? "0.88rem" : "1.1rem",
                  cursor: "pointer",
                }}
              >
                <img
                  src="/assets/icon-kembali.png"
                  alt="Kembali"
                  style={{
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                  }}
                />
                Kembali
              </button>

              <button
                className="btn-share"
                onClick={handleShare}
                style={{
                  background: "var(--clr-navy)",
                  color: "white",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "800",
                  fontSize: isMobile ? "0.88rem" : "1.1rem",
                  cursor: "pointer",
                  flex: "1",
                  minWidth: "140px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 10px rgba(51, 87, 101, 0.3)",
                }}
              >
                <img
                  src="/assets/icon-share.png"
                  alt="Bagikan"
                  style={{
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                  }}
                />
                Bagikan
              </button>

              <button
                id="btn-simpan-hasil"
                className="btn-save"
                onClick={handleSaveResult}
                style={{
                  flex: "1",
                  minWidth: "140px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#2ecc71",
                  color: "white",
                  fontWeight: "800",
                  fontSize: isMobile ? "0.88rem" : "1.1rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(46, 204, 113, 0.3)",
                }}
              >
                <img
                  src="/assets/icon-simpan.png"
                  alt="Simpan"
                  style={{
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                  }}
                />
                Simpan
              </button>
            </div>
          )}

          {!isProcessing && detectionResult && (
            <div
              style={{
                marginTop: "15px",
                fontSize: isMobile ? "0.7rem" : "0.85rem",
                color: "#64748b",
                textAlign: "center",
                padding: "0 10px",
                fontStyle: "italic",
                lineHeight: "1.4",
                maxWidth: "700px",
                margin: "15px auto 0",
              }}
            >
              *Catatan: Nilai gizi di atas merupakan estimasi dinamis yang telah disesuaikan dengan persentase Berat Dapat Dimakan (BDD). <b>Penentuan status pemenuhan batas kalori minimum merujuk pada standar Angka Kecukupan Gizi (PMK RI No. 28 Tahun 2019).</b>
            </div>
          )}
        </div>
      )}
    </div>
  );
}