import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Please check the form fields.", issues: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) },
      { status: 400 },
    );
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "That record already exists." }, { status: 409 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "The requested record was not found." }, { status: 404 });
    }
    if (error.code === "P2003") {
      return NextResponse.json({ error: "This change conflicts with related records." }, { status: 409 });
    }
  }
  console.error("API request failed", error instanceof Error ? error.name : "unknown error");
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
