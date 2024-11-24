const jwt = require("jsonwebtoken");
require('dotenv').config();

const authenticateToken = (requiredRole) => {
    return (req, res, next)=>{
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if(token == null) return res.json({
            error: true,
            message: "Token not found"
        });
    
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.json({ 
                error: true,
                message: "Invalid token"
            });

            if(user.role !== requiredRole) {
                // console.log(user.role+ " "+requiredRole);
                return res.status(403).json({ error: true, message: "Unauthorized" });
            }
    
            req.user = user;
            next();
        });
    }
}

module.exports = {
    authenticateToken,
}