import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(tickets);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
