'use client';

import React, { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

/* ============================================================
 * Tipos locales para mostrar los resultados de consultas.
 * ============================================================ */
interface CitaSimple {
  idCita: string;
  placaVehiculo: string;
  tipoVehiculo: string;
  fechaHora: string;
  estado: 'Asignada' | 'Rechazada por Deuda';
}

interface CitaConVehiculo extends CitaSimple {
  vehiculo?: {
    placa: string;
    tipo: string;
    marca: string;
    modelo: string;
    color: string;
    propietario?: {
      idPropietario: string;
      nombre: string;
      telefono: string;
    };
  };
}

type PanelActivo = 'placa' | 'propietario' | 'reporte';

export default function ConsultasPage() {
  const [panelActivo, setPanelActivo] = useState<PanelActivo>('placa');

  /* ---------- Panel 1: Historial por Placa ---------- */
  const [busqPlaca, setBusqPlaca] = useState('');
  const [citasPlaca, setCitasPlaca] = useState<CitaSimple[] | null>(null);
  const [loadingPlaca, setLoadingPlaca] = useState(false);
  const [errorPlaca, setErrorPlaca] = useState('');

  /* ---------- Panel 2: Historial por Propietario ---------- */
  const [busqCedula, setBusqCedula] = useState('');
  const [citasProp, setCitasProp] = useState<CitaConVehiculo[] | null>(null);
  const [loadingProp, setLoadingProp] = useState(false);
  const [errorProp, setErrorProp] = useState('');

  /* ---------- Panel 3: Reporte de Rechazos por Rango de Fechas ---------- */
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [citasReporte, setCitasReporte] = useState<CitaConVehiculo[] | null>(null);
  const [totalRechazados, setTotalRechazados] = useState<number | null>(null);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [errorReporte, setErrorReporte] = useState('');

  /* ============================================================
   * Utilidades
   * ============================================================ */
  const formatFecha = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  const BadgeEstado = ({ estado }: { estado: string }) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
        estado === 'Asignada'
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${estado === 'Asignada' ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {estado}
    </span>
  );

  /* ============================================================
   * Panel 1 — Búsqueda por Placa
   * ============================================================ */
  const handleBuscarPorPlaca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busqPlaca.trim()) return;
    setLoadingPlaca(true);
    setErrorPlaca('');
    setCitasPlaca(null);

    try {
      const res = await fetch(`/api/citas?placa=${busqPlaca.trim()}`);
      const data = await res.json();
      if (data.success) {
        setCitasPlaca(data.citas ?? []);
        if ((data.citas ?? []).length === 0) {
          setErrorPlaca(`No se encontraron citas para la placa ${busqPlaca.toUpperCase()}.`);
        }
      } else {
        setErrorPlaca(data.error ?? 'Error al consultar.');
      }
    } catch {
      setErrorPlaca('Error de red al consultar el historial.');
    } finally {
      setLoadingPlaca(false);
    }
  };

  /* ============================================================
   * Panel 2 — Búsqueda por Propietario
   * ============================================================ */
  const handleBuscarPorPropietario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busqCedula.trim()) return;
    setLoadingProp(true);
    setErrorProp('');
    setCitasProp(null);

    try {
      const res = await fetch(`/api/citas?idPropietario=${busqCedula.trim()}`);
      const data = await res.json();
      if (data.success) {
        setCitasProp(data.citas ?? []);
        if ((data.citas ?? []).length === 0) {
          setErrorProp(`No se encontraron citas para el propietario con cédula ${busqCedula}.`);
        }
      } else {
        setErrorProp(data.error ?? 'Error al consultar.');
      }
    } catch {
      setErrorProp('Error de red al consultar el historial del propietario.');
    } finally {
      setLoadingProp(false);
    }
  };

  /* ============================================================
   * Panel 3 — Reporte de Rechazos por Rango de Fechas
   * ============================================================ */
  const handleGenerarReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin) return;
    setLoadingReporte(true);
    setErrorReporte('');
    setCitasReporte(null);
    setTotalRechazados(null);

    try {
      const res = await fetch(
        `/api/consultas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
      );
      const data = await res.json();
      if (data.success) {
        setCitasReporte(data.citas ?? []);
        setTotalRechazados(data.totalRechazados ?? 0);
      } else {
        setErrorReporte(data.error ?? 'Error al generar el reporte.');
      }
    } catch {
      setErrorReporte('Error de red al generar el reporte.');
    } finally {
      setLoadingReporte(false);
    }
  };

  /* ============================================================
   * Configuración de pestañas
   * ============================================================ */
  const tabs: { id: PanelActivo; label: string; icon: React.ReactNode }[] = [
    {
      id: 'placa',
      label: 'Historial por Placa',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      ),
    },
    {
      id: 'propietario',
      label: 'Historial por Propietario',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
    {
      id: 'reporte',
      label: 'Reporte de Rechazos',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-1.769-1.769a3.375 3.375 0 1 1-4.773-4.773 3.375 3.375 0 0 1 4.773 4.773ZM8.25 9h.008v.008H8.25V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008H12.75V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Consultas y Reportes RTM</h2>
        <p className="text-sm text-slate-400 mt-1">
          Herramientas de diagnóstico para consultar el historial de revisiones y generar reportes de rechazo según la Ley 769 de 2002.
        </p>
      </div>

      {/* Selector de Pestañas */}
      <div className="border-b border-slate-900 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPanelActivo(tab.id)}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer ${
              panelActivo === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================
        * PANEL 1 — Historial por Placa
        * ============================================================ */}
      {panelActivo === 'placa' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario de búsqueda */}
          <Card
            title="Buscar por Placa"
            subtitle="Ingrese la matrícula del vehículo para ver su historial completo de citas de revisión técnico mecánica."
          >
            <form onSubmit={handleBuscarPorPlaca} className="space-y-4">
              <Input
                id="busqPlaca"
                label="Matrícula / Placa"
                required
                value={busqPlaca}
                onChange={(e) => setBusqPlaca(e.target.value)}
                placeholder="ej: EDF456"
                className="uppercase"
              />
              <Button
                type="submit"
                variant="primary"
                loading={loadingPlaca}
                className="w-full"
              >
                Buscar Historial
              </Button>
            </form>
          </Card>

          {/* Resultados */}
          <Card
            title={`Resultados ${citasPlaca !== null ? `(${citasPlaca.length} registros)` : ''}`}
            className="lg:col-span-2"
          >
            {!citasPlaca && !loadingPlaca && !errorPlaca && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-12 w-12 text-slate-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <p className="text-sm">Ingrese una placa para comenzar la búsqueda.</p>
              </div>
            )}

            {errorPlaca && (
              <Alert variant="warning" title="Atención">
                {errorPlaca}
              </Alert>
            )}

            {citasPlaca && citasPlaca.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-slate-900">
                <table className="w-full text-xs">
                  <thead className="bg-slate-900/60">
                    <tr>
                      {['Placa', 'Tipo', 'Fecha / Hora', 'Estado'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {citasPlaca.map((c) => (
                      <tr key={c.idCita} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white uppercase">{c.placaVehiculo}</td>
                        <td className="px-4 py-3 text-slate-300">{c.tipoVehiculo}</td>
                        <td className="px-4 py-3 text-slate-300">{formatFecha(c.fechaHora)}</td>
                        <td className="px-4 py-3">
                          <BadgeEstado estado={c.estado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ============================================================
        * PANEL 2 — Historial por Propietario (Cédula)
        * ============================================================ */}
      {panelActivo === 'propietario' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario */}
          <Card
            title="Buscar por Propietario"
            subtitle="Ingrese el número de cédula del propietario para consultar las citas vinculadas a todos sus vehículos registrados."
          >
            <form onSubmit={handleBuscarPorPropietario} className="space-y-4">
              <Input
                id="busqCedula"
                label="Número de Cédula"
                required
                value={busqCedula}
                onChange={(e) => setBusqCedula(e.target.value)}
                placeholder="ej: 10203040"
              />
              <Button
                type="submit"
                variant="primary"
                loading={loadingProp}
                className="w-full"
              >
                Buscar Historial
              </Button>
            </form>
          </Card>

          {/* Resultados */}
          <Card
            title={`Resultados ${citasProp !== null ? `(${citasProp.length} citas)` : ''}`}
            className="lg:col-span-2"
          >
            {!citasProp && !loadingProp && !errorProp && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-12 w-12 text-slate-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <p className="text-sm">Ingrese una cédula para consultar el historial del propietario.</p>
              </div>
            )}

            {errorProp && (
              <Alert variant="warning" title="Atención">
                {errorProp}
              </Alert>
            )}

            {citasProp && citasProp.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-slate-900">
                <table className="w-full text-xs">
                  <thead className="bg-slate-900/60">
                    <tr>
                      {['Placa', 'Vehículo', 'Propietario', 'Fecha / Hora', 'Estado'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {citasProp.map((c) => (
                      <tr key={c.idCita} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white uppercase">{c.placaVehiculo}</td>
                        <td className="px-4 py-3 text-slate-300">
                          {c.vehiculo ? `${c.vehiculo.marca} ${c.vehiculo.modelo} (${c.vehiculo.color})` : c.tipoVehiculo}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {c.vehiculo?.propietario ? (
                            <span>
                              <span className="font-medium text-white">{c.vehiculo.propietario.nombre}</span>
                              <span className="block text-[10px] text-slate-500">C.C. {c.vehiculo.propietario.idPropietario}</span>
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{formatFecha(c.fechaHora)}</td>
                        <td className="px-4 py-3">
                          <BadgeEstado estado={c.estado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ============================================================
        * PANEL 3 — Reporte de Rechazos por Rango de Fechas
        * ============================================================ */}
      {panelActivo === 'reporte' && (
        <div className="space-y-6">

          {/* Formulario de fechas */}
          <Card title="Parámetros del Reporte">
            <form onSubmit={handleGenerarReporte} className="flex flex-wrap gap-4 items-end">
              <Input
                id="fechaInicio"
                label="Fecha de Inicio"
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="flex-1 min-w-[180px]"
              />
              <Input
                id="fechaFin"
                label="Fecha de Fin"
                type="date"
                required
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="flex-1 min-w-[180px]"
              />
              <Button
                type="submit"
                variant="danger"
                loading={loadingReporte}
              >
                Generar Reporte
              </Button>
            </form>
          </Card>

          {/* Error */}
          {errorReporte && (
            <Alert variant="error" title="Error al procesar el reporte">
              {errorReporte}
            </Alert>
          )}

          {/* Tarjeta resumen de totales */}
          {totalRechazados !== null && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card glass={false} className="border-red-500/20 bg-red-500/5! p-5! flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{totalRechazados}</p>
                  <p className="text-xs text-slate-400 leading-tight mt-0.5">Total de Citas Rechazadas<br/>por Deudas de Tránsito</p>
                </div>
              </Card>

              <Card glass={false} className="border-slate-800 bg-slate-900/30! p-5! flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.625 21h12.75A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.625 9h12.75A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Período consultado</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {fechaInicio} → {fechaFin}
                  </p>
                </div>
              </Card>

              <Card glass={false} className="border-slate-800 bg-slate-900/30! p-5! flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Marco Legal</p>
                  <p className="text-xs text-slate-400 mt-0.5">Ley 769 de 2002<br/>Código Nacional de Tránsito</p>
                </div>
              </Card>
            </div>
          )}

          {/* Tabla de resultados */}
          {citasReporte !== null && (
            <>
              {citasReporte.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2 border border-slate-900 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-12 w-12 text-slate-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <p className="text-sm font-semibold">¡Sin rechazos en el período seleccionado!</p>
                  <p className="text-xs text-slate-600">No se registraron solicitudes rechazadas por deudas en este rango de fechas.</p>
                </div>
              ) : (
                <div className="border border-slate-900 rounded-xl overflow-hidden">
                  <div className="bg-slate-900/40 px-5 py-3 border-b border-slate-900">
                    <h4 className="text-sm font-bold text-white">
                      Detalle de Vehículos Rechazados por Deuda
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Listado de solicitudes de RTM no asignadas por deudas de tránsito activas.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-900/60">
                        <tr>
                          {['Placa', 'Tipo', 'Marca / Modelo', 'Propietario', 'Fecha Rechazada', 'Estado'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60">
                        {citasReporte.map((c) => (
                          <tr key={c.idCita} className="hover:bg-red-500/5 transition-colors">
                            <td className="px-4 py-3 font-bold text-white uppercase">{c.placaVehiculo}</td>
                            <td className="px-4 py-3 text-slate-300">{c.tipoVehiculo}</td>
                            <td className="px-4 py-3 text-slate-300">
                              {c.vehiculo ? `${c.vehiculo.marca} ${c.vehiculo.modelo}` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              {c.vehiculo?.propietario ? (
                                <span>
                                  <span className="font-medium text-white">{c.vehiculo.propietario.nombre}</span>
                                  <span className="block text-[10px] text-slate-500">
                                    C.C. {c.vehiculo.propietario.idPropietario}
                                  </span>
                                </span>
                              ) : <span className="text-slate-500">—</span>}
                            </td>
                            <td className="px-4 py-3 text-slate-300">{formatFecha(c.fechaHora)}</td>
                            <td className="px-4 py-3">
                              <BadgeEstado estado={c.estado} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-red-950/30 border-t border-red-500/20">
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Total de Solicitudes Rechazadas por Deuda:
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-lg font-black text-red-400">{totalRechazados}</span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Estado vacío inicial */}
          {!citasReporte && !loadingReporte && !errorReporte && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-2 border border-dashed border-slate-800 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-14 w-14 text-slate-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <p className="text-sm font-semibold">Seleccione un rango de fechas</p>
              <p className="text-xs text-slate-600">
                El reporte mostrará todas las solicitudes de RTM rechazadas por deudas de tránsito dentro del período especificado.
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
