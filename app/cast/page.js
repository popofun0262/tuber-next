"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../AppContext";

const WIDGET_LABELS = {
  tuber: { ko: "대시보드 컨트롤", en: "Console Dashboard", ja: "コンソールダッシュボード" },
  subtitle: { ko: "Plan/Logo 고정자막", en: "Plan/Logo Subtitle", ja: "Plan/Logo 固定字幕" },
  overlay: { ko: "자막/이미지 오버레이", en: "Caption/Image Overlay", ja: "字幕/画像オーバーレイ" },
  notification: { ko: "실시간 주문 알림", en: "Real-time Order Alerts", ja: "リアルタイム注文通知" },
  bgm: { ko: "방송 BGM 재생기", en: "Stream BGM Player", ja: "配信BGM再生機" },
  slider: { ko: "상품/시그니처 슬라이더", en: "Product Slider", ja: "商品スライダー" },
  ranking: { ko: "오늘의 멤버 랭킹", en: "Today's Leaderboard", ja: "本日のメンバーランキング" },
  donator_ranking: { ko: "시청자 참여 랭킹", en: "Viewer Leaderboard", ja: "視聴者参加ランキング" },
  spin: { ko: "룰렛 돌리기", en: "Roulette Roulette", ja: "ルーレット" },
  timer: { ko: "타이머 1", en: "Timer Slot 1", ja: "タイマー 1" },
  timer2: { ko: "타이머 2", en: "Timer Slot 2", ja: "タイマー 2" },
  vs: { ko: "VS 후원 게이지", en: "VS Gage Bar", ja: "VSゲージ" },
  toonation: { ko: "외부 후원 연동", en: "External Sponsorship", ja: "外部支援連動" },
  starter: { ko: "스타터키트 설정", en: "Starter Kit Settings", ja: "スターターキット設定" }
};

const WIDGET_ICONS = {
  tuber: "⚙️",
  subtitle: "📌",
  overlay: "🖼️",
  notification: "🔔",
  bgm: "🎵",
  slider: "🛍️",
  ranking: "🏆",
  donator_ranking: "👥",
  spin: "🎡",
  timer: "⏱️",
  timer2: "⏱️",
  vs: "⚔️",
  toonation: "🔌",
  starter: "🚀"
};

