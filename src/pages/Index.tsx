import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Truck, Shield, ChevronRight } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center text-center"
        style={{
          background:
            "linear-gradient(135deg, hsla(20,10%,8%,0.75), hsla(28,60%,20%,0.6)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="px-4 max-w-2xl"
        >
          <h1 className="font-display text-5xl md:text-7xl font-bold text-[hsl(0,0%,100%)] mb-6 leading-tight">
            Seasonal Fashion
            <br />
            <span className="text-gradient-brand">for Every Weather</span>
          </h1>
          <p className="text-lg md:text-xl text-[hsl(30,15%,85%)] mb-8 leading-relaxed">
            Garmi mein thandak, sardi mein garmahat, barish mein protection.
            <br />
            <strong>Har season ke liye perfect clothes!</strong>
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold shadow-button hover:opacity-90 transition-opacity"
          >
            <ShoppingBag className="h-5 w-5" />
            Shop Now
            <ChevronRight className="h-5 w-5" />
          </Link>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["☀️ Summer", "❄️ Winter", "🌧️ Rainy"].map((s) => (
              <Link
                key={s}
                to="/catalogue"
                className="bg-[hsl(0,0%,100%)]/15 backdrop-blur-sm text-[hsl(0,0%,100%)] px-5 py-2 rounded-full text-sm font-medium hover:bg-[hsl(0,0%,100%)]/25 transition-colors"
              >
                {s} Collection
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                title: "Wholesale & Retail",
                desc: "Bulk orders at unbeatable prices. Perfect for resellers!",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "Pan India shipping within 2-3 days.",
              },
              {
                icon: Shield,
                title: "Quality Guaranteed",
                desc: "Premium fabrics & perfect fitting.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-lg p-8 text-center shadow-card"
              >
                <f.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
