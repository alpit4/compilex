import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { currentUserRole } from "@/modules/auth/actions";
import { UserRole } from "@prisma/client";

export const getAllProblems = async () => {
  try {
    const user = await currentUser();
    const userRole = await currentUserRole();

    if (userRole !== userRole.ADMIN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
      },
    });

    const problems = await db.problem.findMany({
      include: {
        solvedBy: {
          where: {
            userId: data.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: problems };
  } catch (error) {
    console.error("Failed to get all problems", error);
    return { success: false, error: error.message };
  }
};

export const getProblemById = async (id) => {
  try {
    const problem = await db.problem.findUnique({
      where: {
        id: id,
      },
    });

    if (!problem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 404 }
      );
    }

    return { success: true, data: problem };
  } catch (error) {
    console.error("Failed to get problem by id", error);
    return { success: false, error: error.message };
  }
};

export const deleteProblem = async (problemId) => {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const problem = await db.problem.delete({
      where: {
        id: problemId,
      },
    });

    return { success: true, data: problem };
  } catch (error) {
    console.error("Failed to delete problem by id", error);
    return { success: false, error: error.message };
  }
};
