import PageHeader from "../../components/admin-components/HeaderBar";
import ReloadButton from "../../components/admin-components/ReloadButton";
import TimeStamp from "../../components/admin-components/TimeStamp";

const AdminPage = () => {
  return (
    <>
      <PageHeader />
      <h1>Admin Dashboard</h1>
      <TimeStamp />
      <ReloadButton />
    </>
  );
};

export default AdminPage;
