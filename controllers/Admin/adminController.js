const User = require("../../models/userModel");
const LoginStatus = require("../../models/loginStatusModel");
const Status = require("../../models/annotatorAuditorStatusModel");
const Language = require("../../models/languageModel");
const TaskQueues = require("../../models/taskQueuesModel")
const { respondsSender } = require("../../middleWare/respondsHandler");
const { ResponseCode } = require("../../utils/responseCode");
const asynchandler = require("express-async-handler");
const { COMPLETED, REJECTED } = require("../../utils/constant");


const getStats = asynchandler(async (req, res) => {
  try {
    // Fetch all users with the role 'QA'
    const QAs = await User.find({ role: 'QA' });

    // Extract the user IDs of these QA users
    const QaIds = QAs.map(user => user._id);

    // Fetch statuses of these QA users
    const qaStatuses = await Status.find({ userId: { $in: QaIds } }).populate('userId');

    // Extract status counts for QA users
    const totalQA = QaIds.length;
    const activeQAs = qaStatuses.filter(status => status.status === 'active').map(status => status.userId);
    const inactiveQAs = qaStatuses.filter(status => status.status === 'inactive').map(status => status.userId);
    const disabledQAs = qaStatuses.filter(status => status.status === 'disabled').map(status => status.userId);
    const removedQAs = qaStatuses.filter(status => status.status === 'deleted').map(status => status.userId);

    // Fetch all Annotator users with active statuses
    const activeAnnotatorStatuses = await Status.find({ status: 'active' }).populate({
      path: 'userId',
      match: { role: 'ANNOTATOR' }
    }).exec();

    const activeAnnotators = activeAnnotatorStatuses.map(status => status.userId).filter(user => user !== null);

    // Fetch all active Admin users
    const activeAdminStatuses = await Status.find({ status: 'active' }).populate({
      path: 'userId',
      match: { role: 'ADMIN' }
    }).exec();

    const activeAdmins = activeAdminStatuses.map(status => status.userId).filter(user => user !== null);

    // Send response with detailed QA stats
    res.json({
      totalQA,
      activeQAs: activeQAs.length,
      inactiveQAs: inactiveQAs.length,
      disabledQAs: disabledQAs.length,
      removedQAs: removedQAs.length,
      activeAnnotators: activeAnnotators.length,
      activeAdmins: activeAdmins.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getCompletedTasks = asynchandler(async (req, res) => {
    try {
    const igboAnnotatedTask = await TaskQueues.countDocuments({ language: 'Igbo', annotatorRemark: 'COMPLETED' });
   const yorubaAnnotatedTask = await TaskQueues.countDocuments({ language: 'yoruba', annotatorRemark: 'COMPLETED' });
   const hausaAnnotatedTask = await TaskQueues.countDocuments({ language: 'hausa', annotatorRemark: 'COMPLETED' });
   const efikAnnotatedTask = await TaskQueues.countDocuments({ language: 'efik', annotatorRemark: 'COMPLETED' });
   const nigerianEnglishAnnotatedTask = await TaskQueues.countDocuments({ language: 'nigerianEnglish', annotatorRemark: 'COMPLETED' });
   const pidginAnnotatedTask = await TaskQueues.countDocuments({ language: 'pidgin', annotatorRemark: 'COMPLETED' });
   const uroboAnnotatedTask = await TaskQueues.countDocuments({ language: 'urobo', annotatorRemark: 'COMPLETED' });
  
   const igboAuditedTask = await TaskQueues.countDocuments({ language: 'Igbo', auditorRemark: 'COMPLETED' });
   const yorubaAuditedTask = await TaskQueues.countDocuments({ language: 'yoruba', auditorRemark: 'COMPLETED' });
   const hausaAuditedTask = await TaskQueues.countDocuments({ language: 'hausa', auditorRemark: 'COMPLETED' });
   const efikAuditedTask = await TaskQueues.countDocuments({ language: 'efik', auditorRemark: 'COMPLETED' });
   const nigerianEnglishAuditedTask = await TaskQueues.countDocuments({ language: 'nigerianEnglish', auditorRemark: 'COMPLETED' });
   const pidginAuditedTask = await TaskQueues.countDocuments({ language: 'pidgin', auditorRemark: 'COMPLETED' });
   const uroboAuditedTask = await TaskQueues.countDocuments({ language: 'urobo', auditorRemark: 'COMPLETED' });
  
   res.json({
      igboAnnotatedTask,
     yorubaAnnotatedTask,
      hausaAnnotatedTask,
         efikAnnotatedTask,
    nigerianEnglishAnnotatedTask,
        pidginAnnotatedTask,
        uroboAnnotatedTask,
        igboAuditedTask,
        yorubaAuditedTask,
        hausaAuditedTask,
        efikAuditedTask,
        nigerianEnglishAuditedTask,
        pidginAuditedTask,
        uroboAuditedTask,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  const taskChart = asynchandler(async (req, res) => {
    await getCompletedTasks(req, res);
    res.status(200).json({
      message: "TaskChart displayed successfully",
      code: "successful"
    });
  });

// Get User Info displayed
const searchUser = asynchandler(async (req, res) => {
    try {
      const { request } = req.query;
  
      if (!request) {
        return res.status(404).json({ message: "User not found, please pass a search request" });
      }
  
      const queryWords = request.split(" ");
  
      // Create an array of search conditions for each word
      const searchConditions = queryWords.map(word => ({
        $or: [
          { firstname: { $regex: word, $options: 'i' } },
          { lastname: { $regex: word, $options: 'i' } },
          { email: { $regex: word, $options: 'i' } },
          { gender: { $regex: word, $options: 'i' } },
          { accent: { $regex: word, $options: 'i' } },
        ]
      }));
  
      // Combine the conditions using $and to ensure each word must match at least one field
      const searchQuery = { $and: searchConditions };
  
      // Perform the search query
      const userDisplay = await User.find(searchQuery);
  
      if (!userDisplay || userDisplay.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Fetch login status details
      const loginStatusPromises = userDisplay.map(user => 
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
        data: DisplayInfo
      });
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error: ${error.message}`
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
                }
            },
            'No tasks found for the selected language',
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
            }
        },
        'Task statistics fetched successfully',
        ResponseCode.successful,
        res
    );
} catch (error) {
    respondsSender(null, `Server error: ${error}`, ResponseCode.internalServerError, res)
  }
});



module.exports = {
    searchUser,
    getTaskDetails,
    getStats, 
    getCompletedTasks
};
