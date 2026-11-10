import React, { useState, useEffect } from 'react';
import {
  Copy,
  Printer,
  Download,
  Volume2,
  VolumeX,
  BookmarkCheck,
  Bookmark,
  Sparkles,
  Wand2,
  Edit3,
  Check,
  Send,
  Mail,
  FileText,
  Loader2,
} from 'lucide-react';
import { ApologyLetter } from '../types';
import waxSealImage from '../assets/images/wax_seal_insignia_1793744474248.jpg';

interface LetterParchmentProps {
  letter: ApologyLetter;
  onUpdateLetter: (updated: ApologyLetter) => void;
  onRefine: (instruction: string) => Promise<void>;
  isRefining: boolean;
  onSaveToDossier: (letter: ApologyLetter) => void;
  isSaved: boolean;
}

export const LetterParchment: React.FC<LetterParchmentProps> = ({
  letter,
  onUpdateLetter,
  onRefine,
  isRefining,
  onSaveToDossier,
  isSaved,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableLetter, setEditableLetter] = useState<ApologyLetter>(letter);
  const [copied, setCopied] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isEnvelopeView, setIsEnvelopeView] = useState(false);
  const [customRefineText, setCustomRefineText] = useState('');

  useEffect(() => {
    setEditableLetter(letter);
  }, [letter]);

  // Audio Speech Synthesis
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleReadAloud = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    window.speechSynthesis.cancel();
    const fullText = `${letter.title}. ${letter.salutation}. ${letter.content}. ${letter.valediction}, ${letter.signOff}. ${letter.postScript}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.92; // Slightly deliberate, dramatic cadence
    utterance.pitch = 0.98;

    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    setIsReading(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    const formatted = `${letter.title.toUpperCase()}\n\n${letter.salutation}\n\n${letter.content}\n\n${letter.valediction}\n${letter.signOff}\n\n${letter.postScript}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const formatted = `=== MEA CULPA BUREAU OFFICIAL EPISTLE ===\n\n${letter.title}\n\n${letter.salutation}\n\n${letter.content}\n\n${letter.valediction}\n${letter.signOff}\n\n${letter.postScript}\n\n=========================================\nCrafted at the Mea Culpa Apology Bureau`;
    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${letter.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveEdits = () => {
    onUpdateLetter(editableLetter);
    setIsEditing(false);
  };

  const refineSuggestions = [
    'Turn drama up +30% (more theatrical)',
    'Sound like an apologetic corporate PR memo',
    'Add an absurd excuse about quantum physics',
    'Make it 19th-century gothic Victorian',
    'Condense into a punchy short apology text',
    'Add an extravagant peace offering / bribe',
  ];

  return (
    <div className="w-full">
      {/* Top Utility Ribbon */}
      <div className="no-print bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEnvelopeView(!isEnvelopeView)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              isEnvelopeView
                ? 'bg-amber-900 text-amber-50'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {isEnvelopeView ? <FileText className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
            <span>{isEnvelopeView ? 'Read Parchment' : 'View Envelope'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                handleSaveEdits();
              } else {
                setIsEditing(true);
              }
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              isEditing
                ? 'bg-emerald-800 text-emerald-50'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Save Changes' : 'Edit Text In-Place'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Read Aloud */}
          <button
            type="button"
            onClick={handleToggleReadAloud}
            title={isReading ? 'Silence Narration' : 'Dramatic Dramatic Read Aloud'}
            className={`p-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              isReading
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isReading ? 'Silence' : 'Recite'}</span>
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Copy letter to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Print or export as PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Download text file"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Save .txt</span>
          </button>

          {/* Save to Dossier */}
          <button
            type="button"
            onClick={() => onSaveToDossier(letter)}
            className={`p-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              isSaved
                ? 'text-amber-800 dark:text-amber-300'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title="Store in personal Dossier"
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSaved ? 'Archived' : 'Archive'}</span>
          </button>
        </div>
      </div>

      {/* Main Display: Envelope View vs. Tactile Parchment Sheet */}
      {isEnvelopeView ? (
        <div className="bg-[#e8dec8] dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-2xl p-8 sm:p-12 shadow-md relative overflow-hidden transition-all">
          <div className="max-w-md mx-auto aspect-[16/10] bg-[#f4ecd8] dark:bg-stone-800/90 rounded-xl border-2 border-stone-300 dark:border-stone-700 p-6 sm:p-8 flex flex-col justify-between shadow-inner relative">
            {/* Postal Stamp */}
            <div className="absolute top-4 right-4 w-16 h-20 border-2 border-dashed border-amber-900/40 dark:border-amber-400/40 bg-amber-50 dark:bg-stone-900/80 p-1 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-mono tracking-tighter uppercase text-amber-900 dark:text-amber-300 font-bold">
                MEA CULPA
              </span>
              <span className="text-[14px] font-serif-cormorant font-bold text-amber-950 dark:text-amber-100">
                00¢
              </span>
              <span className="text-[8px] font-mono text-stone-500 uppercase">PENANCE</span>
            </div>

            {/* Return Address */}
            <div className="text-[11px] font-mono text-stone-600 dark:text-stone-400 leading-snug">
              <p className="font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                Bureau of Epistolary Regret
              </p>
              <p>Chamber of Remorse, Suite 404</p>
              <p>c/o {letter.signOff || 'The Penitent Mortals'}</p>
            </div>

            {/* Recipient Calligraphy */}
            <div className="my-auto text-center py-4 px-2">
              <p className="text-xs uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 mb-1">
                DELIVER WITH EXPEDIENCE TO:
              </p>
              <h3 className="text-xl sm:text-2xl font-serif-cormorant font-bold text-stone-900 dark:text-stone-100 italic">
                {letter.salutation.replace(/^(To|Dear)\s+/i, '').replace(/,\s*$/, '') ||
                  'The Wronged Party'}
              </h3>
              <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-1">
                Sole Recipient & Supreme Arbiter of Forgiveness
              </p>
            </div>

            {/* Wax Seal Stamped on Center-Bottom */}
            <div className="flex items-center justify-center -mb-4">
              <button
                type="button"
                onClick={() => setIsEnvelopeView(false)}
                className="group relative focus:outline-hidden"
                title="Break seal and open letter"
              >
                <img
                  src={waxSealImage}
                  alt="Crimson Wax Seal"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-lg group-hover:scale-105 transition-transform cursor-pointer border border-amber-900/30"
                />
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-wider text-amber-950 dark:text-amber-200 whitespace-nowrap bg-amber-100/90 dark:bg-stone-900 px-2 py-0.5 rounded shadow-xs">
                  Click to Break Seal
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* The Parchment Sheet */
        <article
          className="parchment-sheet bg-[#fbf9f4] dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800 rounded-xl p-8 sm:p-14 shadow-lg relative transition-all"
          style={{
            backgroundImage:
              'radial-gradient(#e7dec8 0.75px, transparent 0.75px), radial-gradient(#e7dec8 0.75px, #fbf9f4 0.75px)',
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px',
          }}
        >
          {/* Deckled Edge Framing Line */}
          <div className="border border-stone-300/80 dark:border-stone-700/80 p-6 sm:p-10 relative">
            {/* Archival Case Registry Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-500 dark:text-stone-400 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-widest text-amber-900 dark:text-amber-400">
                  MEA CULPA ARCHIVES
                </span>
                <span>·</span>
                <span>DISPATCH #{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="text-stone-600 dark:text-stone-400">
                DATE: {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}
              </div>
            </div>

            {/* Letter Title */}
            <div className="text-center mb-8">
              {isEditing ? (
                <input
                  type="text"
                  value={editableLetter.title}
                  onChange={(e) =>
                    setEditableLetter({ ...editableLetter, title: e.target.value })
                  }
                  className="w-full text-center text-xl sm:text-2xl font-serif-cormorant font-bold border-b border-amber-800 bg-transparent px-2 py-1 text-stone-900 dark:text-stone-100"
                />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-serif-cormorant font-bold tracking-tight text-stone-900 dark:text-stone-100">
                  {letter.title}
                </h1>
              )}

              {letter.absurdityQuote && !isEditing && (
                <p className="mt-2 text-xs sm:text-sm font-serif-cormorant italic text-stone-600 dark:text-stone-400">
                  "{letter.absurdityQuote}"
                </p>
              )}
            </div>

            {/* Salutation */}
            <div className="mb-6">
              {isEditing ? (
                <input
                  type="text"
                  value={editableLetter.salutation}
                  onChange={(e) =>
                    setEditableLetter({ ...editableLetter, salutation: e.target.value })
                  }
                  className="w-full text-lg font-serif-cormorant font-semibold border-b border-stone-400 bg-transparent py-1 text-stone-900 dark:text-stone-100"
                />
              ) : (
                <p className="text-lg sm:text-xl font-serif-cormorant font-semibold text-stone-900 dark:text-stone-100">
                  {letter.salutation}
                </p>
              )}
            </div>

            {/* Body Content with First-letter drop cap */}
            <div className="space-y-4 mb-8">
              {isEditing ? (
                <textarea
                  rows={10}
                  value={editableLetter.content}
                  onChange={(e) =>
                    setEditableLetter({ ...editableLetter, content: e.target.value })
                  }
                  className="w-full text-base font-serif-cormorant leading-relaxed p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                />
              ) : (
                letter.content
                  .split('\n\n')
                  .filter((p) => p.trim())
                  .map((paragraph, idx) => (
                    <p
                      key={idx}
                      className={`text-base sm:text-lg font-serif-cormorant leading-relaxed text-stone-800 dark:text-stone-200 text-justify ${
                        idx === 0
                          ? 'first-letter:text-5xl first-letter:font-serif-cormorant first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-amber-900 dark:first-letter:text-amber-400'
                          : ''
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))
              )}
            </div>

            {/* Valediction & Signature */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4 border-t border-stone-200 dark:border-stone-800">
              <div className="space-y-1">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editableLetter.valediction}
                      onChange={(e) =>
                        setEditableLetter({ ...editableLetter, valediction: e.target.value })
                      }
                      className="text-base font-serif-cormorant italic border-b border-stone-400 bg-transparent py-1 text-stone-900 dark:text-stone-100 block"
                    />
                    <input
                      type="text"
                      value={editableLetter.signOff}
                      onChange={(e) =>
                        setEditableLetter({ ...editableLetter, signOff: e.target.value })
                      }
                      className="text-lg font-serif-cormorant font-bold border-b border-stone-400 bg-transparent py-1 text-stone-900 dark:text-stone-100 block mt-2"
                    />
                  </>
                ) : (
                  <>
                    <p className="text-base sm:text-lg font-serif-cormorant italic text-stone-700 dark:text-stone-300">
                      {letter.valediction}
                    </p>
                    <p className="text-lg sm:text-xl font-serif-cormorant font-bold text-stone-900 dark:text-stone-100">
                      {letter.signOff}
                    </p>
                  </>
                )}
              </div>

              {/* Physical Wax Seal Image at bottom right */}
              <div className="flex flex-col items-center shrink-0">
                <img
                  src={waxSealImage}
                  alt="Authentic Wax Seal"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-md border border-amber-950/20"
                />
                <span className="text-[10px] font-mono tracking-widest uppercase text-stone-500 dark:text-stone-400 mt-1">
                  SEALED IN CONTRITION
                </span>
              </div>
            </div>

            {/* Post-Scriptum */}
            {letter.postScript && (
              <div className="mt-8 pt-6 border-t border-dashed border-stone-300 dark:border-stone-700">
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={editableLetter.postScript}
                    onChange={(e) =>
                      setEditableLetter({ ...editableLetter, postScript: e.target.value })
                    }
                    className="w-full text-sm font-serif-cormorant italic p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100"
                  />
                ) : (
                  <p className="text-sm sm:text-base font-serif-cormorant italic text-amber-950 dark:text-amber-200 bg-amber-500/10 dark:bg-amber-400/5 p-3 rounded-lg border border-amber-900/15 dark:border-amber-400/15">
                    {letter.postScript}
                  </p>
                )}
              </div>
            )}
          </div>
        </article>
      )}

      {/* Interactive Live Refinement Toolbar (No Print) */}
      <div className="no-print mt-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-amber-800 dark:text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200">
              Epistolary Tuner & AI Refiner
            </h3>
          </div>
          {isRefining && (
            <span className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Recalibrating prose…
            </span>
          )}
        </div>

        {/* Quick Refine Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {refineSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              disabled={isRefining}
              onClick={() => onRefine(suggestion)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-900/40 dark:hover:text-amber-200 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Custom refinement prompt */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customRefineText.trim()) {
              onRefine(customRefineText.trim());
              setCustomRefineText('');
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={customRefineText}
            onChange={(e) => setCustomRefineText(e.target.value)}
            placeholder="Type any custom instruction (e.g. 'Mention my cat judged me silently', 'Shorter for iMessage')..."
            disabled={isRefining}
            className="flex-1 px-3.5 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-800/40"
          />
          <button
            type="submit"
            disabled={isRefining || !customRefineText.trim()}
            className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-xs sm:text-sm font-medium rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Refine</span>
          </button>
        </form>
      </div>
    </div>
  );
};
