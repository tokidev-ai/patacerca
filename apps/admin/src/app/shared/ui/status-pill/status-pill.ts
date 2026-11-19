import { Component, computed, input } from '@angular/core';
import { STATUS_LABEL } from '../../../core/formatters';
import type { WalkerStatus } from '../../../core/models';

const TONE: Record<WalkerStatus, string> = {
  pending: 'bg-sand text-ink-soft',
  in_review: 'bg-amber-soft text-amber',
  approved: 'bg-brand-soft text-brand-dark',
};

/** Etiqueta de estado del paseador (sin verificar / en revisión / aprobado). */
@Component({
  selector: 'app-status-pill',
  templateUrl: './status-pill.html',
})
export class StatusPill {
  readonly status = input.required<WalkerStatus>();

  protected readonly label = computed(() => STATUS_LABEL[this.status()]);
  protected readonly tone = computed(() => TONE[this.status()]);
}
