import React, { createContext, useContext, useState, useCallback } from "react";

interface DealerAuthContextType {
  isDealer: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const DealerAuthContext = createContext<DealerAuthContextType | undefined>(undefined);

// Simple dealer password — for a GitHub Pages site without backend
// In production, use a proper auth system with Lovable Cloud
const DEALER_PASSWORD = "dealer2024";

export function DealerAuthProvider({ children }: { children: React.ReactNode }) {
  const [isDealer, setIsDealer] = useState(() => {
    try {
      return sessionStorage.getItem("dealer_auth") === "true";
    } catch {
      return false;
    }
  });

  const login = useCallback((password: string) => {
    if (password === DEALER_PASSWORD) {
      setIsDealer(true);
      sessionStorage.setItem("dealer_auth", "true");
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsDealer(false);
    sessionStorage.removeItem("dealer_auth");
  }, []);

  return (
    <DealerAuthContext.Provider value={{ isDealer, login, logout }}>
      {children}
    </DealerAuthContext.Provider>
  );
}

export function useDealerAuth() {
  const context = useContext(DealerAuthContext);
  if (!context) throw new Error("useDealerAuth must be used within DealerAuthProvider");
  return context;
}
