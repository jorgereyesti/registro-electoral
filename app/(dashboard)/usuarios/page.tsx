import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import UsuariosManager from '@/components/usuarios/UsuariosManager';

export default async function UsuariosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Verificar si es administrador
  const { data: perfil } = await (supabase.from('perfiles') as any)
    .select('rol')
    .eq('id', user.id)
    .single();

  if (perfil?.rol !== 'admin') {
    // Si no es admin, redirigir al padrón
    redirect('/personas');
  }

  // Cargar lista de usuarios
  const { data: usuarios } = await (supabase.from('perfiles') as any)
    .select('*')
    .order('created_at', { ascending: false });

  return <UsuariosManager initialUsuarios={usuarios || []} currentUserId={user.id} />;
}
