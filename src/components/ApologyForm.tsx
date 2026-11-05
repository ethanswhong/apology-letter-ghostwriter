import React, { useState } from 'react';
import {
  Feather,
  Sparkles,
  Gift,
  HelpCircle,
  Loader2,
  Shuffle,
  Flame,
  ChevronDown,
} from 'lucide-react';
import { ApologyTone, ExcuseItem, PeaceOfferingItem } from '../types';
import { QUICK_FAUX_PAS, TONE_DETAILS } from '../data/presets';

interface ApologyFormProps {
  onSubmit: (formData: {
    recipient: string;
    sender: string;
    relationship: string;
    transgression: string;
    tone: ApologyTone;
    dramaLevel: number;
    customExcuse: string;
    reparation: string;
  }) => Promise<void>;
  isLoading: boolean;
  onOpenExcuseLab: () => void;
  externalExcuse?: string;
}

const RELATIONSHIPS = [
  'Roommate / Flatmate',
  'Spouse / Romantic Partner',
  'Best Friend',
  'Boss / Manager',
  'Colleague / Team Member',
  'In-Laws / Parents',
  'Neighbor / Landlord',
  'Pet (Cat/Dog)',
  'Client / Customer',
  'Complete Stranger',
];

const DRAMA_DESCRIPTIONS = [
  { level: 1, label: 'Gentle Chuckle', desc: 'Lighthearted poke, subtle self-ribbing, harmless blush.' },
  { level: 2, label: 'Social Embarrassment', desc: 'Awkward eye contact, sweaty palms, honest sheepish grin.' },
  { level: 3, label: 'Standard Grovel', desc: 'On bended knee, offering pastries, theatrical contrition.' },
  { level: 4, label: 'Operatic Penance', desc: 'Gothic sorrow, dramatic pauses, deep sighing by candlelight.' },
  { level: 5, label: 'DEFCON 1 Cosmic Calamity', desc: 'World-ending guilt, abject historical tragedy, total surrender.' },
];

