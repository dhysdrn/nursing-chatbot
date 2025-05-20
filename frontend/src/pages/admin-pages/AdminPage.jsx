import ReloadButton from "../../components/admin-components/ReloadButton";
import TimeStamp from "../../components/admin-components/TimeStamp";

const AdminPage = () => {
  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <TimeStamp />
      <ReloadButton />
    </div>
  );
};

export default AdminPage;
