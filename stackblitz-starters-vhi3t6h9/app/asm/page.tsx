'use client';
import { useState, useEffect } from 'react';
import {
  RENT_OPTIONS,
  TIER_OPTIONS,
  POPULATION_OPTIONS,
  DISTANCE_OPTIONS,
  EXPERIENCE_OPTIONS,
  INCOME_OPTIONS,
  FUNDING_OPTIONS,
  POLITICAL_OPTIONS,
  WHO_RUNS_OPTIONS,
  DEPENDENCY_OPTIONS,
  OPENING_FOR_OPTIONS,
  RISK_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../../lib/constants'

type Tab = 'submit' | 'submissions' | 'tasks';

export default function ASMPage() {
  const [tab, setTab] = useState<Tab>('submit');
  const [locations, setLocations] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [pitchNotes, setPitchNotes] = useState('');
  const [pitchSummary, setPitchSummary] = useState('');
  const [analyzingPitch, setAnalyzingPitch] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [taskResponses, setTaskResponses] = useState<Record<string, string>>(
    {}
  );

  // Form state
  const [form, setForm] = useState({
    asm_name: '',
    asm_email: '',
    town: '',
    maps_link: '',
    width_ft: '',
    depth_ft: '',
    height_ft: '',
    rent_range: RENT_OPTIONS[0],
    town_tier: TIER_OPTIONS[0],
    town_population: POPULATION_OPTIONS[0],
    nearest_superk_distance: DISTANCE_OPTIONS[0],
    nearest_superk_name: '',
    sp_name: '',
    sp_experience: EXPERIENCE_OPTIONS[0],
    sp_opening_for: OPENING_FOR_OPTIONS[0],
    sp_who_runs: WHO_RUNS_OPTIONS[0],
    sp_income_dependency: DEPENDENCY_OPTIONS[0],
    sp_income_range: INCOME_OPTIONS[0],
    sp_funding_source: FUNDING_OPTIONS[0],
    sp_assets: '',
    sp_political: POLITICAL_OPTIONS[0],
    sp_prev_biz_closure: '',
    risk_factors: [] as string[],
    photo_link: '',
    video_360_link: '',
    traffic_8am_link: '',
    traffic_8pm_link: '',
    approach_video_link: '',
    lead_source: LEAD_SOURCE_OPTIONS[0],
  });

  useEffect(() => {
    if (tab === 'submissions') fetchLocations();
    if (tab === 'tasks') fetchTasks();
  }, [tab]);

  async function fetchLocations() {
    const res = await fetch('/api/locations');
    const data = await res.json();
    setLocations(data);
  }

  async function fetchTasks() {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.filter((t: any) => !t.done));
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleRisk(risk: string) {
    setForm((f) => ({
      ...f,
      risk_factors: f.risk_factors.includes(risk)
        ? f.risk_factors.filter((r) => r !== risk)
        : [...f.risk_factors, risk],
    }));
  }

  async function analyzePitch() {
    if (pitchNotes.trim().length < 10) {
      showToast('Please write more about the location first');
      return;
    }
    setAnalyzingPitch(true);
    try {
      const res = await fetch('/api/ai/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitchNotes,
          town: form.town,
          tier: form.town_tier,
          population: form.town_population,
          widthFt: Number(form.width_ft),
          depthFt: Number(form.depth_ft),
          spName: form.sp_name,
          spExperience: form.sp_experience,
        }),
      });
      const data = await res.json();
      setPitchSummary(data.summary || '');
      showToast('AI summary generated!');
    } catch {
      showToast('AI analysis failed — your notes are saved');
    } finally {
      setAnalyzingPitch(false);
    }
  }

  async function handleSubmit() {
    if (!form.town || !form.sp_name || !form.asm_name) {
      showToast('Please fill Town, Your Name, and SP Name');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          width_ft: Number(form.width_ft),
          depth_ft: Number(form.depth_ft),
          height_ft: Number(form.height_ft),
          pitch_notes: pitchNotes,
          pitch_ai_summary: pitchSummary,
          pitch_audio_url: '',
        }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      showToast('Submitted successfully!');
      setPitchNotes('');
      setPitchSummary('');
      setForm((f) => ({ ...f, town: '', sp_name: '', maps_link: '' }));
    } catch {
      showToast('Something went wrong — please try again');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitTaskResponse(taskId: string) {
    const response = taskResponses[taskId];
    if (!response?.trim()) {
      showToast('Please type a response first');
      return;
    }
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true, response }),
    });
    showToast('Response submitted!');
    fetchTasks();
  }

  const inp =
    'w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700/30 bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';
  const sec =
    'text-sm font-bold text-green-700 py-3 border-b-2 border-green-100 mb-3';

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-green-800 text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <span className="text-lg font-bold">
          Super<span className="text-green-300">K</span>
        </span>
        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
          Area Manager
        </span>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 flex sticky top-[52px] z-20">
        {(['submit', 'submissions', 'tasks'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500'
            }`}
          >
            {t === 'submit'
              ? 'Submit Location'
              : t === 'submissions'
              ? 'My Submissions'
              : 'My Tasks'}
          </button>
        ))}
      </div>

      <div className="p-3">
        {/* SUBMIT TAB */}
        {tab === 'submit' && (
          <div>
            <p className={sec}>Your Details</p>
            <div className="mb-3">
              <label className={lbl}>Your Name *</label>
              <input
                className={inp}
                placeholder="e.g. Sudheer Thummala"
                value={form.asm_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, asm_name: e.target.value }))
                }
              />
            </div>
            <div className="mb-3">
              <label className={lbl}>Your Email *</label>
              <input
                className={inp}
                placeholder="you@superk.in"
                type="email"
                value={form.asm_email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, asm_email: e.target.value }))
                }
              />
            </div>

            <p className={sec}>Location Details</p>
            <div className="mb-3">
              <label className={lbl}>Town *</label>
              <input
                className={inp}
                placeholder="e.g. Guntakal"
                value={form.town}
                onChange={(e) =>
                  setForm((f) => ({ ...f, town: e.target.value }))
                }
              />
            </div>
            <div className="mb-3">
              <label className={lbl}>Google Maps Link</label>
              <input
                className={inp}
                placeholder="https://maps.app.goo.gl/..."
                type="url"
                value={form.maps_link}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maps_link: e.target.value }))
                }
              />
            </div>

            {/* Dimension Diagram */}
            <div className="mb-3">
              <label className={lbl}>Store Dimensions (in feet) *</label>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 mb-2">
                <svg
                  viewBox="0 0 300 175"
                  width="100%"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <marker
                      id="aw"
                      markerWidth="7"
                      markerHeight="7"
                      refX="3.5"
                      refY="3.5"
                      orient="auto"
                    >
                      <path d="M0,0 L7,3.5 L0,7 Z" fill="#b45309" />
                    </marker>
                    <marker
                      id="awb"
                      markerWidth="7"
                      markerHeight="7"
                      refX="3.5"
                      refY="3.5"
                      orient="auto-start-reverse"
                    >
                      <path d="M0,0 L7,3.5 L0,7 Z" fill="#b45309" />
                    </marker>
                    <marker
                      id="ad"
                      markerWidth="7"
                      markerHeight="7"
                      refX="3.5"
                      refY="3.5"
                      orient="auto"
                    >
                      <path d="M0,0 L7,3.5 L0,7 Z" fill="#1d4ed8" />
                    </marker>
                    <marker
                      id="adb"
                      markerWidth="7"
                      markerHeight="7"
                      refX="3.5"
                      refY="3.5"
                      orient="auto-start-reverse"
                    >
                      <path d="M0,0 L7,3.5 L0,7 Z" fill="#1d4ed8" />
                    </marker>
                    <marker
                      id="ah"
                      markerWidth="7"
                      markerHeight="7"
                      refX="3.5"
                      refY="3.5"
                      orient="auto"
                    >
                      <path d="M0,0 L7,3.5 L0,7 Z" fill="#7c3aed" />
                    </marker>
                    <marker
                      id="ahb"
                      markerWidth="7"
                      markerHeight="7"
                      refX="3.5"
                      refY="3.5"
                      orient="auto-start-reverse"
                    >
                      <path d="M0,0 L7,3.5 L0,7 Z" fill="#7c3aed" />
                    </marker>
                  </defs>
                  <rect
                    x="70"
                    y="55"
                    width="160"
                    height="95"
                    fill="#dcfce7"
                    stroke="#1a6b3c"
                    strokeWidth="2"
                  />
                  <polygon
                    points="70,55 110,20 270,20 230,55"
                    fill="#bbf7d0"
                    stroke="#1a6b3c"
                    strokeWidth="1.5"
                    strokeDasharray="5,3"
                  />
                  <polygon
                    points="230,55 270,20 270,115 230,150"
                    fill="#a7f3d0"
                    stroke="#1a6b3c"
                    strokeWidth="1.5"
                    strokeDasharray="5,3"
                  />
                  <rect
                    x="135"
                    y="110"
                    width="30"
                    height="40"
                    fill="#86efac"
                    stroke="#1a6b3c"
                    strokeWidth="1"
                  />
                  <line
                    x1="70"
                    y1="162"
                    x2="230"
                    y2="162"
                    stroke="#b45309"
                    strokeWidth="2"
                    markerStart="url(#awb)"
                    markerEnd="url(#aw)"
                  />
                  <text
                    x="150"
                    y="173"
                    textAnchor="middle"
                    fontSize="10"
                    fill="#b45309"
                    fontWeight="700"
                  >
                    WIDTH (storefront facing road)
                  </text>
                  <line
                    x1="232"
                    y1="52"
                    x2="268"
                    y2="22"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    markerStart="url(#adb)"
                    markerEnd="url(#ad)"
                  />
                  <text
                    x="278"
                    y="15"
                    textAnchor="start"
                    fontSize="9"
                    fill="#1d4ed8"
                    fontWeight="700"
                  >
                    DEPTH
                  </text>
                  <text
                    x="278"
                    y="25"
                    textAnchor="start"
                    fontSize="9"
                    fill="#1d4ed8"
                  >
                    (into store)
                  </text>
                  <line
                    x1="55"
                    y1="55"
                    x2="55"
                    y2="150"
                    stroke="#7c3aed"
                    strokeWidth="2"
                    markerStart="url(#ahb)"
                    markerEnd="url(#ah)"
                  />
                  <text
                    x="10"
                    y="108"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#7c3aed"
                    fontWeight="700"
                    transform="rotate(-90,28,103)"
                  >
                    HEIGHT
                  </text>
                </svg>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-bold text-amber-700">Width</span> =
                  storefront facing road &nbsp;|&nbsp;
                  <span className="font-bold text-blue-700">Depth</span> = how
                  far back it goes &nbsp;|&nbsp;
                  <span className="font-bold text-purple-700">Height</span> =
                  floor to ceiling
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={`${lbl} text-amber-700`}>
                    Width (ft) *
                  </label>
                  <input
                    className={inp}
                    type="number"
                    placeholder="e.g. 20"
                    value={form.width_ft}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, width_ft: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={`${lbl} text-blue-700`}>Depth (ft) *</label>
                  <input
                    className={inp}
                    type="number"
                    placeholder="e.g. 40"
                    value={form.depth_ft}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, depth_ft: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={`${lbl} text-purple-700`}>
                    Height (ft) *
                  </label>
                  <input
                    className={inp}
                    type="number"
                    placeholder="e.g. 12"
                    value={form.height_ft}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, height_ft: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className={lbl}>Monthly Rent</label>
                <select
                  className={inp}
                  value={form.rent_range}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rent_range: e.target.value }))
                  }
                >
                  {RENT_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Town Tier</label>
                <select
                  className={inp}
                  value={form.town_tier}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, town_tier: e.target.value }))
                  }
                >
                  {TIER_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className={lbl}>Town Population</label>
                <select
                  className={inp}
                  value={form.town_population}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, town_population: e.target.value }))
                  }
                >
                  {POPULATION_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Nearest SuperK Distance</label>
                <select
                  className={inp}
                  value={form.nearest_superk_distance}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      nearest_superk_distance: e.target.value,
                    }))
                  }
                >
                  {DISTANCE_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className={lbl}>Nearest SuperK Store Name</label>
              <input
                className={inp}
                placeholder="e.g. Rajampeta SuperK or None nearby"
                value={form.nearest_superk_name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    nearest_superk_name: e.target.value,
                  }))
                }
              />
            </div>

            <p className={sec}>Store Partner Details</p>
            <div className="mb-3">
              <label className={lbl}>SP Name *</label>
              <input
                className={inp}
                placeholder="Full name"
                value={form.sp_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sp_name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className={lbl}>Experience</label>
                <select
                  className={inp}
                  value={form.sp_experience}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sp_experience: e.target.value }))
                  }
                >
                  {EXPERIENCE_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Opening For</label>
                <select
                  className={inp}
                  value={form.sp_opening_for}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sp_opening_for: e.target.value }))
                  }
                >
                  {OPENING_FOR_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className={lbl}>Who Runs Daily</label>
                <select
                  className={inp}
                  value={form.sp_who_runs}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sp_who_runs: e.target.value }))
                  }
                >
                  {WHO_RUNS_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Income Dependency</label>
                <select
                  className={inp}
                  value={form.sp_income_dependency}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sp_income_dependency: e.target.value,
                    }))
                  }
                >
                  {DEPENDENCY_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className={lbl}>SP Income</label>
                <select
                  className={inp}
                  value={form.sp_income_range}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sp_income_range: e.target.value }))
                  }
                >
                  {INCOME_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Funding Source</label>
                <select
                  className={inp}
                  value={form.sp_funding_source}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sp_funding_source: e.target.value,
                    }))
                  }
                >
                  {FUNDING_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className={lbl}>SP Assets</label>
              <input
                className={inp}
                placeholder="e.g. Own house, 5 acres land"
                value={form.sp_assets}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sp_assets: e.target.value }))
                }
              />
            </div>
            <div className="mb-3">
              <label className={lbl}>Political Connections</label>
              <select
                className={inp}
                value={form.sp_political}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sp_political: e.target.value }))
                }
              >
                {POLITICAL_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={lbl}>
                If SP closed previous business, why?
              </label>
              <input
                className={inp}
                placeholder="Leave blank if NA"
                value={form.sp_prev_biz_closure}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sp_prev_biz_closure: e.target.value,
                  }))
                }
              />
            </div>

            <p className={sec}>Risk Factors</p>
            <div className="mb-3 space-y-2">
              {RISK_OPTIONS.map((r) => (
                <label
                  key={r}
                  className="flex items-start gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-green-700"
                    checked={form.risk_factors.includes(r)}
                    onChange={() => handleRisk(r)}
                  />
                  <span className="text-sm text-gray-700">{r}</span>
                </label>
              ))}
            </div>

            <p className={sec}>Media Upload</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs text-amber-700">
              Upload each video/photo to Google Drive, copy the shareable link,
              paste it below.
            </div>
            {[
              {
                label: '1. Storefront Photo *',
                hint: 'Clear photo from directly in front',
                key: 'photo_link',
              },
              {
                label: '2. 360° Video of Interior *',
                hint: 'Walk through slowly showing all walls',
                key: 'video_360_link',
              },
              {
                label: '3. 8AM Foot Traffic Video *',
                hint: 'Record outside the store at 8AM',
                key: 'traffic_8am_link',
              },
              {
                label: '4. 8PM Foot Traffic Video *',
                hint: 'Same spot at 8PM',
                key: 'traffic_8pm_link',
              },
              {
                label: '5. Approach Video *',
                hint: 'Walk from 1km away on both sides',
                key: 'approach_video_link',
              },
            ].map(({ label, hint, key }) => (
              <div key={key} className="mb-3">
                <label className={lbl}>{label}</label>
                <p className="text-xs text-gray-400 mb-1">{hint}</p>
                <input
                  className={inp}
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={(form as any)[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                />
              </div>
            ))}

            <p className={sec}>ASM Pitch</p>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 mb-3">
              <p className="text-sm font-semibold text-green-800 mb-1">
                Why is this a great location?
              </p>
              <p className="text-xs text-gray-500 mb-2">
                In your own words — what excites you about this prospect? What
                are the positives?
              </p>
              <textarea
                className={`${inp} min-h-[80px] resize-y`}
                placeholder="e.g. High footfall area, town centre location, SP has 10 years experience, no competition nearby..."
                value={pitchNotes}
                onChange={(e) => setPitchNotes(e.target.value)}
              />
              <button
                onClick={analyzePitch}
                disabled={analyzingPitch}
                className="mt-2 w-full py-2 bg-green-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {analyzingPitch ? 'Analysing...' : '✨ Generate AI Summary'}
              </button>
              {pitchSummary && (
                <div className="mt-3 bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-xs font-bold text-green-700 mb-1">
                    AI Summary
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {pitchSummary}
                  </p>
                </div>
              )}
            </div>

            <p className={sec}>Source of Lead</p>
            <div className="mb-4">
              <label className={lbl}>How did this lead come in?</label>
              <select
                className={inp}
                value={form.lead_source}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lead_source: e.target.value }))
                }
              >
                {LEAD_SOURCE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 bg-green-800 text-white rounded-xl text-base font-bold mb-6 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit for Review →'}
            </button>
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {tab === 'submissions' && (
          <div>
            {locations.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">📭</div>
                <p>No submissions yet</p>
              </div>
            )}
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white rounded-xl border border-gray-200 mb-2.5 p-3.5"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{loc.town}</p>
                    <p className="text-xs text-gray-500">{loc.sp_name}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      STATUS_COLORS[loc.status]
                    }`}
                  >
                    {STATUS_LABELS[loc.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(loc.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* TASKS TAB */}
        {tab === 'tasks' && (
          <div>
            {tasks.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">✅</div>
                <p>No open tasks — you're all clear!</p>
              </div>
            )}
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-gray-200 mb-2.5 p-3.5"
              >
                <p className="font-medium text-gray-900 mb-1">
                  {task.task_description}
                </p>
                <p className="text-xs text-gray-500 mb-0.5">
                  {task.location_town}
                </p>
                {task.deadline && (
                  <p className="text-xs text-amber-600 font-medium mb-3">
                    Due: {task.deadline}
                  </p>
                )}
                <textarea
                  className={`${inp} min-h-[70px] resize-y mb-2`}
                  placeholder="Type your response here..."
                  value={taskResponses[task.id] || ''}
                  onChange={(e) =>
                    setTaskResponses((r) => ({
                      ...r,
                      [task.id]: e.target.value,
                    }))
                  }
                />
                <button
                  onClick={() => submitTaskResponse(task.id)}
                  className="w-full py-2.5 bg-green-800 text-white rounded-lg text-sm font-semibold"
                >
                  Submit Response
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
