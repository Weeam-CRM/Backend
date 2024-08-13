const mongoose = require("mongoose");

const fetchSchemaFields = async () => {
  const CustomFieldModel = mongoose.model("CustomField");
  return await CustomFieldModel.find({ moduleName: "Lead" });
};

const leadSchema = new mongoose.Schema({
  managerAssigned: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    default: "",
    set: (v) => (v === "" ? null : v),
  },
  agentAssigned: {
    type: mongoose.Schema.ObjectId,
    default: "",
    ref: "User",
    set: (v) => (v === "" ? null : v),
  },
  leadStatus: {
    type: String,
    default: "",
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  intID: {
    type: Number, 
    required: true
  }, 
  updatedDate: {
    type: Date,
    default: Date.now,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  createBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    default: "",
    set: (v) => (v === "" ? null : v),
  },
});

const initializeLeadSchema = async () => {
  const schemaFieldsData = await fetchSchemaFields();
  schemaFieldsData[0]?.fields?.forEach((item) => {
    leadSchema.add({
      [item.name]: {
        type: item?.backendType,
        default: null,
      },
    });
  });
};

const Lead = mongoose.model("Lead", leadSchema, "Lead");
module.exports = { Lead, initializeLeadSchema };
