import React from 'react';
import { FolderArchive, Trash2, ArrowRight, Printer, Copy, Check } from 'lucide-react';
import { ApologyLetter } from '../types';

interface DossierViewProps {
  savedLetters: ApologyLetter[];
  onSelectLetter: (letter: ApologyLetter) => void;
  onDeleteLetter: (id: string) => void;
  onClearAll: () => void;
}

export const DossierView: React.FC<DossierViewProps> = ({
  savedLetters,
  onSelectLetter,
  onDeleteLetter,
  onClearAll,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (letter: ApologyLetter) => {
    const formatted = `${letter.title.toUpperCase()}\n\n${letter.salutation}\n\n${letter.content}\n\n${letter.valediction}\n${letter.signOff}\n\n${letter.postScript}`;
    navigator.clipboard.writeText(formatted);
    setCopiedId(letter.id || 'current');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-6 border-b border-stone-200 dark:border-stone-800 gap-4">
        <div>
          <div className="text-xs tracking-widest uppercase font-mono text-stone-600 dark:text-stone-400 mb-1">
            Archival Repository
          </div>
          <h2 className="text-3xl font-serif-cormorant font-bold text-stone-900 dark:text-stone-100">
            Personal Dossier of Regrets
          </h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Stored letters and confidential apologies crafted during this session.
          </p>
        </div>

        {savedLetters.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1 font-mono self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge All Records</span>
          </button>
        )}
      </div>

      {savedLetters.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-8">
          <FolderArchive className="w-12 h-12 text-stone-400 mx-auto mb-3 stroke-[1.2]" />
          <h3 className="text-lg font-serif-cormorant font-bold text-stone-800 dark:text-stone-200">
            Your Dossier is Pure & Unblemished
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
            No apologies have been archived yet. Click "Archive" on any crafted letter to preserve it
            in your permanent hall of contrition.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedLetters.map((letter) => (
            <div
              key={letter.id || Math.random().toString()}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs hover:border-amber-700/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-stone-600 dark:text-stone-400 mb-2">
                  <span>
                    {letter.timestamp
                      ? new Date(letter.timestamp).toLocaleDateString()
                      : 'RECENT ENTRY'}
                  </span>
                  <span>· {letter.recipient || 'Personal'}</span>
                </div>

                <h3 className="text-xl font-serif-cormorant font-bold text-stone-900 dark:text-stone-100 mb-2">
                  {letter.title}
                </h3>

                <p className="text-xs font-serif-cormorant italic text-stone-600 dark:text-stone-400 mb-3">
                  "{letter.absurdityQuote || letter.salutation}"
                </p>

                <p className="text-xs text-stone-700 dark:text-stone-300 line-clamp-3 leading-relaxed font-serif-cormorant">
                  {letter.content}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(letter)}
                    className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs flex items-center gap-1"
                    title="Copy text"
                  >
                    {copiedId === letter.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {letter.id && (
                    <button
                      type="button"
                      onClick={() => onDeleteLetter(letter.id!)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectLetter(letter)}
                  className="px-3.5 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1"
                >
                  <span>Open in Parchment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
