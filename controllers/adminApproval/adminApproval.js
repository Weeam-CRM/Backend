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
const get = async (req, res) => {
  try {

    const ReturnData= await adminApproval.find({})
     res.status(200).json(ReturnData);
  } catch (error) {
    console.log(error)
  }
};
const responseFromAdmin = async (req, res) => {
  try {
    const { isManger, isApproved, objectId } =
    req.body;
    await adminApproval.deleteOne({id : objectId})
  } catch (error) {
    console.log(error)
  }
};

const reject = async () => {

}

module.exports = { add, get,reject };
