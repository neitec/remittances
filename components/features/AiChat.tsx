"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
}

const INITIAL: Message = {
  id: "init",
  role: "ai",
  text: "Hola! Soy Grace, tu asistente de Remita. Puedo ayudarte con transferencias, depósitos y todo lo relacionado con tu wallet on-chain. ¿En qué te puedo ayudar?",
};

function getResponse(msg: string): string {
  const t = msg.toLowerCase();
  if (t.includes("saldo") || t.includes("balance"))
    return "Tu saldo actual es de 7.533,25 €. ¿Quieres realizar alguna operación?";
  if (t.includes("transfer") || t.includes("envi") || t.includes("send"))
    return "Para enviar dinero ve a 'Transfiere' en el menú lateral. Puedes hacer transferencias P2P o a cuentas bancarias de forma instantánea.";
  if (t.includes("deposit") || t.includes("recib"))
    return "Para depositar euros dirígete a 'Deposita'. Recibirás instrucciones SEPA para transferir desde tu banco habitual.";
  if (t.includes("wallet") || t.includes("on-chain") || t.includes("chain") || t.includes("usdt"))
    return "Tu wallet on-chain te permite operar con una versión digital del euro. Próximamente también podrás recibir pagos en USDT y otras divisas digitales.";
  if (t.includes("comi") || t.includes("cost") || t.includes("precio") || t.includes("cuanto"))
    return "Remita opera con comisiones muy bajas gracias a la infraestructura on-chain. Los costes exactos se muestran antes de confirmar cada operación.";
  return "Entendido. Estoy aquí para ayudarte con tu wallet, transferencias y depósitos. ¿Tienes alguna pregunta concreta?";
}

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = () => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", text: getResponse(text) },
      ]);
    }, 880);
  };

  return (
    <>
      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-50 flex flex-col right-4 lg:right-6 bottom-[88px] lg:bottom-[88px]"
            style={{
              width: "clamp(300px, 90vw, 340px)",
              height: "460px",
              borderRadius: "20px",
              background: "var(--color-surface-container-lowest)",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow:
                "0 20px 60px rgba(0,20,80,0.14), 0 6px 16px rgba(0,0,0,0.07)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #001462 0%, #003ec7 60%, #1252e8 100%)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.14)" }}
                >
                  <Icon name="auto_awesome" size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-manrope font-bold text-[14px] leading-tight">
                    Grace
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block animate-pulse" />
                    <span className="text-white/50 text-[10px] font-inter tracking-wide">
                      En línea
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.10)" }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 1.5 8.5 8.5M8.5 1.5 1.5 8.5"
                    stroke="white"
                    strokeOpacity={0.7}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "ai" && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                      style={{ background: "var(--color-primary-fixed)" }}
                    >
                      <Icon
                        name="auto_awesome"
                        size={12}
                        className="text-[var(--color-primary)]"
                      />
                    </div>
                  )}
                  <div
                    className="max-w-[80%] px-3 py-2.5 text-[13px] font-inter leading-[1.55]"
                    style={
                      msg.role === "user"
                        ? {
                            background:
                              "linear-gradient(135deg, #003ec7, #0052ff)",
                            color: "#ffffff",
                            borderRadius: "14px 14px 4px 14px",
                          }
                        : {
                            background: "var(--color-surface-container-low)",
                            color: "var(--color-on-surface)",
                            border: "1px solid rgba(0,0,0,0.05)",
                            borderRadius: "14px 14px 14px 4px",
                          }
                    }
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                    style={{ background: "var(--color-primary-fixed)" }}
                  >
                    <Icon name="auto_awesome" size={12} className="text-[var(--color-primary)]" />
                  </div>
                  <div
                    className="flex items-center gap-1 px-3 py-3"
                    style={{
                      background: "var(--color-surface-container-low)",
                      border: "1px solid rgba(0,0,0,0.05)",
                      borderRadius: "14px 14px 14px 4px",
                    }}
                  >
                    {[0, 150, 300].map((delay, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{
                          background: "var(--color-on-surface-variant)",
                          opacity: 0.35,
                          animationDelay: `${delay}ms`,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-2 px-3 pb-3 pt-2 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Escribe un mensaje..."
                className="flex-1 text-[13px] font-inter px-3 py-2 rounded-[10px] outline-none"
                style={{
                  background: "var(--color-surface-container-low)",
                  color: "var(--color-on-surface)",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || thinking}
                className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-35"
                style={{
                  background: "linear-gradient(135deg, #003ec7, #0052ff)",
                }}
              >
                <Icon name="send" size={15} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating button ── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 lg:right-6 bottom-20 lg:bottom-6 z-50 flex items-center justify-center"
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "16px",
          background: open
            ? "linear-gradient(135deg, #001462 0%, #002da8 100%)"
            : "linear-gradient(135deg, #001462 0%, #003ec7 60%, #1252e8 100%)",
          boxShadow: open
            ? "0 4px 16px rgba(0,62,199,0.45), 0 0 0 4px rgba(0,62,199,0.10)"
            : "0 8px 24px rgba(0,62,199,0.38), 0 2px 6px rgba(0,0,0,0.10)",
        }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        transition={{ duration: 0.14 }}
        aria-label={open ? "Cerrar Grace" : "Abrir Grace"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="x"
              initial={{ rotate: -80, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 80, opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1.5 1.5 8.5 8.5M8.5 1.5 1.5 8.5"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="ai"
              initial={{ rotate: 80, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -80, opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              <Icon name="auto_awesome" size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
