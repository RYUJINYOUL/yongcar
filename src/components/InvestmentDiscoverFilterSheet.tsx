'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import {
  INVESTMENT_PRICE_FILTER_MAX_EOK,
  INVESTMENT_SORT_OPTIONS,
  RECOM_INVESTMENT_MIN_SCORE_PRESETS,
  RECOM_INVESTMENT_MIN_AI_SCORE,
  isInvestmentMinScorePresetActive,
  toggleInvestmentMinScorePreset,
  type InvestmentDiscoverFilters,
  type InvestmentDiscoverSort,
} from '../lib/investmentDiscoverFilters';
import {
  RECOM_ZONING_CHIP_OPTIONS,
} from '../lib/recomZoningFilters';

type Props = {
  open: boolean;
  scrollSection?: string | null;
  filters: InvestmentDiscoverFilters;
  onClose: () => void;
  onApply: (f: InvestmentDiscoverFilters) => void;
};

function SectionHeader({
  title,
  onReset,
}: {
  title: string;
  onReset?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-[15px] font-black text-slate-900">{title}</h4>
      {onReset && (
        <button type="button" className="text-[13px] font-bold text-violet-600" onClick={onReset}>
          초기화
        </button>
      )}
    </div>
  );
}

const DUAL_RANGE_INPUT_CLASS =
  'absolute w-[calc(100%-0.5rem)] left-1 h-10 pointer-events-auto bg-transparent appearance-none cursor-pointer ' +
  '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:bg-transparent ' +
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 ' +
  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:border-2 ' +
  '[&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:mt-[-5px] ' +
  '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:bg-transparent ' +
  '[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full ' +
  '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-slate-900 ' +
  '[&::-moz-range-thumb]:shadow-sm';

