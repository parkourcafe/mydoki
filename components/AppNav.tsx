"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SpaceSwitcher from "@/components/SpaceSwitcher";
import SignOutButton from "@/components/SignOutButton";
import { signOut } from "@/app/my/actions";
import type { Locale } from "@/lib/i18n";

type NavItem = { href: string; emoji: string; label: string };

/**
 * Оболочка кабинета: слева — вертикальное меню разделов, справа — контент.
 * На десктопе сайдбар закреплён; на телефоне выезжает по «гамбургеру» и
 * закрывается при переходе на другой раздел.
 */
export default function AppNav({
  locale,
  brand,
  menuLabel,
  signOutLabel,
  userEmail,
  spaces,
  activeId,
  nav,
  mfa,
  children,
}: {
  locale: Locale;
  brand: string;
  menuLabel: string;
  signOutLabel: string;
  userEmail: string;
  spaces: { id: string; name: string }[];
  activeId: string;
  nav: NavItem[];
  mfa: { warning: string; enable2fa: string; recommend: string } | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Закрываем выезжающее меню при смене маршрута.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Блокируем прокрутку фона, пока открыто выезжающее меню (мобильный).
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-[#f9f5f0] md:flex">
      {/* Затемнение под меню (только мобильный) */}
      {open && (
        <button
          aria-label={menuLabel}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
        />
      )}

      {/* САЙДБАР */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#e8e0d5] bg-[#fdfaf5] transition-transform duration-200 " +
          (open ? "translate-x-0" : "-translate-x-full") +
          " md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0"
        }
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link
            href="/my"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 font-semibold"
          >
            <span className="text-xl">🔐</span>
            <span>{brand}</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label={menuLabel}
            className="rounded-lg p-1 text-slate-500 hover:bg-[#f0e6d9] md:hidden"
          >
            ✕
          </button>
        </div>

        <div className="px-3 pb-2">
          <SpaceSwitcher spaces={spaces} activeId={activeId} locale={locale} />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 text-sm">
          {nav.map((item) => {
            const active =
              item.href === "/my"
                ? pathname === "/my"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors " +
                  (active
                    ? "bg-[#f0e6d9] font-medium text-[#2c2522]"
                    : "text-[#5c5248] hover:bg-[#f0e6d9]")
                }
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#e8e0d5] px-3 py-3">
          <div className="mb-2 truncate px-3 text-xs text-slate-500">
            {userEmail}
          </div>
          <form action={signOut}>
            <SignOutButton
              label={signOutLabel}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-[#f0e6d9] disabled:opacity-60"
            />
          </form>
        </div>
      </aside>

      {/* КОНТЕНТ */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Верхняя панель (только мобильный) */}
        <header className="flex items-center gap-3 border-b border-[#e8e0d5] bg-[#fdfaf5] px-4 py-3 md:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label={menuLabel}
            className="-ml-1 rounded-lg p-2 text-xl leading-none hover:bg-[#f0e6d9]"
          >
            ☰
          </button>
          <Link href="/my" className="flex items-center gap-2 font-semibold">
            <span className="text-lg">🔐</span>
            <span>{brand}</span>
          </Link>
        </header>

        {mfa && (
          <div className="border-b border-[#e8e0d5] bg-[#fdfaf5]">
            <div className="mx-auto max-w-5xl px-4 py-2 text-sm text-[#5c5248]">
              {mfa.warning}{" "}
              <Link
                href="/my/security"
                className="font-medium text-[#b85c38] underline"
              >
                {mfa.enable2fa}
              </Link>{" "}
              {mfa.recommend}
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
