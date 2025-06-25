const Quotation = require('../models/Quotation');

// GET all quotations
exports.getAll = async (_req, res) => {
  const all = await Quotation.find().sort({ createdAt: -1 });
  res.json(all);
};

// POST create new quotation
exports.create = async (req, res) => {
  try {
    const saved = await Quotation.create(req.body);
    res.status(201).json(saved);  // ✅ return full saved doc with _id
  } catch (err) {
    console.error("Error creating quotation:", err);
    res.status(400).json({ msg: "Failed to save quotation", err });
  }
};

// PUT update quotation
exports.update = async (req, res) => {
  const doc = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ msg: 'Quotation not found' });
  res.json(doc);
};

// DELETE quotation
exports.remove = async (req, res) => {
  const doc = await Quotation.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ msg: 'Quotation not found' });
  res.json({ msg: 'Quotation deleted' });
};

// GET single quotation
exports.getOne = async (req, res) => {
  try {
    const doc = await Quotation.findById(req.params.id);
    if (!doc) return res.status(404).json({ msg: 'Quotation not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ msg: 'Invalid ID format', err });
  }
};
