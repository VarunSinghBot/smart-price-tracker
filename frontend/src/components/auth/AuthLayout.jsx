import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#E8DCC4]">
      <Navbar />

      {/* Auth Form Container */}
      <main className="grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white border-4 border-black p-8 sm:p-10 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AuthLayout;
