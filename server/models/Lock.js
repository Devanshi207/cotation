// models/Lock.js
const { Schema, model } = require('mongoose');

module.exports = model('Lock', new Schema(
  {
    title:       { type: String, required: true },
    brand:       { type: String },
    description: { type: String },
    rate:         { type: String },
  },
  { timestamps: true }
));
