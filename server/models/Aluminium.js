const mongoose = require('mongoose');

const aluminiumSchema = new mongoose.Schema({
  srNo:  { type: Number, unique: true },
  code:  { type: String, required: true, unique: true },
  make:  { type: String, required: true },
  model: { type: String, required: true },
  conversionUnitKgPerMtr: { type: Number, required: true },
  parameter:    { type: String },
  productGroup: { type: String, required: true }
}, {
  timestamps: false,
  versionKey: false
});

aluminiumSchema.pre('save', async function (next) {
  if (this.isNew && this.srNo == null) {
    const last = await mongoose.model('Aluminium').findOne().sort({ srNo: -1 }).lean();
    this.srNo = last?.srNo ? last.srNo + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Aluminium', aluminiumSchema);
