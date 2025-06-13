import PageHeader from "../../components/admin-components/HeaderBar";
import ReloadButton from "../../components/admin-components/ReloadButton";
import TimeStamp from "../../components/admin-components/TimeStamp";
import VectorTable from "../../components/admin-components/VectorTable";


const AdminPage = () => {
  return (
    <>  
    <PageHeader />
    <div className="container">
      <h2>Admin Dashboard</h2>
      <div className="admin-controls">
        <TimeStamp />
        <ReloadButton />
      </div>
      <VectorTable />
    </div>
    </>
   
  );
};

export default AdminPage;
