-- =========================================================================
-- MIGRACIÓN DE SEGURIDAD Y REGLAS DE ACCESO (RLS)
-- Sistema de Registro Electoral - San Miguel de Tucumán
-- =========================================================================

-- 1. PROTEGER LA MODIFICACIÓN DEL CAMPO 'rol' EN LA TABLA 'perfiles'
-- Evita la escalada de privilegios donde un referente puede auto-asignarse 'admin'.

CREATE OR REPLACE FUNCTION public.check_perfil_rol_protection()
RETURNS TRIGGER AS $$
DECLARE
  v_current_user_role text;
BEGIN
  -- Si el rol no está cambiando, permitir la actualización sin chequeos extra
  IF NEW.rol IS NOT DISTINCT FROM OLD.rol THEN
    RETURN NEW;
  END IF;

  -- Si el rol está cambiando, verificar si quien ejecuta la acción es administrador
  SELECT rol INTO v_current_user_role
  FROM public.perfiles
  WHERE id = auth.uid();

  IF v_current_user_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Permiso denegado: Únicamente los administradores pueden modificar los roles del sistema.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador BEFORE UPDATE sobre perfiles
DROP TRIGGER IF EXISTS tr_protect_perfiles_rol ON public.perfiles;
CREATE TRIGGER tr_protect_perfiles_rol
BEFORE UPDATE ON public.perfiles
FOR EACH ROW
EXECUTE FUNCTION public.check_perfil_rol_protection();


-- 2. ASEGURAR CLAVE FORÁNEA ENTRE 'personas.created_by' Y 'perfiles.id'
-- Permite que Supabase reconozca la relación para joins automáticos en GraphQL y PostgREST.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_personas_perfiles_creator'
      AND table_name = 'personas'
  ) THEN
    ALTER TABLE public.personas
    ADD CONSTRAINT fk_personas_perfiles_creator
    FOREIGN KEY (created_by)
    REFERENCES public.perfiles(id)
    ON DELETE SET NULL;
  END IF;
END $$;


-- 3. POLÍTICAS RLS ROBUSTAS PARA 'perfiles'
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Permitir lectura de perfiles a todos los usuarios autenticados (necesario para asociar nombres de referentes)
DROP POLICY IF EXISTS "Perfiles visibles por usuarios autenticados" ON public.perfiles;
CREATE POLICY "Perfiles visibles por usuarios autenticados"
ON public.perfiles FOR SELECT
TO authenticated
USING (true);

-- Permitir que un usuario actualice su propio perfil (el trigger impedirá que modifique su 'rol' si no es admin)
DROP POLICY IF EXISTS "Usuarios editan su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios editan su propio perfil"
ON public.perfiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Permitir a los administradores actualizar cualquier perfil (para cambiar roles desde el panel)
DROP POLICY IF EXISTS "Admins pueden actualizar cualquier perfil" ON public.perfiles;
CREATE POLICY "Admins pueden actualizar cualquier perfil"
ON public.perfiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
  )
);


-- 4. POLÍTICAS RLS ROBUSTAS PARA 'personas'
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

-- Lectura: Todos los usuarios autenticados pueden consultar el padrón
DROP POLICY IF EXISTS "Lectura de personas para autenticados" ON public.personas;
CREATE POLICY "Lectura de personas para autenticados"
ON public.personas FOR SELECT
TO authenticated
USING (true);

-- Inserción: Todos los usuarios autenticados pueden dar de alta votantes
DROP POLICY IF EXISTS "Insercion de personas para autenticados" ON public.personas;
CREATE POLICY "Insercion de personas para autenticados"
ON public.personas FOR INSERT
TO authenticated
WITH CHECK (true);

-- Modificación: Tanto administradores como referentes pueden actualizar datos
DROP POLICY IF EXISTS "Edicion de personas para autenticados" ON public.personas;
CREATE POLICY "Edicion de personas para autenticados"
ON public.personas FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Eliminación:
-- Administradores pueden borrar cualquier registro.
-- Referentes SOLO pueden borrar registros creados por su propio usuario (created_by = auth.uid()).
DROP POLICY IF EXISTS "Eliminacion segun rol y creador" ON public.personas;
CREATE POLICY "Eliminacion segun rol y creador"
ON public.personas FOR DELETE
TO authenticated
USING (
  -- Es admin
  EXISTS (
    SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
  )
  OR
  -- O fue creado por el usuario en sesión
  (created_by = auth.uid())
);

