import { useEffect, useState } from "react"
import { getToken } from "../services/auth/authUtils";
import SearchBar from "./searchBar";

export default function Header({ openModal, onSearchResult , openSidebar, openNotification}) {
    const [isAuthed, setIsAuthed] = useState(false);

    useEffect(() => {
      if (getToken()) {
        setIsAuthed(true);
      }
    }, []);

    const onLogout = () => {
      localStorage.removeItem('token');
      window.location.reload();
    }

    return (
        <header className=" z-20 flex items-center justify-between p-3 px-5  text-white max-w-screen-lg m-auto rounded-2xl sticky top-5 gap-2">
            <div className=" bg-black grow flex items-center justify-between  p-3 px-5 rounded-2xl ">
              <a href={'/'} className="font-medium">
                <img src="./logo.png" alt="" className="w-32 cursor-pointer" />
              </a>

              <div className="flex items-center gap-5">
              {/* <SearchBar onSearchResult={onSearchResult}/> */}
              {!isAuthed ? (
                  <div>
                  <i className="fa-solid fa-user cursor-pointer" onClick={openModal}></i>
                </div>
              ): (
                  <i class="fa-solid fa-right-from-bracket cursor-pointer text-xl" onClick={onLogout}></i>
              )

              }
              </div>
            </div>
            <div className="relative z-20 bg-red-500 text-white p-3 px-5 rounded-2xl cursor-pointer" onClick={openSidebar}>
              <i class="fa-solid fa-calendar"></i>
            </div>
            <div className="relative z-20 bg-blue-500 text-white p-3 px-5 rounded-2xl cursor-pointer" onClick={openNotification}>
              <i class="fa-solid fa-bell"></i>
            </div>
        </header>
    )
}