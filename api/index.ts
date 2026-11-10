// Self-contained Vercel function entry point.
// No extensionless local imports: Node ESM cannot resolve ../app at runtime.
import express, { type Request, type Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Use stable model identifiers; allow model overrides without another deployment.
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite';

class MissingApiKeyError extends Error {
  constructor() {
    super('GEMINI_API_KEY is missing. Add it in Vercel Project Settings > Environment Variables, then redeploy.');
    this.name = 'MissingApiKeyError';
  }
}

function hasGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== 'MY_GEMINI_API_KEY');
}

function getAiClient(): GoogleGenAI {
  if (!hasGeminiKey()) throw new MissingApiKeyError();
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
}

function upstreamStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const status = (error as { status?: unknown }).status;
  if (typeof status === 'number') return status;
  if (typeof status === 'string' && /^\d{3}$/.test(status)) return Number(status);
  return undefined;
}

// Trying another model is useful when a model is unavailable or temporarily overloaded,
// but not for an invalid API key or permission failure.
function shouldTryFallback(error: unknown): boolean {
  return [404, 429, 500, 502, 503, 504].includes(upstreamStatus(error) ?? 0);
}

async function generateWithFallback(params: Parameters<GoogleGenAI['models']['generateContent']>[0]) {
  const ai = getAiClient();
  try {
    return await ai.models.generateContent({ ...params, model: PRIMARY_MODEL });
  } catch (error: unknown) {
    if (!shouldTryFallback(error) || PRIMARY_MODEL === FALLBACK_MODEL) throw error;
    console.warn(`Gemini primary model ${PRIMARY_MODEL} failed (status ${upstreamStatus(error) ?? 'unknown'}); trying ${FALLBACK_MODEL}.`);
    return await ai.models.generateContent({ ...params, model: FALLBACK_MODEL });
  }
}

// Preserve the real upstream status in server logs, but don't leak API credentials or
// provider internals into the publicly accessible browser response.
function sendAiError(res: Response, error: unknown, action: string) {
  console.error(`${action} failed:`, error);
  if (error instanceof MissingApiKeyError) {
    return res.status(503).json({ success: false, code: 'GEMINI_KEY_MISSING', error: error.message });
  }
  const status = upstreamStatus(error);
  if (status === 401 || status === 403) {
    return res.status(502).json({ success: false, code: 'GEMINI_AUTH_FAILED', error: 'Gemini rejected the API key or its permissions. Check GEMINI_API_KEY in Vercel.' });
  }
  if (status === 429) {
    return res.status(429).json({ success: false, code: 'GEMINI_RATE_LIMIT', error: 'Gemini API rate limit or quota reached. Please try again later and check your Google API quota.' });
  }
  if (status === 404) {
    return res.status(502).json({ success: false, code: 'GEMINI_MODEL_UNAVAILABLE', error: 'The configured Gemini model is not available for this API key. Check the GEMINI_MODEL setting.' });
  }
  if (status === 400) {
    return res.status(502).json({ success: false, code: 'GEMINI_BAD_REQUEST', error: 'Gemini rejected the generation request. Check Vercel function logs for the provider error.' });
  }
  if (status === undefined) {
    return res.status(500).json({ success: false, code: 'UNEXPECTED_SERVER_ERROR', error: 'An unexpected server error occurred. Check Vercel Function logs.' });
  }
  return res.status(502).json({ success: false, code: 'GEMINI_REQUEST_FAILED', error: 'Gemini could not generate the response. Check Vercel Function logs and try again.' });
}

// Master Ghostwriter System Persona and Knowledge Base
const GHOSTWRITER_SYSTEM_INSTRUCTION = `
You are the **Humorous Apology Ghostwriter**.

**Role Name:** Humorous Apology Ghostwriter

**Purpose:**
Help the user clearly articulate their thoughts and add a sense of humor to an apology letter. You set the right tone and emotional temperature for the user’s intended message.

**Engagement Context:**
The user wants to write a letter to his mother about leaving home to pursue graduate education. The letter is not meant to be entirely apologetic, but rather to leave a warm, humorous, and deeply loving message for his mother.

**Knowledge Base:**
- Client Name: Heeje Lee
- Family & Relationships: father, mother, one brother, grandmother, dog
- Background: an immigrant family from South Korea
- Situation: Heeje left home in SoCal to pursue his master’s in design (MDes) at UC Berkeley.

**Behavioral Rules:**
- The letter must strictly align with the user’s intentions.
- Personality: cheerful, lighthearted, warm, and loving.
- Specific expressions provided by the user MUST be reflected directly in the letter.
- Always ask clarifying questions when situations, descriptions, or terminology are vague.

**Interaction Loop:**
1. The user tells a story or provides context.
2. You consider possible ways to interpret it.
3. You ask clarifying questions if any situations or descriptions are vague.
4. You write a rough draft in the intended voice (warm, loving, playful apology).
5. You ask for the user’s confirmation.
6. You make the requested edits and ensure that the final letter is cohesive.

**Boundaries:**
- Do NOT interpret situations, intentions, or emotions beyond what the user has explicitly provided without first asking for clarification.
- DOES NOT DO:
  * Make up stories, facts, or feelings.
  * Become overly serious in tone.

**Required Inputs to Respect:**
- Context, situations, stories, and relationships.
- What must be included and what is optional.
- Specific expressions to weave in verbatim or near-verbatim.

**Outputs:**
- Clarifying questions (if any details are ambiguous or need more texture).
- A well-drafted letter that sounds like the user: cheerful, humorous, and affectionate.
- Confirmation request.
`;

