const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [2, "Too short project name"],
      maxlength: [100, "Too long project name"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Too long project description"],
    },
    client: {
      type: mongoose.Schema.ObjectId,
      ref: "Client",
      required: [true, "Project must belong to a client"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["planned", "in-progress", "completed", "on-hold", "cancelled"],
      default: "planned",
    },
    budget: {
      type: Number,
      min: [0, "Budget cannot be negative"],
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Project must have a creator"],
    },
  },
  { timestamps: true }
);

const projectModel = mongoose.model("Project", projectSchema);

module.exports = projectModel;
