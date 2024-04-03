const asynchandler = require("express-async-handler");
const User = require("../models/userModel");
const daStatus = require("../models/dAssignmentStatus");
const Token = require("../models/tokenModel");
const subDialogue = require("../models/subDialogueModel");
const userTask = require("../models/userTaskModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { respondsSender } = require('../middleWare/respondsHandler');
const { ResponseCode } = require('../utils/responseCode');




const generateToken = (id) => {
    const timestamp = Date.now();
    const expirationTime = 6 * 60 * 1000; // 6 minutes in milliseconds
    const expirationDate = timestamp + expirationTime;
    const token = jwt.sign({ id, exp: expirationDate }, process.env.JWT_SECRET);
    return token;
  };

//kindly ignore but don't delete
function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
}


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
        tribe,
        ethnicity,
        consent,
        password,
      } = req.body;
  
      // Validation Check
      if (!firstname || !lastname || !email || !gender || !dateOfBirth || !accent || !tribe || !ethnicity || !consent || !password) {
       
        respondsSender(null, "Please fill in all required fields", ResponseCode.badRequest, res);  

      }
      if (password.length < 6) {
            respondsSender(null, "Password must be at least 6 characters", ResponseCode.badRequest, res); 
      }
      const lowerEmail = email.toLowerCase();
      console.log(lowerEmail);
      // Validation check if user email already exists  
      const userExists = await User.findOne({ email:lowerEmail });
      if (userExists) {
        respondsSender(null, "User already registered", ResponseCode.dataDuplication, res); 
       
      }
  
      // Add user info to the database
      const user = await User.create({
        firstname,
        lastname,
        email:lowerEmail,
        gender,
        dateOfBirth,
        accent,
        tribe,
        ethnicity,
        consent,
        password,
        verified: false,
      });
  
      // User was successfully created, perform your desired action here
      const randomText = generateRandomString(12);

      // Construct Reset URL
      const verifyUrl = `${process.env.FRONTEND_URL}verify?userid=${user._id}&&awarrillmNOW=${randomText}`;
  
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
      console.log(verifyUrl);
      const response={
        message:"Verification Email Sent",
        url:verifyUrl,
        mail:message
        }

    //res.status(200).json(response);
    respondsSender(response, "successful", ResponseCode.successful, res); 
    } catch (error) {
      // Handle any errors that occurred during user registration
      console.error("Error registering user:", error);
       respondsSender(data, "Registration Failed"+(error.message), ResponseCode.internalServerError, res); 

    }
});
  

// Verify User Registration
const verifyUser = asynchandler (async (req,res) => {
    const { id } = req.params;
    //check if User exist 
    const user = await User.findOne({_id:id})
    if(!user){
        respondsSender(null, "User not Found Please Sign-up", ResponseCode.noData, res);         
    }
    // check if user already verified
    if (user.verified==true) {      
        respondsSender(null, "User Already Verified,  please Login", ResponseCode.dataDuplication, res);    
    }
    else 
    {
        // set Verification to true
        user.verified = true;
        await user.save();
        respondsSender(null, "User Successfully Verified", ResponseCode.successful, res); 
    }
});


