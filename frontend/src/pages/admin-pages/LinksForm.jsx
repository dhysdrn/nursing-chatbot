/**
 * @description
 * Admin subpage for managing external or internal resource links.
 * Renders a header bar and the LinkManager component for CRUD operations on links.
 * @version 1.0
 */
import PageHeader from "../../components/admin-components/HeaderBar";
import LinkManager from "../../components/admin-components/LinkManager";

/**
 * @function LinksForm
 * @description
 * Renders the "Manage Links" admin page, which includes a page header and a UI
 * for adding, searching, and removing resource links.
 *
 * @returns {JSX.Element} The rendered LinksForm component.
 */
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