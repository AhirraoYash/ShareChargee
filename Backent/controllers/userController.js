const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { createWallet } = require('./walletController'); // 👈 import wallet creator

// const isLoggedIn=require('../middlerware/userMiddlerware');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
}).single('profileImage');
//signup
// userController.js
 
 
const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
      }

      const user = new User({
          firstName,
          lastName,
          email,
          password
      });

      await user.save();

      // ✅ Create wallet and store walletId in user
      const wallet = await createWallet(user._id);
      user.wallet = wallet._id;
      await user.save(); // Save again with wallet ID

      res.status(201).json({ message: "User and wallet created successfully" });
  } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ message: "Something went wrong during signup" });
  }
};


//login
const login = async (req, res) => {
    const {email,password}=req.body;
    if (!email || !password) {
      return res.status(400).json({
          success: false,
          message: "Email and password are required"
      });
  }

  //Admin login
  if(email === "admin@gmail.com" && password === "admin"){
      console.log("Admin is Login")
      const token = jwt.sign({ email: email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      res.cookie('token', token, {
          httpOnly: true,
          sameSite: 'Strict',
          maxAge: 60 * 60 * 1000
      });

      return res.status(200).json({
          success: true,
          message: 'Admin login successful',
          user: {
              email: email,
              role: 'admin'
          }
      });
  }
    
    const user=await User.findOne({email,password});
    if(!user){
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }
    console.log(user,"user in login");
    // Create JWT token
    const token = jwt.sign({ email: user.email, userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set cookie with the token
    res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
        maxAge: 60 * 60 * 1000
    });
 
    res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role || 'user'
        }
    });
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

// Handle profile image upload
const uploadProfileImage = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please select an image to upload'
        });
      }

      // Create the image URL
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      // Update user's profile image
      await User.findByIdAndUpdate(req.user.userId, {
        profileImage: imageUrl
      });

      res.status(200).json({
        success: true,
        imageUrl: imageUrl
      });
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image'
    });
  }
};

// Update user details
const updateUserDetails = async (req, res) => {
  try {
    const { firstName, lastName, mobile, pincode, profileImage } = req.body;
    const userId = req.user.userId;

    const updateData = {
      firstName,
      lastName,
      mobile,
      pincode
    };

    // Only update profileImage if it's provided and is a valid URL
    if (profileImage && (profileImage.startsWith('http') || profileImage.startsWith('/'))) {
      updateData.profileImage = profileImage;
    }

    // Find user and update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        pincode: updatedUser.pincode,
        profileImage: updatedUser.profileImage
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// Logout Controller
const logout = (req, res) => {
    console.log(req.cookies,"req.cookies in logout");
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
};

//fetch user details


const fetchUserDetails = async (req, res) => {
  try {
    // req.user.userId is available because of the isLoggedIn middleware
    const user = await User.findById(req.user.userId).select("-password"); // Don't send password in response

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user details
const getUserDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        pincode: user.pincode,
        profileImage: user.profileImage,
        vehicles: user.vehicles
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};

// @desc    Get all users with vehicles
// @route   GET /api/users
// @access  Private (Admin only)
// const getAllUsers = async (req, res) => {
//     try {
//         const users = await User.find()
//             .select('-password')  // Exclude password
//             .populate('vehicles'); // Include vehicles
//             //  .populate('wallet')
//         res.status(200).json({
//             success: true,
//             count: users.length,
//             users
//         });
//     } catch (err) {
//         console.error('Error fetching users:', err);
//         res.status(500).json({
//             success: false,
//             message: 'Server Error'
//         });
//     }
// };

const getAllUsers = async (req, res) => {
  try {
      const users = await User.find()
          .select('-password') // Exclude password
          .populate('vehicles') // Include vehicles
          .populate('wallet'); // Include wallet

      res.status(200).json({
          success: true,
          count: users.length,
          // balance:users.balance,
          users
      });
  } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({
          success: false,
          message: 'Server Error'
      });
  }
};
















// @desc    Delete a user
// @route   DELETE /api/deleteUser/:userId
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  console.log(req.userId,"will be delete on userController.js")
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false, 
      message: 'Error deleting user'
    });
  }
};

// Update subscription status
const updateSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Set subscription end date to 30 days from now
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 90);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        subscription: true,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: subscriptionEndDate
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      user: {
        subscription: updatedUser.subscription,
        subscriptionStartDate: updatedUser.subscriptionStartDate,
        subscriptionEndDate: updatedUser.subscriptionEndDate
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscription'
    });
  }
};

// Get current user details using token
const getCurrentUser = async (req, res) => {
  try {
    // req.user contains the user ID from the auth middleware
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user details without sensitive info
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        subscription: user.subscription,
        subscriptionStartDate: user.subscriptionStartDate, 
        subscriptionEndDate: user.subscriptionEndDate,
        walletBalance: user.walletBalance,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user details'
    });
  }
};



// module.exports = { signup, login, logout };
module.exports={signup,login,checkSession,logout,fetchUserDetails,updateUserDetails,getUserDetails,uploadProfileImage,getAllUsers,deleteUser,updateSubscription,getCurrentUser};