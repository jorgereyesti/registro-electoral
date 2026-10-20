'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RecuperarClavePage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;

      setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al solicitar restablecimiento de contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 text-zinc-100">
      <div className="w-full max-w-md bg-white/10 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        <div>
          <Link
            href="/login"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio de sesión
          </Link>
          <h2 className="text-xl font-bold text-white">Recuperar Contraseña</h2>
          <p className="text-xs text-zinc-300 mt-1">
            Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu clave.
          </p>
        </div>

        {message && (
          <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                placeholder="tu-correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-black/25 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-zinc-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar enlace'}
          </button>
        </form>
      </div>
    </div>
  );
}
