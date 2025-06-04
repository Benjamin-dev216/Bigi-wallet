import React, { useState } from "react";
import Modal from "../common/Modal";
import { Image as ImageIcon, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../store/authStore";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string, imageUrl?: string) => void;
  ticketSummary?: string;
  ticketContent?: string;
}

const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  ticketSummary,
  ticketContent,
}) => {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 5242880, // 5MB
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!message.trim() && !selectedFile) return;

    let imageUrl = "";
    if (selectedFile) {
      setUploading(true);
      try {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `ticket-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("tickets")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("tickets").getPublicUrl(filePath);

        imageUrl = publicUrl;
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setUploading(false);
      }
    }

    onSubmit(message.trim(), imageUrl);
    setMessage("");
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const cancelImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reply to: ${ticketSummary}`}
    >
      <div className="space-y-4">
        {ticketContent && (
          <div className="p-3 rounded-md bg-[rgb(var(--background-light))] border border-neutral-700 text-sm text-[rgb(var(--text))] whitespace-pre-wrap">
            {ticketContent}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Your Message</label>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 rounded-md bg-[rgb(var(--background-light))] border border-neutral-700 text-sm text-[rgb(var(--text))] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {previewUrl && (
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Upload preview"
              className="h-20 w-auto rounded"
            />
            <button
              onClick={cancelImage}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            <button
              type="button"
              className="px-3 py-2 bg-[rgb(var(--background))] hover:bg-[rgb(var(--background-light))] text-[rgb(var(--text))] rounded-lg transition-colors"
            >
              <ImageIcon size={20} />
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-[rgb(var(--background))] hover:bg-[rgb(var(--background-light))] text-sm text-[rgb(var(--text))]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={(!message.trim() && !selectedFile) || uploading}
              className="px-4 py-2 rounded-md bg-primary hover:bg-primary/80 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Reply
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReplyModal;
