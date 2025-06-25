const Hardware = require('../models/Hardware');

exports.getAll = async (_req, res) => {
  try {
    const items = await Hardware.find().sort({ srNo: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await Hardware.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Hardware.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) return res.status(404).json({ msg: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Hardware.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Not found' });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
