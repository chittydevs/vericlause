import OverallRiskCard from "./OverallRiskCard";
import QuickActions from "./QuickActions";
import RiskDistribution from "./RiskDistribution";
import ContractSummary from "./ContractSummary";
import DetailedRiskAnalysis from "./DetailedRiskAnalysis";
import SuggestedClauses from "./SuggestedClauses";
import RedFlagsList from "./RedFlagsList";
import ScoreCard from "./ScoreCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Lightbulb, Scale, Download, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/mock-analysis";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResultsProps {
  result: AnalysisResult;
  onDelete: () => void;
}

const AnalysisResults = ({ result, onDelete }: AnalysisResultsProps) => {
  const { toast } = useToast();

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vericlause-analysis.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Analysis report downloaded." });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Upload
          </button>
          <h1 className="font-display text-2xl font-bold">Contract Analysis</h1>
          <p className="text-sm text-muted-foreground">Comprehensive AI Risk Analysis</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export Report
        </Button>
      </div>

      {/* Disclaimer */}
      <Alert className="border-warning/30 bg-warning/5 mb-6">
        <Info className="h-4 w-4 text-warning" />
        <AlertDescription className="text-xs text-muted-foreground">
          {result.legal_disclaimer}
        </AlertDescription>
      </Alert>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          {/* Overall Risk + Scores */}
          <OverallRiskCard
            riskScore={result.risk_score}
            riskLevel={result.overall_risk_level || (result.risk_score >= 70 ? "high" : result.risk_score >= 40 ? "medium" : "low")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ScoreCard
              label="Risk Score"
              score={result.risk_score}
              description="Higher = more risky. Based on clause severity and legal compliance."
              variant="risk"
            />
            <ScoreCard
              label="Confidentiality Score"
              score={result.confidentiality_score}
              description="Higher = better protected. Measures NDA strength and data clauses."
              variant="confidentiality"
            />
          </div>

          {/* Contract Summary */}
          {result.contract_purpose && (
            <ContractSummary
              purpose={result.contract_purpose}
              parties={result.parties || []}
            />
          )}

          {/* Summary text */}
          <div className="glass rounded-xl p-6">
            <h3 className="font-display text-lg font-semibold mb-3">Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
          </div>

          {/* Detailed Risk Analysis */}
          {result.risk_categories && result.risk_categories.length > 0 && (
            <DetailedRiskAnalysis categories={result.risk_categories} />
          )}

          {/* Red Flags */}
          {result.red_flags.length > 0 && <RedFlagsList flags={result.red_flags} />}

          {/* Suggested Clauses */}
          {result.suggested_clauses && result.suggested_clauses.length > 0 && (
            <SuggestedClauses clauses={result.suggested_clauses} />
          )}

          {/* Profit Suggestions */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-warning" />
              <h3 className="font-display text-lg font-semibold">Profit Suggestions</h3>
            </div>
            <ul className="space-y-2">
              {result.profit_suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Badge variant="outline" className="shrink-0 mt-0.5 text-xs bg-primary/10 text-primary border-primary/20">
                    {i + 1}
                  </Badge>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Compliance Notes */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-semibold">Legal Compliance Notes</h3>
            </div>
            <ul className="space-y-2">
              {result.legal_compliance_notes.map((note, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Delete */}
          <div className="flex justify-end">
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete Analysis
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <QuickActions onNewAnalysis={onDelete} />
          {result.risk_categories && result.risk_categories.length > 0 && (
            <RiskDistribution categories={result.risk_categories} />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisResults;
