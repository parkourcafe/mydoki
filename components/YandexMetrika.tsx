"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const YM_ID = process.env.NEXT_PUBLIC_YM_ID || "110117157";

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

/** Отправляет «hit» при SPA-переходах (App Router не делает это сам). */
function MetrikaPageviews() {
  const pathname = usePathname();
  const search = useSearchParams();
  const first = useRef(true);

  useEffect(() => {
    // Первый просмотр уже учтён вызовом init — не дублируем.
    if (first.current) {
      first.current = false;
      return;
    }
    if (typeof window !== "undefined" && window.ym) {
      const url = pathname + (search?.toString() ? `?${search}` : "");
      window.ym(Number(YM_ID), "hit", url);
    }
  }, [pathname, search]);

  return null;
}

/**
 * Яндекс.Метрика. Webvisor (запись сессий) намеренно ВЫКЛЮЧЕН: сервис хранит
 * персональные документы, и запись авторизованной зоны недопустима по 152-ФЗ.
 * Считаются просмотры, клики (clickmap) и внешние ссылки.
 */
export default function YandexMetrika() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();for(var j=0;j<e.scripts.length;j++){if(e.scripts[j].src===r){return;}}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}','ym');
        ym(${YM_ID},'init',{ssr:true,webvisor:false,clickmap:true,accurateTrackBounce:true,trackLinks:true});`}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${YM_ID}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
      <Suspense fallback={null}>
        <MetrikaPageviews />
      </Suspense>
    </>
  );
}
