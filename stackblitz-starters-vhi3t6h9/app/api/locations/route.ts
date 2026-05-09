import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function sendSlackNotification(town: string, fathomLink: string, decision: string | null, score: number | null) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const decisionText = decision === 'go' ? '✅ Go Ahead' : decision === 'nogo' ? '❌ No Go' : '⏳ Pending decision'
  const scoreText = score ? `${score}/10` : 'Not scored yet'

  const message = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📍 SuperK Location Review Updated' }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Town:*\n${town}` },
          { type: 'mrkdwn', text: `*Decision:*\n${decisionText}` },
          { type: 'mrkdwn', text: `*Score:*\n${scoreText}` },
        ]
      },
      fathomLink ? {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Fathom Recording:*\n<${fathomLink}|Watch review recording>` }
      } : null,
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Open Pipeline' },
            url: 'https://superk-pipeline.vercel.app/neeraj'
          }
        ]
      }
    ].filter(Boolean)
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', params.id)
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const body = await req.json()

    const { data, error } = await supabase
      .from('locations')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Send Slack notification when Fathom link is saved or decision is made
    if (body.fathom_link || body.decision) {
      await sendSlackNotification(
        data.town,
        data.fathom_link || '',
        data.decision || null,
        data.location_score || null
      ).catch(() => {}) // don't fail if Slack is down
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
