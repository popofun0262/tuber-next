"use client";

import Image from "next/image";
import { useApp } from "../AppContext";

export default function EntertainmentPage() {
  const { userSession, setIsAuthModalOpen, t } = useApp();

  const cards = [
    { title: t("ent_card1Title"), desc: t("ent_card1Desc") },
    { title: t("ent_card2Title"), desc: t("ent_card2Desc") },
    { title: t("ent_card3Title"), desc: t("ent_card3Desc") },
  ];

  const widgets = [
    { icon: "🎰", title: t("ent_w1Title"), desc: t("ent_w1Desc") },
    { icon: "🏆", title: t("ent_w2Title"), desc: t("ent_w2Desc") },
    { icon: "⚔️", title: t("ent_w3Title"), desc: t("ent_w3Desc") },
    { icon: "⏲️", title: t("ent_w4Title"), desc: t("ent_w4Desc") },
    { icon: "🎵", title: t("ent_w5Title"), desc: t("ent_w5Desc") },
    { icon: "💬", title: t("ent_w6Title"), desc: t("ent_w6Desc") },
    { icon: "✨", title: t("ent_w7Title"), desc: t("ent_w7Desc") },
    { icon: "🔌", title: t("ent_w8Title"), desc: t("ent_w8Desc") },
  ];

  return (
    <div className="bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden">
        <div className="absolute inset-0 z-1">
          <Image
            src="/tuber_ent_hero_v8.png"
            alt="Entertainment"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0a0a0f] z-2" />
        </div>

        <div className="relative z-10 max-w-4xl px-6 animate-fade-in">
          <div className="inline-block px-5 py-2 rounded-full bg-[#FF007A]/10 border border-[#FF007A]/30 text-[#FF007A] text-xs font-semibold tracking-widest mb-7 uppercase">
            {t("ent_heroBadge")}
          </div>
          <h1
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6"
            dangerouslySetInnerHTML={{ __html: t("ent_heroTitle") }}
          />
          <p
            className="text-base sm:text-xl text-text-bright/70 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: t("ent_heroDesc") }}
          />
        </div>
      </section>

      {/* Main Content Wrapper */}
      <div className="max-w-5xl mx-auto px-6 pb-40">

        {/* Feature Block */}
        <div className="flex flex-col lg:flex-row items-center gap-10 sm:gap-16 my-28 bg-white/[0.03] p-8 sm:p-16 rounded-[40px] border border-white/[0.08]">
          <div className="flex-1">
            <div className="text-xs font-bold tracking-widest text-[#FF007A] uppercase mb-4">
              {t("ent_introLabel")}
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight text-text-bright mb-6 leading-snug"
              dangerouslySetInnerHTML={{ __html: t("ent_introTitle") }}
            />
            <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed">
              {t("ent_introDesc")}
            </p>
          </div>
          <div className="flex-[1.2] w-full lg:w-auto rounded-2xl overflow-hidden border border-[#FF007A]/25 shadow-lg shadow-[#FF007A]/5 relative h-[240px] sm:h-[300px]">
            <Image
              src="/tuber_ent_v3.jpg"
              alt="Entertainment Widget Showcase"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Core Features cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-28">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white/[0.05] border border-white/10 p-8 rounded-[30px] shadow-sm hover:border-[#FF007A]/50 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
            >
              <h3 className="text-lg font-bold text-[#FF007A] mb-4">{card.title}</h3>
              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed flex-grow">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Widget Library */}
        <div className="mb-28">
          <div className="text-xs font-bold tracking-widest text-[#FF007A] uppercase mb-4">
            {t("ent_widgetsLabel")}
          </div>
          <h2 className="text-3xl font-bold text-text-bright mb-3">{t("ent_widgetsTitle")}</h2>
          <p className="text-sm text-[#94a3b8] mb-10">{t("ent_widgetsDesc")}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {widgets.map((widget, idx) => (
              <div
                key={idx}
                className="bg-white/[0.04] border border-white/[0.09] rounded-2xl p-6 flex flex-col items-center text-center hover:border-[#FF007A]/40 transition-colors"
              >
                <div className="text-3xl mb-3 text-[#FF007A]">{widget.icon}</div>
                <h4 className="text-sm sm:text-base font-bold text-text-bright mb-2">{widget.title}</h4>
                <p className="text-xs text-[#94a3b8] leading-relaxed">{widget.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="text-center py-20 px-8 rounded-[40px] bg-gradient-to-br from-[#7000FF]/15 via-transparent to-transparent bg-white/[0.03] border border-white/10 shadow-lg relative overflow-hidden">
          <div className="text-xs font-bold tracking-widest text-[#FF007A] uppercase mb-4">
            {t("ent_ctaLabel")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-bright mb-6 leading-tight">
            {t("ent_ctaTitle")}
          </h2>
          <p className="text-base text-[#94a3b8] mb-10 max-w-xl mx-auto">
            {t("ent_ctaDesc")}
          </p>
          {userSession ? (
            <a
              href="/"
              className="inline-block px-12 py-5 rounded-full bg-gradient-to-r from-[#FF007A] to-[#7000FF] font-bold text-sm text-text-bright shadow-[0_16px_40px_rgba(255,0,122,0.25)] hover:scale-105 transition-all duration-300"
            >
              {t("ent_ctaBtn")}
            </a>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-block px-12 py-5 rounded-full bg-gradient-to-r from-[#FF007A] to-[#7000FF] font-bold text-sm text-text-bright shadow-[0_16px_40px_rgba(255,0,122,0.25)] hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              {t("ent_ctaBtn")}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
