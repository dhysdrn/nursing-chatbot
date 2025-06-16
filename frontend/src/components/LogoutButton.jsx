/**
 * @description
 * LogoutButton component allows the user to log out by clearing
 * the stored authentication token and refreshing the page.
 * Displays status messages during the logout process.
 * @version 1.0
 */
import { useState } from "react";
import { LogOut } from 'lucide-react';

/**
 * @function LogoutButton
 * @description
 * Renders a logout button that clears the auth token from localStorage
 * and reloads the page to complete logout.
 *
 * @returns {JSX.Element} The LogoutButton component with button and status message.
 */
export default function LogoutButton() {
  const [logoutMsg, setLogoutMsg] = useState("");

  /**
   * @function handleLogout
   * @description
   * Clears the token from localStorage, shows logout status messages,
   * and reloads the window to reset the app state.
   */
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
