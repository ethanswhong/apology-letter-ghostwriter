import React, { useState } from 'react';
import { Loader2, Sparkles, X } from 'lucide-react';
import { ApologyLetter, GhostwriterConsultResponse } from '../types';
import { readApiResponse } from '../utils/api';

interface Props {
  currentLetter: ApologyLetter;
  onUpdateLetter: (letter: ApologyLetter) => void;
}
export const GhostwriterStudio: React.FC<Props> = ({
  currentLetter,
  onUpdateLetter,
}) => {
  const [sender, setSender] = useState(currentLetter.sender || '');
  const [recipient, setRecipient] = useState(currentLetter.recipient || '');
  const [relationship, setRelationship] = useState('');
  const [purpose, setPurpose] = useState('Apology');
  const [tone, setTone] = useState('Warm and lightly humorous');
  const [story, setStory] = useState(currentLetter.transgression || '');
  const [mustInclude, setMustInclude] = useState('');
  const [optionalElements, setOptionalElements] = useState('');
  const [expressions, setExpressions] = useState<string[]>([]);
  const [phrase, setPhrase] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [commentary, setCommentary] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const consult = async () => {
    if (!story.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/ghostwriter/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: sender,
          recipient,
          relationship,
          purpose,
          tone,
          story:
            story +
            questions
              .filter((_, i) => answers[i]?.trim())
              .map((q) => {
                const i = questions.indexOf(q);
                return `\n${q}: ${answers[i]}`;
              })
              .join(''),
          mustInclude,
          optionalElements,
          specificExpressions: expressions,
          currentDraft: currentLetter.content ? currentLetter : null,
        }),
      });
      const data = await readApiResponse<GhostwriterConsultResponse>(response);
      if (!data.success || !data.letterDraft?.content)
        throw new Error(
          data.error || 'Could not draft your letter. Please try again.',
        );
      onUpdateLetter({
        ...data.letterDraft,
        id: currentLetter.id || `letter-${Date.now()}`,
        timestamp: Date.now(),
        sender,
        recipient,
        transgression: story,
      });
      setQuestions(data.clarifyingQuestions || []);
      setAnswers({});
      setCommentary(
        data.assistantCommentary ||
          'Your draft is ready. Review it and use Refine letter to make changes.',
      );
      if (window.innerWidth < 1024)
        requestAnimationFrame(() =>
          document
            .getElementById('letter-preview')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not draft your letter. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <section
      aria-label="Letter details"
      className="bg-white dark:bg-stone-900 border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-5"
    >
      <div>
        <h2 className="text-2xl font-serif-cormorant font-bold">
          Tell your story
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          Start with who it’s for and what you want to say.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="field-label">
          To
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient’s name (optional)"
          />
        </label>
        <label className="field-label">
          From
          <input
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Your name (optional)"
          />
        </label>
      </div>
      <label className="field-label">
        What kind of letter?
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          {[
            'Apology',
            'Thank-you',
            'Congratulations',
            'Family or personal update',
            'Professional note',
            'Something else',
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className="field-label">
        Your situation
        <textarea
          rows={3}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="What happened? What would you like the recipient to understand or feel?"
        />
      </label>
      <label className="field-label">
        Tone
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          {[
            'Warm and lightly humorous',
            'Sincere and thoughtful',
            'Friendly and casual',
            'Professional and respectful',
            'Celebratory',
            'Brief and direct',
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <button
        onClick={consult}
        disabled={loading || !story.trim()}
        className="w-full px-4 py-3 rounded-xl bg-amber-900 text-white flex justify-center items-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Sparkles size={18} />
        )}{' '}
        {loading
          ? 'Writing your letter…'
          : currentLetter.content
            ? 'Update draft from details'
            : 'Draft letter'}
      </button>
      <p className="text-sm text-stone-500">
        {!story.trim()
          ? 'Describe your situation to start.'
          : 'Only the details you provide will be used.'}
      </p>
      {error && (
        <p role="alert" className="p-3 bg-rose-50 text-rose-900 rounded-lg">
          {error}
        </p>
      )}
      <details className="border-t border-stone-200 pt-3">
        <summary className="cursor-pointer py-3 font-medium">
          Optional details & exact phrases
        </summary>
        <div className="space-y-4 mt-3">
          <label className="field-label">
            Your relationship
            <input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Friend, colleague, parent, customer…"
            />
          </label>
          <label className="field-label">
            Must include
            <textarea
              rows={3}
              value={mustInclude}
              onChange={(e) => setMustInclude(e.target.value)}
              placeholder="Important facts, commitments, or thanks"
            />
          </label>
          <label className="field-label">
            Other details (optional)
            <textarea
              rows={3}
              value={optionalElements}
              onChange={(e) => setOptionalElements(e.target.value)}
              placeholder="Anything else that might help"
            />
          </label>
          <div className="space-y-2">
            {expressions.map((x) => (
              <div
                key={x}
                className="flex items-center justify-between gap-2 bg-amber-50 rounded-lg px-3"
              >
                <span className="min-w-0 break-words">{x}</span>
                <button
                  aria-label={`Remove phrase: ${x}`}
                  onClick={() =>
                    setExpressions(expressions.filter((y) => y !== x))
                  }
                  className="shrink-0 p-3"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            <label className="field-label">
              Exact phrase to keep
              <input
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="Your own words"
              />
            </label>
            <button
              disabled={!phrase.trim()}
              onClick={() => {
                if (phrase.trim() && !expressions.includes(phrase.trim()))
                  setExpressions([...expressions, phrase.trim()]);
                setPhrase('');
              }}
              className="px-4 rounded-lg border border-stone-300 disabled:opacity-50"
            >
              Add phrase
            </button>
          </div>
        </div>
      </details>
      {commentary && (
        <p
          role="status"
          className="text-sm p-3 bg-amber-50 text-stone-800 rounded-lg"
        >
          {commentary}
        </p>
      )}
      {questions.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-semibold">A few details to improve your draft</h3>
          {questions.map((q, i) => (
            <label key={q} className="field-label">
              {q}
              <textarea
                rows={2}
                value={answers[i] || ''}
                onChange={(e) =>
                  setAnswers({ ...answers, [i]: e.target.value })
                }
              />
            </label>
          ))}
          <button
            disabled={loading || !Object.values(answers).some((x) => x.trim())}
            onClick={consult}
            className="px-4 border border-stone-300 rounded-lg disabled:opacity-50"
          >
            Update with answers
          </button>
        </section>
      )}
    </section>
  );
};
