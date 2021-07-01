import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddProblemComponent } from './add-problem/add-problem.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { TestCComponent } from './auth/test-c/test-c.component';
import { UserComponent } from './auth/user/user.component';
import { ListProblemsComponent } from './list-problems/list-problems.component';
import { ViewProblemComponent } from './view-problem/view-problem.component';

const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'add', component: AddProblemComponent, canActivate: [AuthGuard] },
  {
    path: 'edit/:id',
    component: AddProblemComponent,
    canActivate: [AuthGuard],
  },
  { path: 'problemlist', component: ListProblemsComponent },
  {
    path: 'solve/:id',
    component: ViewProblemComponent,
    canActivate: [AuthGuard],
  },
  { path: 'userprofile', component: UserComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/problemlist', pathMatch: 'full' },
  { path: '**', redirectTo: '/problemlist', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
