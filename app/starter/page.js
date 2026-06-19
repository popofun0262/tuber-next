"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../AppContext";

// Default Configuration matching Gnuboard schema
const defaultLogo = "https://tuber.co.kr/data/starter/shop/logo_1780109770.png";
const defaultDemoBg = "linear-gradient(to right, rgba(254, 44, 85, 0.6) 0%, rgba(223, 25, 63, 0.3) 100%)";

const getDefaultConfig = (orientation = "vertical") => ({
  is_visible: 1,
  orientation,
  logo: {
    url: defaultLogo,
    x: 10,
    y: 10,
    width: 15,
    visible: 1,
    anchor: "top-left",
    x_unit: "%",
    y_unit: "%"
  },
  subtitle: {
    text: "국민은행 1234567890123 홍길동",
    x: 50,
    y: 15,
    font_size: 36,
    color: "#ffffff",
    bg_color: "#fe2c55",
    visible: 1,
    anchor: "top-center",
    x_unit: "%",
    y_unit: "%"
  },
  sliding_subtitle: {
    text: "뉴스티거로 움직이는 자막을 만들어보세요",
    x: 0,
    y: 0,
    width: 100,
    height: 80,
    font_size: 32,
    color: "#ffffff",
    bg_color: "rgba(0,0,0,0.6)",
    speed: 10,
    visible: 1,
    anchor: "bottom-left",
    x_unit: "%",
    y_unit: "%"
  },
  qr: {
    url: "https://tuber.co.kr/show/index.php?id=shop",
    x: 10,
    y: 10,
    width: 12,
    color: "#fe2c55",
    visible: 1,
    anchor: "top-right",
    x_unit: "%",
    y_unit: "%"
  },
  slider: {
    group: 1,
    x: 0,
    y: 15,
    width: 100,
    height: 160,
    display_count: 4,
    visible: 1,
    anchor: "bottom-left",
    x_unit: "%",
    y_unit: "%"
  },
  ranking: {
    sort_by: "recent",
    x: 10,
    y: 20,
    width: 30,
    height: 450,
    visible: 1,
    scale: 1.0,
    bg_color: "rgba(0,0,0,0.4)",
    recent_direction: "normal",
    anchor: "top-left",
    x_unit: "%",
    y_unit: "%"
  }
});

