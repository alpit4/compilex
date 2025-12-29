import { PrismaClient } from "@prisma/client";

const globalforPrisma = globalThis;

export const db = globalforPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalforPrisma.prisma = db;
