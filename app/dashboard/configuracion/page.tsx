import Card from "@/components/ui/Card";
import { Shield, Database, Info, Server } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configuración</h1>
        <p className="text-slate-500 text-sm mt-1">
          Parámetros del sistema y estado de la infraestructura.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info del Sistema */}
        <Card title="Información del Sistema">
          <dl className="divide-y divide-slate-100">
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Info size={16} />
                Nombre de la Aplicación
              </dt>
              <dd className="text-sm font-semibold text-slate-800">CDA Manager</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Server size={16} />
                Framework
              </dt>
              <dd className="text-sm font-semibold text-slate-800">Next.js (App Router)</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Database size={16} />
                Base de Datos
              </dt>
              <dd className="text-sm font-semibold text-slate-800">SQLite (Prisma ORM)</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Shield size={16} />
                Normativa
              </dt>
              <dd className="text-sm font-semibold text-slate-800">Ley 769 de 2002</dd>
            </div>
          </dl>
        </Card>

        {/* Parámetros de Seguridad */}
        <Card title="Parámetros de Seguridad">
          <dl className="divide-y divide-slate-100">
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-slate-500">Intentos máximos de login</dt>
              <dd className="text-sm font-semibold text-slate-800">3</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-slate-500">Algoritmo de hashing</dt>
              <dd className="text-sm font-semibold text-slate-800">bcrypt (10 rounds)</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-slate-500">Sesión vía</dt>
              <dd className="text-sm font-semibold text-slate-800">Cookies HttpOnly</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-slate-500">Roles disponibles</dt>
              <dd className="text-sm font-semibold text-slate-800">ADMIN, TECNICO</dd>
            </div>
          </dl>
        </Card>

        {/* Reglas de Negocio */}
        <Card title="Reglas de Negocio (Validaciones)" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">Regla</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Descripción</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Ejemplo Válido</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-800">Placa Carro</td>
                  <td className="px-6 py-4 text-slate-600">3 letras mayúsculas + 3 números</td>
                  <td className="px-6 py-4"><code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">AAA123</code></td>
                </tr>
                <tr className="bg-white border-b border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-800">Placa Moto</td>
                  <td className="px-6 py-4 text-slate-600">3 letras + 2 números + 1 letra</td>
                  <td className="px-6 py-4"><code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">AAA12A</code></td>
                </tr>
                <tr className="bg-white border-b border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-800">Año Modelo Max</td>
                  <td className="px-6 py-4 text-slate-600">No puede ser mayor al año actual + 2</td>
                  <td className="px-6 py-4"><code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">2028</code></td>
                </tr>
                <tr className="bg-white">
                  <td className="px-6 py-4 font-medium text-slate-800">Año Modelo Min</td>
                  <td className="px-6 py-4 text-slate-600">No puede ser anterior a 20 años atrás</td>
                  <td className="px-6 py-4"><code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">2006</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
