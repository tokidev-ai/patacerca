import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, NOT_ADMIN_ERROR } from '../../../core/auth.service';
import { firebaseReady } from '../../../core/firebase';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly configured = firebaseReady;
  protected email = '';
  protected password = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected async submit(): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      await this.auth.login(this.email, this.password);
      await this.router.navigateByUrl('/dashboard');
    } catch (e) {
      this.error.set(this.messageFor(e));
    } finally {
      this.loading.set(false);
    }
  }

  private messageFor(e: unknown): string {
    if (e instanceof Error && e.message === NOT_ADMIN_ERROR) {
      return 'Esta cuenta no tiene permiso de administrador.';
    }
    const code = (e as { code?: string }).code ?? '';
    if (code.startsWith('auth/') && code !== 'auth/network-request-failed') {
      return 'Correo o contraseña incorrectos.';
    }
    return 'No pudimos iniciar sesión. Revisa tu conexión e intenta de nuevo.';
  }
}
