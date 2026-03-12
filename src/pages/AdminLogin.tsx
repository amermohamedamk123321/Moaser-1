import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Eye, EyeOff, AlertTriangle, ArrowLeft } from "lucide-react";
import {
  initAdmin,
  verifyAdmin,
  isLockedOut,
  recordFailedAttempt,
  resetLoginAttempts,
} from "@/lib/beforeAfterStore";
import PageTransition from "@/components/PageTransition";
import logo from "@/assets/logo.png";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(50),
  password: z.string().min(1, "Password is required").max(100),
});

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockInfo, setLockInfo] = useState({ locked: false, remainingSeconds: 0 });

  useEffect(() => {
    initAdmin();
    // Check if already logged in
    if (sessionStorage.getItem("moaser_admin_session")) {
      navigate("/admin");
    }
  }, [navigate]);

  // Lockout countdown
  useEffect(() => {
    if (!lockInfo.locked) return;
    const interval = setInterval(() => {
      const info = isLockedOut();
      setLockInfo(info);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockInfo.locked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check lockout
    const lock = isLockedOut();
    if (lock.locked) {
      setLockInfo(lock);
      return;
    }

    // Validate input
    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    // Add artificial delay to slow brute-force
    await new Promise((r) => setTimeout(r, 800));

    const valid = await verifyAdmin(result.data.username, result.data.password);
    if (valid) {
      resetLoginAttempts();
      sessionStorage.setItem("moaser_admin_session", Date.now().toString());
      navigate("/admin");
    } else {
      recordFailedAttempt();
      const newLock = isLockedOut();
      setLockInfo(newLock);
      setError(
        newLock.locked
          ? t("admin.tooManyAttempts", { minutes: Math.ceil(newLock.remainingSeconds / 60) })
          : t("admin.invalidCredentials")
      );
    }
    setLoading(false);
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
