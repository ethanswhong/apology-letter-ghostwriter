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
import { AlertCircle, Heart, Sparkles, MessageSquareHeart } from 'lucide-react';

const STORAGE_KEY = 'mea_culpa_dossier_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'ghostwriter' | 'compose' | 'presets' | 'excuses' | 'dossier'>('ghostwriter');
  const [currentLetter, setCurrentLetter] = useState<ApologyLetter>(APOLOGY_PRESETS[0].sampleLetter);
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
        // Seed with primary Heeje Lee letter to Mom
        setSavedLetters([
          {
            ...APOLOGY_PRESETS[0].sampleLetter,
            id: 'sample-heeje-letter',
            timestamp: Date.now() - 86400000,
            recipient: 'Mom (The Undisputed Heart of Our Home)',
          },
        ]);
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

      const data = await res.json();
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
      setErrorMessage(err.message || 'An unexpected error occurred while communicating with the ghostwriter.');
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

      const data = await res.json();
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
      setErrorMessage('Could not refine the apology. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSaveToDossier = (letterToSave: ApologyLetter) => {
    const id = letterToSave.id || `letter-${Date.now()}`;
    const exists = savedLetters.some((l) => l.id === id);
    if (!exists) {
      const updated = [
        { ...letterToSave, id, timestamp: letterToSave.timestamp || Date.now() },
        ...savedLetters,
      ];
      persistDossier(updated);
    }
  };

  const handleDeleteLetter = (id: string) => {
    const filtered = savedLetters.filter((l) => l.id !== id);
    persistDossier(filtered);
  };

  const handleClearAllDossier = () => {
    if (confirm('Are you certain you wish to purge all recorded apologies from your dossier?')) {
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
    setActiveTab(preset.id === 'heeje-berkeley-letter' ? 'ghostwriter' : 'compose');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewEpistle = () => {
    setCurrentLetter({
      id: `new-${Date.now()}`,
      timestamp: Date.now(),
      title: 'A Warm Message from Berkeley',
      salutation: 'Dearest Mom,',
      content: `I am writing this from up north in Berkeley, safe and sound, though officially guilty of leaving the warmest home in Southern California to chase pixels, prototypes, and a Master’s in Design.\n\nFirst, my official apology: I know you worried when I packed my bags, and I am deeply sorry for leaving an empty chair at the dinner table. Who is going to finish the extra side dishes now? I can already hear you asking if I'm eating enough vegetables and whether my brother is behaving himself at home.\n\nRest assured, Dad and my brother are holding down the fort, Grandma has her favorite drama shows, and please give our dog an extra ear rub from me. Everything I’m designing here is built on the love and sacrifices you and Dad made for us.\n\nI promise to eat actual meals (not just instant ramen), call you every Sunday, and come home with stories that will make you proud.`,
      valediction: 'With all my love and endless gratitude,',
      signOff: 'Your son, Heeje Lee',
      postScript: 'P.S. Please tell our dog that I didn’t abandon him for Northern California squirrels—I will be back with treats before he even knows it!',
      absurdityQuote: 'Officially guilty of leaving SoCal for graduate school, but always your son.',
    });
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
              <div className="text-xs tracking-widest uppercase font-mono text-stone-500 mb-2 flex items-center justify-center gap-2">
                <Heart className="w-3.5 h-3.5 text-rose-500 inline" />
                <span>Humorous Apology Ghostwriter Bureau</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif-cormorant font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Setting the Tone: Warm, Loving & Playful
              </h1>
              <p className="mt-3 text-base sm:text-lg font-serif-cormorant italic text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
                "Helping you clearly articulate your thoughts and add lighthearted humor, striking the perfect emotional temperature for Mom."
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500">
                <span>Client: Heeje Lee</span>
                <span>·</span>
                <span>SoCal → UC Berkeley MDes</span>
                <span>·</span>
                <span>6-Step Interaction Loop</span>
              </div>
            </div>

            {/* Split Column Workspace: Ghostwriter Studio + Live Parchment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Ghostwriter Consultation Loop */}
              <div className="lg:col-span-5 order-2 lg:order-1">
                <GhostwriterStudio
                  currentLetter={currentLetter}
                  onUpdateLetter={(updated) => setCurrentLetter(updated)}
                />
              </div>

              {/* Right Column: Real-time Parchment Viewer & Tuner */}
              <div className="lg:col-span-7 order-1 lg:order-2">
                <div className="sticky top-24">
                  <LetterParchment
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
                Configure custom parameters, relationships, and drama dials across 7 distinct tones.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <ApologyForm
                  onSubmit={handleGenerate}
                  isLoading={isGenerating}
                  onOpenExcuseLab={() => setActiveTab('excuses')}
                  externalExcuse={selectedLabExcuse}
                />
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2">
                <div className="sticky top-24">
                  <LetterParchment
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
        {activeTab === 'presets' && <PresetsGallery onLoadPreset={handleLoadPreset} />}

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
            <span>Dedicated to Heeje Lee & Family</span>
          </div>
          <div>Warmth, love, and cheerful humor crafted in authentic voice.</div>
        </div>
      </footer>
    </div>
  );
}
