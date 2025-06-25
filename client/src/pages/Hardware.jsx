import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Pencil, Eye } from 'lucide-react';
import api from '../api';

const FONT = { fontFamily: 'Times New Roman, serif' };

/* -------- default form -------- */
const blank = {
  srNo: '',
  vendorCode: '',
  make: '',
  productName: '',
  model: '',
  uom: '',
  rate: ''
};

const required = ['vendorCode', 'make', 'productName', 'model', 'uom', 'rate'];

const labels = {
  srNo: 'Sr No.',
  vendorCode: 'Vendor Code',
  make: 'Make',
  productName: 'Product Name',
  model: 'Model',
  uom: 'UoM',
  rate: 'Rate'
};

/* -------- Field component ------ */
const Field = ({ name, value, onChange, readOnly = false, autoFocus = false }) => (
  <div className="flex flex-col gap-1">
    <label className="font-medium" style={FONT}>{labels[name]}</label>

    {readOnly || name === 'srNo' ? (
      <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-700" style={FONT}>
        {value || '-'}
      </div>
    ) : (
      <input
        autoFocus={autoFocus}
        name={name}
        value={value}
        required={required.includes(name)}
        type={name === 'rate' ? 'number' : 'text'}
        step={name === 'rate' ? 'any' : undefined}
        placeholder=""
        onChange={
          name === 'rate'
            ? e => onChange({ target: { name, value: e.target.value.replace(/[^0-9.]/g, '') } })
            : onChange
        }
        className="border rounded-md px-3 py-2 dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#74bbbd]"
        style={{ ...FONT, caretColor: 'black' }}
      />
    )}
  </div>
);

/* -------- Modal --------------- */
const HardwareModal = ({ mode, form, setForm, onSave, onClose, error }) => {
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold capitalize" style={FONT}>{mode} Hardware</h3>
          <button onClick={onClose} className="p-1"><X size={20}/></button>
        </div>

        {error && <div className="mb-4 px-4 py-2 rounded bg-red-100 text-red-800">{error}</div>}

        {mode === 'view' ? (
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(blank).map(k => <Field key={k} name={k} value={form[k]} readOnly />)}
          </div>
        ) : (
          <form onSubmit={onSave} className="grid grid-cols-2 gap-4">
            {Object.keys(blank).map((k, idx) => (
              <Field key={k} name={k} value={form[k]} onChange={handle} autoFocus={idx === 0} />
            ))}
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button type="submit" className="px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">
                {mode === 'add' ? 'Store' : 'Update'}
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
};

/* -------- Main Page ----------- */
export default function Hardware() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ type: null, item: null });
  const [form, setForm]   = useState(blank);
  const [error, setError] = useState('');

  /* fetch on mount */
  useEffect(() => {
    api.get('/hardware')
      .then(res => setItems([...res.data].sort((a, b) => a.srNo - b.srNo)))
      .catch(console.error);
  }, []);

  /* open/close helpers */
  const openAdd  = () => {
    const next = items.reduce((m, i) => Math.max(m, i.srNo || 0), 0) + 1;
    setForm({ ...blank, srNo: next });
    setError('');
    setModal({ type: 'add' });
  };
  const openEdit = item => { setForm(item); setError(''); setModal({ type: 'edit', item }); };
  const openView = item => { setForm(item); setModal({ type: 'view', item }); };
  const closeMod = () => setModal({ type: null });

  /* store (add / update) */
  const store = async e => {
    e.preventDefault();
    for (const k of required) {
      if (!form[k] || (typeof form[k] === 'string' && form[k].trim() === '')) {
        return setError(`${labels[k]} is required`);
      }
    }
    try {
      const payload = { ...form, rate: Number(form.rate) };
      let data;
      if (modal.type === 'add') ({ data } = await api.post('/hardware', payload));
      else ({ data } = await api.put(`/hardware/${modal.item._id}`, payload));

      const list = modal.type === 'add'
        ? [...items, data]
        : items.map(i => (i._id === data._id ? data : i));
      setItems(list.sort((a, b) => a.srNo - b.srNo));
      closeMod();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.msg || err?.response?.data?.error || 'Error saving');
    }
  };

  /* delete */
  const delItem = async id => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/hardware/${id}`);
      setItems(items.filter(i => i._id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting item');
    }
  };

  /* render */
  return (
    <div className="p-6 text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold" style={FONT}>Hardware</h2>
        <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">
          <Plus size={18}/> Add Hardware
        </button>
      </div>

      {items.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-slate-700 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-700">
                {['Sr No.', 'Vendor Code', 'Make', 'Product Name', 'Model', 'UoM', 'Rate', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2 border font-semibold text-center text-lg" style={FONT}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(hw => (
                <tr key={hw._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-2 border text-center" style={FONT}>{hw.srNo}</td>
                  {['vendorCode', 'make', 'productName', 'model', 'uom', 'rate'].map(k => (
                    <td key={k} className="px-4 py-2 border text-center" style={FONT}>
                      {k === 'rate' && hw[k] != null ? Number(hw[k]).toFixed(2) : hw[k]}
                    </td>
                  ))}
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button onClick={() => openView(hw)}  className="p-1 rounded bg-blue-100  text-blue-700  hover:bg-blue-200"><Eye    size={18}/></button>
                    <button onClick={() => openEdit(hw)} className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200"><Pencil size={18}/></button>
                    <button onClick={() => delItem(hw._id)} className="p-1 rounded bg-red-100   text-red-700   hover:bg-red-200"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400" style={FONT}>No hardware items yet.</p>
      )}

      {modal.type && (
        <HardwareModal
          mode={modal.type}
          form={form}
          setForm={setForm}
          onSave={store}
          onClose={closeMod}
          error={error}
        />
      )}
    </div>
  );
}
