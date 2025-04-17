// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const user = require('./models/user');
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
// // Load environment variables
// dotenv.config();
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(cookieParser());
 
// // Routes
// app.post('/api/signup', async (req, res) => {
//         const { firstName, lastName, email, password } = req.body;
//         // Check if user already exists
//         const existingUser = await user.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         // Create new user
//         const user = new user({
//             firstName,
//             lastName,
//             email,
//             password // Note: In production, hash the password before saving
//         });
//         await user.save();
//         res.status(201).json({ message: 'User created successfully' });
     
// });

// app.post('/api/login', async (req, res) => {
//     const {email,password}=req.body;
//     const User=await user.findOne({email});
//      if(!User){
//         return res.status(401).json({message:'Invalid credentials'});
//      }
//      if(User.password !== password){
//         return res.status(401).json({message:'Invalid credentials'});
//      }
//      let token= jwt.sign({email,userId:User._id},process.env.JWT_SECRET);
//      res.cookie("token",token);
//      console.log(token);
//      //res.status(200).json({message:'Login successful'});
//      res.status(200).json({token});
//      console.log("login successful");
     
// });
// app.post('/api/logout',(req,res)=>{
//   res.clearCookie("token");
//   res.status(200).json({message:'Logout successful'});

// })


 
// // Start server


// function isLoggedIn(req,res,next){
//     if(req.cookies.token ==="") {
//         res.redirect("/login")
//     }
//     else{
//         let data=jwt.verify(req.cookies.token,"secret")
//         req.user=data;
//         }
//     next()
// }
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// }); 


const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
connectDB(); 

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));


app.use(express.json());
app.use(cookieParser());
 

app.use('/api', userRoutes);    

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
