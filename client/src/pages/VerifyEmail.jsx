import React, { useContext, useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { backendUrl, isLoggedIn, userData } = useContext(AppContext);

  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    if(e.target.value.length > 0 && index < inputRefs.current.length - 1)
      inputRefs.current[index + 1].focus();
  }

  const handleKeyDown = (e, index) => {
    if(e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('');

    pasteArray.forEach((char, index) => {
      if(inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });

  }

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()
      axios.defaults.withCredentials = true;
      
      const otpArray = inputRefs.current.map(e => e.value);
      const otp = otpArray.join('');

      const { data } = await axios.post(`${backendUrl}/api/auth/verify-account`, { otp });

      if(data.success) {
        toast.success(data.message || "Email verified successfully");
        navigate('/');
      } else {
        toast.error(data.message || "Verification failed");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while verifying email");
    }
  }

  useEffect(() => {
    isLoggedIn && userData && userData.isAccountVerified && navigate('/')
  }, [isLoggedIn, userData])

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img src={assets.logo} alt=""
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
        onClick={() => navigate('/')} />

      <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm flex flex-col items-center'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
        <p className='text-center mb-4 text-indigo-300'>Enter the 6 digit code sent to your email</p>

        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {
            Array(6).fill(0).map((_, index) => (
              <input
                type="text"
                maxLength={1}
                key={index}
                className='w-10 h-10 bg-[#333A5C] text-white text-center text-xl rounded-md mx-1'
                ref={e => inputRefs.current[index] = e}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                required
              />
            ))
          }
        </div>

        <button className='w-1/2 py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-lg'>Verify Email</button>
      </form>
    </div>
  )
}

export default VerifyEmail