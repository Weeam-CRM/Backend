const { Lead } = require("../../model/schema/lead");
const EmailHistory = require("../../model/schema/email");
const User = require("../../model/schema/user");
const PhoneCall = require("../../model/schema/phoneCall");
const Task = require("../../model/schema/task");
const MeetingHistory = require("../../model/schema/meeting");
const DocumentSchema = require("../../model/schema/document");

function toUTC(dateString) {
  const localDate = new Date(dateString);
  return new Date(
    Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate(),
      localDate.getHours(),
      localDate.getMinutes(),
      localDate.getSeconds()
    )
  );
}

const index = async (req, res) => {
  const query = req.query;
  const role = query?.role;
  const userID = query.user;

  const dateTime = req.query?.dateTime?.split("|");
  const isDateTime = dateTime?.some((d) => d);

  if (role) {
    delete query["role"];
  }
  const q = {
    deleted: false,
  };

  // DateTime range filter
  if (isDateTime && dateTime[0]) {
    const from = new Date(toUTC(dateTime[0]));
    q["createdDate"] = { $gte: from };
  }
  if (isDateTime && dateTime[1]) {
    const to = new Date(toUTC(dateTime[1]));
    if (q["createdDate"]) {
      q["createdDate"]["$lte"] = to;
    }
  }

  let allData = [];

  if (role === "Manager") {
    allData = await Lead.find({ ...q, managerAssigned: userID })
      .populate({
        path: "createBy",
        match: { deleted: false }, // Populate only if createBy.deleted is false
      })
      .sort({ createdDate: -1 })
      .exec();
  } else if (role === "Agent") {
    allData = await Lead.find({ ...q, agentAssigned: userID })
      .populate({
        path: "createBy",
        match: { deleted: false }, // Populate only if createBy.deleted is false
      })
      .sort({ createdDate: -1 })
      .exec();
  } else {
    allData = await Lead.find(q)
      .populate({
        path: "createBy",
        match: { deleted: false }, // Populate only if createBy.deleted is false
      })
      .sort({ createdDate: -1 })
      .exec();
  }

  const result = allData;
  res.json(result);
};

const addMany = async (req, res) => {
  try {
    const data = req.body;
    const insertedLead = await Lead.insertMany(data);

    const updateUser = await User.findById(req.user.userId);
    if (updateUser) {
      updateUser.leadsCreated = updateUser.leadsCreated + (data?.length || 0);
      await updateUser.save();
    }

    res.status(200).json(insertedLead);
  } catch (err) {
    console.error("Failed to create Lead :", err);
    res.status(400).json({ error: "Failed to create Lead" });
  }
};

const changeStatus = async (req, res) => {
  try {
    const { leadStatus } = req.body;
    let result = await Lead.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { leadStatus: leadStatus } },
      { new: true }
    );

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    return res
      .status(200)
      .json({ message: "Status Change Successfully", result });
  } catch (err) {
    console.error("Failed to change status:", err);
    return res.status(400).json({ error: "Failed to change status : ", err });
  }
};

const add = async (req, res) => {
  try {
    req.body.createdDate = new Date();
    const user = new Lead(req.body);

    const updateUser = await User.findById(user?.createBy);
    if (updateUser) {
      updateUser.leadsCreated = updateUser.leadsCreated + 1;
      await updateUser.save();
    }
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.error("Failed to create Lead:", err);
    res.status(400).json({ error: "Failed to create Lead" });
  }
};

const addFromCampaign = async (req, res) => {
  try {
    req.body.createdDate = new Date();

    console.log(req.body);

    const newLead = {};

    if (req.body["form_fields[name]"]) {
      newLead["leadName"] = req.body["form_fields[name]"];
    }

    if (req.body["form_fields[mobile]"]) {
      newLead["leadPhoneNumber"] = req.body["form_fields[mobile]"];
    }

    if (req.body["form_fields[whatsapp]"]) {
      newLead["leadWhatsappNumber"] = req.body["form_fields[whatsapp]"];
    }

    if (req.body["form_fields[nationality]"]) {
      newLead["nationality"] = req.body["form_fields[nationality]"];
    }

    if (req.body["form_fields[interest]"]) {
      newLead["interest"] = req.body["form_fields[interest]"];
    }

    if (req.body["form_fields[r_u_in_uae]"]) {
      newLead["r_u_in_uae"] = req.body["form_fields[r_u_in_uae]"];
    }

    if (req.body["form_fields[timetocall]"]) {
      newLead["timetocall"] = req.body["form_fields[timetocall]"];
    }

    const user = new Lead(newLead);
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.error("Failed to create Lead:", err);
    res.status(400).json({ error: "Failed to create Lead" });
  }
};

const edit = async (req, res) => {
  try {
    let result = await Lead.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to Update Lead:", err);
    res.status(400).json({ error: "Failed to Update Lead" });
  }
};

