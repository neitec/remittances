"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp } from "@/components/motion/CountUp";
import { useExchangeRate } from "@/lib/hooks/queries/useExchangeRate";

interface HeroBalanceCardProps {
  balanceEur: number;
  isLoading: boolean;
  equivalenceDop?: number;
}

const INFO_SECTIONS = [
  {
    title: null,
    body: "Tu wallet on-chain en Remita GCS te permite depositar euros y operar con una versión digital del euro, diseñada para mover dinero de forma más eficiente, transparente y global. Esta infraestructura reduce fricción y costes, y te da acceso a una experiencia de transferencias y cobros internacionales mucho más ágil.",
  },
  {
    title: "Remesas",
    body: "Envía y recibe remesas desde Europa mediante SEPA o desde Estados Unidos mediante ACH hacia República Dominicana. Después, podrás disponer de tus fondos y retirarlos fácilmente en tu cuenta bancaria en pesos dominicanos.",
  },
  {
    title: "Pagos globales",
    body: "Además, podrás recibir pagos desde el exterior por tus servicios en divisas digitales como USDC, ampliando tu alcance a nivel global. Esos fondos también podrán retirarse en tu cuenta bancaria dominicana de forma sencilla.",
  },
];

const PARTICLES = [
  { left: "6%",  bottom: "24%", delay: "0s",    dur: "5.2s", size: "1.5px" },
  { left: "18%", bottom: "50%", delay: "1.5s",  dur: "4.8s", size: "2px"   },
  { left: "32%", bottom: "20%", delay: "3.0s",  dur: "5.8s", size: "1.5px" },
  { left: "47%", bottom: "60%", delay: "0.8s",  dur: "5.4s", size: "2px"   },
  { left: "12%", bottom: "72%", delay: "2.2s",  dur: "5.0s", size: "1.5px" },
  { left: "58%", bottom: "40%", delay: "4.1s",  dur: "4.4s", size: "2px"   },
  { left: "70%", bottom: "68%", delay: "1.0s",  dur: "5.6s", size: "1.5px" },
  { left: "82%", bottom: "28%", delay: "3.4s",  dur: "4.9s", size: "2px"   },
  { left: "25%", bottom: "82%", delay: "0.4s",  dur: "5.3s", size: "1.5px" },
  { left: "90%", bottom: "55%", delay: "2.8s",  dur: "4.7s", size: "1.5px" },
];

