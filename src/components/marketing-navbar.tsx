"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Solutions", href: "/#features" },
  { label: "Features",  href: "/#how-it-works" },
  { label: "Company",   href: "/#pillars" },
  { label: "Pricing",   href: "/pricing" },
  { label: "Help Center", href: "/#faq" },
];

export function MarketingNavbar() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [navHidden, setNavHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastY) {
        setNavHidden(false);          // ANY upward movement → show
      } else if (y > lastY + 6 && y > 80) {
        setNavHidden(true);           // scrolling down → hide
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-5 md:px-6"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: navHidden ? -110 : 0, opacity: navHidden ? 0 : 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 rounded-[22px] border border-white/80 bg-white/92 px-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B5BD6] to-[#7E7BFF] shadow-[0_12px_24px_rgba(91,91,214,0.28)] transition-transform duration-200 group-hover:scale-110">
            <LayoutGrid className="size-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black text-[#111827] tracking-tight">
            DORA<span className="text-indigo-600">·</span>RoI
          </span>
        </Link>

        {/* Nav links */}
        <div className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full px-3 py-2 text-[13px] text-[#4B5565] transition-colors duration-200 hover:bg-[#F5F7FB] hover:text-[#111827]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex-1" />

        {/* Auth */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <ProfileDropdown session={session} />
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-xl border-[#D6DCE8] bg-white px-4 text-[13px] font-semibold text-[#111827]"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="h-10 rounded-xl bg-[#111111] px-4 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-black"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

/* ── Profile dropdown ─────────────────────────────────────────────── */

function ProfileDropdown({ session }: { session: any }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = session?.user?.name || session?.user?.email || "User";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const items = [
    { icon: User,          label: "Profile",   href: "/settings" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Settings,      label: "Settings",  href: "/settings" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="size-8 rounded-full bg-gradient-to-br from-[#635BFF] to-[#4F46E5] flex items-center justify-center text-white text-[11px] font-bold select-none cursor-pointer hover:scale-110 hover:shadow-[0_4px_12px_rgba(99,91,255,0.4)] active:scale-95 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        {initials}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#E3E8EF] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden z-50"
          >
            <div className="px-3.5 py-3 border-b border-[#E3E8EF]">
              <p className="text-[13px] font-semibold text-[#0A2540] truncate">{name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{session?.user?.email}</p>
            </div>
            <div className="py-1.5">
              {items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#374151] hover:bg-[#F6F9FC] hover:text-[#0A2540] transition-colors duration-150"
                >
                  <item.icon className="size-3.5 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-[#E3E8EF] py-1.5">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <LogOut className="size-3.5" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
