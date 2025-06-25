const mongoose = require('mongoose');

const glassSchema = new mongoose.Schema({
  srNo: { type: Number, unique: true },
  title: { type: String, required: true, unique: true },
  rate: { type: Number, required: true }
}, {
  timestamps: false,
  versionKey: false
});

glassSchema.pre('save', async function (next) {
  if (this.isNew && this.srNo == null) {
    const last = await mongoose.model('Glass').findOne().sort({ srNo: -1 }).lean();
    this.srNo = last?.srNo ? last.srNo + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Glass', glassSchema);
