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
  { text: "Every great store started with someone believing in a town.", author: "— SuperK philosophy" },
  { text: "Speed of execution is a competitive advantage.", author: "— Neeraj" },
  { text: "The best store is the one that hasn't been found yet.", author: "— SuperK philosophy" },
]

const quote = quotes[new Date().getDay() % quotes.length]

function HexK() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="26,2 48,14 48,38 26,50 4,38 4,14"
        fill="#cc1a1a"
      />
      <text
        x="26"
        y="35"
        textAnchor="middle"
        fill="white"
        fontSize="24"
        fontWeight="900"
        fontFamily="Arial Black, Arial, sans-serif"
      >
        K
      </text>
    </svg>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>

      {/* Header with logo */}
      <div className="px-6 py-8 flex flex-col items-center justify-center border-b border-gray-800">
        <div className="flex items-center gap-3 mb-1">
          <span style={{
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: '2.8rem',
            fontWeight: 900,
            color: '#cc1a1a',
            letterSpacing: '-1px',
            lineHeight: 1,
          }}>
            Super
          </span>
          <HexK />
        </div>
        <p className="text-gray-500 text-xs tracking-[0.2em] uppercase mt-2">
          Store Evaluation Pipeline
        </p>
      </div>

      {/* Quote */}
      <div className="px-6 py-8 text-center border-b border-gray-800">
        <p className="text-white text-lg italic leading-relaxed max-w-xs mx-auto font-light">
          "{quote.text}"
        </p>
        <p className="text-gray-500 text-xs mt-3 tracking-wider">
          {quote.author}
        </p>
        <div className="w-8 h-0.5 bg-red-600 mx-auto mt-4 rounded-full" />
      </div>

      {/* Stats */}
      <div className="px-6 py-5 flex items-center justify-center gap-8 border-b border-gray-800">
        {[
          { label: 'Target', value: '4 stores/mo' },
          { label: 'Region', value: 'Andhra Pradesh' },
          { label: 'Model', value: 'FOFO' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">{s.label}</div>
            <div className="text-sm font-bold text-white mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Role selector */}
      <div className="flex-1 px-5 py-8">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] text-center mb-5">
          Select your role
        </p>

        <div className="max-w-sm mx-auto space-y-2.5">
          {roles.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all group border border-gray-800 hover:border-red-600 hover:bg-gray-900"
              style={{ background: '#141414' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 border border-gray-700 group-hover:border-red-600 transition-all">
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm">{r.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{r.description}</div>
              </div>
              <div className="text-gray-600 group-hover:text-red-500 font-bold text-lg transition-colors">
                →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center border-t border-gray-800">
        <p className="text-[10px] text-gray-600 tracking-wider uppercase">
          SuperK · FOFO Expansion · Andhra Pradesh
        </p>
      </div>

    </main>
  )
}
