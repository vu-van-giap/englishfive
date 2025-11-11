import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import Content from "./components/content";
import Footer from "./components/footer";
import Page1 from "./components/page1";
import Page2 from "./components/page2";
import Page3 from "./components/page3";
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
      <Page1></Page1>
      <Page2></Page2>
      <Page3></Page3>

      <Footer />
    </BrowserRouter>
  );
}
export default App;
