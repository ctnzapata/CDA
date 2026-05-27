'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, KeyRound } from 'lucide-react';

// --- Helpers de LocalStorage vinculados al userId ---
const LOCK_KEY = (id: string) => `rtm_locked_user_${id.trim().toLowerCase()}`;

function getIsLockedForUser(id: string): boolean {
  if (!id.trim()) return false;
  try {
    return localStorage.getItem(LOCK_KEY(id)) === 'true';
  } catch {
    return false;
  }
}

function setLockedForUser(id: string, locked: boolean) {
  try {
    if (locked) {
      localStorage.setItem(LOCK_KEY(id), 'true');
    } else {
      localStorage.removeItem(LOCK_KEY(id));
    }
  } catch {
    // Sin acceso a localStorage (SSR / privado)
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [cuentaBloqueada, setCuentaBloqueada] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Cada vez que el userId cambia, verificamos si ESE usuario específico está
   * bloqueado en localStorage. Si el nuevo usuario no está bloqueado,
   * habilitamos el formulario inmediatamente.
   */
  const checkLockForCurrentUser = useCallback((id: string) => {
    const locked = getIsLockedForUser(id);
    setCuentaBloqueada(locked);
    if (locked) {
      setErrorMessage(
        'Esta cuenta ha sido bloqueada por 3 intentos fallidos. Contacta al administrador.'
      );
    } else {
      // Limpiamos el mensaje de error del usuario anterior al cambiar de usuario
      setErrorMessage('');
    }
  }, []);

  // Verificar al cargar la página sólo si ya había un userId previo guardado
  useEffect(() => {
    if (userId) checkLockForCurrentUser(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value;
    setUserId(newId);
    setErrorMessage(''); // Limpiamos mensajes de error mientras el usuario escribe
    if (newId.trim().length >= 3) {
      checkLockForCurrentUser(newId);
    } else {
      setCuentaBloqueada(false);
    }
  };

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
        setLockedForUser(userId, false);
        router.push('/dashboard');
        router.refresh();
      } else {
        setErrorMessage(data.error || 'Credenciales inválidas.');

        if (data.bloqueado) {
          setCuentaBloqueada(true);
          // 🔑 Clave: persistimos el bloqueo VINCULADO al userId específico
          setLockedForUser(userId, true);
        }
      }
    } catch (err) {
      console.error('Error de login:', err);
      setErrorMessage('Error al conectar con el servidor. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-4">
      {/* Orbs de fondo decorativos */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

          {/* Header del card */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg mb-5">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sistema RTM</h1>
            <p className="text-slate-400 text-sm mt-1">Control de Revisión Técnico Mecánica</p>
          </div>

          {/* Alerta de error / bloqueo */}
          {errorMessage && (
            <div className={`mx-8 mb-4 p-3.5 rounded-xl border flex gap-3 text-sm ${
              cuentaBloqueada
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <LockKeyhole className={`h-5 w-5 flex-shrink-0 mt-0.5 ${cuentaBloqueada ? 'text-red-400' : 'text-amber-400'}`} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
            <div className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Identificador de Usuario
                </label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={handleUserIdChange}
                  placeholder="ej: admin"
                  required
                  autoComplete="username"
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg border bg-slate-950/80 text-white placeholder-slate-600 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed border-slate-800"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={cuentaBloqueada || loading}
                  className="w-full px-4 py-2.5 rounded-lg border bg-slate-950/80 text-white placeholder-slate-600 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed border-slate-800"
                />
              </div>
            </div>

            {/* Indicador del estado del usuario mientras escribe */}
            {cuentaBloqueada && userId.trim() && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                <LockKeyhole size={14} className="flex-shrink-0" />
                <span>Usuario <strong className="font-mono">{userId.trim()}</strong> bloqueado. Ingresa otro usuario o contacta al administrador.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={cuentaBloqueada || !userId || !password || loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all duration-200 text-sm shadow"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando…
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            <p className="text-center text-xs text-slate-600 pt-2">
              © {new Date().getFullYear()} Centro de Diagnóstico Automotor (CDA).
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
