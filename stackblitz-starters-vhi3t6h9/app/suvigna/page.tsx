'use client';
import { useState, useEffect } from 'react';
import { STATUS_LABELS, STATUS_COLORS } from '../../lib/constants';
import { PARTNER_PARAMS } from '@/types';
import type { Location, Task, PartnerScore } from '@/types';

type Tab = 'pipeline' | 'partners' | 'tasks';

export default function SuvignaPage() {
  const [tab, setTab] = useState<Tab>('pipeline');
  const [locations, setLocations] = useState<Location[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Location | null>(null);
  const [partnerLoc, setPartnerLoc] = useState<Location | null>(null);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [scores, setScores] = useState<Partial<PartnerScore>>({});
  const [partnerNotes, setPartnerNotes] = useState('');
  const [interviewDone, setInterviewDone] = useState(false);
  const [savingPartner, setSavingPartner] = useState(false);
  const [newTask, setNewTask] = useState({
    location_id: '',
    task_description: '',
    assigned_to: '',
    deadline: '',
  });
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);
  useEffect(() => {
    if (tab === 'tasks') fetchTasks();
  }, [tab]);

  async function fetchLocations() {
    try {
      const res = await fetch('/api/locations')
      const data = await res.json()
      setLocations(Array.isArray(data) ? data : [])
    } catch {
      setLocations([])
    }
  }

 async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch {
      setTasks([])
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function openPartner(loc: Location) {
    setPartnerLoc(loc);
    setScores(loc.suv_score ?? {});
    setPartnerNotes(loc.partner_notes ?? '');
    setInterviewDone(loc.interview_done ?? false);
  }

  async function updateStatus(id: string, status: string) {
    setStatusUpdating(true);
    await fetch(`/api/locations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    showToast('Status updated');
    setStatusUpdating(false);
    fetchLocations();
    setSelected((prev) => (prev ? { ...prev, status: status as any } : null));
  }

  async function savePartner() {
    if (!partnerLoc) return;
    const complete = PARTNER_PARAMS.every((p) => scores[p.key]);
    if (!complete) {
      showToast('Please rate all 7 criteria');
      return;
    }
    setSavingPartner(true);
    await fetch(`/api/locations/${partnerLoc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suv_score: scores,
        partner_notes: partnerNotes,
        interview_done: interviewDone,
      }),
    });
    showToast('Partner evaluation saved!');
    setSavingPartner(false);
    fetchLocations();
    setPartnerLoc(null);
  }

  async function assignTask() {
    if (!newTask.task_description || !newTask.location_id) {
      showToast('Please fill location and task description');
      return;
    }
    const loc = locations.find((l) => l.id === newTask.location_id);
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newTask,
        location_town: loc?.town ?? '',
        done: false,
        response: '',
      }),
    });
    showToast('Task assigned!');
    setNewTask({
      location_id: '',
      task_description: '',
      assigned_to: '',
      deadline: '',
    });
    fetchTasks();
  }

  const filtered = locations.filter((l) => {
    const ms =
      !search ||
      l.town.toLowerCase().includes(search.toLowerCase()) ||
      l.sp_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.asm_name?.toLowerCase().includes(search.toLowerCase());
    const mf = filter === 'all' || l.status === filter;
    return ms && mf;
  });

  const pending = locations.filter((l) => l.status === 'pending').length;
  const approved = locations.filter((l) => l.status === 'approved').length;

  const inp =
    'w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700/30 bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-green-800 text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <span className="text-lg font-bold">
          Super<span className="text-green-300">K</span>
        </span>
        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
          Suvigna · Store Ops
        </span>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 flex sticky top-[52px] z-20">
        {(['pipeline', 'partners', 'tasks'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500'
            }`}
          >
            {t === 'pipeline'
              ? 'All Locations'
              : t === 'partners'
              ? 'Partner Eval'
              : 'Tasks'}
          </button>
        ))}
      </div>

      <div className="p-3">
        {/* PIPELINE TAB */}
        {tab === 'pipeline' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                {
                  label: 'Total',
                  value: locations.length,
                  color: 'text-green-700',
                },
                { label: 'Pending', value: pending, color: 'text-amber-600' },
                { label: 'Approved', value: approved, color: 'text-green-700' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-lg border border-gray-200 p-3 text-center"
                >
                  <div className={`text-2xl font-bold ${s.color}`}>
                    {s.value}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Search + Filter */}
            <div className="flex gap-2 mb-3">
              <input
                className={`${inp} flex-1`}
                placeholder="Search town, SP, ASM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="px-2 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="info-needed">Info Needed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">🔍</div>
                <p>No matches</p>
              </div>
            )}

            {filtered.map((loc) => (
              <div
                key={loc.id}
                onClick={() => setSelected(loc)}
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
                  {loc.width_ft && (
                    <span className="text-xs text-gray-500">
                      📐 <b>{Math.round(loc.width_ft * loc.depth_ft)} sft</b>
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    🏙️ <b>{loc.town_tier?.split(' ')[0]}</b>
                  </span>
                  <span className="text-xs text-gray-500">
                    💰 <b>{loc.rent_range}</b>
                  </span>
                </div>
                <div className="border-t border-gray-100 px-3.5 py-2 flex justify-between">
                  <span className="text-xs text-gray-400">
                    {new Date(loc.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span className="text-xs text-green-700 font-medium">
                    View →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PARTNERS TAB */}
        {tab === 'partners' && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-xs text-blue-700">
              Store partners appear here automatically from ASM submissions.
              Rate each SP after your video call interview.
            </div>
            {locations
              .filter((l) => l.sp_name)
              .map((loc) => {
                const rated = PARTNER_PARAMS.every(
                  (p) => (loc.suv_score as any)?.[p.key]
                );
                const avg = rated
                  ? (
                      PARTNER_PARAMS.reduce(
                        (a, p) => a + ((loc.suv_score as any)[p.key] ?? 0),
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
                      {rated ? (
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                          {avg}/5 ★
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Not rated
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 px-3.5 pb-3">
                      <span className="text-xs text-gray-500">
                        🏢 <b>{loc.sp_experience}</b>
                      </span>
                      <span className="text-xs text-gray-500">
                        💰 <b>{loc.sp_income_range}</b>
                      </span>
                    </div>
                    <div className="border-t border-gray-100 px-3.5 py-2 flex justify-end">
                      <span className="text-xs text-green-700 font-medium">
                        {rated ? 'View ratings' : 'Rate SP'} →
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* TASKS TAB */}
        {tab === 'tasks' && (
          <div>
            {/* Assign new task */}
            <div className="bg-white rounded-xl border border-gray-200 p-3.5 mb-3">
              <p className="text-sm font-bold text-gray-700 mb-3">
                Assign Task to ASM
              </p>
              <div className="mb-2">
                <label className={lbl}>Location</label>
                <select
                  className={inp}
                  value={newTask.location_id}
                  onChange={(e) =>
                    setNewTask((t) => ({ ...t, location_id: e.target.value }))
                  }
                >
                  <option value="">Select location...</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.town} – {l.sp_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className={lbl}>Task Description</label>
                <textarea
                  className={`${inp} min-h-[70px] resize-y`}
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
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className={lbl}>Assigned To</label>
                  <input
                    className={inp}
                    placeholder="ASM name"
                    value={newTask.assigned_to}
                    onChange={(e) =>
                      setNewTask((t) => ({ ...t, assigned_to: e.target.value }))
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
                      setNewTask((t) => ({ ...t, deadline: e.target.value }))
                    }
                  />
                </div>
              </div>
              <button
                onClick={assignTask}
                className="w-full py-2.5 bg-green-800 text-white rounded-lg text-sm font-semibold"
              >
                Assign Task
              </button>
            </div>

            {/* Task list */}
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-gray-200 mb-2.5 p-3.5"
              >
                <p className="font-medium text-gray-900 mb-1">
                  {task.task_description}
                </p>
                <p className="text-xs text-gray-500">
                  {task.location_town} · → {task.assigned_to}
                </p>
                {task.deadline && (
                  <p className="text-xs text-amber-600 font-medium mt-0.5">
                    Due: {task.deadline}
                  </p>
                )}
                <span
                  className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    task.done
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {task.done ? 'Done' : 'Open'}
                </span>
                {task.done && task.response && (
                  <div className="mt-2 bg-green-50 rounded-lg p-2 text-xs text-green-800">
                    ✓ {task.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOCATION DETAIL PANEL */}
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
                <div>
                  <span className="text-xs text-gray-400 block">Political</span>
                  <span className="font-medium">{selected.sp_political}</span>
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

            {/* AI Pitch Summary */}
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
                    🎥 360° Video
                  </a>
                )}
                {selected.traffic_8am_link && (
                  <a
                    href={selected.traffic_8am_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md font-medium"
                  >
                    🚶 8AM Traffic
                  </a>
                )}
                {selected.traffic_8pm_link && (
                  <a
                    href={selected.traffic_8pm_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md font-medium"
                  >
                    🌆 8PM Traffic
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

            {/* Status Update */}
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Update Status
              </p>
              <div className="flex flex-wrap gap-2">
                {['pending', 'reviewing', 'info-needed'].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    disabled={statusUpdating}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                      selected.status === s
                        ? 'bg-green-700 text-white border-green-700'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Neeraj notes if available */}
            {selected.neeraj_notes && (
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Neeraj's Notes
                </p>
                <div className="bg-green-50 rounded-lg p-3 text-sm text-gray-700">
                  {selected.neeraj_notes}
                </div>
                {selected.location_score && (
                  <p className="mt-2 text-sm">
                    Score:{' '}
                    <strong className="text-green-700">
                      {selected.location_score}/10
                    </strong>{' '}
                    · Decision:{' '}
                    <strong
                      className={
                        selected.decision === 'go'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {selected.decision === 'go' ? '✅ Go' : '❌ No Go'}
                    </strong>
                  </p>
                )}
              </div>
            )}

            {selected.fathom_link && (
              <div className="px-4 py-3 border-t border-gray-100">
                <a
                  href={selected.fathom_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg font-semibold"
                >
                  📹 Fathom Review Recording
                </a>
              </div>
            )}

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

            {/* SP Profile */}
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Partner Profile
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-gray-400 block">
                    Experience
                  </span>
                  <span className="font-medium">
                    {partnerLoc.sp_experience}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Opens For</span>
                  <span className="font-medium">
                    {partnerLoc.sp_opening_for}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Who Runs</span>
                  <span className="font-medium">{partnerLoc.sp_who_runs}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Income</span>
                  <span className="font-medium">
                    {partnerLoc.sp_income_range}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Funding</span>
                  <span className="font-medium">
                    {partnerLoc.sp_funding_source}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Political</span>
                  <span className="font-medium">{partnerLoc.sp_political}</span>
                </div>
              </div>
              {partnerLoc.sp_assets && (
                <div className="mt-2 text-sm">
                  <span className="text-xs text-gray-400 block">Assets</span>
                  {partnerLoc.sp_assets}
                </div>
              )}
            </div>

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
              {!interviewDone && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-2">
                  Rate the SP only after completing the video call interview.
                </p>
              )}
            </div>

            {/* Star ratings */}
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
                disabled={savingPartner}
                className="w-full mt-3 py-3 bg-green-800 text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                {savingPartner ? 'Saving...' : 'Save Evaluation'}
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
