"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Translation dictionary including new backend integration elements
const translations = {
  ko: {
    brandTag: "PREMIUM BROADCAST ENGINE",
    heroTitle1: "상상을 현실로 만드는",
    heroTitle2: "프로급 라이브 위젯",
    heroDesc: "TUBER는 1인 크리에이터부터 대형 MCN까지 모두를 위한\n고성능 라이브 방송 자동화 솔루션을 제공합니다.",
    dashboardBtn: "대시보드 바로가기",
    briefingBtn: "플랫폼 상세 소개",
    loginBtn: "크리에이터 로그인",
    registerBtn: "지금 시작하기",
    
    showcaseTag: "WIDGET ECOSYSTEM",
    showcaseTitle1: "방송의 품격을 높이는",
    showcaseTitle2: "핵심 위젯 시스템",
    showcaseDesc: "시청자와의 소통을 넘어서 하나의 콘텐츠가 되는 TUBER만의 독보적인 위젯 라인업을 만나보세요.",
    
    widget1Title: "시그니처 위젯",
    widget1Desc: "후원 시 방송 화면을 가득 채우는 화려한 전용 이펙트.\n팬들에게 잊지 못할 특별한 순간을 선사하세요.",
    widget2Title: "엑셀 & 랭킹 위젯",
    widget2Desc: "실시간으로 집계되는 정교한 후원 랭킹 시스템.\n고밀도 데이터 시각화로 방송의 긴장감을 더합니다.",
    widget3Title: "커스텀 콘텐츠 위젯",
    widget3Desc: "퀴즈, 투표, 미니 게임 등 방송 성격에 맞는\n다양한 인터랙티브 위젯을 클릭 한 번으로 적용하세요.",
    
    feature1Title: "쉬운 자동 연동",
    feature1Desc: "복잡한 설정 없이 내 방송과 바로 연결!\n유튜브, 후원 플랫폼 등을 한 번에 모아서 관리하세요.",
    feature2Title: "화려한 화면 효과",
    feature2Desc: "시청자의 눈을 사로잡는 방송 위젯!\n후원 룰렛부터 실시간 순위표까지 클릭 한 번으로 적용하세요.",
    feature3Title: "확실한 수익 창출",
    feature3Desc: "시청자의 참여를 이끄는 후원 시스템.\n팬들과 더 즐겁게 소통하며 자연스럽게 수익을 높여보세요.",
    
    viewDetails: "자세히 보기",
    exploreWidgets: "위젯 살펴보기",
    platformIntro: "플랫폼 소개",
    
    pcTitle: "PC 방송 완벽 지원",
    pc1: "OBS Studio (최적화 완료)",
    pc2: "XSplit 등 주요 프로그램 지원",
    pc3: "맥(Mac) 환경 완벽 호환",
    pc4: "주소(URL) 복사만으로 끝",
    pcDesc: "크롬 등 인터넷 브라우저 소스를 쓸 수 있는 모든 PC 방송 프로그램에서 사용 가능합니다.",
    
    mobileTitle: "모바일 방송도 간편하게",
    mobile1: "프리즘 라이브 스튜디오",
    mobile2: "카메라파이 라이브",
    mobile3: "스트림랩스 모바일",
    mobile4: "기종 상관없이 원활한 구동",
    mobileDesc: "인터넷 주소(URL) 추가가 가능한 모바일 방송 앱이라면 언제 어디서나 적용할 수 있습니다.",
    
    coreTitle: "방송을 살리는 핵심 기능",
    core1: "12개 이상의 톡톡 튀는 위젯",
    core2: "시청자 실시간 참여 유도",
    core3: "초보자용 디자인 세팅 제공",
    core4: "딜레이 없는 실시간 동기화",
    coreDesc: "다양한 위젯을 내 맘대로 조합해서 남들과는 다른 나만의 특별한 방송 화면을 꾸며보세요.",
    
    aiTag: "똑똑한 방송 도우미",
    aiTitle1: "알아서 대답하는",
    aiTitle2: "AI 자동 채팅 봇",
    aiDesc: "Gemini API를 탑재한 똑똑한 AI 봇이 시청자들과 소통합니다.\n말이 끊길 걱정 없이 늘 북적거리는 방송 분위기를 만들어보세요.",
    aiBullet1: "시청자 질문에 맞춤형 대답 제공",
    aiBullet2: "여러 시청자가 참여하는 듯한 효과",
    aiBullet3: "어색하지 않은 자연스러운 반응 속도",
    aiBullet4: "본인의 무료 API 키를 등록하여 내 방송만의 맞춤 세팅 가능",
    aiExploreBtn: "AI 챗봇 시뮬레이션 작동",
    
    chatMsg1: "이번판 1번인가요?",
    chatMsg2: "1번인거 같아요! 😆",
    chatMsg3: "오 그런듯 감사합니다!",
    chatMsg4: "헷갈리는데 1번 맞는듯? 저도 그렇게 생각해요!",
    
    // Live Dashboard Translations
    liveDemoTag: "LIVE DEMONSTRATION",
    liveDemoTitle: "실시간 대시보드 위젯 데모",
    liveDemoDesc: "실제 OBS/유튜브 방송 송출 화면에 연동되어 연출되는 랭킹 보드와 후원 알림의 라이브 동기화를 미리 확인해 보세요.",
    rankingTitle: "🏆 금일 후원 누적 랭킹 (실시간 집계)",
    rankingColName: "크리에이터/후원자",
    rankingColAmount: "후원 누적 금액",
    rankingColRank: "순위",
    liveAlertTitle: "🔔 실시간 시그니처 알림",
    liveAlertPlaceholder: "방송 중 후원이 발생하면 이곳에 알림 팝업이 연출됩니다.",
    newDonationAlert: "님이 튜버 위젯으로 후원하셨습니다!",
    
    // Auth Modal
    modalTitle: "크리에이터 로그인 (Cafe24 PHP)",
    modalIdPlaceholder: "아이디(mb_id) 입력",
    modalPwPlaceholder: "비밀번호(mb_password) 입력",
    modalLoginBtn: "로그인 요청",
    modalCancelBtn: "취소",
    modalGuideText: "* 본 로그인은 기존 Cafe24 PHP 백엔드 서버(/bbs/login_check.php) 인증 규격과 100% 호환되도록 설계되어 있습니다.",
    loginSuccessMsg: "로그인에 성공했습니다! 환영합니다, ",
    logoutSuccessMsg: "로그아웃 되었습니다.",
    
    adminMenu: "관리자",
    modifyMenu: "정보수정",
    logoutMenu: "로그아웃",
    loginMenu: "로그인",
    menuLabel: "메뉴",
    navWidget: "위젯소개",
    navFeatures: "연동방법",
    navAi: "AI 챗봇",
    navContact: "고객지원",
    footerText: "© 2026 TUBER. All rights reserved. Powered by premium live automated solutions."
  },
  en: {
    brandTag: "PREMIUM BROADCAST ENGINE",
    heroTitle1: "Turning Imagination",
    heroTitle2: "Into Pro Live Widgets",
    heroDesc: "TUBER provides high-performance live broadcast automation solutions\nfor everyone from solo creators to major MCNs.",
    dashboardBtn: "Go to Dashboard",
    briefingBtn: "Platform Details",
    loginBtn: "Creator Login",
    registerBtn: "Get Started Now",
    
    showcaseTag: "WIDGET ECOSYSTEM",
    showcaseTitle1: "Elevating the Quality of",
    showcaseTitle2: "Core Widget System",
    showcaseDesc: "Discover Tuber's unique lineup of widgets that go beyond viewer communication to become content in themselves.",
    
    widget1Title: "Signature Widgets",
    widget1Desc: "Splendid exclusive effects that fill the screen upon sponsorship.\nDeliver unforgettable moments to your fans.",
    widget2Title: "Excel & Ranking Widgets",
    widget2Desc: "Sophisticated sponsorship ranking system calculated in real-time.\nAdds tension with high-density data visualization.",
    widget3Title: "Custom Content Widgets",
    widget3Desc: "Apply various interactive widgets suitable for your stream style\nlike quizzes, votes, and mini-games in a single click.",
    
    feature1Title: "Easy Auto Integration",
    feature1Desc: "Connect straight to your stream without complex settings!\nManage YouTube, donation platforms, and more in one place.",
    feature2Title: "Spectacular Screen Effects",
    feature2Desc: "Eye-catching broadcast widgets!\nApply donation roulettes to real-time ranking boards easily.",
    feature3Title: "Guaranteed Revenue",
    feature3Desc: "Donation system driving viewer engagement.\nCommunicate more joyfully with fans and naturally increase revenue.",
    
    viewDetails: "View Details",
    exploreWidgets: "Explore Widgets",
    platformIntro: "Platform Intro",
    
    pcTitle: "Full PC Broadcast Support",
    pc1: "OBS Studio (Optimized)",
    pc2: "Supports major software like XSplit",
    pc3: "Fully compatible with macOS",
    pc4: "Connect simply by copying URL",
    pcDesc: "Available on all PC broadcasting programs that support browser sources like Chrome.",
    
    mobileTitle: "Simple Mobile Broadcasting",
    mobile1: "Prism Live Studio",
    mobile2: "CameraFi Live",
    mobile3: "Streamlabs Mobile",
    mobile4: "Smooth running regardless of specs",
    mobileDesc: "Can be applied anytime on mobile broadcasting apps that allow adding URL browser sources.",
    
    coreTitle: "Core Liven-Up Features",
    core1: "12+ vibrant custom widgets",
    core2: "Drive real-time viewer engagement",
    core3: "Provide layout settings for beginners",
    core4: "Zero-delay real-time synchronization",
    coreDesc: "Customize your own special broadcast screen by mixing and matching various widgets to stand out.",
    
    aiTag: "SMART BROADCAST ASSISTANT",
    aiTitle1: "Self-Responding",
    aiTitle2: "AI Automated Chatbot",
    aiDesc: "A smart AI bot powered by Gemini API communicates with viewers.\nCreate a lively, crowded broadcast atmosphere without dead air.",
    aiBullet1: "Provide custom responses to viewer questions",
    aiBullet2: "Simulate participation of multiple viewers",
    aiBullet3: "Natural, lag-free response times",
    aiBullet4: "Register your own free API key for custom settings",
    aiExploreBtn: "Run AI Chat Simulation",
    
    chatMsg1: "Is it choice 1 this round?",
    chatMsg2: "I think it is choice 1! 😆",
    chatMsg3: "Oh, indeed, thank you!",
    chatMsg4: "It is confusing but choice 1 seems right? I think so too!",
    
    // Live Dashboard Translations
    liveDemoTag: "LIVE DEMONSTRATION",
    liveDemoTitle: "Live Dashboard Widget Demo",
    liveDemoDesc: "Preview the live synchronization of sponsor ranking boards and real-time alerts integrated directly into OBS / YouTube streams.",
    rankingTitle: "🏆 Today's Top Sponsors (Live)",
    rankingColName: "Creator / Sponsor",
    rankingColAmount: "Total Donated",
    rankingColRank: "Rank",
    liveAlertTitle: "🔔 Real-Time Signature Alert",
    liveAlertPlaceholder: "Sponsorship alerts will trigger here during live broadcasts.",
    newDonationAlert: " sponsored via Tuber Widget!",
    
    // Auth Modal
    modalTitle: "Creator Login (Cafe24 PHP)",
    modalIdPlaceholder: "Enter ID (mb_id)",
    modalPwPlaceholder: "Enter Password (mb_password)",
    modalLoginBtn: "Submit Login",
    modalCancelBtn: "Cancel",
    modalGuideText: "* This login structure is fully compatible with standard Cafe24 PHP backend route (/bbs/login_check.php).",
    loginSuccessMsg: "Login Successful! Welcome, ",
    logoutSuccessMsg: "Logged out successfully.",
    
    adminMenu: "Admin",
    modifyMenu: "Edit Info",
    logoutMenu: "Logout",
    loginMenu: "Login",
    menuLabel: "Menu",
    navWidget: "Widgets",
    navFeatures: "Guide",
    navAi: "AI Bot",
    navContact: "Support",
    footerText: "© 2026 TUBER. All rights reserved. Powered by premium live automated solutions."
  },
  ja: {
    brandTag: "PREMIUM BROADCAST ENGINE",
    heroTitle1: "想像를 現實로 만드는",
    heroTitle2: "プロ級ライブウィジェット",
    heroDesc: "TUBER는 1인 크리에이터부터 대형 MCN까지 모두를 위한\n고성능 라이브 방송 자동화 솔루션을 제공합니다.",
    dashboardBtn: "ダッシュボードへ",
    briefingBtn: "プラットフォーム詳細",
    loginBtn: "クリエイターログイン",
    registerBtn: "今すぐ始める",
    
    showcaseTag: "WIDGET ECOSYSTEM",
    showcaseTitle1: "放送의 品格을 높이는",
    showcaseTitle2: "핵심 위젯 시스템",
    showcaseDesc: "시청자와의 소통을 넘어서 하나의 콘텐츠가 되는 TUBER만의 독보적인 위젯 라인업을 만나보세요.",
    
    widget1Title: "시그니처 위젯",
    widget1Desc: "후원 시 방송 화면을 가득 채우는 화려한 전용 이펙트.\n팬들에게 잊지 못할 특별한 순간을 선사하세요.",
    widget2Title: "에셀＆랭킹 위젯",
    widget2Desc: "실시간으로 집계되는 정교한 후원 랭킹 시스템.\n고밀도 데이터 시각화로 방송의 긴장감을 더합니다.",
    widget3Title: "커스텀 콘텐츠 위젯",
    widget3Desc: "퀴즈, 투표, 미니 게임 등 방송 성격에 맞는\n다양한 인터랙티브 위젯을 클릭 한 번으로 적용하세요.",
    
    feature1Title: "쉬운 자동 연동",
    feature1Desc: "복잡한 설정 없이 내 방송과 바로 연결!\n유튜브, 후원 플랫폼 등을 한 번에 모아서 관리하세요.",
    feature2Title: "화려한 화면 효과",
    feature2Desc: "시청자의 눈을 사로잡는 방송 위젯!\n후원 룰렛부터 실시간 순위표까지 클릭 한 번으로 적용하세요.",
    feature3Title: "확실한 수익 창출",
    feature3Desc: "시청자의 참여를 이끄는 후원 시스템.\n팬들과 더 즐겁게 소통하며 자연스럽게 수익을 높여보세요.",
    
    viewDetails: "詳細を見る",
    exploreWidgets: "ウィ젯 보기",
    platformIntro: "플랫폼 소개",
    
    pcTitle: "PC配信の完璧なサポート",
    pc1: "OBS Studio (最適化完了)",
    pc2: "XSplitなど主要配信ソフト対応",
    pc3: "Mac環境への完璧な互換性",
    pc4: "URLをコピーするだけで完了",
    pcDesc: "Chromeなどブラウザソースを使用できるすべてのPC放送プログラムで利用可能です.",
    
    mobileTitle: "モバイル配信も手軽に",
    mobile1: "PRISM Live Studio",
    mobile2: "CameraFi Live",
    mobile3: "Streamlabs Mobile",
    mobile4: "スペックを問わずスムーズな駆動",
    mobileDesc: "インターネットアドレス(URL)を追加できるモバイル放送アプリであれば、どこでも適用できます.",
    
    coreTitle: "방송을 살리는 핵심 기능",
    core1: "12개 이상의 톡톡 튀는 위젯",
    core2: "시청자 실시간 참여 유도",
    core3: "초보자용 디자인 세팅 제공",
    core4: "딜레이 없는 실시간 동기화",
    coreDesc: "다양한 위젯을 내 맘대로 조합해서 남들과는 다른 나만의 특별한 방송 화면을 꾸며보세요.",
    
    aiTag: "賢い放送アシスタント",
    aiTitle1: "自動で答える",
    aiTitle2: "AI自動チャットボット",
    aiDesc: "Gemini API를 탑재한 스마트한 AI 보트가 시청자와 소통합니다.\n무언의 걱정 없이 늘 북적거리는 방송 분위기를 만들어보세요.",
    aiBullet1: "시청자 질문에 맞춤형 대답 제공",
    aiBullet2: "여러 시청자가 참여하는 듯한 효과",
    aiBullet3: "어색하지 않은 자연스러운 반응 속도",
    aiBullet4: "본인의 무료 API 키를 등록하여 내 방송만의 맞춤 세팅 가능",
    aiExploreBtn: "AIチャットシミュレーション作動",
    
    chatMsg1: "이번판 1번인가요?",
    chatMsg2: "1번인거 같아요! 😆",
    chatMsg3: "오 그런듯 감사합니다!",
    chatMsg4: "헷갈리는데 1번 맞는듯? 저도 그렇게 생각해요!",
    
    // Live Dashboard Translations
    liveDemoTag: "LIVE DEMONSTRATION",
    liveDemoTitle: "リアルタイムダッシュボードデモ",
    liveDemoDesc: "OBS/YouTube配信画面にオーバーレイされるランキングボードと支援通知ウィ젯のライブ同期システムを体験してください.",
    rankingTitle: "🏆 本日の支援累計ランキング (リアルタイム)",
    rankingColName: "配信者/支援者",
    rankingColAmount: "支援累計額",
    rankingColRank: "順位",
    liveAlertTitle: "🔔 リアルタイム支援通知",
    liveAlertPlaceholder: "生放送中に支援が発生すると、ここに通知ポップアップが表示されます.",
    newDonationAlert: "さんが支援されました!",
    
    // Auth Modal
    modalTitle: "クリエイターログイン (Cafe24 PHP)",
    modalIdPlaceholder: "ID (mb_id) を入力",
    modalPwPlaceholder: "パスワード (mb_password) を入力",
    modalLoginBtn: "ログイン実行",
    modalCancelBtn: "キャンセル",
    modalGuideText: "* このログインはCafe24 PHPサーバー (/bbs/login_check.php) の認証仕様と完全互換設計されています.",
    loginSuccessMsg: "ログインに成功しました！ようこそ、",
    logoutSuccessMsg: "ログアウトしました.",
    
    adminMenu: "管理者",
    modifyMenu: "情報修正",
    logoutMenu: "ログアウト",
    loginMenu: "ログイン",
    menuLabel: "메뉴",
    navWidget: "ウィジェット",
    navFeatures: "連携ガイド",
    navAi: "AIボット",
    navContact: "サポート",
    footerText: "© 2026 TUBER. All rights reserved. Powered by premium live automated solutions."
  }
};

