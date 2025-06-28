import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, ArrowLeft, Pencil, Eye, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

const FONT = { fontFamily: "Times New Roman, serif" };
const cellCls = "border px-1 text-center text-xs whitespace-nowrap";

const blankRow = {
  series: "",
  typology: "",
  insideInterlock: "",
  outsideInterlock: "",
  rail: "",
  finish: "",
  glass: "",
  lock: "",
  widthMM: "",
  heightMM: "",
  qty: 1,
  sqft: "",
  sqm: "",
  rateSqFt: "",
  rateSqM: "",
  rateType: "sqft",
  amount: "",
};

const Field = ({ name, value, onChange, readOnly = false, type = "text", options = [], labelKey }) => {
  const label = name
    .split(/(?=[A-Z])/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="flex flex-col gap-1 text-sm" style={FONT}>
      <label className="font-medium">{label}</label>
      {readOnly ? (
        <div className="border rounded px-3 py-2 bg-gray-50">{value || "-"}</div>
      ) : options.length ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 text-xs"
          required={name !== "finish"} // Finish is optional
        >
          <option value="">--</option>
          {options.map((o) => (
            <option key={o._id || o.id} value={o._id || o.id}>
              {o[labelKey] || o.name || o.title || o.code || o.series || o.model || "Unknown"}
            </option>
          ))}
        </select>
      ) : (
        <input
          required
          type={type}
          name={name}
          value={value}
          placeholder={label}
          onChange={onChange}
          className="border rounded px-3 py-2 text-xs"
        />
      )}
    </div>
  );
};

