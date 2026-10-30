export function drivePreviewUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com') return null;
    const match = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)\/(?:view|preview)\/?$/);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
  } catch {
    return null;
  }
}
