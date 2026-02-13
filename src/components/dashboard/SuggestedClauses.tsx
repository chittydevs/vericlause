import { useState } from "react";
import { Lightbulb, CheckCircle, ChevronDown, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SuggestedClause } from "@/lib/mock-analysis";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface SuggestedClausesProps {
  clauses: SuggestedClause[];
}

const typeColors = {
  balanced: "bg-primary/10 text-primary border-primary/20",
  protective: "bg-destructive/10 text-destructive border-destructive/20",
  aggressive: "bg-warning/10 text-warning border-warning/20",
};

const iconColors = {
  balanced: "bg-primary/20 text-primary",
  protective: "bg-destructive/20 text-destructive",
  aggressive: "bg-warning/20 text-warning",
};

const SuggestedClauseCard = ({ clause, index }: { clause: SuggestedClause; index: number }) => {
  const [showText, setShowText] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(clause.clause_text);
    toast({ title: "Copied", description: "Clause text copied to clipboard." });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl p-5"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2.5 rounded-lg shrink-0 ${iconColors[clause.clause_type]}`}>
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold">{clause.title}</h4>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              <CheckCircle className="h-3 w-3 mr-1" /> AI Validated
            </Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={handleCopy}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{clause.category}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{clause.description}</p>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className={`text-xs ${typeColors[clause.clause_type]}`}>
          {clause.clause_type.charAt(0).toUpperCase() + clause.clause_type.slice(1)}
        </Badge>
      </div>

      <button
        onClick={() => setShowText(!showText)}
        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showText ? "rotate-180" : ""}`} />
        {showText ? "Hide" : "Show"} clause text
      </button>

      {showText && (
        <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
          <p className="text-sm text-muted-foreground leading-relaxed">{clause.clause_text}</p>
        </div>
      )}
    </motion.div>
  );
};

const SuggestedClauses = ({ clauses }: SuggestedClausesProps) => (
  <div className="glass rounded-xl p-6">
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10">
        <Lightbulb className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold">Suggested Clauses</h3>
        <p className="text-xs text-muted-foreground">AI-recommended clauses for this contract</p>
      </div>
    </div>
    <div className="space-y-3">
      {clauses.map((clause, i) => (
        <SuggestedClauseCard key={i} clause={clause} index={i} />
      ))}
    </div>
  </div>
);

export default SuggestedClauses;