//Login user
const loginUser = asynchandler(async(req,res) => {
    const { email, password} = req.body 

        
    //validate Request
    if (!email || !password) {
        respondsSender(null, "Please Add Email and password", ResponseCode.badRequest, res); 
    }
    const lowerEmail = email.toLowerCase();
    //Check if user Exists
    const user = await User.findOne({email:lowerEmail}) 
    if(!user) {
        respondsSender(null, "User not Found Please Sign-up", ResponseCode.noData, res); 
       }

       // User exists, check if password is correct
       const passwordIsCorrect = await bcrypt.compare(password, user.password)
    
       if (user && passwordIsCorrect){  
        if(user.verified==true){         
               
                //Generate Login Token
                const token = generateToken(user._id)
               
                //delete all user previous token
                const deletionResult = await Token.deleteMany({ userId: user._id });
                
                //save token to token db
                const savedToken = await Token.create({
                    userId:user._id,
                    token,
                  });
                

              const data= {
                userInfo:{
                    _id:user._id,
                    firstname:user.firstname,
                    lastname:user.lastname,
                    email:user.email,
                    gender:user.gender,
                    dateOfBirth:user.dateOfBirth,
                    accent:user.accent,
                    tribe:user.tribe,
                    ethnicity:user.ethnicity,
                    },
                 token:token
              }

            // Check Tasks
            const foundDaStatus = await daStatus.findOne({userId: user._id, status: true}) 
           
        if (!foundDaStatus) {
                try {
                    // Retrieve all subDialogues from the database where assignmentStatus is false
                    const allSubDialogues = await subDialogue.find({ assignmentStatus: false });

   respondsSender(allSubDialogues, "User tasks already exist", ResponseCode.successful, res); 
                    // Initialize an array to store the selected subDialogues
                    const selectedSubDialogues = [];

                    // Select up to 5 subDialogues
                    for (let i = 0; i < 5 && i < allSubDialogues.length; i++) {
                        selectedSubDialogues.push(allSubDialogues[i]);
                    }

                    // Initialize a variable to keep track of the alternating assignment status
                    let assign = true;

                    // Iterate over the selected subDialogues
                    for (let i = 0; i < selectedSubDialogues.length; i++) {
                        const subDialogueItem = selectedSubDialogues[i];

                        // Create a new user task
                        const newUserTask = new userTask({
                            taskStatus: "Undone",
                            subDialogueId: subDialogueItem._id,
                            userId: user._id, // Replace with the actual user ID
                            type: "dialogue"
                        });

                        // Assign task or skip based on the alternating assign status
                        if (assign) {
                            await newUserTask.save();
                        }

                        // Toggle the assignment status for the next iteration
                        assign = !assign;
                    }

                    console.log("User tasks created successfully!");
                    respondsSender(selectedSubDialogues, "User tasks created successfully!", ResponseCode.successful, res); 
                } catch (error) {
                    console.error("Error creating user tasks:", error);
                    respondsSender(null, "Error creating user tasks", ResponseCode.internalServerError, res); 
                }
            } else {
                respondsSender(null, "User tasks already exist", ResponseCode.badRequest, res); 
            }

              respondsSender(data, "Login successful", ResponseCode.successful, res); 

            }
            else{
                //password and email is right but user is not verified resend verification mail

                respondsSender(null, "Please verify your email", ResponseCode.noData, res); 

            }
        } else{
           
            respondsSender(null, "Invalid email or Password", ResponseCode.noData, res); 
        } 
});


//Logout User 
const logout = asynchandler (async (req, res) =>{
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
                    path:"/",
                    httpOnly:true,
                    expires: new Date(0),
                    sameSite: "none",
                    secure: true
                }); 
                respondsSender(null, "Successfully Logged out", ResponseCode.successful, res); 
            } else {
                //clear token saved in server cookies
                res.cookie("token", "", { 
                    path:"/",
                    httpOnly:true,
                    expires: new Date(0),
                    sameSite: "none",
                    secure: true
                }); 
                respondsSender(null, "User was not logged in, all token linked to user cleared anyway", ResponseCode.successful, res); 
            }
        } catch (error) {
            
            respondsSender(null, `Error deleting tokens:  ${error.message}`, ResponseCode.internalServerError, res); 
        }

});


//Get User Profile data
const getUser = asynchandler( async (req,res) =>{
        const user = await User.findById(req.userId)

        if (user) {
            userInfo={
                _id:user._id,
                firstname:user.firstname,
                lastname:user.lastname,
                email:user.email,
                gender:user.gender,
                dateOfBirth:user.dateOfBirth,
                accent:user.accent,
                tribe:user.tribe,
                ethnicity:user.ethnicity,
                }
                respondsSender(userInfo, "User Profile displayed successfully", ResponseCode.successful, res);
        } else{
            respondsSender(null, "User Not Found", ResponseCode.noData, res);
        } 
});


//Get Login Status 
const loginStatus =  asynchandler( async (req,res) =>{
        
        if(!req.loginStatus){
            respondsSender(null, false, ResponseCode.badRequest, res);
        }
      //Verify  Token 
      respondsSender(null, true, ResponseCode.successful, res);
     
});


