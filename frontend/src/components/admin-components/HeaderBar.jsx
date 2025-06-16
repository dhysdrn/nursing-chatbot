/**
 * @description
 * PageHeader component dynamically displays the page title and section prefix
 * based on the current URL path using React Router's useLocation hook.
 * It shows contextual breadcrumb-like text and includes a ThemeToggle component
 * for switching UI themes.
 * @version 1.0
 */
import { useLocation } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";

const pageTitles = {
  "/admin": "Home",
  "/admin/form/input": "FAQ Entry",
  "/admin/form/links": "Manage Links",
  "/admin/form/create-user": "Create User",
};

/**
 * @function PageHeader
 * @description
 * Renders the page header with a prefix and title derived from the current route.
 * Includes a ThemeToggle component for theme switching.
 *
 * @returns {JSX.Element} The page header UI.
 */
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
