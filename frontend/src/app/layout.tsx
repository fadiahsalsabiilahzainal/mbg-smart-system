import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Konfigurasi Font
const jakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"], 
  variable: "--font-jakarta", 
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={jakartaSans.className}>
        {children}
      </body>
    </html>
  );
}