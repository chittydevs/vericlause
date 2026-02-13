import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, FileDown, Loader2, Wand2 } from "lucide-react";
import type { AnalysisResult, SuggestedClause, RiskCategory } from "@/lib/mock-analysis";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface GenerateUpdatedContractProps {
  result: AnalysisResult;
  contractText: string;
}

interface SelectableChange {
  id: string;
  label: string;
  description: string;
  type: "suggested_clause" | "improved_clause" | "red_flag_fix";
  data: any;
}

function buildSelectableChanges(result: AnalysisResult): SelectableChange[] {
  const changes: SelectableChange[] = [];

  (result.suggested_clauses ?? []).forEach((clause, i) => {
    changes.push({
      id: `sc-${i}`,
      label: clause.title,
      description: clause.description,
      type: "suggested_clause",
      data: clause,
    });
  });

  (result.risk_categories ?? []).forEach((cat, i) => {
    if (cat.original_clause && cat.improved_clause) {
      changes.push({
        id: `ic-${i}`,
        label: `${cat.name} — Improved Clause`,
        description: `Replace existing clause with AI-improved version`,
        type: "improved_clause",
        data: { original: cat.original_clause, improved: cat.improved_clause, category: cat.name },
      });
    }
  });

  return changes;
}

const GenerateUpdatedContract = ({ result, contractText }: GenerateUpdatedContractProps) => {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [updatedContract, setUpdatedContract] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const changes = buildSelectableChanges(result);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === changes.length) setSelected(new Set());
    else setSelected(new Set(changes.map((c) => c.id)));
  };

  const handleGenerate = async () => {
    if (selected.size === 0) {
      toast({ title: "No changes selected", description: "Please select at least one change to apply.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      const selectedChanges = changes.filter((c) => selected.has(c.id));
      const { data, error } = await supabase.functions.invoke("generate-updated-contract", {
        body: {
          contractText,
          changes: selectedChanges.map((c) => ({
            type: c.type,
            label: c.label,
            data: c.data,
          })),
        },
      });

      if (error) throw new Error(error.message || "Generation failed");
      if (data?.error) throw new Error(data.error);

      setUpdatedContract(data.updatedContract);
      toast({ title: "Contract Generated", description: "Your updated contract is ready for export." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to generate updated contract.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPdf = async () => {
    if (!updatedContract) return;
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(updatedContract, 170);
    let y = 20;
    pdf.setFontSize(10);
    for (const line of lines) {
      if (y > 280) { pdf.addPage(); y = 20; }
      pdf.text(line, 20, y);
      y += 5;
    }
    pdf.save("updated-contract.pdf");
    toast({ title: "PDF Downloaded", description: "Your updated contract has been saved as PDF." });
  };

  const handleExportDocx = async () => {
    if (!updatedContract) return;
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    const { saveAs } = await import("file-saver");

    const paragraphs = updatedContract.split("\n").map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line, size: 22 })],
          spacing: { after: 120 },
        })
    );

    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "updated-contract.docx");
    toast({ title: "Word Document Downloaded", description: "Your updated contract has been saved as .docx." });
  };

  if (changes.length === 0) return null;

  return (
    <div className="glass rounded-xl p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10">
          <Wand2 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold">Generate Updated Contract</h3>
          <p className="text-xs text-muted-foreground">Select changes to apply, then generate & export</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Collapse" : "Expand"}
        </Button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Select all */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
              <Checkbox
                checked={selected.size === changes.length && changes.length > 0}
                onCheckedChange={selectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All ({selected.size}/{changes.length})
              </label>
            </div>

            {/* Changes list */}
            <div className="space-y-2 mb-5 max-h-80 overflow-y-auto pr-1">
              {changes.map((change) => (
                <label
                  key={change.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  <Checkbox
                    checked={selected.has(change.id)}
                    onCheckedChange={() => toggle(change.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{change.label}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {change.type === "suggested_clause" ? "New Clause" : "Improvement"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{change.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Generate button */}
            <Button onClick={handleGenerate} disabled={generating || selected.size === 0} className="w-full mb-4">
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Updated Contract...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" /> Generate Updated Contract ({selected.size} changes)
                </>
              )}
            </Button>

            {/* Updated contract preview + export */}
            {updatedContract && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="rounded-lg bg-secondary/50 border border-border/50 p-4 mb-4 max-h-60 overflow-y-auto">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Updated Contract Preview</p>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">
                    {updatedContract.slice(0, 2000)}
                    {updatedContract.length > 2000 && "\n\n... (truncated in preview)"}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleExportPdf}>
                    <FileText className="h-4 w-4 mr-2" /> Export as PDF
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleExportDocx}>
                    <FileDown className="h-4 w-4 mr-2" /> Export as Word
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenerateUpdatedContract;