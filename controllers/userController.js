const asynchandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");



const generateToken = (id) => {
return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:"1d"})
};

// register user Function
const registerUser = asynchandler( async (req, res) => {
    const{name, email, password} = req.body
       //Validation Check
       if(!name || !email || !password )  {
        res.status(400)
        throw new Error("Please fill in all required fields")
       } 
        if (password.length < 6) {
            res.status(400)
            throw new Error ("password must be up to 6 characters ")
        }

        // Validation check if user email already exists

       const userExists = await User.findOne({email})
       if(userExists) {
        res.status(400)
        throw new Error ("Email has already been registered")
       }
        
       // create new user 

       const user = await User.create({name, email, password,
    })


        //Generate Token
         const token = generateToken(user._id)
    
         //Send HTTP-only cookie

        res.cookie("token", token, {
            path:"/",
            httpOnly:true,
            expires: new Date(Date.now() + 1000 * 86400), //1day
            sameSite: "none",
            secure: true
        }) 
    if (user) {
        const{_id,name,email, photo,phone, bio} = user
        res.status(201).json({
            _id, name, email, photo, phone, bio, token,
        });


    }else{
        res.status(400) 
        throw new Error("Invalid user Data") 
    }
    }

);

    //Login user

    const loginUser = asynchandler(async(req,res) => {
    const { email, password} = req.body 

    //validate Request
    if (!email || !password) {
        res.status(400);
        throw new Error ("Please Add Email and password")
    }

    //Check if user Exists
    const user = await User.findOne({email}) 
    if(!user) {
        res.status(400)
        throw new Error ("User not Found Please Sign-up")
       }

       // User exists, check if password is correct

       const passwordIsCorrect = await bcrypt.compare(password, user.password)

       //Generate Login Token
       const token = generateToken(user._id)
    
       //Send login HTTP-only cookie

      res.cookie("token", token, {
          path:"/",
          httpOnly:true,
          expires: new Date(Date.now() + 1000 * 86400), //1day
          sameSite: "none",
          secure: true
      }) 
    
       if (user && passwordIsCorrect){
            const{_id,name,email, photo,phone, bio} = user
            res.status(200).json({
                _id, name, email, photo, phone, bio, token,
            });
        } else{
            res.status(400)
            throw new Error("Invalid email or Password");
        } 
    });

    //Logout User 
    const logout = asynchandler (async (req, res) =>{
        res.cookie("token", "", {
            path:"/",
            httpOnly:true,
            expires: new Date(0),
            sameSite: "none",
            secure: true
        }); 
        return res.status(200).json({message: "Successfully Logged out"})
    })

    //Get User Profile data

    const getUser = asynchandler( async (req,res) =>{
        const user = await User.findById(req.user._id)

        if (user) {
            const{_id,name,email, photo,phone, bio} = user
            res.status(200).json({
                _id, name, email, photo, phone, bio,
            });
        } else{
            res.status(400)
            throw new Error("User Not Found");
        } 
    })

    //Get Login Status
 
    const loginStatus =  asynchandler( async (req,res) =>{
        const token = req.cookies.token;
        if(!token){
            return res.json(false)
        }
      //Verify  Token 
      const verified = jwt.verify(token, process.env.JWT_SECRET)
      if(verified) {
        return res.json(true)
      }
      return res.json(false)
    })

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
            res.status(200).json({
                    _id: updatedUser._id, 
                    name: updatedUser.name, 
                    email: updatedUser.email, 
                    photo: updatedUser.photo, 
                    phone: updatedUser.phone, 
                    bio: updatedUser.bio,
            })
        }  else {
            res.status(404)
            throw new  Error ("User not Found")
        }
    });  


    const changePassword = asynchandler (async (req,res) =>{
       const user = await User.findById(req.user._id);
       const {oldPassword, password} = req.body
       if(!user) {
        res.status(400)
        throw new Error ("User Not Found, Please Signup ")
       }
       //validate
       if(!oldPassword || !password) {
        res.status(404)
        throw new Error (" Please add old and New Password")
       }

       //check if old password matched password in DB
       const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)
       
       //Save new Password

       if(user && passwordIsCorrect){
        user.password = password;
        await user.save();
        res.status(200).send("Password changed Successfully")
       } else{
        res.status(400);
        throw new Error ("old Password is Incorrect")
       }

    })

    //forgot password Process
    const forgotPassword = asynchandler (async (req, res) =>{
         const{email} = req.body
         const user  = await User.findOne({email})
         if(!user){
            res.status(404)
            throw new Error("user does not exist")
         }

         // Delete token if it exists in DB
         let token = await Token.findOne({userId: user._id})

         //create Reset token
         let resetToken = crypto.randomBytes(32).toString("hex") + user._id 
         
            console.log(resetToken);
        
 
         //Hash token before Saving to DB
         const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
         //Save Token to DB
         await new Token ({
            userId: user.id,
            token: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now()+ 30 * (60 *1000) //Thirty Minutes
         }).save()

         //construct Reset URL
            const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`
         
         // Reset Email 
         const message = `
                <h2> Hello ${user.name},/h2>
                <p> Please use the url below to reset your password </p>
                <p> This reset link is valid for only 30 minutes </p>
                
                <a href=${resetUrl} clicktracking = off > ${resetUrl}</a>
                
                <p> Regards ... </p>
                <p> Inventory Team. </p>`;
                const subject = "Password Reset Request"
                const send_to = user.email  
                const sent_from = process.env.EMAIL_USER
 
                try {
                    await sendEmail(subject, message, send_to, sent_from)
                    res.status(200).json({success:true, message: "Reset Email Sent"})
                } catch (error) {
                    res.status(500)
                    throw new Error ("Email not Sent, Please try again")
                }
                
            
    })

    //Reset Password
        const resetPassword = asynchandler( async (req, res) =>{
            const {password} = req.body
            const {resetToken} = req.params
        
            //Hash token,  then Compare to Token in DB
            const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        
            //Find Token in DB before reseting
            const userToken = await Token.findOne({
                token: hashedToken,
                expiresAt:{$gt: Date.now() }
            })
        
        if(!userToken){
            res.status(404);
            throw new Error ("Invalid or Expired Token");
        }
    
        //Find user
        const user = await User.findOne({_id: userToken.userId})
        user.password = password
        await user.save()
        res.status(200).json({
            message:"Password Reset Successful, Please Login"
        })
    })

 
module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword
}  