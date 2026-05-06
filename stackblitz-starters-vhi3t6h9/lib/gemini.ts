const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 400 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function generatePitchSummary(opts: {
  pitchNotes: string;
  town: string;
  tier: string;
  population: string;
  widthFt: number;
  depthFt: number;
  spName: string;
  spExperience: string;
}): Promise<string> {
  const prompt = `You are analysing an Area Manager's pitch for a new SuperK franchise store location in Andhra Pradesh, India. SuperK is a retail supermarket chain. The ASM summarised their pitch as:

"${opts.pitchNotes}"

Location context:
- Town: ${opts.town} (${opts.tier}, population: ${opts.population})
- Store dimensions: ${opts.widthFt}ft wide x ${opts.depthFt}ft deep
- Store Partner: ${opts.spName} (experience: ${opts.spExperience})

Provide a structured summary in this exact format:

**Headline verdict:** [One punchy sentence - strong, moderate or weak pitch?]

**Key positives mentioned:**
- [Point 1]
- [Point 2]
- [Point 3 if applicable]

**ASM's confidence level:** [High / Medium / Low] - [one sentence reason]

**What the reviewer should probe further:** [1-2 things not addressed or needing verification]

Be concise. Each bullet max 12 words. Plain English, no jargon.`;

  return callGemini(prompt);
}

