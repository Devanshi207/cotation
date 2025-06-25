// controllers/lockController.js      (repeat pattern for each model)
const ProductType = require('../models/ProductType');

exports.getAll = async (_req, res) => {
  const data = await Lock.find().sort({ createdAt: -1 });
  res.json(data);
};

exports.create = async (req, res) => {
  const doc = await Lock.create(req.body);
  res.status(201).json(doc);
};

exports.update = async (req, res) => {
  const doc = await Lock.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ msg: 'Not found' });
  res.json(doc);
};

exports.remove = async (req, res) => {
  const doc = await Lock.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ msg: 'Not found' });
  res.json({ msg: 'Deleted' });
};
