const Project = require('../models/Project');

exports.getAll = async (_req, res) => {
  const data = await Project.find().sort({ createdAt: -1 });
  res.json(data);
};

exports.create = async (req, res) => {
  const last = await Project.findOne().sort({ createdAt: -1 });
  const srNo = last ? last.srNo + 1 : 1;
  const payload = { srNo, ...req.body };
  const doc = await Project.create(payload);
  res.status(201).json(doc);
};

exports.update = async (req, res) => {
  const doc = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ msg: 'Not found' });
  res.json(doc);
};

exports.remove = async (req, res) => {
  const doc = await Project.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ msg: 'Not found' });
  res.json({ msg: 'Deleted' });
};
