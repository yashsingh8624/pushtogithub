import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "918624091826";

export default function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Aakash Traders!")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[hsl(142,70%,45%)] text-[hsl(0,0%,100%)] p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
