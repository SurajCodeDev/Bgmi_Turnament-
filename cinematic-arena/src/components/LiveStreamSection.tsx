"use client";

import { motion } from "framer-motion";
import { matches } from "@/data/arena";

export function LiveStreamSection() {
  const live = matches.find((m) => m.status === "LIVE");
  const upcoming = matches.filter((m) => m.status === "UPCOMING").slice(0, 2);

  return (
    <section id="watch" className="relative py-24">
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="section-label mb-3">LIVE BROADCAST</span>
          <h2 className="font-display text-3xl font-black tracking-wide text-white sm:text-5xl">
            WATCH <span className="text-red-400">LIVE</span>
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="holo-panel scanline clip-corner relative overflow-hidden lg:col-span-2"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <img src="/images/bgmi-13.jpg" alt="Live broadcast" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d16]/80 via-transparent to-[#0a0d16]/30" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-sm border border-red-500/60 bg-[#05060a]/80 px-3 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="font-body text-[10px] font-bold tracking-[0.25em] text-red-400">LIVE NOW</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-display text-lg font-black tracking-[0.15em] text-white sm:text-xl">{live?.tournament || "BGMI Championship Series"}</p>
                <p className="mt-1 font-body text-xs tracking-[0.2em] text-slate-300">
                  {live?.map || "ERANGEL"} · {live?.id || "MATCH 04"} · {live?.time || "08:30 PM"}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-4">
            <div className="holo-panel clip-corner p-5">
              <p className="mb-4 font-display text-xs font-bold tracking-[0.3em] text-white">UP NEXT</p>
              <div className="space-y-3">
                {upcoming.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between border border-[#1a2134] bg-[#0a0d16]/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-body text-sm font-semibold text-slate-200">{m.id} · {m.map}</p>
                      <p className="font-body text-[9px] tracking-[0.15em] text-slate-500">{m.tournament}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xs font-black text-cyan-400">{m.time}</p>
                      <p className="font-body text-[9px] text-slate-500">{m.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              href="/matches"
              data-cursor="VIEW"
              className="btn-primary flex items-center justify-center gap-2 px-6 py-4 font-display text-sm"
            >
              FULL MATCH SCHEDULE <span>→</span>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}
