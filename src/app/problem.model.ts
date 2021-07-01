export interface IProblem {
  id?: string;
  problemName: string;
  problemDescription: string;
  inputFormat: string;
  outputFormat: string;
  sampleInput: string;
  sampleOutput: string;
  difficulty: string;
  tags: string;
  inputTestcase?: File;
  outputTestcase?: File;
  solved?: boolean;
}
