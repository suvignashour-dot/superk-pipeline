import { supabase } from './supabase';
import type { Location, Task, PartnerScore, LocationStatus } from '@/types';

// ─── LOCATIONS ───────────────────────────────────────────────

export async function getLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Location[];
}

export async function getLocation(id: string): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Location;
}

export async function createLocation(
  form: Omit<
    Location,
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'status'
    | 'location_score'
    | 'decision'
    | 'neeraj_notes'
    | 'fathom_link'
    | 'suv_score'
    | 'neeraj_score'
    | 'partner_notes'
    | 'interview_done'
  >
): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .insert([{ ...form, status: 'pending' }])
    .select()
    .single();
  if (error) throw error;
  return data as Location;
}

export async function updateLocation(
  id: string,
  updates: Partial<Location>
): Promise<void> {
  const { error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function updateStatus(
  id: string,
  status: LocationStatus
): Promise<void> {
  return updateLocation(id, { status });
}

export async function saveReview(
  id: string,
  opts: {
    neeraj_notes: string;
    location_score: number | null;
    decision: 'go' | 'nogo' | null;
    fathom_link: string;
  }
): Promise<void> {
  const status: LocationStatus =
    opts.decision === 'go'
      ? 'approved'
      : opts.decision === 'nogo'
      ? 'rejected'
      : opts.location_score
      ? 'reviewing'
      : 'pending';
  return updateLocation(id, { ...opts, status });
}

export async function savePartnerScore(
  id: string,
  role: 'suvigna' | 'neeraj',
  score: PartnerScore,
  notes: string,
  interviewDone: boolean
): Promise<void> {
  const field = role === 'suvigna' ? 'suv_score' : 'neeraj_score';
  return updateLocation(id, {
    [field]: score,
    partner_notes: notes,
    interview_done: interviewDone,
  });
}

export async function markInterviewDone(
  id: string,
  done: boolean
): Promise<void> {
  return updateLocation(id, { interview_done: done });
}

// ─── TASKS ───────────────────────────────────────────────────

export async function getTasks(locationId?: string): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  if (locationId) {
    query = query.eq('location_id', locationId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as Task[];
}

export async function createTask(
  task: Omit<Task, 'id' | 'created_at'>
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();
  if (error) throw error;
  return data as Task;
}

export async function completeTask(
  id: string,
  response: string
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ done: true, response })
    .eq('id', id);
  if (error) throw error;
}

