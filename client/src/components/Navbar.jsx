import { useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Navbar = () => {

  const navigate = useNavigate()
  const { userData, backendUrl, setUserData, setIsLoggedIn } = useContext(AppContext)

  const handleVerifyEmail = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(`${backendUrl}/api/auth/send-verification-otp`);

      if(data.success) {
        navigate('/verify-email');
        toast.success(data.message || "Verification OTP sent to your email");
      }else {
        toast.error(data.message || "Failed to send verification OTP");
      }
      
    } catch (error) {
      toast.error(error.message || "An error occurred while verifying email");
    }
  }

  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);

      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      navigate('/');
    } catch (error) {
      toast.error(error.message || "An error occurred while logging out");
    }
  }

  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
        <img src={assets.logo} alt='' className='w-28 sm:w-32' />
        {
          userData ? 
          (
            <div className='bg-black text-white w-8 h-8 flex justify-center items-center rounded-full relative group cursor-pointer'>
              {userData.name[0].toUpperCase()}
              <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
                <ul className='bg-gray-100 text-sm'>
                  {!userData.isAccountVerified && (<li onClick={handleVerifyEmail}
                  className='py-1 px-2 hover:bg-gray-200'>Verify Email</li>)}
                  <li onClick={handleLogout} className='py-1 px-2 hover:bg-gray-200 pr-10'>Logout</li>
                </ul>
              </div>
              </div>
          )
           : 
          (
            <button 
        onClick={() => navigate('/login')}
        className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 cursor-pointer 
        hover:bg-gray-100 transition-all'
        >Login
            <img src={assets.arrow_icon} alt="" />
        </button>
          )
        }
        
    </div>
  )
}

export default Navbar