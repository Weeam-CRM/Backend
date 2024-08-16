const mongoose = require("mongoose");
const adminApproval = require("../../model/schema/adminApproval");

const add = async (req, res) => {
  console.log(req.body);
  const { leadName, leadId, agentName, agentId, mangerName, managerId } =
    req.body;
  const newApproval = new adminApproval({
    leadName,
    leadId,
    agentName,
    agentId,
    mangerName,
    managerId,
  });
  try {
    await newApproval.save();
    console.log("Approval Data saved", newApproval);
    res.status(200).json({ message: "Successfully Saved", data: newApproval });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { add };
