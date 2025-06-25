// models/ProductGroup.js
const { Schema, model } = require('mongoose');

module.exports = model('ProductGroup', new Schema(
  {
    name:        { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
));
