const mongoose = require('mongoose');

const finishSchema = new mongoose.Schema({
  title: { type: String, required: true},
  rate:  { type: Number, required: true }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Finish', finishSchema);
