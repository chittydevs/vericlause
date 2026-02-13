import { Button } from "@/components/ui/button";
import { Download, FilePlus, Share2, GitCompare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  onNewAnalysis: () => void;
}

const QuickActions = ({ onNewAnalysis }: QuickActionsProps) => {
  const { toast } = useToast();

  return (
    <div className="glass rounded-xl p-5 sticky top-24">
      <h3 className="font-display text-base font-semibold mb-4">Quick Actions</h3>
      <div className="space-y-2.5">
        <Button className="w-full justify-center" onClick={onNewAnalysis}>
          <FilePlus className="h-4 w-4 mr-2" /> Analyze New Contract
        </Button>
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={() => toast({ title: "Coming Soon", description: "Share feature is under development." })}
        >
          <Share2 className="h-4 w-4 mr-2" /> Share Analysis
        </Button>
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={() => toast({ title: "Coming Soon", description: "Compare feature is under development." })}
        >
          <GitCompare className="h-4 w-4 mr-2" /> Compare Contracts
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