function DualRangeRow({
  min,
  max,
  floor,
  ceil,
  step,
  format,
  onChange,
}: {
  min: number;
  max: number;
  floor: number;
  ceil: number;
  step: number;
  format: (n: number) => string;
  onChange: (min: number, max: number) => void;
}) {
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  const span = Math.max(ceil - floor, step);
  const minPct = Math.min(100, Math.max(0, ((min - floor) / span) * 100));
  const maxPct = Math.min(100, Math.max(0, ((max - floor) / span) * 100));
  const midPct = Math.min(98, Math.max(2, (minPct + maxPct) / 2));

  useEffect(() => {
    const end = () => setActiveThumb(null);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, []);

  const handleMinChange = (raw: number) => {
    const clamped = Math.min(raw, max);
    onChange(clamped, max);
  };

  const handleMaxChange = (raw: number) => {
    const clamped = Math.max(raw, min);
    onChange(min, clamped);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold text-slate-400 px-0.5">
        <span>{format(floor)}</span>
        <span>{format(ceil)}</span>
      </div>
      <div className="relative h-10 flex items-center px-1 touch-none">
        <div
          className="absolute left-1 right-1 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-slate-200 pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-slate-800 pointer-events-none"
          aria-hidden
          style={{
            left: `calc(0.25rem + (100% - 0.5rem) * ${minPct / 100})`,
            width: `calc((100% - 0.5rem) * ${Math.max(0, maxPct - minPct) / 100})`,
          }}
        />
        <input
          type="range"
          min={floor}
          max={ceil}
          step={step}
          value={min}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          onPointerDown={() => setActiveThumb('min')}
          className={DUAL_RANGE_INPUT_CLASS}
          style={{
            zIndex: activeThumb === 'min' ? 5 : activeThumb === 'max' ? 1 : 3,
            clipPath: `inset(-4px ${100 - midPct}% -4px 0)`,
          }}
        />
        <input
          type="range"
          min={floor}
          max={ceil}
          step={step}
          value={max}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          onPointerDown={() => setActiveThumb('max')}
          className={DUAL_RANGE_INPUT_CLASS}
          style={{
            zIndex: activeThumb === 'max' ? 5 : activeThumb === 'min' ? 1 : 4,
            clipPath: `inset(-4px 0 -4px ${midPct}%)`,
          }}
        />
      </div>
      <p className="text-center text-xs font-bold text-slate-700">
        {format(min)} ~ {format(max)}
      </p>
    </div>
  );
}

export default function InvestmentDiscoverFilterSheet({
  open,
  scrollSection,
  filters,
  onClose,
  onApply,
}: Props) {
  const [draft, setDraft] = useState(filters);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  useEffect(() => {
    if (!open || !scrollSection || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-section="${scrollSection}"]`);
    if (el instanceof HTMLElement) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [open, scrollSection]);

  if (!open || typeof document === 'undefined') return null;

  const apply = () => {
    onApply(draft);
    onClose();
  };

  const formatPrice = (n: number) => (
    n >= INVESTMENT_PRICE_FILTER_MAX_EOK ? '최대' : `${n}억`
  );

  const content = (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="닫기" onClick={onClose} />
      <div
        ref={scrollRef}
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 pb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-900">매물 필터</h3>
          <button type="button" onClick={onClose} className="text-slate-400 text-sm font-bold">닫기</button>
        </div>

        <section className="mb-8" data-section="price">
          <SectionHeader
            title="가격"
            onReset={() => setDraft((d) => ({
              ...d,
              priceMinEok: 0,
              priceMaxEok: INVESTMENT_PRICE_FILTER_MAX_EOK,
            }))}
          />
          <p className="text-[10px] text-slate-500 mb-3">제시가 기준 · 가격 없는 매물 제외</p>
          <DualRangeRow
            floor={0}
            ceil={INVESTMENT_PRICE_FILTER_MAX_EOK}
            step={1}
            min={draft.priceMinEok}
            max={draft.priceMaxEok}
            format={formatPrice}
            onChange={(priceMinEok, priceMaxEok) => setDraft((d) => ({
              ...d,
              priceMinEok,
              priceMaxEok: priceMaxEok >= INVESTMENT_PRICE_FILTER_MAX_EOK
                ? INVESTMENT_PRICE_FILTER_MAX_EOK
                : priceMaxEok,
            }))}
          />
        </section>

        <section className="mb-8" data-section="zoning">
          <SectionHeader
            title="용도"
            onReset={() => setDraft((d) => ({ ...d, zoningGroup: 'all' }))}
          />
          <div className="flex flex-wrap gap-2">
            {RECOM_ZONING_CHIP_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDraft((d) => ({
                  ...d,
                  zoningGroup: d.zoningGroup === opt.id ? 'all' : opt.id,
                }))}
                className={`px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-colors ${
                  draft.zoningGroup === opt.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-800 border-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {RECOM_INVESTMENT_MIN_SCORE_PRESETS.length > 0 && (
          <section className="mb-8" data-section="ai">
            <SectionHeader
              title="AI 점수"
              onReset={() => setDraft((d) => ({ ...d, minAiScore: null, maxAiScore: null }))}
            />
            <div className="flex flex-wrap gap-1.5 mb-3">
              {RECOM_INVESTMENT_MIN_SCORE_PRESETS.map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setDraft((d) => toggleInvestmentMinScorePreset(d, score))}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    isInvestmentMinScorePresetActive(draft, score)
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {score}점 이상
                </button>
              ))}
            </div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">최소 AI 점수 (슬라이더)</label>
            <input
              type="range"
              min={RECOM_INVESTMENT_MIN_AI_SCORE}
              max={100}
              step={5}
              value={draft.minAiScore ?? RECOM_INVESTMENT_MIN_AI_SCORE}
              className="w-full accent-slate-900"
              onChange={(e) => {
                const v = Number(e.target.value);
                setDraft((d) => ({
                  ...d,
                  minAiScore: v < RECOM_INVESTMENT_MIN_AI_SCORE ? null : v,
                }));
              }}
            />
            <p className="text-xs font-bold text-slate-700 mt-1">
              {draft.minAiScore != null && draft.minAiScore >= RECOM_INVESTMENT_MIN_AI_SCORE
                ? `${draft.minAiScore}점 이상`
                : `${RECOM_INVESTMENT_MIN_AI_SCORE}점 이상 (기본)`}
            </p>
          </section>
        )}

        <section className="mb-8" data-section="sort">
          <SectionHeader title="정렬" />
          <div className="flex flex-wrap gap-2">
            {INVESTMENT_SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, sortBy: opt.id as InvestmentDiscoverSort }))}
                className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                  draft.sortBy === opt.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={apply}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm"
        >
          적용
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