// Initial Mock Sponsor Rankings
const initialMockRankings = [
  { rank: 1, name: "라플라스_A", amount: 1540000 },
  { rank: 2, name: "쿠키몬스터", amount: 980000 },
  { rank: 3, name: "시청자22", amount: 720000 },
  { rank: 4, name: "OBS_PRO", amount: 450000 },
  { rank: 5, name: "팬더러버", amount: 310000 }
];

// Mock Sponsors pool for dynamic simulation
const sponsorNamesPool = ["유튜브스타", "초보비제이", "엑셀마스터", "시그니처요정", "큰손회원", "하늘나비", "윈드러너"];
const donationAmountsPool = [50000, 100000, 150000, 200000, 300000, 500000];

export default function Home() {
  const [lang, setLang] = useState("ko");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [userSession, setUserSession] = useState(null); // stores { id: "...", name: "..." } if logged in

  // Live Dashboard State
  const [rankings, setRankings] = useState(initialMockRankings);
  const [donationAlert, setDonationAlert] = useState(null);
  
  // Interactive AI chat simulator state
  const [chatLogs, setChatLogs] = useState([]);
  const [chatStep, setChatStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const t = (key) => {
    return translations[lang][key] || translations["ko"][key] || key;
  };

  // Check cached user session on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem("tuber_user_session");
    if (cachedUser) {
      setUserSession(JSON.parse(cachedUser));
    }
  }, []);

  // Scroll handler for navbar transparent-to-blur styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* =========================================================================
     [BACKEND INTEGRATION] 1. Cafe24 PHP / BBS Login Authentication Handler
     =========================================================================
     Below is the detailed implementation outline for connecting with the
     original Cafe24 PHP authentication endpoints.
  */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginId || !loginPw) return;

    try {
      // 1. API 파라미터 셋업 (x-www-form-urlencoded 형식)
      const formData = new URLSearchParams();
      formData.append('mb_id', loginId);
      formData.append('mb_password', loginPw);
      
      // 2. Cafe24 그누보드 서버로 요청 전송
      let data;
      try {
        const response = await fetch('https://tuber.co.kr/bbs/login_check_json.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData
        });
        data = await response.json();
      } catch (fetchErr) {
        // 로컬 개발/오프라인 환경일 경우 모의 로그인(Mock Auth)으로 자동 진행
        console.warn("PHP Backend Offline, falling back to mock login: ", fetchErr);
        data = {
          success: true,
          mb_id: loginId,
          mb_name: loginId === "admin" ? "관리자계정" : loginId + "님",
          mb_level: loginId === "admin" ? 10 : 3,
          mb_9: loginId === "admin" ? "무제한" : "2026-12-31"
        };
      }
      
      // 3. 응답에 따른 처리
      if (data.success) {
        // 성공 시 React 세션 스테이트 설정 및 LocalStorage 저장
        const user = { 
          id: data.mb_id, 
          name: data.mb_name, 
          level: data.mb_level,
          expireDate: data.mb_9 === "0000-00-00" || !data.mb_9 ? "무제한" : data.mb_9
        };
        setUserSession(user);
        localStorage.setItem("tuber_user_session", JSON.stringify(user));
        
        alert(`${t("loginSuccessMsg")}${user.name}`);
        
        // 입력 칸 리셋 및 모달 닫기
        setLoginId("");
        setLoginPw("");
        setIsAuthModalOpen(false);
        setIsSidebarOpen(false);
      } else {
        // 실패 시 에러 메시지 노출
        alert(data.message || "로그인 정보가 일치하지 않습니다.");
      }
    } catch (err) {
      console.error("Authentication Error: ", err);
      alert("서버 연결에 실패했습니다. 네트워크 상태나 CORS 설정을 확인해 주세요.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tuber_user_session");
    setUserSession(null);
    alert(t("logoutSuccessMsg"));
    setIsSidebarOpen(false);
  };

  /* =========================================================================
     [BACKEND INTEGRATION] 2. Real-Time Rankings Data Fetching & Sync
     =========================================================================
     Uses a React hook layout with interval polling to simulate or retrieve
     live rankings.
  */
  useEffect(() => {
    let isMounted = true;

    const fetchLiveRankings = async () => {
      try {
        /*
           [RANKINGS API CONNECTIVITY TEMPLATE]
           
           Fetch real-time cumulative amounts from Cafe24 MariaDB backend.
           
           const res = await fetch('https://tuber.co.kr/cast/api_get_rankings.php');
           const data = await res.json();
           if (isMounted && data.rankings) {
             setRankings(data.rankings);
           }
        */
      } catch (err) {
        console.error("Rankings Fetch Failed, staying with mock logs: ", err);
      }
    };

    fetchLiveRankings();
    
    // Simulate real-time ticking adjustments to mock database rankings every 7 seconds
    const interval = setInterval(() => {
      if (!isMounted) return;
      
      // Randomly update one of the rankings or insert a new one to show interface responsiveness
      setRankings((prev) => {
        const updated = [...prev];
        const randomIndex = Math.floor(Math.random() * updated.length);
        const addedAmount = donationAmountsPool[Math.floor(Math.random() * donationAmountsPool.length)];
        
        updated[randomIndex] = {
          ...updated[randomIndex],
          amount: updated[randomIndex].amount + addedAmount
        };
        
        // Resort by cumulative amount descending
        return updated
          .sort((a, b) => b.amount - a.amount)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));
      });
    }, 7000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  /* =========================================================================
     [BACKEND INTEGRATION] 3. WebSocket / SSE Live Donation Alert Notification
     =========================================================================
     Simulates real-time push events from active YouTube/OBS widgets.
  */
  useEffect(() => {
    /*
       [LIVE PUSH ALERT CONNECTIVITY TEMPLATE]
       
       Set up a Server-Sent Events (SSE) connection or WebSocket for instant alerts.
       
       const sse = new EventSource('https://tuber.co.kr/cast/donation_stream.php');
       sse.onmessage = (event) => {
         const newAlert = JSON.parse(event.data);
         // newAlert format: { sponsor: "...", amount: 10000, widget: "Signature" }
         triggerAlert(newAlert);
       };
       return () => sse.close();
    */

    // Simulate incoming donation alerts at random times (e.g. every 12 seconds)
    const interval = setInterval(() => {
      const randomSponsor = sponsorNamesPool[Math.floor(Math.random() * sponsorNamesPool.length)];
      const randomAmount = donationAmountsPool[Math.floor(Math.random() * donationAmountsPool.length)];
      
      const alertPayload = {
        name: randomSponsor,
        amount: randomAmount
      };

      // Push alert to screen
      setDonationAlert(alertPayload);

      // Automatically add this alert to the ranking logs
      setRankings((prev) => {
        let exists = false;
        let nextRankings = prev.map((item) => {
          if (item.name === randomSponsor) {
            exists = true;
            return { ...item, amount: item.amount + randomAmount };
          }
          return item;
        });

        if (!exists) {
          nextRankings.push({ rank: 99, name: randomSponsor, amount: randomAmount });
        }

        return nextRankings
          .sort((a, b) => b.amount - a.amount)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));
      });

      // Clear alert after 4.5 seconds
      setTimeout(() => {
        setDonationAlert(null);
      }, 4500);

    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // AI Chat Simulation sequence
  const startChatSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setChatLogs([]);
    setChatStep(0);
  };

  useEffect(() => {
    if (!isSimulating) return;

    const messages = [
      { sender: "User", text: t("chatMsg1"), style: "normal" },
      { sender: "AI Bot A", text: t("chatMsg2"), style: "ai-primary" },
      { sender: "User", text: t("chatMsg3"), style: "normal" },
      { sender: "AI Bot B", text: t("chatMsg4"), style: "ai-secondary" }
    ];

    if (chatStep < messages.length) {
      const timer = setTimeout(() => {
        setChatLogs((prev) => [...prev, messages[chatStep]]);
        setChatStep((prev) => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setIsSimulating(false);
    }
  }, [isSimulating, chatStep, lang]);

  return (
    <div className="min-h-screen bg-bg-dark text-text-bright font-sans antialiased overflow-x-hidden selection:bg-primary/30 selection:text-primary">
      
      {/* 1. Header (Navbar) */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b border-white/5 ${
          isScrolled 
            ? "bg-bg-dark/85 backdrop-blur-xl py-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="relative w-[130px] h-[32px] sm:w-[150px] sm:h-[36px] transition-transform hover:scale-102">
            <Image 
              src="/logo-color.png" 
              alt="Tuber Logo" 
              fill
              priority
              className="object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#widgets" className="text-sm font-semibold hover:text-primary transition-colors">{t("navWidget")}</a>
            <a href="#features" className="text-sm font-semibold hover:text-primary transition-colors">{t("navFeatures")}</a>
            <a href="#live-dashboard" className="text-sm font-semibold hover:text-primary transition-colors">대시보드데모</a>
            <a href="#ai-chatbot" className="text-sm font-semibold hover:text-primary transition-colors">{t("navAi")}</a>
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* User Session Info Badge */}
            {userSession && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
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
                className="flex items-center justify-center p-2 rounded-lg bg-white/5 border border-white/10 text-text-bright/70 hover:text-primary hover:bg-white/10 transition-all"
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
                    onClick={() => { setLang("ko"); setIsLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors ${lang === "ko" ? "text-primary font-bold" : "text-text-bright/80"}`}
                  >
                    한국어 (KO)
                  </button>
                  <button 
                    onClick={() => { setLang("en"); setIsLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors ${lang === "en" ? "text-primary font-bold" : "text-text-bright/80"}`}
                  >
                    English (EN)
                  </button>
                  <button 
                    onClick={() => { setLang("ja"); setIsLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors ${lang === "ja" ? "text-primary font-bold" : "text-text-bright/80"}`}
                  >
                    日本語 (JA)
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Toggle Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all active:scale-95 group"
            >
              <div className="w-5 h-[2px] bg-text-bright group-hover:bg-primary transition-colors"></div>
              <div className="w-5 h-[2px] bg-text-bright group-hover:bg-primary transition-colors"></div>
              <div className="w-5 h-[2px] bg-text-bright group-hover:bg-primary transition-colors"></div>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Right Sidebar Panel */}
      <div 
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <div 
        className={`fixed top-0 bottom-0 right-0 w-[360px] max-w-[75vw] z-50 glass-sidebar p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          {/* Sidebar Top */}
          <div className="flex items-center justify-between mb-8">
            <div className="relative w-[100px] h-[25px]">
              <Image src="/logo-color.png" alt="Tuber Logo" fill className="object-contain opacity-80" />
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-text-bright/70 hover:text-primary transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Quick Menu (Glass Card) - Dynamic Auth Integration */}
          {userSession ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 shadow-md flex flex-col gap-2.5 text-xs text-text-dim">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-primary font-bold text-sm truncate max-w-[150px]">{userSession.name} ({userSession.id})</span>
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
                <a href="#" className="hover:text-primary transition-colors">{t("modifyMenu")}</a>
                <div className="w-[1px] h-4 bg-white/10" />
                <button onClick={handleLogout} className="hover:text-primary transition-colors text-left">{t("logoutMenu")}</button>
                {userSession.level >= 10 && (
                  <>
                    <div className="w-[1px] h-4 bg-white/10" />
                    <a href="#" className="hover:text-primary transition-colors">{t("adminMenu")}</a>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 shadow-md flex items-center justify-around gap-2 text-sm font-semibold">
              <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-primary transition-colors">{t("loginMenu")}</button>
              <div className="w-[1px] h-4 bg-white/10" />
              <a href="#" className="hover:text-primary transition-colors">{t("registerBtn")}</a>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-3">
            <a 
              href="#widgets" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all font-semibold"
            >
              <span>{t("navWidget")}</span>
              <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
            <a 
              href="#features" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all font-semibold"
            >
              <span>{t("navFeatures")}</span>
              <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
            <a 
              href="#live-dashboard" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all font-semibold"
            >
              <span>대시보드 위젯 데모</span>
              <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
            <a 
              href="#ai-chatbot" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all font-semibold"
            >
              <span>{t("navAi")}</span>
              <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </nav>
        </div>

        <div className="text-center text-xs text-text-dim/60">
          {t("footerText")}
        </div>
      </div>

      {/* 3. Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center pt-32 pb-24 px-6 bg-cover bg-center bg-fixed bg-no-repeat"
        style={{ 
          backgroundImage: `radial-gradient(circle at center, rgba(0, 240, 255, 0.06) 0%, #050510 85%), url('/main_bg.jpg')` 
        }}
      >
        <div className="absolute inset-0 bg-bg-dark/40 z-0 pointer-events-none" />
        
        {/* Hero Card */}
        <div className="relative z-10 glass-panel max-w-4xl mx-auto px-6 py-16 sm:py-20 rounded-[40px] sm:rounded-[60px] border border-white/10 text-center shadow-[0_40px_120px_rgba(0,0,0,0.7)] animate-float">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider mb-6">
            {t("brandTag")}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6 select-none">
            {t("heroTitle1")} <br />
            <span className="text-primary drop-shadow-[0_0_30px_rgba(0,240,255,0.4)]">
              {t("heroTitle2")}
            </span>
          </h1>

          <p className="text-base sm:text-xl text-text-dim leading-relaxed max-w-2xl mx-auto mb-10 whitespace-pre-line font-medium">
            {t("heroDesc")}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {userSession ? (
              <a 
                href="#live-dashboard" 
                className="w-full sm:w-auto h-16 px-10 rounded-full bg-primary text-bg-dark font-bold text-base flex items-center justify-center hover:scale-105 hover:shadow-[0_20px_40px_rgba(0,240,255,0.35)] transition-all duration-300"
              >
                {t("dashboardBtn")}
              </a>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto h-16 px-10 rounded-full bg-primary text-bg-dark font-bold text-base flex items-center justify-center hover:scale-105 hover:shadow-[0_20px_40px_rgba(0,240,255,0.35)] transition-all duration-300"
              >
                {t("loginBtn")}
              </button>
            )}
            <a 
              href="#widgets" 
              className="w-full sm:w-auto h-16 px-10 rounded-full bg-white/5 border border-white/10 font-bold text-base flex items-center justify-center hover:bg-white/10 hover:scale-103 transition-all duration-300"
            >
              {t("briefingBtn")}
            </a>
          </div>
        </div>
      </section>

      {/* 4. Widget Ecosystem Showcase */}
      <section id="widgets" className="py-32 px-6 bg-gradient-to-b from-bg-dark to-[#0a0a1a] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider mb-6">
              {t("showcaseTag")}
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
              {t("showcaseTitle1")} <br />
              <span className="text-primary">{t("showcaseTitle2")}</span>
            </h2>
            <p className="text-base sm:text-lg text-text-dim leading-relaxed">
              {t("showcaseDesc")}
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Features list */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl hover:bg-white/8 hover:border-primary/40 hover:translate-x-2 transition-all duration-300 group cursor-default">
                <h4 className="text-xl sm:text-2xl font-semibold text-primary flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                  </svg>
                  {t("widget1Title")}
                </h4>
                <p className="text-sm sm:text-base text-text-dim leading-relaxed whitespace-pre-line">
                  {t("widget1Desc")}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl hover:bg-white/8 hover:border-primary/40 hover:translate-x-2 transition-all duration-300 group cursor-default">
                <h4 className="text-xl sm:text-2xl font-semibold text-primary flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
                  </svg>
                  {t("widget2Title")}
                </h4>
                <p className="text-sm sm:text-base text-text-dim leading-relaxed whitespace-pre-line">
                  {t("widget2Desc")}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl hover:bg-white/8 hover:border-primary/40 hover:translate-x-2 transition-all duration-300 group cursor-default">
                <h4 className="text-xl sm:text-2xl font-semibold text-primary flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 11-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2l4.454.647a1 1 0 01.554 1.707l-3.223 3.142.76 4.437a1 1 0 01-1.45 1.054L11.25 16.1l-3.99 2.097a1 1 0 01-1.45-1.054l.76-4.437-3.223-3.142a1 1 0 01.554-1.707l4.454-.647 1.213-4.456A1 1 0 0112 2z" clipRule="evenodd"></path>
                  </svg>
                  {t("widget3Title")}
                </h4>
                <p className="text-sm sm:text-base text-text-dim leading-relaxed whitespace-pre-line">
                  {t("widget3Desc")}
                </p>
              </div>
            </div>

            {/* Right: Visual image stack & floating badges */}
            <div className="lg:col-span-7 relative flex justify-center items-center">
              {/* Main Visual Image Card */}
              <div className="bg-white/5 border border-white/10 rounded-[30px] sm:rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] group max-w-full z-10 transition-transform duration-500 hover:scale-[1.02]">
                <img 
                  src="/tuber_signature_pro.png" 
                  alt="Signature Widget Demo" 
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Floating badges */}
              <div className="hidden sm:flex absolute top-[-10px] right-[20px] bg-[#050510]/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl z-20 items-center gap-3 shadow-xl">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping shadow-[0_0_10px_#22c55e]" />
                <span className="text-xs font-bold tracking-wide">Live Interaction Active</span>
              </div>

              <div className="hidden sm:flex absolute bottom-[30px] left-[-20px] bg-[#050510]/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl z-20 items-center gap-3 shadow-xl text-primary animate-pulse-slow">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                </svg>
                <span className="text-xs font-bold tracking-wide">AI Optimized Layout</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Grid */}
      <section id="features" className="py-32 px-6 bg-bg-dark relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 sm:p-10 flex flex-col justify-between hover:bg-white/8 hover:border-primary hover:-translate-y-4 hover:shadow-[0_40px_100px_rgba(0,0,0,0.5)] transition-all duration-300">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden mb-8 p-1">
                  <img src="/icon_console_3d.png" alt="Icon auto integration" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">{t("feature1Title")}</h3>
                <p className="text-sm sm:text-base text-text-dim leading-relaxed whitespace-pre-line mb-8">
                  {t("feature1Desc")}
                </p>
              </div>
              <a href="#" className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-2 mt-auto group">
                {t("viewDetails")} 
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>

            {/* Card 2 */}
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 sm:p-10 flex flex-col justify-between hover:bg-white/8 hover:border-primary hover:-translate-y-4 hover:shadow-[0_40px_100px_rgba(0,0,0,0.5)] transition-all duration-300">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden mb-8 p-1">
                  <img src="/icon_entertainment_3d.png" alt="Icon screen effects" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">{t("feature2Title")}</h3>
                <p className="text-sm sm:text-base text-text-dim leading-relaxed whitespace-pre-line mb-8">
                  {t("feature2Desc")}
                </p>
              </div>
              <a href="#" className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-2 mt-auto group">
                {t("exploreWidgets")} 
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>

            {/* Card 3 */}
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 sm:p-10 flex flex-col justify-between hover:bg-white/8 hover:border-primary hover:-translate-y-4 hover:shadow-[0_40px_100px_rgba(0,0,0,0.5)] transition-all duration-300">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden mb-8 p-1">
                  <img src="/icon_commerce_3d.png" alt="Icon commerce" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">{t("feature3Title")}</h3>
                <p className="text-sm sm:text-base text-text-dim leading-relaxed whitespace-pre-line mb-8">
                  {t("feature3Desc")}
                </p>
              </div>
              <a href="#" className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-2 mt-auto group">
                {t("platformIntro")} 
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5.5. [NEW] Interactive Live Widget Dashboard Section */}
      <section id="live-dashboard" className="py-32 px-6 bg-gradient-to-b from-[#0a0a1a] to-bg-dark relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider mb-6">
              {t("liveDemoTag")}
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
              {t("liveDemoTitle")}
            </h2>
            <p className="text-base sm:text-lg text-text-dim leading-relaxed">
              {t("liveDemoDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Sponsor Rankings Dashboard */}
            <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-[30px] p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-6 text-primary flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                  {t("rankingTitle")}
                </h3>
                
                {/* Rankings Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-sm sm:text-base border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-text-dim text-xs font-bold tracking-wider">
                        <th className="pb-3 w-16">{t("rankingColRank")}</th>
                        <th className="pb-3">{t("rankingColName")}</th>
                        <th className="pb-3 text-right">{t("rankingColAmount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankings.map((item, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4">
                            <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center font-extrabold text-xs ${
                              idx === 0 
                                ? "bg-yellow-500 text-bg-dark shadow-[0_0_10px_#eab308]" 
                                : idx === 1 
                                  ? "bg-slate-300 text-bg-dark" 
                                  : idx === 2 
                                    ? "bg-amber-600 text-text-bright" 
                                    : "bg-white/10 text-text-bright"
                            }`}>
                              {item.rank}
                            </span>
                          </td>
                          <td className="py-4 font-bold">{item.name}</td>
                          <td className="py-4 text-right text-primary font-mono font-bold">
                            {item.amount.toLocaleString()} ₩
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 text-xs text-text-dim opacity-70 italic">
                * rankings update in real-time. Ticking simulator active.
              </div>
            </div>

            {/* Right Column: OBS Alerts Mock Screen */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Alert box simulator container */}
              <div className="flex-1 bg-black/50 border border-white/10 rounded-[30px] p-6 flex flex-col justify-between min-h-[300px] shadow-2xl relative overflow-hidden">
                <h4 className="text-sm font-bold text-text-dim tracking-wider mb-6 flex items-center justify-between">
                  <span>{t("liveAlertTitle")}</span>
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] uppercase font-mono">OBS Overlay</span>
                </h4>

                {/* Animated Alert Banner Slot */}
                <div className="flex-1 flex items-center justify-center">
                  {donationAlert ? (
                    <div className="w-full bg-[#050510]/80 backdrop-blur-xl border border-primary/30 p-6 rounded-2xl flex flex-col items-center text-center shadow-[0_10px_40px_rgba(0,240,255,0.2)] animate-float animate-pulse-slow">
                      <div className="text-yellow-500 text-4xl mb-3 animate-bounce">💎</div>
                      <div className="text-base sm:text-lg font-extrabold text-primary mb-2">
                        {donationAlert.name}
                      </div>
                      <div className="text-sm text-text-bright leading-snug">
                        {t("newDonationAlert")}
                      </div>
                      <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#D8B4FE] mt-3">
                        {donationAlert.amount.toLocaleString()} ₩
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-text-dim/60 text-sm leading-relaxed p-8">
                      <div className="text-3xl mb-4 opacity-40">🔔</div>
                      {t("liveAlertPlaceholder")}
                    </div>
                  )}
                </div>

                <div className="text-xs text-text-dim/40 italic">
                  * Simulation triggers simulated donation alert popups every 12 seconds.
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. System Compatibility (Specs) */}
      <section id="specs" className="pb-32 px-6 bg-bg-dark relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PC Specs */}
            <div className="bg-white/2 border border-white/10 p-8 rounded-[30px] flex flex-col justify-between hover:bg-white/4 transition-colors">
              <div>
                <h4 className="text-xs tracking-widest text-primary font-bold uppercase mb-6">{t("pcTitle")}</h4>
                <ul className="flex flex-col gap-3">
                  <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-text-bright opacity-95">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("pc1")}
                  </li>
                  <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-text-bright opacity-95">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("pc2")}
                  </li>
                  <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-text-bright opacity-95">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("pc3")}
                  </li>
                  <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-text-bright opacity-95">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("pc4")}
                  </li>
                </ul>
              </div>
              <p className="text-xs sm:text-sm text-text-dim mt-8 leading-relaxed">
                {t("pcDesc")}
              </p>
            </div>

            {/* Mobile Specs */}
            <div className="bg-white/2 border border-white/10 p-8 rounded-[30px] flex flex-col justify-between hover:bg-white/4 transition-colors">
              <div>
                <h4 className="text-xs tracking-widest text-primary font-bold uppercase mb-6">{t("mobileTitle")}</h4>
                <ul className="flex flex-col gap-3">
                  <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-text-bright opacity-95">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("mobile1")}
                  </li>
                  <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-text-bright opacity-95">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("mobile2")}
                  </li>
                  <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-text-bright opacity-95">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("mobile3")}
                  </li>
                  <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-text-bright opacity-95">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("mobile4")}
                  </li>
                </ul>
              </div>
              <p className="text-xs sm:text-sm text-text-dim mt-8 leading-relaxed">
                {t("mobileDesc")}
              </p>
            </div>

            {/* Core Specs */}
            <div className="bg-white/2 border border-white/10 p-8 rounded-[30px] flex flex-col justify-between hover:bg-white/4 transition-colors">
              <div>
                <h4 className="text-xs tracking-widest text-primary font-bold uppercase mb-6">{t("coreTitle")}</h4>
                <ul className="flex flex-col gap-3">
                  <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-text-bright opacity-95">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("core1")}
                  </li>
                  <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-text-bright opacity-95">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("core2")}
                  </li>
                  <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-text-bright opacity-95">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("core3")}
                  </li>
                  <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-text-bright opacity-95">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("core4")}
                  </li>
                </ul>
              </div>
              <p className="text-xs sm:text-sm text-text-dim mt-8 leading-relaxed">
                {t("coreDesc")}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. AI Interactive Assistant Section */}
      <section 
        id="ai-chatbot" 
        className="py-32 px-6 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(124,77,255,0.1),transparent)]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column Description */}
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-[#A855F7] text-xs font-bold tracking-wider mb-6">
                {t("aiTag")}
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold mt-2 mb-6 leading-tight">
                {t("aiTitle1")} <br />
                <span className="text-primary">{t("aiTitle2")}</span>
              </h2>
              <p className="text-base sm:text-lg text-text-dim leading-relaxed whitespace-pre-line mb-8">
                {t("aiDesc")}
              </p>

              <ul className="flex flex-col gap-4 mb-8">
                <li className="flex items-center gap-3 text-sm sm:text-base">
                  <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span>{t("aiBullet1")}</span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base">
                  <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span>{t("aiBullet2")}</span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base">
                  <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span>{t("aiBullet3")}</span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base">
                  <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span>{t("aiBullet4")}</span>
                </li>
              </ul>

              <button 
                onClick={startChatSimulation}
                disabled={isSimulating}
                className={`h-16 px-8 rounded-full border border-white/10 font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 ${
                  isSimulating 
                    ? "bg-white/10 text-text-dim cursor-not-allowed opacity-50" 
                    : "bg-[#7000FF]/25 hover:bg-[#7000FF]/40 text-[#D8B4FE] border-[#7000FF]/40 hover:scale-103"
                }`}
              >
                {isSimulating && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                </svg>
                {t("aiExploreBtn")}
              </button>
            </div>

            {/* Right Column mockup chat panel */}
            <div className="relative glass-panel rounded-[40px] p-8 overflow-hidden shadow-2xl border border-white/10 aspect-video flex flex-col justify-between">
              
              {/* Fake Console Screen */}
              <div className="bg-black/60 rounded-2xl p-6 font-mono text-sm border border-white/10 flex-1 flex flex-col justify-between min-h-[220px] shadow-inner select-none overflow-y-auto">
                <div>
                  {/* Console Header */}
                  <div className="text-zinc-500 mb-4 flex items-center gap-2 text-xs border-b border-white/5 pb-2">
                    <div className="w-2.5 h-2.5 bg-[#ff5f56] rounded-full" />
                    <div className="w-2.5 h-2.5 bg-[#ffbd2e] rounded-full" />
                    <div className="w-2.5 h-2.5 bg-[#27c93f] rounded-full" />
                    <span className="ml-4 opacity-50 tracking-wider">LIVE_CHAT_STREAM</span>
                  </div>

                  <div className="text-zinc-500 mb-3 opacity-60">// System: WebSocket Connected...</div>
                  
                  {/* Chat Logs */}
                  <div className="flex flex-col gap-2.5">
                    {/* Defaults if not started */}
                    {chatLogs.length === 0 && (
                      <div className="text-zinc-600 italic py-4 text-center">
                        Click "Run AI Chat Simulation" to start simulation...
                      </div>
                    )}

                    {chatLogs.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`transition-all duration-300 flex flex-col gap-1 ${
                          msg.style === "ai-primary" || msg.style === "ai-secondary" 
                            ? "bg-white/5 p-3 rounded-2xl border-l-4 border-primary/80" 
                            : ""
                        }`}
                      >
                        <span className={`text-xs font-bold ${
                          msg.style === "ai-primary" 
                            ? "text-primary" 
                            : msg.style === "ai-secondary" 
                              ? "text-secondary" 
                              : "text-text-bright"
                        }`}>
                          {msg.sender}:
                        </span>
                        <span className="text-sm">{msg.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Watermark Icon */}
              <div className="absolute bottom-[-20px] right-[-20px] text-[140px] opacity-[0.05] text-primary rotate-[-15deg] pointer-events-none">
                <svg className="w-[140px] h-[140px]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path>
                </svg>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 8. Sub CTA Section */}
      <section 
        className="relative py-40 px-6 text-center bg-cover bg-center bg-fixed border-t border-white/10"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, #050510, rgba(5, 5, 16, 0.6)), url('/main_bot_img.jpg')` 
        }}
      >
        <div className="absolute inset-0 bg-bg-dark/20 z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight mb-8 leading-tight">
            상상을 현실로 만드는 <br />
            <span className="text-primary font-extrabold drop-shadow-[0_0_20px_rgba(0,240,255,0.2)]">프로급 라이브 위젯</span>
          </h2>
          <p className="text-lg sm:text-xl text-text-dim max-w-2xl mx-auto mb-12">
            TUBER와 함께 시청자를 매료시키는 나만의 특별한 생방송 화면을 꾸며보세요.
          </p>

          <a 
            href="#" 
            className="inline-flex h-16 px-12 rounded-full bg-primary text-bg-dark font-extrabold text-base items-center justify-center hover:scale-105 hover:shadow-[0_20px_40px_rgba(0,240,255,0.35)] transition-all duration-300"
          >
            {t("registerBtn")}
          </a>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="py-12 px-6 bg-[#03030b] border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-sm text-text-dim/60 font-medium">
          <div className="relative w-[100px] h-[25px] opacity-80">
            <Image src="/logo-color.png" alt="Tuber Logo" fill className="object-contain" />
          </div>
          <div>
            {t("footerText")}
          </div>
        </div>
      </footer>

      {/* 10. [NEW] Cafe24 Gnuboard Login Authentication Modal Layout */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          {/* Modal Card */}
          <div className="w-full max-w-md bg-[#050510] border border-white/10 rounded-[30px] p-8 shadow-2xl relative animate-float">
            
            <h3 className="text-2xl font-bold text-text-bright mb-2 tracking-tight">
              {t("modalTitle")}
            </h3>
            <p className="text-xs text-text-dim mb-6 leading-relaxed">
              {t("modalGuideText")}
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                  onClick={() => { setIsAuthModalOpen(false); setLoginId(""); setLoginPw(""); }}
                  className="flex-1 h-14 rounded-xl bg-white/5 border border-white/10 font-bold text-sm text-text-bright/80 hover:bg-white/10 transition-colors"
                >
                  {t("modalCancelBtn")}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 h-14 rounded-xl bg-primary font-bold text-sm text-bg-dark hover:scale-103 transition-all duration-300 shadow-[0_10px_20px_rgba(0,240,255,0.2)]"
                >
                  {t("modalLoginBtn")}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
