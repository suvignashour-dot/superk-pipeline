import Link from 'next/link';

const roles = [
  {
    href: '/asm',
    label: 'Area Manager',
    description: 'Submit new locations, respond to tasks',
    icon: '📍',
    border: 'border-amber-300 hover:border-amber-500',
  },
  {
    href: '/suvigna',
    label: 'Suvigna',
    description: 'Review pipeline, rate store partners, assign tasks',
    icon: '📋',
    border: 'border-blue-300 hover:border-blue-500',
  },
  {
    href: '/neeraj',
    label: 'Neeraj',
    description: 'Final review, scoring and Go / No-Go decisions',
    icon: '✅',
    border: 'border-green-300 hover:border-green-600',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Super<span className="text-green-700">K</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Store Evaluation Pipeline</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-4">
          Who are you?
        </p>
        {roles.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className={`block border-2 rounded-xl p-4 bg-white transition-all ${r.border}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{r.icon}</span>
              <div>
                <div className="font-semibold text-gray-900">{r.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {r.description}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-8">SuperK · Store Pipeline v1.0</p>
    </main>
  );
}
