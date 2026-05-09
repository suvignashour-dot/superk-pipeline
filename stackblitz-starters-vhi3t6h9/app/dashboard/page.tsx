'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:       { label: 'Pending Review',  color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  reviewing:     { label: 'Under Review',    color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  'info-needed': { label: 'Info Needed',     color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  approved:      { label: 'Approved',        color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  rejected:      { label: 'Rejected',        color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
}

const STATUS_ORDER = ['pending', 'info-needed', 'reviewing', 'approved', 'rejected']

export default function DashboardPage() {
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/locations')
      .then(r => r.json())
      .then(data => { setLocations(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const byStatus = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = locations.filter(l => l.status === s)
    return acc
  }, {} as Record<string, any[]>)

  const active = locations.filter(l => !['approved', 'rejected'].includes(l.status))
  const decided = locations.filter(l => ['approved', 'rejected'].includes(l.status))
  const approvalRate = decided.length
    ? Math.round((locations.filter(l => l.status === 'approved').length / decided.length) * 100)
    : 0

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading pipeline...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-green-800 text-white px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-green-300 text-sm">← Home</Link>
          <span className="text-lg font-bold">Super<span className="text-green-300">K</span> <span className="text-green-300 font-normal text-sm">Pipeline Summary</span></span>
        </div>
        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">{locations.length} total locations</span>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Locations', value: locations.length, color: 'text-gray-900' },
            { label: 'Active Pipeline', value: active.length, color: 'text-blue-700' },
            { label: 'Decided', value: decided.length, color: 'text-gray-700' },
            { label: 'Approval Rate', value: `${approvalRate}%`, color: 'text-green-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pipeline Stage View */}
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Pipeline by Stage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {['pending', 'info-needed', 'reviewing'].map(status => {
            const cfg = STATUS_CONFIG[status]
            const locs = byStatus[status] || []
            return (
              <div key={status}
                className={`rounded-xl border-2 ${cfg.border} ${cfg.bg} p-4 cursor-pointer transition-all ${selected === status ? 'ring-2 ring-offset-2 ring-green-600' : ''}`}
                onClick={() => setSelected(selected === status ? null : status)}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                  <span className={`text-2xl font-bold ${cfg.color}`}>{locs.length}</span>
                </div>
                {locs.length === 0 ? (
                  <p className="text-xs text-gray-400">No locations at this stage</p>
                ) : (
                  <div className="space-y-1.5">
                    {locs.slice(0, 3).map(l => (
                      <div key={l.id} className="text-xs bg-white/70 rounded-lg px-2.5 py-1.5 flex justify-between items-center">
                        <span className="font-medium text-gray-800">{l.town}</span>
                        <span className="text-gray-500">{l.asm_name?.split(' ')[0]}</span>
                      </div>
                    ))}
                    {locs.length > 3 && (
                      <p className="text-xs text-center text-gray-500 mt-1">+{locs.length - 3} more</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Expanded location list when a stage is selected */}
        {selected && byStatus[selected].length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              {STATUS_CONFIG[selected].label} — All Locations
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Town</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Store Partner</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ASM</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Tier</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Dimensions</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {byStatus[selected].map((l, i) => (
                    <tr key={l.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{l.town}</td>
                      <td className="px-4 py-3 text-gray-600">{l.sp_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{l.asm_name}</td>
                      <td className="px-4 py-3 text-gray-600">{l.town_tier?.split(' ')[0] || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {l.width_ft ? `${l.width_ft}×${l.depth_ft}ft` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Decided section */}
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Decided</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {['approved', 'rejected'].map(status => {
            const cfg = STATUS_CONFIG[status]
            const locs = byStatus[status] || []
            return (
              <div key={status}
                className={`rounded-xl border-2 ${cfg.border} ${cfg.bg} p-4 cursor-pointer ${selected === status ? 'ring-2 ring-offset-2 ring-green-600' : ''}`}
                onClick={() => setSelected(selected === status ? null : status)}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                  <span className={`text-2xl font-bold ${cfg.color}`}>{locs.length}</span>
                </div>
                {locs.length === 0 ? (
                  <p className="text-xs text-gray-400">None yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {locs.slice(0, 4).map(l => (
                      <div key={l.id} className="text-xs bg-white/70 rounded-lg px-2.5 py-1.5 flex justify-between items-center">
                        <span className="font-medium text-gray-800">{l.town}</span>
                        <span className="text-gray-500">{l.sp_name}</span>
                      </div>
                    ))}
                    {locs.length > 4 && (
                      <p className="text-xs text-center text-gray-500 mt-1">+{locs.length - 4} more</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Full table of all locations */}
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">All Locations — Full Table</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Town</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Store Partner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ASM</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Tier</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Dimensions</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Rent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Decision</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((l, i) => {
                const cfg = STATUS_CONFIG[l.status] || STATUS_CONFIG['pending']
                return (
                  <tr key={l.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{l.town}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
