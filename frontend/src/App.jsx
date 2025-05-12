import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatbotPage from "./pages/ChatbotPage"
import AdminPage from "./pages/AdminPage"

export default function App(){
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<ChatbotPage />} />
          <Route path="/admin" element={<AdminPage />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}