// Helper prompt descriptions for tones
const TONE_GUIDES: Record<string, string> = {
  warm_humorous: 'Warm, cheerful, affectionate, and loving. Balances genuine love with gentle, playful humor.',
  victorian: 'Victorian melodrama, 19th-century gothic excess, poetic agony, swooning with guilt, smelling salts, formal florid syntax, hyperbolic Shakespearean or Austenian cadence.',
  corporate_pr: 'Corporate PR crisis communication non-apology, saturated with synergy jargon, proactive self-investigations, holistic accountability, sub-optimal optics, and action-item roadmaps.',
  passive_aggressive: 'Finely veiled, ultra-polite passive aggression that sounds deeply penitent on the surface while comically highlighting how the recipient might also have contributed to the chaos.',
  legal_brief: 'Overly formalized legal affidavit / court filing style, full of humorous "hereinafter referred to as", force majeure assertions, indemnifications, and clauses admitting fault without prejudice.',
  drama_queen: 'Unfiltered, soap-opera theatricality, banishing oneself into the wilderness, ripping garments in sorrow, comparing a small blunder to the fall of Pompeii.',
  earnest_buffoon: 'Lovably clumsy, sheepish, highly relatable self-deprecating comedy. Honest embarrassment mixed with silly analogies and genuine affection.',
  existential: 'Highbrow philosophical despair, blaming entropy, the heat death of the universe, Nietzschean despair, quantum indeterminacy, and the human condition for the slip-up.',
};

// Create router to mount on both `/api` and `/` so all serverless routing variations work
const apiRouter = express.Router();

// Health Check
apiRouter.get('/health', (_req: Request, res: Response) => {
  const hasKey = hasGeminiKey();
  res.json({
    status: hasKey ? 'ok' : 'missing-api-key',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node-express',
    hasGeminiKey: hasKey,
    model: PRIMARY_MODEL,
    fallbackModel: FALLBACK_MODEL,
  });
});

// 1. Ghostwriter Consult Endpoint (Full 6-Step Interaction Loop)
apiRouter.post('/ghostwriter/consult', async (req: Request, res: Response) => {
  try {
    const {
      story = '',
      specificExpressions = [],
      mustInclude = '',
      optionalElements = '',
      currentDraft = null,
      userFeedback = '',
      clientName = 'Heeje Lee',
      recipient = 'Mom',
      relationship = 'Mother',
    } = req.body;

    const prompt = `
User Context & Story:
"${story}"

Client Name: ${clientName}
Recipient: ${recipient} (${relationship})
Must Include: "${mustInclude}"
Optional Elements: "${optionalElements}"
Specific Expressions to Include verbatim/naturally: ${JSON.stringify(specificExpressions)}
User Feedback / Requested Edits on Current Draft: "${userFeedback}"

${
  currentDraft
    ? `Current Draft Under Review:\nTitle: ${currentDraft.title}\nSalutation: ${currentDraft.salutation}\nContent: ${currentDraft.content}\nValediction: ${currentDraft.valediction}\nSignOff: ${currentDraft.signOff}\nP.S.: ${currentDraft.postScript}`
    : 'No draft yet; draft a fresh rough draft.'
}

Please analyze this according to the interaction loop:
1. Interpret the user's story and intentions with a cheerful, warm, and loving mindset.
2. Identify if any situation, memory, or detail is vague; if so, provide 1 to 3 friendly clarifying questions.
3. Write/update the draft letter. Ensure it blends affectionate humor with genuine warmth, reflects specific expressions, and never becomes overly serious.
4. Provide a warm closing note asking for the user's confirmation and edits.
`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: GHOSTWRITER_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assistantCommentary: {
              type: Type.STRING,
              description: 'Cheerful, warm note explaining how you interpreted the story and what tone you established.',
            },
            clarifyingQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '1-3 friendly questions if any situation/detail is vague, or empty if complete.',
            },
            letterDraft: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                salutation: { type: Type.STRING },
                content: { type: Type.STRING, description: '3 to 4 flowing paragraphs separated by \\n\\n' },
                valediction: { type: Type.STRING },
                signOff: { type: Type.STRING },
                postScript: { type: Type.STRING },
                absurdityQuote: { type: Type.STRING },
              },
              required: ['title', 'salutation', 'content', 'valediction', 'signOff', 'postScript'],
            },
            confirmationPrompt: {
              type: Type.STRING,
              description: 'Warm prompt asking the user for confirmation and any desired adjustments.',
            },
            preservedExpressions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific user expressions incorporated into this draft.',
            },
          },
          required: ['assistantCommentary', 'clarifyingQuestions', 'letterDraft', 'confirmationPrompt'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    return sendAiError(res, error, 'Ghostwriter consultation');
  }
});

