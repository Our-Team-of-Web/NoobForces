import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SubSink } from 'subsink';
import { ToastrService } from 'ngx-toastr';
import * as ace from 'ace-builds';
// languages imports
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
// theme imports
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-cobalt';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/theme-eclipse';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import 'ace-builds/src-noconflict/theme-solarized_light';
// extended language feature
import 'ace-builds/src-noconflict/ext-language_tools';

// importing services
import { ProblemService } from '../problem.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IProblem } from '../problem.model';

@Component({
  selector: 'app-view-problem',
  templateUrl: './view-problem.component.html',
  styleUrls: ['./view-problem.component.css'],
})
export class ViewProblemComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  public languages = {
    c_cpp: { aceEditor: 'ace/mode/c_cpp', jdoodle: 'cpp14', versionIndex: 3 },
    python: {
      aceEditor: 'ace/mode/python',
      jdoodle: 'python3',
      versionIndex: 3,
    },
    java: { aceEditor: 'ace/mode/java', jdoodle: 'java', versionIndex: 3 },
  };
  public resultArriver: boolean = false;
  public availableFontSizes = [0, 2, 4, 6, 8, 10];
  public problemId: string;
  public isLoading: boolean = true;
  public isSubmitted: boolean = false;
  public isLoadingCompile: boolean = false;
  public problem: IProblem = {
    id: null,
    problemName: null,
    problemDescription: null,
    sampleInput: null,
    sampleOutput: null,
    inputFormat: null,
    outputFormat: null,
    inputTestcase: null,
    outputTestcase: null,
    tags: null,
    difficulty: null,
  };
  public isCustomInputClicked: boolean = true;
  public isOutputClicked: boolean = false;
  public themes = [
    { name: 'monokai', theme: 'ace/theme/monokai' },
    { name: 'github', theme: 'ace/theme/github' },
    { name: 'cobalt', theme: 'ace/theme/cobalt' },
    { name: 'xcode', theme: 'ace/theme/xcode' },
    { name: 'textmate', theme: 'ace/theme/textmate' },
    { name: 'eclipse', theme: 'ace/theme/eclipse' },
    { name: 'solarizerdDark', theme: 'ace/theme/solarized_dark' },
    { name: 'solarizedLight', theme: 'ace/theme/solarized_light' },
  ];
  private selectedLanguage = 'cpp14';
  private subs = new SubSink();

  constructor(
    private problemService: ProblemService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}
  ngAfterViewChecked(): void {
    // console.log(this.sampleInput);
  }

  @ViewChild('codeEditor', { static: true }) codeEditorElmRef: ElementRef;
  @ViewChild('input', { static: true }) progarmInput: ElementRef;
  @ViewChild('output', { static: true }) progarmOutput: ElementRef;
  @ViewChild('sampleInput', { static: true }) sampleInput: ElementRef;
  @ViewChild('sampleOutput', { static: true }) sampleOutput: ElementRef;
  private codeEditor: ace.Ace.Editor;

  ngOnInit() {
    this.init();
  }
  private init() {
    ace.require('ace/ext/language_tools');
    const editorOptions = this.getEditorOptions();

    const element = this.codeEditorElmRef.nativeElement;

    this.codeEditor = ace.edit(element, editorOptions);
    this.codeEditor.setTheme('ace/theme/monokai');
    this.codeEditor.getSession().setMode(this.languages['c_cpp'].aceEditor);
    this.codeEditor.setShowFoldWidgets(true); // for the scope fold feature
    // getting problem id
    this.route.paramMap.subscribe((params) => {
      this.problemId = params.get('id');
      this.problemService
        .getSingleProblem(this.problemId)
        .subscribe((res: any) => {
          if (res.status === 'success') {
            this.isLoading = false;
            this.problem = {
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

            this.sampleInput.nativeElement.value = this.problem.sampleInput;
            this.sampleOutput.nativeElement.value = this.problem.sampleOutput;
            if (this.sampleInput) {
              // this.sampleInput.nativeElement.value = this.problem.sampleInput;
            }
            if (this.sampleOutput) {
              this.sampleOutput.nativeElement.value = this.problem.sampleOutput;
            }
          }
        });
    });
  }
  private getEditorOptions(): Partial<ace.Ace.EditorOptions> & {
    enableBasicAutocompletion?: boolean;
  } {
    const basicEditorOptions: Partial<ace.Ace.EditorOptions> = {
      highlightActiveLine: true,
      autoScrollEditorIntoView: true,
      wrap: true,
      minLines: 21,
      maxLines: 21,
      fontSize: 16,
    };

    const extraEditorOptions = {
      enableBasicAutocompletion: true,
    };
    const margedOptions = Object.assign(basicEditorOptions, extraEditorOptions);
    return margedOptions;
  }
  onChangeLanguage(selectedLanguage) {
    const language = this.languages[selectedLanguage].aceEditor;
    this.selectedLanguage = this.languages[selectedLanguage].jdoodle;

    this.codeEditor.getSession().setMode(language);
  }
  onChangeFontSize(fontSize) {
    // this.codeEditor.getSession().setMode(+fontSize);
    this.codeEditor.setFontSize(fontSize + 'pt');
  }
  onChangeTheme(selectedTheme) {
    const theme = this.themes.find((theme) => {
      return theme.name === selectedTheme;
    });
    this.codeEditor.setTheme(theme.theme);
  }
  onComplie() {
    const input = this.progarmInput.nativeElement.value;
    let words = this.codeEditor.getSession().getValue();
    // words = words.split('\n').join('\\n');

    if (input && words) {
      this.isLoadingCompile = true;
      this.problemService
        .compileAndRun(words, this.selectedLanguage, input)
        .subscribe(
          (res: any) => {
            this.isLoadingCompile = false;
            this.progarmOutput.nativeElement.value = res.output;
            this.outputClicked();
            this.problemService.updateRecentActivity(
              `Compiled ${this.problem.problemName}`
            );
          },
          (err) => {
            this.isLoadingCompile = false;
            this.toastr.error('Something wrong happend...try again!');
          }
        );
    }
  }
  customInputClicked() {
    this.isCustomInputClicked = true;
    this.isOutputClicked = false;
  }
  outputClicked() {
    this.isCustomInputClicked = false;
    this.isOutputClicked = true;
  }
  submitSolution() {
    this.isSubmitted = true;
    const script = this.codeEditor.getSession().getValue();
    const language = this.selectedLanguage;
    const id = this.problem.id;
    this.problemService.submitSolution(script, language, '1', id).subscribe(
      (res: any) => {
        this.isSubmitted = false;
        this.outputClicked();
        if (res.op === 'AC') {
          this.progarmOutput.nativeElement.value =
            'Correct Answer...Solution Submitted';
          this.progarmOutput.nativeElement.style.color = 'green';
          this.problemService.updateRecentActivity(
            `Submitted ${this.problem.problemName}`
          );
        } else if (res.op === 'WA') {
          this.progarmOutput.nativeElement.value = 'Wrong Answer...try again!';
          this.progarmOutput.nativeElement.style.color = 'red';
          this.problemService.updateRecentActivity(
            `Submitted ${this.problem.problemName}`
          );
        } else {
          this.progarmOutput.nativeElement.value = `${res.op}...try again!`;
          this.progarmOutput.nativeElement.style.color = 'yellow';
          this.problemService.updateRecentActivity(
            `Submitted ${this.problem.problemName}`
          );
        }
      },
      (err) => {
        this.isSubmitted = false;
        if (err.error.err) {
          this.toastr.error(err.error.err);
        } else {
          this.toastr.error('Something wrong happend!');
        }
      }
    );
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
