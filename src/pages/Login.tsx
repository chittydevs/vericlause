import { FormEvent, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

const Login = () => {
  const { signInWithEmail, signInWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message ?? "Failed to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      // On success, redirect will follow; reset so button isn't stuck if redirect is slow
    } catch (err: any) {
      setError(err.message ?? "Failed to start Google sign-in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 pt-16 pb-8">
      <div className="w-full max-w-md mx-4">
        <div className="glass rounded-2xl p-8 shadow-lg">
          <h1 className="font-display text-2xl font-bold mb-2 text-center">
            Sign in to VeriClause
          </h1>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Use your email and password or continue with Google.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting || loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting || loading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={submitting || loading}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span>OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            disabled={submitting || loading}
          >
            {submitting ? "Connecting..." : "Continue with Google"}
          </Button>
          
          {error && error.includes("Google") && (
            <div className="mt-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive font-medium mb-1">Google OAuth Setup Required</p>
              <p className="text-xs text-muted-foreground">
                To enable Google sign-in, configure Google OAuth in your Supabase project:
              </p>
              <ol className="text-xs text-muted-foreground mt-1 ml-4 list-decimal">
                <li>Go to Supabase Dashboard → Authentication → Providers</li>
                <li>Enable Google provider</li>
                <li>Add your OAuth credentials</li>
                <li>Add redirect URL: <code className="bg-muted px-1 rounded">{window.location.origin}</code></li>
              </ol>
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <a
              href="https://app.supabase.com"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              Create one in Supabase
            </a>
            .
          </p>

          <p className="mt-2 text-xs text-muted-foreground text-center">
            <Link to="/" className="text-primary underline-offset-2 hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

