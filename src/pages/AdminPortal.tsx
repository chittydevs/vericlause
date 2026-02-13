import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Lock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";

interface AdminAnalysis {
  id: string;
  user_email: string;
  contract_purpose: string;
  overall_risk_level: string;
  risk_score: number | null;
  created_at: string;
  deleted_at: string | null;
  encrypted_details: string;
}

const AdminPortal = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AdminAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/signin");
      return;
    }

    const checkAdminAndFetch = async () => {
      setLoading(true);
      setError(null);

      // Check admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Fetch admin data via edge function
      const { data, error: fnError } = await supabase.functions.invoke(
        "admin-analyses"
      );

      if (fnError) {
        setError(fnError.message);
      } else {
        setAnalyses(data as AdminAnalysis[]);
      }
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading admin portal...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="max-w-md w-full glass">
          <CardContent className="pt-6 text-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="font-display text-xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground text-sm">
              You do not have admin privileges to view this portal.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const riskBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />High</Badge>;
      case "medium":
        return <Badge className="bg-warning/20 text-warning border-warning/30 gap-1"><AlertTriangle className="h-3 w-3" />Medium</Badge>;
      case "low":
        return <Badge className="bg-primary/20 text-primary border-primary/30 gap-1"><CheckCircle className="h-3 w-3" />Low</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold">Admin Portal</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Overview of all contract analyses. Contract details are encrypted and not accessible from this portal.
          </p>
        </motion.div>

        {error && (
          <Card className="mb-6 border-destructive/50">
            <CardContent className="pt-4">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Analyses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-display font-bold">{analyses.length}</p>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-display font-bold text-primary">
                  {analyses.filter((a) => !a.deleted_at).length}
                </p>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">In Trash</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-display font-bold text-destructive">
                  {analyses.filter((a) => a.deleted_at).length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card className="glass overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-4 w-4 text-muted-foreground" />
                All Contract Analyses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analyses.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No analyses found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Email</TableHead>
                      <TableHead>Contract Title</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyses.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-xs">
                          {a.user_email}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">
                          {a.contract_purpose}
                        </TableCell>
                        <TableCell>{riskBadge(a.overall_risk_level)}</TableCell>
                        <TableCell className="text-sm">
                          {a.risk_score !== null ? `${a.risk_score}/100` : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {a.deleted_at ? (
                            <Badge variant="outline" className="text-destructive border-destructive/30">
                              Trashed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-primary border-primary/30">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Encrypted
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPortal;
