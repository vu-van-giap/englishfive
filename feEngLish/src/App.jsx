import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import Content from "./components/content";
import Footer from "./components/footer";
import Register from "./components/Register";
import Login from "./components/Login/Login";
import CreateWord from "./components/CreateWord/CreateWord";
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/createword" element={<CreateWord />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
export default App;
