import DataForm from "../../components/admin-components/DataForm";
import PageHeader from "../../components/admin-components/HeaderBar";

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
