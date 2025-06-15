/**
 * @description
 * Admin page for creating new users.
 * Displays the page header and embeds the SignupPage component to handle user registration.
 * @version 1.0
 */
import SignupPage from "../../components/SignupPage";
import PageHeader from "../../components/admin-components/HeaderBar";

/**
 * @function CreateUserForm
 * @description
 * Renders the form for admins to create new users via the SignupPage component.
 *
 * @returns {JSX.Element} The rendered CreateUserForm component.
 */
export default function CreateUserForm() {
  return (
    <>
      <PageHeader />
      <div className="container">
        <SignupPage />
      </div>
    </>
    
   
  );
}
