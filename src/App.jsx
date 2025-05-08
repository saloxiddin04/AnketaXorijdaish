import React from "react";
import Navbar from "./components/Navbar.jsx";
import Main from "./pages/Main.jsx";
import Footer from "./components/Footer.jsx";
import {ToastContainer} from "react-toastify";

function App() {
  
  return (
    <>
      <Navbar/>
      <Main/>
      <Footer/>
      
      <ToastContainer
        autoClose={2000}
        hideProgressBar={true}
        theme="colored"
        position="bottom-left"
      />
    </>
  );
}

export default App
