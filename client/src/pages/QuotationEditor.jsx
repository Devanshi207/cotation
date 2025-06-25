import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

const FONT = { fontFamily: "Times New Roman, serif" };

const blankRow = {
  series: "", typology: "", interlock: "", rail: "", finish: "", glass: "", lock: "",
  widthMM: "", heightMM: "", qty: 1,
  sqft: "", sqm: "", rateSqFt: "", rateSqM: "", rateType: "sqft", amount: ""
};


export default function QuotationEditor({ mode = "add" }) {
  const { id } = useParams();
  const nav = useNavigate();

  const [rows, setRows] = useState([{ ...blankRow }]);
  const [lists, setLists] = useState({
    series: [],
    typologiesBySeries: {},
    finishes: [],
    glasses: [],
    locks: [],
    allProducts: [],
    interlocks: [],
    rails: []
  });

  const [header, setHeader] = useState({
    clientName: "", clientCity: "",
    location: "gujarat",
    cgst: 9, sgst: 9, igst: 18,
    fabrication: 0, installation: 0,
    projectId: ""
  });

  useEffect(() => {
    (async () => {
      try {
        const [
          { data: grouped },
          { data: glasses },
          { data: locks },
          { data: finishes },
          { data: aluminium }
        ] = await Promise.all([
          api.get("/products/grouped"),
          api.get("/glass"),
          api.get("/locks"),
          api.get("/finish"),
          api.get("/aluminium")
        ]);

        const interlocks = aluminium.filter(a => (a.model || "").toUpperCase().includes("INTERLOCK"));
        const rails = aluminium.filter(a => a.model?.toUpperCase().includes("RAIL"));

        setLists({
          series: grouped.series,
          typologiesBySeries: grouped.typologiesBySeries,
          glasses,
          locks,
          allProducts: grouped.allProducts,
          finishes,
          interlocks,
          rails
        });

      } catch (err) {
        console.error("Dropdown load failed:", err);
      }
    })();
  }, []);

  const getRate = (list, id) => {
    const item = list.find(i =>
      i._id === id || i.typology === id || i.series === id || i.title === id || i.code === id
    );
    return item?.rate || 0;
  };

  const addRow = () => setRows(r => [...r, { ...blankRow }]);
  const removeRow = idx => setRows(r => r.filter((_, i) => i !== idx));

const handleRow = (idx, name, value) => {
  setRows(old =>
    old.map((row, i) => {
      if (i !== idx) return row;

      const up = { ...row, [name]: value };

      if (name === "series") up.typology = "";

      const widthMM = +up.widthMM || 0;
      const heightMM = +up.heightMM || 0;
      const qty = +up.qty || 1;
      const widthM = widthMM / 1000;
      const heightM = heightMM / 1000;
      
      // Calculate areas
      const areaSqm = (widthMM * heightMM) / 1000000;
      const areaSqft = areaSqm * 10.7639;

      up.sqm = areaSqm.toFixed(3);
      up.sqft = areaSqft.toFixed(3);

      // Get rates
      const typologyItem = lists.allProducts.find(p => p._id === up.typology);
      const typologyRate = typologyItem?.rate || 0;
      
      const finishItem = lists.finishes.find(f => f._id === up.finish);
      const finishRate = finishItem?.rate || 0;  // Finish rate from finish.jsx
      
      const lockItem = lists.locks.find(l => l._id === up.lock);
      const lockRate = parseFloat(lockItem?.rate) || 0;
      
      const glassItem = lists.glasses.find(g => g._id === up.glass);
      const glassRate = parseFloat(glassItem?.rate) || 0;
      
      const interlockItem = lists.interlocks.find(i => i._id === up.interlock);
      const interlockConv = interlockItem ? parseFloat(interlockItem.conversionUnitKgPerMtr) || 0 : 0;
      
      const railItem = lists.rails.find(r => r._id === up.rail);
      const railConv = railItem ? parseFloat(railItem.conversionUnitKgPerMtr) || 0 : 0;

      // Calculate perimeter in mm
      const perimeterMM = (widthMM * 2) + (heightMM * 2);
      
      // Calculate parameter = perimeter * 1.44 * 300
      const parameter = perimeterMM * 1.44 * 300;
      
      // Calculate finish amount using your formula
      const finishAmount = ((widthMM * 2 + heightMM * 2) * 1.44 * 300 * widthMM * finishRate) / 100000000;

      
      // Typology-specific calculations
      let typologyExtra = 0;
      if (typologyItem && typologyItem.title) {
        const typologyName = typologyItem.title.toLowerCase();
        
        if (typologyName.includes("2 track")) {
          // Use the same parameter calculation but in meters
          typologyExtra = (perimeterMM / 1000) * 1.44 * 300;
        } 
        else if (typologyName.includes("handle")) {
          typologyExtra = (heightMM / 1000) * 2 * 1.04 * 300;
        } 
        else if (typologyName.includes("top bottom shutter")) {
          typologyExtra = (widthMM / 1000) * 2 * 1.04 * 300;
        }
      }
      
      // Other component calculations
      const interlockAmount = interlockConv * 2 * heightM * 300;
      const railAmount = railConv * 2 * widthM * 300;
      const glassAmount = areaSqm * glassRate;

      // Calculate total per unit
      const totalPerUnit = 
        typologyRate + 
        lockRate + 
        railAmount + 
        glassAmount + 
        interlockAmount +
        typologyExtra +
        finishAmount;

      const totalAmount = totalPerUnit * qty;
      
      // Update row values
      up.amount = totalAmount.toFixed(2);
      up.rateSqM = areaSqm > 0 ? (totalPerUnit / areaSqm).toFixed(2) : "";
      up.rateSqFt = areaSqft > 0 ? (totalPerUnit / areaSqft).toFixed(2) : "";
      
      return up;
    })
  );
};
  const rowsAmt = rows.reduce((s, r) => s + (+r.amount || 0), 0);
  const fabrication = +header.fabrication || 0;
  const installation = +header.installation || 0;
  const fixedCharge = 2488;
  const taxable = rowsAmt + fabrication + installation + fixedCharge;

  const taxAmt =
    header.location === "gujarat"
      ? taxable * ((+header.cgst + +header.sgst) / 100)
      : taxable * (+header.igst / 100);

  const grand = (taxable + taxAmt).toFixed(2);

  async function saveQuotation() {
    try {
      const payload = { 
        header: {
          ...header,
          fixedCharge  // Include fixed charge in payload
        }, 
        rows, 
        totalAmt: taxable, 
        taxAmt, 
        grand 
      };
      let qid = id;

      if (mode === "add") {
        const { data } = await api.post("/quotations", payload);
        qid = data._id;
      } else {
        await api.put(`/quotations/${id}`, payload);
      }
      nav(`/quotation/${qid}/print`);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Could not save quotation");
    }
  }

  const cellCls = "border px-1 text-center text-xs whitespace-nowrap";
  const renderSelect = (val, onC, opts, label) => (
    <select 
      value={val} 
      onChange={e => onC(e.target.value)} 
      className="border px-1 text-xs"
    >
      <option value="">--</option>
      {opts.map(o => (
        <option key={o._id} value={o._id}>
          {o.model || o.title || o.name || o.code || o.series}
        </option>
      ))}
    </select>
  );

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4" style={FONT}>Quotation Editor</h2>

      {/* Header */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <label>Client Name</label>
          <input 
            value={header.clientName} 
            onChange={e => setHeader(h => ({ ...h, clientName: e.target.value }))} 
            className="border w-full" 
          />
        </div>
        <div>
          <label>Client City</label>
          <input 
            value={header.clientCity} 
            onChange={e => setHeader(h => ({ ...h, clientCity: e.target.value }))} 
            className="border w-full" 
          />
        </div>
      </div>

      {/* Table */}
      <table className="w-full border text-xs mb-4">
        <thead className="bg-gray-100">
          <tr>
            {["Sr", "Series", "Typology", "Interlock", "Rail", "Finish", "Lock", "Glass", "W(mm)", "H(mm)", "Qty", "SqFt", "SqM", "Amount", "Rate", ""]
              .map(h => <th key={h} className={cellCls}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className={cellCls}>{i + 1}</td>
              <td className={cellCls}>
                {renderSelect(r.series, v => handleRow(i, "series", v), lists.series, "title")}
              </td>
              <td className={cellCls}>
                {renderSelect(r.typology, v => handleRow(i, "typology", v), lists.typologiesBySeries[r.series] || [], "title")}
              </td>
              <td className={cellCls}>
                {renderSelect(r.interlock, v => handleRow(i, "interlock", v), lists.interlocks, "model")}
              </td>
              <td className={cellCls}>
                {renderSelect(r.rail, v => handleRow(i, "rail", v), lists.rails, "model")}
              </td>
              <td className={cellCls}>
                {renderSelect(r.finish, v => handleRow(i, "finish", v), lists.finishes, "title")}
              </td>
              <td className={cellCls}>
                {renderSelect(r.lock, v => handleRow(i, "lock", v), lists.locks, "title")}
              </td>
              <td className={cellCls}>
                {renderSelect(r.glass, v => handleRow(i, "glass", v), lists.glasses, "title")}
              </td>
              <td className={cellCls}>
                <input 
                  value={r.widthMM} 
                  onChange={e => handleRow(i, "widthMM", e.target.value)} 
                  className="w-16 border" 
                />
              </td>
              <td className={cellCls}>
                <input 
                  value={r.heightMM} 
                  onChange={e => handleRow(i, "heightMM", e.target.value)} 
                  className="w-16 border" 
                />
              </td>
              <td className={cellCls}>
                <input 
                  value={r.qty} 
                  onChange={e => handleRow(i, "qty", e.target.value)} 
                  className="w-12 border" 
                />
              </td>
              <td className={cellCls}>{r.sqft}</td>
              <td className={cellCls}>{r.sqm}</td>
              <td className={cellCls}>{r.amount}</td>
              <td className={cellCls}>
                <select 
                  value={r.rateType} 
                  onChange={e => handleRow(i, "rateType", e.target.value)} 
                  className="text-xs border"
                >
                  <option value="sqft">SqFt</option>
                  <option value="sqm">SqM</option>
                </select>
                <div>{r.rateType === "sqft" ? r.rateSqFt : r.rateSqM}</div>
              </td>
              <td className={cellCls}>
                {rows.length > 1 && (
                  <button onClick={() => removeRow(i)} title="Remove">
                    <Trash2 size={14} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addRow} className="mb-6 flex items-center gap-1 bg-green-200 px-3 py-1 rounded">
        <Plus size={14} /> Add product row
      </button>

      {/* Charges */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <label>Fabrication Charges</label>
          <input 
            type="number"
            step="0.01"
            value={header.fabrication} 
            onChange={e => setHeader(h => ({ 
              ...h, 
              fabrication: e.target.value === "" ? "" : parseFloat(e.target.value) 
            }))} 
            className="border w-full" 
          />
        </div>
        <div>
          <label>Installation Charges</label>
          <input 
            type="number"
            step="0.01"
            value={header.installation} 
            onChange={e => setHeader(h => ({ 
              ...h, 
              installation: e.target.value === "" ? "" : parseFloat(e.target.value) 
            }))} 
            className="border w-full" 
          />
        </div>
      </div>

      {/* Tax Section */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <label className="font-medium" style={FONT}>Location</label>
          <select 
            value={header.location} 
            onChange={e => setHeader(h => ({ ...h, location: e.target.value }))} 
            className="border w-full"
          >
            <option value="gujarat">Inside Gujarat (CGST + SGST)</option>
            <option value="out">Outside Gujarat (IGST)</option>
          </select>
        </div>
        {header.location === "gujarat" ? (
          <>
            <div>
              <label>CGST %</label>
              <input 
                type="number"
                value={header.cgst} 
                onChange={e => setHeader(h => ({ 
                  ...h, 
                  cgst: e.target.value === "" ? "" : parseFloat(e.target.value) 
                }))} 
                className="border w-full" 
              />
            </div>
            <div>
              <label>SGST %</label>
              <input 
                type="number"
                value={header.sgst} 
                onChange={e => setHeader(h => ({ 
                  ...h, 
                  sgst: e.target.value === "" ? "" : parseFloat(e.target.value) 
                }))} 
                className="border w-full" 
              />
            </div>
          </>
        ) : (
          <div>
            <label>IGST %</label>
            <input 
              type="number"
              value={header.igst} 
              onChange={e => setHeader(h => ({ 
                ...h, 
                igst: e.target.value === "" ? "" : parseFloat(e.target.value) 
              }))} 
              className="border w-full" 
            />
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="mt-4 text-right" style={FONT}>
        <p>Products Amount: <b>{rowsAmt.toFixed(2)}</b></p>
        <p>Fabrication Charges: <b>{fabrication.toFixed(2)}</b></p>
        <p>Installation Charges: <b>{installation.toFixed(2)}</b></p>
        <p>Fixed Charge: <b>2488.00</b></p>
        <p>Total Amount (Before Tax): <b>{taxable.toFixed(2)}</b></p>
        <p>Taxes: <b>{taxAmt.toFixed(2)}</b></p>
        <p className="text-xl">Grand Total: <b>{grand}</b></p>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <button onClick={() => nav(-1)} className="flex items-center gap-1 bg-gray-200 px-4 py-2 rounded">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={saveQuotation} className="flex items-center gap-1 bg-[#74bbbd] text-white px-4 py-2 rounded">
          <Save size={16} /> {mode === "add" ? "Finish & Print" : "Update & Print"}
        </button>
      </div>
    </div>
  );
}