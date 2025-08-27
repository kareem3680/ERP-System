const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  }
);

const settingModel = mongoose.model("Setting", settingSchema);

module.exports = settingModel;
