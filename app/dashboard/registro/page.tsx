'use client';

import React, { useState, useEffect } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Propietario, Vehiculo, TipoVehiculo } from '@/types';

/**
 * Pantalla de Registro RTM (/dashboard/registro).
 * Implementa los dos formularios para Propietarios y Vehículos.
 * Garantiza integridad relacional bloqueando el registro de un vehículo
 * si la cédula del propietario no existe en la BD.
 */
export default function RegistroPage() {
  const [activeTab, setActiveTab] = useState<'propietario' | 'vehiculo'>('propietario');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Listas de datos para mostrar dinamismo y facilitar pruebas al usuario
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  // Estados de Formulario de Propietario
  const [propId, setPropId] = useState('');
  const [propNombre, setPropNombre] = useState('');
  const [propTelefono, setPropTelefono] = useState('');
  const [propCorreo, setPropCorreo] = useState('');
  const [propDireccion, setPropDireccion] = useState('');

  // Estados de Formulario de Vehículo
  const [vehPlaca, setVehPlaca] = useState('');
  const [vehTipo, setVehTipo] = useState<'Carro' | 'Moto'>('Carro');
  const [vehMarca, setVehMarca] = useState('');
  const [vehModelo, setVehModelo] = useState('');
  const [vehColor, setVehColor] = useState('');
  const [vehPropId, setVehPropId] = useState('');

  const cargarDatos = async () => {
    try {
      const resProp = await fetch('/api/propietarios');
      const dataProp = await resProp.json();
      if (dataProp.success) setPropietarios(dataProp.propietarios || []);

      const resVeh = await fetch('/api/vehiculos');
      const dataVeh = await resVeh.json();
      if (dataVeh.success) setVehiculos(dataVeh.vehiculos || []);
    } catch (err) {
      console.error('Error al cargar datos en registro:', err);
    }
  };

  // Carga inicial de datos
  useEffect(() => {
    setTimeout(() => {
      cargarDatos();
    }, 0);
  }, []);

  const handleRegisterPropietario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/propietarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPropietario: propId,
          nombre: propNombre,
          telefono: propTelefono,
          correo: propCorreo,
          direccion: propDireccion,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Propietario "${propNombre}" registrado exitosamente.`);
        // Limpiar campos
        setPropId('');
        setPropNombre('');
        setPropTelefono('');
        setPropCorreo('');
        setPropDireccion('');
        
        // Recargar listas
        cargarDatos();
      } else {
        setErrorMessage(data.error || 'Error al registrar propietario.');
      }
    } catch (err) {
      console.error('Error al registrar propietario:', err);
      setErrorMessage('Ocurrió un error al enviar la solicitud al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placa: vehPlaca,
          tipo: vehTipo,
          marca: vehMarca,
          modelo: vehModelo,
          color: vehColor,
          idPropietario: vehPropId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Vehículo con placas ${vehPlaca.toUpperCase()} registrado exitosamente.`);
        // Limpiar campos
        setVehPlaca('');
        setVehMarca('');
        setVehModelo('');
        setVehColor('');
        setVehPropId('');

        // Recargar listas
        cargarDatos();
      } else {
        setErrorMessage(data.error || 'Error al registrar vehículo.');
      }
    } catch (err) {
      console.error('Error al registrar vehículo:', err);
      setErrorMessage('Ocurrió un error al enviar la solicitud al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const activeTabHeader = (
    <h3 className="text-lg font-bold text-white flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-blue-400 text-xs font-bold">
        {activeTab === 'propietario' ? '1' : '2'}
      </span>
      {activeTab === 'propietario'
        ? 'Datos Básicos del Propietario (Cédula)'
        : 'Especificaciones del Vehículo y Relación'}
    </h3>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Registro de Ingreso RTM</h2>
        <p className="text-sm text-slate-400 mt-1">
          Módulo para matricular propietarios y vehículos en el sistema del CDA. Todos los campos son obligatorios.
        </p>
      </div>

      {/* Alertas */}
      {errorMessage && (
        <Alert variant="error" title="Error al procesar solicitud">
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" title="Operación Exitosa">
          {successMessage}
        </Alert>
      )}

      {/* Tabs Selector de Formularios */}
      <div className="border-b border-slate-900 flex gap-4">
        <button
          onClick={() => {
            setActiveTab('propietario');
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 px-1 cursor-pointer ${
            activeTab === 'propietario'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          1. Registrar Propietario (Cédula)
        </button>
        <button
          onClick={() => {
            setActiveTab('vehiculo');
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 px-1 cursor-pointer ${
            activeTab === 'vehiculo'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          2. Registrar Vehículo (Placa)
        </button>
      </div>

      {/* Secciones y Formularios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario Activo */}
        <div className="lg:col-span-2">
          <Card title={activeTabHeader}>
            {activeTab === 'propietario' ? (
              /* ================= FORMULARIO PROPIETARIO ================= */
              <form onSubmit={handleRegisterPropietario} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="propId"
                    label="Número de Cédula (ID Único)"
                    required
                    value={propId}
                    onChange={(e) => setPropId(e.target.value)}
                    placeholder="ej: 10203040"
                  />

                  <Input
                    id="propNombre"
                    label="Nombre Completo"
                    required
                    value={propNombre}
                    onChange={(e) => setPropNombre(e.target.value)}
                    placeholder="ej: Juan Carlos Restrepo"
                  />

                  <Input
                    id="propTelefono"
                    label="Teléfono Celular"
                    required
                    value={propTelefono}
                    onChange={(e) => setPropTelefono(e.target.value)}
                    placeholder="ej: 3114567890"
                  />

                  <Input
                    id="propCorreo"
                    label="Correo Electrónico"
                    type="email"
                    required
                    value={propCorreo}
                    onChange={(e) => setPropCorreo(e.target.value)}
                    placeholder="ej: juan.restrepo@example.com"
                  />

                  <Input
                    id="propDireccion"
                    label="Dirección Residencial"
                    required
                    value={propDireccion}
                    onChange={(e) => setPropDireccion(e.target.value)}
                    placeholder="ej: Calle 10 # 43C - 20, Medellín"
                    className="md:col-span-2"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" loading={loading}>
                    Registrar Propietario
                  </Button>
                </div>
              </form>
            ) : (
              /* ================= FORMULARIO VEHÍCULO ================= */
              <form onSubmit={handleRegisterVehiculo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="vehPlaca"
                    label="Matrícula / Placa (ID Único)"
                    required
                    value={vehPlaca}
                    onChange={(e) => setVehPlaca(e.target.value)}
                    placeholder="ej: EDF456 o XMA15G"
                  />

                  <Input
                    id="vehTipo"
                    label="Tipo de Vehículo"
                    required
                    value={vehTipo}
                    onChange={(e) => setVehTipo(e.target.value as TipoVehiculo)}
                    options={[
                      { value: 'Carro', label: 'Carro' },
                      { value: 'Moto', label: 'Moto' },
                    ]}
                  />

                  <Input
                    id="vehMarca"
                    label="Marca del Vehículo"
                    required
                    value={vehMarca}
                    onChange={(e) => setVehMarca(e.target.value)}
                    placeholder="ej: Mazda / Yamaha"
                  />

                  <Input
                    id="vehModelo"
                    label="Modelo (Año)"
                    required
                    value={vehModelo}
                    onChange={(e) => setVehModelo(e.target.value)}
                    placeholder="ej: 2021"
                  />

                  <Input
                    id="vehColor"
                    label="Color del Vehículo"
                    required
                    value={vehColor}
                    onChange={(e) => setVehColor(e.target.value)}
                    placeholder="ej: Rojo / Azul / Gris Metálico"
                  />

                  <Input
                    id="vehPropId"
                    label="Cédula del Propietario (FK Obligatorio)"
                    required
                    value={vehPropId}
                    onChange={(e) => setVehPropId(e.target.value)}
                    placeholder="ej: 10203040"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="emerald" loading={loading}>
                    Registrar Vehículo
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* Panel de Consultas Rápidas */}
        <div className="space-y-6">
          
          {/* Tarjeta de Propietarios Registrados */}
          <Card title={`Propietarios en el Sistema (${propietarios.length})`} glass={false} className="p-5!">
            <div className="divide-y divide-slate-900 max-h-52 overflow-y-auto pr-1">
              {propietarios.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No hay propietarios registrados.</p>
              ) : (
                propietarios.map((p) => (
                  <div key={p.idPropietario} className="py-2.5 flex flex-col">
                    <span className="text-xs font-semibold text-white">{p.nombre}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">C.C. {p.idPropietario} — Tel: {p.telefono}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Tarjeta de Vehículos Registrados */}
          <Card title={`Vehículos Registrados (${vehiculos.length})`} glass={false} className="p-5!">
            <div className="divide-y divide-slate-900 max-h-52 overflow-y-auto pr-1">
              {vehiculos.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No hay vehículos registrados.</p>
              ) : (
                vehiculos.map((v) => (
                  <div key={v.placa} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white uppercase">{v.placa}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{v.marca} {v.modelo} ({v.color})</span>
                    </div>
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${
                      v.tipo === 'Carro' 
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      {v.tipo}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
