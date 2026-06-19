"use client";

import Image from "next/image";
import { useApp } from "../AppContext";

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="py-12 px-6 bg-[#03030b] border-t border-white/5 text-center mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-sm text-text-dim/60 font-medium">
        <div className="relative w-[100px] h-[25px] opacity-80">
          <Image src="/logo-color.png" alt="Tuber Logo" fill className="object-contain" />
        </div>
        <div>
          {t("footerText")}
        </div>
      </div>
    </footer>
  );
}
