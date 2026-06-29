import PrioritySelector from "@/components/PrioritySelector";
import OwnerInput from "@/components/OwnerInput";

interface Ticket {
  id: number;
  title: string;
  priority: string | null;
  owner: string | null;
  status: string;
}

interface Props {
  label: string;
  tickets: Ticket[];
}

export default function PriorityGroup({ label, tickets }: Props) {
  if (tickets.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-base font-semibold text-gray-700">{label}</h2>
        <span className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 min-w-[1.5rem]">
          {tickets.length}
        </span>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500 uppercase text-xs">
            <th className="py-2 pr-4 font-medium">ID</th>
            <th className="py-2 pr-4 font-medium">Title</th>
            <th className="py-2 pr-4 font-medium">Priority</th>
            <th className="py-2 font-medium">Owner</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 pr-4 text-gray-400">{ticket.id}</td>
              <td className="py-3 pr-4 font-medium">{ticket.title}</td>
              <td className="py-3 pr-4">
                <PrioritySelector
                  id={ticket.id}
                  currentPriority={ticket.priority as "P0" | "P1" | "P2" | null}
                />
              </td>
              <td className="py-3">
                <OwnerInput id={ticket.id} currentOwner={ticket.owner} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
