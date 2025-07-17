import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, ArrowLeft, Pencil, Eye, X, Printer   } from "lucide-react";
import { useNavigate, useParams  } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import api from "../api";
const FONT = { fontFamily: "Times New Roman, serif" };
const cellCls = "border px-2 py-1 text-center text-[11px] whitespace-normal break-words";

const blankRow = {
  series: "",
  typology: "",
  insideInterlock: "",
  outsideInterlock: "",
  meshInterlock:"",
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
              name="meshInterlock"
              value={lists.interlocks.find((i) => i._id === form.meshInterlock)?.model || "-"}
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
             {form.typology?.toLowerCase().includes("m") && (
              <Field
                name="meshInterlock"
                value={form.meshInterlock}
                onChange={handle}
                options={lists.interlocks}
                labelKey="model"
              />
            )}
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
  const [quotationId, setQuotationId] = useState(id || null);
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  const [versions, setVersions] = useState([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rateUnit, setRateUnit] = useState("");
  const [selectedTermsType, setSelectedTermsType] = useState("");
  const [terms, setTerms] = useState("");
  const [q, setQ] = useState(null);
  const [saving, setSaving] = useState(false);
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
    middle: [],
    hardwares: [],
  });
  const [header, setHeader] = useState({
    clientName: "",
    clientCity: "",
    aluminiumRate: 300,
    location: "gujarat",
    cgst: 9,
    sgst: 9,
    igst: 18,
    fabrication: 0,
    installation: 0,
     discount: 0,
    projectId : "",
    terms: "",
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
          {data: hardwares = [] },
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
          api.get("/hardware").catch((err) => {
          console.error("Failed to fetch /hardware:", err.message);
          return { data: [] };
        }),
        ]);
        const interlocks = aluminium.filter((a) => (a.model || "").toUpperCase().includes("INTERLOCK"));
        const rails = aluminium.filter((a) => (a.model || "").toUpperCase().includes("RAIL"));
        const frames = aluminium.filter((a) => (a.model || "").toUpperCase().includes("TRACK"));
        const sashes = aluminium.filter((a) => (a.model || "").toUpperCase().includes("HANDLE"));
        const middle = aluminium.filter((a) => (a.model || "").toUpperCase().includes("MIDDLE"));
        const series = Array.isArray(grouped.series) ? grouped.series : [];
        const finishesList = Array.isArray(finishes) ? finishes : [];

        setLists({
          series,
          typologiesBySeries: grouped.typologiesBySeries || {},
          interlocks,
          rails,
          frames,
          sashes,
          middle,
          finishes: finishesList,
          glasses,
          locks,
          allProducts: grouped.allProducts || [],
          hardwares,
        });

       if (mode === "add" && projectId) {
         setHeader((prev) => ({ ...prev, projectId }));
        }
      } catch (err) {
        console.error("Data fetching failed:", err.message);
        setError("Failed to load data. Please check your network or try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, mode])
useEffect(() => {
  if (mode === "edit" && id) {
    (async () => {
      try {
        const { data } = await api.get(`/quotationEditor/versions/${id}`);
        const latest = data[data.length - 1];
        if (latest) {
          setHeader(latest.header || {});
          setRows(latest.rows || []);
          setQuotationId(latest._id);
        }
      } catch (err) {
        console.error("❌ Failed to load cumulative version data:", err.message);
        setError("Could not load quotation for editing.");
      }
    })();
  }
}, [mode, id]);

useEffect(() => {
  if (mode === "view" && projectId) {
    (async () => {
      try {
        // Step 1: Get latest quotation for the project (or any one to find parent)
        const { data: quotations } = await api.get(`/quotationEditor/project/${projectId}`);
        if (!quotations || quotations.length === 0) {
          console.warn("No quotations found for this project.");
          return;
        }

        // You can pick the latest (or first, up to you)
        const latestQuotation = quotations[quotations.length - 1];
        setQuotationId(latestQuotation._id);

        // Step 2: Fetch all versions using parent ID
        const { data: versions } = await api.get(`/quotationEditor/versions/${latestQuotation._id}`);
        if (!versions || versions.length === 0) {
          console.warn("No versions found for quotation");
          return;
        }

        setVersions(versions);
        const active = versions[versions.length - 1];
        setHeader(active.header || {});
        setRows(active.rows || []);
        setActiveVersionIndex(versions.length - 1);
      } catch (err) {
        console.error("View mode data loading failed:", err.message);
        setError("Failed to load quotation versions.");
      }
    })();
  }
}, [mode, projectId]);
useEffect(() => {
  if (mode === "add" && projectId) {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name") || "";
    const city = params.get("city") || "";

    setHeader((prev) => ({
      ...prev,
      projectId,
      clientName: name,
      clientCity: city,
    }));
  }
}, [mode, projectId]);
useEffect(() => {
  if (!rows.length) return;

  const updated = rows.map((r) => handleRow(r));
  setRows(updated);
}, [header.aluminiumRate]);

  const getRate = (list, id) => {
    const item = list?.find((i) =>
      i._id === id || i.typology === id || i.series === id || i.title === id || i.code === id
    );
    return item?.rate || 0;
  
};
useEffect(() => {
  if (mode === "add" || !id) {
    setQ(null);
    setQuotationId(null);
    setTerms("");
    return;
  }
  setLoading(true);
  api.get(`/quotationEditor/${id}`)
    .then(res => {
      if (!res.data?._id) {
        throw new Error("Invalid quotation data: missing _id");
      }
      setQ(res.data);
      setQuotationId(res.data._id);
      setTerms(res.data.header?.terms || "");
    })
    .catch(err => {
      console.error("Error loading quotation:", err);
      setError("Failed to load quotation. Please check the ID or try again.");
      setQ(null);
      setQuotationId(null);
    })
    .finally(() => setLoading(false));
}, [id, mode]);

  const handleRow = (row) => {
    const up = { ...row };
    const widthMM = +parseFloat(up.widthMM) || 0;
    const heightMM = +parseFloat(up.heightMM) || 0;
    const qty = +parseFloat(up.qty) || 1;
    const widthM = widthMM / 1000;
    const heightM = heightMM / 1000;

    const areaSqm = (widthMM * heightMM) / 1000000;
    const areaSqft = areaSqm * 10.7639;

    up.sqm = areaSqm.toFixed(3);
    up.sqft = areaSqft.toFixed(3);
    const aluminiumRate = parseFloat(header.aluminiumRate) || 300;

    const seriesItem=lists.allProducts.find((s)=>s.series==up.series);
    const typologyItem = lists.allProducts.find((p) => p.typology === up.typology);
    const finishItem = lists.finishes.find((f) => f._id === up.finish || f.title === up.finish);
    const lockItem = lists.locks.find((l) => l._id === up.lock || l.title === up.lock);
    const lockRate = parseFloat(lockItem?.rate) || 0;
    const glassItem = lists.glasses.find((g) => g._id === up.glass || g.title === up.glass);
    const glassRate = parseFloat(glassItem?.rate) || 0;
    const perimeterM = (widthM * 2) + (heightM * 2);
    let insideInterlockAmount = 0;
    let meshInterlockAmount = 0;
    let outsideInterlockAmount = 0;
    let railAmount =0;
    let lockAmount =0;
    const glassAmount = areaSqm * glassRate;
    let finishAmount = 0;
    let typologyAmount = 0;
    let hardwareAmount = 0;
    
  if(seriesItem && seriesItem.series=="3200 SP"){
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
      skrew13X7:"CSK PH 7X13 GI",
      brush:"ACC_BRUSH",
      distancePieces:"PH139/B",
      silicon:"WACKER GN CL 270	",
      woolpipe:"4.8X6 GREY WP",
      trackEPDM:"EPDM 4746",
      interlockEPDM:"EPDM 8085",
      glassEPDM:"OSAKA",
      reciever:"ORBITA",
      skrew8X25:"CSK PH 8X25 [SS-304]",
      interLockEndCap101:"PH308/B",
      interLockEndCap81:"PH260/B",
      waterDrainageCover:"PDC101/B",
      wallSkrew:"CSK PH 8X75 [SS-304]",
      rowelPlug:"32MM WP",
      pushButton:"10MM PB",
      packing:"PC_2X_3X",
      glassPacker:"MANGALUM",
    };

    up.hardwareDetails = {};
    
    Object.entries(hardwareVendorCodes).forEach(([key, code]) => {
      const item = lists.hardwares.find(h => h.vendorCode === code);
      if (item) {
        up.hardwareDetails[key] = {
          vendorCode: code,
          rate: parseFloat(item.rate) || 0,
        };
      }
    });
      
        const rollerRate=(up.hardwareDetails.roller?.rate || 0);
        const nonrollerRate=(up.hardwareDetails.nonroller?.rate || 0);
        const skrew19X8Rate=(up.hardwareDetails.skrew19X8?.rate || 0);
        const cleatForFrameRate=(up.hardwareDetails.cleatForFrame?.rate || 0);
        const cleatForShutterRate=(up.hardwareDetails.cleatForShutter?.rate || 0);
        const shutterAngleRate=(up.hardwareDetails.shutterAngle?.rate || 0);
        const ssPattiRate=(up.hardwareDetails.ssPatti?.rate || 0);
        const shutterAntiLiftRate=(up.hardwareDetails.shutterAntiLift?.rate || 0);
        const skrew19X7Rate=(up.hardwareDetails.skrew19X7?.rate || 0);
        const interLockCoverRate=(up.hardwareDetails.interLockCover?.rate || 0);
        const skrew13X7Rate=(up.hardwareDetails.skrew13X7?.rate || 0);
        const brushRate=(up.hardwareDetails.brush?.rate || 0);
        const distancePiecesRate=(up.hardwareDetails.distancePieces?.rate || 0);
        const siliconRate=(up.hardwareDetails.silicon?.rate || 0);
        const woolpipeRate=(up.hardwareDetails.woolpipe?.rate || 0);
        const trackEPDMRate=(up.hardwareDetails.trackEPDM?.rate || 0);
        const interlockEPDMRate=(up.hardwareDetails.interlockEPDM?.rate || 0);
        const glassEPDMRate=(up.hardwareDetails.glassEPDM?.rate || 0);
        const recieverRate=(up.hardwareDetails.reciever?.rate || 0);
        const skrew8X25Rate=(up.hardwareDetails.skrew8X25?.rate || 0);
        const interLockEndCap101Rate=(up.hardwareDetails.interLockEndCap101?.rate || 0);
        const interLockEndCap81Rate=(up.hardwareDetails.interLockEndCap81?.rate || 0);
        const waterDrainageCoverRate=(up.hardwareDetails.waterDrainageCover?.rate || 0);
        const wallSkrewRate=(up.hardwareDetails.wallSkrew?.rate || 0);
        const rowelPlugRate=(up.hardwareDetails.rowelPlug?.rate || 0);
        const pushButtonRate=(up.hardwareDetails.pushButton?.rate || 0);
        const packingRate=(up.hardwareDetails.packing?.rate || 0);
        const glassPackerRate=(up.hardwareDetails.glassPacker?.rate || 0);
        const pta25x8Rate=(up.hardwareDetails.pta25x8?.rate || 0);

    if(seriesItem && seriesItem.series === "3200 SP") {
    if (typologyItem && typologyItem.typology) {
      const typologyName = typologyItem.typology.toUpperCase();
      let frameConv = 0;
      let  sashConv=0;
      let framePara=0;
      let sashPara=0;
      let insideInterlockConv = 0;
      let insideInterlockPara = 0;
    
      let outsideInterlockConv = 0;
      let outsideInterlockPara =0 ;
    
      let meshInterlockConv = 0;
      let meshInterlockPara = 0;
      
      let railConv =  0;
      let railPara= 0;
        
      let middleConv = 0;
      let middlePara = 0;
      // Select frame based on typology
      if (typologyName.startsWith("2 TRACK")) {
        const frameItem = lists.frames.find((f) => (f.model || "").toUpperCase().includes("32SP 2 TRACK"));
        frameConv = frameItem ? parseFloat(frameItem.conversionUnitKgPerMtr) || 0 : 0;
        framePara = frameItem ? parseFloat(frameItem.parameter) || 0 : 0;
        const sashItem = lists.sashes.find((s) => (s.model || "").toUpperCase().includes("32SP HANDLE SGU"));
        sashConv = sashItem ? parseFloat(sashItem.conversionUnitKgPerMtr) || 0 : 0;
        sashPara = sashItem ? parseFloat(sashItem.parameter) || 0 : 0;
       const insideInterlockItem = lists.interlocks.find((i) => i._id === up.insideInterlock || i.model === up.insideInterlock);
        insideInterlockConv = insideInterlockItem ? parseFloat(insideInterlockItem.conversionUnitKgPerMtr) || 0 : 0;
        insideInterlockPara = insideInterlockItem ? parseFloat(insideInterlockItem.parameter) || 0 : 0;
        const outsideInterlockItem = lists.interlocks.find((i) => i._id === up.outsideInterlock || i.model === up.outsideInterlock);
        outsideInterlockConv = outsideInterlockItem ? parseFloat(outsideInterlockItem.conversionUnitKgPerMtr) || 0 : 0;
        outsideInterlockPara = outsideInterlockItem ? parseFloat(outsideInterlockItem.parameter) || 0 : 0;
        const meshInterlockItem = lists.interlocks.find((o) => o._id === up.meshInterlock);
        meshInterlockConv = meshInterlockItem ? parseFloat(meshInterlockItem.conversionUnitKgPerMtr) || 0 : 0;
        meshInterlockPara = meshInterlockItem ? parseFloat(meshInterlockItem.parameter) || 0 : 0;
        const railItem = lists.rails.find((r) => r._id === up.rail || r.model === up.rail);
        railConv = railItem ? parseFloat(railItem.conversionUnitKgPerMtr) || 0 : 0;
        railPara= railItem ? parseFloat(railItem.parameter) || 0 : 0;
        const centerMiddleItem = (lists.middle || []).find((m) =>(m.model || "").toUpperCase().includes("32SP CENTRAL MIDDLE"));
        middleConv = centerMiddleItem ? parseFloat(centerMiddleItem.conversionUnitKgPerMtr) || 0 : 0;
        middlePara = centerMiddleItem ? parseFloat(centerMiddleItem.parameter) || 0 : 0;

      } else if (typologyName.startsWith("3 TRACK")) {
        const frameItem = lists.frames.find((f) => (f.model || "").toUpperCase().includes("SP 3 TRACK"));
        frameConv = frameItem ? parseFloat(frameItem.conversionUnitKgPerMtr) || 0 : 0;
       
      }

      switch (typologyName) {
        case "2 TRACK 2 SHUTTER":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 2)) + (sashConv * widthM * 2)) * aluminiumRate;
          finishAmount =
                ((framePara / 1000) * (widthM * 2 + heightM * 2) +
                  (sashPara / 1000) * (heightM * 2) +
                  (sashPara / 1000) * (widthM * 2) +
                  (outsideInterlockPara / 1000) * heightM +
                  (insideInterlockPara / 1000) * heightM +
                  (railPara / 1000) * widthM * 2) *
                (finishItem?.rate||0);
          hardwareAmount=rollerRate*4+skrew19X8Rate*10+cleatForFrameRate*4+cleatForShutterRate*4+
          shutterAngleRate*4+ssPattiRate*8+shutterAntiLiftRate*2+skrew19X7Rate*2+interLockCoverRate*4+
          skrew13X7Rate*4+brushRate*2+distancePiecesRate*16+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*
          wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+
          woolpipeRate*(widthM*4+heightM*4)+woolpipeRate*(heightM*2)+trackEPDMRate*(widthM*2+heightM*4)+interlockEPDMRate*heightM*2+
          glassEPDMRate*(widthM*2+heightM*4)+glassPackerRate*(widthMM*2+heightMM*4)/650+siliconRate*(perimeterM*2/9.5);
          insideInterlockAmount = insideInterlockConv * heightM * aluminiumRate;
          outsideInterlockAmount = outsideInterlockConv * heightM * aluminiumRate;
          railAmount = railConv * 2 * widthM * aluminiumRate;
          lockAmount=lockRate*2;
          console.log("Rail amount",railAmount);
          console.log("Finish Amount W interlock",finishAmount);
          console.log("Hardware's Amount",hardwareAmount);
          break;

        case "2 TRACK 3 SHUTTER":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 2)) + (sashConv * widthM * 2)) * aluminiumRate;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 2))+((sashPara/1000)*(widthM * 2)) +(outsideInterlockPara/1000*heightM*2)+(insideInterlockPara/1000*heightM*2)+(railPara/1000*widthM*2))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*6+skrew19X8Rate*16+cleatForFrameRate*4+cleatForShutterRate*4+
          shutterAngleRate*8+ssPattiRate*8+shutterAntiLiftRate*3+skrew19X7Rate*3+interLockCoverRate*8+
          skrew13X7Rate*8+brushRate*4+distancePiecesRate*24+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*
          wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+
          woolpipeRate*(widthM*4+heightM*4)+woolpipeRate*(heightM*4)+trackEPDMRate*(widthM*2+heightM*4)+interlockEPDMRate*heightM*4+
          glassEPDMRate*(widthM*2+heightM*6)+glassPackerRate*(widthMM*2+heightMM*6)/650+siliconRate*(perimeterM*2/9.5);
        insideInterlockAmount = insideInterlockConv * heightM*2 * aluminiumRate;
        outsideInterlockAmount = outsideInterlockConv * heightM*2 * aluminiumRate;
        railAmount = railConv * 2 * widthM * aluminiumRate;
        lockAmount=lockRate*2;
        console.log("Finish Amount W interlock",finishAmount);
        console.log("Hardware's Amount",hardwareAmount);
          break;

        case "2 TRACK 4 SHUTTER":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 4)) + (sashConv * widthM * 2)+(middleConv*heightM)) * aluminiumRate;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 4))+((sashPara/1000)*(widthM * 2)) +(outsideInterlockPara/1000*heightM*2)+(insideInterlockPara/1000*heightM*2)+(railPara/1000*widthM*2)+(middlePara/1000*heightM))* (finishItem?.rate || 0);         
          hardwareAmount=rollerRate*8+skrew19X8Rate*20+cleatForFrameRate*4+cleatForShutterRate*8+
          shutterAngleRate*8+ssPattiRate*16+shutterAntiLiftRate*4+skrew19X7Rate*4+interLockCoverRate*8+
          skrew13X7Rate*8+brushRate*4+distancePiecesRate*32+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*
          wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+
          woolpipeRate*(widthM*4+heightM*8)+woolpipeRate*(heightM*4)+trackEPDMRate*(widthM*2+heightM*4)+interlockEPDMRate*heightM*4+
          glassEPDMRate*(widthM*2+heightM*8)+glassPackerRate*(widthMM*2+heightMM*8)/650+siliconRate*(perimeterM*2/9.5);
          insideInterlockAmount = insideInterlockConv * heightM*2 * aluminiumRate;         
          outsideInterlockAmount = outsideInterlockConv * heightM*2 * aluminiumRate;        
          railAmount = railConv * 2 * widthM * aluminiumRate;      
          lockAmount=lockRate*3;   
          console.log("Finish Amount W interlock",finishAmount);         
          console.log("Hardware's Amount",hardwareAmount);
          break;

        case "3 TRACK 3 SHUTTER":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 2)) + (sashConv * widthM * 2))* aluminiumRate;        
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 2))+((sashPara/1000)*(widthM * 2)) +(outsideInterlockPara/1000*heightM*2)+(insideInterlockPara/1000*heightM*2)+(railPara/1000*widthM*3))* (finishItem?.rate || 0);          
          hardwareAmount=rollerRate*6+skrew19X8Rate*16+cleatForFrameRate*8+cleatForShutterRate*8+shutterAngleRate*12+ssPattiRate*16+shutterAntiLiftRate*6+skrew19X7Rate*6+interLockCoverRate*12+skrew13X7Rate*24+brushRate*6+distancePiecesRate*48+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*6+heightM*12)+woolpipeRate*(heightM*6)+trackEPDMRate*(widthM*3+heightM*6)+interlockEPDMRate*heightM*4+glassEPDMRate*(widthM*2+heightM*6)+glassPackerRate*(widthMM*2+heightMM*6)/650+siliconRate*(perimeterM*2/9.5);          
          insideInterlockAmount = insideInterlockConv * heightM*2 * aluminiumRate;          
          outsideInterlockAmount = outsideInterlockConv * heightM*2 * aluminiumRate;          
          railAmount = railConv * 3 * widthM * aluminiumRate;          
          lockAmount=lockRate*2;
           console.log("Finish Amount W interlock",finishAmount);         
           console.log("Hardware's Amount",hardwareAmount);
        break;

        case "3 TRACK 2 SHUTTER 1 MESH":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 3)) + (sashConv * widthM *3))* aluminiumRate;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 3))+((sashPara/1000)*(widthM * 3)) +(outsideInterlockPara/1000*heightM*1)+(insideInterlockPara/1000*heightM*1)+(meshInterlockPara/1000*heightM*1)+(railPara/1000*widthM*3))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*4+nonrollerRate*2+pta25x8Rate*4+skrew19X8Rate*12+cleatForFrameRate*8+cleatForShutterRate*6+shutterAngleRate*6+ssPattiRate*12+shutterAntiLiftRate*3+skrew19X7Rate*3+interLockCoverRate*6+skrew13X7Rate*12+brushRate*4+distancePiecesRate*24+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*6+heightM*6)+woolpipeRate*(heightM*6)+trackEPDMRate*(widthM*3+heightM*6)+interlockEPDMRate*heightM*3+glassEPDMRate*(widthM*2+heightM*6)+glassPackerRate*(widthMM*3+heightMM*4)/650+siliconRate*(perimeterM*2/9.5);
           insideInterlockAmount = insideInterlockConv * heightM* aluminiumRate;
          outsideInterlockAmount = outsideInterlockConv * heightM * aluminiumRate;
          meshInterlockAmount= meshInterlockConv * heightM * aluminiumRate;
           railAmount = railConv * 3 * widthM * aluminiumRate; 
           lockAmount=lockRate*3;
          console.log("Finish Amount W interlock",finishAmount);
         
          console.log("Hardware's Amount",hardwareAmount);
        break;

        case "3 TRACK 3 SHUTTER 2 MESH":
         typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 4)) + (sashConv * widthM *3)+(middleConv*heightM))* aluminiumRate;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 4))+((sashPara/1000)*(widthM * 3)) +(outsideInterlockPara/1000*heightM*2)+(insideInterlockPara/1000*heightM*2)+(meshInterlockPara/1000*heightM*2)+(railPara/1000*widthM*3)+(middlePara/1000*heightM))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*6+nonrollerRate*4+pta25x8Rate*8+skrew19X8Rate*18+cleatForFrameRate*8+cleatForShutterRate*12+shutterAngleRate*12+ssPattiRate*24+shutterAntiLiftRate*6+skrew19X7Rate*6+interLockCoverRate*12+skrew13X7Rate*24+brushRate*6+distancePiecesRate*40+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*6+heightM*6)+woolpipeRate*(heightM*6)+trackEPDMRate*(widthM*3+heightM*6)+interlockEPDMRate*heightM*6+glassEPDMRate*(widthM*3+heightM*10)+glassPackerRate*(widthMM*3+heightMM*6)/650+siliconRate*(perimeterM*2/9.5);
           insideInterlockAmount = insideInterlockConv * heightM*2* aluminiumRate;
          outsideInterlockAmount = outsideInterlockConv * heightM *2* aluminiumRate;
          meshInterlockAmount= meshInterlockConv * heightM * 2*aluminiumRate;
           railAmount = railConv * 3 * widthM * aluminiumRate; 
           lockAmount=lockRate*4;
          console.log("Finish Amount W interlock",finishAmount);
         
          console.log("Hardware's Amount",hardwareAmount);
        break;

        case "3 TRACK 4 SHUTTER 2 MESH":
         typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 6)) + (sashConv * widthM *3)+(middleConv*heightM))* aluminiumRate;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 6))+((sashPara/1000)*(widthM * 3)) +(outsideInterlockPara/1000*heightM*2)+(insideInterlockPara/1000*heightM*2)+(meshInterlockPara/1000*heightM*2)+(railPara/1000*widthM*3)+(middlePara/1000*heightM))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*8+nonrollerRate*4+pta25x8Rate*8+skrew19X8Rate*22+cleatForFrameRate*8+cleatForShutterRate*12+shutterAngleRate*12+ssPattiRate*24+shutterAntiLiftRate*6+skrew19X7Rate*6+interLockCoverRate*12+skrew13X7Rate*24+brushRate*6+distancePiecesRate*48+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*6+heightM*12)+woolpipeRate*(heightM*6)+trackEPDMRate*(widthM*3+heightM*6)+interlockEPDMRate*heightM*6+glassEPDMRate*(widthM*3+heightM*12)+glassPackerRate*(widthMM*3+heightMM*6)/650+siliconRate*(perimeterM*2/9.5);
           insideInterlockAmount = insideInterlockConv * heightM*2* aluminiumRate;
          outsideInterlockAmount = outsideInterlockConv * heightM *2* aluminiumRate;
          meshInterlockAmount= meshInterlockConv * heightM * 2*aluminiumRate;
           railAmount = railConv * 3 * widthM * aluminiumRate; 
           lockAmount=lockRate*4;
          console.log("Finish Amount W interlock",finishAmount);
         
          console.log("Hardware's Amount",hardwareAmount);
          break;
        
         case "3 TRACK 6 SHUTTER":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 4)) + (sashConv * widthM * 2)+(middleConv*heightM))* aluminiumRate;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 4))+((sashPara/1000)*(widthM * 2)) +(outsideInterlockPara/1000*heightM*4)+(insideInterlockPara/1000*heightM*4)+(railPara/1000*widthM*3)+(middlePara/1000*heightM))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*12+skrew19X8Rate*30+cleatForFrameRate*8+cleatForShutterRate*4+shutterAngleRate*8+ssPattiRate*8+shutterAntiLiftRate*3+skrew19X7Rate*3+interLockCoverRate*8+skrew13X7Rate*16+brushRate*4+distancePiecesRate*24+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*4+heightM*4)+woolpipeRate*(heightM*4)+trackEPDMRate*(widthM*3+heightM*6)+interlockEPDMRate*heightM*6+glassEPDMRate*(widthM*3+heightM*12)+glassPackerRate*(widthMM*3+heightMM*6)/650+siliconRate*(perimeterM*2/9.5);
           insideInterlockAmount = insideInterlockConv * heightM*4 * aluminiumRate;
          outsideInterlockAmount = outsideInterlockConv * heightM*4 * aluminiumRate;
           railAmount = railConv * 3 * widthM * aluminiumRate;
           lockAmount=lockRate*3;
          console.log("Finish Amount W interlock",finishAmount);
         
          console.log("Hardware's Amount",hardwareAmount);
          break;

        default:
          console.warn(`Warning: No matching typology found for "${typologyName}"`);
          typologyAmount = 0;
          finishAmount = 0;
          break;
      }
    }
    }else if(seriesItem && seriesItem.series === "5000") {
  }}
  
    const totalPerUnit = typologyAmount + lockAmount + railAmount + glassAmount + insideInterlockAmount + outsideInterlockAmount + meshInterlockAmount+ finishAmount+hardwareAmount;
    const totalAmount = (totalPerUnit) * qty;

    up.amount = totalAmount.toFixed(2); 
    up.rateSqM = areaSqm > 0 ? (totalPerUnit / areaSqm).toFixed(2) : "";
    up.rateSqFt = areaSqft > 0 ? (totalPerUnit / areaSqft).toFixed(2) : "";

    console.log({
     typologyAmount,
     hardwareAmount,
     finishAmount,
     insideInterlockAmount,
     outsideInterlockAmount,
     lock:lockAmount,
     glassAmount,
   });
   // Step: Add aluminiumDetails
