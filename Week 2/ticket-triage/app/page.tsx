import { prisma } from "@/lib/prisma";
import PriorityGroup from "@/components/PriorityGroup";

export default async function Home() {
  const tickets = await prisma.ticket.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "asc" },
  });

  if (tickets.length === 0) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-6">PMO Ticket Triage</h1>
        <p className="text-gray-500">No open tickets.</p>
      </main>
    );
  }

  const p0 = tickets.filter((t) => t.priority === "P0");
  const p1 = tickets.filter((t) => t.priority === "P1");
  const p2 = tickets.filter((t) => t.priority === "P2");
  const untagged = tickets.filter((t) => t.priority === null);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">PMO Ticket Triage</h1>
      <PriorityGroup label="P0" tickets={p0} />
      <PriorityGroup label="P1" tickets={p1} />
      <PriorityGroup label="P2" tickets={p2} />
      <PriorityGroup label="Untagged" tickets={untagged} />
    </main>
  );
}
