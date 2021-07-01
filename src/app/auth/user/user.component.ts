import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IProblem } from 'src/app/problem.model';
import { ProblemService } from 'src/app/problem.service';
import { AuthServiceService } from '../auth-service.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit, OnDestroy {
  @ViewChild('closeModal', { static: false }) closeModal: ElementRef;

  public userProfileForm: FormGroup;
  public passwordChangeForm: FormGroup;
  public addedProblems: { id: string; name: string; tags: string }[] = [];
  public solvedProblems: IProblem[] = [
    {
      id: '60d97b6c1bf5ab00152bb5bf',
      problemName: 'newProblem',
      problemDescription: 'this is description',
      difficulty: 'easy',
      sampleInput: '123',
      sampleOutput: '234',
      tags: 'array',
      inputFormat: 'i format',
      outputFormat: 'o/p format',
    },
  ];
  public isLoadingInfo: boolean = false;
  public isLoadingPassword: boolean = false;
  public isDeleted: boolean = false;
  // private properties
  private subs = new SubSink();
  constructor(
    private router: Router,
    private problemService: ProblemService,
    private authService: AuthServiceService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.getUserData();
  }
  updateNameAndEmail() {
    this.isLoadingInfo = true;
    const name = this.userProfileForm.get('name').value;
    const email = this.userProfileForm.get('email').value;
    this.subs.add(
      this.authService.updateUserInfo(name, email).subscribe(
        (res: any) => {
          if (res.status === 'success') {
            this.toastr.success('Profile updated successfully!');
            const name = email.split('@')[0];
            this.authService.updateUserNameFun(name);
            this.userProfileForm.reset();
            this.isLoadingInfo = false;
          }
        },
        (err) => {
          this.isLoadingInfo = false;
          this.toastr.error('Error', err.error.err);
        }
      )
    );
  }
  updatePassword() {
    this.isLoadingPassword = true;
    const oldPassword = this.passwordChangeForm.get('oldPassword').value;
    const newPassword = this.passwordChangeForm.get('newPassword').value;
    this.authService.updateUserPassword(oldPassword, newPassword).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Success!', 'Password changed successfully!');
          this.isLoadingPassword = false;
          this.passwordChangeForm.reset();
        }
      },
      (err) => {
        this.toastr.error(err.error.err, 'Error Occurs!');
        this.isLoadingPassword = false;
      }
    );
  }
  private getUserData() {
    const userId = localStorage.getItem('userId');
    console.log(userId);
    this.subs.add(
      this.authService.getUserAddedProblem(userId).subscribe(
        (res: any) => {
          // this.addedProblems =
          console.log(res);
          if (res.status === 'success') {
            this.addedProblems = res.problems;
          }
        },
        (err) => {
          this.toastr.error('Unable to fetch user data!');
        }
      ),
      this.authService.getUserSolvedProblem(userId).subscribe(
        (res: any) => {
          console.log(res);
          if (res.status === 'success') {
            this.solvedProblems = res.problems;
          }
        },
        (err) => {
          this.toastr.error('Unable to fetch user data!');
        }
      )
    );
  }
  private initForms() {
    this.userProfileForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
    });
    this.passwordChangeForm = new FormGroup({
      oldPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }
  editProblem(problemId: string) {
    console.log(problemId);
    this.router.navigate(['/edit', problemId]);
  }
  deleteProblemComponent(problemId: string) {
    console.log(problemId);
    /*
    this.subs.add(
      this.problemService.deleteProblem(problemId).subscribe(
        (res) => {
          const updatedArray = this.addedProblems.filter((problem) => {
            if (problem.id !== problemId) {
              return true;
            } else {
              return false;
            }
          });
          this.addedProblems = updatedArray;
          this.isDeleted = true;
          this.toastr.success('Problem Deleted Successfully');
        },
        (err) => {
          this.toastr.error('Error', err.error.err);
        }
      )
    );*/
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
