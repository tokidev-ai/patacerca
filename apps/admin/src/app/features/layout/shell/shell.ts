import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { WalkersService } from '../../../core/walkers.service';

/** Marco del panel: barra lateral + contenido. Mantiene viva la suscripción a los datos. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class Shell implements OnInit, OnDestroy {
  protected readonly auth = inject(AuthService);
  protected readonly walkers = inject(WalkersService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.walkers.start();
  }

  ngOnDestroy(): void {
    this.walkers.stop();
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
