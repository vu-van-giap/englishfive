import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./component/header";
import Content from "./component/content";
import Footer from "./component/footer";
import Register from "./component/Register";
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}