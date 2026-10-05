import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],

  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private authService = inject(AuthService);

  ngOnInit() {
    // Rehydrate user identity from cookie session
    this.authService.loadSession().subscribe({
      error: () => console.log('No active session found.'),
    });
  }
}
