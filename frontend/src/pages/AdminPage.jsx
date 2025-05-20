import DataForm from "../components/DataForm";
import VectorTable from "../components/VectorTable"; 
import ReloadButton from "../components/ReloadButton";
import LogoutButton from "../components/LogoutButton";
import { Navigate } from "react-router-dom";

const AdminPage = () => {

  if (!localStorage.token) {
    return <Navigate to="/login" />
  }

  return (
      <div className="admin-page">
        <h1>Admin Dashboard</h1>
        <ReloadButton />
        <LogoutButton />
        <VectorTable />
        <DataForm />
      </div>
    );
  };

export default AdminPage;