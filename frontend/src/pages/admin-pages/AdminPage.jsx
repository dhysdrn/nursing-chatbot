/**
 * @description
 * Admin dashboard page displaying current data snapshot,
 * controls to reload data, timestamp info, and a vector data table.
 * @version 1.0
 */

import PageHeader from "../../components/admin-components/HeaderBar";
import ReloadButton from "../../components/admin-components/ReloadButton";
import TimeStamp from "../../components/admin-components/TimeStamp";
import VectorTable from "../../components/admin-components/VectorTable";

/**
 * @function AdminPage
 * @description
 * Renders the Admin Dashboard with a page header, timestamp, reload button,
 * and the vector data table component for admin monitoring and actions.
 *
 * @returns {JSX.Element} The rendered AdminPage component.
 */
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
