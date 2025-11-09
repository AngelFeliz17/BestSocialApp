import { createContext, useContext } from "react";
import { useUser } from "../hooks/useUser";

const UserContext = createContext<ReturnType<typeof useUser> | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userData = useUser(true);
  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext must be used within a UserProvider");
  return context;
};