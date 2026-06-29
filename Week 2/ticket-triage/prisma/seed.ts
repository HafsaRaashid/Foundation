import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fixtures from "./fixtures/tickets.json";

const url = process.env["DATABASE_URL"] ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const ticket of fixtures) {
    await prisma.ticket.upsert({
      where: { id: ticket.id },
      update: {
        title: ticket.title,
        priority: ticket.priority ?? null,
        owner: ticket.owner ?? null,
        status: ticket.status ?? "open",
      },
      create: {
        id: ticket.id,
        title: ticket.title,
        priority: ticket.priority ?? null,
        owner: ticket.owner ?? null,
        status: ticket.status ?? "open",
      },
    });
  }
  console.log(`Seeded ${fixtures.length} tickets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
