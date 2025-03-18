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
    approvalStatus:"pending"
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
   
     const response =  await adminApproval.findByIdAndUpdate( { _id: objectId }, 
      { $set: { approvalStatus: isApproved?"Accepted":"Rejected" } })
    res.status(200).json({status:isApproved?true:false,message:"Status updated successfully"})
  } catch (error) {
    console.log(error)
  }
};



module.exports = { add, get, responseFromAdmin};
