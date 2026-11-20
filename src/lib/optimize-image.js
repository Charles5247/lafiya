export async function optimizePropertyImage(file) {
  const original = { file, extension: { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }[file.type] };
  if (typeof createImageBitmap !== 'function') return original;
  let bitmap;
  try { bitmap = await createImageBitmap(file); } catch { return original; }
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) return original;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8));
    if (blob?.type === 'image/webp' && blob.size < file.size) {
      return { file: blob, extension: 'webp' };
    }
    return original;
  } finally {
    bitmap.close?.();
  }
}
