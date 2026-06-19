"use client";

import Image from "next/image";
import Link from "next/link";
import { useApp } from "../AppContext";

export default function AboutPage() {
  const { userSession, setIsAuthModalOpen, t } = useApp();

  const features = [
    { icon: "🖥️", title: t("about_feat1Title"), desc: t("about_feat1Desc") },
    { icon: "💬", title: t("about_feat2Title"), desc: t("about_feat2Desc") },
    { icon: "🎨", title: t("about_feat3Title"), desc: t("about_feat3Desc") },
  ];

  const steps = [
    { num: "01", title: t("about_step1Title"), desc: t("about_step1Desc") },
    { num: "02", title: t("about_step2Title"), desc: t("about_step2Desc") },
    { num: "03", title: t("about_step3Title"), desc: t("about_step3Desc") },
    { num: "04", title: t("about_step4Title"), desc: t("about_step4Desc") },
  ];

  const widgets = [
    { icon: "🔔", title: t("about_w1Title"), desc: t("about_w1Desc") },
    { icon: "🏆", title: t("about_w2Title"), desc: t("about_w2Desc") },
    { icon: "🎰", title: t("about_w3Title"), desc: t("about_w3Desc") },
    { icon: "✍️", title: t("about_w4Title"), desc: t("about_w4Desc") },
    { icon: "📊", title: t("about_w5Title"), desc: t("about_w5Desc") },
    { icon: "💬", title: t("about_w6Title"), desc: t("about_w6Desc") },
    { icon: "🎮", title: t("about_w7Title"), desc: t("about_w7Desc") },
    { icon: "🔍", title: t("about_w8Title"), desc: t("about_w8Desc") },
  ];

  const logistics = [
    { icon: "💳", title: t("about_l1Title"), desc: t("about_l1Desc") },
    { icon: "🤖", title: t("about_l2Title"), desc: t("about_l2Desc") },
    { icon: "📦", title: t("about_l3Title"), desc: t("about_l3Desc") },
    { icon: "🏷️", title: t("about_l4Title"), desc: t("about_l4Desc") },
    { icon: "🌐", title: t("about_l5Title"), desc: t("about_l5Desc") },
  ];

  const solutions = [
    { icon: "📝", title: t("about_s1Title"), desc: t("about_s1Desc") },
    { icon: "💎", title: t("about_s2Title"), desc: t("about_s2Desc") },
    { icon: "📈", title: t("about_s3Title"), desc: t("about_s3Desc") },
    { icon: "🎁", title: t("about_s4Title"), desc: t("about_s4Desc") },
    { icon: "⚔️", title: t("about_s5Title"), desc: t("about_s5Desc") },
    { icon: "📊", title: t("about_s6Title"), desc: t("about_s6Desc") },
  ];

  return (
    <div className="bg-[#050510]">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden">
        <div className="absolute inset-0 z-1">
          <Image
            src="/tuber_about_v2.png"
            alt="TUBER About"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-[#0a0a0f] z-2" />
        </div>

        <div className="relative z-10 max-w-4xl px-6 animate-fade-in">
          <div className="inline-block px-5 py-2 rounded-full bg-[#FF007A]/15 border border-[#FF007A]/40 text-[#FF007A] text-xs font-semibold tracking-widest mb-7 uppercase">
            {t("about_heroBadge")}
          </div>
          <h1
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: t("about_heroTitle") }}
          />
          <p
            className="text-base sm:text-xl text-text-bright/70 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: t("about_heroDesc") }}
          />
        </div>
      </section>

      {/* Main Content Wrapper */}
      <div className="max-w-6xl mx-auto px-6 pb-40">
        
        {/* Intro */}
        <div className="py-28 text-center">
          <div className="text-xs font-bold tracking-widest text-[#FF007A] uppercase mb-4">
            {t("about_introLabel")}
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight text-text-bright mb-6 leading-snug"
            dangerouslySetInnerHTML={{ __html: t("about_introTitle") }}
          />
          <p className="text-base sm:text-lg text-[#94a3b8] leading-relaxed max-w-3xl mx-auto">
            {t("about_introDesc")}
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-28">
          <div className="text-xs font-bold tracking-widest text-[#FF007A] uppercase mb-6">
            {t("about_featLabel")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-[28px] p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(255,0,122,0.12)] hover:border-[#FF007A]/30 group"
              >
                <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300 inline-block">{feat.icon}</div>
                <h3 className="text-lg font-bold text-text-bright mb-3 group-hover:text-[#FF007A] transition-colors">{feat.title}</h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-28">
          <div className="text-xs font-bold tracking-widest text-[#FF007A] uppercase mb-4">
            {t("about_howLabel")}
          </div>
          <h2 className="text-3xl font-bold text-text-bright mb-3">{t("about_howTitle")}</h2>
          <p className="text-sm text-[#94a3b8] mb-10">{t("about_howDesc")}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white/[0.03] border border-white/[0.09] rounded-3xl p-7 flex flex-col justify-between"
              >
                <div className="font-bold text-5xl text-[#FF007A]/15 mb-4 font-mono">{step.num}</div>
                <div>
                  <h4 className="text-base font-bold text-text-bright mb-2">{step.title}</h4>
                  <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Widgets */}
        <div className="mb-28">
          <div className="text-xs font-bold tracking-widest text-[#FF007A] uppercase mb-4">
            {t("about_widgetsLabel")}
          </div>
          <h2 className="text-3xl font-bold text-text-bright mb-3">{t("about_widgetsTitle")}</h2>
          <p className="text-sm text-[#94a3b8] mb-10">{t("about_widgetsDesc")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {widgets.map((widget, idx) => (
              <div
                key={idx}
                className="flex gap-5 bg-white/[0.04] border border-white/[0.09] rounded-3xl p-7 hover:border-[#7000FF]/40 transition-colors"
              >
                <div className="text-3xl flex-shrink-0 mt-0.5">{widget.icon}</div>
                <div>
                  <h4 className="text-base font-bold text-text-bright mb-2">{widget.title}</h4>
                  <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">{widget.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order & Logistics Solutions */}
        <div className="mb-28">
          <div className="text-xs font-bold tracking-widest text-[#FF007A] uppercase mb-4">
            {t("about_logisticsLabel")}
          </div>
          <h2 className="text-3xl font-bold text-text-bright mb-3">{t("about_logisticsTitle")}</h2>
          <p className="text-sm text-[#94a3b8] mb-10">{t("about_logisticsDesc")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logistics.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-5 bg-white/[0.04] border border-white/[0.09] rounded-3xl p-7 hover:border-[#7000FF]/40 transition-colors"
              >
                <div className="text-3xl flex-shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <h4 className="text-base font-bold text-text-bright mb-2">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applied Solutions */}
        <div className="mb-28">
          <div className="text-xs font-bold tracking-widest text-[#FF007A] uppercase mb-4">
            {t("about_solutionsLabel")}
          </div>
          <h2 className="text-3xl font-bold text-text-bright mb-3">{t("about_solutionsTitle")}</h2>
          <p className="text-sm text-[#94a3b8] mb-10">{t("about_solutionsDesc")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solutions.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-5 bg-white/[0.04] border border-white/[0.09] rounded-3xl p-7 hover:border-[#7000FF]/40 transition-colors"
              >
                <div className="text-3xl flex-shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <h4 className="text-base font-bold text-text-bright mb-2">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-28">
          <div className="bg-white/5 border border-white/10 rounded-[28px] p-10 text-center flex flex-col justify-center">
            <span className="text-4xl sm:text-5xl font-black text-[#FF007A] mb-3 font-mono">FAST</span>
            <span className="text-xs font-bold tracking-widest text-[#64748b] uppercase mb-3">{t("about_stats1Label")}</span>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">{t("about_stats1Desc")}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[28px] p-10 text-center flex flex-col justify-center">
            <span className="text-4xl sm:text-5xl font-black text-[#FF007A] mb-3 font-mono">300+</span>
            <span className="text-xs font-bold tracking-widest text-[#64748b] uppercase mb-3">{t("about_stats2Label")}</span>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">{t("about_stats2Desc")}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[28px] p-10 text-center flex flex-col justify-center">
            <span className="text-4xl sm:text-5xl font-black text-[#FF007A] mb-3 font-mono">STABLE</span>
            <span className="text-xs font-bold tracking-widest text-[#64748b] uppercase mb-3">{t("about_stats3Label")}</span>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">{t("about_stats3Desc")}</p>
          </div>
        </div>

        {/* CTA Banner */}
        <section className="text-center py-20 px-8 rounded-[40px] bg-gradient-to-tr from-[#7000FF]/20 via-transparent to-[#FF007A]/15 bg-white/[0.02] border border-white/10 shadow-lg relative overflow-hidden">
          <div className="text-xs font-bold tracking-widest text-[#FF007A] uppercase mb-4">
            {t("about_ctaLabel")}
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight text-text-bright mb-6 leading-tight"
            dangerouslySetInnerHTML={{ __html: t("about_ctaTitle") }}
          />
          <p className="text-base text-text-bright/70 mb-10 max-w-xl mx-auto">
            {t("about_ctaDesc")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {userSession ? (
              <a
                href="/"
                className="inline-block px-12 py-5 rounded-full bg-gradient-to-r from-[#FF007A] to-[#7000FF] font-bold text-sm text-text-bright shadow-[0_16px_40px_rgba(255,0,122,0.3)] hover:scale-105 hover:shadow-[0_24px_60px_rgba(255,0,122,0.5)] transition-all duration-300"
              >
                {t("about_ctaStart")}
              </a>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-block px-12 py-5 rounded-full bg-gradient-to-r from-[#FF007A] to-[#7000FF] font-bold text-sm text-text-bright shadow-[0_16px_40px_rgba(255,0,122,0.3)] hover:scale-105 hover:shadow-[0_24px_60px_rgba(255,0,122,0.5)] transition-all duration-300 cursor-pointer"
              >
                {t("about_ctaStart")}
              </button>
            )}
            <Link
              href="/"
              className="inline-block px-12 py-5 rounded-full bg-transparent border-2 border-white/30 font-bold text-sm text-text-bright hover:border-white hover:bg-white/8 transition-all duration-300"
            >
              {t("about_ctaDetail")}
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
