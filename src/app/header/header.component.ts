import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { AuthServiceService } from '../auth/auth-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public isAuthenticated: boolean = false;
  public userName: string;
  private subs = new SubSink();
  constructor(private authService: AuthServiceService) {}
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.init();
  }
  private init() {
    this.userName = this.authService.getUserName();
    this.isAuthenticated = this.authService.getAuthStatus();

    this.subs.add(
      this.authService.isAuth.subscribe((authStatus) => {
        this.isAuthenticated = authStatus;
      }),
      this.authService.updateUserName.subscribe((username) => {
        this.userName = username;
      })
    );
  }
  logout() {
    this.authService.logout();
  }
}
