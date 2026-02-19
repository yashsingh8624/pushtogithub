import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useDealerAuth } from "@/context/DealerAuthContext";
import { useNavigate } from "react-router-dom";
import { OrderDetails } from "@/types/store";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";

const WHATSAPP_NUMBER = "918624091826";

const ORDER_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzxV9RXuVtsx0ZJyOcCeMp8atn2LVIo5UNaYsjOsWFkvkXJxJewYVeazPBnK32pr_M/exec";

const orderSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone number required").max(15),
});

async function saveOrderToSheet(form: OrderDetails, items: { name: string; qty: number; price: number }[]) {
  for (const item of items) {
    await fetch(ORDER_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "ORD" + Date.now(),
        name: form.name,
        phone: form.phone,
        product: item.name,
        quantity: item.qty,
        price: item.price,
        total: item.price * item.qty,
      }),
    });
  }
}

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { isDealer } = useDealerAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<OrderDetails>({ name: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const moqViolations = cart.filter(
    (item) => item.minimumOrder && item.qty < item.minimumOrder
  );

  if (cart.length === 0 || moqViolations.length > 0) {
    navigate("/cart");
    return null;
  }

  const handleChange = (field: keyof OrderDetails, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const result = orderSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    return true;
  };

  const getItemLines = () =>
    cart.map((item) => `• ${item.name} x${item.qty} = ₹${item.price * item.qty}`).join("\n");

  const cartItems = cart.map((item) => ({ name: item.name, qty: item.qty, price: item.price }));

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      await saveOrderToSheet(form, cartItems);

      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const message = `🛒 *New Order*\n\n*Order ID:* ${orderId}\n*Name:* ${form.name}\n*Phone:* ${form.phone}\n\n*Items:*\n${getItemLines()}\n\n*Total: ₹${totalPrice}*`;

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      clearCart();
      toast.success("Order Placed Successfully. We will contact you soon.");
      navigate("/order-success", { state: { orderId, total: totalPrice } });
    } catch (err) {
      console.error("Order failed:", err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-background border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

          {/* Order Summary */}
          <div className="bg-card rounded-lg p-5 shadow-card mb-6">
            <h2 className="font-display text-lg font-semibold mb-3">Order Summary</h2>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-1.5">
                <span className="text-muted-foreground">
                  {item.name} × {item.qty}
                </span>
                {isDealer && <span className="font-medium">₹{item.price * item.qty}</span>}
              </div>
            ))}
            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              {isDealer ? (
                <span className="text-primary text-lg">₹{totalPrice}</span>
              ) : (
                <span className="text-sm text-muted-foreground">Login for pricing</span>
              )}
            </div>
          </div>

          {/* Order Form */}
          <div className="bg-card rounded-lg p-5 shadow-card space-y-4">
            <h2 className="font-display text-lg font-semibold">Customer Details</h2>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Customer Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={inputClass}
                placeholder="Your full name"
                maxLength={100}
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={inputClass}
                placeholder="10-digit phone number"
                maxLength={15}
              />
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Place Order Button */}
            <div className="space-y-3 mt-2">
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-semibold text-base shadow-button hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? "Placing Order..." : "📦 Place Order"}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Your order will be sent via WhatsApp and saved automatically.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
