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

      const submissions = testCases.map((input, output) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResult = await submissionBatch(submissions);

      const tokens = submissionResult.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return NextResponse.json(
            {
              error: "validation failed for ${language}",
              testCase: {
                input: submissions[i].stdin,
                expected_output: submissions[i].expected_output,
                actualOutput: result.stdout,
                error: result.stderr || result.compile_output,
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
        testCases,
        codeSnippets,
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
