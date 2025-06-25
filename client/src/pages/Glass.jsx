import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Pencil, Eye } from 'lucide-react';
import api from '../api';

/* ---------- constants ---------- */
const FONT = { fontFamily: 'Times New Roman, serif' };

const blank = { srNo: '', title: '', rate: '' };
const required = ['title', 'rate'];
const labels = { srNo: 'Sr No', title: 'Title', rate: 'Rate' };

/* ---------- Field ---------- */
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
        placeholder=""
        required={required.includes(name)}
        type={name === 'rate' ? 'number' : 'text'}
        step={name === 'rate' ? 'any' : undefined}
        onChange={e => onChange({
          target: {
            name,
            value: name === 'rate' ? e.target.value.replace(/[^0-9.]/g, '') : e.target.value
          }
        })}
        className="border rounded-md px-3 py-2 dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#74bbbd]"
        style={{ ...FONT, caretColor: 'black' }}
      />
    )}
  </div>
);

/* ---------- Modal ---------- */
const GlassModal = ({ mode, form, setForm, onSave, onClose, error }) => {
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold capitalize">{mode} Glass</h3>
          <button onClick={onClose} className="p-1"><X size={20} /></button>
        </div>
        {error && <div className="mb-4 px-4 py-2 rounded bg-red-100 text-red-800">{error}</div>}
        <form onSubmit={onSave} className="grid grid-cols-2 gap-4">
          {Object.keys(blank).map((k, i) => (
            <Field key={k} name={k} value={form[k]} onChange={handle} autoFocus={i === 0} readOnly={mode === 'view'} />
          ))}
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            {mode !== 'view' && <button type="submit" className="px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">{mode === 'add' ? 'Store' : 'Update'}</button>}
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[#EE4B2B] text-white rounded-md hover:opacity-90">Back</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------- Page ---------- */
export default function Glass() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ type: null, item: null });
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/glass').then(res => setItems(res.data)).catch(console.error);
  }, []);

  const openAdd = () => {
    const next = items.reduce((m, i) => Math.max(m, i.srNo || 0), 0) + 1;
    setForm({ ...blank, srNo: next });
    setModal({ type: 'add' });
    setError('');
  };

  const openEdit = item => { setForm(item); setModal({ type: 'edit', item }); setError(''); };
  const openView = item => { setForm(item); setModal({ type: 'view', item }); };
  const close = () => setModal({ type: null });

  const store = async e => {
    e.preventDefault();
    for (const k of required) if (!form[k]) return setError(`${labels[k]} is required`);
    try {
      const payload = { ...form, rate: Number(form.rate) };
      let data;
      if (modal.type === 'add') ({ data } = await api.post('/glass', payload));
      else ({ data } = await api.put(`/glass/${modal.item._id}`, payload));
      setItems(modal.type === 'add' ? [data, ...items] : items.map(i => i._id === data._id ? data : i));
      close();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.msg || 'Error saving');
    }
  };

  const del = async id => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/glass/${id}`);
      setItems(items.filter(i => i._id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting item');
    }
  };

  return (
    <div className="p-6 text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold" style={FONT}>Glass</h2>
        <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">
          <Plus size={18} /> Add Glass
        </button>
      </div>

      {items.length ? (
        <table className="min-w-full border border-gray-300 dark:border-slate-700 text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-700">
              {['Sr No', 'Title', 'Rate', 'Actions'].map(h => (
                <th key={h} className="px-4 py-2 border font-semibold text-center text-lg" style={FONT}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-4 py-2 border text-center" style={FONT}>{item.srNo}</td>
                <td className="px-4 py-2 border text-center" style={FONT}>{item.title}</td>
                <td className="px-4 py-2 border text-center" style={FONT}>{Number(item.rate).toFixed(2)}</td>
                <td className="px-4 py-2 border text-center space-x-2">
                  <button onClick={() => openView(item)} className="p-1 rounded bg-blue-100 text-blue-700"><Eye size={18} /></button>
                  <button onClick={() => openEdit(item)} className="p-1 rounded bg-green-100 text-green-700"><Pencil size={18} /></button>
                  <button onClick={() => del(item._id)} className="p-1 rounded bg-red-100 text-red-700"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 dark:text-gray-400" style={FONT}>No glass items yet.</p>
      )}

      {modal.type && (
        <GlassModal
          mode={modal.type}
          form={form}
          setForm={setForm}
          onSave={store}
          onClose={close}
          error={error}
        />
      )}
    </div>
  );
}
