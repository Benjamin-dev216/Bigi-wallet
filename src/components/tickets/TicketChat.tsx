import React, { useState, useEffect, useRef } from "react";
import { useTicketStore } from "../../store/ticketStore";
import { formatDistance } from "date-fns";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../store/authStore";

const TicketChat: React.FC = () => {
  const { selectedTicket, messages, fetchMessages, sendMessage } =
    useTicketStore();
  const { user } = useAuthStore();
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true, // disable click-to-upload
    noKeyboard: true, // disable keyboard trigger
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 5242880,
    multiple: false,
  });

  useEffect(() => {
    const loadMessages = async () => {
      if (selectedTicket) {
        setLoadingMessages(true);
        await fetchMessages(selectedTicket.id);
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [selectedTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!newMessage.trim() && !selectedFile)) return;

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

    await sendMessage(selectedTicket.id, newMessage, false, imageUrl);
    setNewMessage("");
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const cancelImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (!selectedTicket) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-400">
        Select a ticket to view the conversation
      </div>
    );
  }
  return (
    <div {...getRootProps()} className="flex flex-col h-full">
      <input {...getInputProps()} />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
          }
        }}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser
                      ? "bg-primary text-white"
                      : "bg-neutral-700 text-neutral-100"
                  }`}
                >
                  {message.image_url && (
                    <div className="mb-2">
                      <img
                        src={message.image_url}
                        alt="Message attachment"
                        className="rounded-lg max-w-full h-auto cursor-pointer transition hover:opacity-80"
                        style={{ maxHeight: "200px" }}
                        onClick={() => {
                          if (message.image_url) {
                            setImageModalUrl(message.image_url);
                          }
                        }}
                      />
                    </div>
                  )}

                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {formatDistance(new Date(message.created_at), new Date(), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-800">
        {previewUrl && (
          <div className="mb-2 relative inline-block">
            <img
              src={previewUrl}
              alt="Upload preview"
              className="h-20 w-auto rounded"
            />
            <button
              type="button"
              onClick={cancelImage}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
              }
            }}
          />
          <div className="cursor-pointer">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
            >
              <ImageIcon size={20} />
            </button>
          </div>
          <input
            type="text"
            className="input flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message or Drag & drop your image"
            disabled={uploading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            disabled={(!newMessage.trim() && !selectedFile) || uploading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
      {isDragActive && (
        <div className="absolute inset-0 bg-black bg-opacity-20 border-2 border-dashed border-primary rounded-lg pointer-events-none z-50" />
      )}
      {imageModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setImageModalUrl(null)}
        >
          <img
            src={imageModalUrl}
            alt="Full view"
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default TicketChat;
