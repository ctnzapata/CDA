'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Search, Plus, Edit, Trash2, X, UserPlus } from 'lucide-react';
import { deletePropietario, updatePropietario, createPropietario } from '@/app/actions/propietarios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propietarioSchema, PropietarioFormData } from '@/lib/schemas';

type Propietario = {
  id: string;
  tipoDocumento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  direccion: string;
  _count: { vehiculos: number };
};

const TIPO_DOC_OPTIONS = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'NIT', label: 'NIT' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

function PropietarioFormModal({
  mode,
  initialData,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  initialData?: Propietario;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<PropietarioFormData>({
    resolver: zodResolver(propietarioSchema),
    defaultValues: initialData
      ? {
          id: initialData.id,
          tipoDocumento: initialData.tipoDocumento as any,
          nombres: initialData.nombres,
          apellidos: initialData.apellidos,
          telefono: initialData.telefono,
          email: initialData.email,
          direccion: initialData.direccion,
        }
      : { id: '', tipoDocumento: 'CC', nombres: '', apellidos: '', telefono: '', email: '', direccion: '' },
    mode: 'onBlur',
  });

  const onSubmit = (data: PropietarioFormData) => {
    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createPropietario(data)
          : await updatePropietario(initialData!.id, data);

      if (result.success) {
        onSuccess(
          mode === 'create'
            ? `Propietario "${data.nombres} ${data.apellidos}" registrado exitosamente.`
            : `Propietario "${data.nombres} ${data.apellidos}" actualizado.`
        );
      } else {
        form.setError('root', { message: result.error ?? 'Error al procesar.' });
      }
    });
  };

  const title = mode === 'create' ? 'Agregar Propietario' : `Editar — ${initialData?.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-xl shadow-2xl border border-slate-800 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
          {form.formState.errors.root && (
            <Alert variant="error" title="Error">{form.formState.errors.root.message}</Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="f-tipoDocumento" label="Tipo de Documento" required
              options={TIPO_DOC_OPTIONS}
              {...form.register('tipoDocumento')}
              error={form.formState.errors.tipoDocumento?.message} />
            <Input id="f-id" label="Número de Documento" required
              placeholder="ej: 10203040"
              disabled={mode === 'edit'}
              {...form.register('id')}
              error={form.formState.errors.id?.message} />
            <Input id="f-nombres" label="Nombres" required
              placeholder="ej: Juan Carlos"
              {...form.register('nombres')}
              error={form.formState.errors.nombres?.message} />
            <Input id="f-apellidos" label="Apellidos" required
              placeholder="ej: Restrepo Giraldo"
              {...form.register('apellidos')}
              error={form.formState.errors.apellidos?.message} />
            <Input id="f-telefono" label="Teléfono Celular" required
              placeholder="ej: 3114567890"
              {...form.register('telefono')}
              error={form.formState.errors.telefono?.message} />
            <Input id="f-email" label="Correo Electrónico" type="email" required
              placeholder="ej: juan@example.com"
              {...form.register('email')}
              error={form.formState.errors.email?.message} />
            <Input id="f-direccion" label="Dirección Residencial" required
              placeholder="ej: Calle 10 # 43C - 20"
              className="md:col-span-2"
              {...form.register('direccion')}
              error={form.formState.errors.direccion?.message} />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={isPending}>
              {mode === 'create' ? 'Registrar Propietario' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PropietariosTable({ propietarios }: { propietarios: Propietario[] }) {
  const router = useRouter();
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Propietario | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Propietario | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = propietarios.filter(p =>
    p.id.includes(searchQuery) ||
    p.nombres.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.apellidos.toLowerCase().includes(searchQuery.toLowerCase())
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
      const result = await deletePropietario(deleteTarget.id);
      setDeleteTarget(null);
      if (result.success) {
        setFeedback({ type: 'success', msg: `Propietario "${deleteTarget.nombres} ${deleteTarget.apellidos}" eliminado.` });
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Propietarios</h1>
          <p className="text-slate-400 text-sm mt-1">Administra los propietarios registrados en el sistema.</p>
        </div>
        <button
          onClick={() => { setFeedback(null); setModalMode('create'); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors shadow-sm"
        >
          <Plus size={16} />Agregar Propietario
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
            <input type="text" placeholder="Buscar por cédula o nombre..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-950 text-slate-100 placeholder-slate-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">Documento</th>
                <th className="pb-3 font-semibold">Nombre Completo</th>
                <th className="pb-3 font-semibold">Contacto</th>
                <th className="pb-3 font-semibold">Vehículos</th>
                <th className="pb-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <UserPlus className="h-8 w-8 text-slate-700" />
                      <p>{searchQuery ? 'No se encontraron resultados.' : 'Aún no hay propietarios. Agrega el primero.'}</p>
                      {!searchQuery && (
                        <button onClick={() => setModalMode('create')} className="text-blue-500 text-sm font-medium hover:underline mt-1">
                          Agregar propietario →
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filtered.map((prop) => (
                <tr key={prop.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4">
                    <span className="font-semibold text-slate-100">{prop.id}</span>
                    <span className="block text-[10px] font-medium text-slate-500 mt-0.5">{prop.tipoDocumento}</span>
                  </td>
                  <td className="py-4 text-slate-300">{prop.nombres} {prop.apellidos}</td>
                  <td className="py-4">
                    <span className="block text-slate-300">{prop.telefono}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{prop.email}</span>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-slate-800 text-slate-300 rounded-md">
                      {prop._count.vehiculos}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setFeedback(null); setEditTarget(prop); setModalMode('edit'); }}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Editar">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => { setFeedback(null); setDeleteTarget(prop); }}
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

      {/* Modal unificado de Crear / Editar */}
      {modalMode && (
        <PropietarioFormModal
          mode={modalMode}
          initialData={modalMode === 'edit' ? editTarget ?? undefined : undefined}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          onSuccess={handleModalSuccess}
        />
      )}

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPendingDelete}
        title="¿Eliminar propietario?"
        message={`Se eliminará a "${deleteTarget?.nombres} ${deleteTarget?.apellidos}". Si tiene vehículos vinculados, la operación será rechazada.`}
        confirmLabel="Sí, eliminar" />
    </div>
  );
}
