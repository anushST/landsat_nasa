import { useEffect, useState } from "react";
import { getToken } from "../services/auth/authUtils";

const Sidebar = ({ isOpen, closeSidebar, children, resetContent }) => {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    if (getToken()) {
      setIsAuthed(true);
    }
  }, []);

  // When the sidebar is closed, reset the content to default (search form)
  const handleCloseSidebar = () => {
    closeSidebar();
    resetContent();  // Reset sidebar content to default state (search form)
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-[#212121b6] overflow-y-auto text-white transition-transform transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } w-full md:w-2/3 lg:w-1/3 z-50`}
    >
      <div className="p-4 flex justify-between items-center" onClick={handleCloseSidebar}>
        <i  className="fa-solid fa-close text-2xl w-fit ml-auto cursor-pointer"></i>
      </div>
      <div className="">
        {/* {isAuthed ? (
          children
        ) : (
          <div className="h-full flex items-center justify-center flex-col gap-5 mt-10">
            <img src="./auth.svg" alt="" className="w-96 m-auto" />
            <p className="text-center text-xl">Please login to see the content</p>
            <p className="text-lg text-gray-400">
              or if you logged in, the problem can be email verification
            </p>
          </div>
        )} */}
        {children}
      </div>
    </div>
  );
};

export default Sidebar;