import DataForm from "../components/DataForm";
import VectorTable from "../components/VectorTable"; 

const AdminPage = () => {
    return (
        <div className="admin-page">
          <h1>Admin Dashboard</h1>
          <VectorTable />
          <DataForm />
        </div>
      );
    };

export default AdminPage;