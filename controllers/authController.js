const asynchandler = require("express-async-handler");
const User = require("../models/userModel");
const DAstatus = require("../models/dAssignmentStatus");
const Token = require("../models/tokenModel");
const AnnotatorAuditorStatus = require("../models/AnnotatorAuditorStatusModel");
const AuthLoginStatus = require("../models/LoginStatusModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { respondsSender } = require("../middleWare/respondsHandler");
const { ResponseCode } = require("../utils/responseCode");
const dotenv = require("dotenv").config();
const {  adminFrontEndUrl } = require("../utils/frontEndUrl");
const {accents}= require('../utils/allAccents');
const { ROLE, USER, DISABLED, ACTIVE, REMOVED } = require("../utils/constant");

const generateToken = (id) => {
  const timestamp = Date.now();
  const expirationTime = 6 * 60 * 1000; // 6 minutes in milliseconds
  const expirationDate = timestamp + expirationTime;
  const token = jwt.sign({ id, exp: expirationDate }, process.env.JWT_SECRET);
  return token;
};

//kindly ignore but don't delete
function generateRandomString(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

//this function isnt a permanent script  it can be writen and rewritten to effect any update on existing collected user data

const runUserUpdate = asynchandler(async (req, res)=>{
  try {
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'USER' } }
    );
    
    console.log(`users updated.`);
     result &&  respondsSender(
      null,
      `users updated.`,
      ResponseCode.successful,
      res
    );
    
  } catch (error) {
    result &&  respondsSender(
      null,
      `Error: ${error}`,
      ResponseCode.internalServerError,
      res
    );
  }

})

// Register user
const registerUser = asynchandler(async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      gender,
      dateOfBirth,
      accent,
      consent,
      password,
      role
    } = req.body;

    // Validation Check
    if (
      !firstname ||
      !lastname ||
      !email ||
      !gender ||
      !dateOfBirth ||
      !accent ||
      !consent ||
      !password ||
      !role
    ) {
      respondsSender(
        null,
        "Please fill in all required fields, firstname, lastname, email, gender, dateOfBirth, accent, consent, password, role",
        ResponseCode.badRequest,
        res
      );
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    //ensure password is strong
    if (!passwordRegex.test(password)) {
    respondsSender(
        null,
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
        ResponseCode.badRequest,
        res
    );
    }
    //normal user should not be allowed
    if (role.toUpperCase()!=ROLE.ADMIN && role.toUpperCase()!=ROLE.ANNOTATOR && role.toUpperCase()!=ROLE.QA) {
    respondsSender(
        null,
        "normal user not allowed to register here",
        ResponseCode.badRequest,
        res
    );
    }    
    const lowerEmail = email.toLowerCase();
    const userRole= role.toUpperCase();
    // Validation check if user email already exists
    const userExists = await User.findOne({ email: lowerEmail });
    if (userExists) {
      respondsSender(
        null,
        "User already registered",
        ResponseCode.dataDuplication,
        res
      );
    }

    // Add user info to the database
    const user = await User.create({
      firstname,
      lastname,
      email: lowerEmail,
      gender,
      dateOfBirth,
      accent,
      consent,
      password,
      verified: false,
      role:userRole
    });


    // User was successfully created, perform your desired action here
    const randomText = generateRandomString(12);

    // Construct Reset URL
    const environment = process.env.ENVIRONMENT || "development";
    const verifyUrl = `${adminFrontEndUrl[environment]}verify?userid=${user._id}&&awarrillmNOW=${randomText}`;
    // Reset Email.
    const message = `
        <h2> Hello ${user.firstname},</h2>
        <p> Please use the URL below to verify your registration </p>
        <a href=${verifyUrl} clicktracking="off">${verifyUrl}</a>
        <p> Regards ... </p>
        <p>Awarri LLM team. </p>`;

    const subject = "Verify Registration Request";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    // Send the verification email
    await sendEmail(subject, message, send_to, sent_from);

    const response = {
      message: "Verification Email Sent",
      url: verifyUrl,
      mail: message,
    };

    //res.status(200).json(response);
    respondsSender(response, "successful", ResponseCode.successful, res);
  } catch (error) {
    // Handle any errors that occurred during user registration
    console.error("Error registering user:", error);
    respondsSender(
      null,
      "Registration Failed" + error.message,
      ResponseCode.internalServerError,
      res
    );
  }
});

