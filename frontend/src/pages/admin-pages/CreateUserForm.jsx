import SignupPage from "../../components/SignupPage";
import PageHeader from "../../components/admin-components/HeaderBar";

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
