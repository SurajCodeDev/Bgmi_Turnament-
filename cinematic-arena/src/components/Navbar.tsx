"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/data/arena";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#arena");
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const ids = navLinks.map((l) => l.href.slice(1));
      let current = "#arena";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          current = `#${id}`;
        }
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSectionNav = (href: string, e?: MouseEvent) => {
    e?.preventDefault();
    setOpen(false);
    if (!href.startsWith("#")) return;
    if (window.location.pathname !== "/") {
      window.location.href = `/${href}`;
      return;
    }
    const el = document.getElementById(href.slice(1));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-[900] transition-all duration-300 ${
        scrolled ? "bg-[#05060a]/80 backdrop-blur-xl border-b border-[#1a2134]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4">
        <a href="/" className="flex items-center gap-2.5" data-cursor="HOME">
          <div className="h-7 w-7 rotate-45 border-2 border-cyan-400 flex items-center justify-center">
            <div className="h-1.5 w-1.5 -rotate-45 bg-cyan-400" />
          </div>
          <span className="font-display text-sm font-black tracking-[0.25em] text-white">
            NEXT LEVEL <span className="text-cyan-400">ARENA</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleSectionNav(link.href, e)}
              data-cursor={link.label}
              className={`relative font-body text-xs font-semibold tracking-[0.2em] transition-colors ${
                active === link.href ? "text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              {active === link.href && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1.5 left-0 right-0 h-px bg-cyan-400 shadow-glow"
                />
              )}
              {link.label}
            </a>
          ))}
          <a href="/matches" data-cursor="MATCHES" className="relative font-body text-xs font-semibold tracking-[0.2em] text-slate-400 transition-colors hover:text-white">
            MATCHES
          </a>
          <a href="/bracket" data-cursor="BRACKET" className="relative font-body text-xs font-semibold tracking-[0.2em] text-slate-400 transition-colors hover:text-white">
            BRACKET
          </a>
          <a href="/news" data-cursor="NEWS" className="relative font-body text-xs font-semibold tracking-[0.2em] text-slate-400 transition-colors hover:text-white">
            NEWS
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {user.role === "admin" && (
                <a
                  href="/admin"
                  data-cursor="ADMIN"
                  className="btn-ghost px-4 py-2 font-body text-xs"
                >
                  ADMIN
                </a>
              )}
              <a
                href="/dashboard"
                data-cursor="PLAYER"
                className="btn-ghost px-4 py-2 font-body text-xs"
              >
                {user.name}
              </a>
              <button
                onClick={logout}
                data-cursor="EXIT"
                className="border border-[#1a2134] px-4 py-2 font-body text-xs text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-400"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                data-cursor="LOGIN"
                className="btn-ghost px-4 py-2 font-body text-xs"
              >
                LOGIN
              </a>
              <a
                href="/register"
                data-cursor="JOIN"
                className="btn-primary px-4 py-2 font-body text-xs"
              >
                SIGN UP
              </a>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`h-px w-6 bg-cyan-400 transition-all ${open ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`h-px w-6 bg-cyan-400 transition-all ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-[#05060a]/95 border-b border-[#1a2134]"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSectionNav(link.href, e)}
                  className="py-2.5 font-body text-sm font-semibold tracking-[0.2em] text-slate-300"
                >
                  {link.label}
                </a>
              ))}
              <a href="/matches" onClick={() => setOpen(false)} className="py-2.5 font-body text-sm font-semibold tracking-[0.2em] text-slate-300">
                MATCHES
              </a>
              <a href="/bracket" onClick={() => setOpen(false)} className="py-2.5 font-body text-sm font-semibold tracking-[0.2em] text-slate-300">
                BRACKET
              </a>
              <a href="/news" onClick={() => setOpen(false)} className="py-2.5 font-body text-sm font-semibold tracking-[0.2em] text-slate-300">
                NEWS
              </a>
              <a href="/rules" onClick={() => setOpen(false)} className="py-2.5 font-body text-sm font-semibold tracking-[0.2em] text-slate-300">
                RULES
              </a>
              {user ? (
                <>
                  {user.role === "admin" && (
                    <a href="/admin" onClick={() => setOpen(false)} className="py-2.5 font-body text-sm tracking-[0.2em] text-cyan-400">
                      ADMIN PANEL
                    </a>
                  )}
                  <a href="/dashboard" onClick={() => setOpen(false)} className="py-2.5 font-body text-sm tracking-[0.2em] text-cyan-400">
                    DASHBOARD
                  </a>
                  <button onClick={logout} className="py-2.5 text-left font-body text-sm tracking-[0.2em] text-red-400">
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" onClick={() => setOpen(false)} className="py-2.5 font-body text-sm tracking-[0.2em] text-slate-300">
                    LOGIN
                  </a>
                  <a
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="btn-primary mt-2 px-5 py-3 text-center font-body text-sm"
                  >
                    SIGN UP
                  </a>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