// 2. Refine existing letter endpoint
apiRouter.post('/apology/refine', async (req: Request, res: Response) => {
  try {
    const { currentLetter, instruction } = req.body;

    const prompt = `Refine the current letter according to this user request: "${instruction}".
Remember:
- Cheerful, lighthearted, warm, and loving tone.
- Do not make up facts or become overly serious.
- Keep the voice natural, cohesive, and aligned with Heeje Lee's voice for Mom.

Current Letter:
Title: ${currentLetter.title}
Salutation: ${currentLetter.salutation}
Content: ${currentLetter.content}
Valediction: ${currentLetter.valediction}
Sign-off: ${currentLetter.signOff}
P.S.: ${currentLetter.postScript}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: GHOSTWRITER_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            salutation: { type: Type.STRING },
            content: { type: Type.STRING },
            valediction: { type: Type.STRING },
            signOff: { type: Type.STRING },
            postScript: { type: Type.STRING },
            absurdityQuote: { type: Type.STRING },
          },
          required: ['title', 'salutation', 'content', 'valediction', 'signOff', 'postScript'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, letter: parsed });
  } catch (error: any) {
    return sendAiError(res, error, 'Letter refinement');
  }
});

// 3. Quick Generator
apiRouter.post('/apology/generate', async (req: Request, res: Response) => {
  try {
    const {
      recipient = 'Mom',
      sender = 'Heeje Lee',
      relationship = 'Mother',
      transgression = 'Left home in SoCal to pursue graduate school at UC Berkeley',
      customExcuse = '',
      reparation = '',
      specificExpressions = [],
    } = req.body;

    const prompt = `Write a humorous, warm apology and love letter from ${sender} to ${recipient} (${relationship}).
Context/Situation: "${transgression}"
${customExcuse ? `Mitigating Excuse / Anecdote: "${customExcuse}"` : ''}
${reparation ? `Peace Offering / Vow: "${reparation}"` : ''}
${specificExpressions?.length ? `User expressions to include: ${JSON.stringify(specificExpressions)}` : ''}

Tone: Cheerful, lighthearted, warm, and loving. Sincere love mixed with witty, gentle self-deprecating humor.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: GHOSTWRITER_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            salutation: { type: Type.STRING },
            content: { type: Type.STRING },
            valediction: { type: Type.STRING },
            signOff: { type: Type.STRING },
            postScript: { type: Type.STRING },
            absurdityQuote: { type: Type.STRING },
          },
          required: ['title', 'salutation', 'content', 'valediction', 'signOff', 'postScript'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, letter: parsed });
  } catch (error: any) {
    return sendAiError(res, error, 'Letter generation');
  }
});

// 4. Quick Excuses & Anecdotes
apiRouter.post('/apology/excuse-generator', async (req: Request, res: Response) => {
  try {
    const { transgression = 'Leaving home for graduate school' } = req.body;

    const response = await generateWithFallback({
      contents: `Generate 4 lighthearted, warm, and funny excuses or anecdotes for this situation: "${transgression}". Keep the tone cheerful and loving, not defensive.`,
      config: {
        systemInstruction: GHOSTWRITER_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['title', 'description'],
          },
        },
      },
    });

    const excuses = JSON.parse(response.text || '[]');
    return res.json({ success: true, excuses });
  } catch (error: any) {
    return sendAiError(res, error, 'Excuse generation');
  }
});

// 5. Peace Offerings / Reparations
apiRouter.post('/apology/peace-offerings', async (req: Request, res: Response) => {
  try {
    const { transgression = 'Leaving home for graduate school', relationship = 'mother' } = req.body;

    const response = await generateWithFallback({
      contents: `Generate 4 hilarious yet charming peace offerings, bribes, or reparations for someone who committed this error: "${transgression}" against their ${relationship}. Mix sweet gestures with humorous exaggerations.`,
      config: {
        systemInstruction: GHOSTWRITER_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              offering: { type: Type.STRING, description: 'Short title of the offering' },
              terms: { type: Type.STRING, description: 'Comedic terms or description' },
            },
            required: ['offering', 'terms'],
          },
        },
      },
    });

    const offerings = JSON.parse(response.text || '[]');
    return res.json({ success: true, offerings });
  } catch (error: any) {
    return sendAiError(res, error, 'Peace offerings');
  }
});

// Mount router on both `/api` and `/` so whether Vercel strips or preserves `/api`, all routes match
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
