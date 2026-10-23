export interface Meeting {
  id: string;
  title: string;
  startsAt: string;
  timeZone: string;
  participants: string[];
  status: "requested" | "scheduled" | "completed" | "cancelled";
}

export interface BusinessRequirement {
  id: string;
  description: string;
  targetMarkets: string[];
  industry: string;
  businessRole: "buyer" | "seller" | "partner";
}

export interface MatchResult {
  companyId: string;
  relevanceScore: number;
  reasons: string[];
}
