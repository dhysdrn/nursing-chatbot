import { NavLink, Outlet, Navigate } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";

export default function NavBar() {
  if (!localStorage.token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="navbar-container">
      <aside className="navbar-sidebar">
        <NavLink to="/admin" className="navbar-title-link">
          <h2 className="navbar-title">Admin</h2>
        </NavLink>
        <nav className="navbar-nav">
          <NavLink
            to="database"
            className={({ isActive }) =>
              isActive ? "navbar-link navbar-link-active" : "navbar-link"
            }
          >
            Database
          </NavLink>
          <NavLink
            to="form"
            className={({ isActive }) =>
              isActive ? "navbar-link navbar-link-active" : "navbar-link"
            }
          >
            Form
          </NavLink>
          <LogoutButton />
        </nav>
      </aside>

      <main className="navbar-content">
        <Outlet />
      </main>
    </div>
  );
}
