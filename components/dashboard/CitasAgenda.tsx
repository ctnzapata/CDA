'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VALID_SLOTS, citaSchema, CitaFormData } from '@/lib/schemas';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Clock, Calendar as CalendarIcon, Filter, CarFront, Bike, Play, CheckCircle2, XCircle, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createCita, iniciarInspeccion, finalizarInspeccion, cancelarCita } from '@/app/actions/citas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type CitaData = {
  id: string;
  horaSlot: string;
  estado: string;
  observaciones: string | null;
  placaVehiculo: string;
  vehiculo: {
    tipoVehiculo: string;
    propietario: { nombres: string; apellidos: string } | null;
  };
};

const MAX_CAPACITY = 3;

// --- MODAL DE AGENDAMIENTO ---
function CitaFormModal({
  selectedDateStr,
  onClose,
  onSuccess,
}: {
  selectedDateStr: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CitaFormData>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      placaVehiculo: '',
      fecha: selectedDateStr,
      horaSlot: '08:00',
      observaciones: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = (data: CitaFormData) => {
    startTransition(async () => {
      const result = await createCita(data);
      if (result.success) {
        onSuccess(`Cita agendada para el vehículo ${data.placaVehiculo}.`);
      } else {
        form.setError('root', { message: result.error ?? 'Error al agendar.' });
      }
    });
  };

  const currentDayOfWeek = new Date(`${form.watch('fecha')}T12:00:00`).getDay(); // Prevenir shift timezone

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-xl shadow-2xl border border-slate-800 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Nueva Cita</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
          {form.formState.errors.root && (
            <Alert variant="error" title="Atención">{form.formState.errors.root.message}</Alert>
          )}

          {currentDayOfWeek === 0 && (
            <Alert variant="warning" title="Día no válido">
              No hay atención operativa los días Domingos. Seleccione otra fecha.
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input id="c-placa" label="Placa del Vehículo" required className="col-span-2"
              placeholder="ej: AAA123"
              {...form.register('placaVehiculo')} error={form.formState.errors.placaVehiculo?.message} 
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                form.register('placaVehiculo').onChange(e);
              }} />
            
            <Input id="c-fecha" type="date" label="Fecha" required
              {...form.register('fecha')} error={form.formState.errors.fecha?.message} />
            
            <Input id="c-slot" label="Bloque Horario" required
              options={VALID_SLOTS.map(slot => ({ value: slot, label: slot }))}
              {...form.register('horaSlot')} error={form.formState.errors.horaSlot?.message} />
            
            <Input id="c-obs" label="Observaciones (Opcional)" className="col-span-2"
              placeholder="Ej: Revisión de frenos extra..."
              {...form.register('observaciones')} error={form.formState.errors.observaciones?.message} />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={isPending} disabled={currentDayOfWeek === 0}>
              Agendar Cita
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MODAL DE CANCELACIÓN ---
function CancelModal({
  citaId,
  onClose,
  onSuccess,
}: {
  citaId: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (motivo.length < 5) {
      setError('El motivo debe tener al menos 5 caracteres.');
      return;
    }
    setError('');
    startTransition(async () => {
      const result = await cancelarCita(citaId, motivo);
      if (result.success) {
        onSuccess('Cita cancelada correctamente.');
      } else {
        setError(result.error ?? 'Error al cancelar.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-xl shadow-2xl border border-slate-800 w-full max-w-md mx-4 animate-in fade-in zoom-in-95">
        <div className="p-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 text-center">Cancelar Cita</h3>
          <p className="text-sm text-slate-400 text-center mt-2">Esta acción no se puede deshacer. Indique el motivo de la cancelación.</p>
          
          <div className="mt-4 space-y-2">
            <Input id="motivo-cancel" placeholder="Ej: Cliente no se presentó..." value={motivo} onChange={(e) => setMotivo(e.target.value)} error={error} />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">Atrás</Button>
          <Button variant="danger" onClick={handleConfirm} loading={isPending} className="flex-1">Confirmar Cancelación</Button>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function CitasAgenda({ 
  initialCitas, 
  selectedDateStr 
}: { 
  initialCitas: CitaData[]; 
  selectedDateStr: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterState, setFilterState] = useState<string>('TODAS');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  
  // Global actions loading
  const [actionPending, startActionTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', newDate);
    router.push(`?${params.toString()}`);
  };

  const citasToDisplay = initialCitas.filter(cita => {
    if (filterState === 'TODAS') return true;
    if (filterState === 'ACTIVAS') return cita.estado === 'PENDIENTE' || cita.estado === 'EN_PISTA';
    return cita.estado === filterState;
  });

  const citasBySlot = VALID_SLOTS.reduce((acc, slot) => {
    acc[slot] = citasToDisplay.filter(c => c.horaSlot === slot);
    return acc;
  }, {} as Record<string, CitaData[]>);

  const handleAction = (type: 'iniciar' | 'finalizar', id: string) => {
    startActionTransition(async () => {
      setFeedback(null);
      const result = type === 'iniciar' ? await iniciarInspeccion(id) : await finalizarInspeccion(id);
      if (result.success) {
        setFeedback({ type: 'success', msg: type === 'iniciar' ? 'Inspección iniciada.' : 'Inspección completada.' });
      } else {
        setFeedback({ type: 'error', msg: result.error ?? 'Error en la acción.' });
      }
    });
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-slate-800 text-slate-300 border border-slate-700">PENDIENTE</span>;
      case 'EN_PISTA':
        return <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">EN PISTA</span>;
      case 'COMPLETADA':
        return <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">COMPLETADA</span>;
      case 'CANCELADA':
        return <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-red-500/10 text-red-400 border border-red-500/20">CANCELADA</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 relative">
      {actionPending && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded animate-pulse z-10">Procesando...</div>
      )}
      
      {feedback && (
        <Alert variant={feedback.type === 'success' ? 'success' : 'error'} title={feedback.type === 'success' ? 'Éxito' : 'Error'}>
          {feedback.msg}
        </Alert>
      )}

      {/* Barra de Herramientas y Filtros */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-48 relative">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CalendarIcon size={14} /> Fecha de Agenda
              </label>
              <input 
                type="date" 
                value={selectedDateStr}
                onChange={handleDateChange}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-slate-100 outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500/50"
              />
            </div>
            <div className="w-full sm:w-48 relative">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Filter size={14} /> Estado
              </label>
              <select 
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-slate-100 outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500/50 appearance-none"
              >
                <option value="TODAS">Todas las Citas</option>
                <option value="ACTIVAS">Activas (Pendiente/En Pista)</option>
                <option value="PENDIENTE">Solo Pendientes</option>
                <option value="EN_PISTA">Solo En Pista</option>
                <option value="COMPLETADA">Completadas</option>
                <option value="CANCELADA">Canceladas</option>
              </select>
            </div>
          </div>

          <button 
            onClick={() => { setFeedback(null); setIsFormOpen(true); }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500 transition-colors shadow-sm"
          >
            <Plus size={16} /> Agendar Cita
          </button>
        </div>
      </Card>

      {/* Línea de Tiempo (Timeline) */}
      <div className="space-y-4">
        {VALID_SLOTS.map((slot) => {
          const citasInSlot = citasBySlot[slot] || [];
          const activeCount = initialCitas.filter(c => c.horaSlot === slot && ['PENDIENTE', 'EN_PISTA'].includes(c.estado)).length;
          const isFull = activeCount >= MAX_CAPACITY;
          
          return (
            <div key={slot} className="flex flex-col md:flex-row gap-4 group">
              <div className="md:w-32 flex-shrink-0 flex items-start gap-3 md:pt-4">
                <div className="flex flex-col items-end w-full">
                  <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-500" />
                    {slot}
                  </span>
                  <span className={cn(
                    "text-xs font-medium mt-1",
                    isFull ? "text-red-400" : "text-emerald-400"
                  )}>
                    {MAX_CAPACITY - activeCount}/{MAX_CAPACITY} Disponibles
                  </span>
                </div>
                <div className="hidden md:flex flex-col items-center self-stretch ml-2">
                  <div className="w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-950 z-10 shadow-sm mt-1 group-hover:border-blue-500 transition-colors" />
                  <div className="w-px h-full bg-slate-800 -mt-2 min-h-[50px]" />
                </div>
              </div>

              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-1 min-h-[80px]">
                {citasInSlot.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-4">
                    <p className="text-sm text-slate-600 font-medium italic">Bloque horario vacío</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                    {citasInSlot.map((cita) => (
                      <div key={cita.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors flex flex-col justify-between group/card">
                        
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {cita.vehiculo.tipoVehiculo === 'Carro' 
                              ? <CarFront size={16} className="text-slate-500" />
                              : <Bike size={16} className="text-slate-500" />
                            }
                            <span className="font-bold text-slate-100 tracking-wide uppercase">{cita.placaVehiculo}</span>
                          </div>
                          {getStatusBadge(cita.estado)}
                        </div>
                        
                        <div className="text-xs text-slate-400 mt-1 mb-3">
                          {cita.vehiculo.propietario 
                            ? `${cita.vehiculo.propietario.nombres} ${cita.vehiculo.propietario.apellidos}`
                            : 'Propietario no asignado'
                          }
                        </div>

                        {/* ACCIONES RÁPIDAS DE FLUJO */}
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/50">
                          <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                            {cita.observaciones || 'Sin observaciones'}
                          </span>
                          
                          <div className="flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                            {cita.estado === 'PENDIENTE' && (
                              <button onClick={() => handleAction('iniciar', cita.id)} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors" title="Iniciar Inspección (Pasar a Pista)">
                                <Play size={14} className="fill-current" />
                              </button>
                            )}
                            {cita.estado === 'EN_PISTA' && (
                              <button onClick={() => handleAction('finalizar', cita.id)} className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors" title="Finalizar Inspección">
                                <CheckCircle2 size={14} />
                              </button>
                            )}
                            {(cita.estado === 'PENDIENTE' || cita.estado === 'EN_PISTA') && (
                              <button onClick={() => setCancelTargetId(cita.id)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors" title="Cancelar Cita">
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {isFormOpen && (
        <CitaFormModal 
          selectedDateStr={selectedDateStr}
          onClose={() => setIsFormOpen(false)} 
          onSuccess={(msg) => { setIsFormOpen(false); setFeedback({ type: 'success', msg }); }} 
        />
      )}
      
      {cancelTargetId && (
        <CancelModal 
          citaId={cancelTargetId} 
          onClose={() => setCancelTargetId(null)} 
          onSuccess={(msg) => { setCancelTargetId(null); setFeedback({ type: 'success', msg }); }} 
        />
      )}
    </div>
  );
}
