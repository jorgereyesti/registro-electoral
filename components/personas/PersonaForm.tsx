'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BARRIOS_LIST, CIRCUITOS_LIST } from '@/lib/geo/data';
import { isMayorDe16 } from '@/lib/types/personas';
import { DynamicLocationPickerMap } from '@/components/map/DynamicMap';
import { createClient } from '@/lib/supabase/client';
import { User, AlertCircle, CheckCircle2, Save, ArrowLeft, Loader2, Calendar, Phone, Home, Lock, MapPin } from 'lucide-react';
import Link from 'next/link';

interface PersonaFormProps {
  initialData?: {
    id?: string;
    dni: string;
    apellido_nombre: string;
    fecha_nacimiento: string;
    telefono?: string | null;
    direccion?: string | null;
    barrio: string;
    circuito: string;
    lat?: number | null;
    lng?: number | null;
  };
  isEditing?: boolean;
}

export default function PersonaForm({ initialData, isEditing = false }: PersonaFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    dni: initialData?.dni || '',
    apellido_nombre: initialData?.apellido_nombre || '',
    fecha_nacimiento: initialData?.fecha_nacimiento || '',
    telefono: initialData?.telefono || '',
    direccion: initialData?.direccion || '',
    barrio: initialData?.barrio || BARRIOS_LIST[0]?.nombre || '',
    circuito: initialData?.circuito || CIRCUITOS_LIST[0]?.numero || '1',
    lat: initialData?.lat ?? null,
    lng: initialData?.lng ?? null,
  });

  const [isBarrioLocked, setIsBarrioLocked] = useState(!!initialData?.barrio);
  const [isCircuitoLocked, setIsCircuitoLocked] = useState(!!initialData?.circuito);
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  const [dniCheckLoading, setDniCheckLoading] = useState(false);
  const [dniDuplicateWarning, setDniDuplicateWarning] = useState<{
    duplicado: boolean;
    creadoPor?: string;
    creadoEl?: string;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificación en tiempo real de unicidad de DNI
  const handleDniBlur = async () => {
    const cleanDni = formData.dni.trim();
    if (!cleanDni || isEditing) return;

    if (!/^[0-9]{6,10}$/.test(cleanDni)) {
      setDniDuplicateWarning(null);
      return;
    }

    setDniCheckLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc('verificar_dni_disponible', {
        p_dni: cleanDni,
      });

      if (!error && data && data.length > 0 && data[0].existe) {
        setDniDuplicateWarning({
          duplicado: true,
          creadoPor: data[0].creado_por_nombre,
          creadoEl: data[0].creado_el,
        });
      } else {
        setDniDuplicateWarning(null);
      }
    } catch (err) {
      console.error('Error verificando DNI:', err);
    } finally {
      setDniCheckLoading(false);
    }
  };

  // Cuando se selecciona un barrio, auto-sugerir su circuito electoral asociado
  const handleBarrioChange = (barrioNombre: string) => {
    const found = BARRIOS_LIST.find((b) => b.nombre.toLowerCase() === barrioNombre.toLowerCase());
    setFormData((prev) => ({
      ...prev,
      barrio: barrioNombre,
      circuito: found?.circuitoElectoral ? found.circuitoElectoral : prev.circuito,
    }));
  };

  // Callback memoizado para sincronizar geolocalización desde el mapa
  const handleLocationChange = useCallback(
    ({
      lat,
      lng,
      barrio,
      circuito,
      direccionSugerida,
      isLoadingDireccion,
    }: {
      lat: number;
      lng: number;
      barrio?: string;
      circuito?: string;
      direccionSugerida?: string;
      isLoadingDireccion?: boolean;
    }) => {
      setIsAddressLoading(!!isLoadingDireccion);

      setFormData((prev) => ({
        ...prev,
        lat,
        lng,
        barrio: barrio || prev.barrio,
        circuito: circuito || prev.circuito,
        direccion: direccionSugerida ? direccionSugerida : prev.direccion,
      }));

      if (barrio) setIsBarrioLocked(true);
      if (circuito) setIsCircuitoLocked(true);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Validaciones de formulario
    if (!formData.apellido_nombre.trim()) {
      setErrorMsg('El Apellido y Nombre es obligatorio.');
      return;
    }

    if (!/^[0-9]{6,10}$/.test(formData.dni.trim())) {
      setErrorMsg('El DNI debe contener solo números (entre 6 y 10 dígitos).');
      return;
    }

    if (!formData.fecha_nacimiento) {
      setErrorMsg('La Fecha de Nacimiento es obligatoria.');
      return;
    }

    if (!isMayorDe16(formData.fecha_nacimiento)) {
      setErrorMsg('La persona debe tener al menos 16 años para ser empadronada.');
      return;
    }

    if (!formData.barrio) {
      setErrorMsg('Debe seleccionar o geolocalizar un barrio.');
      return;
    }

    if (!formData.circuito) {
      setErrorMsg('Debe especificar un circuito electoral.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && initialData?.id) {
        // Modificación de votante existente
        const { error } = await (supabase.from('personas') as any)
          .update({
            dni: formData.dni.trim(),
            apellido_nombre: formData.apellido_nombre.trim(),
            fecha_nacimiento: formData.fecha_nacimiento,
            telefono: formData.telefono.trim() || null,
            direccion: formData.direccion.trim() || null,
            barrio: formData.barrio,
            circuito: formData.circuito,
            lat: formData.lat,
            lng: formData.lng,
          })
          .eq('id', initialData.id);

        if (error) {
          if (error.code === '23505') {
            throw new Error('El DNI ya se encuentra registrado por otro votante.');
          }
          throw error;
        }

        setSuccessMsg('¡Datos del votante actualizados exitosamente!');
        setTimeout(() => router.push(`/personas/${initialData.id}`), 1200);
      } else {
        // Creación de nuevo votante
        const { error } = await (supabase.from('personas') as any).insert({
          dni: formData.dni.trim(),
          apellido_nombre: formData.apellido_nombre.trim(),
          fecha_nacimiento: formData.fecha_nacimiento,
          telefono: formData.telefono.trim() || null,
          direccion: formData.direccion.trim() || null,
          barrio: formData.barrio,
          circuito: formData.circuito,
          lat: formData.lat,
          lng: formData.lng,
        });

        if (error) {
          if (error.code === '23505') {
            throw new Error('El DNI ya se encuentra registrado en el padrón.');
          }
          throw error;
        }

        setSuccessMsg('¡Registro guardado exitosamente en el sistema!');
        setTimeout(() => router.push('/personas'), 1200);
      }
    } catch (err: any) {
      console.error('Error al guardar persona:', err);
      setErrorMsg(err.message || 'Ocurrió un error al procesar el registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Alerta de Error */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3 text-rose-700 dark:text-rose-300 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div className="text-sm font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Alerta de Éxito Secundario (Emerald-500) */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3 text-emerald-800 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
          <div className="text-sm font-semibold">{successMsg}</div>
        </div>
      )}

      {/* Alerta de DNI duplicado con trazabilidad */}
      {dniDuplicateWarning?.duplicado && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-start gap-3 text-amber-800 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div className="text-sm">
            <p className="font-bold">⚠️ DNI ya registrado en el sistema</p>
            <p className="mt-1">
              Este DNI fue cargado previamente por: <strong>{dniDuplicateWarning.creadoPor}</strong>
              {dniDuplicateWarning.creadoEl && (
                <span> el {new Date(dniDuplicateWarning.creadoEl).toLocaleDateString('es-AR')}</span>
              )}.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
        {/* Columna Izquierda: Datos Personales */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Datos del Votante
          </h3>

          {/* DNI */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              DNI (Único en el sistema) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={10}
                placeholder="Ej: 38123456"
                value={formData.dni}
                onChange={(e) => {
                  setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') });
                  if (dniDuplicateWarning) setDniDuplicateWarning(null);
                }}
                onBlur={handleDniBlur}
                className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              {dniCheckLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-zinc-400" />
              )}
            </div>
            <span className="text-[11px] text-zinc-400">Ingresar sólo números sin puntos.</span>
          </div>

          {/* Apellido y Nombre */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Apellido y Nombre *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Pérez, Juan Manuel"
              value={formData.apellido_nombre}
              onChange={(e) => setFormData({ ...formData, apellido_nombre: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Fecha de Nacimiento *
              </label>
              {formData.fecha_nacimiento && isMayorDe16(formData.fecha_nacimiento) ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Mayor de 16 años
                </span>
              ) : (
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Mínimo 16 años</span>
              )}
            </div>
            <div className="relative">
              <input
                type="date"
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                value={formData.fecha_nacimiento}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {formData.fecha_nacimiento && !isMayorDe16(formData.fecha_nacimiento) && (
              <span className="text-[11px] text-rose-500 font-medium">
                ⚠️ Debe tener al menos 16 años al momento del alta electoral.
              </span>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Teléfono de Contacto
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="tel"
                placeholder="Ej: 3814123456"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Barrio y Circuito */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Barrio (SMT) *
                </label>
                {isBarrioLocked && (
                  <div className="flex items-center gap-1 text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Fijado por mapa</span>
                    <button
                      type="button"
                      onClick={() => setIsBarrioLocked(false)}
                      className="ml-1 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-300 underline cursor-pointer"
                      title="Permitir cambio manual"
                    >
                      (cambiar)
                    </button>
                  </div>
                )}
              </div>
              <select
                value={formData.barrio}
                disabled={isBarrioLocked}
                onChange={(e) => handleBarrioChange(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors ${
                  isBarrioLocked
                    ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-not-allowed opacity-90'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500'
                }`}
              >
                {BARRIOS_LIST.map((b) => (
                  <option key={b.nombre} value={b.nombre}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Circuito Electoral *
                </label>
                {isCircuitoLocked && (
                  <div className="flex items-center gap-1 text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Fijado por mapa</span>
                    <button
                      type="button"
                      onClick={() => setIsCircuitoLocked(false)}
                      className="ml-1 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-300 underline cursor-pointer"
                      title="Permitir cambio manual"
                    >
                      (cambiar)
                    </button>
                  </div>
                )}
              </div>
              <select
                value={formData.circuito}
                disabled={isCircuitoLocked}
                onChange={(e) => setFormData({ ...formData, circuito: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors ${
                  isCircuitoLocked
                    ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-not-allowed opacity-90'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500'
                }`}
              >
                {CIRCUITOS_LIST.map((c) => (
                  <option key={c.numero} value={c.numero}>
                    Circuito {c.numero}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Dirección (Calle y Número)
              </label>
              {isAddressLoading && (
                <span className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Detectando en OpenStreetMap...
                </span>
              )}
            </div>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Ej: San Martín 450"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <span className="text-[11px] text-zinc-400">
              Se autocompleta automáticamente según la posición en el mapa. Puedes ajustar detalles (piso, dpto).
            </span>
          </div>
        </div>

        {/* Columna Derecha: Geolocalización en Mapa */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Geolocalización Cartográfica
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-3">
              Mueve el marcador o haz clic en cualquier calle para autodetectar barrio, circuito y dirección oficial.
            </p>

            <DynamicLocationPickerMap
              initialLat={initialData?.lat ?? null}
              initialLng={initialData?.lng ?? null}
              onChange={handleLocationChange}
            />
          </div>

          {/* Acciones de Formulario */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/personas"
              className="px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || (dniDuplicateWarning?.duplicado && !isEditing)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Actualizar Registro' : 'Registrar Votante'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
