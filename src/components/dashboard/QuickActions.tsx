import { Button } from "@/components/ui/button";
import { FilePlus, GitCompare } from "lucide-react";

interface QuickActionsProps {
  onNewAnalysis: () => void;
  onCompare: () => void;
}

const QuickActions = ({ onNewAnalysis, onCompare }: QuickActionsProps) => {
  return (
    <div className="glass rounded-xl p-5 sticky top-24">
      <h3 className="font-display text-base font-semibold mb-4">Quick Actions</h3>
      <div className="space-y-2.5">
        <Button className="w-full justify-center" onClick={onNewAnalysis}>
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
