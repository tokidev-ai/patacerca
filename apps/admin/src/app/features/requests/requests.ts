import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WalkersService } from '../../core/walkers.service';
import { formatDate } from '../../core/formatters';
import type { Walker, WalkerStatus } from '../../core/models';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { StatusPill } from '../../shared/ui/status-pill/status-pill';

type Filter = WalkerStatus | 'all';

@Component({
  selector: 'app-requests',
  imports: [FormsModule, RouterLink, Avatar, StatusPill],
  templateUrl: './requests.html',
})
export class Requests {
  protected readonly walkers = inject(WalkersService);
  protected readonly date = formatDate;

  protected readonly filter = signal<Filter>('in_review');
  protected readonly query = signal('');

  protected readonly tabs = computed<{ key: Filter; label: string; count: number }[]>(() => [
    { key: 'in_review', label: 'Por revisar', count: this.walkers.inReview().length },
    { key: 'approved', label: 'Aprobados', count: this.walkers.approved().length },
    { key: 'pending', label: 'Sin verificar', count: this.walkers.pending().length },
    { key: 'all', label: 'Todos', count: this.walkers.walkers().length },
  ]);

  protected readonly rows = computed<Walker[]>(() => {
    const filter = this.filter();
    const q = this.query().trim().toLowerCase();
    return this.walkers
      .walkers()
      .filter((w) => filter === 'all' || w.status === filter)
      .filter(
        (w) =>
          !q ||
          w.name.toLowerCase().includes(q) ||
          w.phone.includes(q) ||
          w.zone.toLowerCase().includes(q),
      )
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  });
}
