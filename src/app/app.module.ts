import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { SpinnersAngularModule } from 'spinners-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ViewProblemComponent } from './view-problem/view-problem.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddProblemComponent } from './add-problem/add-problem.component';
import { ListProblemsComponent } from './list-problems/list-problems.component';
import { UserComponent } from './auth/user/user.component';
import { TestCComponent } from './auth/test-c/test-c.component';

@NgModule({
  declarations: [
    AppComponent,
    ViewProblemComponent,
    HeaderComponent,
    LoginComponent,
    SignupComponent,
    AddProblemComponent,
    ListProblemsComponent,
    UserComponent,
    TestCComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    SpinnersAngularModule,
    BrowserAnimationsModule,
    RxReactiveFormsModule,
    ToastrModule.forRoot({ preventDuplicates: true }),
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#78C000',
      innerStrokeColor: '#C7E596',
      animationDuration: 300,
      titleColor: '#f7f7f7',
      unitsColor: '#fafafa',
      subtitleColor: '#de4f4f',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
