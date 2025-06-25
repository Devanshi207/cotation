// controllers/typologyController.js
const Unit = require('../models/Unit');

exports.getAll = async (_req, res) => {
  res.json(await Typology.find().sort({ createdAt: -1 }));
};
exports.create  = async (req, res) => res.status(201).json(await Typology.create(req.body));
exports.update  = async (req, res) => {
  const doc = await Typology.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ msg: 'Not found' });
  res.json(doc);
};
exports.remove  = async (req, res) => {
  const doc = await Typology.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ msg: 'Not found' });
  res.json({ msg: 'Deleted' });
};
