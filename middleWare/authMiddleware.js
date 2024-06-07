const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const { respondsSender } = require("./respondsHandler");
const { ResponseCode } = require("../utils/responseCode");

const protect = (usertype) => {
  return asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    let allowedRole;
      if (usertype==="specialUser"){
        allowedRole=req.body.role;
      }
      else{
        usertype= usertype;
      }


    if (!authHeader) {
      return respondsSender(
        null,
        "Authorization header missing please login",
        ResponseCode.unAuthorized,
        res
      );
    }

    try {
      const bearerToken = authHeader.split(" ")[1];

      const tokens = await Token.find({ token: bearerToken });

      if (tokens.length === 0) {
        return respondsSender(
          null,
          "Not authorized, Please login: Bad Token",
          ResponseCode.invalidToken,
          res
        );
      }

      jwt.verify(
        bearerToken,
        process.env.JWT_SECRET,
        async (err, decodedToken) => {
          if (err) {
            return respondsSender(
              null,
              "Invalid token",
              ResponseCode.invalidToken,
              res
            );
          } else {
            req.userId = tokens[0].userId;
            req.loginStatus = true;
            req.usertoken = decodedToken;

            try {
              const user = await User.findOne({ _id: req.userId });
              if (!user || user.role !== allowedRole) {
                return respondsSender(
                  null,
                  "You are not allowed here",
                  ResponseCode.noData,
                  res
                );
              }

              next();
            } catch (error) {
              return respondsSender(
                null,
                `Error: ${error}`,
                ResponseCode.noData,
                res
              );
            }
          }
        }
      );
    } catch (error) {
      return respondsSender(
        null,
        "Not authorized, Please login" + error,
        ResponseCode.unAuthorized,
        res
      );
    }
  });
};

module.exports = protect;
