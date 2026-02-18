import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useDealerAuth } from "@/context/DealerAuthContext";
import { useNavigate } from "react-router-dom";
import { OrderDetails } from "@/types/store";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";

const WHATSAPP_NUMBER = "918624091826";

// Replace with your Razorpay Key ID (test mode key starts with rzp_test_)
const RAZORPAY_KEY_ID = "";

const orderSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone number required").max(15),
});

// Google Apps Script Web App URL — replace with your deployed script URL
const ORDER_SHEET_URL = "";

async function saveOrderToSheet(form: OrderDetails, items: { name: string; qty: number; price: number }[]) {
  if (!ORDER_SHEET_URL) {
    console.warn("Order sheet URL not configured — skipping save.");
    return;
  }
  try {
    for (const item of items) {
      await fetch(ORDER_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          CustomerName: form.name,
          PhoneNumber: form.phone,
          ProductName: item.name,
          Quantity: item.qty,
          Price: item.price * item.qty,
          Date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        }),
      });
    }
  } catch (err) {
    console.error("Failed to save order to sheet:", err);
  }
}

declare global {
  interface Window {
    Razorpay: any;
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

  const generateOrderId = () => `ORD-${Date.now().toString(36).toUpperCase()}`;

  const getItemLines = () =>
    cart.map((item) => `• ${item.name} x${item.qty} = ₹${item.price * item.qty}`).join("\n");

  const cartItems = cart.map((item) => ({ name: item.name, qty: item.qty, price: item.price }));

  const completeOrder = async (orderId: string, paymentMethod: string) => {
    await saveOrderToSheet(form, cartItems);

    const message = `🛒 *New Order*\n\n*Order ID:* ${orderId}\n*Payment:* ${paymentMethod}\n*Name:* ${form.name}\n*Phone:* ${form.phone}\n\n*Items:*\n${getItemLines()}\n\n*Total: ₹${totalPrice}*`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    clearCart();
    toast.success("Order placed successfully!");
    navigate("/order-success", { state: { orderId, total: totalPrice } });
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

  const handleRazorpayPayment = () => {
    if (!validateForm()) return;

    if (!RAZORPAY_KEY_ID) {
      toast.error("Razorpay is not configured yet. Please use WhatsApp order.");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Payment gateway failed to load. Please try again.");
      return;
    }

    setSubmitting(true);
    const orderId = generateOrderId();

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: totalPrice * 100,
      currency: "INR",
      name: "Akash Traders & Sai Collection",
      description: `Order ${orderId}`,
      prefill: { name: form.name, contact: form.phone },
      theme: { color: "#E8652C" },
      handler: async function (response: any) {
        await completeOrder(orderId, `Razorpay (${response.razorpay_payment_id})`);
        setSubmitting(false);
      },
      modal: {
        ondismiss: function () {
          setSubmitting(false);
          toast.error("Payment cancelled. Your cart is intact.");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function () {
      setSubmitting(false);
      toast.error("Payment failed. Please try again.");
    });
    rzp.open();
  };

  const handleWhatsAppOrder = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    const orderId = generateOrderId();
    await completeOrder(orderId, "WhatsApp (COD)");
    setSubmitting(false);
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

            {/* Payment Buttons */}
            <div className="space-y-3 mt-2">
              <button
                onClick={handleRazorpayPayment}
                disabled={submitting || !RAZORPAY_KEY_ID}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-semibold text-base shadow-button hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? "Processing..." : `💳 Pay Now${isDealer ? ` ₹${totalPrice}` : ""}`}
              </button>

              {!RAZORPAY_KEY_ID && (
                <p className="text-xs text-muted-foreground text-center">
                  Online payment coming soon. Use WhatsApp order below.
                </p>
              )}

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <button
                onClick={handleWhatsAppOrder}
                disabled={submitting}
                className="w-full bg-[#25D366] text-white py-3.5 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                📱 Order via WhatsApp (COD)
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Secure payments via Razorpay • UPI, Cards & Net Banking accepted
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
