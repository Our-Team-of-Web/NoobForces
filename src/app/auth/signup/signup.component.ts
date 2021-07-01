import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthServiceService } from '../auth-service.service';
import { IUser } from '../user.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  public signupForm: FormGroup;
  public isLoading: boolean;
  constructor(
    private authService: AuthServiceService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }
  signup() {
    // sign up logic
    this.isLoading = true;
    const name = this.signupForm.get('name').value;
    const email = this.signupForm.get('email').value;
    const password = this.signupForm.get('password').value;
    this.authService.signup(name, email, password).subscribe(
      (res: any) => {
        if (res) {
          this.isLoading = false;
          this.toastr.success('You have registered successfully', 'Success');
          this.signupForm.reset();
          this.router.navigate(['/login']);
        }
      },
      (err) => {
        if (err) {
          this.isLoading = false;
          this.toastr.error('Failed', err.error.err);
          console.log(err.error.err);
        }
      }
    );
  }
}
