import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

/**
 * Servicio de Autenticación de Usuarios.
 * Contiene la lógica pura de negocio para validar credenciales e implementar la regla
 * de bloqueo al tercer (3er) intento fallido consecutivo.
 */
export class AuthService {
  /**
   * Intenta autenticar un usuario por ID y contraseña.
   * @param id Identificador único del usuario (ej: admin).
   * @param passwordPlain Contraseña en texto plano enviada por el formulario.
   * @returns Resultado de la autenticación con éxito o mensaje de error descriptivo.
   */
  static async login(id: string, passwordPlain: string) {
    try {
      // 1. Validar inputs básicos
      if (!id || !passwordPlain) {
        return { success: false, error: 'Por favor, ingrese usuario y contraseña.' };
      }

      // 2. Buscar el usuario en la base de datos
      const user = await prisma.user.findUnique({
        where: { id: id.trim().toLowerCase() },
      });

      if (!user) {
        return { success: false, error: 'Credenciales inválidas.' };
      }

      // 3. REGLA DE NEGOCIO: Si la cuenta ya está bloqueada, denegar acceso inmediato
      if (user.bloqueado) {
        return {
          success: false,
          error: 'Su cuenta ha sido bloqueada debido a 3 intentos fallidos consecutivos por seguridad.',
          bloqueado: true,
        };
      }

      // 4. Comparar contraseñas usando bcrypt
      const passwordMatch = await bcrypt.compare(passwordPlain, user.password);

      if (passwordMatch) {
        // Autenticación exitosa: Restablecemos intentos a 0 si tenía intentos previos
        if (user.intentos > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { intentos: 0 },
          });
        }

        return {
          success: true,
          user: {
            id: user.id,
            intentos: 0,
            bloqueado: false,
          },
        };
      } else {
        // Autenticación fallida: Incrementar contador de intentos
        const nuevosIntentos = user.intentos + 1;
        const debeBloquear = nuevosIntentos >= 3;

        // Guardamos los cambios del intento fallido en base de datos
        await prisma.user.update({
          where: { id: user.id },
          data: {
            intentos: nuevosIntentos,
            bloqueado: debeBloquear,
          },
        });

        if (debeBloquear) {
          return {
            success: false,
            error: 'Su cuenta ha sido bloqueada debido a 3 intentos fallidos consecutivos por seguridad.',
            bloqueado: true,
          };
        }

        const intentosRestantes = 3 - nuevosIntentos;
        return {
          success: false,
          error: `Contraseña incorrecta. Le quedan ${intentosRestantes} ${
            intentosRestantes === 1 ? 'intento' : 'intentos'
          } antes de que su cuenta sea bloqueada.`,
          bloqueado: false,
        };
      }
    } catch (error) {
      console.error('Error en AuthService.login:', error);
      return {
        success: false,
        error: 'Ocurrió un error inesperado en el servidor durante la autenticación.',
      };
    }
  }

  /**
   * Método auxiliar para restablecer (desbloquear) un usuario.
   * Útil para labores de soporte del sistema.
   */
  static async desbloquearUsuario(id: string) {
    try {
      await prisma.user.update({
        where: { id: id.trim().toLowerCase() },
        data: {
          intentos: 0,
          bloqueado: false,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error al desbloquear usuario:', error);
      return { success: false, error: 'No se pudo desbloquear al usuario.' };
    }
  }
}
