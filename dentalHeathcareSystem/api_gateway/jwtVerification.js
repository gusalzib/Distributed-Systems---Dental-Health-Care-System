const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = (req, res, next) => {
    const token = req.cookie?.authToken;

    if (!token) {
        // if token is not set, i am returning 403 forbidden code
        return res.status(403).json({message: 'Access denied. Authentication token is missing'})
    }

    try {
        const secret_key = process.env.JWT_SECRET_KEY;

        // check if the token contains our secret key. Without this, we are vulnerable 
        // attacks by fake tokens. here we make sure the incoming request has the key that we set
        const decodedToken = jwt.verify(token, secret_key); 
        
        req.user = decodedToken
        console.log('printing the req.user here ',req.user, 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
        
        next();
    } catch (error) {
        return res.status(403).json({message: 'Token either expired or invalid'})
    }
}