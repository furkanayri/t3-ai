import fs from "fs";
import path from "path";
import XLSX from "xlsx";

export const YY25_EXPECTED_QUESTION_COUNT = 13;
export const YY25_WORKSHEET_NAME = "YY Video Mülakat Soruları";
export const YY25_DEFAULT_WORKBOOK = "YY'25_VİDEO MÜLAKAT SORULARI.xlsx";

export interface YY25RubricLevel {
  level: number;
  label: string;
  description: string;
}

export interface YY25QuestionDefinition {
  index: number;
  category: string;
  competency: string;
  question: string;
  rubric: YY25RubricLevel[];
  evaluationCriteria: string;
}

export interface YY25ResponseDefinition {
  index: number;
  targetLevel: number;
  fileKey: string;
  answer: string;
}

export interface YY25ResponseManifest {
  interviewName: string;
  persona: string;
  voice: string;
  responses: YY25ResponseDefinition[];
}

function clean(value: unknown) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

export function resolveYY25WorkbookPath() {
  return path.resolve(process.env.YY25_INTERVIEW_WORKBOOK || YY25_DEFAULT_WORKBOOK);
}

export function resolveYY25ManifestPath() {
  return path.resolve(
    process.env.YY25_INTERVIEW_MANIFEST || "fixtures/yy25VideoInterviewResponses.json",
  );
}

export function loadYY25ResponseManifest(): YY25ResponseManifest {
  const manifestPath = resolveYY25ManifestPath();
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as YY25ResponseManifest;

  if (!manifest.interviewName || !manifest.voice || !Array.isArray(manifest.responses)) {
    throw new Error(`Invalid YY'25 response manifest: ${manifestPath}`);
  }
  if (manifest.responses.length !== YY25_EXPECTED_QUESTION_COUNT) {
    throw new Error(
      `YY'25 manifest must contain ${YY25_EXPECTED_QUESTION_COUNT} responses, found ${manifest.responses.length}`,
    );
  }

  const expectedLevels = [5, 4, 3, 2, 1, 5, 4, 3, 2, 1, 5, 3, 1];
  const fileKeys = new Set<string>();
  manifest.responses.forEach((response, offset) => {
    const expectedIndex = offset + 1;
    if (response.index !== expectedIndex) {
      throw new Error(`YY'25 response ${offset + 1} must have index ${expectedIndex}`);
    }
    if (response.targetLevel !== expectedLevels[offset]) {
      throw new Error(
        `YY'25 response ${expectedIndex} must target level ${expectedLevels[offset]}`,
      );
    }
    if (!/^yy25-answer-\d{2}\.webm$/.test(response.fileKey)) {
      throw new Error(`Unsafe YY'25 file key: ${response.fileKey}`);
    }
    if (fileKeys.has(response.fileKey)) {
      throw new Error(`Duplicate YY'25 file key: ${response.fileKey}`);
    }
    if (!clean(response.answer)) {
      throw new Error(`YY'25 response ${expectedIndex} has no answer text`);
    }
    fileKeys.add(response.fileKey);
  });

  return manifest;
}

export function parseYY25Workbook(
  workbookPath = resolveYY25WorkbookPath(),
): YY25QuestionDefinition[] {
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`YY'25 workbook was not found: ${workbookPath}`);
  }

  const workbook = XLSX.readFile(workbookPath);
  const worksheetName = workbook.SheetNames.includes(YY25_WORKSHEET_NAME)
    ? YY25_WORKSHEET_NAME
    : workbook.SheetNames[0];
  const worksheet = workbook.Sheets[worksheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  const questions: YY25QuestionDefinition[] = [];
  let currentCategory = "";

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const category = clean(row[0]);
    const competency = clean(row[1]);
    const question = clean(row[2]);

    if (category) currentCategory = category;
    if (!question) continue;

    const rubric: YY25RubricLevel[] = [];
    for (let rubricRowIndex = rowIndex; rubricRowIndex < rows.length; rubricRowIndex += 1) {
      const rubricRow = rows[rubricRowIndex];
      if (rubricRowIndex > rowIndex && clean(rubricRow[2])) break;

      const label = clean(rubricRow[3]);
      const description = clean(rubricRow[4]);
      const levelMatch = label.match(/^([1-5])\s*-/);
      if (levelMatch && description) {
        rubric.push({
          level: Number(levelMatch[1]),
          label,
          description,
        });
      }
      if (rubric.length === 5) break;
    }

    rubric.sort((left, right) => right.level - left.level);
    const actualLevels = rubric.map((item) => item.level).join(",");
    if (actualLevels !== "5,4,3,2,1") {
      throw new Error(
        `Question at Excel row ${rowIndex + 1} must contain rubric levels 5,4,3,2,1; found ${actualLevels || "none"}`,
      );
    }

    questions.push({
      index: questions.length + 1,
      category: currentCategory,
      competency,
      question,
      rubric,
      evaluationCriteria: rubric
        .map((item) => `${item.label}: ${item.description}`)
        .join("\n"),
    });
  }

  if (questions.length !== YY25_EXPECTED_QUESTION_COUNT) {
    throw new Error(
      `YY'25 workbook must contain ${YY25_EXPECTED_QUESTION_COUNT} questions, found ${questions.length}`,
    );
  }
  if (new Set(questions.map((item) => item.question)).size !== questions.length) {
    throw new Error("YY'25 workbook contains duplicate question text");
  }

  return questions;
}
