import User from "../models/user.model.js";

const getUserDetail = async (req, res) => {
    try {
        const { userId } = req;

        const user = await User.findById(userId).select('-password -verifyOtp -verifyOtpExpireAt');

        if(!user) {
            return res.status(404).json({
                success: false, message: "User not found", 
            })
        }

        return res.status(200).json({
            success: true, 
            userDetails: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        })

    } catch (error) {
        return res.status(500).json({
            success: false, message: error.message
        })
    }
}

export { getUserDetail };