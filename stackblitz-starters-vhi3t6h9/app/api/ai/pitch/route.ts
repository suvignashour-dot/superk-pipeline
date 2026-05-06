import { NextRequest, NextResponse } from 'next/server';
import { generatePitchSummary } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pitchNotes,
      town,
      tier,
      population,
      widthFt,
      depthFt,
      spName,
      spExperience,
    } = body;

    if (!pitchNotes || pitchNotes.trim().length < 10) {
      return NextResponse.json(
        { error: 'Pitch notes too short' },
        { status: 400 }
      );
    }

    const summary = await generatePitchSummary({
      pitchNotes,
      town,
      tier,
      population,
      widthFt,
      depthFt,
      spName,
      spExperience,
    });

    return NextResponse.json({ summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
