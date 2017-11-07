import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent implements OnInit {

  user_name = '';
  user_photo = '';

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getUserInfo();
  }

  getUserInfo() {
    this.auth.user.subscribe(val => {
      if (val) {
        this.user_name = val.displayName;
        this.user_photo = val.photoURL;
      } else {
        this.user_name = '';
        this.user_photo = '';
      }
    });
  }

  navigateTo(route) {
    this.router.navigate([route]);
  }

  logOut() {
    this.router.navigate(['/profile']);
    this.auth.signOut();
  }

}
