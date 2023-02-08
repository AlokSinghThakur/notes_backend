const jwt = require("jsonwebtoken");


module.exports = (req, res, next) => {
    var token = req.cookies && req.cookies.authToken || false
    console.log(token,process.env.JWT_SECRET)
    if (!token) {
       return res.status(403).send("invalid token")
    }
    jwt.verify(token, process.env.JWT_SECRET, function (err, results) {
        if (err) {
            return res.status(401).send("unauthorized")
        }
        next();
        
    })


}
