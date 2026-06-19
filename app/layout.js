import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "./AppContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AuthModal from "./components/AuthModal";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TUBER - 크리에이터 라이브 위젯 플랫폼",
  description: "유튜브 및 라이브 플랫폼 크리에이터를 위한 실시간 알림, 후원 랭킹, 시그니처 위젯 및 AI 자동 채팅 봇 솔루션.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-dark text-text-bright font-sans antialiased overflow-x-hidden selection:bg-primary/30 selection:text-primary">
        <AppContextProvider>
          <Header />
          <Sidebar />
          <AuthModal />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AppContextProvider>
      </body>
    </html>
  );
}
