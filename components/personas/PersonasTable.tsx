'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PersonaRecord } from '@/lib/types/personas';
import { BARRIOS_LIST, CIRCUITOS_LIST } from '@/lib/geo/data';
import { createClient } from '@/lib/supabase/client';
import { 
  Search, 
  Filter, 
  FileSpreadsheet, 
  UserPlus, 
  Eye, 
  Edit3, 
  Trash2, 
  MapPin, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface PersonasTableProps {
  initialPersonas: PersonaRecord[];
  totalCount: number;
  currentUserId: string;
  isAdmin: boolean;
}

export default function PersonasTable({
  initialPersonas,
  totalCount,
  currentUserId,
  isAdmin,
}: PersonasTableProps) {
  const router = useRouter();
  const supabase = createClient();

  const [personas, setPersonas] = useState<PersonaRecord[]>(initialPersonas);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBarrio, setSelectedBarrio] = useState('todos');
  const [selectedCircuito, setSelectedCircuito] = useState('todos');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filtrado reactivo en el cliente
  const filteredPersonas = personas.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    const matchQuery = !q || p.dni.includes(q) || p.apellido_nombre.toLowerCase().includes(q);
    const matchBarrio = selectedBarrio === 'todos' || p.barrio.toLowerCase() === selectedBarrio.toLowerCase();
    const matchCircuito = selectedCircuito === 'todos' || p.circuito.toLowerCase() === selectedCircuito.toLowerCase();
    return matchQuery && matchBarrio && matchCircuito;
  });

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredPersonas.length / pageSize));
  const paginatedPersonas = filteredPersonas.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = async (id: string, personaName: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${personaName}?`)) {
      return;
    }

    setDeletingId(id);
    setActionError(null);

    try {
      const { error } = await (supabase.from('personas') as any)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(
          error.message.includes('policy')
            ? 'Permiso denegado: Como Referente solo puedes eliminar registros creados por tu propio usuario.'
            : error.message
        );
      }

      setPersonas((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch (err: any) {
      console.error('Error al eliminar:', err);
      setActionError(err.message || 'No se pudo eliminar el registro.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedBarrio !== 'todos') params.set('barrio', selectedBarrio);
    if (selectedCircuito !== 'todos') params.set('circuito', selectedCircuito);
    window.open(`/api/exportar-excel?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Alerta de error de acción */}
      {actionError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Barra de Filtros y Acciones */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between transition-colors">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por DNI o Apellido y Nombre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filtros Combobox */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedBarrio}
            onChange={(e) => {
              setSelectedBarrio(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-500 max-w-[170px]"
          >
            <option value="todos">Todos los Barrios</option>
            {BARRIOS_LIST.map((b) => (
              <option key={b.nombre} value={b.nombre}>
                {b.nombre}
              </option>
            ))}
          </select>

          <select
            value={selectedCircuito}
            onChange={(e) => {
              setSelectedCircuito(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Todos los Circuitos</option>
            {CIRCUITOS_LIST.map((c) => (
              <option key={c.numero} value={c.numero}>
                Cir. {c.numero}
              </option>
            ))}
          </select>

          {/* Exportar Excel - Emerald-500 Secundario */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shadow-emerald-600/20 cursor-pointer"
            title="Exportar a archivo Excel .xlsx"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          {/* Nuevo Registro - Indigo-600 Primario */}
          <Link
            href="/personas/nueva"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shadow-indigo-600/20 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nuevo Votante</span>
          </Link>
        </div>
      </div>

      {/* Tabla de Personas */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">DNI</th>
                <th className="px-4 py-3">Apellido y Nombre</th>
                <th className="px-4 py-3">Edad</th>
                <th className="px-4 py-3">Barrio / Circuito</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginatedPersonas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                      <p className="font-medium text-sm text-zinc-600 dark:text-zinc-400">No se encontraron personas con los filtros seleccionados.</p>
                      <Link
                        href="/personas/nueva"
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        Registrar una nueva persona ahora
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPersonas.map((p) => {
                  const birthYear = new Date(p.fecha_nacimiento).getFullYear();
                  const age = new Date().getFullYear() - birthYear;
                  const canDelete = isAdmin || p.created_by === currentUserId;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-zinc-900 dark:text-white">
                        {p.dni}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {p.apellido_nombre}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {age} años
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{p.barrio}</span>
                        <span className="text-[11px] text-zinc-400 block">Circuito {p.circuito}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                        {p.direccion || <span className="text-zinc-400 italic">Sin dirección</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 font-mono">
                        {p.telefono || <span className="text-zinc-400 italic">No registrado</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.lat != null && (
                            <Link
                              href={`/mapa?persona=${p.id}`}
                              className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Ver en el mapa"
                            >
                              <MapPin className="w-4 h-4" />
                            </Link>
                          )}

                          <Link
                            href={`/personas/${p.id}`}
                            className="p-1.5 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Ver ficha completa"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/personas/${p.id}/editar`}
                            className="p-1.5 text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Editar datos"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {canDelete && (
                            <button
                              onClick={() => handleDelete(p.id, p.apellido_nombre)}
                              disabled={deletingId === p.id}
                              className="p-1.5 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                              title="Eliminar votante"
                            >
                              {deletingId === p.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador */}
        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-wrap items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-2">
          <div>
            Mostrando <strong>{filteredPersonas.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> a{' '}
            <strong>{Math.min(currentPage * pageSize, filteredPersonas.length)}</strong> de{' '}
            <strong>{filteredPersonas.length}</strong> votantes filtrados (Total general: {totalCount})
          </div>

          <div className="flex items-center gap-2">
            <span>Filas por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-zinc-700 dark:text-zinc-300"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <div className="flex items-center gap-1 ml-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
