'use client';

import { useState, useTransition } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Search, CarFront, User, FileWarning, CalendarRange } from 'lucide-react';
import { consultarPorMatricula, consultarPorPropietario, reporteRechazosDeuda } from '@/app/actions/consultas';

export default function ConsultasView() {
  const [isPending, startTransition] = useTransition();

  // Estados de Matrícula
  const [placa, setPlaca] = useState('');
  const [resultadoPlaca, setResultadoPlaca] = useState<any>(null);
  const [errorPlaca, setErrorPlaca] = useState('');

  // Estados de Propietario
  const [idPropietario, setIdPropietario] = useState('');
  const [resultadoProp, setResultadoProp] = useState<any>(null);
  const [errorProp, setErrorProp] = useState('');

  // Estados de Reporte
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [resultadoReporte, setResultadoReporte] = useState<any>(null);
  const [errorReporte, setErrorReporte] = useState('');

  const handleBuscarPlaca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa) return;
    startTransition(async () => {
      setResultadoPlaca(null);
      setErrorPlaca('');
      const res = await consultarPorMatricula(placa);
      if (res.success) setResultadoPlaca(res.data);
      else setErrorPlaca(res.error || 'Error desconocido.');
    });
  };

  const handleBuscarProp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPropietario) return;
    startTransition(async () => {
      setResultadoProp(null);
      setErrorProp('');
      const res = await consultarPorPropietario(idPropietario);
      if (res.success) setResultadoProp(res.data);
      else setErrorProp(res.error || 'Error desconocido.');
    });
  };

  const handleGenerarReporte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin) return;
    startTransition(async () => {
      setResultadoReporte(null);
      setErrorReporte('');
      const res = await reporteRechazosDeuda(fechaInicio, fechaFin);
      if (res.success) setResultadoReporte(res.data);
      else setErrorReporte(res.error || 'Error desconocido.');
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. Consulta por Matrícula */}
      <Card title="Consulta por Matrícula" subtitle="Historial de Citas del vehículo" className="flex flex-col">
        <form onSubmit={handleBuscarPlaca} className="flex gap-3 mb-4">
          <Input 
            id="placa-search"
            placeholder="Ej: AAA123" 
            value={placa} 
            onChange={(e) => setPlaca(e.target.value.toUpperCase())} 
            className="flex-1"
          />
          <Button type="submit" variant="primary" loading={isPending && !placa}>
            <Search size={16} className="mr-2" /> Buscar
          </Button>
        </form>

        {errorPlaca && <Alert variant="error">{errorPlaca}</Alert>}
        
        {resultadoPlaca && (
          <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800 flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-md"><CarFront size={20} className="text-blue-400" /></div>
              <div>
                <h4 className="text-lg font-bold text-white uppercase">{resultadoPlaca.placa}</h4>
                <p className="text-xs text-slate-400">{resultadoPlaca.marca} - {resultadoPlaca.linea}</p>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Historial de Citas (Últimas 5)</p>
              {resultadoPlaca.citas.length === 0 ? (
                <p className="text-sm text-slate-400">No hay citas registradas.</p>
              ) : (
                resultadoPlaca.citas.map((cita: any) => (
                  <div key={cita.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="text-sm text-slate-300">{new Date(cita.fecha).toLocaleDateString()} a las {cita.horaSlot}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">{cita.estado}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Card>

      {/* 2. Consulta por Propietario */}
      <Card title="Consulta por Propietario" subtitle="Vehículos y citas asociadas" className="flex flex-col">
        <form onSubmit={handleBuscarProp} className="flex gap-3 mb-4">
          <Input 
            id="prop-search"
            placeholder="Documento de Identidad" 
            value={idPropietario} 
            onChange={(e) => setIdPropietario(e.target.value)} 
            className="flex-1"
          />
          <Button type="submit" variant="primary" loading={isPending && !idPropietario}>
            <Search size={16} className="mr-2" /> Buscar
          </Button>
        </form>

        {errorProp && <Alert variant="error">{errorProp}</Alert>}
        
        {resultadoProp && (
          <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800 flex-1 overflow-auto max-h-[300px]">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
              <div className="p-2 bg-indigo-500/10 rounded-md"><User size={20} className="text-indigo-400" /></div>
              <div>
                <h4 className="text-lg font-bold text-white">{resultadoProp.nombres} {resultadoProp.apellidos}</h4>
                <p className="text-xs text-slate-400">ID: {resultadoProp.id}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehículos Registrados</p>
              {resultadoProp.vehiculos.length === 0 ? (
                <p className="text-sm text-slate-400">No tiene vehículos asociados.</p>
              ) : (
                resultadoProp.vehiculos.map((v: any) => (
                  <div key={v.placa} className="p-3 rounded bg-slate-900 border border-slate-800">
                    <p className="text-sm font-bold text-white uppercase mb-2">{v.placa} <span className="font-normal text-xs text-slate-400 ml-2">({v.marca})</span></p>
                    {v.citas.length > 0 ? (
                      v.citas.map((c: any) => (
                        <div key={c.id} className="text-xs text-slate-400 ml-2 mb-1 flex justify-between">
                          <span>{new Date(c.fecha).toLocaleDateString()} - {c.horaSlot}</span>
                          <span className="font-medium">{c.estado}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic ml-2">Sin citas.</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Card>

      {/* 3. Reporte de Rechazos */}
      <Card title="Reporte de Rechazos por Deudas (Ley 769)" subtitle="Citas no asignadas por restricciones" className="lg:col-span-2">
        <form onSubmit={handleGenerarReporte} className="flex flex-col md:flex-row gap-4 items-end mb-4">
          <div className="w-full md:w-auto flex-1">
            <Input id="fecha-ini" type="date" label="Fecha Inicio" required value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="w-full md:w-auto flex-1">
            <Input id="fecha-fin" type="date" label="Fecha Fin" required value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <Button type="submit" variant="primary" loading={isPending && !!fechaInicio && !!fechaFin} className="w-full md:w-auto">
            <CalendarRange size={16} className="mr-2" /> Generar
          </Button>
        </form>

        {errorReporte && <Alert variant="error">{errorReporte}</Alert>}

        {resultadoReporte && (
          <div className="mt-4 flex flex-col md:flex-row gap-6">
            <div className="p-6 rounded-lg bg-slate-950 border border-red-500/20 flex flex-col items-center justify-center md:w-1/3">
              <FileWarning size={32} className="text-red-400 mb-2" />
              <p className="text-sm font-medium text-slate-400 text-center">Total de Rechazos</p>
              <h3 className="text-4xl font-black text-red-500 mt-1">{resultadoReporte.total}</h3>
            </div>
            
            <div className="flex-1 border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
              <div className="max-h-[200px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-900 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Placa</th>
                      <th className="px-4 py-2 font-semibold">Fecha Intento</th>
                      <th className="px-4 py-2 font-semibold">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadoReporte.lista.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-4 text-center text-slate-500">No hay rechazos en este rango.</td></tr>
                    ) : (
                      resultadoReporte.lista.map((r: any) => (
                        <tr key={r.id} className="border-t border-slate-800/50 hover:bg-slate-800/20">
                          <td className="px-4 py-2 font-bold text-white">{r.placaVehiculo}</td>
                          <td className="px-4 py-2 text-slate-400">{new Date(r.fechaIntento).toLocaleString()}</td>
                          <td className="px-4 py-2 text-xs text-red-400 truncate max-w-[200px]" title={r.motivo}>{r.motivo}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
}