export default function CastDashboard() {
  const { userSession, lang, t, handleLogout, setIsAuthModalOpen } = useApp();
  const router = useRouter();

  // General States
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [isEditable, setIsEditable] = useState(false);
  const [widgets, setWidgets] = useState([]);
  const [widgetStates, setWidgetStates] = useState({}); // visible states
  const [rankings, setRankings] = useState([]);
  const [history, setHistory] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeTab, setActiveTab] = useState("ranking"); // ranking | log | chat

  // Widget Actions States
  const [spinInput, setSpinInput] = useState("");
  const [vsInput, setVsInput] = useState("");
  const [timer1Min, setTimer1Min] = useState(10);
  const [timer1Sec, setTimer1Sec] = useState(0);
  const [timer2Min, setTimer2Min] = useState(10);
  const [timer2Sec, setTimer2Sec] = useState(0);

  // Modals States
  const [isToonModalOpen, setIsToonModalOpen] = useState(false);
  const [toonKey, setToonKey] = useState("");
  const [pandaKey, setPandaKey] = useState("");
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [adjName, setAdjName] = useState("");
  const [adjPoint, setAdjPoint] = useState("");

  // Manual Donation Form States
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formPoint, setFormPoint] = useState("");
  const [formFrequency, setFormFrequency] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);

  // Chat Form States
  const [chatInput, setChatInput] = useState("");

  // Audio queue processing
  const [isMuted, setIsMuted] = useState(false);
  const [settingsUrl, setSettingsUrl] = useState(null);
  const [settingsTitle, setSettingsTitle] = useState("");
  const [iframeLoading, setIframeLoading] = useState(true);
  const currentAudioRef = useRef(null);
  const queueIntervalRef = useRef(null);

  // Authorization Check
  useEffect(() => {
    if (userSession === undefined) return;
    if (!userSession || userSession.level < 4) {
      setIsAuthorized(false);
      const interval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push("/");
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsAuthorized(true);
    }
  }, [userSession, router]);

  useEffect(() => {
    if (userSession && userSession.id && !selectedRecipient) {
      setSelectedRecipient(userSession.id);
    }
  }, [userSession, selectedRecipient]);

  // Main Polling Effects
  useEffect(() => {
    if (!isAuthorized || !userSession) return;

    // 1. Initial Load of Widgets
    fetchWidgets();

    // 2. Poll Status & Rankings & History & Chat
    const statusTimer = setInterval(pollStatuses, 4000);
    const rankingTimer = setInterval(pollRankings, 5000);
    const historyTimer = setInterval(pollHistory, 5000);
    const chatTimer = setInterval(pollChats, 3000);

    // 3. Audio queue heartbeat
    queueIntervalRef.current = setInterval(processAudioQueue, 3000);

    pollStatuses();
    pollRankings();
    pollHistory();
    pollChats();

    return () => {
      clearInterval(statusTimer);
      clearInterval(rankingTimer);
      clearInterval(historyTimer);
      clearInterval(chatTimer);
      if (queueIntervalRef.current) clearInterval(queueIntervalRef.current);
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, [isAuthorized, userSession]);

  const fetchWidgets = async () => {
    try {
      const res = await fetch(`https://tuber.co.kr/cast/api/get_widget_layout.php?mb_id=${userSession.id}&apikey=${userSession.apikey}`);
      const data = await res.json();
      if (data.result === "success" && data.widgets) {
        setWidgets(data.widgets);
      }
    } catch (e) {
      console.warn("Failed fetching widgets list:", e);
      // Fallback
      setWidgets([
        "tuber", "subtitle", "overlay", "notification", "bgm",
        "slider", "ranking", "donator_ranking", "spin", "timer", "timer2", "vs", "toonation", "starter"
      ]);
    }
  };

  const pollStatuses = async () => {
    try {
      // Parallel configurations status checks
      const widgetKeys = ["slider", "ranking", "timer", "timer2", "notification", "donator_ranking", "spin", "vs", "subtitle", "bgm", "youtube", "starter", "overlay"];
      const promises = widgetKeys.map(key => 
        fetch(`https://tuber.co.kr/cast/api/get_widget_config.php?widget=${key}&mb_id=${userSession.id}&apikey=${userSession.apikey}`)
          .then(res => res.json())
          .catch(() => ({ result: "fail" }))
      );
      const results = await Promise.all(promises);
      const updatedStates = {};
      widgetKeys.forEach((key, idx) => {
        if (results[idx].result === "success" && results[idx].config) {
          updatedStates[key] = results[idx].config.is_visible;
        }
      });
      setWidgetStates(prev => ({ ...prev, ...updatedStates }));
    } catch (e) {
      console.warn("Statuses poll error:", e);
    }
  };

  const pollRankings = async () => {
    try {
      const res = await fetch(`https://tuber.co.kr/cast/api/get_ranking.php?mb_id=${userSession.id}&apikey=${userSession.apikey}&t=${Date.now()}`);
      const data = await res.json();
      if (data && data.rows && Array.isArray(data.rows)) {
        setRankings(data.rows);
      }
    } catch (e) {
      console.warn("Rankings poll error:", e);
    }
  };

  const pollHistory = async () => {
    try {
      const res = await fetch(`https://tuber.co.kr/cast/api/get_donation_history.php?mb_id=${userSession.id}&apikey=${userSession.apikey}&t=${Date.now()}`);
      const data = await res.json();
      if (data && data.rows && Array.isArray(data.rows)) {
        setHistory(data.rows);
      }
    } catch (e) {
      console.warn("History poll error:", e);
    }
  };

  const pollChats = async () => {
    try {
      const res = await fetch(`https://tuber.co.kr/cast/api/youtube_chat.php?mb_id=${userSession.id}&apikey=${userSession.apikey}&t=${Date.now()}`);
      const data = await res.json();
      if (data && data.chats) {
        setChats(data.chats);
      }
    } catch (e) {
      console.warn("Chats poll error:", e);
    }
  };

  // Audio queue handler (silent / TTS / signature mp3)
  const processAudioQueue = async () => {
    if (isMuted) return;
    try {
      const res = await fetch(`https://tuber.co.kr/cast/api/get_next_queued.php?mb_id=${userSession.id}&apikey=${userSession.apikey}&t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.result === "success" && data.data) {
        const item = data.data;
        const soundUrl = item.gs_music ? `https://tuber.co.kr/data/sound/${item.gs_music}` : null;
        if (soundUrl) {
          // Play audio
          if (currentAudioRef.current) currentAudioRef.current.pause();
          currentAudioRef.current = new Audio(soundUrl);
          currentAudioRef.current.play();
          currentAudioRef.current.onended = async () => {
            // Mark played
            await fetch(`https://tuber.co.kr/cast/api/mark_played.php?id=${item.id}&apikey=${userSession.apikey}&mb_id=${userSession.id}`);
          };
        } else {
          // Mark played immediately if silent
          await fetch(`https://tuber.co.kr/cast/api/mark_played.php?id=${item.id}&apikey=${userSession.apikey}&mb_id=${userSession.id}`);
        }
      }
    } catch (e) {
      console.warn("Queue play error:", e);
    }
  };

  // Toggle widget ON/OFF handler
  const handleToggleWidget = async (type, currentVal) => {
    const newVal = currentVal === 1 ? 0 : 1;
    setWidgetStates(prev => ({ ...prev, [type]: newVal }));
    try {
      const fd = new FormData();
      fd.append("st_key", `${type}_active`);
      fd.append("st_value", newVal.toString());
      fd.append("apikey", userSession.apikey);
      await fetch("https://tuber.co.kr/cast/api/update_active_notification.php", {
        method: "POST",
        body: fd
      });
    } catch (e) {
      console.warn("Toggle sync offline:", e);
    }
  };

  // Reorder lists (UP/DOWN buttons in Edit Mode)
  const handleMoveWidget = async (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === widgets.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const reordered = [...widgets];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    setWidgets(reordered);

    // Save layouts order to server
    try {
      const orders = reordered.map((type, idx) => ({ type, order: idx }));
      await fetch("https://tuber.co.kr/cast/api/save_widget_layout.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mb_id: userSession.id,
          apikey: userSession.apikey,
          action: "save_order",
          orders: orders
        })
      });
    } catch (e) {
      console.warn("Reorder save error:", e);
    }
  };

  const handleDrop = async (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;

    const reordered = [...widgets];
    const draggedItem = reordered[draggedIdx];
    reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, draggedItem);

    setWidgets(reordered);
    setDraggedIdx(null);

    // Save layouts order to server
    try {
      const orders = reordered.map((type, idx) => ({ type, order: idx }));
      await fetch("https://tuber.co.kr/cast/api/save_widget_layout.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mb_id: userSession.id,
          apikey: userSession.apikey,
          action: "save_order",
          orders: orders
        })
      });
    } catch (err) {
      console.warn("Reorder save error:", err);
    }
  };

  // Widgets actions
  const handleSpinSubmit = async () => {
    if (!spinInput) return;
    try {
      await fetch("https://tuber.co.kr/cast/api/spin_action.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mb_id: userSession.id,
          apikey: userSession.apikey,
          target: spinInput
        })
      });
      alert(`룰렛 결과값(${spinInput})이 전송되었습니다.`);
      setSpinInput("");
    } catch (e) {
      alert("룰렛 제어 실패");
    }
  };

  const handleVsSubmit = async () => {
    if (!vsInput) return;
    try {
      await fetch("https://tuber.co.kr/cast/api/vs_action.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mb_id: userSession.id,
          apikey: userSession.apikey,
          goal: vsInput
        })
      });
      alert(`VS 게이지 목표액(${vsInput})이 적용되었습니다.`);
      setVsInput("");
    } catch (e) {
      alert("VS 게이지 설정 실패");
    }
  };

  const handleControlTimer = async (action, slot) => {
    const min = slot === 1 ? timer1Min : timer2Min;
    const sec = slot === 1 ? timer1Sec : timer2Sec;
    try {
      await fetch("https://tuber.co.kr/cast/api/update_timer_state.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mb_id: userSession.id,
          apikey: userSession.apikey,
          slot: slot,
          action: action,
          min: min,
          sec: sec
        })
      });
      alert(`타이머${slot} [${action}] 명령이 전송되었습니다.`);
    } catch (e) {
      console.warn("Timer control failed:", e);
    }
  };

  // Modals submits
  const handleToonSave = async () => {
    try {
      await fetch("https://tuber.co.kr/cast/api/save_toonation_config.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mb_id: userSession.id,
          apikey: userSession.apikey,
          toonation_key: toonKey,
          pandatv_key: pandaKey
        })
      });
      alert("외부 후원 API 설정이 저장되었습니다.");
      setIsToonModalOpen(false);
    } catch (e) {
      alert("API 키 저장 실패");
    }
  };

  const handlePointAdjust = async () => {
    if (!adjName || !adjPoint) return;
    try {
      const res = await fetch("https://tuber.co.kr/cast/api/adjust_ranking_point.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mb_id: userSession.id,
          apikey: userSession.apikey,
          name: adjName,
          point: adjPoint
        })
      });
      const data = await res.json();
      if (data.result === "success") {
        alert("점수가 조정되었습니다.");
        setIsPointModalOpen(false);
        setAdjName("");
        setAdjPoint("");
        pollRankings();
      } else {
        alert(data.message || "점수 조정 실패");
      }
    } catch (e) {
      alert("점수 조정 요청 에러");
    }
  };

  const handleResetRankings = async () => {
    if (!confirm("금일 집계된 매출 및 모든 기여도 점수를 초기화하시겠습니까?")) return;
    try {
      await fetch("https://tuber.co.kr/cast/api/reset_donation_history.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mb_id: userSession.id,
          apikey: userSession.apikey,
          mode: "ranking"
        })
      });
      alert("후원 랭킹이 리셋되었습니다.");
      pollRankings();
    } catch (e) {
      alert("리셋 실패");
    }
  };

  const handleResetHistory = async () => {
    if (!confirm("모든 실시간 활동로그 내역을 지우시겠습니까?")) return;
    try {
      await fetch("https://tuber.co.kr/cast/api/reset_donation_history.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mb_id: userSession.id,
          apikey: userSession.apikey,
          mode: "history"
        })
      });
      alert("활동로그가 비워졌습니다.");
      pollHistory();
    } catch (e) {
      alert("리셋 실패");
    }
  };

  const appendBJTag = (bjName) => {
    setFormName((prev) => {
      let val = prev.trim();
      if (!val) val = "unknown";
      if (val.includes("@")) {
        val = val.split("@")[0].trim();
      }
      return val + "@" + bjName + " 감사합니다.";
    });
  };

  const handleManualDonation = async (e) => {
    e.preventDefault();
    if (!formName || (!formAmount && !formPoint && !formFrequency) || !selectedRecipient) {
      alert("이름, 금액(또는 기여도/횟수), 멤버를 모두 확인해주세요.");
      return;
    }

    const amountNum = parseFloat(formAmount) || 0;
    const contribRaw = parseFloat(formPoint) || 0;
    const contribution = (contribRaw > 0 && contribRaw <= 10 && amountNum > 0)
      ? contribRaw * amountNum
      : contribRaw;

    try {
      const res = await fetch("https://tuber.co.kr/cast/api/send_donation.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_name: formName,
          amount: formAmount || 0,
          contribution_val: contribution || 0,
          frequency_val: formFrequency || 0,
          recipient_id: selectedRecipient,
          gs_owner: userSession.id,
          apikey: userSession.apikey
        })
      });
      const data = await res.json();
      if (data.result === "success") {
        alert("수동 후원이 등록되었습니다.");
        setFormAmount("");
        setFormPoint("");
        setFormFrequency("");
        pollHistory();
        pollRankings();
      } else {
        alert(data.message || "등록 실패");
      }
    } catch (err) {
      alert("등록 실패");
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput) return;
    try {
      await fetch("https://tuber.co.kr/cast/api/send_youtube_chat.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mb_id: userSession.id,
          apikey: userSession.apikey,
          message: chatInput
        })
      });
      setChatInput("");
      pollChats();
    } catch (e) {
      console.warn("Chat send error:", e);
    }
  };

  // Helper Copy Function
  const handleCopyLink = (type) => {
    const url = `https://tuber.co.kr/cast/widget_${type}.html?mb_id=${userSession.id}&apikey=${userSession.apikey}`;
    navigator.clipboard.writeText(url);
    alert(t("cast_obsCopiedMsg"));
  };

  // STOP Audio completely
  const handleStopBgm = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    alert(t("cast_playQueueEmpty"));
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark text-white px-6">
        <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-white/10 text-center shadow-2xl">
          <span className="text-5xl block mb-6 animate-pulse">⚠️</span>
          <h2 className="text-xl font-black text-primary mb-4 uppercase tracking-wider">
            {t("navFeatures")}
          </h2>
          <p className="text-sm text-text-dim mb-6 leading-relaxed">
            {t("starter_authRequired")}
          </p>
          <p className="text-xs text-text-dim bg-white/5 py-2.5 rounded-lg border border-white/5">
            <span className="text-primary font-bold">{redirectCountdown}</span>
            {t("starter_redirecting")}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized || widgets.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#07080f] text-slate-200 pt-24 pb-16 px-4 md:px-6 font-sans">
      {/* 1. Header Area */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2.5 tracking-tight text-white">
            📺 <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">{t("cast_title")}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xl">
            {t("cast_desc")}
          </p>
        </div>

        {/* Master Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border flex items-center gap-1.5 ${
              isMuted 
                ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]" 
                : "bg-[#131629] border-white/10 text-slate-300 hover:text-white hover:bg-[#1a1e36]"
            }`}
          >
            {isMuted ? "🔇 " + t("cast_btnMute") : "🔊 " + t("cast_btnMute")}
          </button>
          <button
            onClick={handleStopBgm}
            className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/40 text-primary rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5"
          >
            ⏹️ {t("cast_btnStopBgm")}
          </button>
          <button
            onClick={() => setIsEditable(prev => !prev)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border flex items-center gap-1.5 ${
              isEditable 
                ? "bg-primary text-bg-dark border-primary shadow-[0_0_15px_rgba(0,240,255,0.4)]" 
                : "bg-[#131629] border-white/10 text-slate-300 hover:text-white hover:bg-[#1a1e36]"
            }`}
          >
            🛠️ {isEditable ? t("cast_editUnlocked") : t("cast_widgetEdit")}
          </button>
        </div>
      </div>

      {/* 2. Main content builder wrapper */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sorted Widgets 3-Column Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {widgets.map((type, idx) => {
              const label = WIDGET_LABELS[type]?.[lang] || WIDGET_LABELS[type]?.ko || type;
              const icon = WIDGET_ICONS[type] || "🔹";
              const isVisible = type === "tuber" || type === "toonation" || widgetStates[type] === 1;

              return (
                <div
                  key={type}
                  draggable={isEditable}
                  onDragStart={(e) => {
                    setDraggedIdx(idx);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`border rounded-2xl p-4 flex flex-col justify-between gap-3.5 transition-all duration-300 relative ${
                    draggedIdx === idx ? "opacity-40 border-dashed border-primary" : ""
                  } ${
                    isEditable 
                      ? "border-dashed border-primary/60 bg-[#1e2448] cursor-grab active:cursor-grabbing" 
                      : isVisible 
                      ? "border-solid border-primary/50 bg-[#1e2448] shadow-[0_4px_25px_rgba(0,0,0,0.55),0_0_12px_rgba(0,240,255,0.06)]" 
                      : "border-dashed border-[#24355a] bg-[#0c0f1d] opacity-100 hover:border-[#3b5284]"
                  }`}
                >
                  {/* Header row */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2.5">
                      {isEditable && (
                        <div className="text-slate-400 hover:text-white select-none text-base pr-1 font-mono">
                          ⠿
                        </div>
                      )}
                      <span className="text-xl select-none">{icon}</span>
                      <div>
                        <h3 className="text-xs font-black tracking-wide text-white">{label}</h3>
                        <span className="text-[9px] text-slate-400 font-mono uppercase block">{type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Toggle Switch */}
                      {type !== "tuber" && (
                        <button
                          type="button"
                          onClick={() => handleToggleWidget(type, widgetStates[type])}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 relative ${
                            isVisible ? "bg-emerald-500" : "bg-white/10"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-md ${
                            isVisible ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      )}
                      <span className={`text-[9px] font-black uppercase ${
                        isVisible ? "text-emerald-400" : "text-slate-400"
                      }`}>
                        {isVisible ? "ON" : "OFF"}
                      </span>
                    </div>
                  </div>

                  {/* Body actions depending on widget type */}
                  {type === "spin" && (
                    <div className="flex gap-1.5 mt-1">
                      <input
                        type="text"
                        placeholder="룰렛 결과값 입력"
                        value={spinInput}
                        onChange={(e) => setSpinInput(e.target.value)}
                        className="flex-grow bg-[#07080f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-primary/60 outline-none transition-colors"
                      />
                      <button
                        onClick={handleSpinSubmit}
                        className="bg-primary hover:bg-primary/80 hover:shadow-[0_0_8px_rgba(0,240,255,0.4)] text-bg-dark text-[11px] font-black px-3 py-1.5 rounded-lg transition-all"
                      >
                        스핀 적용
                      </button>
                    </div>
                  )}

                  {type === "vs" && (
                    <div className="flex gap-1.5 mt-1">
                      <input
                        type="number"
                        placeholder="목표 금액(원) 입력"
                        value={vsInput}
                        onChange={(e) => setVsInput(e.target.value)}
                        className="flex-grow bg-[#07080f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-primary/60 outline-none transition-colors font-mono"
                      />
                      <button
                        onClick={handleVsSubmit}
                        className="bg-primary hover:bg-primary/80 hover:shadow-[0_0_8px_rgba(0,240,255,0.4)] text-bg-dark text-[11px] font-black px-3.5 py-1.5 rounded-lg transition-all"
                      >
                        목표 설정
                      </button>
                    </div>
                  )}

                  {type === "timer" && (
                    <div className="flex flex-col gap-1.5 bg-[#07080f]/60 p-2 rounded-xl border border-white/5 mt-1">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          placeholder="분"
                          value={timer1Min}
                          onChange={(e) => setTimer1Min(parseInt(e.target.value) || 0)}
                          className="w-12 bg-[#07080f] border border-white/10 rounded-lg py-1 text-xs text-center text-slate-200 outline-none focus:border-primary/60 font-mono"
                        />
                        <span className="text-slate-400">:</span>
                        <input
                          type="number"
                          placeholder="초"
                          value={timer1Sec}
                          onChange={(e) => setTimer1Sec(parseInt(e.target.value) || 0)}
                          className="w-12 bg-[#07080f] border border-white/10 rounded-lg py-1 text-xs text-center text-slate-200 outline-none focus:border-primary/60 font-mono"
                        />
                        <button
                          onClick={() => handleControlTimer("start", 1)}
                          className="flex-grow bg-primary hover:bg-primary/80 text-bg-dark text-[10px] font-black py-1 px-2 rounded-lg transition-colors"
                        >
                          시작
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleControlTimer("pause", 1)}
                          className="bg-[#131629] hover:bg-[#1a1e36] border border-white/10 text-[10px] py-1 rounded-lg transition-colors text-slate-300 hover:text-white"
                        >
                          일시정지
                        </button>
                        <button
                          onClick={() => handleControlTimer("reset", 1)}
                          className="bg-[#131629] hover:bg-[#1a1e36] border border-white/10 text-[10px] py-1 rounded-lg transition-colors text-slate-300 hover:text-white"
                        >
                          리셋
                        </button>
                      </div>
                    </div>
                  )}

                  {type === "timer2" && (
                    <div className="flex flex-col gap-1.5 bg-[#07080f]/60 p-2 rounded-xl border border-white/5 mt-1">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          placeholder="분"
                          value={timer2Min}
                          onChange={(e) => setTimer2Min(parseInt(e.target.value) || 0)}
                          className="w-12 bg-[#07080f] border border-white/10 rounded-lg py-1 text-xs text-center text-slate-200 outline-none focus:border-primary/60 font-mono"
                        />
                        <span className="text-slate-400">:</span>
                        <input
                          type="number"
                          placeholder="초"
                          value={timer2Sec}
                          onChange={(e) => setTimer2Sec(parseInt(e.target.value) || 0)}
                          className="w-12 bg-[#07080f] border border-white/10 rounded-lg py-1 text-xs text-center text-slate-200 outline-none focus:border-primary/60 font-mono"
                        />
                        <button
                          onClick={() => handleControlTimer("start", 2)}
                          className="flex-grow bg-primary hover:bg-primary/80 text-bg-dark text-[10px] font-black py-1 px-2 rounded-lg transition-colors"
                        >
                          시작
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleControlTimer("pause", 2)}
                          className="bg-[#131629] hover:bg-[#1a1e36] border border-white/10 text-[10px] py-1 rounded-lg transition-colors text-slate-300 hover:text-white"
                        >
                          일시정지
                        </button>
                        <button
                          onClick={() => handleControlTimer("reset", 2)}
                          className="bg-[#131629] hover:bg-[#1a1e36] border border-white/10 text-[10px] py-1 rounded-lg transition-colors text-slate-300 hover:text-white"
                        >
                          리셋
                        </button>
                      </div>
                    </div>
                  )}

                  {type === "toonation" && (
                    <div className="flex gap-2 mt-2 border-t border-white/5 pt-2.5">
                      <button
                        onClick={() => setIsToonModalOpen(true)}
                        className="bg-[#1e1b4b] hover:bg-[#312e81] border border-indigo-500/30 text-indigo-300 text-xs font-semibold py-1.5 px-3 rounded-full flex-1 transition-all flex items-center justify-center gap-1"
                      >
                        <span>🔌</span> 투네이션
                      </button>
                      <button
                        onClick={() => setIsToonModalOpen(true)}
                        className="bg-[#451a03] hover:bg-[#78350f] border border-amber-500/30 text-amber-300 text-xs font-semibold py-1.5 px-3 rounded-full flex-1 transition-all flex items-center justify-center gap-1"
                      >
                        <span>🔌</span> 팬더TV
                      </button>
                    </div>
                  )}

                  {/* Footer action buttons row */}
                  {type !== "tuber" && type !== "toonation" && (
                    <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-2">
                      <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase px-2 py-0.5 bg-white/5 rounded border border-white/5">
                        {type}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => window.open(`https://tuber.co.kr/cast/widget_${type}.html?mb_id=${userSession.id}&apikey=${userSession.apikey}`, "_blank")}
                          className="w-7 h-7 flex items-center justify-center bg-[#07080f] hover:bg-[#1a1e36] border border-white/10 rounded-full text-xs transition-all hover:text-white"
                          title={t("cast_btnOpenScreen")}
                        >
                          🖥️
                        </button>
                        <button
                          onClick={() => handleCopyLink(type)}
                          className="w-7 h-7 flex items-center justify-center bg-[#07080f] hover:bg-[#1a1e36] border border-white/10 rounded-full text-xs transition-all hover:text-white"
                          title={t("cast_btnCopyLink")}
                        >
                          📋
                        </button>
                        <button
                          onClick={() => {
                            if (type === "starter") {
                              router.push("/starter");
                            } else {
                              setSettingsTitle(`${label} 설정`);
                              setIframeLoading(true);
                              setSettingsUrl(`https://tuber.co.kr/cast/${type}_settings.php?mb_id=${userSession.id}&apikey=${userSession.apikey}`);
                            }
                          }}
                          className="w-7 h-7 flex items-center justify-center bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-full text-xs transition-all text-primary"
                          title={t("cast_btnSettings")}
                        >
                          ⚙️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Console Sidebar Control Board */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Streamer Profile Card */}
          <div className="border border-white/5 bg-[#131629] rounded-2xl p-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-xs font-black text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              🪪 스트리머 프로필
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 font-bold">아이디</span>
                <span className="text-white font-black font-mono">{userSession.id}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 font-bold">API Key</span>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold font-mono tracking-wider">
                    {apiKeyVisible ? userSession.apikey : "••••••••••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setApiKeyVisible(!apiKeyVisible)}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="보이기/숨기기"
                  >
                    {apiKeyVisible ? "👁️" : "👁️‍🗨️"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(userSession.apikey);
                      alert("API Key가 클립보드에 복사되었습니다.");
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="복사"
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 font-bold">이용 기한</span>
                <span className="text-white font-medium flex items-center gap-1 font-mono">
                  📅 {userSession.expireDate || "무제한"}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">라이센스 등급</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                  userSession.level >= 10
                    ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                    : userSession.level >= 5
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : userSession.level === 4
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : userSession.level === 3
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    : "bg-slate-500/10 border-slate-500/30 text-slate-400"
                }`}>
                  {userSession.level >= 10
                    ? "최고 관리자"
                    : userSession.level >= 5
                    ? "VIP 프리미엄"
                    : userSession.level === 4
                    ? "프리미엄"
                    : userSession.level === 3
                    ? "베이직"
                    : "일반 회원"}
                </span>
              </div>
            </div>
          </div>

          {/* Console Tabs Card */}
          <div className="border border-white/5 bg-[#131629] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Tabs Headers */}
            <div className="flex border-b border-white/5 bg-[#07080f]">
              <button
                onClick={() => setActiveTab("ranking")}
                className={`flex-1 py-3 text-xs font-black tracking-wide border-b-2 transition-all ${
                  activeTab === "ranking" ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-400 hover:text-white hover:bg-white/2"
                }`}
              >
                🏆 랭킹 보드
              </button>
              <button
                onClick={() => setActiveTab("log")}
                className={`flex-1 py-3 text-xs font-black tracking-wide border-b-2 transition-all ${
                  activeTab === "log" ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-400 hover:text-white hover:bg-white/2"
                }`}
              >
                📜 활동로그
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-3 text-xs font-black tracking-wide border-b-2 transition-all ${
                  activeTab === "chat" ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-400 hover:text-white hover:bg-white/2"
                }`}
              >
                💬 채팅창
              </button>
            </div>

            {/* Tab content area */}
            <div className="p-4 flex-grow">
              {activeTab === "ranking" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-primary uppercase tracking-wider">
                      {t("cast_todayRankings")}
                    </h3>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setIsPointModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-[10px] font-bold px-2 py-1 rounded transition-colors text-white"
                      >
                        점수조정
                      </button>
                      <button
                        onClick={handleResetRankings}
                        className="bg-red-600 hover:bg-red-700 text-[10px] font-bold px-2 py-1 rounded transition-colors text-white"
                      >
                        {t("cast_btnResetRanking")}
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#07080f] border border-white/5 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#07080f]/80 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-white/5">
                        <tr>
                          <th className="px-3 py-2">닉네임</th>
                          <th className="px-3 py-2 text-right">매출</th>
                          <th className="px-3 py-2 text-right">점수</th>
                          <th className="px-3 py-2 text-right">기타</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankings.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">
                              집계된 데이터가 없습니다.
                            </td>
                          </tr>
                        ) : (
                          rankings.map((r, i) => {
                             const bjDisplayName = r.mb_nick || r.mb_name || r.mb_id;
                             const totalScore = (r.mb_point || 0) + (r.contribution || 0);
                             return (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] even:bg-[#07080f]/30 transition-colors">
                                <td className="px-3 py-2.5 font-bold text-white">{bjDisplayName}</td>
                                <td className="px-3 py-2.5 text-right font-mono text-white/80">₩{(r.mb_point || 0).toLocaleString()}</td>
                                <td className="px-3 py-2.5 text-right font-mono text-primary font-bold">{(totalScore).toLocaleString()}</td>
                                <td className="px-3 py-2.5 text-right font-mono text-slate-400">{r.frequency || 0}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "log" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-primary uppercase tracking-wider">
                      {t("cast_activityLog")}
                    </h3>
                    <div className="flex gap-1.5 items-center">
                      <a
                        href={`https://tuber.co.kr/cast/api/export_donation_history.php?mb_id=${userSession.id}&apikey=${userSession.apikey}&mode=all`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold px-2 py-1 rounded transition-colors text-white text-center whitespace-nowrap"
                      >
                        📊 XLS(전체)
                      </a>
                      <a
                        href={`https://tuber.co.kr/cast/api/export_donation_history.php?mb_id=${userSession.id}&apikey=${userSession.apikey}&mode=today`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold px-2 py-1 rounded transition-colors text-white text-center whitespace-nowrap"
                      >
                        📊 XLS(금일)
                      </a>
                      <button
                        onClick={handleResetHistory}
                        className="bg-red-600 hover:bg-red-700 text-[10px] font-bold px-2 py-1 rounded transition-colors text-white"
                      >
                        {t("cast_btnResetHistory")}
                      </button>
                    </div>
                  </div>

                  {/* Manual Sponsorship Form */}
                  <form onSubmit={handleManualDonation} className="bg-[#07080f]/50 border border-white/5 p-3 rounded-xl space-y-3 shadow-inner">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400 uppercase">닉네임</label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full bg-[#07080f] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-primary/60 transition-colors"
                          placeholder="홍길동"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400 uppercase">후원금액</label>
                        <input
                          type="number"
                          value={formAmount}
                          onChange={(e) => setFormAmount(e.target.value)}
                          className="w-full bg-[#07080f] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-primary/60 transition-colors font-mono"
                          placeholder="10000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1 relative">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] text-slate-400 uppercase">점수 (배율)</label>
                          {/* Live points calculations */}
                          {parseFloat(formPoint) > 0 && parseFloat(formPoint) <= 10 && parseFloat(formAmount) > 0 && (
                            <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.2 rounded font-bold">
                              × ₩{(parseFloat(formAmount)).toLocaleString()} = {(parseFloat(formPoint) * parseFloat(formAmount)).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          step="any"
                          value={formPoint}
                          onChange={(e) => setFormPoint(e.target.value)}
                          className="w-full bg-[#07080f] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-primary/60 transition-colors font-mono"
                          placeholder="1"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400 uppercase">횟수 (기타)</label>
                        <input
                          type="number"
                          value={formFrequency}
                          onChange={(e) => setFormFrequency(e.target.value)}
                          className="w-full bg-[#07080f] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-primary/60 transition-colors font-mono"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Member selection grid (Recipient BJ) */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider">멤버 선택 (수혜 BJ)</label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-[#07080f] rounded-xl border border-white/5 max-h-[100px] overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRecipient(userSession.id);
                            appendBJTag(userSession.name || userSession.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                            selectedRecipient === userSession.id
                              ? "bg-primary/20 border-primary text-primary shadow-[0_0_8px_rgba(0,240,255,0.25)]"
                              : "bg-[#07080f] border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          🌟 {userSession.id} (나)
                        </button>
                        {rankings
                          .filter(r => r.mb_id !== userSession.id)
                          .map((r, i) => {
                            const bjName = r.mb_nick || r.mb_name || r.mb_id;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setSelectedRecipient(r.mb_id);
                                  appendBJTag(bjName);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                                  selectedRecipient === r.mb_id
                                    ? "bg-primary/20 border-primary text-primary shadow-[0_0_8px_rgba(0,240,255,0.25)]"
                                    : "bg-[#07080f] border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                👤 {bjName}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/95 text-bg-dark text-xs font-black py-2 px-3 rounded-lg shadow-md hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all duration-300"
                    >
                      📡 {t("cast_btnSubmit")}
                    </button>
                  </form>

                  {/* Logs list output */}
                  <div className="bg-[#07080f] border border-white/5 rounded-xl p-3 max-h-[250px] overflow-y-auto space-y-2">
                    {history.length === 0 ? (
                      <p className="text-center py-8 text-xs text-slate-400 font-medium">로그 기록이 없습니다.</p>
                    ) : (
                      history.map((log, idx) => (
                        <div key={idx} className="text-xs border-b border-white/5 pb-2 last:border-0 pt-1 flex flex-col gap-0.5">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <strong className="text-white font-bold">{log.sender}</strong>
                              <span className="text-[10px] text-slate-400">➡️</span>
                              <span className="text-primary font-bold text-[11px]">{log.recipient_name}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono">{log.datetime}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-emerald-400 font-extrabold font-mono">
                              ₩{(log.point || 0).toLocaleString()}
                            </span>
                            <span className="text-primary font-bold font-mono text-[9px]">
                              점수: {(log.contribution || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "chat" && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-primary uppercase tracking-wider">
                    {t("cast_chatConsole")}
                  </h3>

                  <div className="bg-[#07080f] border border-white/5 rounded-xl p-3 h-[250px] overflow-y-auto space-y-2 font-mono text-xs">
                    {chats.length === 0 ? (
                      <p className="text-center py-8 text-slate-400">채팅 로그가 없습니다.</p>
                    ) : (
                      chats.map((c, i) => (
                        <div key={i} className="leading-relaxed border-b border-white/5 pb-1 last:border-0">
                          <span className="text-primary font-black mr-1.5">{c.author}:</span>
                          <span className="text-slate-300">{c.message}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendChat} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="채팅 메시지 입력..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-grow bg-[#07080f] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-primary/60 outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-bg-dark text-xs font-black px-4 rounded-lg transition-colors"
                    >
                      전송
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      {/* 1. Toonation Modal */}
      {isToonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="border border-white/5 bg-[#131629] max-w-md w-full p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <h2 className="text-sm font-black text-primary uppercase tracking-wider">
              🔌 {t("cast_modalToonationTitle")}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold">Toonation API Payload Key</label>
                <input
                  type="password"
                  value={toonKey}
                  onChange={(e) => setToonKey(e.target.value)}
                  className="w-full bg-[#07080f] border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary/60"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold">PandaTV Webhook Security Token</label>
                <input
                  type="password"
                  value={pandaKey}
                  onChange={(e) => setPandaKey(e.target.value)}
                  className="w-full bg-[#07080f] border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary/60"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setIsToonModalOpen(false)}
                className="px-4 py-1.5 bg-[#07080f] hover:bg-[#1a1e36] border border-white/10 rounded-lg text-xs transition-colors"
              >
                닫기
              </button>
              <button
                onClick={handleToonSave}
                className="px-4 py-1.5 bg-primary text-bg-dark font-black rounded-lg text-xs hover:bg-primary/95 transition-colors"
              >
                설정 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Point Adjust Modal */}
      {isPointModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="border border-white/5 bg-[#131629] max-w-sm w-full p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <h2 className="text-sm font-black text-primary uppercase tracking-wider">
              🏆 {t("cast_modalPointAdjTitle")}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-bold">시청자 닉네임</label>
                <input
                  type="text"
                  value={adjName}
                  onChange={(e) => setAdjName(e.target.value)}
                  className="w-full bg-[#07080f] border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary/60"
                  placeholder="예: 홍길동"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-bold">조정할 포인트 (+ / - 입력 가능)</label>
                <input
                  type="number"
                  value={adjPoint}
                  onChange={(e) => setAdjPoint(e.target.value)}
                  className="w-full bg-[#07080f] border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary/60"
                  placeholder="예: 50000"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setIsPointModalOpen(false)}
                className="px-4 py-1.5 bg-[#07080f] hover:bg-[#1a1e36] border border-white/10 rounded-lg text-xs transition-colors"
              >
                닫기
              </button>
              <button
                onClick={handlePointAdjust}
                className="px-4 py-1.5 bg-primary text-bg-dark font-black rounded-lg text-xs hover:bg-primary/95 transition-colors"
              >
                조정 반영
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Embedded Settings iframe Modal */}
      {settingsUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="border border-white/5 bg-[#131629] max-w-5xl w-full h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-[#0b0d1a]">
              <div className="flex items-center gap-2">
                <span className="text-base">⚙️</span>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  {settingsTitle}
                </h2>
              </div>
              <button
                onClick={() => setSettingsUrl(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all text-lg"
              >
                ✕
              </button>
            </div>
            
            {/* iframe container */}
            <div className="flex-grow w-full h-full relative bg-[#07080f]">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#131629] z-10">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400 font-bold">설정 페이지 로딩 중...</span>
                </div>
              )}
              <iframe
                src={settingsUrl}
                onLoad={() => setIframeLoading(false)}
                className="w-full h-full border-none bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
