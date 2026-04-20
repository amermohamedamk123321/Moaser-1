import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, AlertTriangle, ArrowLeft } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import logo from "@/assets/logo.png";
import { isLockedOut } from "@/lib/beforeAfterStore";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(50),
  password: z.string().min(1, "Password is required").max(100),
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fix: Properly get lockInfo from the store
  const lockInfo = isLockedOut();

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("moaser_admin_token");
    if (token) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: result.data.username,
          password: result.data.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        return;
      }

      localStorage.setItem("moaser_admin_token", data.token);
      localStorage.setItem("moaser_admin_user", JSON.stringify(data.user));
      navigate("/admin");
    } catch (err) {
      setError("Failed to connect to server. Please check your connection.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 ltr:left-4 rtl:right-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 ltr:mr-1 rtl:ml-1 rtl:rotate-180" /> {t("admin.back")}
        </Button>

        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src={logo} alt="Moaser Dental Hospital" className="h-20 w-20 object-contain mx-auto" />
            </div>
            <CardTitle className="font-heading text-2xl">{t("admin.title")}</CardTitle>
            <CardDescription>{t("admin.description")}</CardDescription>
          </CardHeader>

          <CardContent>
            {lockInfo.locked && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {t("admin.locked", { minutes: Math.ceil(lockInfo.remainingSeconds / 60) })}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t("admin.username")}</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={lockInfo.locked || loading}
                  autoComplete="username"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("admin.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={lockInfo.locked || loading}
                    autoComplete="current-password"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && !lockInfo.locked && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={lockInfo.locked || loading}>
                {loading ? t("admin.signingIn") : t("admin.signIn")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
