import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowRight, RefreshCw, Check } from 'lucide-react';
import { ApologyTone, ExcuseItem } from '../types';
import { QUICK_FAUX_PAS, TONE_DETAILS } from '../data/presets';

interface ExcuseLabProps {
  onSelectExcuse?: (excuse: string) => void;
  currentTransgression?: string;
  currentTone?: ApologyTone;
}

export const ExcuseLab: React.FC<ExcuseLabProps> = ({
  onSelectExcuse,
  currentTransgression = '',
  currentTone = 'victorian',
}) => {
  const [transgression, setTransgression] = useState(
    currentTransgression || 'Ate the clearly labeled leftovers in the fridge at 2 AM'
  );
  const [tone, setTone] = useState<ApologyTone>(currentTone);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [excuses, setExcuses] = useState<ExcuseItem[]>([
    {
      title: 'The Nocturnal Sleepwalking Hypoglycemia',
      description:
        'My conscious soul was dormant; an autonomous calorie-seeking goblin hijacked my motor functions under the biological duress of low blood sugar.',
    },
    {
      title: 'The Rogue Barometric Pressure Drop',
      description:
        'A sudden shift in atmospheric pressure created a miniature domestic vortex that practically drafted the curry vapors directly into my gullet.',
    },
    {
      title: 'Extraterrestrial Telepathic Compulsion',
      description:
        'A celestial intelligence beamed microwave frequencies into my dental fillings, asserting that your leftover rice would prevent a gamma-ray burst.',
    },
    {
      title: 'Temporary Amnesia Induced by Fluorescent Light',
      description:
        'The harsh hum of the kitchen bulb erased all human literacy, temporarily rendering the label "DO NOT EAT" as an ancient Nordic welcome chant.',
    },
  ]);

  const handleGenerate = async () => {
    if (!transgression.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/apology/excuse-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transgression, tone }),
      });
      const data = await res.json();
      if (data.success && data.excuses?.length > 0) {
        setExcuses(data.excuses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="text-xs tracking-widest uppercase font-mono text-stone-500 mb-2">
          Mea Culpa Research Division
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif-cormorant font-bold text-stone-900 dark:text-stone-100">
          The Absurd Excuse Laboratory
        </h2>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          When the cold truth is too damning, consult our satirical defense generator for
          elaborately unconvincing yet hilarious mitigating circumstances.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-xs mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              The Transgression to Justify
            </label>
            <input
              type="text"
              value={transgression}
              onChange={(e) => setTransgression(e.target.value)}
              placeholder="e.g. Broke their vintage mug, forgot partner's birthday..."
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-800/40"
            />
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="text-xs text-stone-600 dark:text-stone-400 self-center mr-1">
                Presets:
              </span>
              {QUICK_FAUX_PAS.slice(0, 4).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTransgression(item)}
                  className="text-xs px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors whitespace-nowrap"
                >
                  {item.length > 35 ? item.slice(0, 35) + '…' : item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Defense Tone Flavor
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as ApologyTone)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden"
              >
                {Object.entries(TONE_DETAILS).map(([k, val]) => (
                  <option key={k} value={k}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !transgression.trim()}
                className="w-full py-2.5 px-4 bg-amber-900 dark:bg-amber-800 text-amber-50 font-medium text-sm rounded-lg hover:bg-amber-800 dark:hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Concocting Defenses…</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Synthesize 4 Excuses</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Excuses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {excuses.map((exc, index) => (
          <div
            key={index}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 hover:border-amber-700/40 dark:hover:border-amber-600/40 transition-all flex flex-col justify-between group shadow-xs"
          >
            <div>
              <div className="text-xs font-mono text-stone-600 dark:text-stone-400 mb-1.5 flex items-center justify-between">
                <span>EXCUSE № {index + 1}</span>
                <span className="text-stone-600 dark:text-stone-400">· Mitigating Defense</span>
              </div>
              <h3 className="text-base font-serif-cormorant font-bold text-stone-900 dark:text-stone-100 mb-2">
                {exc.title}
              </h3>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
                "{exc.description}"
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(exc.description);
                  setCopiedIndex(index);
                  setTimeout(() => setCopiedIndex(null), 2000);
                }}
                className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors flex items-center gap-1"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <span>Copy text</span>
                )}
              </button>

              {onSelectExcuse && (
                <button
                  type="button"
                  onClick={() => onSelectExcuse(exc.description)}
                  className="text-xs font-medium text-amber-900 dark:text-amber-300 hover:underline flex items-center gap-1"
                >
                  <span>Insert into Letter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
