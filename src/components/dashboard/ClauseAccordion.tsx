import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { ClauseExplanation } from "@/lib/mock-analysis";
import { BookOpen } from "lucide-react";

interface ClauseAccordionProps {
  clauses: ClauseExplanation[];
}

const riskColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

const ClauseAccordion = ({ clauses }: ClauseAccordionProps) => (
  <div className="glass rounded-xl p-6">
    <div className="flex items-center gap-2 mb-4">
      <BookOpen className="h-5 w-5 text-primary" />
      <h3 className="font-display text-lg font-semibold">Clause Explanations</h3>
    </div>
    <Accordion type="multiple" className="space-y-2">
      {clauses.map((clause, i) => (
        <AccordionItem key={i} value={`clause-${i}`} className="border rounded-lg bg-secondary px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-3 text-left">
              <span className="text-sm font-medium">{clause.title}</span>
              <Badge variant="outline" className={`text-xs ${riskColors[clause.risk_level]}`}>
                {clause.risk_level}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Original Text</p>
                <p className="text-xs text-muted-foreground italic bg-muted/50 p-3 rounded-md">
                  "{clause.original_text}"
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">AI Explanation</p>
                <p className="text-sm leading-relaxed">{clause.explanation}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export default ClauseAccordion;
