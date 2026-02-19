import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { cart, removeFromCart, updateQty, totalPrice, totalItems } = useCart();

  const handleUpdateQty = (id: string, newQty: number, stock?: number) => {
    if (stock !== undefined && newQty > stock) {
      toast.error(`Only ${stock} available in stock.`);
      return;
    }
    updateQty(id, newQty);
  };

  const moqViolations = cart.filter(
    (item) => item.minimumOrder && item.qty < item.minimumOrder
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Browse our collection and add items!</p>
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium shadow-button"
        >
          Shop Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8">
          Your Cart <span className="text-muted-foreground text-lg">({totalItems} items)</span>
        </h1>

        {moqViolations.length > 0 && (
          <div className="mb-4 bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">Minimum order not met:</p>
              {moqViolations.map((item) => (
                <p key={item.id} className="text-muted-foreground">
                  {item.name} requires min. {item.minimumOrder} pcs (currently {item.qty})
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {cart.map((item, i) => {
            const belowMoq = item.minimumOrder && item.qty < item.minimumOrder;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex gap-4 bg-card rounded-lg p-4 shadow-card ${belowMoq ? "ring-2 ring-destructive/40" : ""}`}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-card-foreground truncate">
                    {item.name}
                  </h3>
                  <p className="text-primary font-bold mt-1">₹{item.price}</p>
                  {belowMoq && (
                    <p className="text-destructive text-xs mt-1">
                      Min. order: {item.minimumOrder} pcs
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleUpdateQty(item.id, item.qty - 1, item.stock)}
                      className="h-7 w-7 rounded border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                    <button
                      onClick={() => handleUpdateQty(item.id, item.qty + 1, item.stock)}
                      className="h-7 w-7 rounded border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-destructive hover:text-destructive/80 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <p className="font-bold text-sm">₹{item.price * item.qty}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-card rounded-lg p-6 shadow-card">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-display font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">₹{totalPrice}</span>
          </div>
          <Link
            to="/checkout"
            className={`w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold shadow-button hover:opacity-90 transition-opacity ${
              moqViolations.length > 0 ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
          {moqViolations.length > 0 && (
            <p className="text-xs text-destructive text-center mt-2">
              Fix minimum order quantities above to proceed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
