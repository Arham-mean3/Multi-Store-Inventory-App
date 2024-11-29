const mongoose = require("mongoose");

const processingStateSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => mongoose.Types.ObjectId(), // Use MongoDB's ObjectId for better performance
    unique: true,
  },
  key: {
    type: String,
    unique: true,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const ProcessingState = mongoose.model(
  "ProcessingState",
  processingStateSchema,
);
