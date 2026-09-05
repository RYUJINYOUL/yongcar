import { NextResponse } from 'next/server';

// VWorld API(api.vworld.kr)는 해외 IP를 차단함 → 한국 리전(icn1 = 서울) 강제 지정
export const preferredRegion = 'icn1';

function resolveVworldCredentials() {
  const key =
    process.env.VWORLD_KEY?.trim() ||
    process.env.NEXT_PUBLIC_VWORLD_KEY?.trim() ||
    '';
  const domain = process.env.VWORLD_DOMAIN?.trim() || 'www.tamjung.me';
  return { key, domain };
}

function buildVworldUrl(params: {
  vworldKey: string;
  domain: string;
  lat?: string | null;
  lng?: string | null;
  pnu?: string | null;
}) {
  const base = new URL('https://api.vworld.kr/req/data');
  base.searchParams.set('service', 'data');
  base.searchParams.set('request', 'GetFeature');
  base.searchParams.set('data', 'LP_PA_CBND_BUBUN');
  base.searchParams.set('key', params.vworldKey);
  base.searchParams.set('domain', params.domain);
  base.searchParams.set('crs', 'EPSG:4326');
  base.searchParams.set('format', 'json');
  base.searchParams.set('size', '1');
  base.searchParams.set('columns', 'pnu,addr');

  if (params.pnu) {
    base.searchParams.set('attrFilter', `pnu:=:${params.pnu}`);
  } else if (params.lat && params.lng) {
    base.searchParams.set('geomFilter', `POINT(${params.lng} ${params.lat})`);
  }
  return base.toString();
}

function isVworldError(data: unknown): boolean {
  const status = (data as { response?: { status?: string; error?: unknown } })?.response?.status;
  return status === 'ERROR' || !!(data as { response?: { error?: unknown } })?.response?.error;
}

function hasFeatures(data: unknown): boolean {
  const features = (data as {
    response?: { result?: { featureCollection?: { features?: unknown[] } } };
  })?.response?.result?.featureCollection?.features;
  return Array.isArray(features) && features.length > 0;
}

async function fetchTamjungFallback(params: {
  lat?: string | null;
  lng?: string | null;
  pnu?: string | null;
}) {
  const siteBase =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim()?.replace(/\/api\/?$/, '') ||
    'https://www.tamjung.me';

  const url = new URL(`${siteBase.replace(/\/$/, '')}/api/vworld`);
  if (params.pnu) url.searchParams.set('pnu', params.pnu);
  if (params.lat && params.lng) {
    url.searchParams.set('lat', params.lat);
    url.searchParams.set('lng', params.lng);
  }
  if (!url.searchParams.has('lat') && !url.searchParams.has('pnu')) return null;

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return hasFeatures(data) && !isVworldError(data) ? data : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const pnu = searchParams.get('pnu')?.trim();

  if ((!lat || !lng) && !pnu) {
    return NextResponse.json({ error: 'lat/lng or pnu required' }, { status: 400 });
  }

  try {
    const { key, domain } = resolveVworldCredentials();

    let data: unknown = null;

    if (key) {
      const response = await fetch(
        buildVworldUrl({ vworldKey: key, domain, lat, lng, pnu }),
        {
          headers: { Referer: `https://${domain}` },
          cache: 'no-store',
        },
      );

      if (response.ok) {
        data = await response.json();
      }
    }

    if (!data || isVworldError(data) || !hasFeatures(data)) {
      const fallback = await fetchTamjungFallback({ lat, lng, pnu });
      if (fallback) data = fallback;
    }

    if (!data || isVworldError(data)) {
      const errCode = (data as { response?: { error?: { code?: string; text?: string } } })
        ?.response?.error;
      return NextResponse.json(
        {
          error: 'VWorld API request failed',
          code: errCode?.code,
          details: errCode?.text,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('VWorld API proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
