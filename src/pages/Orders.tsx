import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Package, Calendar, Phone, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Order {
  OrderID: string;
  Date: string;
  CustomerName: string;
  Phone: string;
  Address: string;
  ProductName: string;
  Price: number;
  Quantity: number;
  TotalAmount: number;
  Status: string;
}

const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycby8I1YLSlmD7_l6J4Ki-fUBgwa2rRL4gAd3jprLLeS-xuSLHT3d7PuVL0TWuQUQZgIAbw/exec";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getOrders",
          phone: phone.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.orders && data.orders.length > 0) {
          setOrders(data.orders);
          toast.success(`Found ${data.orders.length} order(s)`);
        } else {
          setOrders([]);
          toast.info("No orders found for this phone number");
        }
      }
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("Failed to search orders");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">Track Orders</h1>
          <p className="text-muted-foreground mb-8">
            Enter your phone number to view all your orders
          </p>

          {/* Search Form */}
          <div className="bg-card rounded-xl p-6 shadow-card mb-8">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full bg-background border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  maxLength={15}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Orders List */}
          {searched && orders.length === 0 && !loading && (
            <div className="bg-card rounded-xl p-12 text-center shadow-card">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No orders found. Please check your phone number.</p>
            </div>
          )}

          {orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={`${order.OrderID}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow border border-border/50"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-lg font-bold text-foreground">
                          {order.OrderID}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.Status)}`}
                        >
                          {order.Status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {order.Date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-primary">₹{order.TotalAmount}</p>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border/30">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                        Product
                      </p>
                      <p className="font-semibold text-foreground">{order.ProductName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ₹{order.Price} × {order.Quantity} pcs
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">Phone</p>
                          <p className="text-sm font-medium text-foreground">{order.Phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">Address</p>
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {order.Address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
