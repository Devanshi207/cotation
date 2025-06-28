const QuotationEditor = require('../models/QuotationEditor');

exports.getAll = async (_req, res) => {
  const quotations = await QuotationEditor.find().sort({ createdAt: -1 });
  res.json(quotations);
};

exports.getByProject = async (req, res) => {
  const projectId = req.params.projectId;
  const quotations = await QuotationEditor.find({ "header.projectId": projectId });
  res.json(quotations);
};

exports.getOne = async (req, res) => {
  const quotation = await QuotationEditor.findById(req.params.id);
  if (!quotation) return res.status(404).json({ msg: 'Not found' });
  res.json(quotation);
};

// controllers/quotationEditorController.js
exports.create = async (req, res) => {
  try {
    // Just save the uniqueID as a string
    const quotation = await QuotationEditor.create(req.body);
    res.status(201).json(quotation);
  } catch (error) {
    console.error("Create error:", error);
    res.status(400).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Similarly for update
exports.update = async (req, res) => {
  try {
    const quotation = await QuotationEditor.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!quotation) {
      return res.status(404).json({ msg: 'Quotation not found' });
    }
    
    res.json(quotation);
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.remove = async (req, res) => {
  const quotation = await QuotationEditor.findByIdAndDelete(req.params.id);
  if (!quotation) return res.status(404).json({ msg: 'Not found' });
  res.json({ msg: 'Deleted' });
};
