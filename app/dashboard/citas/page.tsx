'use client';

import React, { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface Cita {
  idCita: string;
  placaVehiculo: string;
  tipoVehiculo: string;
  fechaHora: string;
  estado: 'Asignada' | 'Rechazada por Deuda';
}

export default function CitasPage() {
  const [loading, setLoading] = useState(false);
  const [placa, setPlaca] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState<'Carro' | 'Moto'>('Carro');
  const [fechaHora, setFechaHora] = useState('');
  
  // Mensajes de feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [debtAlert, setDebtAlert] = useState<{ active: boolean; placa: string } | null>(null);

  // Lista de citas agendadas en la sesión actual
  const [sessionCitas, setSessionCitas] = useState<Cita[]>([]);
  
  // Búsqueda rápida por placa en la pantalla
  const [searchPlaca, setSearchPlaca] = useState('');
  const [searchResult, setSearchResult] = useState<Cita[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleScheduleCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    setDebtAlert(null);

    try {
      const response = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placaVehiculo: placa,
          tipoVehiculo,
          fechaHora,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        // Asignada
        setSuccessMsg(`Cita asignada con éxito para el vehículo con placa ${placa.toUpperCase()}.`);
        const newCita: Cita = {
          idCita: data.cita.idCita,
          placaVehiculo: data.cita.placaVehiculo,
          tipoVehiculo: data.cita.tipoVehiculo,
          fechaHora: data.cita.fechaHora,
          estado: 'Asignada',
        };
        setSessionCitas((prev) => [newCita, ...prev]);
        
        // Limpiar formulario
        setPlaca('');
        setFechaHora('');
      } else if (response.status === 403) {
        // Rechazada por deuda
        setDebtAlert({ active: true, placa: placa.toUpperCase() });
        const newCita: Cita = {
          idCita: data.cita.idCita,
          placaVehiculo: data.cita.placaVehiculo,
          tipoVehiculo: data.cita.tipoVehiculo,
          fechaHora: data.cita.fechaHora,
          estado: 'Rechazada por Deuda',
        };
        setSessionCitas((prev) => [newCita, ...prev]);
        setPlaca('');
        setFechaHora('');
      } else {
        // 400 u otros errores
        setErrorMsg(data.error || 'No fue posible registrar la cita.');
      }
    } catch (err) {
      console.error('Error al agendar cita:', err);
      setErrorMsg('Ocurrió un error de red o servidor al procesar el agendamiento.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCitas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPlaca.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const res = await fetch(`/api/citas?placa=${searchPlaca.trim()}`);
      const data = await res.json();

      if (data.success) {
        setSearchResult(data.citas || []);
        if (data.citas.length === 0) {
          setSearchError(`No se encontraron registros de citas para el vehículo ${searchPlaca.toUpperCase()}.`);
        }
      } else {
        setSearchError(data.error || 'Error al buscar el historial del vehículo.');
      }
    } catch (err) {
      console.error('Error al buscar citas:', err);
      setSearchError('Error de red al consultar el historial.');
    } finally {
      setSearchLoading(false);
    }
  };

  const formatFecha = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  const formTitle = (
    <h3 className="text-lg font-bold text-white flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-blue-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.625 21h12.75A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.625 9h12.75A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
      Nueva Solicitud de Revisión Técnico Mecánica
    </h3>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Solicitud y Agendamiento de Citas RTM</h2>
        <p className="text-sm text-slate-400 mt-1">
          Módulo para agendar citas de revisión técnico mecánica. El motor de validación cruzará de forma inmediata la placa contra la base de deudas de la Gobernación y Secretaría de Movilidad.
        </p>
      </div>

      {/* ================= ALERTA DE DEUDA CRÍTICA (UX WRITING EMPÁTICO) ================= */}
      {debtAlert && (
        <Alert
          variant="critical"
          title="⚠️ Solicitud de Cita Rechazada por Deudas de Tránsito (Ley 769 de 2002)"
        >
          <div className="space-y-2">
            <p className="text-sm text-slate-300 leading-relaxed">
              El vehículo con placa <strong className="text-red-400 uppercase tracking-wide">{debtAlert.placa}</strong> presenta deudas de tránsito vigentes pendientes de pago con la Gobernación de Antioquia y la Secretaría de Movilidad.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              De acuerdo con las disposiciones vigentes del Código Nacional de Tránsito Terrestre (Ley 769 de 2002), los Centros de Diagnóstico Automotor (CDA) tienen estrictamente prohibido agendar o aprobar trámites de RTM para vehículos que posean multas de tránsito activas sin un acuerdo de pago vigente.
            </p>
            <div className="bg-slate-950/40 p-3 rounded-lg border border-red-500/10 mt-3 text-xs text-slate-400 space-y-1.5">
              <span className="block font-semibold text-slate-300">Pasos recomendados para el usuario:</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>Consulte el estado detallado en la plataforma oficial del SIMIT o Gobernación de Antioquia.</li>
                <li>Realice el pago de los comparendos u obligaciones vigentes.</li>
                <li>Una vez el pago se encuentre asentado en el sistema (toma usualmente entre 1 y 24 horas), intente nuevamente solicitar su cita en esta plataforma.</li>
              </ul>
            </div>
          </div>
        </Alert>
      )}

      {/* Otras Alertas */}
      {errorMsg && (
        <Alert variant="error" title="Error al agendar cita">
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert variant="success" title="Cita Asignada Exitosamente">
          {successMsg}
        </Alert>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Agendamiento */}
        <div className="lg:col-span-2">
          <Card title={formTitle}>
            <form onSubmit={handleScheduleCita} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <Input
                  id="placa"
                  label="Placa del Vehículo"
                  required
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  placeholder="ej: EDF456 o XMA15G"
                  helperText="Tip: Use 'XMA15G' o 'AAA123' para comprobar la alerta de rechazo por deudas."
                  className="uppercase"
                />

                <Input
                  id="tipoVehiculo"
                  label="Tipo de Vehículo"
                  required
                  value={tipoVehiculo}
                  onChange={(e) => setTipoVehiculo(e.target.value as 'Carro' | 'Moto')}
                  options={[
                    { value: 'Carro', label: 'Carro' },
                    { value: 'Moto', label: 'Moto' },
                  ]}
                />

                <Input
                  id="fechaHora"
                  label="Fecha y Hora Sugerida"
                  type="datetime-local"
                  required
                  value={fechaHora}
                  onChange={(e) => setFechaHora(e.target.value)}
                  className="md:col-span-2"
                />

              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" loading={loading}>
                  Agendar Cita RTM
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Panel Lateral: Buscador Historial y Citas de la Sesión */}
        <div className="space-y-6">
          
          {/* Consulta Rápida de Historial por Placa */}
          <Card title="Buscar Citas del Vehículo" glass={false} className="p-5!">
            <form onSubmit={handleSearchCitas} className="flex gap-2 mb-4">
              <input
                type="text"
                required
                value={searchPlaca}
                onChange={(e) => setSearchPlaca(e.target.value)}
                placeholder="Placa (ej: EDF456)"
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 uppercase"
              />
              <Button type="submit" variant="secondary" loading={searchLoading} className="py-1 px-3 text-xs lowercase">
                Buscar
              </Button>
            </form>

            {searchLoading && <p className="text-xs text-slate-400 animate-pulse">Buscando citas...</p>}
            
            {searchError && <p className="text-[11px] text-red-400 leading-tight">{searchError}</p>}

            {searchResult && (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                <span className="block text-[11px] font-semibold text-slate-400">Resultados de búsqueda:</span>
                {searchResult.length === 0 ? (
                  <p className="text-[11px] text-slate-500">Sin historial registrado.</p>
                ) : (
                  searchResult.map((c) => (
                    <div key={c.idCita} className="p-2 rounded-lg border border-slate-900 bg-slate-950/60 flex flex-col text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white uppercase">{c.placaVehiculo}</span>
                        <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                          c.estado === 'Asignada' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            : 'bg-red-500/10 text-red-400 border border-red-500/10'
                        }`}>
                          {c.estado}
                        </span>
                      </div>
                      <span className="text-slate-400 mt-1">{formatFecha(c.fechaHora)}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>

          {/* Citas de la Sesión Actual */}
          <Card title={`Solicitudes Recientes (${sessionCitas.length})`} glass={false} className="p-5!">
            <span className="block text-[10px] text-slate-500 -mt-6 mb-4">Transacciones procesadas en esta sesión.</span>
            
            <div className="divide-y divide-slate-900 max-h-56 overflow-y-auto pr-1">
              {sessionCitas.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No hay solicitudes procesadas aún en esta sesión.</p>
              ) : (
                sessionCitas.map((c) => (
                  <div key={c.idCita} className="py-2.5 flex flex-col text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white uppercase">{c.placaVehiculo}</span>
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                        c.estado === 'Asignada' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {c.estado === 'Asignada' ? 'Asignada' : 'Rechazada'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">{formatFecha(c.fechaHora)} ({c.tipoVehiculo})</span>
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