// ── Wireframe globe — abstract on-chain infrastructure visual ──
function GlobeVisual() {
  const cx = 90, cy = 90, r = 66;
  const pf = 0.27; // perspective foreshortening for parallels
  // Two landmark nodes: abstract "origin" and "destination"
  const nA = { x: cx - 29, y: cy - 24 };
  const nB = { x: cx + 34, y: cy + 14 };

  return (
    <motion.svg
      viewBox="0 0 180 180"
      width="180"
      height="180"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8, delay: 0.5, ease: "easeOut" }}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="gAtmos" cx="40%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="rgba(130,185,255,0.32)" />
          <stop offset="55%"  stopColor="rgba(30,80,220,0.11)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <radialGradient id="gSphere" cx="36%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="rgba(150,205,255,0.22)" />
          <stop offset="50%"  stopColor="rgba(15,55,180,0.13)" />
          <stop offset="100%" stopColor="rgba(0,10,60,0.06)" />
        </radialGradient>
      </defs>

      {/* Atmospheric halo */}
      <circle cx={cx} cy={cy} r={r + 22} fill="url(#gAtmos)" />

      {/* Sphere body */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="url(#gSphere)"
        stroke="rgba(255,255,255,0.13)"
        strokeWidth={0.75}
      />

      {/* ── Parallels (latitude lines) ── */}
      {/* Equator */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * pf}
        fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={0.55} />
      {/* ±30° */}
      <ellipse cx={cx} cy={cy - r * 0.5} rx={r * 0.866} ry={r * 0.866 * pf}
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
      <ellipse cx={cx} cy={cy + r * 0.5} rx={r * 0.866} ry={r * 0.866 * pf}
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
      {/* ±60° */}
      <ellipse cx={cx} cy={cy - r * 0.866} rx={r * 0.5} ry={r * 0.5 * pf}
        fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={0.5} />
      <ellipse cx={cx} cy={cy + r * 0.866} rx={r * 0.5} ry={r * 0.5 * pf}
        fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={0.5} />

      {/* ── Meridians (longitude lines) ── */}
      <ellipse cx={cx} cy={cy} rx={r * 0.20} ry={r}
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.55} />
      <ellipse cx={cx} cy={cy} rx={r * 0.65} ry={r}
        fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={0.5} />
      <ellipse cx={cx} cy={cy} rx={r * 0.97} ry={r}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={0.5} />

      {/* ── Static outer orbit ring ── */}
      <ellipse
        cx={cx} cy={cy}
        rx={r + 16} ry={(r + 16) * 0.17}
        fill="none" stroke="rgba(140,205,255,0.16)" strokeWidth={0.7}
        transform={`rotate(46 ${cx} ${cy})`}
      />

      {/* ── Animated outer orbit ring + orbiting € and $ ── */}
      <motion.g
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        <ellipse
          cx={cx} cy={cy}
          rx={r + 22} ry={(r + 22) * 0.20}
          fill="none" stroke="rgba(155,210,255,0.22)" strokeWidth={0.75}
        />
        {/* € orbiting at 140° position on the ring */}
        <text
          x={22.6} y={104}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.32)"
          style={{ fontSize: "9px", fontFamily: "serif", fontWeight: "bold" }}
        >€</text>
        {/* $ orbiting at −40° position (opposite side) */}
        <text
          x={157.4} y={76}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.26)"
          style={{ fontSize: "8px", fontFamily: "serif", fontWeight: "bold" }}
        >$</text>
      </motion.g>

      {/* ── Transfer arc (dashed, flows from nA → nB) ── */}
      <path
        d={`M${nA.x},${nA.y} Q${cx + 4},${cy - 36} ${nB.x},${nB.y}`}
        fill="none"
        stroke="rgba(160,218,255,0.38)"
        strokeWidth={0.9}
        strokeDasharray="4 5"
        style={{ animation: "arc-dash 3.2s linear infinite" }}
      />

      {/* ── Node A — origin (upper-left) + € label ── */}
      <motion.circle
        cx={nA.x} cy={nA.y} r={9}
        animate={{ opacity: [0.10, 0.22, 0.10] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ fill: "rgba(100,168,255,0.10)" }}
      />
      <circle cx={nA.x} cy={nA.y} r={4}   fill="rgba(155,205,255,0.24)" />
      <circle cx={nA.x} cy={nA.y} r={2.2} fill="rgba(220,238,255,0.88)" />

      {/* ── Node B — destination (right) ── */}
      <motion.circle
        cx={nB.x} cy={nB.y} r={7}
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
        style={{ fill: "rgba(100,168,255,0.08)" }}
      />
      <circle cx={nB.x} cy={nB.y} r={3.2} fill="rgba(155,205,255,0.20)" />
      <circle cx={nB.x} cy={nB.y} r={1.8} fill="rgba(220,238,255,0.80)" />

      {/* Sphere highlight (soft specular) */}
      <ellipse cx={cx - 15} cy={cy - 20} rx={18} ry={12}
        fill="rgba(205,228,255,0.055)" />
    </motion.svg>
  );
}

