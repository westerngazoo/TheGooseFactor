import {useEffect, useState, type ReactNode} from 'react';
import {translate} from '@docusaurus/Translate';
import {getStoredWeight, setStoredWeight} from '../lib/calories';

/**
 * Compact body-weight input that reads/writes to localStorage so the
 * value is shared across all the apps. Pass `onChange` to react to
 * weight changes within the parent (for live calorie calculations).
 */
export default function BodyWeightInput({
  onChange,
  className,
}: {
  onChange?: (kg: number) => void;
  className?: string;
}): ReactNode {
  const [kg, setKg] = useState<number>(0);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = getStoredWeight();
    setKg(stored);
    setHydrated(true);
    onChange?.(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (v: string) => {
    const n = parseFloat(v) || 0;
    setKg(n);
    setStoredWeight(n);
    onChange?.(n);
  };

  return (
    <label
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.85rem',
      }}
      title={translate({id: 'bodyWeight.title', message: 'Body weight in kg, used for calorie estimates. Saved locally.'})}
    >
      <span style={{opacity: 0.75, fontWeight: 600}}>
        {translate({id: 'bodyWeight.label', message: 'Body weight:'})}
      </span>
      <input
        type="number"
        min={30}
        max={250}
        step={0.5}
        value={hydrated ? kg || '' : ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={translate({id: 'bodyWeight.placeholder', message: 'kg'})}
        style={{
          width: '5rem',
          padding: '0.25rem 0.5rem',
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: '4px',
          fontSize: '0.85rem',
          background: 'var(--ifm-background-color)',
          color: 'var(--ifm-font-color-base)',
        }}
      />
      <span style={{opacity: 0.55}}>{translate({id: 'bodyWeight.unit', message: 'kg'})}</span>
    </label>
  );
}

/** Compact kcal pill for use inline in cards. */
export function KcalBadge({kcal}: {kcal: number}): ReactNode {
  if (!kcal || kcal <= 0) return null;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.1rem 0.4rem',
        borderRadius: '4px',
        background: 'rgba(243, 156, 18, 0.15)',
        color: '#d68910',
        fontFamily: 'var(--ifm-font-family-monospace)',
        fontSize: '0.72rem',
        fontWeight: 700,
      }}
      title={translate({id: 'kcalBadge.title', message: 'Estimated calories burned for one execution at the listed sets×reps.'})}
    >
      ≈ {Math.round(kcal)} kcal
    </span>
  );
}
