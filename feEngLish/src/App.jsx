import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import { AppLayout } from "./components/AppLayout";
function App() {
  return (
    <BrowserRouter>
      <Header />
      <AppLayout />
      <Footer />
    </BrowserRouter>
  );
}
export default App;
