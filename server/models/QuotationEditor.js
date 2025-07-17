// models/QuotationEditor.js
const { Schema, model } = require('mongoose');

const rowSchema = new Schema({
  series: String,
  typology: String,
  insideInterlock: String,
  outsideInterlock: String,
  rail: String,
  finish: String,
  glass: String,
  lock: String,
  widthMM: Number,
  heightMM: Number,
  qty: Number,
  sqft: String,
  sqm: String,
  rateSqFt: String,
  rateSqM: String,
  rateType: String,
  amount: String,
}, { _id: false });

const quotationEditorSchema = new Schema({
  header: {
    clientName: String,
    clientCity: String,
    location: String,
    cgst: Number,
    sgst: Number,
    igst: Number,
    fabrication: Number,
    installation: Number,
    fixedCharge: Number,
    aluminiumRate: { type: Number, default: 300 },
    projectId: { type: String, required: true },
    terms: { type: String, default: "" }
  },
  
  rows: [rowSchema],
  totalAmt: Number,
  taxAmt: Number,
  grand: Number,
  version: { type: Number, default: 0 },
  parentQuotationId: { type: String, default: null },
  isLatest: { type: Boolean, default: true }
}, { timestamps: false });

// Prevent duplicate versions per project
quotationEditorSchema.index(
  { "header.projectId": 1, version: 1 },
  { unique: true }
);

module.exports = model('QuotationEditor', quotationEditorSchema);