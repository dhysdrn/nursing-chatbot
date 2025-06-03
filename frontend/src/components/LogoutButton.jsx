import { useState } from "react";
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const [logoutMsg, setLogoutMsg] = useState("");

  const handleLogout = async () => {
    setLogoutMsg("Logging Out...");
    try {
        localStorage.removeItem("token")
    } catch (err) {
        console.log(err)
        setLogoutMsg("Logout failed.");
    }
    finally {
        window.location.reload();
    }
  };

  return (
    <div className="logout-container">
      <button onClick={handleLogout} className="logout-button">
        <LogOut /> Logout
      </button>

      <p>{logoutMsg}</p>
    </div>
  );
}
