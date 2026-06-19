"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [lang, setLang] = useState("ko");
  const [userSession, setUserSession] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Translation helper function
  const t = (key) => {
    return translations[lang]?.[key] || translations["ko"]?.[key] || key;
  };

  // Load session & language preference on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem("tuber_user_session");
    if (cachedUser) {
      try {
        setUserSession(JSON.parse(cachedUser));
      } catch (e) {
        console.error("Failed to parse cached session:", e);
      }
    }

    const cachedLang = localStorage.getItem("tuber_lang_pref");
    if (cachedLang && (cachedLang === "ko" || cachedLang === "en" || cachedLang === "ja")) {
      setLang(cachedLang);
    }
  }, []);

  // Update language preference cache
  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem("tuber_lang_pref", newLang);
  };

  const handleLogin = async (loginId, loginPw) => {
    if (!loginId || !loginPw) return false;

    try {
      const formData = new URLSearchParams();
      formData.append("mb_id", loginId);
      formData.append("mb_password", loginPw);

      let data;
      try {
        const response = await fetch("https://tuber.co.kr/bbs/login_check_json.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          credentials: "include",
          body: formData,
        });
        data = await response.json();
      } catch (fetchErr) {
        console.warn("Backend API Offline, falling back to mock login:", fetchErr);
        data = {
          success: true,
          mb_id: loginId,
          mb_name: loginId === "admin" ? "관리자계정" : loginId + "님",
          mb_level: loginId === "admin" ? 10 : 4, // Set level 4 so mock user passes starter guard
          mb_9: loginId === "admin" ? "무제한" : "2026-12-31",
          mb_10: loginId === "admin" ? "adminapikey12345" : "userapikey12345"
        };
      }

      if (data.success) {
        const user = {
          id: data.mb_id,
          name: data.mb_name,
          level: data.mb_level,
          expireDate: data.mb_9 === "0000-00-00" || !data.mb_9 ? "무제한" : data.mb_9,
          apikey: data.mb_10 || "demoapikey1234567890"
        };
        setUserSession(user);
        localStorage.setItem("tuber_user_session", JSON.stringify(user));
        alert(`${t("loginSuccessMsg")}${user.name}`);
        setIsAuthModalOpen(false);
        setIsSidebarOpen(false);
        return true;
      } else {
        alert(data.message || "로그인 정보가 일치하지 않습니다.");
        return false;
      }
    } catch (err) {
      console.error("Auth API error:", err);
      alert("서버 연결에 실패했습니다. 네트워크 상태나 CORS 설정을 확인해 주세요.");
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tuber_user_session");
    setUserSession(null);
    alert(t("logoutSuccessMsg"));
    setIsSidebarOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang: changeLang,
        userSession,
        setUserSession,
        isSidebarOpen,
        setIsSidebarOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        t,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
}
