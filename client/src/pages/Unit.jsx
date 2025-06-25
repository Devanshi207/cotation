import React, { useEffect, useState } from "react";
import { Plus, Trash2, X, Pencil, Eye } from "lucide-react";
import api from "../api";                 //  <— use shared instance

const blank = { unit: "", shortForm: "" };

/* Field … (unchanged) -------------------------------------------------- */
const Field = ({ name, value, onChange, readOnly = false }) => (
  <div className="flex flex-col gap-1">
    <label className="font-medium">{name === "unit" ? "Unit" : "Short Form"}</label>
    {readOnly ? (
      <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-700">
        {value || "-"}
      </div>
    ) : (
      <input
        required
        name={name}
        value={value}
        placeholder={name === "unit" ? "Unit" : "Short Form"}
        onChange={onChange}
        className="border rounded-md px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
      />
    )}
  </div>
);

/* Modal … (unchanged except `onSave`) ---------------------------------- */
const UnitModal = ({ mode, form, setForm, onSave, onClose }) => {
  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl max-w-xl w-full">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold">{mode} Unit</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {mode === "view" ? (
          <div className="grid grid-cols-2 gap-4">
            <Field name="unit"      value={form.unit}      readOnly />
            <Field name="shortForm" value={form.shortForm} readOnly />
          </div>
        ) : (
          <form onSubmit={onSave} className="grid grid-cols-2 gap-4">
            <Field name="unit"      value={form.unit}      onChange={handle} />
            <Field name="shortForm" value={form.shortForm} onChange={handle} />
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button className="px-4 py-2 bg-[#74bbbd] text-white rounded-md">
                {mode === "add" ? "Add" : "Update"}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2 bg-[#EE4B2B] text-white rounded-md">
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* Main page ------------------------------------------------------------ */
export default function Unit() {
  const [items, setItems]   = useState([]);
  const [modal, setModal]   = useState({ type: null, item: null });
  const [form,  setForm]    = useState(blank);

  /* fetch once */
  useEffect(() => { api.get("/unit").then(r => setItems(r.data)); }, []);

  /* helpers */
  const refresh  = () => api.get("/unit").then(r => setItems(r.data));
  const openAdd  = ()         => { setForm(blank);       setModal({ type:"add"  }); };
  const openEdit = (it)       => { setForm(it);          setModal({ type:"edit", item:it }); };
  const openView = (it)       => { setForm(it);          setModal({ type:"view", item:it }); };
  const close    = ()         => setModal({ type:null });

  /* create / update */
  const store = async (e) => {
    e.preventDefault();
    if (modal.type === "add") {
      await api.post("/unit", form);
    } else {
      await api.put(`/unit/${modal.item._id}`, form);
    }
    refresh(); close();
  };

  /* delete */
  const del = async (id) => {
    if (!window.confirm("Delete?")) return;
    await api.delete(`/unit/${id}`);
    refresh();
  };

  /* render */
  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-4xl font-bold">Unit</h2>
        <button onClick={openAdd} className="flex gap-1 px-4 py-2 bg-[#74bbbd] text-white rounded-md">
          <Plus size={18}/> Add Unit
        </button>
      </div>

      {items.length ? (
        <table className="min-w-full border text-sm">
          <thead><tr className="bg-gray-100">{["Unit","Short","Actions"].map(h=>(
            <th key={h} className="px-4 py-2 border">{h}</th>))}</tr></thead>
          <tbody>{items.map(it=>(
            <tr key={it._id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{it.unit}</td>
              <td className="border px-4 py-2">{it.shortForm}</td>
              <td className="border px-4 py-2 space-x-2 text-center">
                <button onClick={()=>openView(it)} className="p-1 bg-blue-100 text-blue-700"><Eye size={18}/></button>
                <button onClick={()=>openEdit(it)} className="p-1 bg-green-100 text-green-700"><Pencil size={18}/></button>
                <button onClick={()=>del(it._id)}   className="p-1 bg-red-100 text-red-700"><Trash2 size={18}/></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      ) : <p>No units yet.</p>}

      {modal.type && (
        <UnitModal mode={modal.type} form={form} setForm={setForm} onSave={store} onClose={close} />
      )}
    </div>
  );
}
