'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ShieldAlert, ShieldCheck, Unlock, Search, Plus, Edit, Trash2, X, Users, UserPlus } from 'lucide-react';
import { desbloquearUsuario, deleteUsuario, updateUsuario, createUsuario } from '@/app/actions/usuarios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioSchema, UsuarioFormData } from '@/lib/schemas';

type User = {
  id: string;
  nombres: string | null;
  rol: string;
  intentos: number;
  bloqueado: boolean;
};

function UsuarioFormModal({
  mode,
  initialData,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  initialData?: User;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: initialData
      ? {
          id: initialData.id,
          nombres: initialData.nombres ?? '',
          rol: initialData.rol as 'ADMIN' | 'TECNICO',
          password: '',
        }
      : { id: '', nombres: '', rol: 'TECNICO', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = (data: UsuarioFormData) => {
    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createUsuario(data)
          : await updateUsuario(initialData!.id, data);

      if (result.success) {
        onSuccess(
          mode === 'create'
            ? `Usuario "${data.id}" registrado exitosamente.`
            : `Usuario "${initialData!.id}" actualizado.`
        );
      } else {
        form.setError('root', { message: result.error ?? 'Error al procesar.' });
      }
    });
  };

  const title = mode === 'create' ? 'Agregar Usuario' : `Editar — ${initialData?.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-xl shadow-2xl border border-slate-800 w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
          {form.formState.errors.root && (
            <Alert variant="error" title="Error">{form.formState.errors.root.message}</Alert>
          )}

          <Input id="u-id" label="ID de Usuario" required disabled={mode === 'edit'}
            placeholder="ej: admin2"
            {...form.register('id')} error={form.formState.errors.id?.message} />
          
          <Input id="u-nombres" label="Nombre Completo" required
            placeholder="ej: Carlos Perez"
            {...form.register('nombres')} error={form.formState.errors.nombres?.message} />
          
          <Input id="u-rol" label="Rol" required
            options={[{ value: 'ADMIN', label: 'Administrador' }, { value: 'TECNICO', label: 'Técnico Operador' }]}
            {...form.register('rol')} error={form.formState.errors.rol?.message} />
          
          <Input id="u-password" label={mode === 'create' ? 'Contraseña' : 'Nueva Contraseña (dejar vacío para no cambiar)'} 
            type="password" required={mode === 'create'}
            placeholder="Mínimo 6 caracteres" {...form.register('password')} error={form.formState.errors.password?.message} />

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={isPending}>
              {mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsuariosTable({ usuarios }: { usuarios: User[] }) {
  const router = useRouter();
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = usuarios.filter(u =>
    u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.nombres ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bloqueadosCount = usuarios.filter(u => u.bloqueado).length;

  const handleModalSuccess = (msg: string) => {
    setModalMode(null);
    setEditTarget(null);
    setFeedback({ type: 'success', msg });
    router.refresh();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      const result = await deleteUsuario(deleteTarget.id);
      setDeleteTarget(null);
      if (result.success) {
        setFeedback({ type: 'success', msg: `Usuario "${deleteTarget.id}" eliminado.` });
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestión de Usuarios</h1>
          <p className="text-slate-400 text-sm mt-1">Administra el acceso al sistema, roles y cuentas bloqueadas.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 text-red-400 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-red-500/20 shadow-sm">
            <ShieldAlert size={16} />{bloqueadosCount} Bloqueados
          </div>
          <button
            onClick={() => { setFeedback(null); setModalMode('create'); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors shadow-sm"
          >
            <Plus size={16} /> Agregar Usuario
          </button>
        </div>
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
            <input type="text" placeholder="Buscar por ID o nombre..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-950 text-slate-100 placeholder-slate-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">Usuario</th>
                <th className="pb-3 font-semibold">Rol</th>
                <th className="pb-3 font-semibold">Intentos</th>
                <th className="pb-3 font-semibold">Estado</th>
                <th className="pb-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Users className="h-8 w-8 text-slate-700" />
                      <p>{searchQuery ? 'No se encontraron resultados.' : 'Aún no hay usuarios. Agrega el primero.'}</p>
                      {!searchQuery && (
                        <button onClick={() => setModalMode('create')} className="text-blue-500 text-sm font-medium hover:underline mt-1">
                          Agregar usuario →
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filtered.map((user) => (
                <tr key={user.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4">
                    <span className="font-semibold text-slate-100">{user.id}</span>
                    {user.nombres && <span className="block text-xs text-slate-500 mt-0.5">{user.nombres}</span>}
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-md ${user.rol === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-800 text-slate-300'}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="py-4 text-slate-300">{user.intentos} {user.intentos > 0 && <span className="text-xs text-red-400">/ 3</span>}</td>
                  <td className="py-4">
                    {user.bloqueado ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20"><ShieldAlert size={14} /> Bloqueado</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ShieldCheck size={14} /> Activo</span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {user.bloqueado && (
                        <form action={desbloquearUsuario}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit" title="Desbloquear" className="p-1.5 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-colors">
                            <Unlock size={16} />
                          </button>
                        </form>
                      )}
                      <button onClick={() => { setFeedback(null); setEditTarget(user); setModalMode('edit'); }} className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Editar">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => { setFeedback(null); setDeleteTarget(user); }} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar">
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
        <UsuarioFormModal
          mode={modalMode}
          initialData={modalMode === 'edit' ? editTarget ?? undefined : undefined}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          onSuccess={handleModalSuccess}
        />
      )}

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPendingDelete}
        title="¿Eliminar usuario?" message={`Esta acción eliminará permanentemente al usuario "${deleteTarget?.id}" del sistema.`} confirmLabel="Sí, eliminar" />
    </div>
  );
}
