const mongoose = require("mongoose");
const { Schema } = mongoose;

const itemSchema = new Schema({
  label: String,
  qty: Number,
  sqft: Number,
  sqm: Number,
});

const mtoSchema = new Schema({
  quotationId: { type: Schema.Types.ObjectId, ref: "QuotationEditor", required: true },
  projectId: { type: String, required: true },
  items: [itemSchema],
  generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MTO", mtoSchema);
