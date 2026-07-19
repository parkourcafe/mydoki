// Client-side image compression for the candidate upload flow (ТЗ E1).
// Budget Androids on weak networks: downscale + re-encode large photos before
// upload so a 5–12 MP camera shot doesn't fail the 10 MB limit or stall.
// PDFs, non-images, and already-small files pass through unchanged.

const DEFAULT_MAX_DIM = 2000; // px, longest side
const DEFAULT_QUALITY = 0.8;
const SKIP_BELOW_BYTES = 1_500_000; // don't bother compressing small photos

export async function compressImage(
  file: File,
  opts: { maxDim?: number; quality?: number; skipBelowBytes?: number } = {},
): Promise<File> {
  const maxDim = opts.maxDim ?? DEFAULT_MAX_DIM;
  const quality = opts.quality ?? DEFAULT_QUALITY;
  const skipBelow = opts.skipBelowBytes ?? SKIP_BELOW_BYTES;

  // Only JPEG/PNG raster images; leave PDFs and everything else untouched.
  if (!/^image\/(jpe?g|png)$/i.test(file.type)) return file;
  if (file.size < skipBelow) return file;
  if (typeof document === "undefined" || typeof createImageBitmap === "undefined") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, maxDim / longest);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    // Keep the original if compression didn't actually help.
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.(png|jpe?g)$/i, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    // Any failure (unsupported codec, OOM on a cheap device) → upload original.
    return file;
  }
}
