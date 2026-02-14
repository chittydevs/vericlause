import { format } from "date-fns";
import type { SavedAnalysis } from "@/hooks/useContractAnalyses";
import { FileText, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface PastAnalysesProps {
  analyses: SavedAnalysis[];
  loading: boolean;
  onLoad: (analysis: SavedAnalysis) => void;
  onDelete: (id: string) => void;
}

const riskColor = (score: number) => {
  if (score >= 70) return "destructive";
  if (score >= 40) return "secondary";
  return "default";
};

const riskLabel = (score: number) => {
  if (score >= 70) return "High Risk";
  if (score >= 40) return "Medium Risk";
  return "Low Risk";
};

const PastAnalyses = ({ analyses, loading, onLoad, onDelete }: PastAnalysesProps) => {
  if (!analyses.length && !loading) return null;

  return (
    <Card className="mt-8 glass border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Your Past Analyses
          <Badge variant="outline" className="ml-auto text-xs font-normal">
            {analyses.length} saved
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
        ) : (
          <AnimatePresence>
            <div className="divide-y divide-border/40">
              {analyses.map((a, i) => {
                const score = a.analysis_result?.risk_score ?? 0;
                const title =
                  a.analysis_result?.contract_purpose ||
                  a.contract_text.slice(0, 60).replace(/\n/g, " ") + "…";

                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(a.created_at), "dd MMM yyyy, hh:mm a")}
                      </p>
                    </div>

                    <Badge variant={riskColor(score)} className="shrink-0 text-xs">
                      {riskLabel(score)} · {score}
                    </Badge>

                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => onLoad(a)}
                        title="View analysis"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(a.id)}
                        title="Move to trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
};

export default PastAnalyses;
