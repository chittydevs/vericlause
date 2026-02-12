import ScoreCard from "./ScoreCard";
import RedFlagsList from "./RedFlagsList";
import ClauseAccordion from "./ClauseAccordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Lightbulb, Scale, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/mock-analysis";
import { motion } from "framer-motion";

interface AnalysisResultsProps {
  result: AnalysisResult;
  onDelete: () => void;
}

const AnalysisResults = ({ result, onDelete }: AnalysisResultsProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="space-y-6"
  >
    {/* Disclaimer */}
    <Alert className="border-warning/30 bg-warning/5">
      <Info className="h-4 w-4 text-warning" />
      <AlertDescription className="text-xs text-muted-foreground">
        {result.legal_disclaimer}
      </AlertDescription>
    </Alert>

    {/* Scores */}
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

    {/* Summary */}
    <div className="glass rounded-xl p-6">
      <h3 className="font-display text-lg font-semibold mb-3">Summary</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
    </div>

    {/* Red Flags */}
    <RedFlagsList flags={result.red_flags} />

    {/* Clause Explanations */}
    <ClauseAccordion clauses={result.clause_explanations} />

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
  </motion.div>
);

export default AnalysisResults;
