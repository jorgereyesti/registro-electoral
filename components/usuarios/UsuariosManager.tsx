'use client';

import React, { useState } from 'react';
import { PerfilUsuario } from '@/lib/types/personas';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserPlus, Mail, User, Shield, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UsuariosManagerProps {
  initialUsuarios: (PerfilUsuario & { created_at: string })[];
  currentUserId: string;
}

export default function UsuariosManager({ initialUsuarios, currentUserId }: UsuariosManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [rol, setRol] = useState<'admin' | 'referente'>('referente');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Registrar usuario mediante Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            nombre_completo: nombreCompleto.trim(),
            rol: rol,
          },
        },
      });

      if (error) throw error;

      setSuccessMsg('Usuario creado exitosamente. Se ha sincronizado su rol en el sistema.');
      setTimeout(() => {
        setShowModal(false);
        setEmail('');
        setPassword('');
        setNombreCompleto('');
        setRol('referente');
        setSuccessMsg(null);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error('Error al registrar usuario:', err);
      setErrorMsg(err.message || 'Error al dar de alta el usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarRol = async (userId: string, nuevoRol: 'admin' | 'referente') => {
    try {
      const { error } = await (supabase.from('perfiles') as any)
        .update({ rol: nuevoRol })
        .eq('id', userId);

      if (error) throw error;

      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, rol: nuevoRol } : u))
      );
    } catch (err: any) {
      alert('Error cambiando el rol: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra Superior */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Control de Usuarios y Roles
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Administración centralizada de cuentas de Administradores y Referentes territoriales.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Lista de Usuarios */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Nombre Completo</th>
                <th className="px-4 py-3">Correo Electrónico</th>
                <th className="px-4 py-3">Rol del Sistema</th>
                <th className="px-4 py-3">Fecha de Creación</th>
                <th className="px-4 py-3 text-right">Modificar Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {usuarios.map((u) => {
                const isCurrent = u.id === currentUserId;
                return (
                  <tr key={u.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {u.nombre_completo ? u.nombre_completo[0].toUpperCase() : (u.email ? u.email[0].toUpperCase() : 'U')}
                      </div>
                      <span>{u.nombre_completo || 'Sin nombre asignado'}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-normal">
                          (Tú)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 font-mono">
                      {u.email}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          u.rol === 'admin'
                            ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {u.rol === 'admin' ? '👑 Administrador' : '📌 Referente'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(u.created_at).toLocaleDateString('es-AR')}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {isCurrent ? (
                        <span className="text-[11px] text-zinc-400 italic">No editable</span>
                      ) : (
                        <select
                          value={u.rol}
                          onChange={(e) => handleCambiarRol(u.id, e.target.value as 'admin' | 'referente')}
                          className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="referente">Referente</option>
                          <option value="admin">Administrador</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Creación de Usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Registrar Nuevo Operador
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCrearUsuario} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Lic. Marcos Albarracín"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="correo@smt.gob.ar"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Contraseña Provisoria
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Rol Asignado
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as 'admin' | 'referente')}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="referente">📌 Referente Territorial (Crea y edita sólo sus votantes)</option>
                  <option value="admin">👑 Administrador (Acceso total y gestión de usuarios)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs shadow-indigo-600/20"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Crear Cuenta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
