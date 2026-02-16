import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  src: string | null;
  onClose: () => void;
}

export default function ImageZoomModal({ src, onClose }: Props) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-card p-2 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          <motion.img
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            src={src}
            alt="Zoomed product"
            className="max-w-full max-h-[85vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
