const User = require("../../model/schema/user");
const LeadNote = require("../../model/schema/leadnote"); 

const index = async (req, res) => {
  try {
    const allNotes = await LeadNote.find({leadID: req.params.lid}).populate({
      path: "addedBy"
    }).exec(); 
    res.json(allNotes || []);
    
  } catch (error) {
    console.error("Failed to fetch leadnotes:", error);
    res.status(400).json({ error: "Failed to fetch lead notes" });
  }
};


const add = async (req, res) => {
  try {
    const newLeadNote = new LeadNote({
      note: req.body.note, 
      addedBy: req.user.userId, 
      leadID: req.body.leadID
    })
    await newLeadNote.save(); 
    res.json({
      status: true, 
      message: "Successfully added a lead note"
    })
  } catch (err) {
    console.error("Failed to create leadnote:", err);
    res.status(400).json({ error: "Failed to create leadnote" });
  }
};

module.exports = {
  index,
  add,

};