// Verify User Registration
const verifyUser = asynchandler(async (req, res) => {
  const { id } = req.params;
  //check if User exist
  const user = await User.findOne({ _id: id });
  if (!user) {
    respondsSender(
      null,
      "User not Found Please Sign-up",
      ResponseCode.noData,
      res
    );
  }
  // check if user already verified
  if (user.verified == true) {
    respondsSender(
      null,
      "User Already Verified,  please Login",
      ResponseCode.dataDuplication,
      res
    );
  } else {
    // set Verification to true
    user.verified = true;
    await user.save();
    respondsSender(
      null,
      "User Successfully Verified",
      ResponseCode.successful,
      res
    );
  }
});

//Login user
const loginUser = asynchandler(async (req, res) => {
  const { email, password, role } = req.body;

  //validate Request
  if (!email || !password || !role) {
    respondsSender(
      null,
      "Please Add Email, password and role(QA, annotator or admin)",
      ResponseCode.badRequest,
      res
    );
  }
  const lowerEmail = email.toLowerCase();
    const userRole= role.toUpperCase();
  //Check if user Exists
  const user = await User.findOne({ email: lowerEmail });
  if (!user) {
    respondsSender(
      null,
      "User not Found Please Sign-up",
      ResponseCode.noData,
      res
    );
  }
  // User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  //if user role is a user allow next phase of auth 
  if (user.role==userRole){
    if (user && passwordIsCorrect) {
    if (user.verified == true) {
      //Generate Login Token
      const token = generateToken(user._id);

      //delete all user previous token
      const deletionResult = await Token.deleteMany({ userId: user._id });

      //save token to token db
      const savedToken = await Token.create({
        userId: user._id,
        token,
      });

      const data = {
        userInfo: {
          _id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          accent: user.accent,
          role:user.role
        },
        token: token,
      };

        //set active status true, set annotatorautdio status model true as well
      // Find the user by userId and update the status to true
        const result = await AuthLoginStatus.findOneAndUpdate(
        { userId: user._id },
        { status: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (result) {
            //add annotator status true if it has not been added
            const existingStatus = await AnnotatorAuditorStatus.findOne({ userId: user._id });

                if (!existingStatus) {
                // User does not have a status entry, create one with status active
                const newStatus = new AnnotatorAuditorStatus({ userId: user._id, status: ACTIVE });
                await newStatus.save();
                console.log(`Added annotator status for user ${user._id} as active.`);
                } 
        } 


      respondsSender(data, "Login successful", ResponseCode.successful, res);
    } else {
      //password and email is right but user is not verified resend verification mail
      respondsSender(
        null,
        "Please verify your email",
        ResponseCode.noData,
        res
      );
    }
  } else {
    respondsSender(null, "Wrong Password", ResponseCode.noData, res);
  }
  }
  else{
    //this is not a user but a qa, or others
     respondsSender(null, `Please only Admin, Annotators or Auditors(QA) are allowed here. It seems you are not ${role}, please check in with your proper role`, ResponseCode.unAuthorized, res);
  }
});

//Logout User
const logout = asynchandler(async (req, res) => {
  //delete all token related to a user from db

  if (!req.body._id) {
    respondsSender(null, "No user id Passed", ResponseCode.badRequest, res);
  }
  try {
    // Assuming the field name in your Token model is 'userId'
    const result = await Token.deleteMany({ userId: req.body._id });

    if (result.deletedCount > 0) {
      //token deleted from db
      //clear token saved in server cookies
      res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true,
      });
      respondsSender(
        null,
        "Successfully Logged out",
        ResponseCode.successful,
        res
      );
    } else {
      //clear token saved in server cookies
      res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true,
      });
      respondsSender(
        null,
        "User was not logged in, all token linked to user cleared anyway",
        ResponseCode.successful,
        res
      );
    }
  } catch (error) {
    respondsSender(
      null,
      `Error deleting tokens:  ${error.message}`,
      ResponseCode.internalServerError,
      res
    );
  }
});

//Get User Profile data
const getUser = asynchandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (user) {
    userInfo = {
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      accent: user.accent,
      role:user.role
    };
    respondsSender(
      userInfo,
      "User Profile displayed successfully",
      ResponseCode.successful,
      res
    );
  } else {
    respondsSender(null, "User Not Found", ResponseCode.noData, res);
  }
});

