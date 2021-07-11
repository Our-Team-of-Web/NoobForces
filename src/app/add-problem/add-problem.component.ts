import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { ToastrService } from 'ngx-toastr';
import { IProblem } from '../problem.model';
import { ProblemService } from '../problem.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-problem',
  templateUrl: './add-problem.component.html',
  styleUrls: ['./add-problem.component.css'],
})
export class AddProblemComponent implements OnInit, OnDestroy {
  public isLoading: boolean = false;
  public editMode: boolean = false;
  public isProblemLoaded: boolean = false;
  public addProblemForm: FormGroup;
  public difficulty: string[] = ['EASY', 'MEDIUM', 'HARD'];
  public selectedDifficulty: string = this.difficulty[0];
  public allTags: string[] = [];
  public selectedTag: string = 'all';
  // private properties
  private subs = new SubSink();
  private problemId: string;
  constructor(
    private problemService: ProblemService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.allTags = this.problemService.getAllTags();
    this.initForm();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.editMode = true;
        this.problemId = id;
        this.problemService.getSingleProblem(id).subscribe(
          (res: any) => {
            if (res.status === 'success') {
              this.isProblemLoaded = true;
              const problem: IProblem = {
                id: res.problem._id,
                tags: res.problem.tags,
                problemName: res.problem.name,
                problemDescription: res.problem.statement,
                sampleInput: res.problem.sampleInput,
                sampleOutput: res.problem.sampleOutput,
                difficulty: res.problem.difficultyLevel,
                inputFormat: res.problem.inputFormat,
                outputFormat: res.problem.outputFormat,
              };
              this.populateForm(problem);
              this.addProblemForm.get('problemName').disable();
            }
          },
          (err) => {
            this.toastr.error(err.error.err, 'Error');
            this.router.navigate(['/userprofile']);
          }
        );
      } else {
        this.editMode = false;
      }
    });
  }
  private populateForm(problem: IProblem) {
    this.addProblemForm.patchValue({ problemName: problem.problemName });
    this.addProblemForm.patchValue({
      problemDescription: problem.problemDescription,
    });
    this.addProblemForm.patchValue({ inputFormat: problem.inputFormat });
    this.addProblemForm.patchValue({ outputFormat: problem.outputFormat });
    this.addProblemForm.patchValue({ sampleInput: problem.sampleInput });
    this.addProblemForm.patchValue({ sampleOutput: problem.sampleOutput });
    this.addProblemForm.patchValue({ difficulty: problem.difficulty });
    this.addProblemForm.patchValue({ tags: problem.tags });
  }
  private initForm() {
    this.addProblemForm = new FormGroup({
      problemName: new FormControl('', Validators.required),
      problemDescription: new FormControl('', Validators.required),
      inputFormat: new FormControl('', Validators.required),
      outputFormat: new FormControl('', Validators.required),
      sampleInput: new FormControl('', Validators.required),
      sampleOutput: new FormControl('', Validators.required),
      difficulty: new FormControl(this.selectedDifficulty, Validators.required),
      tags: new FormControl(this.selectedTag, Validators.required),
      inputTestcase: new FormControl(null, [
        Validators.required,
        RxwebValidators.extension({ extensions: ['txt'] }),
      ]),
      outputTestcase: new FormControl(null, [
        Validators.required,
        RxwebValidators.extension({ extensions: ['txt'] }),
      ]),
    });
  }
  onInputFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.addProblemForm.patchValue({ inputTestcase: file });
    }
  }
  onOutputFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.addProblemForm.patchValue({ outputTestcase: file });
    }
  }
  private getProblemFromForm() {
    const problem: IProblem = {
      id: Math.floor(Math.random() * 9999).toString(),
      problemName: this.addProblemForm.get('problemName').value,
      problemDescription: this.addProblemForm.get('problemDescription').value,
      inputFormat: this.addProblemForm.get('inputFormat').value,
      outputFormat: this.addProblemForm.get('outputFormat').value,
      sampleInput: this.addProblemForm.get('sampleInput').value,
      sampleOutput: this.addProblemForm.get('sampleOutput').value,
      difficulty: this.addProblemForm.get('difficulty').value,
      tags: this.addProblemForm.get('tags').value,
      inputTestcase: this.addProblemForm.get('inputTestcase').value,
      outputTestcase: this.addProblemForm.get('outputTestcase').value,
    };
    return problem;
  }
  addProblem() {
    if (this.editMode === true) {
      return this.editProblem();
    }
    this.isLoading = true;
    const problem = this.getProblemFromForm();
    this.subs.add(
      this.problemService.addProblem(problem).subscribe(
        (res: any) => {
          this.isLoading = false;
          this.toastr.success('Success', 'Problem added successfully!');
          this.problemService.triggerUpdateInProblem(problem);
          this.problemService.updateRecentActivity(
            `You added ${problem.problemName}`
          );
          this.selectedTag = this.allTags[0];
          this.selectedDifficulty = this.difficulty[0];
          this.addProblemForm.reset();
        },
        (err) => {
          this.isLoading = false;
          this.toastr.error('Error', err.error.err);
        }
      )
    );
  }
  editProblem() {
    this.isLoading = true;

    const problem = this.getProblemFromForm();
    this.problemService.editProblem(problem, this.problemId).subscribe(
      (res: any) => {
        this.isLoading = false;
        this.toastr.success('Success', 'Problem Updated successfully!');
        this.problemService.triggerUpdateInProblem(problem);
        this.problemService.updateRecentActivity(
          `You edited ${problem.problemName}`
        );
      },
      (err) => {
        this.isLoading = false;
        this.toastr.error('Error', err.error.err);
      }
    );
  }
  onTagChange(event) {
    this.addProblemForm.get('tags').patchValue(event.target.value);
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
