-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Propietario" (
    "idPropietario" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "direccion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "placa" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "idPropietario" TEXT NOT NULL,
    CONSTRAINT "Vehiculo_idPropietario_fkey" FOREIGN KEY ("idPropietario") REFERENCES "Propietario" ("idPropietario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cita" (
    "idCita" TEXT NOT NULL PRIMARY KEY,
    "placaVehiculo" TEXT NOT NULL,
    "tipoVehiculo" TEXT NOT NULL,
    "fechaHora" DATETIME NOT NULL,
    "estado" TEXT NOT NULL,
    CONSTRAINT "Cita_placaVehiculo_fkey" FOREIGN KEY ("placaVehiculo") REFERENCES "Vehiculo" ("placa") ON DELETE RESTRICT ON UPDATE CASCADE
);
