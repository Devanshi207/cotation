    // models/Quotation.js   (one document = one row from your Quotation table)
const { Schema, model } = require('mongoose');

module.exports = model('Quotation', new Schema(
  {
    productType:  String,
    series:       String,
    typology:     String,
    lock:         String,
    glass:        String,
    heightMM:     String,
    widthMM:      String,
    qty:          String,
    sqft:         String,
    rateSeries:   String,
    rateTypology: String,
    rateLock:     String,
    rateGlass:    String,
    amt:          String,
    cgst:         String,
    sgst:         String,
    taxableAmt:   String,
  },
  { timestamps: true }
));
