import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando proceso de siembra de datos (seed)...');

  // 1. Limpieza de datos existentes en orden inverso de dependencias relacionales
  console.log('Limpiando tablas...');
  await prisma.cita.deleteMany({});
  await prisma.vehiculo.deleteMany({});
  await prisma.propietario.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Creación de Usuarios del Sistema
  console.log('Creando usuarios...');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      id: 'admin',
      password: adminPasswordHash,
      nombres: 'Administrador CDA',
      rol: 'ADMIN',
      intentos: 0,
      bloqueado: false,
    },
  });

  const tecnicoPasswordHash = await bcrypt.hash('tecnico123', 10);
  await prisma.user.create({
    data: {
      id: 'tecnico1',
      password: tecnicoPasswordHash,
      nombres: 'Carlos Pedraza',
      rol: 'TECNICO',
      intentos: 0,
      bloqueado: false,
    },
  });
  console.log('Usuarios creados: admin / tecnico1');

  // 3. Creación de Propietarios
  console.log('Creando propietarios...');
  const p1 = await prisma.propietario.create({
    data: {
      id: '10203040',
      tipoDocumento: 'CC',
      nombres: 'Juan Carlos',
      apellidos: 'Restrepo Giraldo',
      telefono: '3114567890',
      email: 'juan.restrepo@example.com',
      direccion: 'Calle 10 # 43C - 20, Medellín',
    },
  });

  const p2 = await prisma.propietario.create({
    data: {
      id: '20304050',
      tipoDocumento: 'CC',
      nombres: 'María Camila',
      apellidos: 'Gómez Cardona',
      telefono: '3157890123',
      email: 'maria.gomez@example.com',
      direccion: 'Carrera 45 # 50 - 12, Envigado',
    },
  });

  const p3 = await prisma.propietario.create({
    data: {
      id: '30405060',
      tipoDocumento: 'CC',
      nombres: 'Andrés Felipe',
      apellidos: 'Zapata Londoño',
      telefono: '3005556677',
      email: 'andres.zapata@example.com',
      direccion: 'Avenida El Poblado # 25 - 60, Medellín',
    },
  });
  console.log('3 Propietarios creados.');

  // 4. Creación de Vehículos
  console.log('Creando vehículos...');
  await prisma.vehiculo.create({
    data: {
      placa: 'EDF456',
      tipoVehiculo: 'Carro',
      marca: 'Mazda',
      linea: '3 Sedán',
      modelo: 2021,
      color: 'Gris Metálico',
      propietarioId: p1.id,
    },
  });

  await prisma.vehiculo.create({
    data: {
      placa: 'XMA15G',
      tipoVehiculo: 'Moto',
      marca: 'Yamaha',
      linea: 'FZ 250',
      modelo: 2023,
      color: 'Azul',
      propietarioId: p2.id,
    },
  });

  await prisma.vehiculo.create({
    data: {
      placa: 'AAA123',
      tipoVehiculo: 'Carro',
      marca: 'Chevrolet',
      linea: 'Spark GT',
      modelo: 2018,
      color: 'Rojo',
      propietarioId: p3.id,
    },
  });
  console.log('3 Vehículos creados.');

  console.log('\n✅ Seed completado exitosamente.');
  console.log('   Usuarios: admin (pass: admin123) / tecnico1 (pass: tecnico123)');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la siembra de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
