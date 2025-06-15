/**
 * @description
 * A button component that redirects users to the login page when clicked.
 * Displays a login icon.
 * @version 1.0
 */
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

/**
 * @function AdminButton
 * @description
 * AdminButton component renders a button that navigates to the login page.
 * 
 * @returns {JSX.Element} The AdminButton component.
 */
const AdminButton = () => {
  const navigate = useNavigate();

  /**
   * @function handleRedirect
   * @description
   * Handles button click event to navigate to the "/login" route.
   * 
   * @returns {void}
   */
  const handleRedirect = () => {
    navigate("/login"); 
  };

  return (
    <button
      onClick={handleRedirect}
      className="admin-button nav-button"
      aria-label="Go to Admin Page"
    >
      
      <LogIn className="login-icon" />
    </button>
  );
};

export default AdminButton;
