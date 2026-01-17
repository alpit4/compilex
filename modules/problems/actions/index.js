"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { currentUserRole } from "@/modules/auth/actions";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
