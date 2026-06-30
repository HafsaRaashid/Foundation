import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTicketSchema } from "@/lib/schemas/ticket";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = createTicketSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const ticket = await prisma.ticket.create({ data: result.data });
  return NextResponse.json(ticket, { status: 201 });
}

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
