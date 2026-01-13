import { pollBatchResults, submissionBatch } from "@/lib/judge0";
import { currentUserRole, getCurrentuser } from "@/modules/auth/actions";
import { currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getJudge0LanguageId } from "@/lib/judge0";

export async function POST(request) {
  try {
    const userRole = await currentUserRole();
    const user = await getCurrentuser();

    if (userRole !== UserRole.ADMIN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      hints,
      testCases,
      codeSnippets,
      referenceSolutions,
    } = body;

    // Basic Validation
    if (
      !title ||
      !description ||
      !difficulty ||
      !testCases ||
      !codeSnippets ||
      !referenceSolutions
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate Test cases
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { message: "Atleast one test case is required" },
        { status: 400 }
      );
    }

    if (!referenceSolutions || typeof referenceSolutions !== "object") {
      return NextResponse.json(
        { message: "Reference solutions is required" },
        { status: 400 }
      );
    }

    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return NextResponse.json(
          { message: "Invalid language" },
          { status: 400 }
        );
      }

      const submissions = testCases.map((tc) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: tc.input,
        expected_output: tc.output,
      }));

      const submissionResult = await submissionBatch(submissions);
      const tokens = submissionResult.map((res) => res.token);
      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const expectedOutput = testCases[i].output.trim();
        const actualOutput = (result.stdout || "").trim();

        const isInternalError =
          result.status.id === 13 || result.status.id === 14;
        const isOutputMismatch =
          result.status.id === 3 && actualOutput !== expectedOutput;

        if (isOutputMismatch || (result.status.id !== 3 && !isInternalError)) {
          return NextResponse.json(
            {
              error: `Validation failed for ${language} on test case ${i + 1}`,
              testCase: {
                input: testCases[i].input,
                expected_output: expectedOutput,
                actualOutput: actualOutput,
                status: result.status.description,
                error: result.stderr || result.compile_output || result.message,
              },
              details: result,
            },
            { status: 400 }
          );
        }
      }
    }

    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        hints,
        testCases,
        codeSnippet: codeSnippets,
        referenceSolutions,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newProblem,
        message: "Problem created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create problem", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
