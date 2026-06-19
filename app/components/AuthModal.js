"use client";

import { useState } from "react";
import { useApp } from "../AppContext";

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, handleLogin, t } = useApp();
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleLogin(loginId, loginPw);
    if (success) {
      setLoginId("");
      setLoginPw("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
      {/* Modal Card */}
      <div className="w-full max-w-md bg-[#050510] border border-white/10 rounded-[30px] p-8 shadow-2xl relative animate-float">
        <h3 className="text-2xl font-bold text-text-bright mb-2 tracking-tight">
          {t("modalTitle")}
        </h3>
        <p className="text-xs text-text-dim mb-6 leading-relaxed">
          {t("modalGuideText")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username Input */}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder={t("modalIdPlaceholder")}
              required
              className="h-14 px-4 rounded-xl bg-white/5 border border-white/10 text-text-bright text-sm placeholder-text-dim/50 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <input
              type="password"
              value={loginPw}
              onChange={(e) => setLoginPw(e.target.value)}
              placeholder={t("modalPwPlaceholder")}
              required
              className="h-14 px-4 rounded-xl bg-white/5 border border-white/10 text-text-bright text-sm placeholder-text-dim/50 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(false);
                setLoginId("");
                setLoginPw("");
              }}
              className="flex-1 h-14 rounded-xl bg-white/5 border border-white/10 font-bold text-sm text-text-bright/80 hover:bg-white/10 transition-colors cursor-pointer"
            >
              {t("modalCancelBtn")}
            </button>
            <button
              type="submit"
              className="flex-1 h-14 rounded-xl bg-primary font-bold text-sm text-bg-dark hover:scale-103 transition-all duration-300 shadow-[0_10px_20px_rgba(0,240,255,0.2)] cursor-pointer"
            >
              {t("modalLoginBtn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
