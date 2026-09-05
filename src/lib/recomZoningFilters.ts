export type RecomZoningGroup = 'all' | 'residential' | 'commercial' | 'industrial' | 'other';

export const RECOM_ZONING_CHIP_OPTIONS: {
  id: Exclude<RecomZoningGroup, 'all'>;
  label: string;
}[] = [
  { id: 'residential', label: '주거' },
  { id: 'commercial', label: '상업' },
  { id: 'industrial', label: '공업' },
  { id: 'other', label: '기타' },
];

export function toggleRecomZoningGroup(
  current: RecomZoningGroup,
  next: Exclude<RecomZoningGroup, 'all'>,
): RecomZoningGroup {
  return current === next ? 'all' : next;
}

export function isRecomZoningFilterActive(group: RecomZoningGroup): boolean {
  return group !== 'all';
}

export function formatRecomZoningFilterLabel(group: RecomZoningGroup): string {
  if (group === 'all') return '용도';
  return RECOM_ZONING_CHIP_OPTIONS.find((o) => o.id === group)?.label ?? '용도';
}

export function passesRecomZoningFilter(
  item: { zoningGroup?: string | null },
  group: RecomZoningGroup,
): boolean {
  if (group === 'all') return true;
  return item.zoningGroup === group;
}
