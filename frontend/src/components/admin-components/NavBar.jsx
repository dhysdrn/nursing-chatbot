import { NavLink, Outlet, Navigate } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";
import { House } from 'lucide-react';
import GreenRiverIcon from "../GreenRiverIcon";

export default function NavBar() {
  if (!localStorage.token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="navbar-container">
      <aside className="navbar-sidebar">
        <div className="icon-wrapper">
          <GreenRiverIcon />
        </div>
        <div className="navbar-header">Admin Panel</div>
        <nav className="navbar-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "navbar-link navbar-link-active" : "navbar-link"
            }
          >
            <div className="dashboard-link"><House size={16} /> Dashboard</div>
            
          </NavLink>

          <div className="form-header">Forms</div>

          <div className="navbar-sublinks">
            <NavLink
              to="/admin/form/input"
              className={({ isActive }) =>
                isActive ? "navbar-sublink navbar-sublink-active" : "navbar-sublink"
              }
            >
              FAQ Entry
            </NavLink>
            <NavLink
              to="/admin/form/links"
              className={({ isActive }) =>
                isActive ? "navbar-sublink navbar-sublink-active" : "navbar-sublink"
              }
            >
              Manage Links
            </NavLink>
            <NavLink
              to="/admin/form/create-user"
              className={({ isActive }) =>
                isActive ? "navbar-sublink navbar-sublink-active" : "navbar-sublink"
              }
            >
              Create User
            </NavLink>
          </div>
        </nav>
        <div className="navbar-footer">
          <LogoutButton />
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
