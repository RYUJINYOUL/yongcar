/** PNU(19자) → 「동 819-10」 형식 지번 라벨 */
export function formatJibunLabelFromPnu(pnu: string, fallbackAddress?: string | null): string {
  const p = String(pnu || '').trim();
  if (p.length !== 19) return fallbackAddress?.trim() || '';

  const bon = String(Number(p.substring(11, 15)));
  const bub = Number(p.substring(15, 19));
  const jibun = bub > 0 ? `${bon}-${bub}` : bon;

  const addr = String(fallbackAddress || '').trim();
  if (addr) {
    const dongMatch = addr.match(/([가-힣0-9]+(?:동|읍|면|리|가))\s/);
    if (dongMatch) return `${dongMatch[1]} ${jibun}`;
    const tokens = addr.split(/\s+/);
    const dong = tokens.find((t) => /(동|읍|면|리|가)$/.test(t));
    if (dong) return `${dong} ${jibun}`;
  }
  return jibun;
}

/** VWorld addr → 짧은 지번 라벨 (「경기도 평택시 서정동 819-10」 → 「서정동 819-10」) */
export function shortenVworldAddrLabel(addr: string): string {
  const a = String(addr || '').trim();
  if (!a) return '';
  const m = a.match(/([가-힣0-9]+(?:동|읍|면|리|가))\s+([\d-]+(?:번지)?)/);
  if (m) return `${m[1]} ${m[2].replace(/번지$/, '')}`;
  const parts = a.split(/\s+/);
  if (parts.length >= 2) return parts.slice(-2).join(' ');
  return a;
}
