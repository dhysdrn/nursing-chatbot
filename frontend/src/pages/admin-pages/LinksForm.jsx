import PageHeader from "../../components/admin-components/HeaderBar";
import LinkManager from "../../components/admin-components/LinkManager";

export default function LinksForm() {
  return (
    <> 
      <PageHeader />
      <div className="container">
        <h2>Manage Links</h2>
        <p>Add, search, and remove links.</p>
        <LinkManager />
      </div>
    </>
   
   
  );
}