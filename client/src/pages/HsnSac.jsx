import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Pencil, Eye } from 'lucide-react';
import api from '../api';                    // ← shared Axios instance

/* ---------- blank record ------------------------------------------ */
const blank = {
  code: '', description: '', commodityType: 'Good HSN',
  effectiveDate: '', cgst: '', sgst: '', igst: '',
};

/* ---------- Field component stays the same ------------------------ */
const Field = ({ name, label, value, onChange, readOnly=false, type='text' }) => (
  <div className="flex flex-col gap-1">
    <label className="font-medium">{label}</label>
    {readOnly ? (
      <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-700">{value||'-'}</div>
    ) : name==='commodityType' ? (
      <select
        name={name} value={value} onChange={onChange}
        className="border rounded-md px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
      >
        <option value="Good HSN">Good HSN</option>
        <option value="Service SAC">Service SAC</option>
      </select>
    ) : (
      <input
        type={type} name={name} value={value} placeholder={label}
        onChange={onChange} required
        className="border rounded-md px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
      />
    )}
  </div>
);

/* ---------- Modal stays largely the same -------------------------- */
function HsnModal({ mode, form, setForm, onClose, onSave }) {
  const handle = (e)=>setForm(p=>({...p,[e.target.name]:e.target.value}));
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold capitalize">{mode} HSN/SAC Code</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        {mode==='view' ? (
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(blank).map(k=>(
              <Field key={k} name={k} label={k} value={form[k]} readOnly/>
            ))}
          </div>
        ):(
          <form onSubmit={onSave} className="grid grid-cols-2 gap-4">
            <Field name="code"          label="Product HSN/SAC Code" value={form.code} onChange={handle}/>
            <Field name="description"   label="Description"          value={form.description} onChange={handle}/>
            <Field name="commodityType" label="Commodity Type"      value={form.commodityType} onChange={handle}/>
            <Field name="effectiveDate" label="Effective Date" type="date" value={form.effectiveDate} onChange={handle}/>
            <Field name="cgst" label="CGST %" type="number" value={form.cgst} onChange={handle}/>
            <Field name="sgst" label="SGST %" type="number" value={form.sgst} onChange={handle}/>
            <Field name="igst" label="IGST %" type="number" value={form.igst} onChange={handle}/>
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button type="submit" className="px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">
                {mode==='add'?'Store':'Update'}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2 bg-[#EE4B2B] text-white rounded-md hover:opacity-90">
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- Main component --------------------------------------- */
export default function HsnSac() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ type: null, item: null });
  const [form,  setForm]  = useState(blank);

  /* fetch all on mount */
  useEffect(() => {
    api.get('/hsn')
       .then(res => setItems(res.data))
       .catch(err => console.error(err));
  }, []);

  /* modal helpers */
  const openAdd  = ()   => { setForm(blank);         setModal({ type:'add'  }); };
  const openEdit = it   => { setForm(it);            setModal({ type:'edit', item:it }); };
  const openView = it   => { setForm(it);            setModal({ type:'view', item:it }); };
  const closeMod = ()   => setModal({ type:null });

  /* add / update */
  const store = async (e) => {
    e.preventDefault();
    try {
      if (modal.type==='add') {
        const { data } = await api.post('/hsn', form);
        setItems([data, ...items]);
      } else {
        const { data } = await api.put(`/hsn/${modal.item._id}`, form);
        setItems(items.map(it=>it._id===data._id?data:it));
      }
      closeMod();
    } catch(err) {
      console.error(err);
      alert('Error saving HSN/SAC');
    }
  };

  /* delete */
  const delItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/hsn/${id}`);
      setItems(items.filter(it=>it._id!==id));
    } catch(err) {
      console.error(err);
      alert('Error deleting item');
    }
  };

  /* render */
  return (
    <div className="p-6 text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold" style={{ fontFamily:'Times New Roman, serif' }}>
          HSN / SAC Codes
        </h2>
        <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">
          <Plus size={18}/> Add HSN/SAC Code
        </button>
      </div>

      {items.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-slate-700 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-700">
                {['Code','Description','Commodity','Effective','CGST %','SGST %','IGST %','Actions'].map(h=>(
                  <th key={h} className="px-4 py-2 border font-semibold text-center text-lg">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(it=>(
                <tr key={it._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-2 border text-center">{it.code}</td>
                  <td className="px-4 py-2 border text-center">{it.description}</td>
                  <td className="px-4 py-2 border text-center">{it.commodityType}</td>
                  <td className="px-4 py-2 border text-center">{it.effectiveDate}</td>
                  <td className="px-4 py-2 border text-center">{it.cgst}</td>
                  <td className="px-4 py-2 border text-center">{it.sgst}</td>
                  <td className="px-4 py-2 border text-center">{it.igst}</td>
                  <td className="px-4 py-2 border space-x-2 text-center">
                    <button onClick={()=>openView(it)} className="p-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200" title="View"><Eye size={18}/></button>
                    <button onClick={()=>openEdit(it)} className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200" title="Edit"><Pencil size={18}/></button>
                    <button onClick={()=>delItem(it._id)} className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200" title="Delete"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No HSN/SAC codes yet.</p>
      )}

      {modal.type && (
        <HsnModal mode={modal.type} form={form} setForm={setForm} onSave={store} onClose={closeMod}/>
      )}
    </div>
  );
}
