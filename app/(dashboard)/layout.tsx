import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { 
  Users, 
  Map, 
  UserPlus, 
  ShieldCheck, 
  LogOut, 
  Vote
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtenemos el perfil con el rol del usuario
  const { data: perfil } = await (supabase.from('perfiles') as any)
    .select('*')
    .eq('id', user.id)
    .single();

  const isAdmin = perfil?.rol === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Barra de Navegación Superior */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo y Título */}
          <Link href="/personas" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 group-hover:bg-indigo-700 transition-colors">
              <Vote className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white">
                Registro Electoral
              </span>
              <span className="block text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                San Miguel de Tucumán
              </span>
            </div>
          </Link>

          {/* Menú de Navegación Central */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
            <Link
              href="/personas"
              className="px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 hover:shadow-xs text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Padrón</span>
            </Link>

            <Link
              href="/mapa"
              className="px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 hover:shadow-xs text-zinc-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-300 transition-all flex items-center gap-1.5"
            >
              <Map className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Mapa General</span>
            </Link>

            <Link
              href="/personas/nueva"
              className="px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 hover:shadow-xs text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-300 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Registrar Votante</span>
            </Link>

            {isAdmin && (
              <Link
                href="/usuarios"
                className="px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 hover:shadow-xs text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Gestión Usuarios</span>
              </Link>
            )}
          </nav>

          {/* Usuario, Tema y Cierre de Sesión */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {perfil?.nombre_completo || user.email}
              </div>
              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isAdmin 
                  ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' 
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
              }`}>
                {isAdmin ? '👑 Administrador' : '📌 Referente'}
              </div>
            </div>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                title="Cerrar sesión"
                className="p-2 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
