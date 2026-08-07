import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  TUTORIAL_STEPS,
  clampStep,
  isLastStep,
  stepAt,
} from '../engine/tutorial';

interface Props {
  /** Called when the player finishes or skips the walkthrough. */
  onClose: () => void;
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

function measure(anchor?: string): Box | null {
  if (!anchor) return null;
  const el = document.querySelector(`[data-tutorial="${anchor}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export default function TutorialOverlay({ onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const step = stepAt(index);
  const last = isLastStep(index);

  // Track the highlighted element for the current step.
  useEffect(() => {
    const update = () => setBox(measure(step.anchor));
    const el = step.anchor ? document.querySelector(`[data-tutorial="${step.anchor}"]`) : null;
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    update();
    const timer = window.setTimeout(update, 350);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [step.anchor]);

  const next = useCallback(() => {
    setIndex(i => (isLastStep(i) ? i : clampStep(i + 1)));
  }, []);

  const prev = useCallback(() => setIndex(i => clampStep(i - 1)), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, next, prev]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-label="Interactive tutorial"
      style={{ background: 'rgba(28,25,23,0.55)' }}
    >
      {/* Spotlight ring around the highlighted element */}
      {box && (
        <div
          className="pointer-events-none absolute rounded-xl transition-all duration-300"
          style={{
            top: box.top - 6,
            left: box.left - 6,
            width: box.width + 12,
            height: box.height + 12,
            boxShadow: '0 0 0 3px #B8860B, 0 0 0 9999px rgba(28,25,23,0.55)',
          }}
        />
      )}

      {/* Step card */}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6 flex justify-center">
        <div
          className="glass-card p-5 max-w-lg w-full fade-in"
          style={{ background: '#F5F0E8', border: '1px solid rgba(184,134,11,0.35)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#B8860B' }}>
              🎓 Tutorial — Step {index + 1} of {TUTORIAL_STEPS.length}
            </span>
            <button
              onClick={onClose}
              className="text-xs underline"
              style={{ color: '#78716C' }}
              aria-label="Skip tutorial"
            >
              Skip
            </button>
          </div>
          <h3 className="text-lg font-bold mb-1" style={{ color: '#1C1917' }}>{step.title}</h3>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#3D3731' }}>{step.body}</p>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-1">
              {TUTORIAL_STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className="h-1 rounded-full flex-1"
                  style={{ background: i <= index ? '#9E3039' : 'rgba(28,25,23,0.12)' }}
                />
              ))}
            </div>
            <button
              onClick={prev}
              disabled={index === 0}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${index === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
              style={{ background: 'rgba(28,25,23,0.05)', color: '#3D3731' }}
            >
              Back
            </button>
            <button
              onClick={last ? onClose : next}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: '#9E3039', color: '#FFFFFF' }}
            >
              {last ? 'Start Governing' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
