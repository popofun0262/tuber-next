"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../AppContext";

export default function Sidebar() {
  const {
    lang,
    userSession,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsAuthModalOpen,
    handleLogout,
    t,
  } = useApp();
  
  const pathname = usePathname();

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
    <>
      {/* Backdrop overlay */}
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sliding Sidebar Panel */}
      <div
        className={`fixed top-0 bottom-0 right-0 w-[360px] max-w-[75vw] z-50 glass-sidebar p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          {/* Sidebar Top Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" onClick={() => setIsSidebarOpen(false)} className="relative w-[100px] h-[25px]">
              <Image
                src="/logo-color.png"
                alt="Tuber Logo"
                fill
                className="object-contain opacity-80"
              />
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-text-bright/70 hover:text-primary transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* User Account / Login State Container */}
          {userSession ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 shadow-md flex flex-col gap-2.5 text-xs text-text-dim">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-primary font-bold text-sm truncate max-w-[150px]">
                  {userSession.name} ({userSession.id})
                </span>
                <span className="bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold">
                  Lv.{userSession.level}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>프리미엄 만료일:</span>
                <span className="font-mono text-text-bright font-bold">{userSession.expireDate}</span>
              </div>
              <div className="w-full h-[1px] bg-white/5 my-1" />
              <div className="flex items-center justify-around gap-2 text-sm font-semibold text-text-bright">
                <a href="#" className="hover:text-primary transition-colors">
                  {t("modifyMenu")}
                </a>
                <div className="w-[1px] h-4 bg-white/10" />
                <button
                  onClick={handleLogout}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  {t("logoutMenu")}
                </button>
                {userSession.level >= 10 && (
                  <>
                    <div className="w-[1px] h-4 bg-white/10" />
                    <a href="#" className="hover:text-primary transition-colors">
                      {t("adminMenu")}
                    </a>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 shadow-md flex items-center justify-around gap-2 text-sm font-semibold">
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                {t("loginMenu")}
              </button>
              <div className="w-[1px] h-4 bg-white/10" />
              <a href="#" className="hover:text-primary transition-colors">
                {t("registerBtn")}
              </a>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all font-semibold ${
                    isActive
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-primary/20 text-text-bright"
                  }`}
                >
                  <span>{item.name}</span>
                  <svg className={`w-4 h-4 ${isActive ? "text-primary" : "text-text-dim"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="text-center text-xs text-text-dim/60">
          {t("footerText")}
        </div>
      </div>
    </>
  );
}
