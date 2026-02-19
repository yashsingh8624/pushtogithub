import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { OrderDetails } from "@/types/store";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const ORDER_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzxV9RXuVtsx0ZJyOcCeMp8atn2LVIo5UNaYsjOsWFkvkXJxJewYVeazPBnK32pr_M/exec";

const orderSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone number required").max(15),
  address: z.string().trim().min(1, "Address is required").max(300),
});

function generateOrderId() {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 900 + 100);
  return `ORD-${year}-${String(seq).padStart(3, "0")}`;
}

async function saveOrderToSheet(
  orderId: string,
  form: OrderDetails,
  items: { name: string; qty: number; price: number }[]
) {
  const date = new Date().toLocaleDateString("en-IN");
  for (const item of items) {
    const response = await fetch(ORDER_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        OrderID: orderId,
        Date: date,
        CustomerName: form.name,
        Phone: form.phone,
        Address: form.address,
        ProductName: item.name,
        Price: item.price,
        Quantity: item.qty,
        TotalAmount: item.price * item.qty,
        Status: "Pending",
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to save order");
    }
  }
}

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<OrderDetails>({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (cart.length === 0) {
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

  const cartItems = cart.map((item) => ({ name: item.name, qty: item.qty, price: item.price }));

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const orderId = generateOrderId();
      await saveOrderToSheet(orderId, form, cartItems);

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
                <span className="font-medium">₹{item.price * item.qty}</span>
              </div>
            ))}
            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary text-lg">₹{totalPrice}</span>
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

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Delivery Address</label>
              <textarea
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={`${inputClass} min-h-[80px] resize-none`}
                placeholder="Full delivery address"
                maxLength={300}
              />
              {errors.address && <p className="text-destructive text-xs mt-1">{errors.address}</p>}
            </div>

            {/* Place Order Button */}
            <div className="space-y-3 mt-2">
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-semibold text-base shadow-button hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Placing Order...
                  </>
                ) : (
                  "📦 Place Order"
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Your order will be saved automatically.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
