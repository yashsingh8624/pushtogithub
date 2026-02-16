import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, LogIn, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useDealerAuth } from "@/context/DealerAuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DealerLoginModal from "./DealerLoginModal";
import { toast } from "sonner";

export default function Header() {
  const { totalItems } = useCart();
  const { isDealer, logout } = useDealerAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/catalogue", label: "Catalogue" },
    { to: "/cart", label: "Cart" },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="font-display text-lg font-bold text-foreground tracking-tight">
            Aakash Traders & Sai Collection
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === l.to ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}

            {isDealer ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-1.5 text-sm font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
              >
                <LogIn className="h-4 w-4" /> Dealer Login
              </button>
            )}

            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </nav>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            {isDealer ? (
              <button onClick={handleLogout} className="p-2 text-muted-foreground">
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <button onClick={() => setLoginOpen(true)} className="p-2 text-primary">
                <LogIn className="h-5 w-5" />
              </button>
            )}
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-card border-b"
            >
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-6 py-3 text-sm font-medium border-b border-border/50 ${
                    location.pathname === l.to ? "text-primary bg-primary/5" : "text-muted-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <DealerLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
