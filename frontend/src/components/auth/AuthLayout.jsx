import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="w-full h-dvh flex">
      {/* Left Side - Gradient Background with Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/UserAuthImage.svg"
          alt="Authentication"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
