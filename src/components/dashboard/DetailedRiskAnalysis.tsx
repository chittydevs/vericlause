import { useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ArrowRight, Lightbulb, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { RiskCategory } from "@/lib/mock-analysis";
import { motion, AnimatePresence } from "framer-motion";

interface DetailedRiskAnalysisProps {
  categories: RiskCategory[];
}

const levelConfig = {
  high: { color: "text-destructive", barClass: "[&>div]:bg-destructive", icon: AlertCircle },
  medium: { color: "text-warning", barClass: "[&>div]:bg-warning", icon: AlertTriangle },
  low: { color: "text-success", barClass: "[&>div]:bg-success", icon: CheckCircle },
};

const RiskCategoryCard = ({ cat, index }: { cat: RiskCategory; index: number }) => {
  const [open, setOpen] = useState(false);
  const config = levelConfig[cat.level];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <Icon className={`h-5 w-5 shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">{cat.name}</span>
            <Badge variant="outline" className={`text-xs ${config.color} border-current/20`}>
              {cat.level.toUpperCase()}
            </Badge>
          </div>
          <Progress value={cat.score} className={`h-1.5 ${config.barClass}`} />
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border/50 pt-4">
              {/* Issues */}
              {cat.issues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm font-semibold">Issues Identified</p>
                  </div>
                  <ul className="space-y-1.5">
                    {cat.issues.map((issue, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-destructive mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {cat.recommendations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-warning" />
                    <p className="text-sm font-semibold">AI Recommendations</p>
                  </div>
                  <ul className="space-y-1.5">
                    {cat.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCheck className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Improvements */}
              {cat.original_clause && cat.improved_clause && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Suggested Improvements</p>
                  </div>
                  <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 mb-2">
                    <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1">
                      Original Clause
                    </p>
                    <p className="text-sm text-muted-foreground italic">"{cat.original_clause}"</p>
                  </div>
                  <div className="flex justify-center my-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                      AI Improved Version
                    </p>
                    <p className="text-sm text-muted-foreground italic">"{cat.improved_clause}"</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DetailedRiskAnalysis = ({ categories }: DetailedRiskAnalysisProps) => (
  <div>
    <h2 className="font-display text-xl font-bold mb-4">Detailed Risk Analysis</h2>
    <div className="space-y-3">
      {categories.map((cat, i) => (
        <RiskCategoryCard key={i} cat={cat} index={i} />
      ))}
    </div>
  </div>
);

export default DetailedRiskAnalysis;
