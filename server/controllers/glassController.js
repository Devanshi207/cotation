const Glass = require('../models/Glass');

exports.getAll = async (_req, res) => {
  const items = await Glass.find().sort({ srNo: 1 });
  res.json(items);
};

exports.create = async (req, res) => {
  try {
    const item = await Glass.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Glass.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ msg: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.remove = async (req, res) => {
  const item = await Glass.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ msg: 'Not found' });
  res.json({ msg: 'Deleted' });
};
