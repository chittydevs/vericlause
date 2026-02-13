import { Button } from "@/components/ui/button";
import { FilePlus, GitCompare, RefreshCw } from "lucide-react";

interface QuickActionsProps {
  onNewAnalysis: () => void;
  onCompare: () => void;
  onReanalyze?: () => void;
  isReanalyzing?: boolean;
}

const QuickActions = ({ onNewAnalysis, onCompare, onReanalyze, isReanalyzing }: QuickActionsProps) => {
  return (
    <div className="glass rounded-xl p-5 sticky top-24">
      <h3 className="font-display text-base font-semibold mb-4">Quick Actions</h3>
      <div className="space-y-2.5">
        {onReanalyze && (
          <Button
            className="w-full justify-center"
            variant="default"
            onClick={onReanalyze}
            disabled={isReanalyzing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isReanalyzing ? "animate-spin" : ""}`} />
            {isReanalyzing ? "Re-analyzing..." : "Re-run Analysis"}
          </Button>
        )}
        <Button className="w-full justify-center" variant="outline" onClick={onNewAnalysis}>
          <FilePlus className="h-4 w-4 mr-2" /> Analyze New Contract
        </Button>
        <Button variant="outline" className="w-full justify-center" onClick={onCompare}>
          <GitCompare className="h-4 w-4 mr-2" /> Compare Contracts
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;