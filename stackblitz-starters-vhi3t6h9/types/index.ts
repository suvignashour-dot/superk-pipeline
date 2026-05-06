export type LocationStatus =
  | 'pending'
  | 'reviewing'
  | 'info-needed'
  | 'approved'
  | 'rejected';

export type Decision = 'go' | 'nogo' | null;

export interface Location {
  id: string;
  created_at: string;
  updated_at: string;
  asm_name: string;
  asm_email: string;
  town: string;
  maps_link: string;
  width_ft: number;
  depth_ft: number;
  height_ft: number;
  rent_range: string;
  town_tier: string;
  town_population: string;
  nearest_superk_distance: string;
  nearest_superk_name: string;
  sp_name: string;
  sp_experience: string;
  sp_opening_for: string;
  sp_who_runs: string;
  sp_income_dependency: string;
  sp_income_range: string;
  sp_funding_source: string;
  sp_assets: string;
  sp_political: string;
  sp_prev_biz_closure: string;
  risk_factors: string[];
  photo_link: string;
  video_360_link: string;
  traffic_8am_link: string;
  traffic_8pm_link: string;
  approach_video_link: string;
  lead_source: string;
  pitch_notes: string;
  pitch_ai_summary: string;
  pitch_audio_url: string;
  status: LocationStatus;
  location_score: number | null;
  decision: Decision;
  neeraj_notes: string;
  fathom_link: string;
  suv_score: PartnerScore | null;
  neeraj_score: PartnerScore | null;
  partner_notes: string;
  interview_done: boolean;
}

export interface PartnerScore {
  understanding: number;
  salesmanship: number;
  membership: number;
  reason: number;
  financial: number;
  involvement: number;
  research: number;
}

export const PARTNER_PARAMS: { key: keyof PartnerScore; label: string }[] = [
  { key: 'understanding', label: 'Understanding of SuperK brand & model' },
  { key: 'salesmanship', label: 'Salesmanship & customer orientation' },
  { key: 'membership', label: 'Knowledge of SuperK membership program' },
  { key: 'reason', label: 'Reason to choose SuperK vs independent' },
  { key: 'financial', label: 'Financial strength for settling period' },
  { key: 'involvement', label: 'Owner-operator mindset (not investor)' },
  { key: 'research', label: 'Research done, understands policies & risks' },
];

export interface Task {
  id: string;
  created_at: string;
  location_id: string;
  location_town: string;
  task_description: string;
  assigned_to: string;
  deadline: string;
  done: boolean;
  response: string;
}
