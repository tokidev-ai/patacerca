import { Component, input } from '@angular/core';

/** Tarjeta con un número grande (dashboard). `highlight` la pinta de verde. */
@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.html',
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly highlight = input(false);
}
