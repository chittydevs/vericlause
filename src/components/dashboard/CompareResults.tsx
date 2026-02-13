import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AnalysisResult } from "@/lib/mock-analysis";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowUp, ArrowDown, Minus,
  Shield, AlertTriangle, CheckCircle, AlertCircle,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompareResultsProps {
  resultA: AnalysisResult;
  resultB: AnalysisResult;
  onBack: () => void;
}

const levelOrder = { low: 0, medium: 1, high: 2 };
const levelColors = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-success",
};
const barColors = {
  high: "[&>div]:bg-destructive",
  medium: "[&>div]:bg-warning",
  low: "[&>div]:bg-success",
};

function getDelta(a: number, b: number) {
  const diff = b - a;
  if (diff > 0) return { icon: ArrowUp, color: "text-destructive", label: `+${diff}` };
  if (diff < 0) return { icon: ArrowDown, color: "text-success", label: `${diff}` };
  return { icon: Minus, color: "text-muted-foreground", label: "0" };
}

function getRiskLevelLabel(level: string) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

const CompareResults = ({ resultA, resultB, onBack }: CompareResultsProps) => {
  const riskDelta = getDelta(resultA.risk_score, resultB.risk_score);
  const confDelta = getDelta(resultB.confidentiality_score, resultA.confidentiality_score); // inverted: higher conf is better

  const riskLevelA = resultA.overall_risk_level || (resultA.risk_score >= 70 ? "high" : resultA.risk_score >= 40 ? "medium" : "low");
  const riskLevelB = resultB.overall_risk_level || (resultB.risk_score >= 70 ? "high" : resultB.risk_score >= 40 ? "medium" : "low");

  // Merge risk categories by name
  const allCatNames = new Set([
    ...(resultA.risk_categories || []).map((c) => c.name),
    ...(resultB.risk_categories || []).map((c) => c.name),
  ]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Analysis
      </button>

      <h1 className="font-display text-2xl font-bold mb-1">Contract Comparison</h1>
      <p className="text-sm text-muted-foreground mb-6">Side-by-side analysis of two contracts</p>

      {/* Score comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Contract A */}
        <div className="glass rounded-xl p-5">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20" variant="outline">Contract A</Badge>
          <div className="flex items-center gap-3 mb-2">
            <Shield className={`h-6 w-6 ${levelColors[riskLevelA]}`} />
            <span className={`font-display text-2xl font-bold ${levelColors[riskLevelA]}`}>
              {getRiskLevelLabel(riskLevelA)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
              <p className="font-display text-xl font-bold">{resultA.risk_score}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Confidentiality</p>
              <p className="font-display text-xl font-bold">{resultA.confidentiality_score}</p>
            </div>
          </div>
        </div>

        {/* Contract B */}
        <div className="glass rounded-xl p-5">
          <Badge className="mb-3 bg-warning/10 text-warning border-warning/20" variant="outline">Contract B</Badge>
          <div className="flex items-center gap-3 mb-2">
            <Shield className={`h-6 w-6 ${levelColors[riskLevelB]}`} />
            <span className={`font-display text-2xl font-bold ${levelColors[riskLevelB]}`}>
              {getRiskLevelLabel(riskLevelB)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
              <p className="font-display text-xl font-bold">{resultB.risk_score}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Confidentiality</p>
              <p className="font-display text-xl font-bold">{resultB.confidentiality_score}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delta summary */}
      <div className="glass rounded-xl p-5 mb-6">
        <h3 className="font-display text-base font-semibold mb-3">Key Differences</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <riskDelta.icon className={`h-5 w-5 ${riskDelta.color}`} />
            <div>
              <p className="text-sm font-medium">Risk Score</p>
              <p className={`text-xs ${riskDelta.color}`}>
                {riskDelta.label} points (Contract B vs A)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {resultB.confidentiality_score >= resultA.confidentiality_score ? (
              <TrendingUp className="h-5 w-5 text-success" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
            <div>
              <p className="text-sm font-medium">Confidentiality</p>
              <p className="text-xs text-muted-foreground">
                A: {resultA.confidentiality_score} → B: {resultB.confidentiality_score}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-medium">Red Flags</p>
              <p className="text-xs text-muted-foreground">
                A: {resultA.red_flags?.length || 0} flags → B: {resultB.red_flags?.length || 0} flags
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Risk Categories</p>
              <p className="text-xs text-muted-foreground">
                {allCatNames.size} categories analyzed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk categories comparison */}
      {allCatNames.size > 0 && (
        <div className="mb-6">
          <h3 className="font-display text-base font-semibold mb-3">Risk Category Comparison</h3>
          <div className="space-y-3">
            {Array.from(allCatNames).map((name) => {
              const catA = (resultA.risk_categories || []).find((c) => c.name === name);
              const catB = (resultB.risk_categories || []).find((c) => c.name === name);
              return (
                <div key={name} className="glass rounded-xl p-4">
                  <p className="text-sm font-semibold mb-3">{name}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">Contract A</span>
                        {catA ? (
                          <Badge variant="outline" className={`text-xs ${levelColors[catA.level]}`}>
                            {catA.level.toUpperCase()}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </div>
                      <Progress
                        value={catA?.score || 0}
                        className={`h-1.5 ${catA ? barColors[catA.level] : ""}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">Contract B</span>
                        {catB ? (
                          <Badge variant="outline" className={`text-xs ${levelColors[catB.level]}`}>
                            {catB.level.toUpperCase()}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </div>
                      <Progress
                        value={catB?.score || 0}
                        className={`h-1.5 ${catB ? barColors[catB.level] : ""}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Red flags comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h4 className="text-sm font-semibold">Contract A — Red Flags ({resultA.red_flags?.length || 0})</h4>
          </div>
          <ul className="space-y-2">
            {(resultA.red_flags || []).map((f, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <Badge variant="outline" className={`text-[10px] shrink-0 mt-0.5 ${levelColors[f.severity]}`}>
                  {f.severity}
                </Badge>
                <span>{f.clause}</span>
              </li>
            ))}
            {(!resultA.red_flags || resultA.red_flags.length === 0) && (
              <p className="text-xs text-muted-foreground">No red flags found.</p>
            )}
          </ul>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h4 className="text-sm font-semibold">Contract B — Red Flags ({resultB.red_flags?.length || 0})</h4>
          </div>
          <ul className="space-y-2">
            {(resultB.red_flags || []).map((f, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <Badge variant="outline" className={`text-[10px] shrink-0 mt-0.5 ${levelColors[f.severity]}`}>
                  {f.severity}
                </Badge>
                <span>{f.clause}</span>
              </li>
            ))}
            {(!resultB.red_flags || resultB.red_flags.length === 0) && (
              <p className="text-xs text-muted-foreground">No red flags found.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Summary comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <h4 className="text-sm font-semibold mb-2">Contract A — Summary</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{resultA.summary}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <h4 className="text-sm font-semibold mb-2">Contract B — Summary</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{resultB.summary}</p>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Analysis
        </Button>
      </div>
    </motion.div>
  );
};

export default CompareResults;
