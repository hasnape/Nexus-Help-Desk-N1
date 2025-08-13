import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Hook standard (pour les composants à l'intérieur du provider)
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// Hook sécurisé (pour les composants qui peuvent être en dehors du provider)
export const useSidebarSafe = () => {
  const context = useContext(SidebarContext);

  // Si pas de provider, retourner des valeurs par défaut
  if (context === undefined) {
    return {
      isExpanded: false,
      toggleSidebar: () => {
        console.warn(
          "useSidebarSafe: toggleSidebar called outside of SidebarProvider"
        );
      },
    };
  }

  return context;
};
