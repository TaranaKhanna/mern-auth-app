import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import transporter from "../config/nodemailer.js";

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res
            .status(400)
            .json({
                success: false, message: "All Fields are required"
            });
    }

    try {

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false, message: "User already exists"
                })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to Learning Platform",
            text: `Welcome to Learning Platform. Your account has been registered with email id: ${email}`
        }

        await transporter.sendMail(mailOptions);

        return res
            .status(200)
            .json({
                success: true,
                message: "User registered successfully"
            })

    } catch (error) {
        res
            .status(500)
            .json({
                success: false, message: error.message
            })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({
                success: false,
                message: 'Email and Password are required'
            })
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "User does not exist"
                })
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);

        if (!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Password'
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res
            .status(200)
            .json({
                success: true,
                message: "User logged in successfully"
            })

    } catch (error) {
        return res
            .status(500)
            .json({
                success: false,
                message: error.message
            })
    }
}

const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        return res
            .status(200)
            .json({
                success: true,
                message: "User logged out successfully"
            })
    } catch (error) {
        return res
            .status(500)
            .json({
                success: false, message: error.message
            })
    }
}

//send verification otp to user's email
const sendVerificationOtp = async (req, res) => {
    try {
        const { userId } = req;

        if (!userId) {
            return res.status(400).json({
                success: false, message: "User ID is required 2849203"
            })
        }
        const user = await User.findById(userId);

        if (user.isAccountVerified) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified"
            })
        }

        const otp = String(Math.floor(Math.random() * 900000 + 100000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Your OTP for account verification is ${otp}. It is valid for 24 hours.`
        }

        await transporter.sendMail(mailOptions);

        return res
            .status(200)
            .json({
                success: true, message: "verification OTP sent to your email"
            })

    } catch (error) {
        return res
            .status(500)
            .json({
                success: false,
                message: "email sending error"
            })
    }

}

//verify the email using otp
const verifyEmail = async (req, res) => {
    const { userId } = req;
    const { otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({
            success: false, message: "User ID and OTP are required"
        })
    }
    try {
        const user = await User.findById(userId);


        if (!user) {
            return res.status(404).json({
                success: false, message: "User not found"
            })
        }

        if (user.verifyOtp !== otp || user.verifyOtp === "") {
            return res.status(400).json({
                success: false, message: "Invalid OTP"
            })
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({
                success: false, message: "OTP has expired"
            })
        }

        user.isAccountVerified = true;

        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.status(200).json({
            success: true, message: "Account verified successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false, message: error.message
        })
    }

}

//  check if author is authenticated
const isAuthenticated = async (req, res) => {
    try {
        return res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false, message: error.message
        })
    }
}

//send password reset otp
const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if(!email){
        return res.status(400).json({
            success: false,
            message: "email is required"
        })
    }

   try {
     const user = await User.findOne({ email });
 
     if(!user){
         return res.status(404).json({success: false, message: "User does not exist"})
     }
 
     const otp = String( Math.floor(Math.random() * 900000 + 100000));
 
     user.resetOtp = otp;
     user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

     await user.save();
 
     const mailOptions = {
         from: process.env.SENDER_EMAIL,
         to: email,
         subject: "Reset otp to verify account",
         text: `the otp to verify your account is: ${otp}. It is valid for 24 hours`
     };
 
     await transporter.sendMail(mailOptions);

     return res.status(200).json({success: true, message: "Verification Otp sent to your email."})

   } catch (error) {
        return res.status(500).json({success: false, message: error.message})
   }
}

// reset user password
const resetPassword = async (req, res) => {
    const { email, newPassword, otp } = req.body;

    if(!email || !newPassword || !otp){
        return res.status(400).json({
            success: false, message: "Email, otp and new password are required."
        })
    }

    try {
        
        const user = await User.findOne({ email });
        
        if(!user){
            return res.status(404).json({
                success: false, message: "User not found"
            })
        }

        if(
            user.resetOtp === '' ||
            user.resetOtp !== otp ||
            user.resetOtpExpireAt < Date.now()
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired otp"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.status(200).json({
            success: true, message: "Password has been updated successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false, message: error.message
        })
    }
}

export {
    registerUser,
    loginUser,
    logoutUser,
    sendVerificationOtp,
    verifyEmail,
    isAuthenticated,
    sendResetOtp,
    resetPassword
}