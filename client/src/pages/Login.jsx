import { useContext, useState } from 'react'
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {

  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData} = useContext(AppContext);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      axios.defaults.withCredentials = true;

      if(state === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {name, email, password});
        if(data.success) {
          setIsLoggedIn(true);
          getUserData();
          navigate('/');
        } else {
          toast.error(data.message || "Registration failed");
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, { email, password });

        if(data.success) {
          setIsLoggedIn(true);
          getUserData();
          navigate('/');
        } else {
          toast.error(data.message || "Login failed"); 
        }
      }
    } catch (error) {
      toast.error(error.message || "An error occured!");
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img src={assets.logo} alt="" 
      className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      onClick={() => navigate('/')} />

      <div className='bg-slate-900 p-10 shadow-lg rounded-lg w-full sm:w-96 text-indigo-300 text-sm'>

        <h2
          className='text-3xl font-semibold text-center text-white mb-3'
        >{state === "Sign Up" ? "Create Account" : "Login"}</h2>
        <p
          className='text-sm text-center mb-6'
        >{state === "Sign Up" ? "Create a new account" : "Login to your account"}</p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className='flex items-center mb-4 gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <img src={assets.person_icon} alt="" />
              <input
                className='bg-transparent outline-none'
                onChange={(e) => setName(e.target.value)}
                value={name}  
                type="text" placeholder='Full Name' required />
            </div>
          )}

          <div className='flex items-center mb-4 gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='bg-transparent outline-none'
              type="email" placeholder='Email' required />
          </div>

          <div className='flex items-center mb-8 gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              className='bg-transparent outline-none'
              type="password" placeholder='Password' required />
          </div>
          {
            state !== "Sign Up" && 
            <p 
          onClick={() => navigate('/reset-password')}
          className='mb-4 text-indigo-500 cursor-pointer'>Forgot password</p>
          }

          <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer'>{state}</button>
        </form>

        {state === "Sign Up" ?
          (<p className='text-gray-400 text-center text-xs mt-4'>Already have an Account?{' '}
            <span className='text-blue-400 cursor-pointer underline'
              onClick={() => setState("Login")}
            >Login here</span>
          </p>)
          :
          (<p className='text-gray-400 text-center text-xs mt-4'>don't have an Account?{' '}
            <span className='text-blue-400 cursor-pointer underline'
              onClick={() => setState("Sign Up")}
            >Sign Up here</span>
          </p>)}

      </div>
    </div>
  )
}

export default Login