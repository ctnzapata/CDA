'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Search, Plus, Edit, Trash2, X, Car } from 'lucide-react';
import { deleteVehiculo, updateVehiculo, createVehiculo } from '@/app/actions/vehiculos';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, VehicleFormData } from '@/lib/schemas';

type Vehiculo = {
  placa: string;
  tipoVehiculo: string;
  marca: string;
  linea: string;
  modelo: number;
  color: string;
  numeroChasis: string | null;
  numeroMotor: string | null;
  propietarioId: string;
  propietario: { nombres: string; apellidos: string };
};

type Propietario = {
  id: string;
  nombres: string;
  apellidos: string;
};

function VehiculoFormModal({
  mode,
  initialData,
  propietarios,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  initialData?: Vehiculo;
  propietarios: Propietario[];
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData
      ? {
          placa: initialData.placa,
          tipoVehiculo: initialData.tipoVehiculo as 'Carro' | 'Moto',
          marca: initialData.marca,
          linea: initialData.linea,
          modelo: initialData.modelo,
          color: initialData.color,
          numeroChasis: initialData.numeroChasis ?? '',
          numeroMotor: initialData.numeroMotor ?? '',
          propietarioId: initialData.propietarioId,
        }
      : {
          placa: '',
          tipoVehiculo: 'Carro',
          marca: '',
          linea: '',
          modelo: new Date().getFullYear(),
          color: '',
          numeroChasis: '',
          numeroMotor: '',
          propietarioId: '',
        },
    mode: 'onBlur',
  });

  const onSubmit = (data: VehicleFormData) => {
    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createVehiculo(data)
          : await updateVehiculo(initialData!.placa, data);

      if (result.success) {
        onSuccess(
          mode === 'create'
            ? `Vehículo "${data.placa}" registrado exitosamente.`
            : `Vehículo "${initialData!.placa}" actualizado.`
        );
      } else {
        form.setError('root', { message: result.error ?? 'Error al procesar.' });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-xl shadow-2xl border border-slate-800 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Car className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              {mode === 'create' ? 'Agregar Vehículo' : `Editar — ${initialData?.placa}`}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1"><X size={20} /></button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
          {form.formState.errors.root && (
            <Alert variant="error" title="Error">{form.formState.errors.root.message}</Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="v-placa" label="Matrícula / Placa" required
              placeholder="ej: EDF456"
              disabled={mode === 'edit'}
              {...form.register('placa')}
              error={form.formState.errors.placa?.message}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                form.register('placa').onChange(e);
              }} />
            <Input id="v-tipoVehiculo" label="Tipo de Vehículo" required
              options={[{ value: 'Carro', label: 'Carro' }, { value: 'Moto', label: 'Moto' }]}
              {...form.register('tipoVehiculo')}
              error={form.formState.errors.tipoVehiculo?.message} />
            <Input id="v-marca" label="Marca" required
              placeholder="ej: Mazda / Yamaha"
              {...form.register('marca')}
              error={form.formState.errors.marca?.message} />
            <Input id="v-linea" label="Línea / Estilo" required
              placeholder="ej: 3 Sedán / FZ 250"
              {...form.register('linea')}
              error={form.formState.errors.linea?.message} />
            <Input id="v-modelo" label="Año Modelo" type="number" required
              {...form.register('modelo', { valueAsNumber: true })}
              error={form.formState.errors.modelo?.message} />
            <Input id="v-color" label="Color" required
              placeholder="ej: Rojo"
              {...form.register('color')}
              error={form.formState.errors.color?.message} />
            <Input id="v-chasis" label="Número de Chasis (Opcional)"
              placeholder="ej: 9C2..."
              {...form.register('numeroChasis')}
              error={form.formState.errors.numeroChasis?.message} />
            <Input id="v-motor" label="Número de Motor (Opcional)"
              placeholder="ej: M54..."
              {...form.register('numeroMotor')}
              error={form.formState.errors.numeroMotor?.message} />
            <Input id="v-propietarioId" label="Propietario" required
              className="md:col-span-2"
              options={[
                { value: '', label: '-- Seleccione un propietario registrado --' },
                ...propietarios.map(p => ({ value: p.id, label: `${p.nombres} ${p.apellidos} (${p.id})` }))
              ]}
              {...form.register('propietarioId')}
              error={form.formState.errors.propietarioId?.message} />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={isPending}>
              {mode === 'create' ? 'Registrar Vehículo' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VehiculosTable({
  vehiculos,
  propietarios,
}: {
  vehiculos: Vehiculo[];
  propietarios: Propietario[];
}) {
  const router = useRouter();
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Vehiculo | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Vehiculo | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = vehiculos.filter(v =>
    v.placa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.propietarioId.includes(searchQuery)
  );

  const handleModalSuccess = (msg: string) => {
    setModalMode(null);
    setEditTarget(null);
    setFeedback({ type: 'success', msg });
    router.refresh();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      const result = await deleteVehiculo(deleteTarget.placa);
      setDeleteTarget(null);
      if (result.success) {
        setFeedback({ type: 'success', msg: `Vehículo "${deleteTarget.placa}" eliminado.` });
        router.refresh();
      } else {
        setFeedback({ type: 'error', msg: result.error ?? 'Error al eliminar.' });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vehículos</h1>
          <p className="text-slate-400 text-sm mt-1">Administra los vehículos y sus propietarios asignados.</p>
        </div>
        <button
          onClick={() => { setFeedback(null); setModalMode('create'); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors shadow-sm"
        >
          <Plus size={16} />Agregar Vehículo
        </button>
      </div>

      {feedback && (
        <Alert variant={feedback.type === 'success' ? 'success' : 'error'} title={feedback.type === 'success' ? 'Éxito' : 'Error'}>
          {feedback.msg}
        </Alert>
      )}

      <Card>
        <div className="mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input type="text" placeholder="Buscar por placa, marca o cédula..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-950 text-slate-100 placeholder-slate-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">Placa</th>
                <th className="pb-3 font-semibold">Vehículo</th>
                <th className="pb-3 font-semibold">Propietario</th>
                <th className="pb-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Car className="h-8 w-8 text-slate-700" />
                      <p>{searchQuery ? 'No se encontraron resultados.' : 'Aún no hay vehículos. Agrega el primero.'}</p>
                      {!searchQuery && (
                        <button onClick={() => setModalMode('create')} className="text-blue-500 text-sm font-medium hover:underline mt-1">
                          Agregar vehículo →
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filtered.map((veh) => (
                <tr key={veh.placa} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4">
                    <span className="font-bold text-slate-100 uppercase tracking-wide">{veh.placa}</span>
                    <span className={`block w-max mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                      veh.tipoVehiculo === 'Carro' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {veh.tipoVehiculo}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="font-medium text-slate-300">{veh.marca} {veh.linea}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">Modelo {veh.modelo} • {veh.color}</span>
                  </td>
                  <td className="py-4">
                    <span className="block text-slate-300">{veh.propietario.nombres} {veh.propietario.apellidos}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">C.C. {veh.propietarioId}</span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setFeedback(null); setEditTarget(veh); setModalMode('edit'); }}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Editar">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => { setFeedback(null); setDeleteTarget(veh); }}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {modalMode && (
        <VehiculoFormModal
          mode={modalMode}
          initialData={modalMode === 'edit' ? editTarget ?? undefined : undefined}
          propietarios={propietarios}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          onSuccess={handleModalSuccess}
        />
      )}

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPendingDelete}
        title="¿Eliminar vehículo?"
        message={`Se eliminará permanentemente el vehículo con placa "${deleteTarget?.placa}".`}
        confirmLabel="Sí, eliminar" />
    </div>
  );
}
