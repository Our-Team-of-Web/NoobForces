import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthServiceService } from '../auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup;
  public isLoading: boolean;
  private subs = new SubSink();
  constructor(private authService: AuthServiceService) {}
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.init();
  }
  private init() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
    this.subs.add(
      this.authService.isLoading.subscribe((res) => {
        this.isLoading = res;
      })
    );
  }
  login() {
    const email = this.loginForm.get('email').value;
    const password = this.loginForm.get('password').value;
    this.authService.login(email, password);
  }
}
