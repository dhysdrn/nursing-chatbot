import { useState } from "react";

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
        Logout
      </button>

      <p>{logoutMsg}</p>
    </div>
  );
}
