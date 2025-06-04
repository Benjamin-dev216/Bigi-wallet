import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "../ui/Button";
import { useTicketStore } from "../../store/ticketStore";
import { supabase } from "../../store/authStore";
import { useTranslation } from "react-i18next";

interface CreateTicketModalProps {
  onClose: () => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { categories, createTicket, fetchCategories } = useTicketStore();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category_id: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = await supabase.auth.getSession();
    const user = session.data.session?.user;
    await createTicket({ ...formData, user_id: user?.id });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[rgb(var(--background-light))] rounded-xl p-6 w-full max-w-lg border border-neutral-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t("ticket.createTitle")}</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
            aria-label={t("common.close")}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
              {t("ticket.category")}
            </label>
            <select
              className="input w-full"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              required
            >
              <option value="">{t("ticket.selectCategory")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
              {t("ticket.priority")}
            </label>
            <select
              className="input w-full"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value as any })
              }
              required
            >
              <option value="low">{t("ticket.priorities.low")}</option>
              <option value="medium">{t("ticket.priorities.medium")}</option>
              <option value="high">{t("ticket.priorities.high")}</option>
              <option value="urgent">{t("ticket.priorities.urgent")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
              {t("ticket.subject")}
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder={t("ticket.subjectPlaceholder")}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
              {t("ticket.description")}
            </label>
            <textarea
              className="input w-full h-32"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t("ticket.descriptionPlaceholder")}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button variant="primary" type="submit">
              {t("ticket.createButton")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
