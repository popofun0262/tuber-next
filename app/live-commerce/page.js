"use client";

import Image from "next/image";
import { useApp } from "../AppContext";

export default function LiveCommercePage() {
  const { userSession, setIsAuthModalOpen, t } = useApp();

  const widgets = [
    { icon: "🔔", title: t("lc_w1Title"), desc: t("lc_w1Desc") },
    { icon: "🎞️", title: t("lc_w2Title"), desc: t("lc_w2Desc") },
    { icon: "🏷️", title: t("lc_w3Title"), desc: t("lc_w3Desc") },
    { icon: "📝", title: t("lc_w4Title"), desc: t("lc_w4Desc") },
    { icon: "🎮", title: t("lc_w5Title"), desc: t("lc_w5Desc") },
    { icon: "📈", title: t("lc_w6Title"), desc: t("lc_w6Desc") },
  ];

  return (
    <div className="bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden">
        <div className="absolute inset-0 z-1">
          <Image
            src="/tuber_commerce_hero_v3.png"
            alt="Live Commerce"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#0a0a0f] z-2" />
        </div>

        <div className="relative z-10 max-w-4xl px-6 animate-fade-in">
          <div className="inline-block px-5 py-2 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-semibold tracking-widest mb-7 uppercase">
            {t("lc_heroBadge")}
          </div>
          <h1
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6"
            dangerouslySetInnerHTML={{ __html: t("lc_heroTitle") }}
          />
          <p
            className="text-base sm:text-xl text-text-bright/70 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: t("lc_heroDesc") }}
          />
        </div>
      </section>

      {/* Main Content Wrapper */}
      <div className="max-w-5xl mx-auto px-6 pb-40">
        
        {/* Feature Block */}
        <div className="flex flex-col lg:flex-row items-center gap-10 sm:gap-16 my-28 bg-white/[0.03] p-8 sm:p-16 rounded-[40px] border border-white/[0.08]">
          <div className="flex-1">
            <div className="text-xs font-bold tracking-widest text-[#00F0FF] uppercase mb-4">
              {t("lc_introLabel")}
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight text-text-bright mb-6 leading-snug"
              dangerouslySetInnerHTML={{ __html: t("lc_introTitle") }}
            />
            <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed">
              {t("lc_introDesc")}
            </p>
          </div>
          <div className="flex-1.2 rounded-2xl overflow-hidden border border-[#00F0FF]/25 shadow-lg shadow-[#00F0FF]/5 relative w-full h-[240px] sm:h-[300px]">
            <Image
              src="/tuber_commerce_v2.jpg"
              alt="Commerce Widget Showcase"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Core Features cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-28">
          <div className="bg-white/[0.05] border border-white/10 p-10 rounded-[30px] shadow-sm hover:border-[#00F0FF]/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-[#00F0FF] mb-4">{t("lc_card1Title")}</h3>
            <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed">{t("lc_card1Desc")}</p>
          </div>
          <div className="bg-white/[0.05] border border-white/10 p-10 rounded-[30px] shadow-sm hover:border-[#00F0FF]/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-[#00F0FF] mb-4">{t("lc_card2Title")}</h3>
            <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed">{t("lc_card2Desc")}</p>
          </div>
        </div>

        {/* Widget Library */}
        <div className="mb-28">
          <div className="text-xs font-bold tracking-widest text-[#00F0FF] uppercase mb-4">
            {t("lc_widgetsLabel")}
          </div>
          <h2 className="text-3xl font-bold text-text-bright mb-3">{t("lc_widgetsTitle")}</h2>
          <p className="text-sm text-[#94a3b8] mb-10">{t("lc_widgetsDesc")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgets.map((widget, idx) => (
              <div
                key={idx}
                className="bg-white/[0.04] border border-white/[0.09] rounded-3xl p-8 flex flex-col items-center text-center hover:border-[#00F0FF]/40 transition-colors"
              >
                <div className="text-4xl mb-4 text-[#00F0FF]">{widget.icon}</div>
                <h4 className="text-base font-bold text-text-bright mb-2.5">{widget.title}</h4>
                <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">{widget.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="text-center py-20 px-8 rounded-[40px] bg-gradient-to-tr from-[#00F0FF]/15 via-transparent to-transparent bg-white/[0.03] border border-white/10 shadow-lg relative overflow-hidden">
          <div className="text-xs font-bold tracking-widest text-[#00F0FF] uppercase mb-4">
            {t("lc_ctaLabel")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-bright mb-6 leading-tight">
            {t("lc_ctaTitle")}
          </h2>
          <p className="text-base text-[#94a3b8] mb-10 max-w-xl mx-auto">
            {t("lc_ctaDesc")}
          </p>
          {userSession ? (
            <a
              href="/"
              className="inline-block px-12 py-5 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#0066FF] font-bold text-sm text-text-bright shadow-[0_16px_40px_rgba(0,240,255,0.25)] hover:scale-105 transition-all duration-300"
            >
              {t("lc_ctaBtn")}
            </a>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-block px-12 py-5 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#0066FF] font-bold text-sm text-text-bright shadow-[0_16px_40px_rgba(0,240,255,0.25)] hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              {t("lc_ctaBtn")}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
