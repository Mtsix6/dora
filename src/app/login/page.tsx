"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, LayoutGrid, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EASE_OUT_EXPO } from "@/lib/motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col">
      {/* Minimal header */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
        className="h-14 flex items-center px-6"
      >
        <Link href="/" className="flex items-center gap-2 select-none">
          <div className="size-6 rounded-md bg-[#635BFF] flex items-center justify-center">
            <LayoutGrid className="size-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-[#0A2540] tracking-tight">
            DORA<span className="text-[#635BFF]">·</span>RoI
          </span>
        </Link>
      </motion.nav>

      {/* Auth card */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <div className="bg-white rounded-2xl border border-[#E3E8EF] shadow-[0_4px_24px_rgba(10,37,64,0.06)] p-8">
            <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">
              Welcome back
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Sign in to your DORA RoI account
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700 font-medium"
              >
                {error}
              </motion.div>
            )}

            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#0A2540]">
                  Work email
                </label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  className="h-10 text-[13px] border-[#E3E8EF] bg-[#F6F9FC] focus-visible:ring-[#635BFF]/30 focus-visible:border-[#635BFF]"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-[#0A2540]">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[11px] text-[#635BFF] font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-10 text-[13px] border-[#E3E8EF] bg-[#F6F9FC] focus-visible:ring-[#635BFF]/30 focus-visible:border-[#635BFF]"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-[13px] font-semibold bg-[#635BFF] hover:bg-[#4F46E5] text-white mt-1 btn-lift"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#E3E8EF]">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full h-10 rounded-lg border border-[#E3E8EF] bg-white hover:bg-[#F6F9FC] hover:border-[#635BFF]/30 text-[13px] font-medium text-[#0A2540] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

          <p className="text-center text-[12px] text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#635BFF] font-semibold hover:underline"
            >
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
