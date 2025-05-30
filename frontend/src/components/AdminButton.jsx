import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

const AdminButton = () => {
  const navigate = useNavigate();

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
