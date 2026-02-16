import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";
import { useDealerAuth } from "@/context/DealerAuthContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DealerLoginModal({ open, onClose }: Props) {
  const { login } = useDealerAuth();
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast.success("Welcome, Dealer! Wholesale prices are now visible.");
      setPassword("");
      onClose();
    } else {
      toast.error("Invalid dealer password.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-xl p-6 w-full max-w-sm shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Dealer Login</h2>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-secondary rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  Dealer Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter dealer password"
                  autoFocus
                  maxLength={50}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold shadow-button hover:opacity-90 transition-opacity"
              >
                Login
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Contact us to get dealer access credentials.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
