// models/Project.js
const { Schema, model } = require('mongoose');

/* helper to create the same uniqueId your frontend uses */
const pad3 = (n) => n.toString().padStart(3, '0');
const fiscalYear = () => {
  const d = new Date();
  const start = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${start}-${(start + 1).toString().slice(-2)}`;
};
function makeUniqueId(title, location, seq) {
  const t = (title || '').trim().slice(0, 3).toUpperCase().padEnd(3, '_');
  const l = (location || '').trim().slice(0, 3).toUpperCase().padEnd(3, '_');
  return `${t}-${l}-${pad3(seq)}/${fiscalYear()}`;
}

const projectSchema = new Schema(
  {
    title:          { type: String, required: true },
    location:       { type: String },
    address:        { type: String },
    uniqueId:       { type: String, unique: true },
    contactName:    { type: String },
    contactMobile:  { type: String },
    contactEmail:   { type: String },
  },
  { timestamps: true }
);

/* auto‑generate uniqueId before first save */
projectSchema.pre('save', async function (next) {
  if (this.uniqueId) return next();
  const Project = this.constructor;
  const count   = await Project.countDocuments();
  this.uniqueId = makeUniqueId(this.title, this.location, count + 1);
  next();
});

module.exports = model('Project', projectSchema);
