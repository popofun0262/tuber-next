"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useApp } from "./AppContext";

// Initial Mock Sponsor Rankings
const initialMockRankings = [
  { rank: 1, name: "라플라스_A", amount: 1540000 },
  { rank: 2, name: "쿠키몬스터", amount: 980000 },
  { rank: 3, name: "시청자22", amount: 720000 },
  { rank: 4, name: "OBS_PRO", amount: 450000 },
  { rank: 5, name: "팬더러버", amount: 310000 }
];

// Mock Sponsors pool for dynamic simulation
const sponsorNamesPool = ["유튜브스타", "초보비제이", "엑셀마스터", "시그니처요정", "큰손회원", "하늘나비", "윈드러너"];
const donationAmountsPool = [50000, 100000, 150000, 200000, 300000, 500000];

export default function Home() {
  const { lang, userSession, setIsAuthModalOpen, t } = useApp();

  // Live Dashboard State
  const [rankings, setRankings] = useState(initialMockRankings);
  const [donationAlert, setDonationAlert] = useState(null);
  
  // Interactive AI chat simulator state
  const [chatLogs, setChatLogs] = useState([]);
  const [chatStep, setChatStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulate real-time ticking adjustments to mock database rankings every 7 seconds
  useEffect(() => {
    let isMounted = true;

    const interval = setInterval(() => {
      if (!isMounted) return;
      
      setRankings((prev) => {
        const updated = [...prev];
        const randomIndex = Math.floor(Math.random() * updated.length);
        const addedAmount = donationAmountsPool[Math.floor(Math.random() * donationAmountsPool.length)];
        
        updated[randomIndex] = {
          ...updated[randomIndex],
          amount: updated[randomIndex].amount + addedAmount
        };
        
        return updated
          .sort((a, b) => b.amount - a.amount)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));
      });
    }, 7000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Simulate incoming donation alerts at random times (e.g. every 12 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomSponsor = sponsorNamesPool[Math.floor(Math.random() * sponsorNamesPool.length)];
      const randomAmount = donationAmountsPool[Math.floor(Math.random() * donationAmountsPool.length)];
      
      const alertPayload = {
        name: randomSponsor,
        amount: randomAmount
      };

      setDonationAlert(alertPayload);

      setRankings((prev) => {
        let exists = false;
        let nextRankings = prev.map((item) => {
          if (item.name === randomSponsor) {
            exists = true;
            return { ...item, amount: item.amount + randomAmount };
          }
          return item;
        });

        if (!exists) {
          nextRankings.push({ rank: 99, name: randomSponsor, amount: randomAmount });
        }

        return nextRankings
          .sort((a, b) => b.amount - a.amount)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));
      });

      setTimeout(() => {
        setDonationAlert(null);
      }, 4500);

    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // AI Chat Simulation sequence
  const startChatSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setChatLogs([]);
    setChatStep(0);
  };

  useEffect(() => {
    if (!isSimulating) return;

    const messages = [
      { sender: "User", text: t("chatMsg1"), style: "normal" },
      { sender: "AI Bot A", text: t("chatMsg2"), style: "ai-primary" },
      { sender: "User", text: t("chatMsg3"), style: "normal" },
      { sender: "AI Bot B", text: t("chatMsg4"), style: "ai-secondary" }
    ];

    if (chatStep < messages.length) {
      const timer = setTimeout(() => {
        setChatLogs((prev) => [...prev, messages[chatStep]]);
        setChatStep((prev) => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setIsSimulating(false);
    }
  }, [isSimulating, chatStep, lang]);

  return (
    <div>
      {/* 3. Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center pt-32 pb-24 px-6 bg-cover bg-center bg-fixed bg-no-repeat animate-fade-in"
        style={{ 
          backgroundImage: `radial-gradient(circle at center, rgba(0, 240, 255, 0.06) 0%, #050510 85%), url('/main_bg.jpg')` 
        }}
      >
        <div className="absolute inset-0 bg-bg-dark/40 z-0 pointer-events-none" />
        
        {/* Hero Card */}
        <div className="relative z-10 glass-panel max-w-4xl mx-auto px-6 py-16 sm:py-20 rounded-[40px] sm:rounded-[60px] border border-white/10 text-center shadow-[0_40px_120px_rgba(0,0,0,0.7)] animate-float">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider mb-6">
            {t("brandTag")}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6 select-none">
            {t("heroTitle1")} <br />
            <span className="text-primary drop-shadow-[0_0_30px_rgba(0,240,255,0.4)]">
              {t("heroTitle2")}
            </span>
          </h1>

          <p className="text-base sm:text-xl text-text-dim leading-relaxed max-w-2xl mx-auto mb-10 whitespace-pre-line font-medium">
            {t("heroDesc")}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {userSession ? (
              <a 
                href="#live-dashboard" 
                className="w-full sm:w-auto h-16 px-10 rounded-full bg-primary text-bg-dark font-bold text-base flex items-center justify-center hover:scale-105 hover:shadow-[0_20px_40px_rgba(0,240,255,0.35)] transition-all duration-300"
              >
                {t("dashboardBtn")}
              </a>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto h-16 px-10 rounded-full bg-primary text-bg-dark font-bold text-base flex items-center justify-center hover:scale-105 hover:shadow-[0_20px_40px_rgba(0,240,255,0.35)] transition-all duration-300 cursor-pointer"
              >
                {t("loginBtn")}
              </button>
            )}
            <a 
              href="#widgets" 
              className="w-full sm:w-auto h-16 px-10 rounded-full bg-white/5 border border-white/10 font-bold text-base flex items-center justify-center hover:bg-white/10 hover:scale-103 transition-all duration-300"
            >
              {t("exploreWidgets")}
            </a>
          </div>
        </div>
      </section>

      {/* 4. Showcase Section */}
      <section id="widgets" className="py-24 sm:py-32 px-6 relative max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-primary uppercase block mb-4">
            {t("showcaseTag")}
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
            {t("showcaseTitle1")} <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {t("showcaseTitle2")}
            </span>
          </h2>
          <p className="text-sm sm:text-base text-text-dim leading-relaxed whitespace-pre-line">
            {t("showcaseDesc")}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Card 1 */}
          <div className="glass-panel rounded-[32px] p-8 border border-white/10 shadow-lg relative group hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,240,255,0.15)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] -z-10 group-hover:bg-primary/20 transition-all duration-500" />
            <div>
              <div className="relative w-16 h-16 mb-8 group-hover:scale-110 transition-transform duration-500">
                <Image src="/icon_console_3d.png" alt="Signature Widget Icon" fill className="object-contain" />
              </div>
              <h3 className="text-xl font-bold text-text-bright mb-4 group-hover:text-primary transition-colors">
                {t("widget1Title")}
              </h3>
              <p className="text-sm text-text-dim leading-relaxed whitespace-pre-line mb-8">
                {t("widget1Desc")}
              </p>
            </div>
            <a href="#" className="inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:underline">
              {t("viewDetails")} <span>→</span>
            </a>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-[32px] p-8 border border-white/10 shadow-lg relative group hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,240,255,0.15)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/15 rounded-bl-[100px] -z-10 group-hover:bg-secondary/25 transition-all duration-500" />
            <div>
              <div className="relative w-16 h-16 mb-8 group-hover:scale-110 transition-transform duration-500">
                <Image src="/icon_commerce_3d.png" alt="Excel Widget Icon" fill className="object-contain" />
              </div>
              <h3 className="text-xl font-bold text-text-bright mb-4 group-hover:text-primary transition-colors">
                {t("widget2Title")}
              </h3>
              <p className="text-sm text-text-dim leading-relaxed whitespace-pre-line mb-8">
                {t("widget2Desc")}
              </p>
            </div>
            <a href="#" className="inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:underline">
              {t("viewDetails")} <span>→</span>
            </a>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-[32px] p-8 border border-white/10 shadow-lg relative group hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,240,255,0.15)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] -z-10 group-hover:bg-primary/20 transition-all duration-500" />
            <div>
              <div className="relative w-16 h-16 mb-8 group-hover:scale-110 transition-transform duration-500">
                <Image src="/icon_entertainment_3d.png" alt="Custom Widget Icon" fill className="object-contain" />
              </div>
              <h3 className="text-xl font-bold text-text-bright mb-4 group-hover:text-primary transition-colors">
                {t("widget3Title")}
              </h3>
              <p className="text-sm text-text-dim leading-relaxed whitespace-pre-line mb-8">
                {t("widget3Desc")}
              </p>
            </div>
            <a href="#" className="inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:underline">
              {t("viewDetails")} <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. Features Grid Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-[#050510] to-[#03030b] border-t border-b border-white/5 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Item 1 */}
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-bright mb-2">{t("feature1Title")}</h3>
              <p className="text-sm text-text-dim leading-relaxed whitespace-pre-line">{t("feature1Desc")}</p>
            </div>
          </div>
          {/* Item 2 */}
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 border border-secondary/25 flex items-center justify-center text-secondary text-xl font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-bright mb-2">{t("feature2Title")}</h3>
              <p className="text-sm text-text-dim leading-relaxed whitespace-pre-line">{t("feature2Desc")}</p>
            </div>
          </div>
          {/* Item 3 */}
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-bright mb-2">{t("feature3Title")}</h3>
              <p className="text-sm text-text-dim leading-relaxed whitespace-pre-line">{t("feature3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Integration Platforms (PC / Mobile) */}
      <section className="py-24 sm:py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Left */}
          <div>
            <span className="text-xs sm:text-sm font-bold tracking-widest text-primary uppercase block mb-4">
              CROSS-PLATFORM INTEGRATION
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-8">
              {t("pcTitle")}
            </h2>
            <p className="text-sm sm:text-base text-text-dim leading-relaxed mb-8 max-w-xl">
              {t("pcDesc")}
            </p>

            {/* Bullet List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-semibold text-text-bright">{t("pc1")}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-semibold text-text-bright">{t("pc2")}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-semibold text-text-bright">{t("pc3")}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-semibold text-text-bright">{t("pc4")}</span>
              </div>
            </div>
          </div>

          {/* Visual Right (Mock Frame) */}
          <div className="glass-panel rounded-[40px] border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative w-full h-[280px] sm:h-[350px]">
              <Image 
                src="/tuber_signature_pro.png" 
                alt="PC Streaming Integration" 
                fill 
                className="object-contain rounded-2xl group-hover:scale-102 transition-transform duration-700" 
              />
            </div>
          </div>
        </div>

        {/* Mobile Section Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-24 sm:mt-32">
          {/* Visual Left */}
          <div className="glass-panel rounded-[40px] border border-white/10 p-8 shadow-2xl relative overflow-hidden group order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative w-full h-[280px] sm:h-[350px]">
              <Image 
                src="/main_bot_img.jpg" 
                alt="Mobile Streaming Integration" 
                fill 
                className="object-cover rounded-2xl group-hover:scale-102 transition-transform duration-700" 
              />
            </div>
          </div>

          {/* Text Right */}
          <div className="order-1 lg:order-2">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-secondary uppercase block mb-4">
              MOBILE BROADCAST SUPPORT
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-8">
              {t("mobileTitle")}
            </h2>
            <p className="text-sm sm:text-base text-text-dim leading-relaxed mb-8 max-w-xl">
              {t("mobileDesc")}
            </p>

            {/* Bullet List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-sm font-semibold text-text-bright">{t("mobile1")}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-sm font-semibold text-text-bright">{t("mobile2")}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-sm font-semibold text-text-bright">{t("mobile3")}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-sm font-semibold text-text-bright">{t("mobile4")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Live Widget & Donation Simulator Demonstration */}
      <section id="live-dashboard" className="py-24 sm:py-32 px-6 bg-[#03030b] border-t border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-primary uppercase block mb-4">
              {t("liveDemoTag")}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
              {t("liveDemoTitle")}
            </h2>
            <p className="text-sm sm:text-base text-text-dim leading-relaxed max-w-2xl mx-auto">
              {t("liveDemoDesc")}
            </p>
          </div>

          {/* Demo Dashboard Elements */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Live Alerts Area (Left Panel) */}
            <div className="lg:col-span-7 glass-panel rounded-[32px] border border-white/10 p-8 flex flex-col justify-between min-h-[350px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10" />
              
              <div>
                <h3 className="text-lg font-bold text-text-bright border-b border-white/5 pb-4 mb-6 flex items-center gap-2.5">
                  {t("liveAlertTitle")}
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                </h3>
                
                {/* Visual Overlay Screen Area */}
                <div className="w-full h-44 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center relative p-6">
                  {donationAlert ? (
                    <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-r from-primary/10 to-secondary/15 rounded-2xl animate-float">
                      <div className="px-6 py-4 rounded-2xl bg-bg-dark/80 border border-primary shadow-[0_0_30px_rgba(0,240,255,0.25)] text-center">
                        <div className="text-sm font-semibold text-primary mb-1">
                          🎁 {donationAlert.name} {t("newDonationAlert")}
                        </div>
                        <div className="text-2xl font-black text-text-bright tracking-tight">
                          ₩{donationAlert.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-text-dim text-center whitespace-pre-line leading-relaxed italic">
                      {t("liveAlertPlaceholder")}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-text-dim/60 leading-relaxed mt-4">
                * 위젯 데모는 클라이언트 인터벌 시뮬레이터를 기반으로 작동하며, 매 12초마다 가상 데이터 신호를 생성해 위젯 작동 구조를 시연합니다.
              </div>
            </div>

            {/* Excel Sponsorship Board (Right Panel) */}
            <div className="lg:col-span-5 glass-panel rounded-[32px] border border-white/10 p-8 min-h-[350px] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-text-bright border-b border-white/5 pb-4 mb-6">
                  {t("rankingTitle")}
                </h3>

                {/* Table Data */}
                <div className="flex flex-col gap-2.5">
                  {/* Table Header */}
                  <div className="flex items-center justify-between text-xs font-bold text-text-dim pb-2 px-2">
                    <span className="w-12 text-center">{t("rankingColRank")}</span>
                    <span className="flex-1 text-left pl-4">{t("rankingColName")}</span>
                    <span className="w-28 text-right">{t("rankingColAmount")}</span>
                  </div>

                  {/* Table Body rows */}
                  {rankings.map((sponsor, idx) => (
                    <div 
                      key={sponsor.name + idx}
                      className="flex items-center justify-between py-3.5 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors shadow-sm"
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                        sponsor.rank === 1 ? "bg-primary text-bg-dark" :
                        sponsor.rank === 2 ? "bg-secondary text-text-bright" :
                        sponsor.rank === 3 ? "bg-white/20 text-text-bright" :
                        "bg-white/5 text-text-dim"
                      }`}>
                        {sponsor.rank}
                      </span>
                      <span className="flex-grow pl-6 text-sm font-semibold text-text-bright truncate max-w-[150px]">
                        {sponsor.name}
                      </span>
                      <span className="w-28 text-right text-sm font-bold text-primary font-mono">
                        ₩{sponsor.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Interactive AI Chat Bot Simulator */}
      <section id="ai-chatbot" className="py-24 sm:py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Chat simulator mockup (Left Column) */}
          <div className="lg:col-span-5 glass-panel rounded-[32px] border border-white/10 p-6 sm:p-8 min-h-[420px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-[100px] -z-10" />
            
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 animate-pulse-slow" />
                <span className="text-xs font-bold text-text-bright tracking-wider uppercase">TUBER Chatbot v2</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20 font-bold uppercase">Gemini API</span>
            </div>

            {/* Chat Messages area */}
            <div className="flex-grow flex flex-col gap-3 min-h-[220px] justify-end overflow-y-auto mb-6">
              {chatLogs.length === 0 ? (
                <div className="text-center text-xs text-text-dim leading-relaxed p-6 border border-dashed border-white/5 rounded-xl">
                  아래 시뮬레이션 가동 단추를 눌러 AI 채팅 봇과의 실시간 소통 방식을 테스트해 보세요.
                </div>
              ) : (
                chatLogs.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm animate-float ${
                      msg.style === "ai-primary" ? "self-start bg-primary/10 border border-primary/20 text-primary" :
                      msg.style === "ai-secondary" ? "self-start bg-secondary/15 border border-secondary/25 text-secondary" :
                      "self-end bg-white/5 border border-white/10 text-text-bright"
                    }`}
                  >
                    <span className="text-[9px] font-semibold opacity-60 mb-1">{msg.sender}</span>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Simulation Trigger Button */}
            <button
              onClick={startChatSimulation}
              disabled={isSimulating}
              className={`w-full h-14 rounded-xl font-bold text-sm text-bg-dark transition-all duration-300 shadow-md cursor-pointer ${
                isSimulating 
                  ? "bg-text-dim cursor-not-allowed opacity-75" 
                  : "bg-primary hover:scale-103 hover:shadow-[0_10px_20px_rgba(0,240,255,0.2)]"
              }`}
            >
              {isSimulating ? "AI 연산 처리 중..." : t("aiExploreBtn")}
            </button>
          </div>

          {/* AI description details (Right Column) */}
          <div className="lg:col-span-7">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-primary uppercase block mb-4">
              {t("aiTag")}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-8">
              {t("aiTitle1")} <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {t("aiTitle2")}
              </span>
            </h2>
            <p className="text-sm sm:text-base text-text-dim leading-relaxed mb-8 max-w-xl whitespace-pre-line font-medium">
              {t("aiDesc")}
            </p>

            {/* AI Core features bullet items */}
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                <span className="text-sm sm:text-base font-semibold text-text-bright leading-normal">{t("aiBullet1")}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                <span className="text-sm sm:text-base font-semibold text-text-bright leading-normal">{t("aiBullet2")}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                <span className="text-sm sm:text-base font-semibold text-text-bright leading-normal">{t("aiBullet3")}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                <span className="text-sm sm:text-base font-semibold text-text-bright leading-normal">{t("aiBullet4")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
