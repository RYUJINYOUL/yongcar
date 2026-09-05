import {
  parseParcelFeatureFromVworldResponse,
  type LatLngPoint,
  computePolygonCentroid,
} from './parcelGeometry';
import { formatJibunLabelFromPnu, shortenVworldAddrLabel } from './pnuLabel';

export type ParcelBoundary = {
  pnu: string | null;
  label: string;
  polygon: LatLngPoint[];
  isPrimary: boolean;
};

async function fetchVworldParcel(query: string): Promise<unknown | null> {
  try {
    const res = await fetch(`/api/vworld?${query}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchParcelBoundaryByCoords(
  lat: number,
  lng: number,
  options?: { fallbackAddress?: string | null; isPrimary?: boolean },
): Promise<ParcelBoundary | null> {
  const data = await fetchVworldParcel(`lat=${lat}&lng=${lng}`);
  const parsed = parseParcelFeatureFromVworldResponse(data);
  if (!parsed) return null;

  const label = parsed.addr
    ? shortenVworldAddrLabel(parsed.addr)
    : formatJibunLabelFromPnu(parsed.pnu || '', options?.fallbackAddress);

  return {
    pnu: parsed.pnu,
    label: label || options?.fallbackAddress || '필지',
    polygon: parsed.polygon,
    isPrimary: options?.isPrimary ?? true,
  };
}

export async function fetchParcelBoundaryByPnu(
  pnu: string,
  options?: { fallbackAddress?: string | null; lat?: number; lng?: number; isPrimary?: boolean },
): Promise<ParcelBoundary | null> {
  const queryParts = [`pnu=${encodeURIComponent(pnu)}`];
  if (options?.lat != null && options?.lng != null) {
    queryParts.push(`lat=${options.lat}`, `lng=${options.lng}`);
  }
  const data = await fetchVworldParcel(queryParts.join('&'));
  let parsed = parseParcelFeatureFromVworldResponse(data);

  if (!parsed && options?.lat != null && options?.lng != null) {
    return fetchParcelBoundaryByCoords(options.lat, options.lng, {
      fallbackAddress: options.fallbackAddress,
      isPrimary: options.isPrimary,
    });
  }
  if (!parsed) return null;

  const label = parsed.addr
    ? shortenVworldAddrLabel(parsed.addr)
    : formatJibunLabelFromPnu(pnu, options?.fallbackAddress);

  return {
    pnu,
    label: label || formatJibunLabelFromPnu(pnu, options?.fallbackAddress) || '필지',
    polygon: parsed.polygon,
    isPrimary: options?.isPrimary ?? true,
  };
}

export async function fetchParcelBoundaries(
  sources: {
    pnu?: string | null;
    lat?: number | null;
    lng?: number | null;
    label?: string | null;
    isPrimary?: boolean;
  }[],
  fallbackAddress?: string | null,
): Promise<ParcelBoundary[]> {
  const results: ParcelBoundary[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];
    const pnu = String(src.pnu || '').trim();
    const lat = src.lat != null ? Number(src.lat) : NaN;
    const lng = src.lng != null ? Number(src.lng) : NaN;
    const isPrimary = src.isPrimary ?? i === 0;

    let boundary: ParcelBoundary | null = null;
    if (pnu.length === 19) {
      if (seen.has(pnu)) continue;
      seen.add(pnu);
      boundary = await fetchParcelBoundaryByPnu(pnu, {
        fallbackAddress: src.label || fallbackAddress,
        lat: Number.isFinite(lat) ? lat : undefined,
        lng: Number.isFinite(lng) ? lng : undefined,
        isPrimary,
      });
    } else if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      boundary = await fetchParcelBoundaryByCoords(lat, lng, {
        fallbackAddress: src.label || fallbackAddress,
        isPrimary,
      });
    }

    if (boundary) results.push(boundary);
  }

  return results;
}

export function parcelBoundaryCentroid(boundary: ParcelBoundary) {
  return computePolygonCentroid(boundary.polygon);
}
