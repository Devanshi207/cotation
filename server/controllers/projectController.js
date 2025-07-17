const Project = require('../models/Project');
const QuotationEditor = require('../models/QuotationEditor');

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
  try {
    const doc = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!doc) return res.status(404).json({ msg: 'Not found' });

    // ✅ Update quotations linked to this project
    await QuotationEditor.updateMany(
      { "header.projectId": doc._id },
      {
        $set: {
          "header.clientName": doc.contactName,
          "header.clientCity": doc.location,
        },
      }
    );

    res.json(doc);
  } catch (err) {
    console.error("❌ Failed to update project:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.remove = async (req, res) => {
  const doc = await Project.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ msg: 'Not found' });
  res.json({ msg: 'Deleted' });
};