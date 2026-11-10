import React from 'react';
import { BookOpen, ArrowRight, Quote } from 'lucide-react';
import { APOLOGY_PRESETS } from '../data/presets';
import { ApologyLetter, ApologyPreset } from '../types';

interface PresetsGalleryProps {
  onLoadPreset: (preset: ApologyPreset) => void;
}

export const PresetsGallery: React.FC<PresetsGalleryProps> = ({
  onLoadPreset,
}) => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="text-xs tracking-widest uppercase font-mono text-stone-600 dark:text-stone-400 mb-2">
          Archival Letter examples
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif-cormorant font-bold text-stone-900 dark:text-stone-100">
          Celebrated Transgressions & Epistles
        </h2>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          Explore exemplary apologies from history and modernity. Load any
          masterpiece into the composer to customize names, details, or dramatic
          dials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {APOLOGY_PRESETS.map((preset) => (
          <div
            key={preset.id}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-7 shadow-xs hover:border-amber-800/40 dark:hover:border-amber-600/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-stone-600 dark:text-stone-400 mb-2">
                <span className="uppercase tracking-wider">
                  {preset.relationship}
                </span>
                <span>· Contrition Level {preset.dramaLevel}/5</span>
              </div>

              <h3 className="text-xl font-serif-cormorant font-bold text-stone-900 dark:text-stone-100 mb-1">
                {preset.name}
              </h3>
              <p className="text-xs text-amber-900 dark:text-amber-300 font-medium mb-3">
                "{preset.tagline}"
              </p>

              <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-100 dark:border-stone-800 mb-4">
                <p className="text-xs text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider mb-1">
                  The Crime:
                </p>
                <p className="text-sm text-stone-800 dark:text-stone-200 italic">
                  "{preset.transgression}"
                </p>
              </div>

              <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400 font-serif-cormorant text-stone-700 dark:text-stone-300 line-clamp-3 italic">
                "{preset.sampleLetter.content.slice(0, 220)}…"
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs font-mono text-stone-600 dark:text-stone-400">
                To: {preset.recipient.split(',')[0]}
              </span>
              <button
                type="button"
                onClick={() => onLoadPreset(preset)}
                className="px-4 py-2 text-xs font-medium text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center gap-1.5"
              >
                <span>Load into Composer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
