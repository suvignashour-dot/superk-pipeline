import Link from 'next/link'

const roles = [
  {
    href: '/asm',
    label: 'Area Manager',
    description: 'Submit locations · Respond to tasks',
    icon: '📍',
  },
  {
    href: '/suvigna',
    label: 'Suvigna',
    description: 'Review pipeline · Rate partners · Assign tasks',
    icon: '📋',
  },
  {
    href: '/neeraj',
    label: 'Neeraj',
    description: 'Final review · Scoring · Go / No-Go',
    icon: '✅',
  },
  {
    href: '/dashboard',
    label: 'Pipeline Dashboard',
    description: 'Summary · All stages · Full table view',
    icon: '📊',
  },
]

const quotes = [
  { text: "Retail is detail.", author: "— Retail wisdom" },
  { text: "The best store is the one that hasn't been found yet.", author: "— SuperK philosophy" },
  { text: "Every great store started with someone believing in a town.", author: "— SuperK philosophy" },
  { text: "Speed of execution is a competitive advantage.", author: "— Neeraj" },
]

const quote = quotes[new Date().getDay() % quotes.length]

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* Top bar */}
      <div className="bg-red-600 h-1 w-full" />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 text-white font-black text-lg px-2.5 py-0.5 rounded">
            S
          </div>
          <span className="font-black text-xl tracking-tight text-gray-900">
            uper<span className="text-red-600">K</span>
          </span>
        </div>
        <span className="text-xs text-gray-400 font-medium tracking-widest uppercase">
          Store Pipeline
        </span>
      </div>

      {/* Hero */}
      <div className="bg-red-600 text-white px-6 py-14 text-center">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-red-200 mb-3">
          Andhra Pradesh · FOFO Expansion
        </p>
        <h1 className="text-4xl font-black tracking-tight mb-2">
          Store Evaluation
        </h1>
        <h1 className="text-4xl font-black tracking-tight text-red-200 mb-6">
          Pipeline
        </h1>
        <div className="max-w-xs mx-auto border-t border-red-400 pt-5 mt-5">
          <p className="text-base italic text-red-100 leading-relaxed">
            "{quote.text}"
          </p>
          <p className="text-xs text-red-300 mt-2 font-medium">
            {quote.author}
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-center gap-8">
        {[
          { label: 'Target', value: '4 stores/mo' },
          { label: 'Region', value: 'Andhra Pradesh' },
          { label: 'Model', value: 'FOFO' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</div>
            <div className="text-sm font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Role selector */}
      <div className="flex-1 px-5 py-8 bg-gray-50">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] text-center mb-5">
          Select your role to continue
        </p>

        <div className="max-w-sm mx-auto space-y-3">
          {roles.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="flex items-center gap-4 bg-white border-2 border-gray-100 hover:border-red-500 rounded-xl px-4 py-3.5 transition-all group shadow-sm hover:shadow-md"
            >
              <div className="w-10 h-10 bg-red-50 group-hover:bg-red-600 rounded-lg flex items-center justify-center text-lg transition-all flex-shrink-0">
                <span className="group-hover:grayscale">{r.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-sm">{r.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{r.description}</div>
              </div>
              <div className="text-gray-300 group-hover:text-red-500 font-bold text-lg transition-colors">
                →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 text-center">
        <p className="text-[11px] text-gray-400">
          SuperK Store Pipeline · Built for FOFO expansion · Andhra Pradesh
        </p>
        <div className="bg-red-600 h-0.5 w-12 mx-auto mt-2 rounded-full" />
      </div>

    </main>
  )
}
