import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useDealerAuth } from "@/context/DealerAuthContext";
import { useNavigate } from "react-router-dom";
import { OrderDetails } from "@/types/store";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";

const WHATSAPP_NUMBER = "918624091826";

const orderSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone number required").max(15),
  address: z.string().trim().min(5, "Address is required").max(500),
  pincode: z.string().trim().min(6, "Valid pincode required").max(6),
});

// Google Apps Script Web App URL — replace with your deployed script URL
const ORDER_SHEET_URL = "";

async function saveOrderToSheet(orderId: string, form: OrderDetails, items: string, total: number) {
  if (!ORDER_SHEET_URL) {
    console.warn("Order sheet URL not configured — skipping save.");
    return;
  }
  try {
    await fetch(ORDER_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        name: form.name,
        phone: form.phone,
        address: form.address,
        pincode: form.pincode,
        items,
        total,
        date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      }),
    });
  } catch (err) {
    console.error("Failed to save order to sheet:", err);
  }
}

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { isDealer } = useDealerAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<OrderDetails>({
    name: "",
    phone: "",
    address: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Check MOQ violations
  const moqViolations = cart.filter(
    (item) => item.minimumOrder && item.qty < item.minimumOrder
  );

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  if (moqViolations.length > 0) {
    navigate("/cart");
    return null;
  }

  const handleChange = (field: keyof OrderDetails, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleOrder = async () => {
    const result = orderSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

    const itemLines = cart
      .map((item) => `• ${item.name} x${item.qty} = ₹${item.price * item.qty}`)
      .join("\n");

    const itemsForSheet = cart
      .map((item) => `${item.name} x${item.qty}`)
      .join(", ");

    // Save order to Google Sheet
    await saveOrderToSheet(orderId, form, itemsForSheet, totalPrice);

    // Build WhatsApp message
    const message = `🛒 *New Order*\n\n*Order ID:* ${orderId}\n*Name:* ${form.name}\n*Phone:* ${form.phone}\n*Address:* ${form.address}\n*Pincode:* ${form.pincode}\n\n*Items:*\n${itemLines}\n\n*Total: ₹${totalPrice}*`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    clearCart();
    toast.success("Order placed successfully!");
    navigate("/order-success", { state: { orderId, total: totalPrice } });
  };

  const inputClass =
    "w-full bg-background border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

          {/* Order Summary */}
          <div className="bg-card rounded-lg p-5 shadow-card mb-6">
            <h2 className="font-display text-lg font-semibold mb-3">Order Summary</h2>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-1.5">
                <span className="text-muted-foreground">
                  {item.name} × {item.qty}
                </span>
                {isDealer && (
                  <span className="font-medium">₹{item.price * item.qty}</span>
                )}
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

          {/* Form */}
          <div className="bg-card rounded-lg p-5 shadow-card space-y-4">
            <h2 className="font-display text-lg font-semibold">Delivery Details</h2>

            {(["name", "phone", "address", "pincode"] as const).map((field) => (
              <div key={field}>
                <label className="text-sm font-medium capitalize text-muted-foreground mb-1 block">
                  {field === "pincode" ? "PIN Code" : field}
                </label>
                {field === "address" ? (
                  <textarea
                    value={form[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className={`${inputClass} min-h-[80px] resize-none`}
                    placeholder="Full delivery address"
                    maxLength={500}
                  />
                ) : (
                  <input
                    type={field === "phone" ? "tel" : "text"}
                    value={form[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className={inputClass}
                    placeholder={
                      field === "name"
                        ? "Your full name"
                        : field === "phone"
                        ? "10-digit phone number"
                        : "6-digit PIN code"
                    }
                    maxLength={field === "pincode" ? 6 : field === "phone" ? 15 : 100}
                  />
                )}
                {errors[field] && (
                  <p className="text-destructive text-xs mt-1">{errors[field]}</p>
                )}
              </div>
            ))}

            <button
              onClick={handleOrder}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-semibold text-base shadow-button hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >
              {submitting ? "Processing..." : `Place Order${isDealer ? ` & Pay ₹${totalPrice}` : ""}`}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Order will be sent via WhatsApp for confirmation.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