export function HeroBalanceCard({ balanceEur, isLoading, equivalenceDop }: HeroBalanceCardProps) {
  const { data: fxData } = useExchangeRate("EUR", "DOP");
  const dopRate = fxData?.rate ?? null;
  const calculatedDop = equivalenceDop || (dopRate ? balanceEur * dopRate : null);
  const [showInfo, setShowInfo] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openInfo = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowInfo(true);
  };
  const closeInfo = () => {
    hideTimer.current = setTimeout(() => setShowInfo(false), 120);
  };

  return (
    // Outer wrapper: NO overflow-hidden so tooltip can escape
    <div className="relative">

      {/* ── Card ── */}
      <div className="relative rounded-[2.5rem] overflow-hidden" style={{ height: "230px" }}>

        {/* Layer 1: Base gradient */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(145deg, #001462 0%, #003ec7 52%, #1252e8 100%)" }}
        />

        {/* Layer 2: Top-left light orb — slow drift */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "280px", height: "280px",
            top: "-80px", left: "-60px",
            background: "radial-gradient(circle, rgba(100,168,255,0.22) 0%, transparent 68%)",
          }}
          animate={{ x: [0, 26, 8, 0], y: [0, 18, 36, 0] }}
          transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
        />

        {/* Layer 3: Bottom-right depth orb — counter-drift */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "340px", height: "340px",
            bottom: "-120px", right: "-90px",
            background: "radial-gradient(circle, rgba(0,48,190,0.52) 0%, transparent 68%)",
          }}
          animate={{ x: [0, -20, -36, 0], y: [0, -12, -24, 0] }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, delay: 2.5 }}
        />

        {/* Layer 3b: Orange warm bloom — tertiary accent, suggests transfer warmth */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "260px", height: "260px",
            top: "-50px", right: "12%",
            background: "radial-gradient(circle, rgba(255,185,110,0.09) 0%, rgba(255,140,60,0.04) 45%, transparent 68%)",
          }}
          animate={{ x: [0, -22, -38, -22, 0], y: [0, 24, 12, -6, 0] }}
          transition={{ duration: 19, ease: "easeInOut", repeat: Infinity, delay: 1.2 }}
        />

        {/* Layer 4: Structural grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Layer 5: Transfer flow particles */}
        <div className="absolute inset-0 pointer-events-none">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                width: p.size, height: p.size,
                background: "rgba(255,255,255,0.85)",
                left: p.left, bottom: p.bottom,
                animation: `transfer-flow ${p.dur} ease-in-out ${p.delay} infinite`,
              }}
            />
          ))}
        </div>

        {/* Layer 6: Diagonal light sweep */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-y-0 w-[35%]"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
              skewX: "-18deg",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: "700%" }}
            transition={{ duration: 3.5, ease: "linear", repeat: Infinity, repeatDelay: 9 }}
          />
        </div>

        {/* Layer 7: Globe visual — z-10, before content so text renders on top */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none"
          style={{ right: "44px" }}
        >
          <GlobeVisual />
        </div>

        {/* Content — z-10, after globe = renders on top */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 pl-14" style={{ maxWidth: "68%" }}>

          {/* Top row: wallet pill left, LIVE pushed to right edge */}
          <div className="flex items-center">

            {/* Wallet on-chain pill */}
            <div
              className="flex items-center gap-2 px-2.5 py-[5px] rounded-full"
              style={{
                background: "rgba(0,0,0,0.28)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div className="relative flex items-center justify-center w-3 h-3 flex-shrink-0">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring" />
                <span className="relative w-2 h-2 rounded-full bg-emerald-400 block" />
              </div>
              <span className="text-white/65 text-[10px] font-inter tracking-[0.07em] uppercase">
                Tu wallet on-chain
              </span>
              <button
                ref={buttonRef}
                onMouseEnter={openInfo}
                onMouseLeave={closeInfo}
                className="flex items-center justify-center w-[16px] h-[16px] rounded-full transition-all flex-shrink-0"
                style={{
                  background: showInfo ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
                aria-label="Más información sobre tu wallet on-chain"
              >
                <svg width="8" height="8" viewBox="0 0 9 9" fill="none">
                  <path
                    d="M4.5 1a.6.6 0 1 1 0 1.2A.6.6 0 0 1 4.5 1ZM3.75 3.5h1.5v3.75h-1.5V3.5Z"
                    fill="white" fillOpacity={0.75}
                  />
                </svg>
              </button>
            </div>

            {/* LIVE badge — pushed to right edge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full ml-5"
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block" />
              <span className="text-white/70 text-[11px] font-inter font-semibold tracking-[0.16em] uppercase">
                Live
              </span>
            </div>
          </div>

          {/* Balance */}
          <div>
            <p className="text-white/38 text-[10px] font-inter tracking-[0.22em] uppercase mb-2">
              Saldo disponible
            </p>
            {isLoading ? (
              <div className="h-14 bg-white/10 rounded-2xl animate-pulse" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2
                  className="text-white font-manrope font-extrabold leading-none tabular"
                  style={{ fontSize: "clamp(34px, 7vw, 46px)", letterSpacing: "-0.025em" }}
                >
                  <CountUp from={0} to={balanceEur} duration={900} />
                </h2>
              </motion.div>
            )}
          </div>

          {/* Bottom: DOP amount + EUR/DOP badge — left-anchored */}
          <div>
            <p className="text-white/30 text-[10px] font-inter tracking-[0.2em] uppercase mb-1.5">
              Equivalencia en pesos
            </p>
            {isLoading ? (
              <div className="h-6 bg-white/10 rounded-lg w-44 animate-pulse" />
            ) : calculatedDop !== null && calculatedDop !== undefined ? (
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-white/75 font-inter font-semibold text-[15px] tabular">
                  RD${" "}
                  {calculatedDop.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                {/* EUR/DOP badge — pushed to right edge */}
                <div
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-[4px] rounded-full ml-5"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.20)",
                  }}
                >
                  <div className="flex items-center flex-shrink-0">
                    <div
                      className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-white font-manrope font-bold text-[9px] relative z-10"
                      style={{
                        background: "linear-gradient(135deg, #001462, #003ec7)",
                        border: "1.5px solid rgba(255,255,255,0.22)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                      }}
                    >
                      €
                    </div>
                    <div
                      className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-white font-manrope font-bold text-[9px] relative -ml-[7px]"
                      style={{
                        background: "linear-gradient(135deg, #047857, #10b981)",
                        border: "1.5px solid rgba(255,255,255,0.22)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                      }}
                    >
                      $
                    </div>
                  </div>
                  {dopRate && (
                    <span className="text-white/75 text-[10px] font-inter font-medium tabular">
                      1 EUR = {dopRate.toFixed(2)} DOP
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-white/50 text-[13px] font-inter">Cargando tipo de cambio...</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Info tooltip — rendered OUTSIDE overflow-hidden ── */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            ref={tooltipRef}
            onMouseEnter={openInfo}
            onMouseLeave={closeInfo}
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50"
            style={{ top: "52px", left: "24px", width: "min(480px, calc(100% - 48px))" }}
          >
            <div
              className="rounded-[18px] p-5"
              style={{
                background: "rgba(255, 255, 255, 0.97)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "0 12px 40px rgba(0,20,100,0.18), 0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,62,199,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--color-primary-fixed)" }}
                  >
                    <svg width="8" height="8" viewBox="0 0 9 9" fill="none">
                      <path
                        d="M4.5 1a.6.6 0 1 1 0 1.2A.6.6 0 0 1 4.5 1ZM3.75 3.5h1.5v3.75h-1.5V3.5Z"
                        fill="#003ec7"
                      />
                    </svg>
                  </span>
                  <p className="text-[11px] font-inter font-semibold text-[var(--color-primary)] tracking-wide uppercase">
                    ¿Qué es tu wallet on-chain?
                  </p>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-container-low)] transition-colors text-[var(--color-on-surface-variant)]/50 hover:text-[var(--color-on-surface)] flex-shrink-0"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M1.5 1.5 8.5 8.5M8.5 1.5 1.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3.5">
                {INFO_SECTIONS.map((section, i) => (
                  <div key={i}>
                    {section.title && (
                      <p className="text-[11px] font-inter font-bold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-1.5">
                        {section.title}
                      </p>
                    )}
                    <p
                      className="font-inter text-[13px] leading-[1.7]"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
