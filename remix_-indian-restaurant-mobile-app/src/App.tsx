import React, { useState, useEffect } from "react";
import CustomerApp from "./CustomerApp";
import OwnerApp from "./OwnerApp";

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  if (currentPath === "/owner") {
    return <OwnerApp />;
  }

  return <CustomerApp />;
}
