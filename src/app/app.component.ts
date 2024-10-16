import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/components/navbar/navbar.component';
import { AuthService } from './core/auth.service';
import { User } from '@angular/fire/auth';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  authService = inject(AuthService);

  ngOnInit():void {
    this.authService.user$.subscribe((user: User | null | undefined) => {
      if(user){
        this.authService.currentUserSig.set(user);
      }
      else{
        this.authService.currentUserSig.set(null);
      }
    });
  }

  title = 'dm-tools';
}
