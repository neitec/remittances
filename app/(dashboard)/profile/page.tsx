"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-brand-white px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        className="max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-brand-navy font-heading mb-8">
          Perfil
        </h1>

        <Card className="border border-brand-sand/20">
          <CardHeader>
            <CardTitle className="text-brand-navy">Tu Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <>
                <div>
                  <p className="text-xs text-brand-sand/70 uppercase font-semibold mb-2">
                    Email
                  </p>
                  <p className="text-brand-navy font-semibold">{user.email}</p>
                </div>

                {user.name && (
                  <div>
                    <p className="text-xs text-brand-sand/70 uppercase font-semibold mb-2">
                      Nombre
                    </p>
                    <p className="text-brand-navy font-semibold">{user.name}</p>
                  </div>
                )}

                {user.sub && (
                  <div>
                    <p className="text-xs text-brand-sand/70 uppercase font-semibold mb-2">
                      ID de Usuario
                    </p>
                    <div className="bg-brand-sand/30 rounded-lg p-3 font-mono text-xs text-brand-navy break-all">
                      {user.sub}
                    </div>
                  </div>
                )}
              </>
            )}

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full bg-brand-coral hover:bg-brand-coral/90 text-brand-white flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
