export const RENT_OPTIONS = [
  '0 - Own Property',
  '1-5000',
  '5000-10000',
  '10000-15000',
  '15000-18000',
  '18000-20000',
  '20000-25000',
  '25000-30000',
  '30000+',
]

export const TIER_OPTIONS = [
  'Tier-1 (District HQ)',
  'Tier-2',
  'Tier-3 (Municipal corporation)',
  'Tier-4 (Municipality HQ)',
  'Tier-5 (Mandal HQ)',
  'Tier-6+',
]

export const POPULATION_OPTIONS = [
  'Under 10000',
  '10000-30000',
  '30000-50000',
  '50000-75000',
  '75000-100000',
  '100000+',
]

export const DISTANCE_OPTIONS = [
  'Less than 1Km',
  '1-2 km',
  '2-5 km',
  '5-10 km',
  '10-20 kms',
  'More than 20 kms',
  'More than 50 kms',
]

export const EXPERIENCE_OPTIONS = [
  'No Business Experience',
  'Less than 1 year',
  '1–2 years',
  '3–5 years',
  '6–10 years',
  'More than 10 years',
]

export const INCOME_OPTIONS = [
  'Less than ₹10,000',
  '₹10,000-₹20,000',
  '₹20,001-₹30,000',
  '₹30,000-₹50,000',
  '₹50,000-₹75,000',
  '₹75,000-₹1,00,000',
  'More than ₹1,00,000',
]

export const FUNDING_OPTIONS = [
  'Self-financed (savings)',
  'Bank/NBFC Loan',
  'Funded by family',
  'Partly Savings/Partly Loan',
]

export const POLITICAL_OPTIONS = [
  'No known political connections',
  'Some influence in local admin',
  'Yes – Local leader/party worker',
]

export const WHO_RUNS_OPTIONS = [
  'Store Partner (Self)',
  'Store Partner + Employee',
  'Trusted Family Member',
  'Dedicated Manager',
]

export const DEPENDENCY_OPTIONS = [
  'Fully (Main income)',
  'Partially (Other biz too)',
  'Not Much (Strong backup)',
]

export const OPENING_FOR_OPTIONS = [
  'Self',
  'Family member',
  'Friend/Relative',
  'Employees',
]

export const RISK_OPTIONS = [
  'Too many kirana/big shops nearby',
  'People here only buy very cheap items',
  'Wholesale shop nearby',
  'Very few people come near this shop',
  'Shop not visible from main road',
  'Parking/loading space problem',
  'Other shops give credit',
  'Seasonal changes affect sales',
  'Bypass area, low footfall',
]

export const LEAD_SOURCE_OPTIONS = [
  'Superfone (Meta/Google)',
  'SP Referral',
  'Was a SuperK Customer',
  'Observed a SuperK Store',
  'Customer Referral',
  'Online Lead',
  'ASM Sourced',
]

export const STATUS_LABELS: Record<string, string> = {
  pending:       'Pending',
  reviewing:     'Reviewing',
  'info-needed': 'Info Needed',
  approved:      'Approved',
  rejected:      'Rejected',
}

export const STATUS_COLORS: Record<string, string> = {
  pending:       'bg-amber-100 text-amber-700',
  reviewing:     'bg-blue-100 text-blue-700',
  'info-needed': 'bg-purple-100 text-purple-700',
  approved:      'bg-green-100 text-green-700',
  rejected:      'bg-red-100 text-red-700',
}
