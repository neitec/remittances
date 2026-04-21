"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { toast } from "sonner";
import { usePasswordlessOTP } from "@/lib/hooks/useEmailPasswordLogin";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LoginPage() {
  const router = useRouter();
  const { loginWithRedirect } = useAuth0();
  const { sendOTP, verifyOTP } = usePasswordlessOTP();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email) {
        setError("Por favor ingresa tu email");
        setIsLoading(false);
        return;
      }
      await sendOTP(email);
      setOtpSent(true);
      toast.success("Código enviado a tu email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar código");
      setIsLoading(false);
    }
  };

  // Verify OTP and login
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!otp) {
        setError("Por favor ingresa el código");
        setIsLoading(false);
        return;
      }
      await verifyOTP(email, otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido");
      setIsLoading(false);
    }
  };

  // Auth0 Google login
  const handleAuth0GoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      await loginWithRedirect({
        appState: { returnTo: "/dashboard" },
        authorizationParams: {
          connection: "google-oauth2",
        },
      });
    } catch (err) {
      setError("Error al conectar con Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-container)] to-[var(--color-primary-fixed)] relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 -left-40 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-20 -right-40 w-80 h-80 bg-white opacity-3 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Animated background wave */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 opacity-20"
        animate={{ x: [-100, 100, -100] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg className="w-full h-full" viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none">
          <path
            d="M0,80 Q180,40 360,80 T720,80 T1080,80 T1440,80 L1440,200 L0,200 Z"
            fill="white"
            opacity="0.05"
          />
        </svg>
      </motion.div>

      {/* Main content wrapper */}
      <div className="min-h-screen flex flex-col lg:flex-row relative z-10">
        {/* Brand content — left column (desktop) / top (mobile) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
          {/* Logo and brand messaging */}
          <motion.div
            className="w-full max-w-md text-center lg:text-left"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Logo Icon */}
            <motion.div
              variants={item}
              className="inline-block lg:inline-block mb-6"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                <Image
                  src="/remita-isologo.png"
                  alt="Remita"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-5xl lg:text-6xl font-manrope font-extrabold text-white mb-2"
            >
              Remita
            </motion.h1>
            <motion.p
              variants={item}
              className="text-xl lg:text-2xl text-white/80 font-inter font-medium mb-6"
            >
              La forma más rápida de enviar dinero
            </motion.p>

            {/* Emotional tagline */}
            <motion.p
              variants={item}
              className="text-lg lg:text-xl text-white/70 font-inter font-medium mb-6 leading-tight"
            >
              Tu dinero llega al instante
            </motion.p>

            <motion.p
              variants={item}
              className="text-white/60 text-base lg:text-lg font-inter mb-10 leading-relaxed"
            >
              Envía dinero cross-border de manera global: rápido, seguro y sin comisiones ocultas. Llega a cualquier destino, sin fronteras.
            </motion.p>
       

            {/* Benefit cards */}
            <motion.div
              className="space-y-4"
              variants={container}
            >
              {[
                { icon: "bolt", text: "Instantáneo", desc: "En segundos" },
                { icon: "verified_user", text: "Seguro", desc: "Encriptado" },
                { icon: "public", text: "Global", desc: "24/7 disponible" },
              ].map((benefit) => (
                  <motion.div
                    key={benefit.text}
                    variants={item}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Icon name={benefit.icon} size={20} className="text-white" filled />
                    </div>
                    <div>
                      <p className="text-white font-manrope font-bold text-sm">{benefit.text}</p>
                      <p className="text-white/60 text-xs font-inter">{benefit.desc}</p>
                    </div>
                  </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Form section — right column (desktop) / bottom (mobile) */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20">
              {/* Auth0 email/password + Google form */}
              <>
                <h2 className="text-2xl font-manrope font-bold text-[var(--color-on-surface)] text-center">
                  Iniciar sesión
                </h2>
                  <p className="text-[var(--color-on-surface-variant)] text-center text-sm mb-6 font-inter">
                    Accede con tu email o cuenta de Google
                  </p>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="bg-[var(--color-error)]/10 border border-[var(--color-error)] text-[var(--color-error)] px-4 py-3 rounded-lg text-sm font-inter"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: [-8, 8, -5, 5, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.form
                    onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {!otpSent ? (
                      <>
                        {/* Email Input - Step 1 */}
                        <div className="space-y-3">
                          <label
                            htmlFor="auth0Email"
                            className="text-[var(--color-on-surface)] font-inter font-bold text-sm"
                          >
                            Correo electrónico
                          </label>
                          <input
                            id="auth0Email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] font-inter focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/50"
                          />
                        </div>

                        {/* Send Code Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        >
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[var(--color-primary)] hover:opacity-90 text-white font-manrope font-bold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <Icon name="hourglass_empty" size={18} className="animate-spin" />
                                <span>Enviando código...</span>
                              </>
                            ) : (
                              "Enviar código"
                            )}
                          </button>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        {/* OTP Input - Step 2 */}
                        <div className="space-y-3">
                          <label
                            htmlFor="otp"
                            className="text-[var(--color-on-surface)] font-inter font-bold text-sm"
                          >
                            Código de verificación
                          </label>
                          <p className="text-[12px] text-[var(--color-on-surface-variant)]/60 font-inter">
                            Hemos enviado un código a <strong>{email}</strong>
                          </p>
                          <input
                            id="otp"
                            type="text"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            disabled={isLoading}
                            maxLength={6}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] font-inter text-center text-2xl tracking-widest focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/50"
                          />
                        </div>

                        {/* Verify Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        >
                          <button
                            type="submit"
                            disabled={isLoading || otp.length < 6}
                            className="w-full bg-[var(--color-primary)] hover:opacity-90 text-white font-manrope font-bold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <Icon name="hourglass_empty" size={18} className="animate-spin" />
                                <span>Verificando...</span>
                              </>
                            ) : (
                              "Verificar"
                            )}
                          </button>
                        </motion.div>

                        {/* Back Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                          }}
                          disabled={isLoading}
                          className="w-full text-[var(--color-primary)] font-inter font-semibold text-sm hover:opacity-70 transition-opacity"
                        >
                          Usar otro email
                        </button>
                      </>
                    )}
                  </motion.form>

                  {/* Divider */}
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex-1 h-px bg-[var(--color-outline-variant)]/30" />
                    <span className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter">o continúa con</span>
                    <div className="flex-1 h-px bg-[var(--color-outline-variant)]/30" />
                  </motion.div>

                  {/* Google Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <button
                      type="button"
                      onClick={handleAuth0GoogleLogin}
                      disabled={isLoading}
                      className="w-full bg-white border border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] font-manrope font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      {/* Google Icon (inline SVG) */}
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
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
                      {isLoading ? "Conectando..." : "Continuar con Google"}
                    </button>
                  </motion.div>

                {/* Terms Footer */}
                <motion.p
                  className="text-xs text-[var(--color-on-surface-variant)]/70 text-center font-inter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Al continuar, aceptas nuestros términos de servicio
                </motion.p>
              </>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer text */}
      <motion.p
        className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-xs font-inter"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Remita · Tu dinero llega al instante
      </motion.p>
    </div>
  );
}
