"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const bootLines = [
  "INITIALIZING ARENA...",
  "LOADING PLAYER DATABASE",
  "LOADING TOURNAMENT ENGINE",
  "LOADING MATCH SCHEDULER",
  "CALIBRATING HOLOGRAPHIC UI",
  "SYNCING LIVE FEED",
];

const BOOT_FLAG = "nla_booted_v2";

export function BootSequence() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(BOOT_FLAG)) {
      setRemoved(true);
      return;
    }
    setVisible(true);
    const start = Date.now();
    const duration = 2600;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        sessionStorage.setItem(BOOT_FLAG, "1");
        setTimeout(() => setDone(true), 600);
        setTimeout(() => setRemoved(true), 1600);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const currentLine = bootLines[Math.min(Math.floor((progress / 100) * bootLines.length), bootLines.length - 1)];

  return (
    <AnimatePresence>
      {visible && !removed && (
        <motion.div
          className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-[#05060a]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div className="relative flex flex-col items-center gap-8 px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="h-10 w-10 rotate-45 border-2 border-cyan-400 shadow-glow flex items-center justify-center">
                <div className="h-2 w-2 -rotate-45 bg-cyan-400" />
              </div>
              <span className="font-display text-xl font-black tracking-[0.3em] text-white">
                NEXT LEVEL <span className="text-cyan-400">ARENA</span>
              </span>
            </motion.div>

            <div className="w-[320px] max-w-[80vw]">
              <div className="mb-3 flex items-center justify-between font-body text-[11px] tracking-[0.2em] text-slate-400">
                <span>{currentLine}</span>
                <span className="text-cyan-400">{progress}%</span>
              </div>
              <div className="h-[3px] w-full bg-[#1a2134] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: progress >= 100 ? 1 : 0 }}
              className="font-display text-sm font-bold tracking-[0.4em] text-white"
            >
              SYSTEM READY
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
