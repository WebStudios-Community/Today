"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";

const GuestContext = createContext<string | null>(null);

export const useGuestID = () => useContext(GuestContext);

export default function GuestProvider({ children }: { children: ReactNode }) {
  const [guestID, setGuestID] = useState<string | null>(null);

  useEffect(() => {
    let storedGuestID = localStorage.getItem("guestID");
    if (!storedGuestID) {
      storedGuestID = crypto.randomUUID();
      localStorage.setItem("guestID", storedGuestID);
    }
    setGuestID(storedGuestID);
  }, []);

  if (!guestID) return null;

  return (
    <GuestContext.Provider value={guestID}>{children}</GuestContext.Provider>
  );
}
