import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Send,
  Loader2,
  Plus,
  X,
  FileEdit,
  UserCheck,
  Compass,
} from 'lucide-react';
import { ApologyLetter, GhostwriterConsultResponse } from '../types';

interface GhostwriterStudioProps {
  currentLetter: ApologyLetter;
  onUpdateLetter: (letter: ApologyLetter) => void;
}

export const GhostwriterStudio: React.FC<GhostwriterStudioProps> = ({
  currentLetter,
  onUpdateLetter,
}) => {
  // Knowledge Base State
  const [clientName, setClientName] = useState('Heeje Lee');
  const [recipient, setRecipient] = useState('Mom');
  const [relationship, setRelationship] = useState('Mother');

  // Story & Required Inputs
  const [story, setStory] = useState(
    'I left home in Southern California to move up to UC Berkeley for my Master’s in Design (MDes). I want to write a letter to my mother that is not entirely apologetic, but leaves a warm, humorous, and loving message reassuring her I am okay, eating well, and thinking of our family (Dad, my brother, Grandma, and our dog).'
  );
  const [mustInclude, setMustInclude] = useState(
    'Reassurance that I am eating well, love for our immigrant family journey, and a playful nod to our dog and Grandma.'
  );
  const [optionalElements, setOptionalElements] = useState(
    'Teasing my brother to help Mom more, asking her not to worry about Berkeley weather.'
  );

  // Specific Expressions
  const [expressions, setExpressions] = useState<string[]>([
    'I will call every Sunday without fail',
    'Don’t spoil the dog too much while I’m away',
    'Everything I design here is built on your sacrifices',
  ]);
  const [newExpression, setNewExpression] = useState('');

  // Ghostwriter State
  const [loading, setLoading] = useState(false);
  const [commentary, setCommentary] = useState<string>(
    'Welcome, Heeje! As your Humorous Apology Ghostwriter, my mission is to capture your genuine love for Mom while keeping things cheerful, warm, and lighthearted. We are striking the sweet spot between a heartfelt confession and a joyful family update.'
  );
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([
    'What is your dog’s name, and does he have a funny habit you’ll miss?',
    'Is there a specific signature dish of Mom’s that you already crave in Berkeley?',
  ]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [confirmationPrompt, setConfirmationPrompt] = useState<string>(
    'Does this draft feel natural and affectionate? Let me know any details or lines you want to adjust!'
  );
  const [preservedExpressions, setPreservedExpressions] = useState<string[]>(expressions);
  const [feedbackInput, setFeedbackInput] = useState('');

  const handleAddExpression = () => {
    if (newExpression.trim() && !expressions.includes(newExpression.trim())) {
      setExpressions([...expressions, newExpression.trim()]);
      setNewExpression('');
    }
  };

  const handleRemoveExpression = (expr: string) => {
    setExpressions(expressions.filter((e) => e !== expr));
  };

  const handleConsult = async (customFeedback = '') => {
    setLoading(true);
    try {
      // Aggregate user answers into the story
      const formattedAnswers = Object.entries(answers)
        .map(([idx, ans]) => `Q: ${clarifyingQuestions[Number(idx)]}\nA: ${ans}`)
        .join('\n');

      const fullStoryContext = formattedAnswers
        ? `${story}\n\nClarifying Details Provided by User:\n${formattedAnswers}`
        : story;

      const res = await fetch('/api/ghostwriter/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story: fullStoryContext,
          specificExpressions: expressions,
          mustInclude,
          optionalElements,
          currentDraft: currentLetter,
          userFeedback: customFeedback || feedbackInput,
          clientName,
          recipient,
          relationship,
        }),
      });

      const data: GhostwriterConsultResponse = await res.json();
      if (data.success && data.letterDraft) {
        onUpdateLetter({
          ...data.letterDraft,
          id: `ghostwriter-${Date.now()}`,
          timestamp: Date.now(),
          recipient,
          sender: clientName,
          tone: 'warm_humorous',
        });
        setCommentary(data.assistantCommentary);
        setClarifyingQuestions(data.clarifyingQuestions || []);
        setConfirmationPrompt(data.confirmationPrompt);
        if (data.preservedExpressions) {
          setPreservedExpressions(data.preservedExpressions);
        }
        setFeedbackInput('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ghostwriter Knowledge Base & Persona Banner */}
      <div className="bg-amber-900/5 dark:bg-amber-400/5 border border-amber-900/15 dark:border-amber-400/15 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-900/10 dark:border-amber-400/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-900 text-amber-50 dark:bg-amber-400 dark:text-stone-900 flex items-center justify-center font-serif-cormorant font-bold text-lg">
              G
            </div>
            <div>
              <h3 className="text-base font-serif-cormorant font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Humorous Apology Ghostwriter</span>
                <span className="text-xs font-mono font-normal text-amber-900 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                  Active
                </span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Persona: Cheerful, lighthearted, warm & loving · Tone-calibrated ghostwriting
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-stone-500 dark:text-stone-400 self-start sm:self-auto">
            Client: <span className="font-semibold text-stone-800 dark:text-stone-200">Heeje Lee</span> · SoCal → UC Berkeley MDes
          </div>
        </div>

        {/* Knowledge Base Context Details */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600 dark:text-stone-400">
          <div>
            <span className="font-semibold text-stone-800 dark:text-stone-200 block">Family:</span>
            Father, Mother, 1 Brother, Grandma, Dog
          </div>
          <div>
            <span className="font-semibold text-stone-800 dark:text-stone-200 block">Background:</span>
            Immigrant family from South Korea
          </div>
          <div>
            <span className="font-semibold text-stone-800 dark:text-stone-200 block">Engagement Goal:</span>
            Warm, humorous message for Mom (not solely apologetic)
          </div>
        </div>
      </div>

      {/* Step 1: The User Tells the Story & Inputs */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase font-mono tracking-widest text-stone-500">
              Interaction Loop · Step 1
            </span>
            <span className="text-xs text-amber-900 dark:text-amber-300 font-medium">
              Tell Your Story
            </span>
          </div>
          <h2 className="text-xl font-serif-cormorant font-bold text-stone-900 dark:text-stone-100">
            Context, Story & Intentions
          </h2>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
            The Story & Situation
          </label>
          <textarea
            rows={3}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Share your thoughts, feelings, and the situation in your own words..."
            className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-800/40 resize-none"
          />
        </div>

        {/* Must Include vs Optional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
              Must Be Included
            </label>
            <input
              type="text"
              value={mustInclude}
              onChange={(e) => setMustInclude(e.target.value)}
              placeholder="e.g. Eating well, gratitude for sacrifices..."
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
              Optional Elements
            </label>
            <input
              type="text"
              value={optionalElements}
              onChange={(e) => setOptionalElements(e.target.value)}
              placeholder="e.g. Teasing brother, dog habits..."
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Specific Expressions Provided by User */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
            <span>Specific Expressions (Reflected Directly in the Letter)</span>
            <span className="text-[11px] font-normal text-stone-500">Verbatim rule</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {expressions.map((expr, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 rounded-md"
              >
                <span>"{expr}"</span>
                <button
                  type="button"
                  onClick={() => handleRemoveExpression(expr)}
                  className="hover:text-rose-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newExpression}
              onChange={(e) => setNewExpression(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddExpression();
                }
              }}
              placeholder="Add an exact phrase you want used (e.g. 'I promise I won't just eat Shin Ramyun')..."
              className="flex-1 px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleAddExpression}
              className="px-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Phrase</span>
            </button>
          </div>
        </div>

        {/* Primary Consult / Draft Button */}
        <button
          type="button"
          onClick={() => handleConsult()}
          disabled={loading || !story.trim()}
          className="w-full py-3 px-5 bg-amber-900 dark:bg-amber-800 text-amber-50 font-medium text-sm rounded-xl hover:bg-amber-800 dark:hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Ghostwriter Crafting & Calibrating…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Consult Ghostwriter & Draft Letter</span>
            </>
          )}
        </button>
      </div>

      {/* Step 2 & 3: Clarifying Questions & Assistant Commentary */}
      {(commentary || clarifyingQuestions.length > 0) && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-800 dark:text-amber-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                Ghostwriter Commentary & Clarifications
              </h3>
            </div>
            <span className="text-xs font-mono text-stone-500">Interaction Loop · Step 2 & 3</span>
          </div>

          {commentary && (
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic bg-stone-50 dark:bg-stone-800/50 p-3.5 rounded-xl border border-stone-100 dark:border-stone-800">
              "{commentary}"
            </p>
          )}

          {/* Clarifying Questions */}
          {clarifyingQuestions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Clarifying Questions (Rule: Clarify before assuming):</span>
              </div>
              <div className="space-y-2.5">
                {clarifyingQuestions.map((question, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-3 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-900/10 dark:border-amber-400/10 rounded-xl space-y-2"
                  >
                    <p className="text-xs font-medium text-stone-800 dark:text-stone-200">
                      {qIdx + 1}. {question}
                    </p>
                    <input
                      type="text"
                      value={answers[qIdx] || ''}
                      onChange={(e) => setAnswers({ ...answers, [qIdx]: e.target.value })}
                      placeholder="Type your clarification (e.g. 'His name is Choco, he barks at mailmen')..."
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-hidden"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleConsult()}
                  disabled={loading}
                  className="text-xs font-medium text-amber-900 dark:text-amber-300 hover:underline flex items-center gap-1 pt-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Update Draft with Clarifications</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 5 & 6: User Confirmation & Cohesion Feedback */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200">
              Step 5: User Confirmation & Edits
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-500">Interaction Loop · Step 5 & 6</span>
        </div>

        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
          {confirmationPrompt}
        </p>

        {/* Preserved Expressions Indicator */}
        {preservedExpressions.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Preserved User Expressions: {preservedExpressions.length} verified</span>
          </div>
        )}

        {/* Quick Feedback Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            'Make it even warmer and more affectionate',
            'Add more humor about graduate design projects',
            'Emphasize how much I miss Mom’s home-cooked food',
            'Remind my brother to take the trash out',
          ].map((presetFeedback, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleConsult(presetFeedback)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-950/50 transition-colors"
            >
              {presetFeedback}
            </button>
          ))}
        </div>

        {/* Custom Edit Box */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={feedbackInput}
            onChange={(e) => setFeedbackInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (feedbackInput.trim()) handleConsult();
              }
            }}
            placeholder="Tell your ghostwriter what to adjust (e.g. 'Make the sign-off sweeter', 'Mention grandma’s tea')..."
            className="flex-1 px-3.5 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={() => handleConsult()}
            disabled={loading || !feedbackInput.trim()}
            className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-xs font-medium rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Refine</span>
          </button>
        </div>
      </div>
    </div>
  );
};
