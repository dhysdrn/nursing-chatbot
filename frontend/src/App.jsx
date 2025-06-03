import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/admin-components/NavBar";
import AdminPage from "./pages/admin-pages/AdminPage";
import Form from "./pages/admin-pages/Form";
import LinksForm from "./pages/admin-pages/LinksForm";
import CreateUserForm from "./pages/admin-pages/CreateUserForm";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import ChatbotPage from "./pages/ChatbotPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home page */}
        <Route index element={<ChatbotPage />} />

        {/* Admin Page */}
        <Route path="admin" element={<NavBar />}>
          <Route index element={<AdminPage />} />
          <Route path="form" element={<Form />} />
        
          <Route path="form/input" element={<Form />} />
          <Route path="form/links" element={<LinksForm />} />
          <Route path="form/create-user" element={<CreateUserForm />} />
        </Route>
        
        <Route path="signup" element={<SignupPage />} />
        <Route path="login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