export default function StarterPage() {
  const { userSession, setUserSession, setIsAuthModalOpen, handleLogout, lang, t } = useApp();
  const router = useRouter();
  const workspaceRef = useRef(null);

  // States
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [config, setConfig] = useState(null);
  const [activeElement, setActiveElement] = useState("logo");
  const [canvasScale, setCanvasScale] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState("logo");

  // Authorization checking
  useEffect(() => {
    if (userSession === undefined) return; // session still loading

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

  // Load layout configurations
  useEffect(() => {
    if (!isAuthorized || !userSession) return;

    const loadConfig = async () => {
      try {
        const res = await fetch(
          `https://tuber.co.kr/cast/api/get_starter_config.php?mb_id=${userSession.id}&apikey=${userSession.apikey || ""}`,
          {
            credentials: "include"
          }
        );
        const data = await res.json();
        if (data.result === "success" && data.config) {
          // Sync/backfill apikey automatically if retrieved from database and different from current userSession.apikey
          if (data.apikey && data.apikey !== userSession.apikey) {
            setUserSession((prev) => {
              if (!prev || prev.apikey === data.apikey) return prev;
              const updated = { ...prev, apikey: data.apikey };
              localStorage.setItem("tuber_user_session", JSON.stringify(updated));
              return updated;
            });
          }
          // Bind missing settings for backward compatibility
          const elements = ["logo", "subtitle", "sliding_subtitle", "qr", "slider", "ranking"];
          const loaded = { ...data.config };
          elements.forEach((el) => {
            if (loaded[el]) {
              if (!loaded[el].anchor) {
                loaded[el].anchor = el === "subtitle" ? "top-center" : "top-left";
              }
              if (!loaded[el].x_unit) loaded[el].x_unit = "%";
              if (!loaded[el].y_unit) loaded[el].y_unit = "%";
            }
          });
          if (!loaded.orientation) {
            loaded.orientation = "vertical";
          }
          setConfig(loaded);
        } else {
          throw new Error("Invalid config from server");
        }
      } catch (err) {
        console.warn("Failed fetching backend config, checking localStorage:", err);
        const cached = localStorage.getItem(`tuber_starter_config_${userSession.id}`);
        if (cached) {
          try {
            setConfig(JSON.parse(cached));
          } catch (e) {
            setConfig(getDefaultConfig("vertical"));
          }
        } else {
          setConfig(getDefaultConfig("vertical"));
        }
      }
    };

    loadConfig();
  }, [isAuthorized, userSession]);

  // Calculate canvas scaling
  const isVertical = config?.orientation === "vertical";
  const canvasWidth = isVertical ? 1080 : 1920;
  const canvasHeight = isVertical ? 1920 : 1080;

  useEffect(() => {
    if (!config || !workspaceRef.current) return;

    const handleResize = (width, height) => {
      if (width <= 0 || height <= 0) return;
      const isMobile = window.innerWidth <= 991;
      const pad = isMobile ? 30 : 80;
      const availW = width - pad;
      const availH = height - pad;
      const ratio = isVertical ? 9 / 16 : 16 / 9;

      let targetW, targetH;
      if (isMobile) {
        targetW = width * 0.9;
        targetH = targetW / ratio;
        if (targetH > availH) {
          targetH = availH;
          targetW = targetH * ratio;
        }
      } else {
        if (availW / availH > ratio) {
          targetH = availH;
          targetW = targetH * ratio;
        } else {
          targetW = availW;
          targetH = targetW / ratio;
        }
      }

      const newScale = targetW / canvasWidth;
      if (newScale > 0) {
        setCanvasScale(newScale);
      }
    };

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        handleResize(width, height);
      }
    });

    observer.observe(workspaceRef.current);

    // Initial check
    if (workspaceRef.current.clientWidth > 0) {
      handleResize(workspaceRef.current.clientWidth, workspaceRef.current.clientHeight);
    }

    return () => observer.disconnect();
  }, [config, isVertical, canvasWidth]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark text-text-dim text-sm">
        Loading builder...
      </div>
    );
  }

  // Access Denied Screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark px-6">
        <div className="max-w-md w-full glass-panel rounded-3xl border border-white/10 p-10 text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 text-3xl font-bold">
            ⚠️
          </div>
          <h2 className="text-xl font-extrabold text-text-bright mb-4">
            {t("starter_authRequired")}
          </h2>
          <p className="text-sm text-text-dim">
            <span className="text-primary font-bold">{redirectCountdown}</span>
            {t("starter_redirecting")}
          </p>
        </div>
      </div>
    );
  }

  if (!config) return null;

  // Toggle widget visibility ON/OFF status
  const handleToggleGlobal = async (val) => {
    const updated = { ...config, is_visible: val };
    setConfig(updated);

    try {
      const fd = new FormData();
      fd.append("action", "toggle_visibility");
      fd.append("visible", val.toString());
      fd.append("ajax", "1");
      await fetch(
        `https://tuber.co.kr/cast/starter_settings.php?mb_id=${userSession.id}&apikey=${userSession.apikey}`,
        { method: "POST", body: fd }
      );
    } catch (err) {
      console.warn("Visibility toggle backend sync offline, saving locally:", err);
      localStorage.setItem(`tuber_starter_config_${userSession.id}`, JSON.stringify(updated));
    }
  };

  // Convert orientation layout
  const handleSwitchOrientation = (orient) => {
    setConfig((prev) => {
      const updated = { ...prev, orientation: orient };
      // Reset position margins slightly to adjust scales
      const elements = ["logo", "subtitle", "sliding_subtitle", "qr", "slider", "ranking"];
      elements.forEach((el) => {
        if (updated[el]) {
          if (updated[el].x_unit === "px") updated[el].x = 100;
          if (updated[el].y_unit === "px") updated[el].y = 150;
        }
      });
      return updated;
    });
  };

  // Drag-and-drop & Resize calculations
  const handleDragStart = (e, type, actionType) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveElement(type);
    setActiveAccordion(type);

    const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;

    const item = config[type];
    const startXVal = parseFloat(item.x) || 0;
    const startYVal = parseFloat(item.y) || 0;
    const startWidthVal = parseFloat(item.width) || 0;
    const startHeightVal = parseFloat(item.height) || 0;
    const startFontSizeVal = parseFloat(item.font_size) || 0;

    const handleMove = (moveEvent) => {
      const curX = moveEvent.type.startsWith("touch") ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const curY = moveEvent.type.startsWith("touch") ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const dx = (curX - clientX) / canvasScale;
      const dy = (curY - clientY) / canvasScale;

      setConfig((prev) => {
        const updatedItem = { ...prev[type] };

        if (actionType === "drag") {
          const anchor = updatedItem.anchor || "top-left";
          const xUnit = updatedItem.x_unit || "%";
          const yUnit = updatedItem.y_unit || "%";

          const factorX = xUnit === "%" ? 100 / canvasWidth : 1;
          const factorY = yUnit === "%" ? 100 / canvasHeight : 1;

          let newX = startXVal;
          let newY = startYVal;

          if (anchor.includes("left")) {
            newX = startXVal + dx * factorX;
          } else if (anchor.includes('right')) {
            newX = startXVal - dx * factorX;
          } else if (anchor.includes('center')) {
            newX = startXVal + dx * factorX;
          }

          if (anchor.startsWith("top")) {
            newY = startYVal + dy * factorY;
          } else if (anchor.startsWith("bottom")) {
            newY = startYVal - dy * factorY;
          }

          if (xUnit === "%") newX = Math.max(0, Math.min(100, newX));
          else newX = Math.max(0, Math.min(canvasWidth, newX));

          if (yUnit === "%") newY = Math.max(0, Math.min(100, newY));
          else newY = Math.max(0, Math.min(canvasHeight, newY));

          updatedItem.x = parseFloat(newX.toFixed(1));
          updatedItem.y = parseFloat(newY.toFixed(1));
        } else if (actionType === "resize") {
          let newW = startWidthVal;
          let newH = startHeightVal;

          if (type === "logo" || type === "qr" || type === "slider" || type === "ranking") {
            const wDeltaPercent = (dx / canvasWidth) * 100;
            newW = Math.max(5, Math.min(100, startWidthVal + wDeltaPercent));
            updatedItem.width = parseFloat(newW.toFixed(1));
          }

          if (type === "slider" || type === "ranking" || type === "sliding_subtitle") {
            newH = Math.max(20, startHeightVal + dy);
            updatedItem.height = Math.round(newH);
          }

          if (type === "subtitle") {
            const scale = 1 + dx / 300;
            let newFS = Math.round(startFontSizeVal * scale);
            newFS = Math.max(12, Math.min(120, newFS));
            updatedItem.font_size = newFS;
          }
        }

        return { ...prev, [type]: updatedItem };
      });
    };

    const handleStop = () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleStop);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleStop);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleStop);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleStop);
  };

  // Convert File upload to Base64 Url preview
  const handleLogoFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig((prev) => ({
          ...prev,
          logo: { ...prev.logo, url: event.target.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Color syncing utilities
  const handleColorUpdate = (type, field, hex) => {
    setConfig((prev) => {
      const item = { ...prev[type] };
      const currentVal = item[field] || "";
      const parsed = parseRgba(currentVal);
      const updatedColor = hexToRgba(hex, parsed.alpha);
      return {
        ...prev,
        [type]: { ...item, [field]: updatedColor }
      };
    });
  };

  const handleOpacityUpdate = (type, field, opacityVal) => {
    setConfig((prev) => {
      const item = { ...prev[type] };
      const currentVal = item[field] || "";
      const parsed = parseRgba(currentVal);
      const alpha = parseFloat(opacityVal) / 100;
      const updatedColor = hexToRgba(parsed.hex, alpha);
      return {
        ...prev,
        [type]: { ...item, [field]: updatedColor }
      };
    });
  };

  const parseRgba = (rgbaStr) => {
    const str = (rgbaStr || "").trim();
    if (!str) return { hex: "#000000", alpha: 1.0 };
    if (str.startsWith("#")) {
      let hex = str;
      if (hex.length === 4) {
        hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      return { hex: hex.length === 7 ? hex : "#000000", alpha: 1.0 };
    }
    const match = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1.0;
      const toHex = (c) => {
        const h = c.toString(16);
        return h.length === 1 ? "0" + h : h;
      };
      return { hex: "#" + toHex(r) + toHex(g) + toHex(b), alpha };
    }
    return { hex: "#000000", alpha: 1.0 };
  };

  const hexToRgba = (hex, alpha) => {
    let h = (hex || "#000000").trim();
    if (!h.startsWith("#")) return h;
    if (h.length === 4) {
      h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    }
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    if (alpha === 1.0) return h;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `https://tuber.co.kr/cast/api/save_starter_config.php?mb_id=${userSession.id}&apikey=${userSession.apikey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            mb_id: userSession.id,
            apikey: userSession.apikey,
            config: config
          })
        }
      );
      const data = await response.json();
      if (data.result === "success") {
        alert(t("starter_savedMsg"));
        localStorage.setItem(`tuber_starter_config_${userSession.id}`, JSON.stringify(config));
      } else {
        throw new Error(data.message || "Failed saving on backend");
      }
    } catch (err) {
      console.warn("Failed to save to backend API, writing to localStorage fallback:", err);
      localStorage.setItem(`tuber_starter_config_${userSession.id}`, JSON.stringify(config));
      alert(`${t("starter_savedMsg")} (Offline Mode: Saved to Local Storage)`);
    } finally {
      setIsSaving(false);
    }
  };

  // Copy OBS Widget URL
  const handleCopyObsUrl = () => {
    const url = `https://tuber.co.kr/cast/widget_starter.html?mb_id=${userSession.id}&apikey=${userSession.apikey}`;
    navigator.clipboard.writeText(url);
    alert(t("starter_obsCopiedMsg"));
  };

  // Elements positioning styling generator
  const getElementStyle = (type, item) => {
    if (!item) return {};
    const anchor = item.anchor || "top-left";
    const xUnit = item.x_unit || "%";
    const yUnit = item.y_unit || "%";
    const xVal = item.x ?? 0;
    const yVal = item.y ?? 0;

    const style = {
      position: "absolute",
      left: "auto",
      right: "auto",
      top: "auto",
      bottom: "auto",
      transform: "none",
      transformOrigin: "top left",
    };

    if (type === "logo" || type === "qr" || type === "slider" || type === "ranking") {
      style.width = `${item.width}%`;
    }
    if (type === "slider" || type === "ranking" || type === "sliding_subtitle") {
      style.height = `${item.height}px`;
    }
    if (type === "sliding_subtitle") {
      style.width = "100%";
    }

    if (anchor.includes("left")) {
      style.left = `${xVal}${xUnit}`;
    } else if (anchor.includes("right")) {
      style.right = `${xVal}${xUnit}`;
    } else if (anchor.includes("center")) {
      style.left = "50%";
      style.transformOrigin = "top center";
    }

    if (anchor.startsWith("top")) {
      style.top = `${yVal}${yUnit}`;
    } else if (anchor.startsWith("bottom")) {
      style.bottom = `${yVal}${yUnit}`;
    }

    let transX = "";
    if (anchor.includes("center")) {
      transX = "translateX(-50%)";
    }

    let scaleStr = "";
    if (type === "ranking" && item.scale !== undefined) {
      scaleStr = `scale(${item.scale})`;
    }

    const transArr = [transX, scaleStr].filter(Boolean);
    if (transArr.length > 0) {
      style.transform = transArr.join(" ");
    }

    return style;
  };

  // Spacing guide line rendering logic
  const getGuideLineXStyle = () => {
    if (!activeElement || !config[activeElement]) return {};
    const item = config[activeElement];
    const anchor = item.anchor || "top-left";
    const xUnit = item.x_unit || "%";
    const xVal = item.x ?? 0;

    const style = {
      top: 0,
      bottom: 0,
    };

    if (anchor.includes("left")) {
      style.left = `${xVal}${xUnit}`;
    } else if (anchor.includes("right")) {
      style.right = `${xVal}${xUnit}`;
    } else {
      style.left = "50%";
    }
    return style;
  };

  const getGuideLineYStyle = () => {
    if (!activeElement || !config[activeElement]) return {};
    const item = config[activeElement];
    const anchor = item.anchor || "top-left";
    const yUnit = item.y_unit || "%";
    const yVal = item.y ?? 0;

    const style = {
      left: 0,
      right: 0,
    };

    if (anchor.startsWith("top")) {
      style.top = `${yVal}${yUnit}`;
    } else if (anchor.startsWith("bottom")) {
      style.bottom = `${yVal}${yUnit}`;
    }
    return style;
  };

  const getGuideLineXTextStyle = () => {
    if (!activeElement || !config[activeElement]) return {};
    const item = config[activeElement];
    const anchor = item.anchor || "top-left";
    const style = { top: "25%" };
    if (anchor.includes("right")) {
      style.right = "10px";
    } else {
      style.left = "10px";
    }
    return style;
  };

  const getGuideLineYTextStyle = () => {
    if (!activeElement || !config[activeElement]) return {};
    const item = config[activeElement];
    const anchor = item.anchor || "top-left";
    const style = { left: "25%" };
    if (anchor.startsWith("bottom")) {
      style.bottom = "10px";
    } else {
      style.top = "10px";
    }
    return style;
  };

  return (
    <div className="pt-24 min-h-screen bg-[#06070a] text-text-bright flex flex-col md:flex-row overflow-hidden select-none">
      {/* 1. Left Visual Workspace Area */}
      <div
        ref={workspaceRef}
        className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center bg-radial from-[#13151f] to-[#06070a] relative min-h-[480px] md:min-h-[calc(100vh-96px)] overflow-hidden border-r border-white/5"
      >
        {/* Virtual Canvas container */}
        <div
          className="relative rounded-2xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.95)] overflow-hidden transition-all duration-300 bg-cover bg-center"
          style={{
            width: `${canvasWidth * (canvasScale || 0.1)}px`,
            height: `${canvasHeight * (canvasScale || 0.1)}px`,
            backgroundImage: "url('/starter_bgd.jpg')",
            backgroundSize: "cover",
            opacity: canvasScale === null ? 0 : 1
          }}
        >
          {/* Canvas Dot Matrix Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px] pointer-events-none z-0" />

          {/* Draggable workspace boundary */}
          <div
            className="absolute inset-0 origin-top-left pointer-events-auto"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `scale(${canvasScale || 0.1})`
            }}
          >
            {/* Guide Lines rendering */}
            {activeElement && config[activeElement] && config[activeElement].visible ? (
              <>
                <div
                  className="absolute border-l border-dashed border-primary/60 pointer-events-none z-30"
                  style={getGuideLineXStyle()}
                >
                  <span
                    className="absolute bg-primary text-bg-dark text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow whitespace-nowrap"
                    style={getGuideLineXTextStyle()}
                  >
                    X: {config[activeElement].x}
                    {config[activeElement].x_unit}
                  </span>
                </div>
                <div
                  className="absolute border-t border-dashed border-primary/60 pointer-events-none z-30"
                  style={getGuideLineYStyle()}
                >
                  <span
                    className="absolute bg-primary text-bg-dark text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow whitespace-nowrap"
                    style={getGuideLineYTextStyle()}
                  >
                    Y: {config[activeElement].y}
                    {config[activeElement].y_unit}
                  </span>
                </div>
              </>
            ) : null}

            {/* 1. Logo element */}
            {config.logo?.visible ? (
              <div
                style={getElementStyle("logo", config.logo)}
                onClick={() => {
                  setActiveElement("logo");
                  setActiveAccordion("logo");
                }}
                className={`canvas-element select-none cursor-move border ${
                  activeElement === "logo" ? "border-primary shadow-[0_0_15px_rgba(0,240,255,0.3)] bg-primary/5" : "border-white/10 hover:border-primary/50"
                }`}
                onMouseDown={(e) => handleDragStart(e, "logo", "drag")}
                onTouchStart={(e) => handleDragStart(e, "logo", "drag")}
              >
                <div className="absolute -top-6 left-0 bg-primary text-bg-dark text-[9px] font-bold px-1.5 py-0.5 rounded-t">
                  {t("starter_secLogo")}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config.logo.url}
                  alt="Logo preview"
                  draggable={false}
                  className="w-full h-auto object-contain"
                />
                {activeElement === "logo" && (
                  <div
                    className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 bg-white border-2 border-primary rounded-full cursor-se-resize shadow"
                    onMouseDown={(e) => handleDragStart(e, "logo", "resize")}
                    onTouchStart={(e) => handleDragStart(e, "logo", "resize")}
                  />
                )}
              </div>
            ) : null}

            {/* 2. Subtitle element */}
            {config.subtitle?.visible ? (
              <div
                style={getElementStyle("subtitle", config.subtitle)}
                onClick={() => {
                  setActiveElement("subtitle");
                  setActiveAccordion("subtitle");
                }}
                className={`canvas-element select-none cursor-move border rounded-full px-8 py-3 font-extrabold flex items-center justify-center whitespace-nowrap ${
                  activeElement === "subtitle" ? "border-primary shadow-[0_0_15px_rgba(0,240,255,0.3)]" : "border-white/10 hover:border-primary/50"
                }`}
                style={{
                  ...getElementStyle("subtitle", config.subtitle),
                  fontSize: `${config.subtitle.font_size}px`,
                  color: config.subtitle.color,
                  backgroundColor: config.subtitle.bg_color,
                }}
                onMouseDown={(e) => handleDragStart(e, "subtitle", "drag")}
                onTouchStart={(e) => handleDragStart(e, "subtitle", "drag")}
              >
                <div className="absolute -top-6 left-2 bg-primary text-bg-dark text-[9px] font-bold px-1.5 py-0.5 rounded-t">
                  {t("starter_secSubtitle")}
                </div>
                {config.subtitle.text}
                {activeElement === "subtitle" && (
                  <div
                    className="absolute right-2 bottom-1 w-3.5 h-3.5 bg-white border-2 border-primary rounded-full cursor-se-resize shadow"
                    onMouseDown={(e) => handleDragStart(e, "subtitle", "resize")}
                    onTouchStart={(e) => handleDragStart(e, "subtitle", "resize")}
                  />
                )}
              </div>
            ) : null}

            {/* 3. Sliding Subtitle (Ticker) */}
            {config.sliding_subtitle?.visible ? (
              <div
                style={getElementStyle("sliding_subtitle", config.sliding_subtitle)}
                onClick={() => {
                  setActiveElement("sliding_subtitle");
                  setActiveAccordion("sliding_subtitle");
                }}
                className={`canvas-element select-none cursor-move border overflow-hidden flex items-center ${
                  activeElement === "sliding_subtitle" ? "border-primary shadow-[0_0_15px_rgba(0,240,255,0.3)]" : "border-white/10 hover:border-primary/50"
                }`}
                style={{
                  ...getElementStyle("sliding_subtitle", config.sliding_subtitle),
                  backgroundColor: config.sliding_subtitle.bg_color,
                }}
                onMouseDown={(e) => handleDragStart(e, "sliding_subtitle", "drag")}
                onTouchStart={(e) => handleDragStart(e, "sliding_subtitle", "drag")}
              >
                <div className="absolute top-1 left-2 bg-primary text-bg-dark text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
                  {t("starter_secSliding")}
                </div>
                <div
                  className="w-full text-left font-black whitespace-nowrap animate-[marquee_20s_linear_infinite] px-4"
                  style={{
                    fontSize: `${config.sliding_subtitle.font_size}px`,
                    color: config.sliding_subtitle.color
                  }}
                >
                  {config.sliding_subtitle.text}
                </div>
                {activeElement === "sliding_subtitle" && (
                  <div
                    className="absolute right-2 bottom-2 w-3.5 h-3.5 bg-white border-2 border-primary rounded-full cursor-se-resize shadow"
                    onMouseDown={(e) => handleDragStart(e, "sliding_subtitle", "resize")}
                    onTouchStart={(e) => handleDragStart(e, "sliding_subtitle", "resize")}
                  />
                )}
              </div>
            ) : null}

            {/* 4. QR Code element */}
            {config.qr?.visible ? (
              <div
                style={getElementStyle("qr", config.qr)}
                onClick={() => {
                  setActiveElement("qr");
                  setActiveAccordion("qr");
                }}
                className={`canvas-element select-none cursor-move border p-2 bg-white rounded-xl ${
                  activeElement === "qr" ? "border-primary shadow-[0_0_15px_rgba(0,240,255,0.3)]" : "border-white/10 hover:border-primary/50"
                }`}
                onMouseDown={(e) => handleDragStart(e, "qr", "drag")}
                onTouchStart={(e) => handleDragStart(e, "qr", "drag")}
              >
                <div className="absolute -top-6 left-0 bg-primary text-bg-dark text-[9px] font-bold px-1.5 py-0.5 rounded-t">
                  {t("starter_secQr")}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    config.qr.url || "https://tuber.co.kr"
                  )}&color=${(config.qr.color || "#fe2c55").replace("#", "")}&bgcolor=ffffff`}
                  alt="QR Code"
                  draggable={false}
                  className="w-full h-auto aspect-square object-contain"
                />
                {activeElement === "qr" && (
                  <div
                    className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 bg-white border-2 border-primary rounded-full cursor-se-resize shadow"
                    onMouseDown={(e) => handleDragStart(e, "qr", "resize")}
                    onTouchStart={(e) => handleDragStart(e, "qr", "resize")}
                  />
                )}
              </div>
            ) : null}

            {/* 5. Product Slider element */}
            {config.slider?.visible ? (
              <div
                style={getElementStyle("slider", config.slider)}
                onClick={() => {
                  setActiveElement("slider");
                  setActiveAccordion("slider");
                }}
                className={`canvas-element select-none cursor-move border overflow-hidden flex items-center p-1 gap-2 bg-black/40 backdrop-blur ${
                  activeElement === "slider" ? "border-primary shadow-[0_0_15px_rgba(0,240,255,0.3)]" : "border-white/10 hover:border-primary/50"
                }`}
                onMouseDown={(e) => handleDragStart(e, "slider", "drag")}
                onTouchStart={(e) => handleDragStart(e, "slider", "drag")}
              >
                <div className="absolute -top-6 left-0 bg-primary text-bg-dark text-[9px] font-bold px-1.5 py-0.5 rounded-t">
                  {t("starter_secSlider")}
                </div>
                {Array.from({ length: config.slider.display_count || 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{ flex: `0 0 ${100 / (config.slider.display_count || 4) - 1}%` }}
                    className="h-full bg-white text-bg-dark flex rounded overflow-hidden"
                  >
                    <div className="w-[45%] bg-zinc-200 flex items-center justify-center text-zinc-400">
                      🖼️
                    </div>
                    <div className="flex-grow p-2 flex flex-col justify-center select-none text-left">
                      <div className="text-[14px] font-black leading-none truncate mb-1">
                        {t("starter_sliderDemoName")}
                      </div>
                      <div className="text-[12px] font-extrabold text-primary leading-none">
                        {t("starter_sliderDemoPrice")}
                      </div>
                    </div>
                  </div>
                ))}
                {activeElement === "slider" && (
                  <div
                    className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 bg-white border-2 border-primary rounded-full cursor-se-resize shadow"
                    onMouseDown={(e) => handleDragStart(e, "slider", "resize")}
                    onTouchStart={(e) => handleDragStart(e, "slider", "resize")}
                  />
                )}
              </div>
            ) : null}

            {/* 6. Leaderboard Ranking element */}
            {config.ranking?.visible ? (
              <div
                style={getElementStyle("ranking", config.ranking)}
                onClick={() => {
                  setActiveElement("ranking");
                  setActiveAccordion("ranking");
                }}
                className={`canvas-element select-none cursor-move border p-4 flex flex-col gap-2.5 overflow-hidden rounded-2xl ${
                  activeElement === "ranking" ? "border-primary shadow-[0_0_15px_rgba(0,240,255,0.3)]" : "border-white/10 hover:border-primary/50"
                }`}
                onMouseDown={(e) => handleDragStart(e, "ranking", "drag")}
                onTouchStart={(e) => handleDragStart(e, "ranking", "drag")}
              >
                <div className="absolute -top-6 left-0 bg-primary text-bg-dark text-[9px] font-bold px-1.5 py-0.5 rounded-t">
                  {t("starter_secRanking")}
                </div>

                <div
                  className="w-full flex-grow flex flex-col gap-2 origin-top-left"
                  style={{
                    transform: `scale(${config.ranking.scale || 1.0})`,
                    width: `${100 / (config.ranking.scale || 1.0)}%`
                  }}
                >
                  {config.ranking.sort_by === "recent" ? (
                    // Recent Orders List (direction Normal or Reverse)
                    <div
                      className={`flex gap-2 w-full ${
                        config.ranking.recent_direction === "reverse" ? "flex-col-reverse" : "flex-col"
                      }`}
                    >
                      {[
                        { name: "홍길동", desc: "데모상품 1개" },
                        { name: "임꺽정", desc: "데모상품 2개" },
                        { name: "성춘향", desc: "데모상품 1개" }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-full text-xs font-black text-white select-none border border-white/5"
                          style={{
                            background: config.ranking.bg_color || defaultDemoBg,
                            textShadow: "1px 1px 2px #000"
                          }}
                        >
                          <span className="text-yellow-300 mr-2">{item.name}</span>
                          <span className="flex-grow text-right truncate mr-2">{item.desc}</span>
                          <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded font-black">
                            {t("starter_rankDemoOrder")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Cumulative Rankings Table
                    <table
                      className="w-full border-collapse text-left font-bold text-sm"
                      style={{ textShadow: "1px 1px 2px #000" }}
                    >
                      <tbody>
                        {[
                          { rank: "🥇", name: "홍길동", amt: "120,000" },
                          { rank: "🥈", name: "임꺽정", amt: "95,000" },
                          { rank: "🥉", name: "성춘향", amt: "60,000" }
                        ].map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-white/5"
                            style={{
                              background: config.ranking.bg_color || "rgba(255,255,255,0.04)"
                            }}
                          >
                            <td className="p-2 text-center text-lg">{row.rank}</td>
                            <td className="p-2 text-white truncate max-w-[80px]">{row.name}</td>
                            <td className="p-2 text-right text-primary">{row.amt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {activeElement === "ranking" && (
                  <div
                    className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 bg-white border-2 border-primary rounded-full cursor-se-resize shadow"
                    onMouseDown={(e) => handleDragStart(e, "ranking", "resize")}
                    onTouchStart={(e) => handleDragStart(e, "ranking", "resize")}
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* 2. Right Accordion Settings Panel */}
      <div className="w-full md:w-[420px] shrink-0 bg-[#0d1018]/95 backdrop-blur-3xl border-l border-white/5 flex flex-col justify-between max-h-[calc(100vh-96px)] overflow-hidden shadow-2xl">
        {/* Panel Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-base font-black text-text-bright leading-none mb-1">
              {t("starter_subTitleOptions")}
            </h2>
            <p className="text-[10px] text-text-dim">
              {userSession.id} {t("starter_userPrefix")}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-2 py-0.5 rounded uppercase">
              OBS Builder
            </span>
          </div>
        </div>

        {/* Panel Scroll Content */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {/* Global Toggle ON/OFF */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow"
                  style={{
                    backgroundColor: config.is_visible ? "#22c55e" : "#ef4444",
                    boxShadow: `0 0 10px ${config.is_visible ? "#22c55e" : "#ef4444"}`
                  }}
                />
                <span className="text-xs font-bold">
                  {config.is_visible ? t("starter_widgetStatusOn") : t("starter_widgetStatusOff")}
                </span>
              </div>
              <div className="flex bg-black/40 border border-white/5 rounded-lg p-0.5">
                <button
                  onClick={() => handleToggleGlobal(1)}
                  className={`text-[10px] font-black px-3 py-1 rounded transition-colors ${
                    config.is_visible ? "bg-primary text-bg-dark shadow" : "text-text-dim hover:text-white"
                  }`}
                >
                  ON
                </button>
                <button
                  onClick={() => handleToggleGlobal(0)}
                  className={`text-[10px] font-black px-3 py-1 rounded transition-colors ${
                    !config.is_visible ? "bg-red-500 text-white shadow" : "text-text-dim hover:text-white"
                  }`}
                >
                  OFF
                </button>
              </div>
            </div>

            {/* Layout Orientation settings */}
            <div>
              <label className="block text-[10px] font-bold text-text-dim mb-1.5">
                {t("starter_resolutionSetting")}
              </label>
              <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/5 rounded-xl p-1">
                <button
                  onClick={() => handleSwitchOrientation("horizontal")}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    !isVertical ? "bg-primary text-bg-dark shadow" : "text-text-dim hover:text-white"
                  }`}
                >
                  🖥️ {t("starter_resHorizontal")}
                </button>
                <button
                  onClick={() => handleSwitchOrientation("vertical")}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isVertical ? "bg-primary text-bg-dark shadow" : "text-text-dim hover:text-white"
                  }`}
                >
                  📱 {t("starter_resVertical")}
                </button>
              </div>
            </div>
          </div>

          {/* OBS Widget URL copy card */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col gap-2">
            <label className="block text-[10px] font-black text-primary uppercase tracking-wider">
              {t("starter_obsWidgetUrl")}
            </label>
            {!userSession.apikey || userSession.apikey === "undefined" || (userSession.id !== "demo" && userSession.apikey === "demoapikey1234567890") ? (
              <div className="flex flex-col gap-2 mt-1">
                <p className="text-xs text-red-400 font-bold leading-normal">
                  ⚠️ API 보안키가 로드되지 않았습니다. 로그아웃 후 다시 로그인하시면 보안키가 자동으로 생성 및 적용됩니다.
                </p>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-all self-start"
                >
                  로그아웃 후 다시 로그인하기
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`https://tuber.co.kr/cast/widget_starter.html?mb_id=${userSession.id}&apikey=${userSession.apikey}`}
                  className="flex-grow bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-mono text-text-dim select-all"
                />
                <button
                  onClick={handleCopyObsUrl}
                  className="bg-primary hover:bg-primary/80 active:scale-95 text-bg-dark text-xs font-black px-4 rounded-lg transition-all"
                >
                  {t("starter_copy")}
                </button>
              </div>
            )}
          </div>

          {/* Accordion Settings Sections */}
          <div className="space-y-2">
            {/* 1. Logo settings section */}
            <div
              className={`border border-white/5 rounded-2xl overflow-hidden bg-white/2 transition-colors ${
                activeAccordion === "logo" ? "border-primary/30" : ""
              }`}
            >
              <button
                onClick={() => setActiveAccordion(activeAccordion === "logo" ? null : "logo")}
                className="w-full flex justify-between items-center px-5 py-4 text-sm font-extrabold hover:bg-white/5"
              >
                <span>🖼️ {t("starter_secLogo")}</span>
                <span>{activeAccordion === "logo" ? "▲" : "▼"}</span>
              </button>
              {activeAccordion === "logo" && (
                <div className="p-5 border-t border-white/5 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{t("starter_visible")}</span>
                    <input
                      type="checkbox"
                      checked={!!config.logo.visible}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          logo: { ...prev.logo, visible: e.target.checked ? 1 : 0 }
                        }))
                      }
                      className="w-4 h-4 accent-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-text-dim">{t("starter_logoFile")}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 file:bg-primary file:text-bg-dark file:border-0 file:rounded file:px-3 file:py-0.5 file:mr-2 file:font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_anchor")}</label>
                      <select
                        value={config.logo.anchor}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            logo: { ...prev.logo, anchor: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="top-left">{t("starter_anchorTopLeft")}</option>
                        <option value="top-right">{t("starter_anchorTopRight")}</option>
                        <option value="bottom-left">{t("starter_anchorBottomLeft")}</option>
                        <option value="bottom-right">{t("starter_anchorBottomRight")}</option>
                        <option value="top-center">{t("starter_anchorTopCenter")}</option>
                        <option value="bottom-center">{t("starter_anchorBottomCenter")}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_logoWidth")}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.logo.width}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            logo: { ...prev.logo, width: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_margin_x")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.logo.x}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            logo: { ...prev.logo, x: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_unit")}</label>
                      <select
                        value={config.logo.x_unit}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            logo: { ...prev.logo, x_unit: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="%">%</option>
                        <option value="px">px</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_margin_y")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.logo.y}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            logo: { ...prev.logo, y: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_unit")}</label>
                      <select
                        value={config.logo.y_unit}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            logo: { ...prev.logo, y_unit: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="%">%</option>
                        <option value="px">px</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Subtitle settings section */}
            <div
              className={`border border-white/5 rounded-2xl overflow-hidden bg-white/2 transition-colors ${
                activeAccordion === "subtitle" ? "border-primary/30" : ""
              }`}
            >
              <button
                onClick={() => setActiveAccordion(activeAccordion === "subtitle" ? null : "subtitle")}
                className="w-full flex justify-between items-center px-5 py-4 text-sm font-extrabold hover:bg-white/5"
              >
                <span>💬 {t("starter_secSubtitle")}</span>
                <span>{activeAccordion === "subtitle" ? "▲" : "▼"}</span>
              </button>
              {activeAccordion === "subtitle" && (
                <div className="p-5 border-t border-white/5 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{t("starter_visible")}</span>
                    <input
                      type="checkbox"
                      checked={!!config.subtitle.visible}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          subtitle: { ...prev.subtitle, visible: e.target.checked ? 1 : 0 }
                        }))
                      }
                      className="w-4 h-4 accent-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-text-dim">
                      {t("starter_subtitleText")}
                    </label>
                    <input
                      type="text"
                      value={config.subtitle.text}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          subtitle: { ...prev.subtitle, text: e.target.value }
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_anchor")}</label>
                      <select
                        value={config.subtitle.anchor}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            subtitle: { ...prev.subtitle, anchor: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="top-left">{t("starter_anchorTopLeft")}</option>
                        <option value="top-right">{t("starter_anchorTopRight")}</option>
                        <option value="bottom-left">{t("starter_anchorBottomLeft")}</option>
                        <option value="bottom-right">{t("starter_anchorBottomRight")}</option>
                        <option value="top-center">{t("starter_anchorTopCenter")}</option>
                        <option value="bottom-center">{t("starter_anchorBottomCenter")}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_subtitleFontSize")}
                      </label>
                      <input
                        type="number"
                        value={config.subtitle.font_size}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            subtitle: { ...prev.subtitle, font_size: parseInt(e.target.value) || 12 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_margin_x")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.subtitle.x}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            subtitle: { ...prev.subtitle, x: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_unit")}</label>
                      <select
                        value={config.subtitle.x_unit}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            subtitle: { ...prev.subtitle, x_unit: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="%">%</option>
                        <option value="px">px</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_margin_y")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.subtitle.y}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            subtitle: { ...prev.subtitle, y: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_unit")}</label>
                      <select
                        value={config.subtitle.y_unit}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            subtitle: { ...prev.subtitle, y_unit: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="%">%</option>
                        <option value="px">px</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_subtitleColor")}
                      </label>
                      <div className="flex bg-black/40 border border-white/10 rounded-lg overflow-hidden p-0.5">
                        <input
                          type="color"
                          value={parseRgba(config.subtitle.color).hex}
                          onChange={(e) => handleColorUpdate("subtitle", "color", e.target.value)}
                          className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.subtitle.color}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              subtitle: { ...prev.subtitle, color: e.target.value }
                            }))
                          }
                          className="flex-grow bg-transparent border-0 px-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_subtitleBgColor")}
                      </label>
                      <div className="flex bg-black/40 border border-white/10 rounded-lg overflow-hidden p-0.5">
                        <input
                          type="color"
                          value={parseRgba(config.subtitle.bg_color).hex}
                          onChange={(e) => handleColorUpdate("subtitle", "bg_color", e.target.value)}
                          className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.subtitle.bg_color}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              subtitle: { ...prev.subtitle, bg_color: e.target.value }
                            }))
                          }
                          className="flex-grow bg-transparent border-0 px-2 text-xs text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round(parseRgba(config.subtitle.bg_color).alpha * 100)}
                          onChange={(e) => handleOpacityUpdate("subtitle", "bg_color", e.target.value)}
                          className="flex-grow h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <span className="text-[10px] text-text-dim font-bold">
                          {Math.round(parseRgba(config.subtitle.bg_color).alpha * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Sliding Subtitle settings section */}
            <div
              className={`border border-white/5 rounded-2xl overflow-hidden bg-white/2 transition-colors ${
                activeAccordion === "sliding_subtitle" ? "border-primary/30" : ""
              }`}
            >
              <button
                onClick={() =>
                  setActiveAccordion(activeAccordion === "sliding_subtitle" ? null : "sliding_subtitle")
                }
                className="w-full flex justify-between items-center px-5 py-4 text-sm font-extrabold hover:bg-white/5"
              >
                <span>➡️ {t("starter_secSliding")}</span>
                <span>{activeAccordion === "sliding_subtitle" ? "▲" : "▼"}</span>
              </button>
              {activeAccordion === "sliding_subtitle" && (
                <div className="p-5 border-t border-white/5 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{t("starter_visible")}</span>
                    <input
                      type="checkbox"
                      checked={!!config.sliding_subtitle.visible}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          sliding_subtitle: { ...prev.sliding_subtitle, visible: e.target.checked ? 1 : 0 }
                        }))
                      }
                      className="w-4 h-4 accent-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-text-dim">
                      {t("starter_slidingText")}
                    </label>
                    <textarea
                      value={config.sliding_subtitle.text}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          sliding_subtitle: { ...prev.sliding_subtitle, text: e.target.value }
                        }))
                      }
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_anchor")}</label>
                      <select
                        value={config.sliding_subtitle.anchor}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            sliding_subtitle: { ...prev.sliding_subtitle, anchor: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="top-left">{t("starter_anchorTopLeft")}</option>
                        <option value="top-right">{t("starter_anchorTopRight")}</option>
                        <option value="bottom-left">{t("starter_anchorBottomLeft")}</option>
                        <option value="bottom-right">{t("starter_anchorBottomRight")}</option>
                        <option value="top-center">{t("starter_anchorTopCenter")}</option>
                        <option value="bottom-center">{t("starter_anchorBottomCenter")}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_slidingHeight")}
                      </label>
                      <input
                        type="number"
                        value={config.sliding_subtitle.height}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            sliding_subtitle: { ...prev.sliding_subtitle, height: parseInt(e.target.value) || 20 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_margin_y")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.sliding_subtitle.y}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            sliding_subtitle: { ...prev.sliding_subtitle, y: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_unit")}</label>
                      <select
                        value={config.sliding_subtitle.y_unit}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            sliding_subtitle: { ...prev.sliding_subtitle, y_unit: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="%">%</option>
                        <option value="px">px</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_slidingFontSize")}
                      </label>
                      <input
                        type="number"
                        value={config.sliding_subtitle.font_size}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            sliding_subtitle: { ...prev.sliding_subtitle, font_size: parseInt(e.target.value) || 12 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_slidingSpeed")}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={config.sliding_subtitle.speed}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            sliding_subtitle: { ...prev.sliding_subtitle, speed: parseInt(e.target.value) || 10 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_subtitleColor")}
                      </label>
                      <div className="flex bg-black/40 border border-white/10 rounded-lg overflow-hidden p-0.5">
                        <input
                          type="color"
                          value={parseRgba(config.sliding_subtitle.color).hex}
                          onChange={(e) => handleColorUpdate("sliding_subtitle", "color", e.target.value)}
                          className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.sliding_subtitle.color}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              sliding_subtitle: { ...prev.sliding_subtitle, color: e.target.value }
                            }))
                          }
                          className="flex-grow bg-transparent border-0 px-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_subtitleBgColor")}
                      </label>
                      <div className="flex bg-black/40 border border-white/10 rounded-lg overflow-hidden p-0.5">
                        <input
                          type="color"
                          value={parseRgba(config.sliding_subtitle.bg_color).hex}
                          onChange={(e) => handleColorUpdate("sliding_subtitle", "bg_color", e.target.value)}
                          className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.sliding_subtitle.bg_color}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              sliding_subtitle: { ...prev.sliding_subtitle, bg_color: e.target.value }
                            }))
                          }
                          className="flex-grow bg-transparent border-0 px-2 text-xs text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round(parseRgba(config.sliding_subtitle.bg_color).alpha * 100)}
                          onChange={(e) => handleOpacityUpdate("sliding_subtitle", "bg_color", e.target.value)}
                          className="flex-grow h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <span className="text-[10px] text-text-dim font-bold">
                          {Math.round(parseRgba(config.sliding_subtitle.bg_color).alpha * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. QR settings section */}
            <div
              className={`border border-white/5 rounded-2xl overflow-hidden bg-white/2 transition-colors ${
                activeAccordion === "qr" ? "border-primary/30" : ""
              }`}
            >
              <button
                onClick={() => setActiveAccordion(activeAccordion === "qr" ? null : "qr")}
                className="w-full flex justify-between items-center px-5 py-4 text-sm font-extrabold hover:bg-white/5"
              >
                <span>🏁 {t("starter_secQr")}</span>
                <span>{activeAccordion === "qr" ? "▲" : "▼"}</span>
              </button>
              {activeAccordion === "qr" && (
                <div className="p-5 border-t border-white/5 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{t("starter_visible")}</span>
                    <input
                      type="checkbox"
                      checked={!!config.qr.visible}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          qr: { ...prev.qr, visible: e.target.checked ? 1 : 0 }
                        }))
                      }
                      className="w-4 h-4 accent-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-text-dim">{t("starter_qrUrl")}</label>
                    <input
                      type="text"
                      value={config.qr.url}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          qr: { ...prev.qr, url: e.target.value }
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_anchor")}</label>
                      <select
                        value={config.qr.anchor}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            qr: { ...prev.qr, anchor: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="top-left">{t("starter_anchorTopLeft")}</option>
                        <option value="top-right">{t("starter_anchorTopRight")}</option>
                        <option value="bottom-left">{t("starter_anchorBottomLeft")}</option>
                        <option value="bottom-right">{t("starter_anchorBottomRight")}</option>
                        <option value="top-center">{t("starter_anchorTopCenter")}</option>
                        <option value="bottom-center">{t("starter_anchorBottomCenter")}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_qrWidth")}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.qr.width}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            qr: { ...prev.qr, width: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_margin_x")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.qr.x}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            qr: { ...prev.qr, x: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_unit")}</label>
                      <select
                        value={config.qr.x_unit}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            qr: { ...prev.qr, x_unit: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="%">%</option>
                        <option value="px">px</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_margin_y")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.qr.y}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            qr: { ...prev.qr, y: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_unit")}</label>
                      <select
                        value={config.qr.y_unit}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            qr: { ...prev.qr, y_unit: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="%">%</option>
                        <option value="px">px</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-text-dim">{t("starter_qrColor")}</label>
                    <div className="flex bg-black/40 border border-white/10 rounded-lg overflow-hidden p-0.5">
                      <input
                        type="color"
                        value={config.qr.color}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            qr: { ...prev.qr, color: e.target.value }
                          }))
                        }
                        className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.qr.color}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            qr: { ...prev.qr, color: e.target.value }
                          }))
                        }
                        className="flex-grow bg-transparent border-0 px-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Slider settings section */}
            <div
              className={`border border-white/5 rounded-2xl overflow-hidden bg-white/2 transition-colors ${
                activeAccordion === "slider" ? "border-primary/30" : ""
              }`}
            >
              <button
                onClick={() => setActiveAccordion(activeAccordion === "slider" ? null : "slider")}
                className="w-full flex justify-between items-center px-5 py-4 text-sm font-extrabold hover:bg-white/5"
              >
                <span>🛒 {t("starter_secSlider")}</span>
                <span>{activeAccordion === "slider" ? "▲" : "▼"}</span>
              </button>
              {activeAccordion === "slider" && (
                <div className="p-5 border-t border-white/5 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{t("starter_visible")}</span>
                    <input
                      type="checkbox"
                      checked={!!config.slider.visible}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          slider: { ...prev.slider, visible: e.target.checked ? 1 : 0 }
                        }))
                      }
                      className="w-4 h-4 accent-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_sliderGroup")}
                      </label>
                      <select
                        value={config.slider.group}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            slider: { ...prev.slider, group: parseInt(e.target.value) || 1 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="1">리스트 1</option>
                        <option value="2">리스트 2</option>
                        <option value="3">리스트 3</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_sliderCount")}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={config.slider.display_count}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            slider: {
                              ...prev.slider,
                              display_count: parseInt(e.target.value) || 4
                            }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_anchor")}</label>
                      <select
                        value={config.slider.anchor}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            slider: { ...prev.slider, anchor: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="top-left">{t("starter_anchorTopLeft")}</option>
                        <option value="top-right">{t("starter_anchorTopRight")}</option>
                        <option value="bottom-left">{t("starter_anchorBottomLeft")}</option>
                        <option value="bottom-right">{t("starter_anchorBottomRight")}</option>
                        <option value="top-center">{t("starter_anchorTopCenter")}</option>
                        <option value="bottom-center">{t("starter_anchorBottomCenter")}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_sliderHeight")}
                      </label>
                      <input
                        type="number"
                        value={config.slider.height}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            slider: { ...prev.slider, height: parseInt(e.target.value) || 100 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_margin_x")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.slider.x}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            slider: { ...prev.slider, x: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_unit")}</label>
                      <select
                        value={config.slider.x_unit}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            slider: { ...prev.slider, x_unit: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="%">%</option>
                        <option value="px">px</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_margin_y")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.slider.y}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            slider: { ...prev.slider, y: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_unit")}</label>
                      <select
                        value={config.slider.y_unit}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            slider: { ...prev.slider, y_unit: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="%">%</option>
                        <option value="px">px</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-text-dim">
                      {t("starter_sliderWidth")}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.slider.width}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          slider: { ...prev.slider, width: parseFloat(e.target.value) || 0 }
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 6. Ranking settings section */}
            <div
              className={`border border-white/5 rounded-2xl overflow-hidden bg-white/2 transition-colors ${
                activeAccordion === "ranking" ? "border-primary/30" : ""
              }`}
            >
              <button
                onClick={() => setActiveAccordion(activeAccordion === "ranking" ? null : "ranking")}
                className="w-full flex justify-between items-center px-5 py-4 text-sm font-extrabold hover:bg-white/5"
              >
                <span>🏆 {t("starter_secRanking")}</span>
                <span>{activeAccordion === "ranking" ? "▲" : "▼"}</span>
              </button>
              {activeAccordion === "ranking" && (
                <div className="p-5 border-t border-white/5 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{t("starter_visible")}</span>
                    <input
                      type="checkbox"
                      checked={!!config.ranking.visible}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          ranking: { ...prev.ranking, visible: e.target.checked ? 1 : 0 }
                        }))
                      }
                      className="w-4 h-4 accent-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-text-dim">
                      {t("starter_rankSortBy")}
                    </label>
                    <select
                      value={config.ranking.sort_by}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          ranking: { ...prev.ranking, sort_by: e.target.value }
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                    >
                      <option value="total">{t("starter_rankSortTotal")}</option>
                      <option value="point">{t("starter_rankSortPoint")}</option>
                      <option value="contribution">{t("starter_rankSortContribution")}</option>
                      <option value="recent">{t("starter_rankSortRecent")}</option>
                    </select>
                  </div>
                  {config.ranking.sort_by === "recent" && (
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_rankRecentDir")}
                      </label>
                      <select
                        value={config.ranking.recent_direction}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            ranking: { ...prev.ranking, recent_direction: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="normal">{t("starter_rankRecentDirNormal")}</option>
                        <option value="reverse">{t("starter_rankRecentDirReverse")}</option>
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_anchor")}</label>
                      <select
                        value={config.ranking.anchor}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            ranking: { ...prev.ranking, anchor: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="top-left">{t("starter_anchorTopLeft")}</option>
                        <option value="top-right">{t("starter_anchorTopRight")}</option>
                        <option value="bottom-left">{t("starter_anchorBottomLeft")}</option>
                        <option value="bottom-right">{t("starter_anchorBottomRight")}</option>
                        <option value="top-center">{t("starter_anchorTopCenter")}</option>
                        <option value="bottom-center">{t("starter_anchorBottomCenter")}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_rankHeight")}
                      </label>
                      <input
                        type="number"
                        value={config.ranking.height}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            ranking: { ...prev.ranking, height: parseInt(e.target.value) || 200 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_margin_x")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.ranking.x}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            ranking: { ...prev.ranking, x: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_unit")}</label>
                      <select
                        value={config.ranking.x_unit}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            ranking: { ...prev.ranking, x_unit: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="%">%</option>
                        <option value="px">px</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_margin_y")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.ranking.y}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            ranking: { ...prev.ranking, y: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">{t("starter_unit")}</label>
                      <select
                        value={config.ranking.y_unit}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            ranking: { ...prev.ranking, y_unit: e.target.value }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      >
                        <option value="%">%</option>
                        <option value="px">px</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_rankWidth")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.ranking.width}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            ranking: { ...prev.ranking, width: parseFloat(e.target.value) || 0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-text-dim">
                        {t("starter_rankScale")}
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.5"
                        max="2.0"
                        value={config.ranking.scale || 1.0}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            ranking: { ...prev.ranking, scale: parseFloat(e.target.value) || 1.0 }
                          }))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-text-dim">
                      {t("starter_rankBgColor")}
                    </label>
                    <div className="flex bg-black/40 border border-white/10 rounded-lg overflow-hidden p-0.5">
                      <input
                        type="color"
                        value={parseRgba(config.ranking.bg_color).hex}
                        onChange={(e) => handleColorUpdate("ranking", "bg_color", e.target.value)}
                        className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.ranking.bg_color}
                        placeholder="#000000 or rgba(0,0,0,0.5)"
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            ranking: { ...prev.ranking, bg_color: e.target.value }
                          }))
                        }
                        className="flex-grow bg-transparent border-0 px-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(parseRgba(config.ranking.bg_color).alpha * 100)}
                        onChange={(e) => handleOpacityUpdate("ranking", "bg_color", e.target.value)}
                        className="flex-grow h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-[10px] text-text-dim font-bold">
                        {Math.round(parseRgba(config.ranking.bg_color).alpha * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel Footer Submit button */}
        <div className="p-5 border-t border-white/5 bg-black/20">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary hover:brightness-110 active:scale-98 disabled:opacity-50 text-bg-dark font-extrabold text-sm rounded-xl transition-all shadow-[0_4px_20px_rgba(0,240,255,0.25)] cursor-pointer"
          >
            {isSaving ? t("starter_saving") : t("starter_saveBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
