import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Validar autenticación
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Validar que el usuario sea Administrador
    const { data: perfil } = await (supabase.from('perfiles') as any)
      .select('rol')
      .eq('id', currentUser.id)
      .single();

    if (perfil?.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado: Se requiere rol de Administrador para crear usuarios.' },
        { status: 403 }
      );
    }

    // 3. Obtener y validar datos del cuerpo
    const body = await request.json();
    const { email, password, nombreCompleto, rol } = body;

    if (!email || !password || !nombreCompleto) {
      return NextResponse.json(
        { error: 'El correo electrónico, contraseña y nombre completo son obligatorios.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe contener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const rolAsignado = rol === 'admin' ? 'admin' : 'referente';

    // 4. Crear usuario sin desloguear al Administrador
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceRoleKey) {
      // Usar Supabase Admin API con Service Role Key (Confirmación directa)
      const adminClient = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const { data: newUserData, error: createError } = await adminClient.auth.admin.createUser({
        email: email.trim(),
        password: password,
        email_confirm: true,
        user_metadata: {
          nombre_completo: nombreCompleto.trim(),
          rol: rolAsignado,
        },
      });

      if (createError) throw createError;

      // Asegurar perfil
      if (newUserData.user) {
        await (adminClient.from('perfiles') as any).upsert({
          id: newUserData.user.id,
          email: email.trim(),
          nombre_completo: nombreCompleto.trim(),
          rol: rolAsignado,
        });
      }

      return NextResponse.json({
        success: true,
        user: newUserData.user,
        message: 'Usuario creado y confirmado exitosamente.',
      });
    } else {
      // Fallback seguro usando cliente aislado en servidor (sin persistencia de cookies)
      const isolatedClient = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const { data: signUpData, error: signUpError } = await isolatedClient.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            nombre_completo: nombreCompleto.trim(),
            rol: rolAsignado,
          },
        },
      });

      if (signUpError) throw signUpError;

      return NextResponse.json({
        success: true,
        user: signUpData.user,
        message: 'Usuario registrado exitosamente sin desconectar tu sesión.',
      });
    }
  } catch (error: any) {
    console.error('Error en /api/usuarios (POST):', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar el alta del usuario.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Validar autenticación
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Validar que sea Administrador
    const { data: perfil } = await (supabase.from('perfiles') as any)
      .select('rol')
      .eq('id', currentUser.id)
      .single();

    if (perfil?.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado: Solo administradores pueden eliminar usuarios.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario no proporcionado.' }, { status: 400 });
    }

    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta de Administrador.' },
        { status: 400 }
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceRoleKey) {
      const adminClient = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const { error: delAuthError } = await adminClient.auth.admin.deleteUser(userId);
      if (delAuthError) console.error('Aviso al eliminar de auth:', delAuthError);
    }

    // Eliminar perfil
    const { error: delPerfilError } = await (supabase.from('perfiles') as any)
      .delete()
      .eq('id', userId);

    if (delPerfilError) throw delPerfilError;

    return NextResponse.json({ success: true, message: 'Usuario revocado y eliminado con éxito.' });
  } catch (error: any) {
    console.error('Error en /api/usuarios (DELETE):', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el usuario.' },
      { status: 500 }
    );
  }
}

