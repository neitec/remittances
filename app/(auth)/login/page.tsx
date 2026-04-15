"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";

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
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auth0 email/password login
  const handleAuth0EmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginWithRedirect({
        appState: { returnTo: "/dashboard" },
        ...(email && {
          authorizationParams: {
            login_hint: email,
            screen_hint: "login",
          },
        }),
      });
    } catch (err) {
      setError("Error al conectar con Auth0");
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
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-[#0a2f26] to-brand-turquoise relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 -left-40 w-80 h-80 bg-brand-turquoise opacity-10 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-20 -right-40 w-80 h-80 bg-brand-coral opacity-5 rounded-full blur-3xl"
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
            fill="currentColor"
            className="text-brand-white/5"
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
              <div className="w-16 h-16 bg-gradient-to-br from-brand-turquoise to-brand-coral rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-8 h-8 text-brand-white" />
              </div>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-5xl lg:text-6xl font-bold text-brand-white font-heading mb-2"
            >
              Remesas
            </motion.h1>
            <motion.p
              variants={item}
              className="text-2xl lg:text-3xl text-brand-turquoise font-semibold mb-6"
            >
              Digitales
            </motion.p>

            {/* Emotional tagline */}
            <motion.p
              variants={item}
              className="text-2xl lg:text-3xl text-brand-white font-medium mb-6 leading-tight"
            >
              Tu dinero llega al instante
            </motion.p>

            <motion.p
              variants={item}
              className="text-brand-sand/90 text-base lg:text-lg mb-10 leading-relaxed"
            >
              Envía dinero a República Dominicana de forma rápida, segura y sin comisiones ocultas. Conecta con los tuyos, sin fronteras.
            </motion.p>

            {/* Benefit cards */}
            <motion.div
              className="space-y-4"
              variants={container}
            >
              {[
                { icon: Zap, text: "Instantáneo", desc: "En segundos" },
                { icon: Shield, text: "Seguro", desc: "Encriptado" },
                { icon: Globe, text: "Global", desc: "24/7 disponible" },
              ].map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.text}
                    variants={item}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-turquoise/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-brand-turquoise" />
                    </div>
                    <div>
                      <p className="text-brand-white font-semibold">{benefit.text}</p>
                      <p className="text-brand-sand/70 text-sm">{benefit.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
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
            <div className="bg-brand-white/98 backdrop-blur-md rounded-3xl shadow-2xl p-8 space-y-6 border border-brand-white/20">
              {/* Auth0 email/password + Google form */}
              <>
                <h2 className="text-2xl font-bold text-brand-navy font-heading text-center">
                  Iniciar sesión
                </h2>
                  <p className="text-brand-sand/80 text-center text-sm mb-6">
                    Accede con tu email o cuenta de Google
                  </p>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="bg-brand-coral/10 border border-brand-coral text-brand-coral px-4 py-3 rounded-lg text-sm"
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
                    onSubmit={handleAuth0EmailLogin}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {/* Email Input */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="auth0Email"
                        className="text-brand-navy font-semibold font-heading"
                      >
                        Correo electrónico
                      </Label>
                      <Input
                        id="auth0Email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="border-2 border-brand-sand focus:border-brand-turquoise focus:ring-brand-turquoise/20"
                      />
                    </div>

                    {/* Continue Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-brand-turquoise to-brand-turquoise/90 hover:from-brand-turquoise/90 hover:to-brand-turquoise text-brand-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                      >
                        {isLoading ? (
                          <motion.div
                            className="flex items-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Conectando...</span>
                          </motion.div>
                        ) : (
                          "Continuar"
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>

                  {/* Divider */}
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex-1 h-px bg-brand-sand/30" />
                    <span className="text-xs text-brand-sand/60">o continúa con</span>
                    <div className="flex-1 h-px bg-brand-sand/30" />
                  </motion.div>

                  {/* Google Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <Button
                      type="button"
                      onClick={handleAuth0GoogleLogin}
                      disabled={isLoading}
                      className="w-full bg-brand-white border-2 border-brand-sand hover:bg-brand-sand/5 text-brand-navy font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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
                    </Button>
                  </motion.div>

                {/* Terms Footer */}
                <motion.p
                  className="text-xs text-brand-sand/70 text-center"
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
        className="absolute bottom-4 left-0 right-0 text-center text-brand-sand/60 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Plataforma segura de remesas digitales para toda la familia
      </motion.p>
    </div>
  );
}
