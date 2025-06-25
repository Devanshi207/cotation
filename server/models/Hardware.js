const mongoose = require('mongoose');

const hardwareSchema = new mongoose.Schema(
  {
    srNo: {
      type: Number,
      required: true,
      unique: true
    },
    vendorCode: {                     // NEW
      type: String,
      required: [true, 'Vendor Code is required'],
      trim: true
    },
    make: {
      type: String,
      required: [true, 'Make is required'],
      trim: true
    },
    productName: {                   // NEW
      type: String,
      required: [true, 'Product Name is required'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true
    },
    uom: {
      type: String,
      required: [true, 'UoM is required'],
      trim: true
    },
    rate: {
      type: Number,
      required: [true, 'Rate is required'],
      min: [0, 'Rate cannot be negative']
    }
  },
  {
    timestamps: false,   // createdAt / updatedAt
    versionKey: false   // removes __v
  }
);

module.exports = mongoose.model('Hardware', hardwareSchema);
