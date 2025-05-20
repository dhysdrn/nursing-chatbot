import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatbotPage from "./pages/ChatbotPage"
import AdminPage from "./pages/AdminPage"
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";

export default function App(){
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<ChatbotPage />} />
          <Route path="/admin" element={<AdminPage />}></Route>
          <Route path="/signup" element={<SignupPage />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}