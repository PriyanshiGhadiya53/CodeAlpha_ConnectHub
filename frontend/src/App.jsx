import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import MobileBottomNav from "./components/MobileBottomNav.jsx";
import Home from "./pages/Home.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Outlet />
      <MobileBottomNav />
    </>
  );
}

export default App;