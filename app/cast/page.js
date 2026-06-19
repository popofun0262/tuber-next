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
  const [formType, setFormType] = useState("sponsorship"); // sponsorship | sign
  const [formMemo, setFormMemo] = useState("");

  // Chat Form States
  const [chatInput, setChatInput] = useState("");

  // Audio queue processing
  const [isMuted, setIsMuted] = useState(false);
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
      const widgetKeys = ["slider", "ranking", "timer", "timer2", "notification", "donator_ranking", "spin", "vs", "subtitle", "bgm", "youtube", "starter"];
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
      if (data && Array.isArray(data)) {
        setRankings(data);
      }
    } catch (e) {
      console.warn("Rankings poll error:", e);
    }
  };

  const pollHistory = async () => {
    try {
      const res = await fetch(`https://tuber.co.kr/cast/api/get_donation_history.php?mb_id=${userSession.id}&apikey=${userSession.apikey}&t=${Date.now()}`);
      const data = await res.json();
      if (data && Array.isArray(data)) {
        setHistory(data);
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

  const handleManualDonation = async (e) => {
    e.preventDefault();
    if (!formName || !formAmount) return;
    try {
      await fetch("https://tuber.co.kr/cast/api/send_donation.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mb_id: userSession.id,
          apikey: userSession.apikey,
          name: formName,
          point: formAmount,
          type: formType,
          memo: formMemo
        })
      });
      alert("수동 후원이 등록되었습니다.");
      setFormName("");
      setFormAmount("");
      setFormMemo("");
      pollHistory();
      pollRankings();
    } catch (e) {
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
    <div className="min-h-screen bg-bg-dark text-white pt-24 pb-16 px-4 md:px-8">
      {/* 1. Header Area */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2.5">
            📺 {t("cast_title")}
          </h1>
          <p className="text-xs text-text-dim mt-1.5 leading-relaxed max-w-xl">
            {t("cast_desc")}
          </p>
        </div>

        {/* Master Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              isMuted ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-white/5 border-white/10 text-text-dim hover:text-white"
            }`}
          >
            {isMuted ? "🔇 " + t("cast_btnMute") : "🔊 " + t("cast_btnMute")}
          </button>
          <button
            onClick={handleStopBgm}
            className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all"
          >
            ⏹️ {t("cast_btnStopBgm")}
          </button>
          <button
            onClick={() => setIsEditable(prev => !prev)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              isEditable ? "bg-primary text-bg-dark border-primary shadow-lg" : "bg-white/5 border-white/10 text-text-dim hover:text-white"
            }`}
          >
            🛠️ {isEditable ? t("cast_editUnlocked") : t("cast_widgetEdit")}
          </button>
        </div>
      </div>

      {/* 2. Main content builder wrapper */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sorted Widgets List */}
        <div className="lg:col-span-8 space-y-4">
          {widgets.map((type, idx) => {
            const label = WIDGET_LABELS[type]?.[lang] || WIDGET_LABELS[type]?.ko || type;
            const icon = WIDGET_ICONS[type] || "🔹";
            const isVisible = widgetStates[type] === 1;

            return (
              <div
                key={type}
                className={`glass-panel border rounded-2xl p-4 flex flex-col gap-4 transition-all ${
                  isEditable ? "border-dashed border-primary/40 bg-primary/2" : "border-white/5 bg-white/2"
                }`}
              >
                {/* Header row */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xl select-none">{icon}</span>
                    <div>
                      <h3 className="text-sm font-bold tracking-wide">{label}</h3>
                      <span className="text-[10px] text-text-dim font-mono">{type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Widget Order Controls */}
                    {isEditable && (
                      <div className="flex gap-1 mr-2">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveWidget(idx, "up")}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-xs disabled:opacity-30 hover:bg-white/10"
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === widgets.length - 1}
                          onClick={() => handleMoveWidget(idx, "down")}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-xs disabled:opacity-30 hover:bg-white/10"
                        >
                          ▼
                        </button>
                      </div>
                    )}

                    {/* Status Badge */}
                    <span
                      onClick={() => type !== "tuber" && handleToggleWidget(type, widgetStates[type])}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer select-none transition-all ${
                        isVisible
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : "bg-white/5 border border-white/5 text-text-dim"
                      }`}
                    >
                      {isVisible ? "🟢 ON" : "⚪ OFF"}
                    </span>
                  </div>
                </div>

                {/* Body action controls depending on widget type */}
                {type === "spin" && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="룰렛 지정값 입력"
                      value={spinInput}
                      onChange={(e) => setSpinInput(e.target.value)}
                      className="flex-grow bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      onClick={handleSpinSubmit}
                      className="bg-primary hover:bg-primary/80 text-bg-dark text-xs font-bold px-4 rounded-lg"
                    >
                      스핀 적용
                    </button>
                  </div>
                )}

                {type === "vs" && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="목표 금액(원) 입력"
                      value={vsInput}
                      onChange={(e) => setVsInput(e.target.value)}
                      className="flex-grow bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      onClick={handleVsSubmit}
                      className="bg-primary hover:bg-primary/80 text-bg-dark text-xs font-bold px-4 rounded-lg"
                    >
                      목표 설정
                    </button>
                  </div>
                )}

                {type === "timer" && (
                  <div className="flex flex-col gap-2 bg-black/35 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="분"
                        value={timer1Min}
                        onChange={(e) => setTimer1Min(parseInt(e.target.value) || 0)}
                        className="w-16 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-center"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        placeholder="초"
                        value={timer1Sec}
                        onChange={(e) => setTimer1Sec(parseInt(e.target.value) || 0)}
                        className="w-16 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-center"
                      />
                      <button
                        onClick={() => handleControlTimer("start", 1)}
                        className="flex-grow bg-primary hover:bg-primary/80 text-bg-dark text-xs font-bold py-1 px-3 rounded-lg"
                      >
                        시작 (Start)
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleControlTimer("pause", 1)}
                        className="flex-1 bg-white/5 border border-white/10 text-xs py-1 rounded-lg hover:bg-white/10"
                      >
                        일시정지 (Pause)
                      </button>
                      <button
                        onClick={() => handleControlTimer("reset", 1)}
                        className="flex-1 bg-white/5 border border-white/10 text-xs py-1 rounded-lg hover:bg-white/10"
                      >
                        리셋 (Reset)
                      </button>
                    </div>
                  </div>
                )}

                {type === "timer2" && (
                  <div className="flex flex-col gap-2 bg-black/35 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="분"
                        value={timer2Min}
                        onChange={(e) => setTimer2Min(parseInt(e.target.value) || 0)}
                        className="w-16 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-center"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        placeholder="초"
                        value={timer2Sec}
                        onChange={(e) => setTimer2Sec(parseInt(e.target.value) || 0)}
                        className="w-16 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-center"
                      />
                      <button
                        onClick={() => handleControlTimer("start", 2)}
                        className="flex-grow bg-primary hover:bg-primary/80 text-bg-dark text-xs font-bold py-1 px-3 rounded-lg"
                      >
                        시작 (Start)
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleControlTimer("pause", 2)}
                        className="flex-1 bg-white/5 border border-white/10 text-xs py-1 rounded-lg hover:bg-white/10"
                      >
                        일시정지 (Pause)
                      </button>
                      <button
                        onClick={() => handleControlTimer("reset", 2)}
                        className="flex-1 bg-white/5 border border-white/10 text-xs py-1 rounded-lg hover:bg-white/10"
                      >
                        리셋 (Reset)
                      </button>
                    </div>
                  </div>
                )}

                {type === "toonation" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsToonModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg flex-1"
                    >
                      🔌 투네이션 연동 키설정
                    </button>
                    <button
                      onClick={() => setIsToonModalOpen(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg flex-1"
                    >
                      🔌 팬더TV 연동 키설정
                    </button>
                  </div>
                )}

                {/* Footer action buttons row */}
                {type !== "tuber" && type !== "toonation" && (
                  <div className="flex gap-2 border-t border-white/5 pt-3">
                    <button
                      onClick={() => window.open(`https://tuber.co.kr/cast/widget_${type}.html?mb_id=${userSession.id}&apikey=${userSession.apikey}`, "_blank")}
                      className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all flex-1"
                    >
                      🖥️ {t("cast_btnOpenScreen")}
                    </button>
                    <button
                      onClick={() => handleCopyLink(type)}
                      className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all flex-1"
                    >
                      📋 {t("cast_btnCopyLink")}
                    </button>
                    <button
                      onClick={() => {
                        if (type === "starter") {
                          router.push("/starter");
                        } else {
                          window.open(`https://tuber.co.kr/cast/${type}_settings.php?mb_id=${userSession.id}&apikey=${userSession.apikey}`, "_blank");
                        }
                      }}
                      className="px-3.5 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all flex-1"
                    >
                      ⚙️ {t("cast_btnSettings")}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Console Sidebar Control Board */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel border border-white/10 bg-white/2 rounded-2xl overflow-hidden shadow-xl">
            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-black/40">
              <button
                onClick={() => setActiveTab("ranking")}
                className={`flex-1 py-3 text-xs font-black tracking-wide border-b-2 transition-all ${
                  activeTab === "ranking" ? "border-primary text-primary" : "border-transparent text-text-dim hover:text-white"
                }`}
              >
                🏆 랭킹 보드
              </button>
              <button
                onClick={() => setActiveTab("log")}
                className={`flex-1 py-3 text-xs font-black tracking-wide border-b-2 transition-all ${
                  activeTab === "log" ? "border-primary text-primary" : "border-transparent text-text-dim hover:text-white"
                }`}
              >
                📜 활동로그
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-3 text-xs font-black tracking-wide border-b-2 transition-all ${
                  activeTab === "chat" ? "border-primary text-primary" : "border-transparent text-text-dim hover:text-white"
                }`}
              >
                💬 채팅창
              </button>
            </div>

            {/* Tab content area */}
            <div className="p-4">
              {activeTab === "ranking" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-primary uppercase tracking-wider">
                      {t("cast_todayRankings")}
                    </h3>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setIsPointModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-[10px] font-bold px-2 py-1 rounded"
                      >
                        점수조정
                      </button>
                      <button
                        onClick={handleResetRankings}
                        className="bg-red-600 hover:bg-red-700 text-[10px] font-bold px-2 py-1 rounded"
                      >
                        {t("cast_btnResetRanking")}
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-white/5 text-[10px] font-black text-text-dim uppercase tracking-wider border-b border-white/5">
                        <tr>
                          <th className="px-3 py-2">닉네임</th>
                          <th className="px-3 py-2 text-right">매출</th>
                          <th className="px-3 py-2 text-right">점수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankings.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="text-center py-6 text-text-dim font-medium">
                              집계된 데이터가 없습니다.
                            </td>
                          </tr>
                        ) : (
                          rankings.map((r, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                              <td className="px-3 py-2.5 font-bold">{r.name}</td>
                              <td className="px-3 py-2.5 text-right font-mono">₩{(r.amount || 0).toLocaleString()}</td>
                              <td className="px-3 py-2.5 text-right font-mono text-primary font-bold">{r.score || r.point || 0}</td>
                            </tr>
                          ))
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
                    <button
                      onClick={handleResetHistory}
                      className="bg-red-600 hover:bg-red-700 text-[10px] font-bold px-2 py-1 rounded"
                    >
                      {t("cast_btnResetHistory")}
                    </button>
                  </div>

                  {/* Manual Sponsorship form */}
                  <form onSubmit={handleManualDonation} className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="닉네임"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="number"
                        placeholder="후원금액"
                        required
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="sponsorship">일반후원</option>
                        <option value="sign">시그니처</option>
                      </select>
                      <input
                        type="text"
                        placeholder="메모/미션내용"
                        value={formMemo}
                        onChange={(e) => setFormMemo(e.target.value)}
                        className="flex-grow bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/80 text-bg-dark text-xs font-bold py-1 px-3 rounded-lg"
                    >
                      {t("cast_btnSubmit")}
                    </button>
                  </form>

                  <div className="bg-black/40 border border-white/5 rounded-xl p-3 max-h-[300px] overflow-y-auto space-y-2">
                    {history.length === 0 ? (
                      <p className="text-center py-6 text-xs text-text-dim font-medium">로그 기록이 없습니다.</p>
                    ) : (
                      history.map((log, idx) => (
                        <div key={idx} className="text-xs border-b border-white/5 pb-1.5 last:border-0">
                          <span className="text-[10px] text-text-dim mr-2">{log.time || log.date || ""}</span>
                          <strong className="text-primary">{log.name}</strong> 
                          <span className="text-emerald-400 font-bold ml-1">₩{(log.amount || log.point || 0).toLocaleString()}</span>
                          {log.memo && <p className="text-text-dim text-[11px] mt-0.5">{log.memo}</p>}
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

                  <div className="bg-black/40 border border-white/5 rounded-xl p-3 h-[250px] overflow-y-auto space-y-2 font-mono text-xs">
                    {chats.length === 0 ? (
                      <p className="text-center py-6 text-text-dim">채팅 로그가 없습니다.</p>
                    ) : (
                      chats.map((c, i) => (
                        <div key={i} className="leading-relaxed">
                          <span className="text-primary font-bold mr-1.5">{c.author}:</span>
                          <span className="text-text-dim">{c.message}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendChat} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="채팅 메시지 입력..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-grow bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary/80 text-bg-dark text-xs font-bold px-4 rounded-lg"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-sm font-black text-primary uppercase tracking-wider">
              🔌 {t("cast_modalToonationTitle")}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-text-dim mb-1 uppercase">Toonation API Payload Key</label>
                <input
                  type="password"
                  value={toonKey}
                  onChange={(e) => setToonKey(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-dim mb-1 uppercase">PandaTV Webhook Security Token</label>
                <input
                  type="password"
                  value={pandaKey}
                  onChange={(e) => setPandaKey(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsToonModalOpen(false)}
                className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs"
              >
                닫기
              </button>
              <button
                onClick={handleToonSave}
                className="px-4 py-1.5 bg-primary text-bg-dark font-bold rounded-lg text-xs"
              >
                설정 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Point Adjust Modal */}
      {isPointModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-sm font-black text-primary uppercase tracking-wider">
              🏆 {t("cast_modalPointAdjTitle")}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-text-dim mb-1">시청자 닉네임</label>
                <input
                  type="text"
                  value={adjName}
                  onChange={(e) => setAdjName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs"
                  placeholder="예: 홍길동"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-dim mb-1">조정할 포인트 (+ / - 입력 가능)</label>
                <input
                  type="number"
                  value={adjPoint}
                  onChange={(e) => setAdjPoint(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs"
                  placeholder="예: 50000"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsPointModalOpen(false)}
                className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs"
              >
                닫기
              </button>
              <button
                onClick={handlePointAdjust}
                className="px-4 py-1.5 bg-primary text-bg-dark font-bold rounded-lg text-xs"
              >
                조정 반영
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
