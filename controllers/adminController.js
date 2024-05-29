const User = require("../models/userModel");
const LoginStatus = require("../models/LoginStatusModel");

const Language = require("../models/languageModel");
const TaskQueues = require("../models/taskQueuesModel");
const { respondsSender } = require("../middleWare/respondsHandler");
const { ResponseCode } = require("../utils/responseCode");
const asynchandler = require("express-async-handler");
const { COMPLETED, REJECTED } = require("../utils/constant");

// Get User Info displayed
const searchUser = asynchandler(async (req, res) => {
  try {
    const { request } = req.query;

    if (!request) {
      return res
        .status(404)
        .json({ message: "User not found, please pass a search request" });
    }

    const queryWords = request.split(" ");

    // Create an array of search conditions for each word
    const searchConditions = queryWords.map((word) => ({
      $or: [
        { firstname: { $regex: word, $options: "i" } },
        { lastname: { $regex: word, $options: "i" } },
        { email: { $regex: word, $options: "i" } },
        { gender: { $regex: word, $options: "i" } },
        { accent: { $regex: word, $options: "i" } },
      ],
    }));

    // Combine the conditions using $and to ensure each word must match at least one field
    const searchQuery = { $and: searchConditions };

    // Perform the search query
    const userDisplay = await User.find(searchQuery);

    if (!userDisplay || userDisplay.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch login status details
    const loginStatusPromises = userDisplay.map((user) =>
      LoginStatus.findOne({ userId: user._id })
    );
    const loginStatusResults = await Promise.all(loginStatusPromises);

    // Combine user info and login status
    const DisplayInfo = userDisplay.map((user, index) => ({
      name: `${user.firstname} ${user.lastname}`,
      role: user.role,
      email: user.email,
      status: loginStatusResults[index]?.status || "Status not found",
      lastLogin: loginStatusResults[index]?.lastLogin || "Last login not found",
    }));

    res.status(200).json({
      message: "User information successfully displayed",
      data: DisplayInfo,
    });
  } catch (error) {
    res.status(500).json({
      message: `Internal Server Error: ${error.message}`,
    });
  }
});

// Get Statistical Info of Tasks displayed
const getTaskDetails = asynchandler(async (req, res) => {
  try {
    const { language } = req.query;

    // Fetch total number of tasks for the selected language
    const totalTasks = await TaskQueues.countDocuments({ language });

    // Fetch the number of audited tasks for the selected language
    const auditedTasks = await TaskQueues.countDocuments({
      language,
      auditorStatus: true,
      auditorRemark: COMPLETED,
    });

    // Fetch the number of rejected tasks for the selected language
    const rejectedTasks = await TaskQueues.countDocuments({
      language,
      auditorStatus: true,
      auditorRemark: REJECTED,
    });

    if (totalTasks === 0) {
      return respondsSender(
        {
          totalTasks: 0,
          auditedTasks: {
            count: 0,
            percentage: 0,
          },
          rejectedTasks: {
            count: 0,
            percentage: 0,
          },
        },
        "No tasks found for the selected language",
        ResponseCode.noData,
        res
      );
    }

    // Calculate percentages
    const auditedPercentage = (auditedTasks / totalTasks) * 100;
    const rejectedPercentage = (rejectedTasks / totalTasks) * 100;

    // Send the response using respondsSender
    respondsSender(
      {
        totalTasks,
        auditedTasks: {
          count: auditedTasks,
          percentage: auditedPercentage,
        },
        rejectedTasks: {
          count: rejectedTasks,
          percentage: rejectedPercentage,
        },
      },
      "Task statistics fetched successfully",
      ResponseCode.successful,
      res
    );
  } catch (error) {
    respondsSender(
      null,
      `Server error: ${error}`,
      ResponseCode.internalServerError,
      res
    );
  }
});

module.exports = {
  searchUser,
  getTaskDetails,
};