const aluminiumDetails = [];

if (row.typology && row.series) {
  const { typology, series, widthMM, heightMM, qty = 1 } = row;
  const widthM = widthMM / 1000;
  const heightM = heightMM / 1000;

  // Example: 2 TRACK 4 SHUTTER
  const trackMatch = typology.match(/(\d+)\s*TRACK/);
  const shutterMatch = typology.match(/(\d+)\s*SHUTTER/);
  const trackCount = trackMatch ? parseInt(trackMatch[1]) : 0;
  const shutterCount = shutterMatch ? parseInt(shutterMatch[1]) : 0;

  if (trackCount) {
    aluminiumDetails.push({
      label: `${series} ${trackCount} TRACK`,
      quantity: `${qty} × ${widthM.toFixed(2)}`,
      total: parseFloat((qty * widthM).toFixed(2)),
    });
  }

  if (shutterCount) {
    aluminiumDetails.push({
      label: `${series} ${shutterCount} SHUTTER`,
      quantity: `${qty} × ${shutterCount} × ${heightM.toFixed(2)}`,
      total: parseFloat((qty * shutterCount * heightM).toFixed(2)),
    });

    // Handle (height-based)
    aluminiumDetails.push({
      label: `${series} HANDLE`,
      quantity: `${qty} × ${shutterCount} × ${heightM.toFixed(2)}`,
      total: parseFloat((qty * shutterCount * heightM).toFixed(2)),
    });

    // Top/Bottom (width-based)
    aluminiumDetails.push({
      label: `${series} TOP/BOTTOM`,
      quantity: `${qty} × ${shutterCount} × ${widthM.toFixed(2)}`,
      total: parseFloat((qty * shutterCount * widthM).toFixed(2)),
    });
  }

  // Rail (assume 2 pcs per window)
  aluminiumDetails.push({
    label: `${series} RAIL`,
    quantity: `${qty} × 2 × ${widthM.toFixed(2)}`,
    total: parseFloat((qty * 2 * widthM).toFixed(2)),
  });

  // Interlocks (inside/outside/mesh)
  const interlocks = [
    { field: row.insideInterlock, label: "INSIDE INTERLOCK" },
    { field: row.outsideInterlock, label: "OUTSIDE INTERLOCK" },
    { field: row.meshInterlock, label: "MESH INTERLOCK" },
  ];

  interlocks.forEach(({ field, label }) => {
    if (field) {
      aluminiumDetails.push({
        label,
        quantity: `${qty} × ${heightM.toFixed(2)}`,
        total: parseFloat((qty * heightM).toFixed(2)),
      });
    }
  });
}

