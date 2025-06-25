// controllers/hsnController.js
const Hsn = require('../models/Hsn');

exports.getAll = async (_req, res) => {
  const list = await Hsn.find().sort({ createdAt: -1 });
  res.json(list);
};

exports.create = async (req, res) => {
  const doc = await Hsn.create(req.body);
  res.status(201).json(doc);
};

exports.update = async (req, res) => {
  const doc = await Hsn.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ msg: 'Not found' });
  res.json(doc);
};

exports.remove = async (req, res) => {
  const doc = await Hsn.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ msg: 'Not found' });
  res.json({ msg: 'Deleted' });
};
