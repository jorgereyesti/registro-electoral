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
  FileText,
  UserPlus, 
  Eye, 
  Edit3, 
  Trash2, 
  MapPin, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export interface ReferenteOption {
  id: string;
  nombre: string;
  email: string | null;
  rol?: string;
}

interface PersonasTableProps {
  initialPersonas: PersonaRecord[];
  totalCount: number;
  currentUserId: string;
  isAdmin: boolean;
  referentes?: ReferenteOption[];
}

export default function PersonasTable({
  initialPersonas,
  totalCount,
  currentUserId,
  isAdmin,
  referentes = [],
}: PersonasTableProps) {
  const router = useRouter();
  const supabase = createClient();

  const [personas, setPersonas] = useState<PersonaRecord[]>(initialPersonas);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBarrio, setSelectedBarrio] = useState('todos');
  const [selectedCircuito, setSelectedCircuito] = useState('todos');
  const [selectedReferente, setSelectedReferente] = useState('todos');
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
    const matchReferente =
      selectedReferente === 'todos' ||
      p.referente_id === selectedReferente ||
      p.created_by === selectedReferente;
    return matchQuery && matchBarrio && matchCircuito && matchReferente;
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
    if (selectedReferente !== 'todos') params.set('referente', selectedReferente);
    window.open(`/api/exportar-excel?${params.toString()}`, '_blank');
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor habilita las ventanas emergentes en tu navegador para generar el PDF.');
      return;
    }

    const fechaHoy = new Date().toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const refObj = (referentes || []).find((r) => r.id === selectedReferente);
    const refNombreFiltro =
      selectedReferente === 'todos'
        ? 'Todos los referentes'
        : refObj
        ? `${refObj.nombre} (${refObj.email})`
        : selectedReferente;

    const rowsHtml = filteredPersonas
      .map(
        (p, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'}; border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 6px 8px; font-weight: bold; font-family: monospace; font-size: 11px;">${p.dni}</td>
        <td style="padding: 6px 8px; font-size: 11px; font-weight: 600;">${p.apellido_nombre}</td>
        <td style="padding: 6px 8px; font-size: 11px;">${p.barrio}</td>
        <td style="padding: 6px 8px; font-size: 11px; text-align: center; font-weight: bold;">${p.circuito}</td>
        <td style="padding: 6px 8px; font-size: 10px; color: #4338ca; font-weight: 600;">${p.referente_nombre || 'Sin referente'}</td>
        <td style="padding: 6px 8px; font-size: 10px; color: #4b5563;">${p.direccion || '-'}</td>
        <td style="padding: 6px 8px; font-size: 10px; font-family: monospace;">${p.telefono || '-'}</td>
      </tr>
    `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Padrón Electoral - San Miguel de Tucumán</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #18181b; margin: 0; padding: 8px; }
            .header { border-bottom: 2px solid #4338ca; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 18px; font-weight: 900; text-transform: uppercase; color: #1e1b4b; letter-spacing: -0.02em; }
            .subtitle { font-size: 11px; color: #6b7280; margin-top: 2px; }
            .badge-box { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 6px; }
            th { background: #1e1b4b; color: #ffffff; text-align: left; padding: 7px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
            .footer { margin-top: 16px; text-align: right; font-size: 10px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 6px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Sistema de Registro Electoral • San Miguel de Tucumán</div>
              <div class="subtitle">Nómina Oficial del Padrón de Votantes</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #4b5563;">
              <div><strong>Fecha de emisión:</strong> ${fechaHoy}</div>
              <div><strong>Total Votantes:</strong> ${filteredPersonas.length} registros</div>
            </div>
          </div>

          <div class="badge-box">
            <div><strong>Barrio:</strong> ${selectedBarrio === 'todos' ? 'Todos los barrios' : selectedBarrio}</div>
            <div><strong>Circuito:</strong> ${selectedCircuito === 'todos' ? 'Todos los circuitos' : `Circuito ${selectedCircuito}`}</div>
            <div><strong>Referente:</strong> ${refNombreFiltro}</div>
            <div><strong>Búsqueda:</strong> ${searchTerm ? `"${searchTerm}"` : 'Sin filtro de texto'}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 11%;">DNI</th>
                <th style="width: 23%;">Apellido y Nombre</th>
                <th style="width: 16%;">Barrio</th>
                <th style="width: 8%; text-align: center;">Circuito</th>
                <th style="width: 16%;">Referente</th>
                <th style="width: 16%;">Dirección</th>
                <th style="width: 10%;">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            Documento emitido para fines de fiscalización y gestión electoral • San Miguel de Tucumán
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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

          {/* Filtro por Referente */}
          {referentes && referentes.length > 0 && (
            <select
              value={selectedReferente}
              onChange={(e) => {
                setSelectedReferente(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-500 max-w-[180px]"
            >
              <option value="todos">Todos los Referentes</option>
              {referentes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} {r.rol === 'admin' ? '(Admin)' : ''}
                </option>
              ))}
            </select>
          )}

          {/* Exportar Excel - Emerald-500 Secundario */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shadow-emerald-600/20 cursor-pointer"
            title="Exportar a archivo Excel .xlsx"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          {/* Exportar PDF - Rose-600 */}
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shadow-rose-600/20 cursor-pointer"
            title="Exportar a PDF / Imprimir Padrón"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
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
                <th className="px-4 py-3">Referente</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginatedPersonas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-400">
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
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[140px]" title={p.referente_nombre || 'Sin referente'}>
                            {p.referente_nombre || 'Sin referente'}
                          </span>
                        </span>
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
