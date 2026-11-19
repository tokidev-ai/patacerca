import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WalkersService } from '../../../core/walkers.service';
import { formatDate } from '../../../core/formatters';
import type { Verification } from '../../../core/models';
import { Avatar } from '../../../shared/ui/avatar/avatar';
import { StatusPill } from '../../../shared/ui/status-pill/status-pill';

interface Photo {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-request-detail',
  imports: [RouterLink, Avatar, StatusPill],
  templateUrl: './request-detail.html',
})
export class RequestDetail {
  private readonly walkersService = inject(WalkersService);
  protected readonly date = formatDate;

  /** Parámetro de ruta `:id` (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly walker = computed(() =>
    this.walkersService.walkers().find((w) => w.id === this.id()),
  );
  protected readonly loadingList = this.walkersService.loading;

  /** undefined = cargando, null = el paseador aún no envió datos de verificación. */
  protected readonly verification = signal<Verification | null | undefined>(undefined);

  protected readonly photos = computed<Photo[]>(() => {
    const v = this.verification();
    return [
      { label: 'Carnet (anverso)', url: v?.idFrontPhoto },
      { label: 'Carnet (reverso)', url: v?.idBackPhoto },
      { label: 'Selfie con el carnet', url: v?.selfiePhoto },
      { label: 'Certificado de antecedentes', url: v?.policeRecordPhoto },
    ];
  });

  protected readonly confirming = signal(false);
  protected readonly approving = signal(false);
  protected readonly approved = signal(false);
  protected readonly error = signal('');

  constructor() {
    effect(() => {
      const id = this.id();
      this.verification.set(undefined);
      this.confirming.set(false);
      this.approved.set(false);
      this.error.set('');
      this.walkersService
        .getVerification(id)
        .then((v) => this.verification.set(v))
        .catch(() => this.verification.set(null));
    });
  }

  protected async approve(): Promise<void> {
    this.approving.set(true);
    this.error.set('');
    try {
      await this.walkersService.approve(this.id());
      this.approved.set(true);
      this.confirming.set(false);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No pudimos aprobar al paseador.');
    } finally {
      this.approving.set(false);
    }
  }
}
