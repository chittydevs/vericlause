export interface RiskCategory {
  name: string;
  level: "high" | "medium" | "low";
  score: number; // 0-100
  icon: string; // icon name hint
  issues: string[];
  recommendations: string[];
  original_clause?: string;
  improved_clause?: string;
}

export interface SuggestedClause {
  title: string;
  category: string;
  description: string;
  clause_type: "balanced" | "protective" | "aggressive";
  clause_text: string;
}

export interface PartyInfo {
  name: string;
  role: string;
  location: string;
}

export interface AnalysisResult {
  risk_score: number;
  confidentiality_score: number;
  overall_risk_level: "high" | "medium" | "low";
  contract_purpose: string;
  parties: PartyInfo[];
  red_flags: RedFlag[];
  clause_explanations: ClauseExplanation[];
  risk_categories: RiskCategory[];
  suggested_clauses: SuggestedClause[];
  profit_suggestions: string[];
  summary: string;
  legal_compliance_notes: string[];
  legal_disclaimer: string;
}

export interface RedFlag {
  clause: string;
  severity: "high" | "medium" | "low";
  explanation: string;
}

export interface ClauseExplanation {
  title: string;
  original_text: string;
  explanation: string;
  risk_level: "high" | "medium" | "low";
}
