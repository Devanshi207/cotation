const Product = require('../models/Product');

exports.getAll = async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

exports.create = async (req, res) => {
  const prod = await Product.create(req.body);
  res.status(201).json(prod);
};

exports.update = async (req, res) => {
  const prod = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!prod) return res.status(404).json({ msg: 'Not found' });
  res.json(prod);
};

exports.remove = async (req, res) => {
  const prod = await Product.findByIdAndDelete(req.params.id);
  if (!prod) return res.status(404).json({ msg: 'Not found' });
  res.json({ msg: 'Deleted' });
};

// ✅ This is the new endpoint used by frontend
exports.getGrouped = async (_req, res) => {
  const products = await Product.find();

  const cleanedProducts = products.map(p => ({
    ...p._doc,
    series: p.series.trim(),
    typology: p.typology.trim()
  }));

  const seriesSet = new Set(cleanedProducts.map(p => p.series));
  const series = [...seriesSet].map(s => ({ _id: s, title: s }));

  const typologiesBySeries = {};
  for (const p of cleanedProducts) {
    if (!typologiesBySeries[p.series]) {
      typologiesBySeries[p.series] = [];
    }
    const exists = typologiesBySeries[p.series].some(t => t._id === p.typology);
    if (!exists) {
      typologiesBySeries[p.series].push({ _id: p.typology, title: p.typology });
    }
  }

  res.json({ series, typologiesBySeries, allProducts: cleanedProducts });
};
