// components/tickets/ChatPanel.tsx
import React from "react";
import { X } from "lucide-react";
import TicketChat from "./TicketChat";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, ticket }) => {
  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-sm bg-[rgb(var(--background))] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside panel
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold">Ticket Chat</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-neutral-400 hover:text-white" />
          </button>
        </div>
        <div className="p-4 space-y-2 h-[calc(100%-7rem)]">
          <p className="text-sm text-neutral-400">
            <strong>Subject:</strong> {ticket?.subject}
          </p>
          <p className="text-sm text-neutral-300">{ticket?.description}</p>
          <div className="h-full">
            <TicketChat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
