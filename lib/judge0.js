import axios from "axios";

export function getJudge0LanguageId(language) {
  const languageMap = {
    PYTHON: 71,
    JAVASCRIPT: 63,
    JAVA: 62,
    CPP: 54,
    GO: 60,
  };
  return languageMap[language.toUpperCase()];
}

export function getLanguageName(languageId) {
  const LANGUAGE_NAMES = {
    74: "TypeScript",
    63: "JavaScript",
    71: "Python",
    62: "Java",
  };
  return LANGUAGE_NAMES[languageId] || "Unknown";
}

export async function submissionBatch(submissions) {
  try {
    // Base64 encode all source_code and stdin
    const encodedSubmissions = submissions.map((s) => {
      const payload = {
        source_code: Buffer.from(s.source_code || "").toString("base64"),
        language_id: s.language_id,
      };

      if (s.stdin && s.stdin.trim() !== "") {
        payload.stdin = Buffer.from(s.stdin).toString("base64");
      }

      if (s.expected_output && s.expected_output.trim() !== "") {
        payload.expected_output = Buffer.from(s.expected_output).toString(
          "base64",
        );
      }

      return payload;
    });

    const baseUrl = process.env.JUDGE0_API_URL.replace(/\/$/, "");
    const url = `${baseUrl}/submissions/batch?base64_encoded=true`;

    const { data } = await axios.post(url, { submissions: encodedSubmissions });
    return data;
  } catch (error) {
    throw error;
  }
}

export async function pollBatchResults(tokens) {
  while (true) {
    const { data } = await axios.get(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: true,
        },
      },
    );
    const results = data.submissions;

    // Base64 decode stdout, stderr, compile_output, and message
    const decodedResults = results.map((r, i) => {
      const decoded = {
        ...r,
        stdout: r.stdout
          ? Buffer.from(r.stdout, "base64").toString("utf-8")
          : r.stdout,
        stderr: r.stderr
          ? Buffer.from(r.stderr, "base64").toString("utf-8")
          : r.stderr,
        compile_output: r.compile_output
          ? Buffer.from(r.compile_output, "base64").toString("utf-8")
          : r.compile_output,
        message: r.message
          ? Buffer.from(r.message, "base64").toString("utf-8")
          : r.message,
      };

      return decoded;
    });

    const isAllDone = decodedResults.every(
      (r) => r.status && r.status.id !== 1 && r.status.id !== 2,
    );

    if (isAllDone) return decodedResults;
    await sleep(1000);
  }
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Submit batch of submissions to Judge0
export async function submitBatch(submissions) {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    { submissions },
  );
  console.log("Batch submission response:", data);
  return data;
}
