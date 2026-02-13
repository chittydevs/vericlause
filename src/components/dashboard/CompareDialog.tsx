import { useState } from "react";
import FileUpload from "./FileUpload";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import type { AnalysisResult } from "@/lib/mock-analysis";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompareReady: (result: AnalysisResult) => void;
}

const CompareDialog = ({ open, onOpenChange, onCompareReady }: CompareDialogProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 10;
      });
    }, 400);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-contract", {
        body: { contractText: text },
      });

      clearInterval(interval);

      if (error) throw new Error(error.message || "Analysis failed");
      if (data?.error) throw new Error(data.error);

      setProgress(100);
      setTimeout(() => {
        setIsAnalyzing(false);
        onCompareReady(data as AnalysisResult);
        onOpenChange(false);
        toast({ title: "Analysis Complete", description: "Second contract analyzed. Showing comparison." });
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setIsAnalyzing(false);
      toast({
        title: "Error",
        description: err?.message || "Analysis failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Upload Second Contract</DialogTitle>
          <DialogDescription>
            Upload or paste the second contract to compare it against your current analysis.
          </DialogDescription>
        </DialogHeader>

        <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Analyzing second contract...</p>
                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CompareDialog;
