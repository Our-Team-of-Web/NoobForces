import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { SubSink } from 'subsink';
import { ToastrService } from 'ngx-toastr';
import { IProblem } from '../problem.model';
import { ProblemService } from '../problem.service';
import { AuthServiceService } from '../auth/auth-service.service';

@Component({
  selector: 'app-list-problems',
  templateUrl: './list-problems.component.html',
  styleUrls: ['./list-problems.component.css'],
})
export class ListProblemsComponent implements OnInit, OnDestroy {
  @ViewChild('nextpage', { static: true }) nextPage: ElementRef;
  private subs = new SubSink();
  public problems: IProblem[] = [];
  // select options
  public difficulty: string[] = ['ALL', 'EASY', 'MEDIUM', 'HARD'];
  public pageSizes: number[] = [5, 10, 25, 50, 100];
  public allTags: string[] = [];
  // initial selection
  public selectedPageSize: number = 5;
  public selectedDifficulty: string = 'ALL';
  public currentPage: number = 1;
  public selectedTag: string = 'all';
  public totalPages: number = Math.ceil(
    this.problems.length / this.selectedPageSize
  );
  public percentageSolved: number = 0;
  public totalProblems: number = 0;
  public solvedCount: number = 0;
  // spinner on off
  public isLoading: boolean;
  public recentActivity: string[] = [];
  constructor(
    private problemService: ProblemService,
    private router: Router,
    private authService: AuthServiceService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.init();
  }
  private init() {
    this.isLoading = true;
    this.allTags = this.problemService.getAllTags();
    this.recentActivity = this.problemService.getRecentActivities();
    this.problemService.getAllProblems(
      this.currentPage,
      this.selectedPageSize,
      this.selectedDifficulty,
      this.selectedTag
    );
    this.subs.add(
      this.problemService.getUpdatedProblems.subscribe(
        (res: { problems: IProblem[]; count: number }) => {
          console.log(res);
          this.isLoading = false;
          this.problems = res.problems;
          this.problems.forEach((problem) => {
            problem.solved = false;
          });
          this.totalProblems = res.count;
          this.totalPages = Math.ceil(res.count / this.selectedPageSize);
          const userId = localStorage.getItem('userId');
          this.subs.add(
            this.authService
              .getUserSolvedProblem(userId)
              .subscribe((response: any) => {
                if (response.status === 'success') {
                  this.solvedCount = response.problems.length;
                  this.percentageSolved =
                    (response.problems.length / res.count) * 100;
                  for (let solve of response.problems) {
                    const id = solve.id;
                    for (let problem of this.problems) {
                      if (id === problem.id) {
                        problem.solved = true;
                      }
                    }
                  }
                }
              })
          );
        }
      )
    );
  }
  solveProblem(id: string) {
    this.router.navigate(['/solve', id]);
  }
  popularTag(tag: string) {
    this.problems = [];
    this.selectedTag = tag;
    this.init();
  }
  onChange(value) {
    this.problems = [];
    this.init();
  }
  counter(i: number) {
    return new Array(i);
  }
  gotoNextPage() {
    this.problems = [];
    if (this.currentPage === +this.nextPage.nativeElement.value) {
      this.currentPage++;
      this.init();
    } else {
      this.currentPage = +this.nextPage.nativeElement.value;
      this.init();
    }
  }
  gotoPrevPage() {
    this.problems = [];
    if (this.currentPage === +this.nextPage.nativeElement.value) {
      this.currentPage--;
      this.init();
    } else {
      this.currentPage = +this.nextPage.nativeElement.value;
      this.init();
    }
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
