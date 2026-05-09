'use client';
import { useState, useEffect } from 'react';
import { STATUS_LABELS, STATUS_COLORS } from '../../lib/constants';
import { PARTNER_PARAMS } from '@/types';
import type { Location, Task, PartnerScore } from '@/types';

type Tab = 'queue' | 'partners' | 'decided';

export default function NeerajPage() {
  const [tab, setTab] = useState<Tab>('queue');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selected, setSelected] = useState<Location | null>(null);
  const [partnerLoc, setPartnerLoc] = useState<Location | null>(null);
  const [toast, setToast] = useState('');
  const [scores, setScores] = useState<Partial<PartnerScore>>({});
  const [partnerNotes, setPartnerNotes] = useState('');
  const [interviewDone, setInterviewDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState({
    neeraj_notes: '',
    location_score: 0,
    decision: '' as 'go' | 'nogo' | '',
    fathom_link: '',
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    task_description: '',
    assigned_to: '',
    deadline: '',
  });
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

useEffect(() => { fetchLocations() }, [])

  async function fetchLocations() {
    try {
      const res = await fetch('/api/locations')
      const data = await res.json()
      setLocations(Array.isArray(data) ? data : [])
    } catch {
      setLocations([])
    }
  }

  async function fetchTasksForLocation(locationId: string) {
    const res = await fetch(`/api/tasks?location_id=${locationId}`);
    const data = await res.json();
    setTasks(data);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function openLocation(loc: Location) {
    setSelected(loc);
    setReview({
      neeraj_notes: loc.neeraj_notes ?? '',
      location_score: loc.location_score ?? 0,
      decision: (loc.decision ?? '') as 'go' | 'nogo' | '',
      fathom_link: loc.fathom_link ?? '',
    });
    fetchTasksForLocation(loc.id);
  }

  function openPartner(loc: Location) {
    setPartnerLoc(loc);
    setScores(loc.neeraj_score ?? {});
    setPartnerNotes(loc.partner_notes ?? '');
    setInterviewDone(loc.interview_done ?? false);
  }

  async function saveReview() {
    if (!selected) return;
    setSaving(true);
    const status =
      review.decision === 'go'
        ? 'approved'
        : review.decision === 'nogo'
        ? 'rejected'
        : review.location_score
        ? 'reviewing'
        : 'pending';
    await fetch(`/api/locations/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        neeraj_notes: review.neeraj_notes,
        location_score: review.location_score || null,
        decision: review.decision || null,
        fathom_link: review.fathom_link,
        status,
      }),
    });
    showToast('Review saved!');
    setSaving(false);
    fetchLocations();
    setSelected(null);
  }

  async function savePartner() {
    if (!partnerLoc) return;
    const complete = PARTNER_PARAMS.every((p) => scores[p.key]);
    if (!complete) {
      showToast('Please rate all 7 criteria');
      return;
    }
    setSaving(true);
    await fetch(`/api/locations/${partnerLoc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        neeraj_score: scores,
        partner_notes: partnerNotes,
        interview_done: interviewDone,
      }),
    });
    showToast('Partner evaluation saved!');
    setSaving(false);
    fetchLocations();
    setPartnerLoc(null);
  }

  async function addTask() {
    if (!selected || !newTask.task_description) {
      showToast('Please enter a task description');
      return;
    }
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location_id: selected.id,
        location_town: selected.town,
        task_description: newTask.task_description,
        assigned_to: newTask.assigned_to || selected.asm_name,
        deadline: newTask.deadline,
        done: false,
        response: '',
      }),
    });
    showToast('Task added!');
    setNewTask({ task_description: '', assigned_to: '', deadline: '' });
    setAddingTask(false);
    fetchTasksForLocation(selected.id);
  }

  const queue = locations.filter(
    (l) => !['approved', 'rejected'].includes(l.status)
  );
  const decided = locations.filter((l) =>
    ['approved', 'rejected'].includes(l.status)
  );

  const inp =
    'w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700/30 bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

  function LocationCard({ loc }: { loc: Location }) {
    const sqft =
      loc.width_ft && loc.depth_ft
        ? Math.round(loc.width_ft * loc.depth_ft)
        : null;
    return (
      <div
        onClick={() => openLocation(loc)}
        className="bg-white rounded-xl border border-gray-200 mb-2.5 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between gap-2 px-3.5 pt-3.5 pb-2">
          <div>
            <p className="font-semibold text-gray-900">{loc.town}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {loc.sp_name} · {loc.asm_name}
            </p>
          </div>
          <span
            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
              STATUS_COLORS[loc.status]
            }`}
          >
            {STATUS_LABELS[loc.status]}
          </span>
        </div>
        <div className="flex gap-3 px-3.5 pb-3 flex-wrap">
          {sqft && (
            <span className="text-xs text-gray-500">
              📐 <b>{sqft} sft</b>
            </span>
          )}
          <span className="text-xs text-gray-500">
            🏙️ <b>{loc.town_tier?.split(' ')[0]}</b>
          </span>
          <span className="text-xs text-gray-500">
            💰 <b>{loc.rent_range}</b>
          </span>
          {loc.location_score && (
            <span className="text-xs text-gray-500">
              ⭐ <b>{loc.location_score}/10</b>
            </span>
          )}
        </div>
        <div className="border-t border-gray-100 px-3.5 py-2 flex justify-between">
          <span className="text-xs text-gray-400">
            {new Date(loc.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
          <span className="text-xs text-green-700 font-medium">Review →</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-green-800 text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <span className="text-lg font-bold">
          Super<span className="text-green-300">K</span>
        </span>
        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
          Neeraj · Founder
        </span>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 flex sticky top-[52px] z-20">
        {(['queue', 'partners', 'decided'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500'
            }`}
          >
            {t === 'queue'
              ? `Review Queue${queue.length ? ` (${queue.length})` : ''}`
              : t === 'partners'
              ? 'Partner Eval'
              : 'Decided'}
          </button>
        ))}
      </div>

      <div className="p-3">
        {/* QUEUE TAB */}
        {tab === 'queue' && (
          <div>
            {queue.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">🎉</div>
                <p>Review queue is clear!</p>
              </div>
            )}
            {queue.map((loc) => (
              <LocationCard key={loc.id} loc={loc} />
            ))}
          </div>
        )}

        {/* PARTNERS TAB */}
        {tab === 'partners' && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-xs text-blue-700">
              Rate each SP after your video call. Suvigna's ratings are shown
              for reference.
            </div>
            {locations
              .filter((l) => l.sp_name)
              .map((loc) => {
                const suvRated = PARTNER_PARAMS.every(
                  (p) => (loc.suv_score as any)?.[p.key]
                );
                const suvAvg = suvRated
                  ? (
                      PARTNER_PARAMS.reduce(
                        (a, p) => a + ((loc.suv_score as any)[p.key] ?? 0),
                        0
                      ) / PARTNER_PARAMS.length
                    ).toFixed(1)
                  : null;
                const neerajRated = PARTNER_PARAMS.every(
                  (p) => (loc.neeraj_score as any)?.[p.key]
                );
                const neerajAvg = neerajRated
                  ? (
                      PARTNER_PARAMS.reduce(
                        (a, p) => a + ((loc.neeraj_score as any)[p.key] ?? 0),
                        0
                      ) / PARTNER_PARAMS.length
                    ).toFixed(1)
                  : null;
                return (
                  <div
                    key={loc.id}
                    onClick={() => openPartner(loc)}
                    className="bg-white rounded-xl border border-gray-200 mb-2.5 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2 px-3.5 pt-3.5 pb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {loc.sp_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {loc.town} · {loc.asm_name}
                        </p>
                      </div>
                      {neerajRated ? (
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                          {neerajAvg}/5 ★
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Not rated
                        </span>
                      )}
                    </div>
                    <div className="border-t border-gray-100 px-3.5 py-2 flex justify-between">
                      <span className="text-xs text-gray-500">
                        Suvigna: {suvRated ? `${suvAvg}/5 ★` : 'Pending'}
                      </span>
                      <span className="text-xs text-green-700 font-medium">
                        Rate →
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* DECIDED TAB */}
        {tab === 'decided' && (
          <div>
            {decided.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">📊</div>
                <p>No decisions yet</p>
              </div>
            )}
            {decided.map((loc) => (
              <LocationCard key={loc.id} loc={loc} />
            ))}
          </div>
        )}
      </div>

      {/* LOCATION REVIEW PANEL */}
      {selected && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setSelected(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[92vh] bg-white rounded-t-[20px] overflow-y-auto max-w-lg mx-auto">
            <div className="w-9 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
            <div className="px-4 pt-4 pb-3 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">{selected.town}</h2>
                <p className="text-xs text-gray-500">
                  ASM: {selected.asm_name}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Location Info */}
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Location
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {selected.width_ft && (
                  <div>
                    <span className="text-xs text-gray-400 block">
                      Dimensions
                    </span>
                    <span className="font-medium">
                      {selected.width_ft}w × {selected.depth_ft}d ×{' '}
                      {selected.height_ft}h ft
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-400 block">Rent</span>
                  <span className="font-medium">{selected.rent_range}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Tier</span>
                  <span className="font-medium">{selected.town_tier}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">
                    Population
                  </span>
                  <span className="font-medium">
                    {selected.town_population}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">
                    Nearest SuperK
                  </span>
                  <span className="font-medium">
                    {selected.nearest_superk_distance}
                    {selected.nearest_superk_name
                      ? ` · ${selected.nearest_superk_name}`
                      : ''}
                  </span>
                </div>
              </div>
              {selected.maps_link && (
                <a
                  href={selected.maps_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md font-medium"
                >
                  📍 Open in Maps
                </a>
              )}
            </div>

            {/* SP Info */}
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Store Partner
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-gray-400 block">Name</span>
                  <span className="font-medium">{selected.sp_name}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">
                    Experience
                  </span>
                  <span className="font-medium">{selected.sp_experience}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Income</span>
                  <span className="font-medium">
                    {selected.sp_income_range}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Funding</span>
                  <span className="font-medium">
                    {selected.sp_funding_source}
                  </span>
                </div>
              </div>
              {selected.sp_assets && (
                <div className="mt-2 text-sm">
                  <span className="text-xs text-gray-400 block">Assets</span>
                  {selected.sp_assets}
                </div>
              )}
            </div>

            {/* Risks */}
            {(selected.risk_factors?.length ?? 0) > 0 && (
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Risk Flags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.risk_factors.map((r) => (
                    <span
                      key={r}
                      className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suvigna Partner Rating */}
            {selected.suv_score && (
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Suvigna's Partner Ratings
                </p>
                {PARTNER_PARAMS.map((p) => (
                  <div
                    key={p.key}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm text-gray-700 flex-1 pr-3">
                      {p.label}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`text-lg ${
                            ((selected.suv_score as any)[p.key] ?? 0) >= n
                              ? 'text-amber-400'
                              : 'text-gray-200'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {selected.partner_notes && (
                  <div className="mt-2 bg-gray-50 rounded-lg p-2 text-xs text-gray-600">
                    {selected.partner_notes}
                  </div>
                )}
              </div>
            )}

            {/* AI Pitch */}
            {selected.pitch_ai_summary && (
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  🎤 ASM Pitch — AI Summary
                </p>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selected.pitch_ai_summary}
                </div>
              </div>
            )}

            {/* Media */}
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Media
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.photo_link && (
                  <a
                    href={selected.photo_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md font-medium"
                  >
                    📷 Photo
                  </a>
                )}
                {selected.video_360_link && (
                  <a
                    href={selected.video_360_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md font-medium"
                  >
                    🎥 360°
                  </a>
                )}
                {selected.traffic_8am_link && (
                  <a
                    href={selected.traffic_8am_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md font-medium"
                  >
                    🚶 8AM
                  </a>
                )}
                {selected.traffic_8pm_link && (
                  <a
                    href={selected.traffic_8pm_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md font-medium"
                  >
                    🌆 8PM
                  </a>
                )}
                {selected.approach_video_link && (
                  <a
                    href={selected.approach_video_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md font-medium"
                  >
                    🛣️ Approach
                  </a>
                )}
              </div>
            </div>

            {/* Tasks */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tasks
                </p>
                <button
                  onClick={() => setAddingTask((v) => !v)}
                  className="text-xs text-green-700 font-semibold"
                >
                  + Add Task
                </button>
              </div>
              {addingTask && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="mb-2">
                    <label className={lbl}>Task Description</label>
                    <textarea
                      className={`${inp} min-h-[60px] resize-y`}
                      placeholder="What do you need from the ASM?"
                      value={newTask.task_description}
                      onChange={(e) =>
                        setNewTask((t) => ({
                          ...t,
                          task_description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className={lbl}>Assigned To</label>
                      <input
                        className={inp}
                        placeholder={selected.asm_name}
                        value={newTask.assigned_to}
                        onChange={(e) =>
                          setNewTask((t) => ({
                            ...t,
                            assigned_to: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className={lbl}>Deadline</label>
                      <input
                        className={inp}
                        type="date"
                        value={newTask.deadline}
                        onChange={(e) =>
                          setNewTask((t) => ({
                            ...t,
                            deadline: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={addTask}
                    className="w-full py-2 bg-green-800 text-white rounded-lg text-sm font-semibold"
                  >
                    Add Task
                  </button>
                </div>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-2.5 mb-2 bg-white"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {task.task_description}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    → {task.assigned_to}
                    {task.deadline ? ` · Due: ${task.deadline}` : ''}
                  </p>
                  <span
                    className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      task.done
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {task.done ? 'Done' : 'Open'}
                  </span>
                  {task.done && task.response && (
                    <div className="mt-1.5 bg-green-50 rounded p-2 text-xs text-green-800">
                      ✓ {task.response}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Neeraj Review Form */}
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Your Review
              </p>
              <div className="mb-3">
                <label className={lbl}>Notes</label>
                <textarea
                  className={`${inp} min-h-[80px] resize-y`}
                  placeholder="Add your observations..."
                  value={review.neeraj_notes}
                  onChange={(e) =>
                    setReview((r) => ({ ...r, neeraj_notes: e.target.value }))
                  }
                />
              </div>
              <div className="mb-3">
                <label className={lbl}>Fathom Meeting Link</label>
                <input
                  className={inp}
                  type="url"
                  placeholder="https://fathom.video/share/..."
                  value={review.fathom_link}
                  onChange={(e) =>
                    setReview((r) => ({ ...r, fathom_link: e.target.value }))
                  }
                />
                {review.fathom_link && (
                  <a
                    href={review.fathom_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md font-medium"
                  >
                    📹 Open Recording
                  </a>
                )}
              </div>
              <div className="mb-3">
                <label className={lbl}>Location Score (1–10)</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() =>
                        setReview((r) => ({ ...r, location_score: n }))
                      }
                      className={`w-9 h-9 rounded-lg text-sm font-bold border-2 transition-all ${
                        review.location_score === n
                          ? n >= 7
                            ? 'bg-green-700 text-white border-green-700'
                            : n >= 5
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className={lbl}>Final Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setReview((r) => ({ ...r, decision: 'go' }))}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                      review.decision === 'go'
                        ? 'bg-green-700 text-white border-green-700'
                        : 'bg-white text-green-700 border-green-300'
                    }`}
                  >
                    ✅ Go Ahead
                  </button>
                  <button
                    onClick={() =>
                      setReview((r) => ({ ...r, decision: 'nogo' }))
                    }
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                      review.decision === 'nogo'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-red-600 border-red-300'
                    }`}
                  >
                    ❌ No Go
                  </button>
                </div>
              </div>
              <button
                onClick={saveReview}
                disabled={saving}
                className="w-full py-3.5 bg-green-800 text-white rounded-xl text-base font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Review'}
              </button>
            </div>
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* PARTNER EVAL PANEL */}
      {partnerLoc && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setPartnerLoc(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[92vh] bg-white rounded-t-[20px] overflow-y-auto max-w-lg mx-auto">
            <div className="w-9 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
            <div className="px-4 pt-4 pb-3 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">{partnerLoc.sp_name}</h2>
                <p className="text-xs text-gray-500">
                  {partnerLoc.town} · {partnerLoc.asm_name}
                </p>
              </div>
              <button
                onClick={() => setPartnerLoc(null)}
                className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Suvigna ratings for reference */}
            {partnerLoc.suv_score && (
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Suvigna's Ratings
                </p>
                {PARTNER_PARAMS.map((p) => (
                  <div
                    key={p.key}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm text-gray-700 flex-1 pr-3">
                      {p.label}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`text-lg ${
                            ((partnerLoc.suv_score as any)[p.key] ?? 0) >= n
                              ? 'text-amber-400'
                              : 'text-gray-200'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Interview toggle */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Video call with SP completed?
                </p>
                <button
                  onClick={() => setInterviewDone((v) => !v)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                    interviewDone
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {interviewDone ? '✓ Done' : 'Mark Done'}
                </button>
              </div>
            </div>

            {/* Neeraj ratings */}
            <div
              className={`px-4 py-3 border-t border-gray-100 ${
                !interviewDone ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Your Rating
              </p>
              {PARTNER_PARAMS.map((p) => (
                <div
                  key={p.key}
                  className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-700 flex-1 pr-3">
                    {p.label}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        onClick={() => setScores((s) => ({ ...s, [p.key]: n }))}
                        className={`text-xl cursor-pointer transition-colors ${
                          (scores[p.key] ?? 0) >= n
                            ? 'text-amber-400'
                            : 'text-gray-200'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mt-3">
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Notes
                </label>
                <textarea
                  className={`${inp} min-h-[70px] resize-y`}
                  placeholder="Observations from the interview..."
                  value={partnerNotes}
                  onChange={(e) => setPartnerNotes(e.target.value)}
                />
              </div>
              <button
                onClick={savePartner}
                disabled={saving}
                className="w-full mt-3 py-3 bg-green-800 text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Evaluation'}
              </button>
            </div>
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
