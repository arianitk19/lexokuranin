/* ==========================================================================
   Sharing — plain text, native share sheet, and a rendered share card.
   ========================================================================== */

import { reference, surahInfo } from './quran.js';
import { t } from './i18n.js';

const SITE = location.origin + location.pathname.replace(/index\.html?$/, '');

export function ayahLink(s, a) {
  const info = surahInfo(s);
  return `${SITE}#/surah/${info?.slug || s}/${a}`;
}

/** The canonical shareable text block for an ayah. */
export function ayahText(ayah, { includeEn = false, includeLink = true } = {}) {
  const lines = [ayah.ar, '', ayah.sq];
  if (includeEn && ayah.en) lines.push('', ayah.en);
  lines.push('', `— ${reference(ayah.s, ayah.a)}`);
  if (includeLink) lines.push('', ayahLink(ayah.s, ayah.a));
  return lines.join('\n');
}

export function canNativeShare() {
  return typeof navigator.share === 'function';
}

export async function nativeShare(ayah) {
  if (!canNativeShare()) return false;
  try {
    await navigator.share({
      title: `${t('brand')} · ${reference(ayah.s, ayah.a)}`,
      text: ayahText(ayah, { includeLink: false }),
      url: ayahLink(ayah.s, ayah.a),
    });
    return true;
  } catch (err) {
    return err?.name === 'AbortError' ? true : false;
  }
}

/** Share a rendered card through the native sheet when the platform allows files. */
export async function nativeShareImage(blob, ayah) {
  if (!canNativeShare() || !navigator.canShare) return false;
  const file = new File([blob], `lexo-kuran-${ayah.s}-${ayah.a}.png`, { type: 'image/png' });
  if (!navigator.canShare({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file], title: `${t('brand')} · ${reference(ayah.s, ayah.a)}` });
    return true;
  } catch (err) {
    return err?.name === 'AbortError';
  }
}

export const shareTargets = (ayah) => {
  const text = encodeURIComponent(ayahText(ayah, { includeLink: false }));
  const url = encodeURIComponent(ayahLink(ayah.s, ayah.a));
  return {
    whatsapp: `https://wa.me/?text=${text}%0A%0A${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    telegram: `https://t.me/share/url?url=${url}&text=${text}`,
  };
};

/* ---------------------------------------------------------------- the card */

const CARD_THEMES = {
  night: { bg: '#0c0f11', panel: '#131819', ar: '#f7f4ed', tr: '#c3cac5', ref: '#dcb176', rule: 'rgba(220,177,118,.45)', brand: 'rgba(247,244,237,.4)', arch: '#1d5f49' },
  ivory: { bg: '#f7f4ed', panel: '#ffffff', ar: '#131819', tr: '#4e5956', ref: '#8a5b24', rule: 'rgba(138,91,36,.4)', brand: 'rgba(19,24,25,.38)', arch: '#d8e5de' },
  green: { bg: '#0d3a2c', panel: '#0f4534', ar: '#f4f9f6', tr: '#b7d4c8', ref: '#e0b87e', rule: 'rgba(224,184,126,.45)', brand: 'rgba(244,249,246,.4)', arch: '#146b50' },
};

export const CARD_STYLES = Object.keys(CARD_THEMES);

function wrap(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? line + ' ' + w : w;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Render a share card to a canvas.
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderCard(ayah, { style = 'night', size = 1080, includeEn = false } = {}) {
  const c = CARD_THEMES[style] || CARD_THEMES.night;
  const W = size;
  const H = Math.round(size * 1.25);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Make sure the Arabic face is loaded before measuring.
  try { await document.fonts?.load(`${Math.round(W * 0.052)}px "Amiri Quran"`); } catch { /* optional */ }
  try { await document.fonts?.load(`600 ${Math.round(W * 0.028)}px Inter`); } catch { /* optional */ }

  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);

  // Arch motif, very low contrast.
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = c.arch;
  const aw = W * 0.62, ax = (W - aw) / 2, ab = H * 0.94, at = H * 0.16;
  ctx.beginPath();
  ctx.moveTo(ax, ab);
  ctx.lineTo(ax, at + aw * 0.42);
  ctx.quadraticCurveTo(ax + aw * 0.1, at, W / 2, at - aw * 0.06);
  ctx.quadraticCurveTo(ax + aw * 0.9, at, ax + aw, at + aw * 0.42);
  ctx.lineTo(ax + aw, ab);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const pad = W * 0.11;
  const maxW = W - pad * 2;
  const blocks = [];

  // Arabic
  const arSize = Math.round(W * (ayah.ar.length > 220 ? 0.038 : ayah.ar.length > 120 ? 0.046 : 0.056));
  ctx.font = `${arSize}px "Amiri Quran", "Scheherazade New", serif`;
  ctx.direction = 'rtl';
  const arLines = wrap(ctx, ayah.ar, maxW);
  blocks.push({ lines: arLines, size: arSize, lh: arSize * 1.85, color: c.ar, font: ctx.font, dir: 'rtl' });

  // Translation
  const trSize = Math.round(W * 0.029);
  ctx.direction = 'ltr';
  ctx.font = `400 ${trSize}px Inter, system-ui, sans-serif`;
  const trLines = wrap(ctx, ayah.sq, maxW);
  blocks.push({ gap: W * 0.075, lines: trLines, size: trSize, lh: trSize * 1.62, color: c.tr, font: ctx.font, dir: 'ltr' });

  if (includeEn && ayah.en) {
    const enSize = Math.round(W * 0.024);
    ctx.font = `400 ${enSize}px Inter, system-ui, sans-serif`;
    blocks.push({ gap: W * 0.035, lines: wrap(ctx, ayah.en, maxW), size: enSize, lh: enSize * 1.6, color: c.tr, font: ctx.font, dir: 'ltr' });
  }

  // Layout: centre the whole stack vertically.
  const ruleGap = W * 0.06;
  const refSize = Math.round(W * 0.026);
  const totalH = blocks.reduce((sum, b) => sum + (b.gap || 0) + b.lines.length * b.lh, 0) + ruleGap * 2 + refSize * 1.6;
  let y = (H - totalH) / 2 + blocks[0].lh * 0.78;

  ctx.textAlign = 'center';
  for (const b of blocks) {
    y += b.gap || 0;
    ctx.font = b.font;
    ctx.fillStyle = b.color;
    ctx.direction = b.dir;
    for (const line of b.lines) {
      ctx.fillText(line, W / 2, y);
      y += b.lh;
    }
  }

  // Rule + reference
  y += ruleGap * 0.4;
  ctx.direction = 'ltr';
  ctx.strokeStyle = c.rule;
  ctx.lineWidth = Math.max(1, W * 0.0016);
  ctx.beginPath();
  ctx.moveTo(W / 2 - W * 0.042, y);
  ctx.lineTo(W / 2 + W * 0.042, y);
  ctx.stroke();

  y += ruleGap * 0.9;
  ctx.font = `700 ${refSize}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = c.ref;
  ctx.fillText(reference(ayah.s, ayah.a), W / 2, y);

  // Restrained brand line — small, bottom, never a watermark over the text.
  const bSize = Math.round(W * 0.019);
  ctx.font = `700 ${bSize}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = c.brand;
  ctx.letterSpacing = `${Math.round(W * 0.006)}px`;
  ctx.fillText('LEXO KURAN', W / 2, H - pad * 0.62);
  ctx.letterSpacing = '0px';

  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.96));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
