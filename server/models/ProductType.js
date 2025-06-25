// models/ProductType.js
const { Schema, model } = require('mongoose');

module.exports = model('ProductType', new Schema(
  {
    name:        { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
));
