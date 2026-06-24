"use client";

import { useEffect } from "react";

/** Регистрирует service worker для офлайн-режима/установки PWA. */
export default function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const onLoad = () =>
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      if (document.readyState === "complete") onLoad();
      else window.addEventListener("load", onLoad, { once: true });
    }
  }, []);
  return null;
}
