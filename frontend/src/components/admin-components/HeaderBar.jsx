import { useLocation } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";

const pageTitles = {
  "/admin": "Home",
  "/admin/form/input": "FAQ Entry",
  "/admin/form/links": "Manage Links",
  "/admin/form/create-user": "Create User",
};

export default function PageHeader() {
  const location = useLocation();
  const path = location.pathname;

  const title = pageTitles[path] || "Page";

  let prefix = "";
  if (path.startsWith("/admin/form")) {
    prefix = "Form";
  } else if (path.startsWith("/admin")) {
    prefix = "Admin";
  }

  return (
    <div className="page-header">
      <p><b>{prefix} </b>/ {title}</p>  <ThemeToggle />
    </div>
  
  );
}
