import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WalkersService } from '../../core/walkers.service';
import { ZONE_EXISTS_ERROR, ZonesService } from '../../core/zones.service';
import type { Zone } from '../../core/models';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';

/** Alta, baja y activación de las zonas que ven dueños y paseadores. */
@Component({
  selector: 'app-zones',
  imports: [FormsModule, ConfirmDialog],
  templateUrl: './zones.html',
})
export class Zones {
  protected readonly zonesService = inject(ZonesService);
  private readonly walkers = inject(WalkersService);

  protected readonly newName = signal('');
  protected readonly adding = signal(false);
  protected readonly addError = signal('');
  protected readonly busyId = signal<string | null>(null);
  protected readonly seeding = signal(false);
  protected readonly toDelete = signal<Zone | null>(null);
  protected readonly actionError = signal('');

  /** Cuántos paseadores tienen cada zona (para avisar antes de quitarla). */
  protected readonly walkersByZone = computed(() => {
    const map = new Map<string, number>();
    for (const w of this.walkers.walkers()) {
      const zones = new Set([w.zone, ...w.zones].filter(Boolean));
      zones.forEach((z) => map.set(z, (map.get(z) ?? 0) + 1));
    }
    return map;
  });

  constructor() {
    this.zonesService.start();
  }

  protected walkersIn(zone: Zone): number {
    return this.walkersByZone().get(zone.name) ?? 0;
  }

  protected deleteMessage(zone: Zone): string {
    const n = this.walkersIn(zone);
    return n > 0
      ? `${n} ${n === 1 ? 'paseador la tiene' : 'paseadores la tienen'} en su perfil. Si solo quieres ocultarla, mejor desactívala.`
      : 'Dejará de aparecer en las apps.';
  }

  protected async add(): Promise<void> {
    const name = this.newName().trim();
    if (!name || this.adding()) return;
    this.adding.set(true);
    this.addError.set('');
    try {
      await this.zonesService.add(name);
      this.newName.set('');
    } catch (e) {
      this.addError.set(
        e instanceof Error && e.message === ZONE_EXISTS_ERROR
          ? 'Esa zona ya existe.'
          : 'No se pudo agregar la zona. Revisa tu conexión.',
      );
    } finally {
      this.adding.set(false);
    }
  }

  protected async toggle(zone: Zone): Promise<void> {
    this.busyId.set(zone.id);
    this.actionError.set('');
    try {
      await this.zonesService.setActive(zone.id, !zone.active);
    } catch {
      this.actionError.set('No se pudo actualizar la zona.');
    } finally {
      this.busyId.set(null);
    }
  }

  protected async confirmDelete(): Promise<void> {
    const zone = this.toDelete();
    if (!zone) return;
    this.busyId.set(zone.id);
    this.actionError.set('');
    try {
      await this.zonesService.remove(zone.id);
      this.toDelete.set(null);
    } catch {
      this.actionError.set('No se pudo eliminar la zona.');
    } finally {
      this.busyId.set(null);
    }
  }

  protected async seed(): Promise<void> {
    this.seeding.set(true);
    this.actionError.set('');
    try {
      await this.zonesService.seedDefaults();
    } catch {
      this.actionError.set('No se pudieron cargar las zonas por defecto.');
    } finally {
      this.seeding.set(false);
    }
  }
}
