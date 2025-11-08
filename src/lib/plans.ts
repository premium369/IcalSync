export type PlanName = "basic" | "super_host" | "business";

export type UserPlanRow = {
  user_id: string;
  plan: PlanName;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  created_at?: string | null;
};

export const TRIAL_DAYS = 14;
export const BASIC_LIMIT = 3;
export const SUPER_HOST_LIMIT = 9;
export const BUSINESS_LIMIT: number | null = null; // null => unlimited
export const TRIAL_LIMIT = SUPER_HOST_LIMIT; // During trial, allow Super Host limits

export function isTrialActive(row: UserPlanRow | null | undefined, now = new Date()): boolean {
  if (!row?.trial_ends_at) return false;
  const ends = new Date(row.trial_ends_at);
  return ends.getTime() > now.getTime();
}

export function getEffectivePropertyLimit(row: UserPlanRow | null | undefined): number | null {
  if (isTrialActive(row)) return TRIAL_LIMIT;
  const plan = row?.plan ?? "basic";
  switch (plan) {
    case "basic":
      return BASIC_LIMIT;
    case "super_host":
      return SUPER_HOST_LIMIT;
    case "business":
      return BUSINESS_LIMIT; // unlimited
    default:
      return BASIC_LIMIT;
  }
}

export async function ensureUserPlanRow(supabase: any, userId: string): Promise<UserPlanRow> {
  // Try to fetch existing plan row
  const { data, error } = await supabase
    .from("user_plans")
    .select("user_id, plan, trial_started_at, trial_ends_at, created_at")
    .eq("user_id", userId)
    .single();

  if (data && !error) return data as UserPlanRow;

  // Create a default row with Basic plan and a 14-day trial starting now
  const now = new Date();
  const trialEnds = new Date(now);
  trialEnds.setDate(now.getDate() + TRIAL_DAYS);

  const insertRow = {
    user_id: userId,
    plan: "basic" as PlanName,
    trial_started_at: now.toISOString(),
    trial_ends_at: trialEnds.toISOString(),
  };

  const { data: inserted, error: insErr } = await supabase
    .from("user_plans")
    .insert(insertRow)
    .select("user_id, plan, trial_started_at, trial_ends_at, created_at")
    .single();

  if (insErr) throw insErr;
  return inserted as UserPlanRow;
}

export const plansCatalog: Array<{
  id: PlanName;
  title: string;
  price: string; // presentational only for now
  features: string[];
  propertyLimitLabel: string;
  support: string;
  cta: string;
}> = [
  {
    id: "basic",
    title: "Starter",
    price: "$9/mo",
    propertyLimitLabel: "Up to 3 properties",
    features: [
      "Calendar sync",
      "Auto-block dates",
      "Email support (48-72h)"
    ],
    support: "Email (48-72h)",
    cta: "Get started",
  },
  {
    id: "super_host",
    title: "Super Host",
    price: "$15/mo",
    propertyLimitLabel: `Up to ${SUPER_HOST_LIMIT} properties`,
    features: [
      `Up to ${SUPER_HOST_LIMIT} properties`,
      "Priority sync",
      "Standard support (24-48h)"
    ],
    support: "Standard (24-48h)",
    cta: "Choose Super Host",
  },
  {
    id: "business",
    title: "Business",
    price: "$—/mo",
    propertyLimitLabel: "Unlimited properties",
    features: [
      "Unlimited properties",
      "Fastest sync",
      "Priority support"
    ],
    support: "Priority",
    cta: "Choose Business",
  },
];