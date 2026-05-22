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
  console.log('Limpiando tablas de base de datos...');
  await prisma.cita.deleteMany({});
  await prisma.vehiculo.deleteMany({});
  await prisma.propietario.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Creación de Usuario Administrador del Sistema
  console.log('Creando usuario administrador...');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      id: 'admin',
      password: adminPasswordHash,
      intentos: 0,
      bloqueado: false,
    },
  });
  console.log(`Usuario administrador creado: ${adminUser.id}`);

  // 3. Creación de 3 Propietarios (Cumpliendo regla de exactamente 5 atributos principales)
  console.log('Creando propietarios...');
  const propietario1 = await prisma.propietario.create({
    data: {
      idPropietario: '10203040',
      nombre: 'Juan Carlos Restrepo',
      telefono: '3114567890',
      correo: 'juan.restrepo@example.com',
      direccion: 'Calle 10 # 43C - 20, Medellín',
    },
  });

  const propietario2 = await prisma.propietario.create({
    data: {
      idPropietario: '20304050',
      nombre: 'María Camila Gómez',
      telefono: '3157890123',
      correo: 'maria.gomez@example.com',
      direccion: 'Carrera 45 # 50 - 12, Envigado',
    },
  });

  const propietario3 = await prisma.propietario.create({
    data: {
      idPropietario: '30405060',
      nombre: 'Andrés Felipe Zapata',
      telefono: '3005556677',
      correo: 'andres.zapata@example.com',
      direccion: 'Avenida El Poblado # 25 - 60, Medellín',
    },
  });
  console.log('3 Propietarios creados.');

  // 4. Creación de 3 Vehículos (Exactamente 5 atributos principales + FK de relación)
  console.log('Creando vehículos...');
  
  // Vehículo 1: Al día (Propietario 1)
  await prisma.vehiculo.create({
    data: {
      placa: 'EDF456',
      tipo: 'Carro',
      marca: 'Mazda',
      modelo: '2021',
      color: 'Gris Metálico',
      idPropietario: propietario1.idPropietario,
    },
  });

  // Vehículo 2: En mora (Propietario 2) - Placa 'XMA15G'
  await prisma.vehiculo.create({
    data: {
      placa: 'XMA15G',
      tipo: 'Moto',
      marca: 'Yamaha',
      modelo: '2023',
      color: 'Azul',
      idPropietario: propietario2.idPropietario,
    },
  });

  // Vehículo 3: En mora (Propietario 3) - Placa 'AAA123'
  await prisma.vehiculo.create({
    data: {
      placa: 'AAA123',
      tipo: 'Carro',
      marca: 'Chevrolet',
      modelo: '2018',
      color: 'Rojo',
      idPropietario: propietario3.idPropietario,
    },
  });
  console.log('3 Vehículos creados (incluye placas morosas XMA15G y AAA123).');

  console.log('Proceso de siembra de datos completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante la siembra de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
