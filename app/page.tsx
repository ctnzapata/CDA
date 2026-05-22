'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

/**
 * Pantalla de Inicio de Sesión (Login) del MVP RTM.
 * Implementa la directiva de UX Writing para el control de intentos fallidos
 * y bloqueo empático de la cuenta en color rojo crítico.
 */
export default function LoginPage() {
  const router = useRouter();
  
  // Estados para formulario y carga
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados de control de intentos y bloqueo
  const [cuentaBloqueada, setCuentaBloqueada] = useState(false);
  
  // Estados para mensajes de error y notificaciones
  const [errorMessage, setErrorMessage] = useState('');

  // Efecto para verificar si ya estaba bloqueado en base de datos al renderizar (opcional en MVP)
  useEffect(() => {
    // Si la cuenta se bloquea en la sesión actual, la persistimos en memoria local del navegador
    const isLocked = localStorage.getItem('rtm_account_locked') === 'true';
    if (isLocked) {
      setTimeout(() => {
        setCuentaBloqueada(true);
        setErrorMessage(
          'Ingreso bloqueado por seguridad. Has superado el límite de 3 intentos fallidos permitidos por el sistema. Por favor, ponte en contacto con el administrador del sistema para restablecer tu cuenta.'
        );
      }, 0);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cuentaBloqueada || loading) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Reiniciamos contadores locales y limpiamos local storage si estaba bloqueado
        localStorage.removeItem('rtm_account_locked');
        // Redirigir al dashboard (Módulo de Registro)
        router.push('/dashboard/registro');
        router.refresh();
      } else {
        // Manejo de errores basado en la respuesta del backend
        setErrorMessage(data.error || 'Credenciales inválidas.');
        
        if (data.bloqueado) {
          setCuentaBloqueada(true);
          localStorage.setItem('rtm_account_locked', 'true');
        }
      }
    } catch (err) {
      console.error('Error de login en cliente:', err);
      setErrorMessage('Ocurrió un error al intentar conectar con el servidor. Inténtelo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const cardTitle = (
    <div className="text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-md">
        {/* Icono de Llave de Seguridad */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </div>
      <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
        Sistema Control RTM
      </h2>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial from-slate-900 via-slate-950 to-black px-4 py-12 sm:px-6 lg:px-8">
      {/* Elemento de diseño de fondo premium (gradiente dinámico flotante) */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl"></div>

      <div className="relative w-full max-w-md">
        <Card
          title={cardTitle}
          subtitle="Control de Revisión Técnico Mecánica (Ley 769 de 2002)"
          className="transition-all duration-300 hover:border-slate-700/80 shadow-2xl"
        >
          {/* Mensaje de Error de UX Writing (Empático y claro) */}
          {errorMessage && (
            <Alert
              variant={cuentaBloqueada ? 'critical' : 'warning'}
              title={cuentaBloqueada ? 'Ingreso bloqueado por seguridad' : 'Atención'}
              className="mb-6"
            >
              {errorMessage}
            </Alert>
          )}

          {/* Formulario de Login */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md">
              <Input
                id="userId"
                label="Identificador de Usuario"
                type="text"
                required
                disabled={cuentaBloqueada || loading}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="ej: admin"
              />

              <Input
                id="password"
                label="Contraseña"
                type="password"
                required
                disabled={cuentaBloqueada || loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={cuentaBloqueada || !userId || !password}
                className="w-full py-3"
              >
                Iniciar Sesión
              </Button>
            </div>
          </form>

          {/* Pié de página del card */}
          <div className="text-center pt-6 mt-6 border-t border-slate-900">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Centro de Diagnóstico Automotor (CDA). Todos los derechos reservados.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
