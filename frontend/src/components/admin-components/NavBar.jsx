import { NavLink, Outlet, Navigate } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";

export default function NavBar() {
  if (!localStorage.token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="navbar-container">
      <aside className="navbar-sidebar">
        <div className="navbar-header">
          Admin Panel
        </div>
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
                <div className="navbar-sublinks">
            <NavLink
              to="form/input"
              className={({ isActive }) =>
                isActive ? "navbar-sublink navbar-sublink-active" : "navbar-sublink"
              }
            >
              Input Form
            </NavLink>
            <NavLink
              to="form/links"
              className={({ isActive }) =>
                isActive ? "navbar-sublink navbar-sublink-active" : "navbar-sublink"
              }
            >
              Links Form
            </NavLink>
            <NavLink
              to="form/create-user"
              className={({ isActive }) =>
                isActive ? "navbar-sublink navbar-sublink-active" : "navbar-sublink"
              }
            >
              Create User Form
            </NavLink>
          </div>
        </nav>
        <div className="navbar-footer">
          © 2025 Admin Panel 
          <LogoutButton />
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