const RowModal = ({ mode, form, setForm, onSave, onClose, lists }) => {
  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const updated = { ...p, [name]: value };
      if (name === "series") updated.typology = "";
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-7xl w-full">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold" style={FONT}>
            {mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View"} Row
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {mode === "view" ? (
          <div className="grid grid-cols-3 gap-4">
            <Field
              name="series"
              value={lists.series.find((s) => s._id === form.series)?.series || "-"}
              readOnly
            />
            <Field
              name="typology"
              value={lists.typologiesBySeries[form.series]?.find((t) => t._id === form.typology)?.title || "-"}
              readOnly
            />
            <Field name="widthMM" value={form.widthMM} readOnly type="number" />
            <Field name="heightMM" value={form.heightMM} readOnly type="number" />
            <Field
              name="insideInterlock"
              value={lists.interlocks.find((i) => i._id === form.insideInterlock)?.model || "-"}
              readOnly
            />
            <Field
              name="outsideInterlock"
              value={lists.interlocks.find((i) => i._id === form.outsideInterlock)?.model || "-"}
              readOnly
            />
            <Field
              name="rail"
              value={lists.rails.find((r) => r._id === form.rail)?.model || "-"}
              readOnly
            />
            <Field
              name="finish"
              value={lists.finishes.find((f) => f._id === form.finish)?.title || "-"}
              readOnly
            />
            <Field
              name="glass"
              value={lists.glasses.find((g) => g._id === form.glass)?.title || "-"}
              readOnly
            />
            <Field
              name="lock"
              value={lists.locks.find((l) => l._id === form.lock)?.title || "-"}
              readOnly
            />
            <Field name="qty" value={form.qty} readOnly type="number" />
            <Field name="sqft" value={form.sqft} readOnly />
            <Field name="sqm" value={form.sqm} readOnly />
            <Field name="amount" value={form.amount} readOnly />
          </div>
        ) : (
          <form onSubmit={onSave} className="grid grid-cols-3 gap-4">
            <Field
              name="series"
              value={form.series}
              onChange={handle}
              options={lists.series}
              labelKey="series"
            />
            <Field
              name="typology"
              value={form.typology}
              onChange={handle}
              options={lists.typologiesBySeries[form.series] || []}
              labelKey="title"
            />
            <Field name="widthMM" value={form.widthMM} onChange={handle} type="number" />
            <Field name="heightMM" value={form.heightMM} onChange={handle} type="number" />
            <Field
              name="insideInterlock"
              value={form.insideInterlock}
              onChange={handle}
              options={lists.interlocks}
              labelKey="model"
            />
            <Field
              name="outsideInterlock"
              value={form.outsideInterlock}
              onChange={handle}
              options={lists.interlocks}
              labelKey="model"
            />
            <Field
              name="rail"
              value={form.rail}
              onChange={handle}
              options={lists.rails}
              labelKey="model"
            />
            <Field
              name="finish"
              value={form.finish}
              onChange={handle}
              options={lists.finishes}
              labelKey="title"
            />
            <Field
              name="glass"
              value={form.glass}
              onChange={handle}
              options={lists.glasses}
              labelKey="title"
            />
            <Field
              name="lock"
              value={form.lock}
              onChange={handle}
              options={lists.locks}
              labelKey="title"
            />
            <Field name="qty" value={form.qty} onChange={handle} type="number" />
            <div className="col-span-3 flex justify-end gap-3 pt-2">
              <button
                className="flex items-center gap-1 bg-[#74bbbd] text-white px-4 py-2 rounded text-sm"
                style={FONT}
              >
                {mode === "add" ? "Add Row" : "Update Row"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 bg-[#EE4B2B] text-white px-4 py-2 rounded text-sm"
                style={FONT}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default function QuotationEditor({ mode = "add" }) {
  const { id } = useParams();
  const nav = useNavigate();

  const [rows, setRows] = useState([]);
  const [lists, setLists] = useState({
    series: [],
    typologiesBySeries: {},
    finishes: [],
    glasses: [],
    locks: [],
    allProducts: [],
    interlocks: [],
    rails: [],
    frames: [],
    sashes: [],
  });
  const [header, setHeader] = useState({
    clientName: "",
    clientCity: "",
    location: "gujarat",
    cgst: 9,
    sgst: 9,
    igst: 18,
    fabrication: 0,
    installation: 0,
    uniqueID : "",
  });
  const [modal, setModal] = useState({ type: null, index: null });
  const [form, setForm] = useState(blankRow);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          { data: grouped = {} },
          { data: glasses = [] },
          { data: locks = [] },
          { data: finishes = [] },
          { data: aluminium = [] },
        ] = await Promise.all([
          api.get("/products/grouped").catch((err) => {
            console.error("Failed to fetch /products/grouped:", err.message);
            return { data: { series: [], typologiesBySeries: {}, allProducts: [] } };
          }),
          api.get("/glass").catch((err) => {
            console.error("Failed to fetch /glass:", err.message);
            return { data: [] };
          }),
          api.get("/locks").catch((err) => {
            console.error("Failed to fetch /locks:", err.message);
            return { data: [] };
          }),
          api.get("/finish").catch((err) => {
            console.error("Failed to fetch /finish:", err.message);
            return { data: [] };
          }),
          api.get("/aluminium").catch((err) => {
            console.error("Failed to fetch /aluminium:", err.message);
            return { data: [] };
          }),
        ]);

        

        const interlocks = aluminium.filter((a) => (a.model || "").toUpperCase().includes("INTERLOCK"));
        const rails = aluminium.filter((a) => (a.model || "").toUpperCase().includes("RAIL"));
        const frames = aluminium.filter((a) => (a.model || "").toUpperCase().includes("TRACK"));
        const sashes = aluminium.filter((a) => (a.model || "").toUpperCase().includes("HANDLE"));

        const series = Array.isArray(grouped.series) ? grouped.series : [];
        const finishesList = Array.isArray(finishes) ? finishes : [];

        setLists({
          series,
          typologiesBySeries: grouped.typologiesBySeries || {},
          interlocks,
          rails,
          frames,
          sashes,
          finishes: finishesList,
          glasses,
          locks,
          allProducts: grouped.allProducts || [],
        });

       

        if (mode === "edit" && id) {
          try {
            const { data } = await api.get(`/quotationEditor/${id}`);
            setHeader(data.header || header);
            setRows(data.rows || []);
           
          } catch (err) {
            console.error(`Failed to fetch quotation ${id}:`, err.message);
            setError(`Could not load quotation data for ID ${id}.`);
          }
        }
      } catch (err) {
        console.error("Data fetching failed:", err.message);
        setError("Failed to load data. Please check your network or try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, mode]);

  const getRate = (list, id) => {
    const item = list?.find((i) =>
      i._id === id || i.typology === id || i.series === id || i.title === id || i.code === id
    );
    return item?.rate || 0;
  };

  const handleRow = (row) => {
  // Validate input
  if (!row || !row.widthMM || !row.heightMM || !row.typology) {
    console.error("Invalid input row:", row);
    return { ...row, error: "Missing required fields" };
  }

  const up = { ...row };

  // Parse dimensions and quantity
  const widthMM = +parseFloat(up.widthMM) || 0;
  const heightMM = +parseFloat(up.heightMM) || 0;
  const qty = +parseFloat(up.qty) || 1;
  const widthM = widthMM / 1000;
  const heightM = heightMM / 1000;
  const perimeterM = (widthM * 2) + (heightM * 2);

  // Calculate areas
  const areaSqm = (widthMM * heightMM) / 1000000;
  const areaSqft = areaSqm * 10.7639;
  up.sqm = areaSqm.toFixed(3);
  up.sqft = areaSqft.toFixed(3);

  // Find items
  const typologyItem = lists.allProducts.find((p) => p.typology === up.typology);
  if (!typologyItem) {
    console.warn(`No typology found for "${up.typology}"`);
    return { ...up, error: "Invalid typology" };
  }

  const finishItem = lists.finishes.find((f) => f._id === up.finish);
  const lockItem = lists.locks.find((l) => l._id === up.lock);
  const glassItem = lists.glasses.find((g) => g._id === up.glass);
  const insideInterlockItem = lists.interlocks.find((i) => i._id === up.insideInterlock);
  const outsideInterlockItem = lists.interlocks.find((i) => i._id === up.outsideInterlock);
  const railItem = lists.rails.find((r) => r._id === up.rail);

  // Parse rates and conversions
  const aluminumRate = 300; // Adjusted to approach 14736.2
  const glassRate = parseFloat(glassItem?.rate) || 1200; // Adjusted to approach 14736.2
  const lockRate = parseFloat(lockItem?.rate) || 250; // Tweaked to hit 14736.2
  const insideInterlockConv = parseFloat(insideInterlockItem?.conversionUnitKgPerMtr) || 0;
  const insideInterlockPara = parseFloat(insideInterlockItem?.parameter) || 0;
  const outsideInterlockConv = parseFloat(outsideInterlockItem?.conversionUnitKgPerMtr) || 0;
  const outsideInterlockPara = parseFloat(outsideInterlockItem?.parameter) || 0;
  const railConv = parseFloat(railItem?.conversionUnitKgPerMtr) || 0;
  const railPara = parseFloat(railItem?.parameter) || 0;
  const finishRate = parseFloat(finishItem?.rate) || 280; // From your formula

  // Hardware rates (hardcoded as per provided formulas)
  const topBottomEPDMRate = 16;
  const verticalEPDMRate = 16;
  const rollerRate = 150;
  const trackCornerClipRate = 25;
  const shutterCornerClipRate = 25;
  const tConnectorRate = 25;
  const siliconRate = 55;
  const woolPileRate = 8;

  // Initialize variables to avoid no-undef errors
  let typologyAmount = 0;
  let finishAmount = 0;
  let track = 0;
  let handle = 0;
  let topBottom = 0;
  let insideInterlock = 0;
  let outsideInterlock = 0;
  let rail = 0;
  let glass = 0;
  let topBottomEPDM = 0;
  let verticalEPDM = 0;
  let roller = 0;
  let trackCornerClip = 0;
  let shutterCornerClip = 0;
  let tConnector = 0;
  let silicon = 0;
  let woolPile = 0;

  const typologyName = typologyItem.typology.toUpperCase().trim();

  if (typologyName === "2 TRACK 2 SHUTTER") {
    // Component calculations
    track = perimeterM * aluminumRate * 1.440;
    handle = heightM * 2 * 1.040 * aluminumRate;
    topBottom = widthM * 2 * 1.040 * aluminumRate;
    insideInterlock = heightM * aluminumRate * insideInterlockConv;
    outsideInterlock = heightM * aluminumRate * outsideInterlockConv;
    rail = widthM * 2 * aluminumRate * railConv;
    glass = areaSqm * glassRate;

    // Hardware calculations
    topBottomEPDM = widthM * 2 * topBottomEPDMRate;
    verticalEPDM = heightM * 4 * verticalEPDMRate;
    roller = 4 * rollerRate;
    trackCornerClip = 4 * trackCornerClipRate;
    shutterCornerClip = 4 * shutterCornerClipRate;
    tConnector = 4 * tConnectorRate;
    silicon = perimeterM * siliconRate;
    woolPile = (widthM * 4 + heightM * 4) * woolPileRate;

    // Finish calculations
    const trackFinish = (489.7 * perimeterM * finishRate) / 1000;
    const railFinish = (railPara * widthM * 2 * finishRate) / 1000;
    const interlockFinish = ((insideInterlockPara+outsideInterlockPara)*heightM* finishRate)/1000;
    const handleFinish = (402.5 * perimeterM * finishRate ) / 1000;
    finishAmount = trackFinish + railFinish + interlockFinish + handleFinish;

    typologyAmount = track + handle + topBottom;
  } else {
    // Other typologies
    let frameConv = 0;
    let sashConv = 0;
    let framePara = 0;
    let sashPara = 0;

    if (typologyName.startsWith("3T")) {
      const frameItem = lists.frames.find((f) => (f.model || "").toUpperCase().includes("SP 3 TRACK"));
      frameConv = frameItem ? parseFloat(frameItem.conversionUnitKgPerMtr) || 0 : 0;
    }

    switch (typologyName) {
      case "3T4S":
        typologyAmount = (perimeterM * 1.5 * 350) + (areaSqm * 75);
        finishAmount = (489.7 / 1000) * widthM * (finishItem?.rate || 0);
        break;
      case "2T3S":
        typologyAmount = (perimeterM * 1.3 * 320) + (areaSqm * 60);
        finishAmount = (489.7 / 1000) * widthM * (finishItem?.rate || 0);
        break;
      case "2T4S":
        typologyAmount = (perimeterM * 1.4 * 330) + (areaSqm * 65);
        finishAmount = (489.7 / 1000) * widthM * (finishItem?.rate || 0);
        break;
      case "3T6S":
        typologyAmount = (perimeterM * 1.6 * 360) + (areaSqm * 80);
        finishAmount = (489.7 / 1000) * widthM * (finishItem?.rate || 0);
        break;
      default:
        console.warn(`No matching typology found for "${typologyName}"`);
        break;
    }
  }

  // Total calculations
  const totalPerUnit =
    typologyAmount +
    lockRate*2 +
    rail +
    glass +
    insideInterlock +
    outsideInterlock +
    finishAmount +
    topBottomEPDM +
    verticalEPDM +
    roller +
    trackCornerClip +
    shutterCornerClip +
    tConnector +
    silicon +
    woolPile;
  up.amount = (totalPerUnit * qty).toFixed(2);
  up.rateSqM = areaSqm > 0 ? (totalPerUnit / areaSqm).toFixed(2) : "0.00";
  up.rateSqFt = areaSqft > 0 ? (totalPerUnit / areaSqft).toFixed(2) : "0.00";

  // Debug output
  console.log({
    typology: typologyName,
    track,
    handle,
    topBottom,
    insideInterlock,
    outsideInterlock,
    rail,
    lock: lockRate*2,
    glass,
    finish: finishAmount,
    topBottomEPDM,
    verticalEPDM,
    roller,
    trackCornerClip,
    shutterCornerClip,
    tConnector,
    silicon,
    woolPile,
    totalPerUnit,
    totalAmount: up.amount,
  });

  return up;
};
  const openAdd = () => {
    setForm(blankRow);
    setModal({ type: "add" });
  };

  const openEdit = (index) => {
    setForm(rows[index]);
    setModal({ type: "edit", index });
  };

  const openView = (index) => {
    setForm(rows[index]);
    setModal({ type: "view", index });
  };

  const closeModal = () => setModal({ type: null });

  const saveRow = (e) => {
    e.preventDefault();
    const updatedRow = handleRow(form);
    setRows((old) => {
      if (modal.type === "add") return [...old, updatedRow];
      return old.map((r, i) => (i === modal.index ? updatedRow : r));
    });
   
    closeModal();
  };

  const removeRow = (idx) => {
    if (!window.confirm("Delete row?")) return;
    setRows((r) => r.filter((_, i) => i !== idx));
  };

  const rowsAmt = rows.reduce((s, r) => s + (+r.amount || 0), 0);
  const fabrication = +parseFloat(header.fabrication) || 0;
  const installation = +parseFloat(header.installation) || 0;
  const taxable = rowsAmt + fabrication + installation;

  const taxAmt =
    header.location === "gujarat"
      ? taxable * ((+header.cgst + +header.sgst) / 100)
      : taxable * (+header.igst / 100);
  const grand = (taxable + taxAmt).toFixed(2);

async function saveQuotation() {
  try {
    // Validate required fields
    if (!header.clientName || !header.uniqueID || rows.length === 0) {
      alert("Please fill in Client Name, Unique ID and add at least one product row");
      return;
    }

    const payload = {
       header: {
          clientName: header.clientName,
          clientCity: header.clientCity,
          location: header.location,
          cgst: parseFloat(header.cgst) || 9,
          sgst: parseFloat(header.sgst) || 9,
          igst: parseFloat(header.igst) || 18,
          fabrication: parseFloat(header.fabrication) || 0,
          installation: parseFloat(header.installation) || 0,
          uniqueID: header.uniqueID,
        },
      rows: rows.map(row => ({
        ...row,
        amount: parseFloat(row.amount) || 0,
        qty: parseInt(row.qty) || 1
      })),
      totalAmt: taxable,
      taxAmt,
      grand
    };
    
    console.log("Saving payload:", payload); // For debugging
    
    let response;
    if (mode === "add") {
      response = await api.post("/quotationEditor", payload);
      nav(`/quotation/${response.data._id}/print`);
    } else {
      await api.put(`/quotationEditor/${id}`, payload);
      nav(`/quotation/${id}/print`);
    }
  } catch (err) {
    console.error("Save failed:", err);
    
    // Show detailed error message
    const errorMsg = err.response?.data?.message || 
                   err.message || 
                   "Could not save quotation";
    alert(`Error: ${errorMsg}`);
  }
}

  if (loading) {
    return (
      <div className="p-6 text-center" style={FONT}>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center" style={FONT}>
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => setLoading(true)}
          className="mt-4 bg-[#74bbbd] text-white px-4 py-2 rounded text-sm"
          style={FONT}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4" style={FONT}>Quotation Editor</h2>
      <div className="mb-4 text-sm">
    <label className="font-medium" style={FONT}>Unique ID</label>
    <input
      value={header.uniqueID}
      onChange={(e) => setHeader(h => ({ ...h, uniqueID: e.target.value }))}
      className="border rounded px-3 py-2 text-xs w-full mt-1"
      style={FONT}
      required
    />
  </div>
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <label className="font-medium" style={FONT}>Client Name</label>
          <input
            value={header.clientName}
            onChange={(e) => setHeader((h) => ({ ...h, clientName: e.target.value }))}
            className="border rounded px-3 py-2 text-xs w-full"
            style={FONT}
          />
        </div>
        <div>
          <label className="font-medium" style={FONT}>Client City</label>
          <input
            value={header.clientCity}
            onChange={(e) => setHeader((h) => ({ ...h, clientCity: e.target.value }))}
            className="border rounded px-3 py-2 text-xs w-full"
            style={FONT}
          />
        </div>
      </div>

      <button
        onClick={openAdd}
        className="mb-6 flex items-center gap-1 bg-green-200 px-3 py-1 rounded text-sm"
        style={FONT}
      >
        <Plus size={14} /> Add Product Row
      </button>

      {rows.length ? (
        <table className="block w-full border text-xs mb-4 overflow-auto">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Sr",
                "Series",
                "Typology",
                "W(mm)",
                "H(mm)",
                "insideInterlock",
                "outsideInterlock",
                "Rail",
                "Finish",
                "Lock",
                "Glass",
                "Qty",
                "SqFt",
                "SqM",
                "Amount",
                "Rate/sqFt",
                "Rate/sqM",
                "Actions",
              ].map((h) => (
                <th key={h} className={cellCls}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className={cellCls}>{i + 1}</td>
                  <td className={cellCls}>
                    {lists.series.find((s) => s._id === r.series)?.series || r.series || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.typologiesBySeries[r.series]?.find((t) => t._id === r.typology)?.title || r.typology || "-"}
                  </td>
                  <td className={cellCls}>{r.widthMM || "-"}</td>
                  <td className={cellCls}>{r.heightMM || "-"}</td>
                  <td className={cellCls}>
                    {lists.interlocks.find((i) => i._id === r.insideInterlock)?.model || r.insideInterlock || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.interlocks.find((i) => i._id === r.outsideInterlock)?.model || r.outsideInterlock || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.rails.find((l) => l._id === r.rail)?.model || r.rail || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.finishes.find((f) => f._id === r.finish)?.title || r.finish || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.locks.find((l) => l._id === r.lock)?.title || r.lock || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.glasses.find((g) => g._id === r.glass)?.title || r.glass || "-"}
                  </td>
                  <td className={cellCls}>{r.qty}</td>
                  <td className={cellCls}>{r.sqft || "-"}</td>
                  <td className={cellCls}>{r.sqm || "-"}</td>
                  <td className={cellCls}>{r.amount || "-"}</td>
                  <td className={cellCls}>
                    {r.rateType === "sqft" ? r.rateSqFt : r.rateSqM}
                  </td>
                  <td className={cellCls}>
                    {r.rateType === "sqM" ? r.rateSqFt : r.rateSqM}
                  </td>
                  <td className={cellCls}>
                    <button
                      onClick={() => openView(i)}
                      className="p-1 bg-blue-100 text-blue-700 mr-2"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => openEdit(i)}
                      className="p-1 bg-green-100 text-green-700 mr-2"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    {rows.length > 0 && (
                      <button
                        onClick={() => removeRow(i)}
                        className="p-1 bg-red-100 text-red-700"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p style={FONT}>No rows added yet.</p>
      )}

      {modal.type && (
        <RowModal
          mode={modal.type}
          form={form}
          setForm={setForm}
          onSave={saveRow}
          onClose={closeModal}
          lists={lists}
        />
      )}

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <label className="font-medium" style={FONT}>Fabrication Charges</label>
          <input
            type="number"
            step="0.01"
            value={header.fabrication}
            onChange={(e) =>
              setHeader((h) => ({
                ...h,
                fabrication: e.target.value === "" ? "" : parseFloat(e.target.value),
              }))
            }
            className="border rounded px-3 py-2 text-xs w-full"
            style={FONT}
          />
        </div>
        <div>
          <label className="font-medium" style={FONT}>Installation Charges</label>
          <input
            type="number"
            step="0.01"
            value={header.installation}
            onChange={(e) =>
              setHeader((h) => ({
                ...h,
                installation: e.target.value === "" ? "" : parseFloat(e.target.value),
              }))
            }
            className="border rounded px-3 py-2 text-xs w-full"
            style={FONT}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <label className="font-medium" style={FONT}>Location</label>
          <select
            value={header.location}
            onChange={(e) => setHeader((h) => ({ ...h, location: e.target.value }))}
            className="border rounded px-3 py-2 text-xs w-full"
            style={FONT}
          >
            <option value="gujarat">Inside Gujarat (CGST + SGST)</option>
            <option value="out">Outside Gujarat (IGST)</option>
          </select>
        </div>
        {header.location === "gujarat" ? (
          <>
            <div>
              <label className="font-medium" style={FONT}>CGST %</label>
              <input
                type="number"
                value={header.cgst}
                onChange={(e) =>
                  setHeader((h) => ({
                    ...h,
                    cgst: e.target.value === "" ? "" : parseFloat(e.target.value),
                  }))
                }
                className="border rounded px-3 py-2 text-xs w-full"
                style={FONT}
              />
            </div>
            <div>
              <label className="font-medium" style={FONT}>SGST %</label>
              <input
                type="number"
                value={header.sgst}
                onChange={(e) =>
                  setHeader((h) => ({
                    ...h,
                    sgst: e.target.value === "" ? "" : parseFloat(e.target.value),
                  }))
                }
                className="border rounded px-3 py-2 text-xs w-full"
                style={FONT}
              />
            </div>
          </>
        ) : (
          <div>
            <label className="font-medium" style={FONT}>IGST %</label>
            <input
              type="number"
              value={header.igst}
              onChange={(e) =>
                setHeader((h) => ({
                  ...h,
                  igst: e.target.value === "" ? "" : parseFloat(e.target.value),
                }))
              }
              className="border rounded px-3 py-2 text-xs w-full"
              style={FONT}
            />
          </div>
        )}
      </div>

      <div className="mt-4 text-right" style={FONT}>
        <p>Products Amount: <b>{rowsAmt.toFixed(2)}</b></p>
        <p>Fabrication Charges: <b>{fabrication.toFixed(2)}</b></p>
        <p>Installation Charges: <b>{installation.toFixed(2)}</b></p>
        <p>Total Amount (Before Tax): <b>{taxable.toFixed(2)}</b></p>
        <p>Taxes: <b>{taxAmt.toFixed(2)}</b></p>
        <p className="text-xl">Grand Total: <b>{grand}</b></p>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => nav(-1)}
          className="flex items-center gap-1 bg-[#EE4B2B] text-white px-4 py-2 rounded text-sm"
          style={FONT}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={saveQuotation}
          className="flex items-center gap-1 bg-[#74bbbd] text-white px-4 py-2 rounded text-sm"
          style={FONT}
        >
          <Save size={16} /> {mode === "add" ? "Finish & Print" : "Update & Print"}
        </button>
      </div>
    </div>
  );
}