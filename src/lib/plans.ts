export type PlanName = "basic" | "super_host" | "custom";

export type UserPlanRow = {
  user_id: string;
  plan: PlanName;
  created_at?: string | null;
};

export const BASIC_LIMIT = 3;
export const SUPER_HOST_LIMIT = 9;
export const CUSTOM_LIMIT: number | null = null;

export function getEffectivePropertyLimit(row: UserPlanRow | null | undefined): number | null {
  const plan = row?.plan ?? "basic";
  switch (plan) {
    case "basic":
      return BASIC_LIMIT;
    case "super_host":
      return SUPER_HOST_LIMIT;
    case "custom":
      return CUSTOM_LIMIT;
    default:
      return BASIC_LIMIT;
  }
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
    cta: "Request upgrade",
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
    cta: "Request upgrade",
  },
  {
    id: "custom",
    title: "Custom",
    price: "Contact",
    propertyLimitLabel: "Unlimited properties",
    features: [
      "Unlimited properties",
      "Fastest sync",
      "Priority support"
    ],
    support: "Priority",
    cta: "Contact us",
  },
];