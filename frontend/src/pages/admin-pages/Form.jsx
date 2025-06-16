/**
 * @description
 * Admin subpage for adding a new FAQ entry to the database.
 * Displays a page header and a form where admins can input question/answer pairs.
 * @version 1.0
 */
import DataForm from "../../components/admin-components/DataForm";
import PageHeader from "../../components/admin-components/HeaderBar";

/**
 * @function Form
 * @description
 * Renders the "Add FAQ Entry" admin page, which includes a page header and a form
 * for submitting new FAQ items to the database.
 *
 * @returns {JSX.Element} The rendered Form component.
 */
export default function Form() {
  return (
    <>  
      <PageHeader />
      <div className="container">
        <h2>Add FAQ Entry</h2>
        <p>Enter the information below to add a new item to the FAQ database.</p>
        <DataForm />
      </div>
    </>
  
   
  );
}
