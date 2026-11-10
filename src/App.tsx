import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GhostwriterStudio } from './components/GhostwriterStudio';
import { ApologyForm } from './components/ApologyForm';
import { LetterParchment } from './components/LetterParchment';
import { PresetsGallery } from './components/PresetsGallery';
import { ExcuseLab } from './components/ExcuseLab';
import { DossierView } from './components/DossierView';
import { APOLOGY_PRESETS } from './data/presets';
import { ApologyLetter, ApologyPreset, ApologyTone } from './types';
import { readApiResponse } from './utils/api';
import { AlertCircle, Heart, Sparkles, MessageSquareHeart } from 'lucide-react';

const emptyLetter = (): ApologyLetter => ({
  id: `new-${Date.now()}`,
  title: '',
  salutation: '',
  content: '',
  valediction: '',
  signOff: '',
  postScript: '',
});

const STORAGE_KEY = 'mea_culpa_dossier_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'ghostwriter' | 'compose' | 'presets' | 'excuses' | 'dossier'
  >('ghostwriter');
  const [currentLetter, setCurrentLetter] =
    useState<ApologyLetter>(emptyLetter);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedLetters, setSavedLetters] = useState<ApologyLetter[]>([]);
  const [selectedLabExcuse, setSelectedLabExcuse] = useState<string>('');

  // Load saved dossier from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedLetters(JSON.parse(stored));
      } else {
        setSavedLetters([]);
      }
    } catch (e) {
      console.error('Failed to load dossier from storage:', e);
    }
  }, []);

  // Sync saved letters to storage
  const persistDossier = (letters: ApologyLetter[]) => {
    setSavedLetters(letters);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
    } catch (e) {
      console.error('Failed to persist dossier:', e);
    }
  };

  const handleGenerate = async (formData: {
    recipient: string;
    sender: string;
    relationship: string;
    transgression: string;
    tone: ApologyTone;
    dramaLevel: number;
    customExcuse: string;
    reparation: string;
  }) => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/apology/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await readApiResponse<{
        success: boolean;
        letter?: ApologyLetter;
        error?: string;
      }>(res);
      if (data.success && data.letter) {
        const generated: ApologyLetter = {
          ...data.letter,
          id: `letter-${Date.now()}`,
          timestamp: Date.now(),
          recipient: formData.recipient,
          sender: formData.sender,
          transgression: formData.transgression,
          tone: formData.tone,
          dramaLevel: formData.dramaLevel,
        };
        setCurrentLetter(generated);
      } else {
        setErrorMessage(data.error || 'Failed to craft the apology.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message ||
          'An unexpected error occurred while communicating with the ghostwriter.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (instruction: string) => {
    setIsRefining(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/apology/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLetter,
          instruction,
        }),
      });

      const data = await readApiResponse<{
        success: boolean;
        letter?: ApologyLetter;
        error?: string;
      }>(res);
      if (data.success && data.letter) {
        setCurrentLetter({
          ...currentLetter,
          ...data.letter,
        });
      } else {
        setErrorMessage(data.error || 'Failed to refine the apology.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Could not refine the apology. Please try again.',
      );
    } finally {
      setIsRefining(false);
    }
  };

  const handleSaveToDossier = (letterToSave: ApologyLetter) => {
    const id = letterToSave.id || `letter-${Date.now()}`;
    const exists = savedLetters.some((l) => l.id === id);
    const updated = {
      ...letterToSave,
      id,
      timestamp: letterToSave.timestamp || Date.now(),
    };
    persistDossier(
      exists
        ? savedLetters.map((l) => (l.id === id ? updated : l))
        : [updated, ...savedLetters],
    );
  };

  const handleDeleteLetter = (id: string) => {
    const filtered = savedLetters.filter((l) => l.id !== id);
    persistDossier(filtered);
  };

  const handleClearAllDossier = () => {
    if (
      confirm(
        'Are you certain you wish to purge all recorded apologies from your dossier?',
      )
    ) {
      persistDossier([]);
    }
  };

  const handleLoadPreset = (preset: ApologyPreset) => {
    setCurrentLetter({
      ...preset.sampleLetter,
      id: `preset-${preset.id}-${Date.now()}`,
      timestamp: Date.now(),
      recipient: preset.recipient,
      transgression: preset.transgression,
      tone: preset.tone,
      dramaLevel: preset.dramaLevel,
    });
    setActiveTab('ghostwriter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewEpistle = () => {
    setCurrentLetter(emptyLetter());
    setErrorMessage(null);
    setSelectedLabExcuse('');
    setActiveTab('ghostwriter');
  };

  const isCurrentSaved = savedLetters.some((l) => l.id === currentLetter.id);

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans-clean transition-colors">
      {/* 3-Zone Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedLetters.length}
        onNewEpistle={handleNewEpistle}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-900 dark:text-rose-200 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs uppercase font-mono tracking-wider font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Humorous Apology Ghostwriter Studio (Default) */}
        {activeTab === 'ghostwriter' && (
          <div>
            {/* Studio Hero Introduction */}
            <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-8">
              <div className="text-xs tracking-widest uppercase font-mono text-stone-500 mb-2 flex items-center justify-center gap-2">
                <Heart className="w-3.5 h-3.5 text-rose-500 inline" />
                <span>Your words, thoughtfully written</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif-cormorant font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Find the words for your situation
              </h1>
              <p className="mt-3 text-base sm:text-lg font-serif-cormorant italic text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
                Write an apology, a thank-you, a family update, or a
                professional note in your own voice.
              </p>
            </div>

            {/* Split Column Workspace: Ghostwriter Studio + Live Parchment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Ghostwriter Consultation Loop */}
              <div className="lg:col-span-5 order-1 min-w-0">
                <GhostwriterStudio
                  key={currentLetter.id}
                  currentLetter={currentLetter}
                  onUpdateLetter={(updated) => setCurrentLetter(updated)}
                />
              </div>

              {/* Right Column: Real-time Parchment Viewer & Tuner */}
              <div className="lg:col-span-7 order-2 min-w-0">
                <div className="sticky top-24">
                  <LetterParchment
                    key={currentLetter.id}
                    letter={currentLetter}
                    onUpdateLetter={(updated) => setCurrentLetter(updated)}
                    onRefine={handleRefine}
                    isRefining={isRefining}
                    onSaveToDossier={handleSaveToDossier}
                    isSaved={isCurrentSaved}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Classic Compose Form */}
        {activeTab === 'compose' && (
          <div>
            <div className="text-center max-w-3xl mx-auto mb-8">
              <div className="text-xs tracking-widest uppercase font-mono text-stone-500 mb-1">
                General Epistolary Workspace
              </div>
              <h2 className="text-3xl font-serif-cormorant font-bold text-stone-900 dark:text-stone-100">
                Classic Apology Form
              </h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Choose a recipient, describe what happened, and select a style.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 order-1 min-w-0">
                <ApologyForm
                  onSubmit={handleGenerate}
                  isLoading={isGenerating}
                  onOpenExcuseLab={() => setActiveTab('excuses')}
                  externalExcuse={selectedLabExcuse}
                />
              </div>

              <div className="lg:col-span-7 order-2 min-w-0">
                <div className="sticky top-24">
                  <LetterParchment
                    key={currentLetter.id}
                    letter={currentLetter}
                    onUpdateLetter={(updated) => setCurrentLetter(updated)}
                    onRefine={handleRefine}
                    isRefining={isRefining}
                    onSaveToDossier={handleSaveToDossier}
                    isSaved={isCurrentSaved}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Presets Hall of Infamy */}
        {activeTab === 'presets' && (
          <PresetsGallery onLoadPreset={handleLoadPreset} />
        )}

        {/* Tab 4: Absurd Excuse Lab */}
        {activeTab === 'excuses' && (
          <ExcuseLab
            onSelectExcuse={(excuse) => {
              setSelectedLabExcuse(excuse);
              setActiveTab('compose');
            }}
            currentTransgression={currentLetter.transgression}
            currentTone={currentLetter.tone}
          />
        )}

        {/* Tab 5: Saved Dossier */}
        {activeTab === 'dossier' && (
          <DossierView
            savedLetters={savedLetters}
            onSelectLetter={(letter) => {
              setCurrentLetter(letter);
              setActiveTab('ghostwriter');
            }}
            onDeleteLetter={handleDeleteLetter}
            onClearAll={handleClearAllDossier}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-stone-200 dark:border-stone-800 bg-[#faf8f5] dark:bg-stone-900 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 dark:text-stone-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-cormorant font-bold text-stone-700 dark:text-stone-300 text-sm">
              Humorous Apology Ghostwriter
            </span>
            <span>·</span>
            <span>Letters for everyday life</span>
          </div>
          <div>
            Warmth, love, and cheerful humor crafted in authentic voice.
          </div>
        </div>
      </footer>
    </div>
  );
}
