import "server-only";
import type { ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { renderToBuffer } from "@react-pdf/renderer";
import { ensureFonts } from "./font";

/** Рендерит документ react-pdf в байты. Шрифты регистрируются один раз. */
export async function renderPdf(
  element: ReactElement<DocumentProps>
): Promise<Uint8Array<ArrayBuffer>> {
  ensureFonts();
  const buffer = await renderToBuffer(element);
  // Копия в собственный ArrayBuffer: Buffer приходит из общего пула Node и
  // как тело ответа его отдавать нельзя.
  const bytes = new Uint8Array(new ArrayBuffer(buffer.byteLength));
  bytes.set(buffer);
  return bytes;
}

/**
 * Заголовки отдачи PDF. Имя файла даём и в ASCII (для старых клиентов), и в
 * RFC 5987 — иначе кириллица в имени ломает загрузку.
 */
export function pdfHeaders(fileName: string): HeadersInit {
  const ascii = fileName.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
  return {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };
}

/** Безопасное имя файла из произвольной строки. */
export function pdfFileName(base: string, fallback: string): string {
  const clean = base.trim().replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").slice(0, 60);
  return `${clean || fallback}.pdf`;
}
