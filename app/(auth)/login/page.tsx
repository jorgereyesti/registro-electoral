'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Vote, Lock, Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      router.push('/personas');
      router.refresh();
    } catch (err: any) {
      console.error('Error de autenticación:', err);
      setErrorMessage(
        err.message === 'Invalid login credentials'
          ? 'Credenciales inválidas. Verifica tu correo y contraseña.'
          : err.message || 'Error al iniciar sesión.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 text-zinc-100">
      <div className="w-full max-w-md bg-white/10 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/10 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Vote className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Sistema de Registro Electoral
          </h1>
          <p className="text-xs font-semibold text-indigo-300">
            San Miguel de Tucumán • Plataforma Cartográfica
          </p>
        </div>

        {/* Alerta de Error */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                placeholder="ejemplo@organizacion.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-black/25 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-zinc-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Contraseña
              </label>
              <Link
                href="/recuperar"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                ¿Olvidaste tu clave?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-black/25 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-zinc-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Validando credenciales...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-zinc-400">
          Control de acceso protegido con políticas RLS y cifrado de extremo a extremo.
        </div>
      </div>
    </div>
  );
}
