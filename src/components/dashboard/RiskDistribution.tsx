interface RiskDistributionProps {
  categories: { level: "high" | "medium" | "low" }[];
}

const RiskDistribution = ({ categories }: RiskDistributionProps) => {
  const high = categories.filter((c) => c.level === "high").length;
  const medium = categories.filter((c) => c.level === "medium").length;
  const low = categories.filter((c) => c.level === "low").length;

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="font-display text-base font-semibold mb-4">Risk Distribution</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">HIGH</span>
          <span className="text-sm font-semibold text-destructive">{high} issues</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">MEDIUM</span>
          <span className="text-sm font-semibold text-warning">{medium} issues</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">LOW</span>
          <span className="text-sm font-semibold text-success">{low} issues</span>
        </div>
      </div>
    </div>
  );
};

export default RiskDistribution;
