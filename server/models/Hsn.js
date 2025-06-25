// models/Hsn.js
const { Schema, model } = require('mongoose');

const hsnSchema = new Schema(
  {
    code:           { type: String, required: true },
    description:    { type: String },
    commodityType:  { type: String, enum: ['Good HSN', 'Service SAC'], default: 'Good HSN' },
    effectiveDate:  { type: String },   // keep as string to store “YYYY‑MM‑DD”
    cgst:           { type: String },
    sgst:           { type: String },
    igst:           { type: String },
  },
  { timestamps: true }
);

module.exports = model('Hsn', hsnSchema);
