import { login } from "../services/auth/authService";
import { useState } from "react";
export default function Login({ onSignupClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBtnDisabled , setIsBtnDisabled] = useState(false);
  const [error , setError] = useState('');
  
    const handleSignupClick = () => {
      onSignupClick()
    }

    const handleLogin = async (e) => {
      e.preventDefault();
      setIsBtnDisabled(true)
      try {
        const data = await login(email, password);
        setIsBtnDisabled(false)
        setError(null)
        window.location.reload()

      } catch (err) {
        
        setError(err.message); 
        setIsBtnDisabled(false)
      }
    };
  
    return (
      <>
          <section className=" relative z-20  w-full m-auto">
           <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <img src="./logo.png" alt="" className="w-52" />
             
             <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
               <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                 <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Login
                 </h1>
                 <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
                   <div>
                     <label
                       for="email"
                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                     >
                       Your email
                     </label>
                     <input
                       type="email"
                       name="email"
                       id="email"
                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       value={email}
                        onChange={(e) => setEmail(e.target.value)}
                       placeholder="name@company.com"
                       required
                     />
                   </div>
                   <div>
                     <label
                       for="password"
                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                     >
                       Password
                     </label>
                     <input
                       type="password"
                       name="password"
                       id="password"
                       placeholder="••••••••"
                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                       
                     />
                   </div>
                   {error && <p className="text-red-500 text-sm">{error}</p>}
                 
                   <button
                     type="submit"
                     className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                   >
                    Login
                   </button>
                   <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                     Already have an account?{" "}
                     <button
                       onClick={handleSignupClick}
                       className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                     >
                       Signup here
                     </button>
                   </p>
                 </form>
               </div>
             </div>
           </div>
         </section>
      </>
    );
  }
  