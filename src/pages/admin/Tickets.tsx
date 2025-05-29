import React, { useState, useEffect } from "react";
import { MessageCircleMore, Search, MessageCircleReply } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useTicketStore } from "../../store/ticketStore";
import { formatDistance } from "date-fns";
import ReplyModal from "../../components/tickets/ReplyModal";
import ChatPanel from "../../components/tickets/ChatPanel";

const Tickets: React.FC = () => {
  const {
    tickets,
    fetchTickets,
    sendMessage,
    updateTicket,
    selectTicket,
    resetUnreadCount,
  } = useTicketStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any>(null);

  const handleReply = (ticket: any) => {
    setActiveTicket(ticket);
    selectTicket(ticket);
    setIsReplyOpen(true);
  };

  const handleChat = (ticket: any) => {
    setActiveTicket(ticket);
    selectTicket(ticket);
    resetUnreadCount(ticket.id);
    setIsChatOpen(true);
  };

  const handleReplySubmit = (message: string, imageUrl?: string) => {
    sendMessage(activeTicket.id, message, true, imageUrl);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.subject
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || ticket.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    await updateTicket(ticketId, { status: newStatus as any });
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

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="md:p-6 p-2">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>

        <div className="flex items-center space-x-1 md:space-x-4 mt-4 md:mt-0">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search tickets..."
              className="input pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="input py-2"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <Card className="md:p-6 p-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="text-left border-b border-neutral-800">
                <th className="px-2 md:px-6 py-3 text-sm font-medium text-neutral-400">
                  Ticket
                </th>
                <th className="px-2 md:px-6 py-3 text-sm font-medium text-neutral-400">
                  Status
                </th>
                <th className="px-2 md:px-6 py-3 text-sm font-medium text-neutral-400">
                  Priority
                </th>
                <th className="px-2 md:px-6 py-3 text-sm font-medium text-neutral-400">
                  Created
                </th>
                <th className="px-2 md:px-6 py-3 text-sm font-medium text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-neutral-800 hover:bg-neutral-800/30"
                  >
                    <td className="px-2 md:px-6 py-4">
                      <div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-neutral-400">
                          {ticket.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-4">
                      <select
                        className={`px-2 py-1 rounded-full text-xs ${
                          ticket.status === "open"
                            ? "bg-warning/20 text-warning"
                            : ticket.status === "in_progress"
                            ? "bg-primary/20 text-primary"
                            : "bg-success/20 text-success"
                        }`}
                        value={ticket.status}
                        onChange={(e) =>
                          handleStatusChange(ticket.id, e.target.value)
                        }
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-2 md:px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getPriorityClass(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-2 md:px-6 py-4">
                      <span className="text-sm text-neutral-400">
                        {formatDistance(
                          new Date(ticket.created_at),
                          new Date(),
                          { addSuffix: true }
                        )}
                      </span>
                    </td>
                    <td className="px-2 md:px-6 py-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                        onClick={() => {
                          handleReply(ticket);
                        }}
                      >
                        <MessageCircleReply size={16} className="mr-2" />
                        Reply
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="relative flex items-center"
                        onClick={() => {
                          handleChat(ticket);
                        }}
                      >
                        <div className="relative">
                          <MessageCircleMore size={16} className="mr-2" />
                          {ticket.unread_count > 0 && (
                            <span className="absolute -top-[16px] -right-[45px] min-w-[16px] h-[16px] bg-red-500 text-white text-xs rounded-full px-1 flex items-center justify-center">
                              {ticket.unread_count}
                            </span>
                          )}
                        </div>
                        Chat
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-neutral-400">
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ReplyModal
          isOpen={isReplyOpen}
          onClose={() => setIsReplyOpen(false)}
          onSubmit={handleReplySubmit}
          ticketSummary={activeTicket?.subject}
          ticketContent={activeTicket?.description}
        />
      </Card>
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        ticket={activeTicket}
      />
    </div>
  );
};

export default Tickets;
