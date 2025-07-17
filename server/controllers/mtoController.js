const QuotationEditor = require("../models/QuotationEditor");
const Aluminium = require("../models/Aluminium");
const Glass = require("../models/Glass");
const Finish = require("../models/Finish");
const Lock = require("../models/Lock");
const Hardware = require("../models/Hardware");

exports.generateMTO = async (req, res) => {
  try {
    const { quotationId } = req.params;

    const quotation = await QuotationEditor.findById(quotationId)
      .populate('rows.glass')
      .populate('rows.finish')
      .populate('rows.lock')
      .lean();

    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    const {
      rows,
      header: { aluminiumRate = 300 },
    } = quotation;

    const allAluminium = await Aluminium.find();
    const allGlass = await Glass.find();
    const allFinish = await Finish.find();
    const allLock = await Lock.find();
    const allHardware = await Hardware.find();

    const mto = {
      ALUMINIUM: [],
      GLASS: [],
      FINISH: [],
      HARDWARE: [],
    };

    const addToGroup = (group, title, qtyExpr, qtyValue) => {
      const existing = mto[group].find((item) => item.material === title);
      if (existing) {
        existing.total += qtyValue;
        existing.quantityExprs.push(qtyExpr);
      } else {
        mto[group].push({
          material: title,
          quantityExprs: [qtyExpr],
          total: qtyValue,
        });
      }
    };

    const hardwareVendorCodes = { 
      roller: "PH412",
      skrew19X8: "CSK PH 8X19 [SS-304]",
      cleatForFrame: "CCC1022",
      cleatForShutter: "CCC1022",
      shutterAngle: "ACC_90ANGLE",
      ssPatti: "ARYAN ENTR.",
      shutterAntiLift: "PH343/B",
      skrew19X7: "CSK PH 7X19 [SS-304]",
      interLockCover: "3504",
      skrew13X7: "CSK PH 7X13 GI",
      brush: "ACC_BRUSH",
      distancePieces: "PH139/B",
      silicon: "WACKER GN CL 270",
      woolpipe: "4.8X6 GREY WP",
      trackEPDM: "EPDM 4746",
      interlockEPDM: "EPDM 8085",
      glassEPDM: "OSAKA",
      reciever: "ORBITA",
      skrew8X25: "CSK PH 8X25 [SS-304]",
      interLockEndCap101: "PH308/B",
      interLockEndCap81: "PH260/B",
      waterDrainageCover: "PDC101/B",
      wallSkrew: "CSK PH 8X75 [SS-304]",
      rowelPlug: "32MM WP",
      pushButton: "10MM PB",
      packing: "PC_2X_3X",
      glassPacker: "MANGALUM",
      pta25x8: "PTA 25X8",
      nonroller: "NONROLLER",
    };

    for (const row of rows) {
      const { widthMM = 0, heightMM = 0, qty = 1, typology = "", series = "", insideInterlock, outsideInterlock, meshInterlock } = row;
      const widthM = widthMM / 1000;
      const heightM = heightMM / 1000;
      const perimeterM = 2 * (widthM + heightM);

      // ALUMINIUM — handle/top/bottom/rail/interlocks
if (typology.includes("2 TRACK") && series === "3200 SP") {
  addToGroup("ALUMINIUM", "32SP HANDLE SGU", `${qty} × ${2 * heightM.toFixed(2)}`, qty * 2 * heightM);
  addToGroup("ALUMINIUM", "32SP TOP/BOTTOM SGU", `${qty} × ${2 * widthM.toFixed(2)}`, qty * 2 * widthM);
  addToGroup("ALUMINIUM", "ALUMINUM RAIL", `${qty} × ${2 * widthM.toFixed(2)}`, qty * 2 * widthM);

// Derive track name from series and typology
if (series === "3200 SP" && typology.includes("TRACK")) {
  const match = typology.match(/(\d+) TRACK/i); // e.g., "2 TRACK"
  const trackCount = match ? match[1] : null;

  if (trackCount) {
    const trackName = `32SP ${trackCount} TRACK`;
    const trackItem = allAluminium.find(a =>
      a.title === trackName || a.model === trackName
    );

    if (trackItem) {
      addToGroup("ALUMINIUM", trackItem.title || trackItem.model || "TRACK", `${qty} × ${widthM.toFixed(2)}`, qty * widthM);
    } else {
      console.warn(`⚠️ Track not found for: ${trackName}`);
    }
  }
}

  const interlocks = [
    { field: insideInterlock, label: "INSIDE INTERLOCK" },
    { field: outsideInterlock, label: "OUTSIDE INTERLOCK" },
    { field: meshInterlock, label: "MESH INTERLOCK" },
  ];
  interlocks.forEach(({ field, label }) => {
    const item = allAluminium.find(a => a._id == field || a.model === field);
    if (item) {
      addToGroup("ALUMINIUM", label, `${qty} × ${heightM.toFixed(2)}`, qty * heightM);
    }
  });
}

      // GLASS
      const glassItem = allGlass.find(g => g._id == row.glass || g.title === row.glass);
      if (glassItem) {
        const area = widthM * heightM;
        addToGroup("GLASS", glassItem.title, `${qty} * ${area.toFixed(2)}`, qty * area);
      }

      // FINISH
      const finishItem = allFinish.find(f => f._id == row.finish || f.title === row.finish);
      if (finishItem) {
        addToGroup("FINISH", finishItem.title, `${qty} * ${perimeterM.toFixed(2)}`, qty * perimeterM);
      }

      // ALUMINIUM — Use aluminiumDetails from frontend (handleRow)
if (row.aluminiumDetails && Array.isArray(row.aluminiumDetails)) {
  for (const detail of row.aluminiumDetails) {
    addToGroup("ALUMINIUM", detail.label, detail.quantity, detail.total);
  }
}


      // HARDWARE — lock
      const lockItem = allLock.find(l => l._id == row.lock || l.title === row.lock);
      if (lockItem) {
        addToGroup("HARDWARE", lockItem.title, `${qty} * 2`, qty * 2);
      }

      // HARDWARE — other items
      for (const [key, vendorCode] of Object.entries(hardwareVendorCodes)) {
  const item = allHardware.find(h => h.vendorCode === vendorCode);
  if (item && item.rate && item.rate > 0) {
    const label = item.title || item.name || item.model || vendorCode;
    addToGroup("HARDWARE", label, `${qty} × 1`, qty);
  }
}

    }

    // Format final output
    const output = Object.entries(mto).map(([category, items]) => ({
      category,
      items: items.map((item, idx) => ({
        srNo: idx + 1,
        material: item.material,
        quantity: item.quantityExprs.join(" + "),
        total: item.total.toFixed(2),
      }))
    }));

    return res.json(output);
  } catch (err) {
    console.error("MTO generation failed:", err);
    res.status(500).json({ error: "Failed to generate MTO" });
  }
};

exports.getByQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const mto = await MTO.findOne({ quotationId });
    if (!mto) return res.status(404).json({ msg: "MTO not found for this quotation" });
    res.json(mto);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch MTO", error: err.message });
  }
};
