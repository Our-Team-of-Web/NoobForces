import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// importing model
import { IProblem } from './problem.model';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

const CLIENT_ID = '1c4f7a4eefc1fb7d99ee812c15951d40';
const CLIENT_SECRET =
  'f95245ad64dbe088ade65fa2b7fa62c37963006da59b93852fd035a280fc99ca';

@Injectable({
  providedIn: 'root',
})
export class ProblemService {
  constructor(private http: HttpClient) {}
  // private properties
  private problems: IProblem[] = [];
  private baseUrl = environment.baseUrl;
  private recentActivityArray: string[] = [];
  private allTags: string[] = [
    'all',
    'array',
    'string',
    'dp',
    'trees',
    'graph',
    'heap',
    'stack',
    'queue',
    'adhoc',
    'matrix',
    'hash',
    'number theory',
    'math',
    'trie',
    'sorting',
    'searching',
  ];
  // public properties
  public recentActivity: Subject<string> = new Subject();
  public getAllRecentActivities: Subject<string[]> = new Subject();
  public getUpdatedProblems: Subject<{ problems: IProblem[]; count?: number }> =
    new Subject();
  // trigger update in problem array
  public triggerUpdateInProblem(problem: IProblem) {
    this.problems.push(problem);
    this.getUpdatedProblems.next({ problems: [...this.problems], count: 1 });
  }
  // trigger update in recent activity
  public triggerUpdateInActivity(activity: string) {}
  httpOptions = {
    headers: new HttpHeaders({
      'auth-token': localStorage.getItem('token'),
      'Access-Control-Allow-Origin': '*',
    }),
  };
  // get all tags accross components
  public getAllTags() {
    return [...this.allTags];
  }
  httpOptionsForFormData = {
    headers: new HttpHeaders({
      'auth-token': localStorage.getItem('token'),
    }),
  };
  public updateRecentActivity(activity: string) {
    console.log('control is here');
    if (this.recentActivityArray.length < 5) {
      this.recentActivityArray.push(activity);
    } else {
      this.recentActivityArray.shift();
      this.recentActivityArray.push(activity);
    }
  }
  public getRecentActivities() {
    return [...this.recentActivityArray];
  }
  compileAndRun(script: string, language: string, input: string) {
    console.log(language);
    console.log(script);
    const data = {
      script: script,
      language,
      stdin: input,
      versionIndex: '3',
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    };
    return this.http.post('http://localhost:4200/api', data, this.httpOptions);
  }
  // getting single problem
  getSingleProblem(id: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'auth-token': localStorage.getItem('token'),
      }),
    };
    return this.http.get(
      `https://noobforces-backend.herokuapp.com/problems/${id}`,
      httpOptions
    );
  }
  // http call for getting all problems
  getAllProblems(
    page: number,
    limit: number,
    difficultyLevel: string,
    tags: string
  ) {
    let url: string;
    // fresh
    if (difficultyLevel === 'ALL' && tags === 'all') {
      url = `${this.baseUrl}problems/?page=${page}&limit=${limit}`;
    } else if (difficultyLevel === 'ALL') {
      url = `${this.baseUrl}problems/?page=${page}&limit=${limit}&tags=${tags}`;
    } else if (tags === 'all') {
      url = `${this.baseUrl}problems/?page=${page}&limit=${limit}&difficultyLevel=${difficultyLevel}`;
    } else {
      url = `${this.baseUrl}problems/?page=${page}&limit=${limit}&difficultyLevel=${difficultyLevel}&tags=${tags}`;
    }
    return this.http.get(url).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.problems = [];
          res.problems.forEach((problem) => {
            const newProblem: IProblem = {
              id: problem._id,
              tags: problem.tags,
              problemName: problem.name,
              problemDescription: problem.statement,
              sampleInput: problem.sampleInput,
              sampleOutput: problem.sampleOutput,
              difficulty: problem.difficultyLevel,
              inputFormat: problem.inputFormat,
              outputFormat: problem.outputFormat,
            };

            this.problems.push(newProblem);
          });
          this.getUpdatedProblems.next({
            problems: [...this.problems],
            count: res.count,
          });
        }
      },
      (err) => {}
    );
  }
  // adding problem
  addProblem(problem: IProblem) {
    const httpOptionsForFormData = {
      headers: new HttpHeaders({
        'auth-token': localStorage.getItem('token'),
      }),
    };
    const payload = new FormData();

    payload.append('name', problem.problemName);
    payload.append('statement', problem.problemDescription);
    payload.append('difficultyLevel', problem.difficulty.toUpperCase());
    payload.append('sampleInput', problem.sampleInput);
    payload.append('sampleOutput', problem.sampleOutput);
    payload.append('input', problem.inputTestcase);
    payload.append('output', problem.outputTestcase);
    payload.append('tags', problem.tags);
    payload.append('inputFormat', problem.inputFormat);
    payload.append('outputFormat', problem.outputFormat);

    console.log(localStorage.getItem('token'));
    return this.http.post(
      `https://noobforces-backend.herokuapp.com/problems`,
      payload,
      httpOptionsForFormData
    );
  }
  submitSolution(
    script: string,
    language: string,
    versionIndex: string,
    problemId: string
  ) {
    const httpOptions = {
      headers: new HttpHeaders({
        'auth-token': localStorage.getItem('token'),
      }),
    };
    const data = {
      script,
      language,
      versionIndex,
    };
    return this.http.post(
      `${this.baseUrl}problems/${problemId}`,
      data,
      httpOptions
    );
  }
  editProblem(problem: IProblem, id: string) {
    const httpOptionsForFormData = {
      headers: new HttpHeaders({
        'auth-token': localStorage.getItem('token'),
      }),
    };
    const payload = new FormData();

    payload.append('statement', problem.problemDescription);
    payload.append('difficultyLevel', problem.difficulty.toUpperCase());
    payload.append('sampleInput', problem.sampleInput);
    payload.append('sampleOutput', problem.sampleOutput);
    payload.append('tags', problem.tags);
    payload.append('inputFormat', problem.inputFormat);
    payload.append('outputFormat', problem.outputFormat);
    if (problem.inputTestcase) {
      payload.append('input', problem.inputTestcase);
    }
    if (problem.outputTestcase) {
      payload.append('output', problem.outputTestcase);
    }

    return this.http.patch(
      `https://noobforces-backend.herokuapp.com/problems/${id}`,
      payload,
      httpOptionsForFormData
    );
  }
  deleteProblem(problemId: string) {
    return this.http.delete(
      `https://noobforces-backend.herokuapp.com/problems/${problemId}`,
      this.httpOptions
    );
  }
}
