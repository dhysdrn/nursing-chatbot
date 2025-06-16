/**
 * @description
 * Main application component that defines all client-side routes using React Router.
 * Includes public pages (Login, Signup, Chatbot) and nested admin routes under /admin.
 * Uses a shared <NavBar /> layout for admin pages and separate components for each route.
 * @version 1.0 
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/admin-components/NavBar";
import AdminPage from "./pages/admin-pages/AdminPage";
import Form from "./pages/admin-pages/Form";
import LinksForm from "./pages/admin-pages/LinksForm";
import CreateUserForm from "./pages/admin-pages/CreateUserForm";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import ChatbotPage from "./pages/ChatbotPage";

/**
 * @function App
 * @description
 * Root component for the React application. Sets up routing for public and admin pages.
 * Uses <BrowserRouter> for client-side routing and nests admin pages under the <NavBar> layout.
 * 
 * @returns {JSX.Element} The rendered routing structure of the application.
 */
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
