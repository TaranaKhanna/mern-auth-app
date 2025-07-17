import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({
            success: false, message: 'Not Authorized. Login again'
        })
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedToken?.id) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized. Invalid token'
            });
        }
        
        req.userId = decodedToken.id;
        
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
}

export default userAuth;