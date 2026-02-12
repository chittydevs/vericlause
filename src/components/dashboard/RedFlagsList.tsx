import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RedFlag } from "@/lib/mock-analysis";
import { motion } from "framer-motion";

interface RedFlagsListProps {
  flags: RedFlag[];
}

const severityStyles = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

const RedFlagsList = ({ flags }: RedFlagsListProps) => (
  <div className="glass rounded-xl p-6">
    <div className="flex items-center gap-2 mb-4">
      <AlertTriangle className="h-5 w-5 text-destructive" />
      <h3 className="font-display text-lg font-semibold">Red Flags ({flags.length})</h3>
    </div>
    <div className="space-y-3">
      {flags.map((flag, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 rounded-lg bg-secondary border border-border"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm font-medium">{flag.clause}</p>
            <Badge variant="outline" className={`shrink-0 text-xs ${severityStyles[flag.severity]}`}>
              {flag.severity}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{flag.explanation}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

export default RedFlagsList;
