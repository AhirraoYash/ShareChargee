const User = require('../models/user');
const jwt = require('jsonwebtoken');




const signup = async (req, res) => {
    const {firstName,lastName,email,password}=req.body;
    const existingUser=await User.findOne({email});
    if(existingUser){
        return res.status(400).json({message:"User already exists"});
    }
    const user=new User({
        firstName,
        lastName,
        email,
        password
    })
    await user.save();
    res.status(201).json({message:"User created successfully"});
};

const login = async (req, res) => {
    const {email,password}=req.body;
    const user=await User.findOne({email,password});
    if(!user){
        return res.status(401).json({message:"Invalid credentials"});
    }

// Create JWT token
const token = jwt.sign({ email: user.email, userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

// Set cookie with the token
res.cookie('token', token, {
    httpOnly: true,  // The cookie can't be accessed from JavaScript
    secure: false,   // Set to `true` if you're using HTTPS in production
    sameSite: 'Strict',  // Helps prevent CSRF attacks
    maxAge: 60 * 60 * 1000  // 1 hour expiration time
});
 
    res.status(200).json({ message: 'Login successful' });
     
};

const checkSession=(req,res)=>{
    console.log("checkSession in userController");
    const token=req.cookies.token;
    if(!token){
        return res.status(200).json({authentication:false});
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log(decoded,"User is logged in");
        return res.status(200).json({ authenticated: true });
    } catch (err) {
      return res.status(200).json({ authenticated: false });
    }
}

// Logout Controller
const logout = (req, res) => {
    console.log(req.cookies,"req.cookies in logout");
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
};


// module.exports = { signup, login, logout };
module.exports={signup,login,checkSession,logout};

 