"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { listDocs } from "@/lib/offlineDb";

function subscribeOnline(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

/**
 * Пилюля статуса в шапке: онлайн/офлайн (navigator.onLine) + число сохранённых
 * офлайн-документов. Ведёт на /saved. Заменяет пункт «Офлайн» в меню (T8).
 */
export default function OfflinePill({ href, label }: { href: string; label: string }) {
  // navigator.onLine — внешний источник истины: useSyncExternalStore вместо
  // setState-в-эффекте (react-hooks/set-state-in-effect). Классический пример
  // из документации React.
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );
  const [count, setCount] = useState(0);

  useEffect(() => {
    listDocs()
      .then((d) => setCount(d.length))
      .catch(() => {});
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
