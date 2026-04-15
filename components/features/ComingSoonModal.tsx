"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export function ComingSoonModal({ isOpen, onClose, feature = "Esta funcionalidad" }: ComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-brand-white rounded-lg p-6 sm:p-8 shadow-xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-brand-gold/10">
            <Clock className="w-6 h-6 text-brand-gold" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-brand-navy text-center mb-2">
          Próximamente
        </h2>

        <p className="text-sm text-brand-sand/80 text-center mb-6">
          {feature} estará disponible muy pronto. Estamos trabajando para traerte esta opción en la próxima fase.
        </p>

        <Button
          onClick={onClose}
          className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-2"
        >
          Entendido
        </Button>
      </motion.div>
    </motion.div>
  );
}
