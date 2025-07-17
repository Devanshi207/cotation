const QuotationEditor = require('../models/QuotationEditor');
const Project = require('../models/Project');

exports.getAll = async (_req, res) => {
  const quotations = await QuotationEditor.find().sort({ createdAt: -1 });
  res.json(quotations);
};
exports.getByProject = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const quotations = await QuotationEditor.find({
      "header.projectId": projectId
    }).sort({ version: 1 });

    res.json(quotations);
  } catch (err) {
    console.error(`Error fetching quotations for project ${projectId}:`, err.message);
    res.status(500).json({ msg: "Failed to fetch quotations", error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const quotation = await QuotationEditor.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ msg: "Quotation not found" });
    }
    res.json(quotation);
  } catch (err) {
    console.error("Error fetching quotation:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { header } = req.body;
    const projectId = header?.projectId;
    header.aluminiumRate = parseFloat(header.aluminiumRate) || 300;

    if (!projectId) {
      return res.status(400).json({ msg: "Project ID is required" });
    }

    const allVersions = await QuotationEditor.find({ "header.projectId": projectId }).sort({ version: -1 });

    let version = 0;
    let parentQuotationId = null;

    if (allVersions.length > 0) {
      const latest = allVersions[0];
      version = latest.version + 1;
      parentQuotationId = latest.parentQuotationId || latest._id;
    }

    try {
      const newQuotation = await QuotationEditor.create({
        ...req.body,
        version,
        header,
        parentQuotationId: parentQuotationId || undefined, // Avoid setting null explicitly
        isLatest: true
      });

      // Set parentQuotationId to _id for the first version
      if (version === 0 && !parentQuotationId) {
        await QuotationEditor.findByIdAndUpdate(newQuotation._id, {
          parentQuotationId: newQuotation._id
        });
      }

      await Project.findByIdAndUpdate(projectId, {
        quotationId: newQuotation._id
      });

      res.status(201).json(newQuotation);
    } catch (error) {
      if (error.code === 11000) {
        console.error(`Duplicate version error for projectId ${projectId}, version ${version}`);
        return res.status(400).json({ msg: "Duplicate version for this project. Please try again." });
      }
      throw error;
    }
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({
      msg: "Server error during create",
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const quotationId = req.params.id;
    const existing = await QuotationEditor.findById(quotationId);
    if (!existing) return res.status(404).json({ msg: "Original quotation not found" });

    const parentId = existing.parentQuotationId || existing._id;

    const allVersions = await QuotationEditor.find({
      $or: [{ parentQuotationId: parentId }, { _id: parentId }]
    }).sort({ version: 1 });

    // Get latest version rows to build upon
    const latestRows = allVersions[allVersions.length - 1].rows || [];

    const incomingRows = req.body.rows || [];
    const updatedRows = [];

    const generateRowKey = (row) =>
      `${row.series}-${row.typology}-${row.widthMM}-${row.heightMM}`;

    const incomingMap = new Map();
    for (const row of incomingRows) {
      incomingMap.set(generateRowKey(row), row);
    }

    const seen = new Set();

    for (const row of latestRows) {
      const key = generateRowKey(row);
      if (incomingMap.has(key)) {
        // Updated row
        updatedRows.push(incomingMap.get(key));
        seen.add(key);
      } else {
        // Unchanged row
        updatedRows.push(row);
      }
    }

    // Add any new rows
    for (const [key, row] of incomingMap.entries()) {
      if (!seen.has(key)) {
        updatedRows.push(row);
      }
    }

    const nextVersion = allVersions.length;
    await QuotationEditor.updateMany(
      { $or: [{ parentQuotationId: parentId }, { _id: parentId }] },
      { $set: { isLatest: false } }
    );

    const { _id, rows, ...cleanBody } = req.body;
    if (!cleanBody.header) cleanBody.header = {};
    cleanBody.header.aluminiumRate = parseFloat(cleanBody.header.aluminiumRate) || 300;
    const newQuotation = await QuotationEditor.create({
      ...cleanBody,
      rows: updatedRows,
      version: nextVersion,
      parentQuotationId: parentId,
      isLatest: true
    });

    res.status(201).json(newQuotation);
  } catch (err) {
    console.error("🔴 Update error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.remove = async (req, res) => {
  const quotation = await QuotationEditor.findByIdAndDelete(req.params.id);
  if (!quotation) return res.status(404).json({ msg: 'Not found' });
  res.json({ msg: 'Deleted' });
};

exports.getVersions = async (req, res) => {
  const { id } = req.params;

  try {
    const current = await QuotationEditor.findById(id);
    if (!current) {
      return res.status(404).json({ msg: "Quotation not found" });
    }

    const parentId = current.parentQuotationId || current._id;

    const allVersions = await QuotationEditor.find({
      $or: [
        { parentQuotationId: parentId },
        { _id: parentId }
      ]
    }).sort({ version: 1 });

    const cumulativeVersions = [];

   for (let i = 0; i < allVersions.length; i++) {
  const rowMap = new Map();

  for (let j = 0; j <= i; j++) {
    const rows = allVersions[j].rows || [];
    for (const row of rows) {
      const key = `${row.series}-${row.typology}-${row.widthMM}-${row.heightMM}`;
      rowMap.set(key, row); // overwrite existing if same key
    }
  }

  const cumulativeRows = Array.from(rowMap.values());

  cumulativeVersions.push({
    ...allVersions[i]._doc,
    rows: cumulativeRows,
  });
}

    res.json(cumulativeVersions);
  } catch (err) {
    res.status(500).json({
      msg: "Server error while fetching versions",
      error: err.message,
    });
  }
};

exports.updateTerms = async (req, res) => {
  try {
    const { id } = req.params;
    const { terms } = req.body;

    const quotation = await QuotationEditor.findById(id);
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    quotation.header.terms = terms;
    await quotation.save();

    res.json({ message: "Terms updated successfully", terms });
  } catch (err) {
    console.error("Update terms error:", err);
    res.status(500).json({ message: "Server error" });
  }
};