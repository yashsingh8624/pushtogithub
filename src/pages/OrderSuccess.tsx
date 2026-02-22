import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag, Home } from "lucide-react";

export default function OrderSuccess() {
  const location = useLocation();
  const { orderId, total } = (location.state as { orderId?: string; total?: number }) || {};

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl p-8 md:p-12 shadow-card text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <CheckCircle className="h-16 w-16 text-[hsl(142,70%,45%)] mx-auto mb-6" />
        </motion.div>

        <h1 className="font-display text-3xl font-bold mb-2">Order Placed!</h1>
        <p className="text-muted-foreground mb-6">
          Your order has been saved successfully. We'll contact you shortly!
        </p>

        {orderId && (
          <div className="bg-primary/10 border-2 border-primary rounded-xl p-6 mb-6">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Order ID</p>
            <p className="font-mono font-extrabold text-2xl text-primary">{orderId}</p>
            {total !== undefined && <p className="text-foreground font-bold text-xl mt-3">Total: ₹{total}</p>}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            to="/catalogue"
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium shadow-button"
          >
            <ShoppingBag className="h-4 w-4" /> Continue Shopping
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-3 rounded-lg font-medium"
          >
            <Home className="h-4 w-4" /> Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