row.aluminiumDetails = aluminiumDetails;
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
  const totalArea = rows.reduce((sum, r) => {
  const area = rateUnit === "sqft" ? parseFloat(r.sqft) : parseFloat(r.sqm);
  return sum + (isNaN(area) ? 0 : area);
}, 0);

const fabrication = totalArea * (+header.fabrication || 0);
const installation = totalArea * (+header.installation || 0);

  const taxable = rowsAmt + fabrication + installation;

  const taxAmt =
    header.location === "gujarat"
      ? taxable * ((+header.cgst + +header.sgst) / 100)
      : taxable * (+header.igst / 100);
      const discountPercent = parseFloat(header.discount) || 0;
      const discountAmount = (taxable + taxAmt) * (discountPercent / 100);
      const grand = (taxable + taxAmt - discountAmount).toFixed(2);

async function saveQuotation(shouldPrint = false) {
  try {
    // Validate required fields
    if (!header.clientName|| rows.length === 0) {
      alert("Please fill in Client Name and add at least one product row");
      return;
    }

    const payload = {
       header: {
          clientName: header.clientName,
          clientCity: header.clientCity,
          aluminiumRate: parseFloat(header.aluminiumRate) || 300,
          location: header.location,
          cgst: parseFloat(header.cgst) || 9,
          sgst: parseFloat(header.sgst) || 9,
          igst: parseFloat(header.igst) || 18,
          fabrication: parseFloat(header.fabrication) || 0,
          installation: parseFloat(header.installation) || 0,
          projectId: header.projectId,
          rateType: rateUnit,
          terms,
        },
      rows: rows.map(row => {
  const glassObj = lists.glasses.find(g => g._id === row.glass || g.id === row.glass);
  const finishObj = lists.finishes.find(f => f._id === row.finish || f.title === row.finish);
  const lockObj = lists.locks.find(l => l._id === row.lock || l.title === row.lock);
  const railObj = lists.rails.find(r => r._id === row.rail || r.id === row.rail);
  const insideInterlockObj = lists.interlocks.find(i => i._id === row.insideInterlock || i.id === row.insideInterlock);
  const outsideInterlockObj = lists.interlocks.find(i => i._id === row.outsideInterlock || i.id === row.outsideInterlock);

  return {
    ...row,
    glass: glassObj?._id || row.glass,
    finish: finishObj?._id || row.finish,
    lock: lockObj?._id || row.lock,
    rail: railObj?._id || row.rail,
    insideInterlock: insideInterlockObj?._id || row.insideInterlock,
    outsideInterlock: outsideInterlockObj?._id || row.outsideInterlock,
    amount: parseFloat(row.amount) || 0,
    qty: parseInt(row.qty) || 1
  };
}),

      totalAmt: taxable,
      taxAmt,
      grand
    };
   let response;
    if (!quotationId) {
      response = await api.post("/quotationEditor", payload);
    } else {
      response = await api.put(`/quotationEditor/${quotationId}`, payload);
    }

    const newQuotation = response.data;
    setQuotationId(newQuotation._id);
    setHeader(newQuotation.header || {});
    setRows(newQuotation.rows || []);
    setQ(newQuotation); // Set q to the new quotation
    setTerms(newQuotation.header?.terms || "");
    if (shouldPrint) {
      nav(`/quotation/${newQuotation._id}/print?unit=${rateUnit}`);
    } else {
      alert(`Quotation ${quotationId ? 'updated' : 'saved'} successfully!`);
    }

  } catch (err) {
    console.error("Save failed:", err);
    const errorMsg = err.response?.data?.msg || err.message || "Could not save quotation";
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
const handlePrint = async () => {
  if (quotationId) {
    nav(`/quotation/${quotationId}/print?unit=${rateUnit}`);
  } else {
    alert("No quotation available for printing");
  }
};
const handleVersionClick = (version) => {
  setHeader(version.header || {});
  setRows(version.rows || []);
  setQuotationId(version._id);
  setQ(version);
  setTerms(version.header?.terms || "");
  setActiveId(version._id);
};
const handleSaveTerms = async () => {
  if (!quotationId) {
    alert("Quotation not loaded or invalid. Please save the quotation first.");
    return;
  }

  try {
    await api.patch(`/quotationEditor/${quotationId}/terms`, { terms });
    alert("Terms updated successfully.");
  } catch (err) {
    console.error("Failed to save terms:", err);
    alert("Failed to save terms. Please check the console.");
  }
};


const filteredRows = rows.filter((row) => {
  const seriesLabel =
    lists.series.find((s) => s._id === row.series)?.series || row.series || "";
  return seriesLabel.toLowerCase().includes(searchQuery.toLowerCase());
});

  return (
    
    <div className="p-6 ">
      <h1 className="text-3xl font-bold mb-4">
  {mode === "view" ? "Quotation View" : "Quotation Editor"}
</h1>

     <div className="mb-4">
  <label className="mr-2 font-medium">Rate Unit:</label>
  <select
    value={rateUnit}
    onChange={(e) => setRateUnit(e.target.value)}
    className="border rounded px-2 py-1 text-sm"
  >
    <option value="">-- Select Rate Unit --</option>
    <option value="sqft">Per SqFt</option>
    <option value="sqm">Per SqM</option>
  </select>
</div>
<div className="grid grid-cols-4 gap-4 mb-6 text-sm">
  {/* Client Name */}
  <div>
    <label className="font-medium" style={FONT}>Client Name</label>
    {mode === "view" ? (
      <div className="border rounded px-3 py-2 bg-gray-50 text-xs">{header.clientName || "-"}</div>
    ) : (
      <input
        value={header.clientName}
        onChange={(e) => setHeader((h) => ({ ...h, clientName: e.target.value }))}
        className="border rounded px-3 py-2 text-xs w-full"
        style={FONT}
      />
    )}
  </div>

  {/* Client City */}
  <div>
    <label className="font-medium" style={FONT}>Client City</label>
    {mode === "view" ? (
      <div className="border rounded px-3 py-2 bg-gray-50 text-xs">{header.clientCity || "-"}</div>
    ) : (
      <input
        value={header.clientCity}
        onChange={(e) => setHeader((h) => ({ ...h, clientCity: e.target.value }))}
        className="border rounded px-3 py-2 text-xs w-full"
        style={FONT}
      />
    )}
  </div>
</div>
  {/* Aluminium Rate - spans full width */}
  <div className="grid grid-cols-4 mb-4 text-sm">
    <div>
    <label className="font-medium" style={FONT}>Aluminium Rate</label>
    {mode === "view" ? (
      <div className="border rounded px-3 py-2 bg-gray-50 text-xs">{header.aluminiumRate || "300"}</div>
    ) : (
      <input
        type="number"
        step="0.01"
        value={header.aluminiumRate}
        onChange={(e) =>
          setHeader((h) => ({
            ...h,
            aluminiumRate: e.target.value,
          }))
        }
        className="border rounded px-3 py-2 text-xs w-full"
        style={FONT}
      />
    )}
  </div>
</div>

{/* Version Buttons - outside of grid, placed separately below aluminium rate */}
{mode === "view" && versions.length > 0 && (
  <div className="mb-4">
    <div className="flex overflow-x-auto space-x-2 py-2 px-1 whitespace-nowrap">
      {versions.map((version) => (
        <button
          key={version._id}
          onClick={() => handleVersionClick(version)}
          className={`px-4 py-2 rounded-full shrink-0 ${
            activeId === version._id ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          {version.version === 0 ? "Original" : `R ${version.version}`}
        </button>
      ))}
    </div>
  </div>
)}

{mode === "view" && (
  <input
  type="text"
  placeholder="Filter by Series"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="mb-4 border px-3 py-2 rounded text-sm w-full"
  style={FONT}
/>
)}

      {rows.length ? (
        <div className="overflow-x-auto">
        <table className="w-full max-w-full mx-auto border text-[11px] mb-6 table-fixed">   
          <thead className="bg-gray-100">
            <tr>
              {[
                "SrNo.",
                "Series",
                "Typology",
                "W(mm)",
                "H(mm)",
                "Inside Inter Lock",
                "Mesh Inter Lock",
                "Outside Inter Lock",
                "Rail",
                "Finish",
                "Lock",
                "Glass",
                "Qty",
                "SqFt",
                "SqM",
                "Amount",
                 `Rate/${rateUnit === "sqft" ? "SqFt" : "SqM"}`,
                ...(mode !== "view" ? ["Actions"] : [])
              ].map((h) => (
                <th key={h} className={cellCls}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>

            {filteredRows.map((r, i) => {
              
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
                    {lists.interlocks.find((i) => i._id === r.meshInterlock)?.model || r.meshInterlock || "-"}
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
                      {rateUnit === "sqft" ? r.rateSqFt : rateUnit === "sqm" ? r.rateSqM : "-"}
                  </td>
                  {mode !== "view" && (
                  <td className={cellCls}>
                    <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => openView(i)}
                      className="p-1 bg-blue-100 text-blue-700 "
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => openEdit(i)}
                      className="p-1 bg-green-100 text-green-700 "
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
                    </div>
                  </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
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
    {(mode === "add" || mode === "edit") && (
  <button
    onClick={openAdd}
    className="mb-6 flex items-center gap-1 bg-green-200 px-3 py-1 rounded text-sm"
    style={FONT}
  >
    <Plus size={14} /> Add Product Row
  </button>
)}

      <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
  {/* Fabrication Charges (editable in all modes) */}
  <div>
    <label className="font-medium" style={FONT}>Fabrication Charges (per {rateUnit.toUpperCase()}) </label>
    <input
      type="number"
      step="0.01"
      value={header.fabrication}
      onChange={(e) =>
        setHeader((h) => ({
          ...h,
          fabrication: e.target.value ,
        }))
      }
      className="border rounded px-3 py-2 text-xs w-full"
      style={FONT}
    />
  </div>

  {/* Installation Charges (already correct) */}
  <div>
    <label className="font-medium" style={FONT}>Installation Charges (per {rateUnit.toUpperCase()})</label>
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

      <div className="grid grid-cols-4 gap-4 text-sm">
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
              <label className="font-medium" style={FONT}>CGST (%)</label>
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
              <label className="font-medium" style={FONT}>SGST (%)</label>
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
      <div className="grid grid-cols-4 gap-4 text-sm mt-4">
  <div>
    <label className="font-medium" style={FONT}>Discount Amount (%)</label>
    <input
      type="number"
      step="0.01"
      value={header.discount}
      onChange={(e) =>
        setHeader((h) => ({
          ...h,
          discount: e.target.value === "" ? "" : parseFloat(e.target.value),
        }))
      }
      className="border rounded px-3 py-2 text-xs w-full"
      style={FONT}
    />
  </div>
</div>

      {/* Terms & Conditions (View Only) */}

{mode === "view" && (
  <div className="mt-6">
    <label className="block font-semibold text-gray-800 mb-2">Select Terms Type:</label>
    <select
      className="border rounded-md px-3 py-2 text-sm max-w-sm"
      value={selectedTermsType}
      onChange={(e) => {
        const val = e.target.value;
        setSelectedTermsType(val);

        if (val === "glass") {
          setTerms(
            `● Taxes : GST as per actual.\n` +
            `● Rates: All above quoted rates are per PC's.\n` +
            `● Glass: Glass as per above required specification, if any changes in glass specification, the rate will change accordingly.\n` +
            `● Facilities to be provided by Client: Safe lock & key storage, Electricity Supply and proper working space, and labor accommodation.\n` +
            `● Transportation: extra at actual. At the time of material dispatch.\n` +
            `● Scaffolding: In client scope, if required.\n` +
            `● Changes: For any changes in drawing, window specification or glass, there would be change in rates.\n` +
            `● Site handover: Once the site is handed over, no claim for free supply or compensation arising due to physical damage will be entertained. We will be answerable to complaints arising due to workmanship or quality of the product supplied.\n` +
            `● Validity of the offer: 15 days.\n` +
                `Given Project value will change if there is variation in NALCO rate.\n` +
            `● Payment Terms:\n` +
            `    • 50% advance along with the order confirmation\n` +
            `    • 25% before dispatch of material\n` +
            `    • 15% During Installation stagewise\n` +
            `    • 10% After completion of work within 15 Days.\n` +
            `● SUBJECT TO SURAT JURISDICTION.`
          );
        } else if (val === "facade") {
          setTerms(
            `1. Facade cladding will be installed post structural readiness of the building.\n` +
            `2. Material warranty: 10 years for structural integrity.\n` +
            `3. Site safety and access are the responsibility of the client.\n` +
            `4. Any design change post-approval will incur additional cost.\n` +
            `5. Taxes, transport, and scaffolding charges are extra unless stated.`
          );
        } else {
          setTerms("");
        }
      }}
    >
      <option value="">-- Select Terms --</option>
      <option value="glass">Glass and Window</option>
      <option value="facade">Facade</option>
    </select>

    {selectedTermsType && (
      <div className="mt-4">
        <label className="block font-semibold text-gray-800 mb-2">Terms & Conditions:</label>
        <textarea
  className="border border-gray-300 rounded-md p-2 text-sm w-full max-w-2xl"
  rows={6}
  value={terms}
  onChange={(e) => setTerms(e.target.value)}
 onKeyDown={(e) => {
  if (e.key === "Enter") {
    const { selectionStart, selectionEnd } = e.target;

    e.preventDefault();

    const before = terms.substring(0, selectionStart);
    const after = terms.substring(selectionEnd);

    const updated = `${before}\n● ` + after;

    setTerms(updated);

    // Move cursor after the bullet
    setTimeout(() => {
      e.target.selectionStart = e.target.selectionEnd = selectionStart + 3;
    }, 0);
  }
}}
/>
        <button
          onClick={handleSaveTerms}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition block"
        >
          Save Terms
        </button>
      </div>
    )}
  </div>
)}

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
       {mode !== "view" && (
    <button
      onClick={() => saveQuotation(false)}
      className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded text-sm"
      style={FONT}
    >
      <Save size={16} />
      {quotationId ? 'Update' : 'Save'}
    </button>
  )}
       {mode === "view" && (
  <>
    <button
      onClick={handlePrint}
      className="bg-blue-600 text-white px-4 py-2 rounded"
      style={FONT}
    >
      Print
    </button>

    <button
      onClick={() => nav(`/mto/${quotationId}`)}
      className="bg-green-600 text-white px-4 py-2 rounded "
      style={FONT}
    >
      MTO
    </button>
  </>
)}
      </div>
      
    </div>
  );
}