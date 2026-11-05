import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize GoogleGenAI server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Primary lightweight model to avoid high-demand spikes
const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_MODEL = 'gemini-flash-latest';

// Robust helper to generate content with fallback
async function generateWithFallback(params: any) {
  try {
    return await ai.models.generateContent({
      ...params,
      model: PRIMARY_MODEL,
    });
  } catch (error: any) {
    console.warn(`Primary model (${PRIMARY_MODEL}) failed: ${error?.message}. Attempting fallback to ${FALLBACK_MODEL}...`);
    return await ai.models.generateContent({
      ...params,
      model: FALLBACK_MODEL,
    });
  }
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

// 1. Ghostwriter Consult Endpoint (Full 6-Step Interaction Loop)
app.post('/api/ghostwriter/consult', async (req: Request, res: Response) => {
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

${currentDraft ? `Current Draft Under Review:\nTitle: ${currentDraft.title}\nSalutation: ${currentDraft.salutation}\nContent: ${currentDraft.content}\nValediction: ${currentDraft.valediction}\nSignOff: ${currentDraft.signOff}\nP.S.: ${currentDraft.postScript}` : 'No draft yet; draft a fresh rough draft.'}

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
    console.error('Error in ghostwriter consultation:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to consult ghostwriter.',
    });
  }
});

// 2. Refine existing letter endpoint
app.post('/api/apology/refine', async (req: Request, res: Response) => {
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
    console.error('Error refining letter:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to refine the letter.',
    });
  }
});

// 3. Quick Generator (Backwards-compatible, grounded in ghostwriter rules)
app.post('/api/apology/generate', async (req: Request, res: Response) => {
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
    console.error('Error generating letter:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to draft letter.',
    });
  }
});

// 4. Quick Excuses & Anecdotes
app.post('/api/apology/excuse-generator', async (req: Request, res: Response) => {
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
    console.error('Error generating excuses:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate excuses.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Humorous Apology Ghostwriter server running on port ${PORT} using model: ${PRIMARY_MODEL}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
