import { Component, computed, input, signal } from '@angular/core';
import { initials } from '../../../core/formatters';

/** Foto de perfil redonda; si no hay foto (o no carga) muestra las iniciales. */
@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
})
export class Avatar {
  readonly name = input.required<string>();
  readonly url = input<string | undefined>();
  readonly size = input(44);

  /** URL que falló al cargar (se vuelve a intentar si cambia la foto). */
  private readonly failedUrl = signal<string | undefined>(undefined);

  protected readonly showImage = computed(() => !!this.url() && this.url() !== this.failedUrl());
  protected readonly text = computed(() => initials(this.name()));

  protected onError(): void {
    this.failedUrl.set(this.url());
  }
}
