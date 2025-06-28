const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  series:    { type: String, required: true },
  typology:  { type: String, required: true },
  type:      { type: String }
}, { timestamps: false });

module.exports = model('Product', productSchema);
