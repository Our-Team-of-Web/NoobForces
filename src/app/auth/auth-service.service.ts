import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import jwt_decode from 'jwt-decode';
import { IUser } from './user.model';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private baseUrl: string = environment.baseUrl;
  public isLoading: Subject<boolean> = new Subject();
  public isAuth: Subject<boolean> = new Subject();
  public updateUserName: Subject<string> = new Subject();
  private userName: string = 'user';
  private isAuthenticated: boolean = false;
  private tokenTimer: any;
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}
  // for getting authentication status
  getUserName() {
    const name = localStorage.getItem('userName');
    return name;
  }
  updateUserNameFun(name: string) {
    localStorage.setItem('userName', name);
    this.updateUserName.next(name);
  }
  getAuthStatus() {
    return this.isAuthenticated;
  }
  // for signing up new user
  signup(name: string, email: string, password: string) {
    const user: IUser = {
      name,
      email,
      password,
    };
    return this.http.post(`${this.baseUrl}users/register`, user);
  }
  // login user
  login(email: string, password: string) {
    this.isLoading.next(true);
    const data = {
      email,
      password,
    };
    this.http
      .post<{ status: string; token: string }>(
        `${this.baseUrl}users/login`,
        data
      )
      .subscribe(
        (res: any) => {
          if (res.status === 'success' && res.access_token) {
            this.isAuth.next(true);
            this.isAuthenticated = true;
            const decodedData: any = jwt_decode(res.access_token);
            // data stored in token
            const issuedAt = decodedData.iat;
            const expiredAt = decodedData.exp;
            const userId = res.id;
            // updating the spinner
            this.isLoading.next(false);
            const expirationTime = expiredAt - issuedAt;
            this.setAuthTimer(expirationTime);
            const expirationDate = new Date(expiredAt * 1000);
            this.userName = email.split('@')[0];
            this.updateUserName.next(this.userName);
            this.saveAuthData(
              userId,
              +expirationDate,
              res.access_token,
              this.userName
            );
            this.toastr.success(`Welcome back ${this.userName}`);
            this.router.navigate(['/']);
          }
        },
        (err: any) => {
          this.isLoading.next(false);
          this.toastr.error(err.error.err);
        }
      );
  }
  public autoLogin() {
    const { data, err } = this.getAuthData();
    if (data) {
      const now = +new Date();
      const expiresIn = data.expiredAt - now;
      if (expiresIn > 0) {
        this.isAuth.next(true);
        this.isAuthenticated = true;
        this.userName = data.userName;
        this.updateUserName.next(this.userName);
        this.setAuthTimer(expiresIn / 1000);
      }
    }
  }
  private setAuthTimer(expirationTime: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, expirationTime * 1000);
  }
  public logout() {
    this.isAuth.next(false);
    this.isAuthenticated = false;
    this.removeAuthData();
    this.toastr.success(`Bye ${this.userName}...See you again!`);
    clearTimeout(this.tokenTimer);

    this.router.navigate(['/login']);
  }
  private saveAuthData(
    userId: string,
    expiredAt: number,
    token: string,
    userName: string
  ) {
    localStorage.setItem('expiresIn', expiredAt.toString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
    localStorage.setItem('userName', userName);
  }
  private removeAuthData() {
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
  }
  private getAuthData(): {
    data: {
      token: string;
      expiredAt: number;
      userId: string;
      userName: string;
    };
    err: Error;
  } {
    const token: string = localStorage.getItem('token');
    const expiredAt: number = +localStorage.getItem('expiresIn');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    if (token && expiredAt) {
      return {
        data: {
          token: token,
          expiredAt: expiredAt,
          userId: userId,
          userName,
        },
        err: null,
      };
    }
    return {
      data: null,
      err: new Error("Token doesn't exist!"),
    };
  }
  getUserAddedProblem(userId: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'auth-token': localStorage.getItem('token'),
      }),
    };
    return this.http.get(`${this.baseUrl}users/added/${userId}`, httpOptions);
  }
  getUserSolvedProblem(userId: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'auth-token': localStorage.getItem('token'),
      }),
    };
    return this.http.get(`${this.baseUrl}users/solved/${userId}`, httpOptions);
  }
  updateUserInfo(name: string, email: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'auth-token': localStorage.getItem('token'),
        'Access-Control-Allow-Origin': '*',
      }),
    };
    const data = {
      name,
      email,
    };
    const userId = localStorage.getItem('userId');
    return this.http.patch(`${this.baseUrl}users/${userId}`, data, httpOptions);
  }
  updateUserPassword(oldPassword: string, newPassword: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'auth-token': localStorage.getItem('token'),
        'Access-Control-Allow-Origin': '*',
      }),
    };
    const data = {
      old_password: oldPassword,
      new_password: newPassword,
    };
    const userId = localStorage.getItem('userId');
    return this.http.patch(
      `${this.baseUrl}users/password/${userId}`,
      data,
      httpOptions
    );
  }
}
