import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatbotPage from "./pages/ChatbotPage";
import NavBar from "./components/admin-components/NavBar";
import Database from "./pages/admin-pages/Database";
import Form from "./pages/admin-pages/Form";
import AdminPage from "./pages/admin-pages/AdminPage";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import LinksForm from "./pages/admin-pages/LinksForm"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home page — no navbar */}
        <Route index element={<ChatbotPage />} />

        {/* Admin layout with nested routes */}
        <Route path="admin" element={<NavBar />}>
          <Route index element={<AdminPage />} />
          <Route path="database" element={<Database />} />
          <Route path="form">
            <Route path="input" element={<Form />} />
            <Route path="links" element={<LinksForm />} />
          </Route>
        </Route>
        <Route path="/signup" element={<SignupPage />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
