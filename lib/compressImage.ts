// Клиентское сжатие фото ПЕРЕД загрузкой. Библиотеки грузятся лениво
// (dynamic import), поэтому в начальный бандл apply-страницы не попадают (T7).
// PDF и не-изображения проходят без изменений. HEIC (iPhone) → JPEG → сжатие.
// Общий util — vault-загрузчик сможет переиспользовать позже (T5 scope note).

import { MAX_FILE_BYTES } from "./career";

export type CompressOutcome = {
  file: File; // что реально грузить
  originalSize: number;
  finalSize: number;
  changed: boolean; // было ли сжатие/конверсия
  failed: boolean; // сжатие упало, вернули исходник (для метрики)
  tooLarge: boolean; // даже после обработки > лимита
};

const COMPRESS_OPTS = {
  maxSizeMB: 0.35,
  maxWidthOrHeight: 2000,
  initialQuality: 0.8,
  useWebWorker: true,
  fileType: "image/jpeg",
} as const;

function isHeic(file: File): boolean {
  return /image\/hei(c|f)/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

/**
 * Возвращает файл к загрузке. Изображения сжимает до ~350 КБ; PDF/прочее —
 * как есть. Никогда не бросает: при сбое отдаёт исходник с failed=true.
 */
export async function compressImage(file: File): Promise<CompressOutcome> {
  const originalSize = file.size;

  // Не изображение (PDF и т.п.) — не трогаем.
  if (!file.type.startsWith("image/")) {
    return {
      file,
      originalSize,
      finalSize: originalSize,
      changed: false,
      failed: false,
      tooLarge: originalSize > MAX_FILE_BYTES,
    };
  }

  let working = file;

  // HEIC/HEIF → JPEG (иначе браузер/сжатие их не осилит).
  if (isHeic(file)) {
    try {
      const heic2any = (await import("heic2any")).default;
      const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
      const blob = Array.isArray(out) ? out[0] : out;
      working = new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
        type: "image/jpeg",
      });
    } catch {
      // Конверсия не удалась — попробуем сжать исходник ниже; если и там
      // упадёт, вернём исходник как failed.
    }
  }

  try {
    const imageCompression = (await import("browser-image-compression")).default;
    const compressed = await imageCompression(working, COMPRESS_OPTS);
    // Сохраняем исходное имя (контент — jpeg).
    const outFile = new File([compressed], working.name, { type: "image/jpeg" });
    return {
      file: outFile,
      originalSize,
      finalSize: outFile.size,
      changed: true,
      failed: false,
      tooLarge: outFile.size > MAX_FILE_BYTES,
    };
  } catch {
    // Сжатие упало → грузим исходник, если он в пределах лимита.
    return {
      file: working,
      originalSize,
      finalSize: working.size,
      changed: working !== file,
      failed: true,
      tooLarge: working.size > MAX_FILE_BYTES,
    };
  }
}

/** «7,2 МБ → 310 КБ» для строки загрузки. */
export function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} МБ`;
  if (n >= 1024) return `${Math.round(n / 1024)} КБ`;
  return `${n} Б`;
}