const view = async (req, res) => {
  let lead = await Lead.findOne({ _id: req.params.id });
  if (!lead) return res.status(404).json({ message: "no Data Found." });

  let query = req.query;
  if (query.sender) {
    query.sender = new mongoose.Types.ObjectId(query.sender);
  }
  query.createByLead = req.params.id;

  let Email = await EmailHistory.aggregate([
    { $match: { createByLead: lead._id } },
    {
      $lookup: {
        from: "Lead", // Assuming this is the collection name for 'leads'
        localField: "createByLead",
        foreignField: "_id",
        as: "createByrefLead",
      },
    },
    {
      $lookup: {
        from: "User",
        localField: "sender",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$createByRef", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$createByrefLead", preserveNullAndEmptyArrays: true } },
    { $match: { "users.deleted": false } },
    {
      $addFields: {
        senderName: { $concat: ["$users.firstName", " ", "$users.lastName"] },
        deleted: {
          $cond: [
            { $eq: ["$createByRef.deleted", false] },
            "$createByRef.deleted",
            { $ifNull: ["$createByrefLead.deleted", false] },
          ],
        },
        createByName: {
          $cond: {
            if: "$createByRef",
            then: {
              $concat: [
                "$createByRef.title",
                " ",
                "$createByRef.firstName",
                " ",
                "$createByRef.lastName",
              ],
            },
            else: { $concat: ["$createByrefLead.leadName"] },
          },
        },
      },
    },
    {
      $project: {
        createByRef: 0,
        createByrefLead: 0,
        users: 0,
      },
    },
  ]);

  let phoneCall = await PhoneCall.aggregate([
    { $match: { createByLead: lead._id } },
    {
      $lookup: {
        from: "Lead", // Assuming this is the collection name for 'leads'
        localField: "createByLead",
        foreignField: "_id",
        as: "createByrefLead",
      },
    },

    {
      $lookup: {
        from: "User",
        localField: "sender",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$createByrefLead", preserveNullAndEmptyArrays: true } },
    { $match: { "users.deleted": false } },
    {
      $addFields: {
        senderName: { $concat: ["$users.firstName", " ", "$users.lastName"] },
        deleted: "$createByrefLead.deleted",
        createByName: "$createByrefLead.leadName",
      },
    },
    { $project: { createByrefLead: 0, users: 0 } },
  ]);

  let task = await Task.aggregate([
    { $match: { assignmentToLead: lead._id } },
    {
      $lookup: {
        from: "Lead",
        localField: "assignmentToLead",
        foreignField: "_id",
        as: "lead",
      },
    },
    {
      $lookup: {
        from: "User",
        localField: "createBy",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$lead", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        // assignmentToName: lead.leadName,
        assignmentToName: "$lead.leadName",
        createByName: "$users.username",
      },
    },
    { $project: { lead: 0, users: 0 } },
  ]);

  let meeting = await MeetingHistory.aggregate([
    {
      $match: {
        $expr: {
          $and: [{ $in: [lead._id, "$attendesLead"] }],
        },
      },
    },
    {
      $lookup: {
        from: "Lead",
        localField: "assignmentToLead",
        foreignField: "_id",
        as: "lead",
      },
    },
    {
      $lookup: {
        from: "User",
        localField: "createdBy",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        attendesArray: "$lead.leadEmail",
        createdByName: "$users.username",
      },
    },
    {
      $project: {
        users: 0,
      },
    },
  ]);
  const Document = await DocumentSchema.aggregate([
    { $unwind: "$file" },
    { $match: { "file.deleted": false, "file.linkLead": lead._id } },
    {
      $lookup: {
        from: "User", // Replace 'users' with the actual name of your users collection
        localField: "createBy",
        foreignField: "_id", // Assuming the 'createBy' field in DocumentSchema corresponds to '_id' in the 'users' collection
        as: "creatorInfo",
      },
    },
    { $unwind: { path: "$creatorInfo", preserveNullAndEmptyArrays: true } },
    { $match: { "creatorInfo.deleted": false } },
    {
      $group: {
        _id: "$_id", // Group by the document _id (folder's _id)
        folderName: { $first: "$folderName" }, // Get the folderName (assuming it's the same for all files in the folder)
        createByName: {
          $first: {
            $concat: ["$creatorInfo.firstName", " ", "$creatorInfo.lastName"],
          },
        },
        files: { $push: "$file" }, // Push the matching files back into an array
      },
    },
    { $project: { creatorInfo: 0 } },
  ]);

  res.status(200).json({ lead, Email, phoneCall, task, meeting, Document });
};

const deleteData = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { deleted: true });

    const updateUser = await User.findById(lead.createBy);
    if (updateUser) {
      updateUser.leadsCreated = updateUser.leadsCreated - 1;
      await updateUser.save();
    }
    res.status(200).json({ message: "done", lead });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

const deleteMany = async (req, res) => {
  try {
    const lead = await Lead.updateMany(
      { _id: { $in: req.body } },
      { $set: { deleted: true } }
    );
    //   const updateUser = await User.findById(user?.createBy);
    // if(updateUser) {
    //     updateUser.leadsCreated = updateUser.leadsCreated - (req.body?.length | 0);
    //     await updateUser.save();
    // }
    res.status(200).json({ message: "done", lead });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

module.exports = {
  index,
  add,
  addMany,
  view,
  edit,
  deleteData,
  deleteMany,
  changeStatus,
  addFromCampaign,
};
