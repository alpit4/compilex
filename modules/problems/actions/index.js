"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { currentUserRole } from "@/modules/auth/actions";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { stdin } from "process";

export const getAllProblems = async () => {
  try {
    const user = await currentUser();

    let dbUser = null;
    if (user) {
      dbUser = await db.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          id: true,
        },
      });
    }

    const problems = await db.problem.findMany({
      include: {
        solvedBy: dbUser
          ? {
              where: {
                userId: dbUser.id,
              },
            }
          : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: problems };
  } catch (error) {
    console.error("Failed to get all problems", error);
    return { success: false, error: "Failed to fetch problems" };
  }
};

export const getProblemById = async (id) => {
  try {
    const problem = await db.problem.findUnique({
      where: {
        id: id,
      },
    });

    return { success: true, data: problem };
  } catch (error) {
    console.error("Failed to get problem by id", error);
    return { success: false, error: "Failed to fetch problem" };
  }
};

export const deleteProblem = async (problemId) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const dbUser = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        role: true,
      },
    });

    if (dbUser?.role !== UserRole.ADMIN) {
      throw new Error("Only admins can delete problems");
    }

    await db.problem.delete({
      where: {
        id: problemId,
      },
    });

    revalidatePath("/problems");
    return { success: true, message: "Problem deleted successfully" };
  } catch (error) {
    console.error("Failed to delete problem by id", error);
    return { success: false, error: error.message };
  }
};

export const executeCode = async (
  source_code,
  language_id,
  stdin,
  expected_outputs,
  id,
) => {
  const user = await currentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const dbUser = await db.user.findUnique({
    where: {
      clerkId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!dbUser) {
    return { success: false, error: "User not found" };
  }

  if (
    !Array.isArray(stdin) ||
    stdin.length == 0 ||
    !Array.isArray(expected_outputs) ||
    expected_outputs.length !== stdin.length
  ) {
    return { success: false, error: "Invalid test cases" };
  }

  const submissions = stdin.map((input) => {
    return {
      source_code,
      language_id,
      stdin: input,
      wait: false,
    };
  });
};
