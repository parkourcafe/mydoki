"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listDocs } from "@/lib/offlineDb";

/**
 * Пилюля статуса в шапке: онлайн/офлайн (navigator.onLine) + число сохранённых
 * офлайн-документов. Ведёт на /saved. Заменяет пункт «Офлайн» в меню (T8).
 */
export default function OfflinePill({ href, label }: { href: string; label: string }) {
  const [online, setOnline] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    listDocs()
      .then((d) => setCount(d.length))
      .catch(() => {});
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="flex h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm text-[#5c5248] hover:bg-[#f0e6d9]"
    >
      <span
        className={
          "inline-block h-2 w-2 rounded-full " + (online ? "bg-green-500" : "bg-slate-400")
        }
      />
      <span>📥 {count}</span>
    </Link>
  );
}
