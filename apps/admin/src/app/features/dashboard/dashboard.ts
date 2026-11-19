import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WalkersService } from '../../core/walkers.service';
import { formatDate } from '../../core/formatters';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { StatCard } from '../../shared/ui/stat-card/stat-card';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Avatar, StatCard],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly walkers = inject(WalkersService);
  protected readonly date = formatDate;

  /** Últimas solicitudes por revisar. */
  protected readonly recent = computed(() => this.walkers.inReview().slice(0, 5));

  /** Porcentajes para la barra de estado. */
  protected readonly share = computed(() => {
    const total = this.walkers.walkers().length || 1;
    return {
      approved: (this.walkers.approved().length / total) * 100,
      review: (this.walkers.inReview().length / total) * 100,
      pending: (this.walkers.pending().length / total) * 100,
    };
  });
}