export const ApologyForm: React.FC<ApologyFormProps> = ({
  onSubmit,
  isLoading,
  onOpenExcuseLab,
  externalExcuse = '',
}) => {
  const [recipient, setRecipient] = useState('Clara, Beloved Roommate');
  const [sender, setSender] = useState('Julian');
  const [relationship, setRelationship] = useState('Roommate / Flatmate');
  const [transgression, setTransgression] = useState(
    'Ate the clearly labeled green curry leftovers in the fridge at 2:14 AM'
  );
  const [tone, setTone] = useState<ApologyTone>('victorian');
  const [dramaLevel, setDramaLevel] = useState(3);
  const [customExcuse, setCustomExcuse] = useState(externalExcuse);
  const [reparation, setReparation] = useState('');
  const [generatingOfferings, setGeneratingOfferings] = useState(false);
  const [offeringSuggestions, setOfferingSuggestions] = useState<PeaceOfferingItem[]>([]);

  // Update excuse if external lab passed one
  React.useEffect(() => {
    if (externalExcuse) {
      setCustomExcuse(externalExcuse);
    }
  }, [externalExcuse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transgression.trim()) return;
    onSubmit({
      recipient: recipient.trim() || 'My Esteemed Friend',
      sender: sender.trim() || 'The Remorseful One',
      relationship,
      transgression: transgression.trim(),
      tone,
      dramaLevel,
      customExcuse: customExcuse.trim(),
      reparation: reparation.trim(),
    });
  };

  const handleRandomizeTransgression = () => {
    const random = QUICK_FAUX_PAS[Math.floor(Math.random() * QUICK_FAUX_PAS.length)];
    setTransgression(random);
  };

  const handleGenerateOfferings = async () => {
    if (!transgression.trim()) return;
    setGeneratingOfferings(true);
    try {
      const res = await fetch('/api/apology/peace-offerings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transgression, relationship }),
      });
      const data = await res.json();
      if (data.success && data.offerings) {
        setOfferingSuggestions(data.offerings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingOfferings(false);
    }
  };

  const currentDrama = DRAMA_DESCRIPTIONS[dramaLevel - 1];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
    >
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase font-mono tracking-widest text-stone-600 dark:text-stone-400">
            Case Parameters
          </span>
          <span className="text-xs text-stone-600 dark:text-stone-400">All fields customizable</span>
        </div>
        <h2 className="text-2xl font-serif-cormorant font-bold text-stone-900 dark:text-stone-100">
          The Dossier of Grievance
        </h2>
      </div>

      {/* Recipient & Relationship */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
            Recipient Name / Title
          </label>
          <input
            type="text"
            required
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="e.g. Clara, Boss Dave, Aunt Beatrice"
            className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-800/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
            Relationship Dynamic
          </label>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden"
          >
            {RELATIONSHIPS.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sender Name */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
          Your Name / Penitent Alias
        </label>
        <input
          type="text"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          placeholder="e.g. Julian, The Dishwasher Delinquent"
          className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-800/40"
        />
      </div>

      {/* The Transgression */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            The Transgression / Faux Pas
          </label>
          <button
            type="button"
            onClick={handleRandomizeTransgression}
            className="text-xs text-amber-900 dark:text-amber-300 hover:underline flex items-center gap-1 font-medium"
          >
            <Shuffle className="w-3 h-3" />
            <span>Random Misdeed</span>
          </button>
        </div>

        <textarea
          rows={3}
          required
          value={transgression}
          onChange={(e) => setTransgression(e.target.value)}
          placeholder="Describe exactly what happened in embarrassing or mundane detail..."
          className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-800/40 resize-none"
        />

        {/* Quick Faux Pas Chips */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-stone-600 dark:text-stone-400 self-center mr-1">
            Common sins:
          </span>
          {QUICK_FAUX_PAS.slice(0, 3).map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTransgression(chip)}
              className="text-xs px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              {chip.slice(0, 32)}…
            </button>
          ))}
        </div>
      </div>

      {/* Tone Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
          Tone & Flavor of Humor
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Object.entries(TONE_DETAILS).map(([key, item]) => {
            const isSelected = tone === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTone(key as ApologyTone)}
                className={`p-3 text-left rounded-xl border transition-all ${
                  isSelected
                    ? 'border-amber-900 dark:border-amber-400 bg-amber-500/10 dark:bg-amber-400/10 ring-1 ring-amber-900/20 dark:ring-amber-400/20'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif-cormorant font-bold text-stone-900 dark:text-stone-100">
                    {item.label}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contrition / Drama Slider */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Contrition & Drama Dial</span>
          </label>
          <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-300">
            Level {dramaLevel}/5 · {currentDrama.label}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={dramaLevel}
          onChange={(e) => setDramaLevel(Number(e.target.value))}
          className="w-full accent-amber-900 dark:accent-amber-500 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-stone-600 dark:text-stone-400 mt-1">
          <span>Mild chuckle</span>
          <span className="text-stone-600 dark:text-stone-400">{currentDrama.desc}</span>
          <span>Cosmic grief</span>
        </div>
      </div>

      {/* Optional Excuse & Peace Offering Row */}
      <div className="space-y-4 pt-2 border-t border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Absurd Mitigating Excuse (Optional)
            </label>
            <button
              type="button"
              onClick={onOpenExcuseLab}
              className="text-xs text-amber-900 dark:text-amber-300 hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3 h-3" />
              <span>Browse Excuse Lab</span>
            </button>
          </div>
          <input
            type="text"
            value={customExcuse}
            onChange={(e) => setCustomExcuse(e.target.value)}
            placeholder="e.g. My cat whispered psychic instructions, low barometric pressure..."
            className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-800/40"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Proposed Peace Offering / Reparation (Optional)
            </label>
            <button
              type="button"
              onClick={handleGenerateOfferings}
              disabled={generatingOfferings || !transgression.trim()}
              className="text-xs text-amber-900 dark:text-amber-300 hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
            >
              {generatingOfferings ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Gift className="w-3 h-3" />
              )}
              <span>Suggest Comedic Bribes</span>
            </button>
          </div>
          <input
            type="text"
            value={reparation}
            onChange={(e) => setReparation(e.target.value)}
            placeholder="e.g. A freshly baked sourdough loaf, lifetime immunity from taking trash out..."
            className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-800/40"
          />

          {/* Peace Offering Suggestions */}
          {offeringSuggestions.length > 0 && (
            <div className="mt-2.5 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 block">
                Click to apply reparation:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {offeringSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReparation(`${item.offering}: ${item.terms}`)}
                    className="text-left text-xs p-2 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-600 transition-colors"
                  >
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      {item.offering}
                    </span>
                    <span className="text-stone-600 dark:text-stone-400 block text-[11px]">
                      {item.terms}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !transgression.trim()}
        className="w-full py-3.5 px-6 bg-amber-900 dark:bg-amber-800 text-amber-50 font-medium text-base rounded-xl hover:bg-amber-800 dark:hover:bg-amber-700 transition-all shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Summoning Eloquent Remorse…</span>
          </>
        ) : (
          <>
            <Feather className="w-5 h-5" />
            <span>Draft Humorous Apology</span>
          </>
        )}
      </button>
    </form>
  );
};
