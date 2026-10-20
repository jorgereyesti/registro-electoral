import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const barrio = searchParams.get('barrio') || '';
  const circuito = searchParams.get('circuito') || '';

  let query = (supabase.from('personas') as any)
    .select('id, dni, apellido_nombre, fecha_nacimiento, telefono, direccion, barrio, circuito, lat, lng, created_at')
    .order('apellido_nombre', { ascending: true });

  if (q) {
    query = query.or(`dni.ilike.%${q}%,apellido_nombre.ilike.%${q}%`);
  }
  if (barrio && barrio !== 'todos') {
    query = query.eq('barrio', barrio);
  }
  if (circuito && circuito !== 'todos') {
    query = query.eq('circuito', circuito);
  }

  const { data: personas, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Crear libro de trabajo con ExcelJS
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Registro Electoral - SMT';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Padrón Electoral', {
    properties: { tabColor: { argb: 'FF2563EB' } },
  });

  // Definición de columnas
  worksheet.columns = [
    { header: 'DNI', key: 'dni', width: 14 },
    { header: 'Apellido y Nombre', key: 'apellido_nombre', width: 32 },
    { header: 'Fecha de Nacimiento', key: 'fecha_nacimiento', width: 18 },
    { header: 'Teléfono', key: 'telefono', width: 18 },
    { header: 'Dirección', key: 'direccion', width: 28 },
    { header: 'Barrio', key: 'barrio', width: 24 },
    { header: 'Circuito Electoral', key: 'circuito', width: 18 },
    { header: 'Latitud', key: 'lat', width: 14 },
    { header: 'Longitud', key: 'lng', width: 14 },
    { header: 'Fecha de Alta', key: 'created_at', width: 20 },
  ];

  // Estilo de la fila de cabecera
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E40AF' }, // Azul intenso
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 28;

  // Llenar datos
  personas?.forEach((p: any) => {
    worksheet.addRow({
      dni: p.dni,
      apellido_nombre: p.apellido_nombre,
      fecha_nacimiento: p.fecha_nacimiento,
      telefono: p.telefono || '-',
      direccion: p.direccion || '-',
      barrio: p.barrio,
      circuito: p.circuito,
      lat: p.lat ?? '-',
      lng: p.lng ?? '-',
      created_at: new Date(p.created_at).toLocaleDateString('es-AR'),
    });
  });

  // Generar buffer binario
  const buffer = await workbook.xlsx.writeBuffer();

  const filename = `padron_electoral_smt_${new Date().toISOString().split('T')[0]}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
