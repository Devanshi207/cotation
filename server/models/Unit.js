// models/Unit.js
const { Schema, model } = require('mongoose');
module.exports = model('Unit', new Schema(
  {
    unit:       { type: String, required: true },
    shortForm:  { type: String },
  },
  { timestamps: false }
));
