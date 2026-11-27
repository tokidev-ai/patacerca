import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService, type UserKind } from '../../core/users.service';
import { WalkersService } from '../../core/walkers.service';
import { formatDate } from '../../core/formatters';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';

type StateFilter = 'all' | 'active' | 'blocked';

interface UserRow {
  kind: UserKind;
  id: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  zone: string;
  detail: string;
  blocked: boolean;
  createdAt?: number;
}

/** Dueños y paseadores: buscar, suspender (no entran a la app) y reactivar. */
@Component({
  selector: 'app-users',
  imports: [FormsModule, Avatar, ConfirmDialog],
  templateUrl: './users.html',
})
export class Users {
  protected readonly users = inject(UsersService);
  protected readonly walkersService = inject(WalkersService);
  protected readonly date = formatDate;

  protected readonly kind = signal<UserKind>('owner');
  protected readonly state = signal<StateFilter>('all');
  protected readonly query = signal('');

  protected readonly target = signal<UserRow | null>(null);
  protected readonly saving = signal(false);
  protected readonly actionError = signal('');

  private readonly ownerRows = computed<UserRow[]>(() =>
    this.users.owners().map((o) => ({
      kind: 'owner',
      id: o.id,
      name: o.name || 'Sin nombre',
      phone: o.phone,
      email: o.email,
      photoUrl: o.photoUrl,
      zone: o.zone,
      detail: `${o.petsCount} ${o.petsCount === 1 ? 'mascota' : 'mascotas'}`,
      blocked: o.blocked,
      createdAt: o.createdAt,
    })),
  );

  private readonly walkerRows = computed<UserRow[]>(() =>
    this.walkersService.walkers().map((w) => ({
      kind: 'walker',
      id: w.id,
      name: w.name || 'Sin nombre',
      phone: w.phone,
      email: w.email,
      photoUrl: w.photoUrl,
      zone: w.zone,
      detail: w.status === 'approved' ? 'Verificado' : 'Sin verificar',
      blocked: w.blocked,
      createdAt: w.createdAt,
    })),
  );

  protected readonly kindTabs = computed(() => [
    { key: 'owner' as const, label: 'Dueños', count: this.ownerRows().length },
    { key: 'walker' as const, label: 'Paseadores', count: this.walkerRows().length },
  ]);

  protected readonly loading = computed(() =>
    this.kind() === 'owner' ? this.users.loading() : this.walkersService.loading(),
  );
  protected readonly error = computed(() =>
    this.kind() === 'owner' ? this.users.error() : this.walkersService.error(),
  );

  protected readonly blockedCount = computed(
    () =>
      (this.kind() === 'owner' ? this.ownerRows() : this.walkerRows()).filter((r) => r.blocked)
        .length,
  );

  protected readonly rows = computed<UserRow[]>(() => {
    const q = this.query().trim().toLowerCase();
    const state = this.state();
    return (this.kind() === 'owner' ? this.ownerRows() : this.walkerRows())
      .filter((r) => state === 'all' || (state === 'blocked' ? r.blocked : !r.blocked))
      .filter(
        (r) =>
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          (r.email ?? '').toLowerCase().includes(q) ||
          r.zone.toLowerCase().includes(q),
      )
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  });

  constructor() {
    this.users.start();
  }

  protected confirmTitle(row: UserRow): string {
    return row.blocked ? `Reactivar a ${row.name}` : `Suspender a ${row.name}`;
  }

  protected confirmMessage(row: UserRow): string {
    if (row.blocked) return 'Podrá volver a entrar a la app con su cuenta.';
    return row.kind === 'walker'
      ? 'No podrá entrar a la app de paseadores y dejará de aparecer en las búsquedas de los dueños.'
      : 'No podrá entrar a la app de dueños ni pedir paseos.';
  }

  protected async apply(): Promise<void> {
    const row = this.target();
    if (!row) return;
    this.saving.set(true);
    this.actionError.set('');
    try {
      await this.users.setBlocked(row.kind, row.id, !row.blocked);
      this.target.set(null);
    } catch {
      this.actionError.set('No se pudo actualizar la cuenta. Revisa tu conexión.');
    } finally {
      this.saving.set(false);
    }
  }
}