//Get Login Status
const loginStatus = asynchandler(async (req, res) => {
  if (!req.loginStatus) {
    respondsSender(null, false, ResponseCode.badRequest, res);
  }
  //Verify  Token
  respondsSender(null, true, ResponseCode.successful, res);
});

//Update User
const updateUser = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();
    const user = {
      _id: updatedUser._id,
    };
    respondsSender(
      user,
      "User Info updated successfully",
      ResponseCode.successful,
      res
    );
  } else {
    respondsSender(null, "User Not Found", ResponseCode.noData, res);
  }
});

// Change Password
const changePassword = asynchandler(async (req, res) => {
  const { oldPassword, password, userId } = req.body;
  const user = await User.findById({_id:userId});
  if (!user) {
    respondsSender(
      null,
      "User Not Found, Please Sign-up",
      ResponseCode.noData,
      res
    );
  }
  //validate
  if (!oldPassword || !password) {
    respondsSender(
      null,
      "Please add old and New Password",
      ResponseCode.noData,
      res
    );
  }

  //check if old password matched password in DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  //Save new Password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();

    respondsSender(
      null,
      "Password changed Successfully",
      ResponseCode.successful,
      res
    );
  } else {
    respondsSender(null, "Old Password is Incorrect", ResponseCode.noData, res);
  }
});

//Forgot Password Process
const forgotPassword = asynchandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    respondsSender(null, "Please add an email", ResponseCode.badRequest, res);
  }
  const user = await User.findOne({ email });
  if (!user) {
    respondsSender(null, "User email does not exist", ResponseCode.noData, res);
  }

  // Delete token if it exists in DB
  try {
    // Find and delete the token based on userId
    const deletedToken = await Token.findOneAndDelete({ userId: user._id });

    if (deletedToken) {
      console.log(`Token for userId deleted: ${user._id}`);
    } else {
      console.log(`No token found for userId: ${user._id}`);
    }
  } catch (error) {
    console.error(`Error deleting token: ${error.message}`);
  }

  //create Reset token
  const resetToken = generateToken(user._id);

  //Hash token before Saving to DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
  //Save Token to DB
  await new Token({
    userId: user._id,
    token: resetToken,
  }).save();

  const randomText = generateRandomString(12);
  //construct Reset URL
  const environment = process.env.ENVIRONMENT;
  const resetUrl = `${adminfrontEndUrl[environment]}reset-password?token=${resetToken}&&jzhdh=${randomText}`;

  // Reset Email
  const message = `
                <h2> Hello ${user.lastname},</h2>
                <p> Please use the url below to reset your password </p>
                <p> This reset link is valid for only 5 minutes </p>
                
                <a href=${resetUrl} clicktracking = off > ${resetUrl}</a>
                
                <p> Regards ... </p>
                <p> Awarri LLM Team. </p>`;
  const subject = "Password Reset Request";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, sent_from);
    respondsSender(resetUrl, "Reset Email Sent", ResponseCode.successful, res);
  } catch (error) {
    respondsSender(
      null,
      "Email not Sent, Please try again" + error.message,
      ResponseCode.internalServerError,
      res
    );
  }
});

//Reset Password
const resetPassword = asynchandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.body;
  console.log(resetToken);
  if (!password || !resetToken) {
    respondsSender(
      null,
      "password and reset token needed",
      ResponseCode.badRequest,
      res
    );
  }

  //Find Token in DB before reseting
  const userToken = await Token.findOne({
    token: resetToken,
  });

  if (!userToken) {
    respondsSender(
      null,
      "Invalid or Expired Token",
      ResponseCode.invalidToken,
      res
    );
  }

  //Find user
  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();
  //delete token from db
  try {
    // Find and delete the token based on userId
    const deletedToken = await Token.findOneAndDelete({ userId: user._id });

    if (deletedToken) {
      console.log(`Deleted token for userId: ${user._id}`);
    } else {
      console.log(`No token found for userId: ${user._id}`);
    }
  } catch (error) {
    console.error(`Error deleting token: ${error.message}`);
  }
  respondsSender(
    null,
    "Password Reset Successful, Please Login",
    ResponseCode.successful,
    res
  );
});

// Get Accent of User
const getAccent = asynchandler(async (req, res) => {
//  const allAccents
  respondsSender(accents, "Successful", ResponseCode.successful, res);
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyUser,
  getAccent,
  runUserUpdate,

};
