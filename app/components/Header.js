"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../AppContext";

export default function Header() {
  const { lang, setLang, userSession, setIsSidebarOpen, t } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { name: t("navHome"), path: "/" },
    { name: t("navWidget"), path: "/about" },
    { name: t("navLiveCommerce"), path: "/live-commerce" },
    { name: t("navEntertainment"), path: "/entertainment" },
  ];

  if (userSession && userSession.level >= 4) {
    menuItems.push({ name: t("cast_title"), path: "/cast" });
    menuItems.push({ name: t("starter_title"), path: "/starter" });
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b border-white/5 ${
        isScrolled
          ? "bg-bg-dark/85 backdrop-blur-xl py-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative w-[130px] h-[32px] sm:w-[150px] sm:h-[36px] transition-transform hover:scale-102">
          <Image
            src="/logo-color.png"
            alt="Tuber Logo"
            fill
            priority
            className="object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-semibold transition-colors hover:text-primary ${
                  isActive ? "text-primary font-bold" : "text-text-bright/80"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* User Session Info Badge */}
          {userSession && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse-slow">
              <span className="opacity-90">{userSession.name}</span>
              <div className="w-[1px] h-3 bg-primary/20" />
              <span className="text-[10px] bg-primary/20 px-1.5 py-0.5 rounded uppercase">Lv.{userSession.level}</span>
              <div className="w-[1px] h-3 bg-primary/20" />
              <span className="font-mono text-[10px]">{userSession.expireDate}</span>
            </div>
          )}

          {/* Lang Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center justify-center p-2 rounded-lg bg-white/5 border border-white/10 text-text-bright/70 hover:text-primary hover:bg-white/10 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2"></path>
              </svg>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-[140px] rounded-2xl bg-bg-dark/95 border border-white/15 backdrop-blur-2xl shadow-2xl p-2 flex flex-col gap-1 z-50">
                <button
                  onClick={() => {
                    setLang("ko");
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors ${
                    lang === "ko" ? "text-primary font-bold" : "text-text-bright/80"
                  }`}
                >
                  한국어 (KO)
                </button>
                <button
                  onClick={() => {
                    setLang("en");
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors ${
                    lang === "en" ? "text-primary font-bold" : "text-text-bright/80"
                  }`}
                >
                  English (EN)
                </button>
                <button
                  onClick={() => {
                    setLang("ja");
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors ${
                    lang === "ja" ? "text-primary font-bold" : "text-text-bright/80"
                  }`}
                >
                  日本語 (JA)
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all active:scale-95 group cursor-pointer"
          >
            <div className="w-5 h-[2px] bg-text-bright group-hover:bg-primary transition-colors"></div>
            <div className="w-5 h-[2px] bg-text-bright group-hover:bg-primary transition-colors"></div>
            <div className="w-5 h-[2px] bg-text-bright group-hover:bg-primary transition-colors"></div>
          </button>
        </div>
      </div>
    </header>
  );
}
