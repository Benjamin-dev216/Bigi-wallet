import React, { useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { MessageSquarePlus } from "lucide-react";
import CreateTicketModal from "../components/tickets/CreateTicketModal";
import TicketList from "../components/tickets/TicketList";
import TicketChat from "../components/tickets/TicketChat";
import { useTicketStore } from "../store/ticketStore";

const Support: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { selectedTicket, tickets } = useTicketStore();

  return (
    <div className="container mx-auto p-2 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Support</h1>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center"
        >
          <MessageSquarePlus size={20} className="mr-2" />
          New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-[calc(100vh-12rem)] overflow-hidden p-2 md:p-4">
          <div className="p-0 md:p-4 border-b border-neutral-800">
            <h2 className="text-lg font-semibold">Your Tickets</h2>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
            <TicketList />
          </div>
        </Card>

        <Card className="h-[calc(100vh-12rem)] overflow-hidden p-2 md:p-4 relative">
          <div className="p-0 md:p-4 border-b border-neutral-800">
            <h2 className="text-lg font-semibold">
              {selectedTicket && tickets.length > 1
                ? selectedTicket.subject
                : "Conversation"}
            </h2>
          </div>
          <div className="h-[calc(100%-4rem)]">
            <TicketChat />
          </div>
        </Card>
      </div>

      {showCreateModal && (
        <CreateTicketModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default Support;
