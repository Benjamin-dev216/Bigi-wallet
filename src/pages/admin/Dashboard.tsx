import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Ticket } from "lucide-react";
import Card from "../../components/ui/Card";
import { useAdminStore } from "../../store/adminStore";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, userState, ticketState, fetchUsers, fetchTickets } =
    useAdminStore();
  const stats = [
    {
      title: "Total Users",
      value: userState?.value.toString() ?? 0,
      change: `+${userState?.change.toFixed(2) ?? 0}`,
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "Open Tickets",
      value: ticketState?.value.toString() ?? 0,
      change: `+${ticketState?.change.toFixed(2) ?? 0}`,
      icon: Ticket,
      path: "/admin/tickets",
    },
  ];
  const shortAddress = (address: string) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
    fetchUsers();
    fetchTickets();
  }, []);

  return (
    <div className="p-2 py-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => navigate(stat.path)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                  <p
                    className={`text-sm mt-1 ${
                      stat.change.startsWith("+")
                        ? "text-success"
                        : "text-error"
                    }`}
                  >
                    {stat.change} % from last week
                  </p>
                </div>
                <Icon className="text-primary" size={24} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1  gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Recent Support Tickets</h2>
          <div className="space-y-4">
            {tickets.slice(0, 3).map((ticket, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 border-b border-neutral-800"
              >
                <div>
                  <p className="font-medium text-[rgb(var(--text))]">
                    {ticket.subject}
                  </p>
                  <p className="text-sm text-neutral-400">
                    User ID: {shortAddress(ticket.user_id)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getPriorityClass(
                    ticket.priority
                  )}`}
                >
                  {ticket.priority}
                </span>
              </div>
            ))}
          </div>
          <button
            className="mt-4 text-primary hover:text-primary-light text-sm"
            onClick={() => navigate("/admin/tickets")}
          >
            View All Tickets
          </button>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
