import React, { useEffect } from "react";
import { useTicketStore } from "../../store/ticketStore";
import { formatDistance } from "date-fns";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

const TicketList: React.FC = () => {
  const { tickets, fetchTickets, selectTicket } = useTicketStore();

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle size={16} className="text-warning" />;
      case "in_progress":
        return <Clock size={16} className="text-primary" />;
      case "resolved":
        return <CheckCircle size={16} className="text-success" />;
      default:
        return <CheckCircle size={16} className="text-neutral-400" />;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-error/20 text-error";
      case "high":
        return "bg-warning/20 text-warning";
      case "medium":
        return "bg-primary/20 text-primary";
      default:
        return "bg-success/20 text-success";
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center py-8">
  //       <Loader className="animate-spin text-primary\" size={24} />
  //     </div>
  //   );
  // }

  if (!tickets.length) {
    return (
      <div className="text-center py-8 text-neutral-400">
        <p>No tickets found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-[rgb(var(--background-light))] p-4 rounded-lg border hover:border-neutral-700 transition-all cursor-pointer"
          onClick={() => selectTicket(ticket)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getStatusIcon(ticket.status)}
              <div>
                <h3 className="font-medium">{ticket.subject}</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  {ticket.description.substring(0, 100)}
                  {ticket.description.length > 100 ? "..." : ""}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs ${getPriorityClass(
                  ticket.priority
                )}`}
              >
                {ticket.priority}
              </span>
              <p className="text-xs text-neutral-400 mt-1">
                {formatDistance(new Date(ticket.created_at), new Date(), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketList;
