import { Component, input, output } from '@angular/core';

/** Diálogo de confirmación con el estilo del panel (mismo patrón que las apps). */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input<string>('');
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly tone = input<'primary' | 'danger'>('primary');
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected cancel(): void {
    if (!this.busy()) this.cancelled.emit();
  }
}
