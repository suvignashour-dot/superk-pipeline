import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function col(row: any[], index: number): string {
  return (row[index] ?? '').toString().trim()
}

export async function POST() {
  try {
    const SHEET_ID = '18SEJMBgx70RLNc82TUeI6fX3AXmcN29W7DDXDTj9TOY'
    const SHEET_NAME = 'Form Responses 1'
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`

    const res = await fetch(url)
    const text = await res.text()

    // Google wraps the JSON in a callback — strip it
    const json = JSON.parse(text.replace(/^.*?({.*}).*?$/s, '$1'))
    const rows: any[][] = json.table.rows.map((r: any) =>
      r.c.map((cell: any) => cell?.v ?? cell?.f ?? '')
    )

    // Skip header row
    const dataRows = rows.slice(1).filter(r => col(r, 2)) // must have town

    const supabase = getSupabase()

    // Get existing towns to avoid duplicates
    const { data: existing } = await supabase
      .from('locations')
      .select('town, asm_email, created_at')

    const existingKeys = new Set(
      (existing ?? []).map((l: any) =>
        `${l.town?.toLowerCase()}_${l.asm_email?.toLowerCase()}`
      )
    )

    let inserted = 0
    let skipped = 0

    for (const row of dataRows) {
      const town = col(row, 2)
      const asmEmail = col(row, 1)
      const key = `${town.toLowerCase()}_${asmEmail.toLowerCase()}`

      if (existingKeys.has(key)) {
        skipped++
        continue
      }

      // Parse dimensions from col L (e.g. "16*10" or "20x12")
      const dimRaw = col(row, 11)
      const dimMatch = dimRaw.match(/(\d+\.?\d*)[x*×](\d+\.?\d*)/i)
      const width_ft = dimMatch ? parseFloat(dimMatch[1]) : null
      const depth_ft = dimMatch ? parseFloat(dimMatch[2]) : null

      // Parse risk factors from col AR (index 43)
      const riskRaw = col(row, 43)
      const risk_factors = riskRaw
        ? riskRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []

      const location = {
        asm_email:                asmEmail,
        asm_name:                 col(row, 4),
        town:                     town,
        maps_link:                col(row, 6),
        width_ft:                 width_ft,
        depth_ft:                 depth_ft,
        height_ft:                null,
        rent_range:               col(row, 13),
        town_tier:                col(row, 14),
        town_population:          col(row, 33), // AH
        nearest_superk_distance:  col(row, 34), // AI
        nearest_superk_name:      '',
        sp_name:                  col(row, 17), // R
        sp_experience:            col(row, 18), // S
        sp_opening_for:           col(row, 19), // T
        sp_who_runs:              col(row, 20), // U
        sp_income_dependency:     col(row, 23), // X
        sp_income_range:          col(row, 24), // Y
        sp_funding_source:        col(row, 41), // AP
        sp_assets:                col(row, 26), // AA
        sp_political:             col(row, 21), // V
        sp_prev_biz_closure:      '',
        risk_factors:             risk_factors,
        photo_link:               col(row, 8),  // I
        video_360_link:           col(row, 7),  // H
        traffic_8am_link:         col(row, 48), // AW
        traffic_8pm_link:         '',
        approach_video_link:      '',
        lead_source:              col(row, 44), // AS
        pitch_notes:              '',
        pitch_ai_summary:         '',
        pitch_audio_url:          '',
        status:                   'pending',
        location_score:           null,
        decision:                 null,
        neeraj_notes:             '',
        fathom_link:              '',
        suv_score:                null,
        neeraj_score:             null,
        partner_notes:            '',
        interview_done:           false,
      }

      const { error } = await supabase.from('locations').insert([location])
      if (!error) {
        inserted++
        existingKeys.add(key)
      }
    }

    return NextResponse.json({
      success: true,
      inserted,
      skipped,
      message: `Synced ${inserted} new locations. ${skipped} already existed.`
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
