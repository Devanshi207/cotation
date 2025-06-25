const Finish = require('../models/Finish');

exports.getAll = async (_req, res) => {
  try {
    const items = await Finish.find().sort({ title: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await Finish.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Finish.findByIdAndUpdate(req.params.id, req.body, {
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
    const item = await Finish.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Not found' });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await Finish.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    console.error('Create error:', err); // 🔍 log exact error
    res.status(400).json({ msg: err.message }); // send actual error message
  }
};
