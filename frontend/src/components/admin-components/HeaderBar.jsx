import { useLocation } from "react-router-dom";

const pageTitles = {
  "/admin/": "Admin Home",
  "/admin/database": "Vector Database",
  "/admin/form": "Form",
  "/admin/form/input": "Input Form",
  "/admin/form/links": "Links Form",
  "/admin/form/create-user": "Create User Form",
};

export default function PageHeader() {
  const location = useLocation();
  const path = location.pathname;

  const title = pageTitles[path] || "Page";

  let prefix = "";
  if (path.startsWith("/admin/form")) {
    prefix = "Form";
  } else if (path.startsWith("/admin")) {
    prefix = "Main";
  }

  return (
    <div className="page-header">
      <p><b>{prefix} </b>/ {title}</p>
    </div>
  );
}
