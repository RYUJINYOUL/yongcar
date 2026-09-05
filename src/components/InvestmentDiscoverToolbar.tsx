'use client';

import {
  type InvestmentDiscoverFilters,
  formatInvestmentPriceFilterLabel,
  formatInvestmentSortLabel,
  isInvestmentPriceFilterActive,
} from '../lib/investmentDiscoverFilters';
import {
  RECOM_ZONING_CHIP_OPTIONS,
  formatRecomZoningFilterLabel,
  isRecomZoningFilterActive,
  toggleRecomZoningGroup,
} from '../lib/recomZoningFilters';

type Props = {
  filters: InvestmentDiscoverFilters;
  onOpenSheet: (section?: string) => void;
  onApply: (f: InvestmentDiscoverFilters) => void;
  comfortable?: boolean;
};

function pill(active: boolean, comfortable?: boolean) {
  return [
    'shrink-0 inline-flex items-center gap-0.5 font-bold border transition-all',
    comfortable ? 'px-3.5 py-2.5 rounded-xl text-[12px] gap-1' : 'px-2 py-1 rounded-lg text-[10px]',
    active
      ? 'bg-slate-100 border-slate-300 text-slate-900'
      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300',
  ].join(' ');
}

function zoningPill(active: boolean, comfortable?: boolean) {
  return [
    'shrink-0 font-bold border transition-all',
    comfortable ? 'px-3.5 py-2.5 rounded-xl text-[12px]' : 'px-2 py-1 rounded-lg text-[10px]',
    active
      ? 'bg-slate-900 border-slate-900 text-white'
      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300',
  ].join(' ');
}

function Chevron() {
  return (
    <svg className="w-2.5 h-2.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

const SHEET_CHIPS: {
  section: string;
  label: (f: InvestmentDiscoverFilters) => string;
  active: (f: InvestmentDiscoverFilters) => boolean;
}[] = [
  {
    section: 'price',
    label: (f) => formatInvestmentPriceFilterLabel(f.priceMinEok, f.priceMaxEok),
    active: (f) => isInvestmentPriceFilterActive(f.priceMinEok, f.priceMaxEok),
  },
  {
    section: 'zoning',
    label: (f) => formatRecomZoningFilterLabel(f.zoningGroup),
    active: (f) => isRecomZoningFilterActive(f.zoningGroup),
  },
  {
    section: 'sort',
    label: (f) => formatInvestmentSortLabel(f.sortBy),
    active: (f) => f.sortBy !== 'recent',
  },
];

export default function InvestmentDiscoverToolbar({
  filters,
  onOpenSheet,
  onApply,
  comfortable = false,
}: Props) {
  const chipGap = comfortable ? 'gap-2' : 'gap-1';
  const rowGap = comfortable ? 'space-y-3' : 'space-y-1.5';

  return (
    <div className={rowGap}>
      <div className={`flex items-center flex-wrap ${chipGap} pb-0.5 -mx-0.5 px-0.5`}>
        {SHEET_CHIPS.map((c) => (
          <button
            key={c.section}
            type="button"
            className={pill(c.active(filters), comfortable)}
            onClick={() => onOpenSheet(c.section)}
          >
            {c.label(filters)}
            <Chevron />
          </button>
        ))}
      </div>
      <div className={`flex items-center flex-wrap ${chipGap} pb-0.5 -mx-0.5 px-0.5`}>
        {RECOM_ZONING_CHIP_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={zoningPill(filters.zoningGroup === opt.id, comfortable)}
            onClick={() => onApply({
              ...filters,
              zoningGroup: toggleRecomZoningGroup(filters.zoningGroup, opt.id),
            })}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
