const Aluminium = require('../models/Aluminium');

exports.getAll = async (_req, res) => {
  try {
    const items = await Aluminium.find().sort({ srNo: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await Aluminium.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Aluminium.findByIdAndUpdate(req.params.id, req.body, {
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
    const item = await Aluminium.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Not found' });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
