import { Sparkles, Users } from "lucide-react";
import type { PartyInfo } from "@/lib/mock-analysis";

interface ContractSummaryProps {
  purpose: string;
  parties: PartyInfo[];
}

const ContractSummary = ({ purpose, parties }: ContractSummaryProps) => (
  <div className="glass rounded-xl p-6">
    <div className="flex items-center gap-2 mb-4">
      <Sparkles className="h-5 w-5 text-primary" />
      <h3 className="font-display text-lg font-semibold">Contract Summary</h3>
    </div>

    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Purpose</p>
        <p className="text-sm leading-relaxed">{purpose}</p>
      </div>

      {parties.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Parties Involved
          </p>
          <div className="space-y-2">
            {parties.map((party, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium">{party.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {party.role} · {party.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ContractSummary;
