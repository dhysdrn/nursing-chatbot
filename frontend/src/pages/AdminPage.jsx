import DataForm from "../components/DataForm";
import VectorTable from "../components/VectorTable"; 
import ReloadButton from "../components/ReloadButton";



const AdminPage = () => {
    return (
        <div className="admin-page">
          <h1>Admin Dashboard</h1>
          <ReloadButton />
          <VectorTable />
          <DataForm />
        </div>
      );
    };

export default AdminPage;