//Update User
const updateUser = asynchandler ( async (req, res) =>{
        const user = await User.findById(req.user._id)

        if(user){
            const{_id, name, email, photo, phone, bio} = user
            user.email = email;
            user.name = req.body.name || name
            user.phone = req.body.phone || phone;
            user.bio = req.body.bio || bio;
            user.photo = req.body.photo || photo;

            const updatedUser = await user.save()
            const user={
                    _id: updatedUser._id, 
            }
            respondsSender(user, "User Info updated successfully", ResponseCode.successful, res);
        }  else {
            respondsSender(null, "User Not Found", ResponseCode.noData, res);
        }
});  


// Change Password
const changePassword = asynchandler (async (req,res) =>{
       const user = await User.findById(req.user._id);
       const {oldPassword, password} = req.body
       if(!user) {
        respondsSender(null, "User Not Found, Please Sign-up", ResponseCode.noData, res);
       }
       //validate
       if(!oldPassword || !password) {
        respondsSender(null, "Please add old and New Password", ResponseCode.noData, res);
       }

       //check if old password matched password in DB
       const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)
       
       //Save new Password
       if(user && passwordIsCorrect){
        user.password = password;
        await user.save();
        
        respondsSender(null, "Password changed Successfully", ResponseCode.successful, res);
       } else{
        respondsSender(null, "Old Password is Incorrect", ResponseCode.noData, res);
       }

});


//Forgot Password Process
const forgotPassword = asynchandler (async (req, res) =>{
         const{email} = req.body
         if(!email){
            respondsSender(null, "Please add an email", ResponseCode.badRequest, res);
         }
         const user  = await User.findOne({email})
         if(!user){
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
         const resetToken = generateToken(user._id)
         
         //Hash token before Saving to DB
        //  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
         //Save Token to DB
         await new Token ({
            userId: user._id,
            token: resetToken,
         }).save()

         const randomText = generateRandomString(12);
         //construct Reset URL
            const resetUrl = `${process.env.FRONTEND_URL}reset-password?token=${resetToken}&&jzhdh=${randomText}`
         
         // Reset Email 
         const message = `
                <h2> Hello ${user.lastname},</h2>
                <p> Please use the url below to reset your password </p>
                <p> This reset link is valid for only 5 minutes </p>
                
                <a href=${resetUrl} clicktracking = off > ${resetUrl}</a>
                
                <p> Regards ... </p>
                <p> Awarri LLM Team. </p>`;
                const subject = "Password Reset Request"
                const send_to = user.email  
                const sent_from = process.env.EMAIL_USER
 
                try {
                    await sendEmail(subject, message, send_to, sent_from)
                    respondsSender(resetUrl, "Reset Email Sent", ResponseCode.successful, res);

                } catch (error) {
                    
                    respondsSender(null, "Email not Sent, Please try again"+error.message, ResponseCode.internalServerError, res);
                }
                
            
});

//Reset Password
const resetPassword = asynchandler( async (req, res) =>{
            const {password} = req.body
            const {resetToken} = req.body
            console.log(resetToken);
            if (!password || !resetToken) {
                respondsSender(null, "password and reset token needed", ResponseCode.badRequest, res);
            }

            //Hash token,  then Compare to Token in DB
            const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        
            //Find Token in DB before reseting
            const userToken = await Token.findOne({
                token: resetToken,
            })
        
        if(!userToken){
           
            respondsSender(null, "Invalid or Expired Token", ResponseCode.invalidToken, res);
        }
    
        //Find user
        const user = await User.findOne({_id: userToken.userId})
        user.password = password
        await user.save()
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
        respondsSender(null, "Password Reset Successful, Please Login", ResponseCode.successful, res);
});

// Get Accent of User
const getAccent = asynchandler(async (req, res) => {
    const allAccents = ["Yoruba", "Hausa", "Igbo"];
    respondsSender(allAccents, "Successful", ResponseCode.successful, res)
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
    getAccent
}  