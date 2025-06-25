// src/pages/Aluminium.jsx

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Pencil, Eye } from 'lucide-react';
import api from '../api';

const FONT = { fontFamily: 'Times New Roman, serif' };

const blank = {
  srNo: '',
  code: '',
  make: '',
  model: '',
  conversionUnitKgPerMtr: '',
  parameter: '',
  productGroup: ''
};

const required = ['code', 'make', 'model', 'conversionUnitKgPerMtr', 'productGroup'];

const Field = ({ name, value, onChange, readOnly = false, autoFocus = false }) => {
  const labels = {
    srNo: 'Sr No',
    code: 'Code',
    make: 'Make',
    model: 'Model',
    conversionUnitKgPerMtr: 'Conv. Kg/Mtr',
    parameter: 'Parameter',
    productGroup: 'Product Group'
  };
  const label = labels[name];

  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium" style={FONT}>{label}</label>
      {readOnly || name === 'srNo' ? (
        <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-700" style={FONT}>
          {value || '-'}
        </div>
      ) : (
        <input
          autoFocus={autoFocus}
          name={name}
          value={value}
          placeholder={label}
          onChange={name === 'conversionUnitKgPerMtr'
            ? (e) => onChange({ target: { name, value: e.target.value.replace(/[^0-9.]/g, '') } })
            : onChange}
          required={required.includes(name)}
          type={name === 'conversionUnitKgPerMtr' ? 'number' : 'text'}
          step={name === 'conversionUnitKgPerMtr' ? 'any' : undefined}
          className="border rounded-md px-3 py-2 dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#74bbbd]"
          style={{ ...FONT, caretColor: 'black' }}
        />
      )}
    </div>
  );
};

const AluminiumModal = ({ mode, form, setForm, onSave, onClose, error }) => {
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold capitalize">{mode} Aluminium</h3>
          <button onClick={onClose} className="p-1"><X size={20} /></button>
        </div>
        {error && <div className="mb-4 px-4 py-2 rounded bg-red-100 text-red-800">{error}</div>}
        <form onSubmit={onSave} className="grid grid-cols-2 gap-4">
          {Object.keys(blank).map((k, i) => <Field key={k} name={k} value={form[k]} onChange={handle} autoFocus={i === 0} readOnly={mode === 'view'} />)}
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            {mode !== 'view' && (
              <button type="submit" className="px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">{mode === 'add' ? 'Store' : 'Update'}</button>
            )}
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[#EE4B2B] text-white rounded-md hover:opacity-90">Back</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Aluminium() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ type: null, item: null });
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/aluminium').then(r => setItems(r.data)).catch(console.error);
  }, []);

  const openAdd = () => {
    const next = items.reduce((max, i) => Math.max(max, i.srNo || 0), 0) + 1;
    setForm({ ...blank, srNo: next });
    setModal({ type: 'add' });
    setError('');
  };

  const openEdit = item => { setForm(item); setModal({ type: 'edit', item }); setError(''); };
  const openView = item => { setForm(item); setModal({ type: 'view', item }); setError(''); };
  const close = () => setModal({ type: null, item: null });

  const store = async e => {
    e.preventDefault();
    for (const k of required) if (!form[k]) return setError(`${k} is required`);
    try {
      const payload = { ...form, conversionUnitKgPerMtr: Number(form.conversionUnitKgPerMtr) };
      let data;
      if (modal.type === 'add') ({ data } = await api.post('/aluminium', payload));
      else ({ data } = await api.put(`/aluminium/${modal.item._id}`, payload));
      setItems(modal.type === 'add' ? [data, ...items] : items.map(i => i._id === data._id ? data : i));
      close();
    } catch (err) {
      setError(err?.response?.data?.msg || 'Error saving');
    }
  };

  const del = async id => {
    if (!window.confirm('Delete?')) return;
    await api.delete(`/aluminium/${id}`);
    setItems(items.filter(i => i._id !== id));
  };

  return (
    <div className="p-6 text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold" style={FONT}>Aluminium</h2>
        <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">
          <Plus size={18} /> Add Aluminium
        </button>
      </div>

      {items.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-slate-700 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-700">
                {['Sr No', 'Code', 'Make', 'Model', 'Conv. Kg/Mtr', 'Parameter', 'Product Group', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2 border font-semibold text-center text-lg" style={FONT}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(g => (
                <tr key={g._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-2 border text-center" style={FONT}>{g.srNo}</td>
                  <td className="px-4 py-2 border text-center" style={FONT}>{g.code}</td>
                  <td className="px-4 py-2 border text-center" style={FONT}>{g.make}</td>
                  <td className="px-4 py-2 border text-center" style={FONT}>{g.model}</td>
                  <td className="px-4 py-2 border text-center" style={FONT}>{Number(g.conversionUnitKgPerMtr).toFixed(3)}</td>
                  <td className="px-4 py-2 border text-center" style={FONT}>{g.parameter}</td>
                  <td className="px-4 py-2 border text-center" style={FONT}>{g.productGroup}</td>
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button onClick={() => openView(g)} className="p-1 bg-blue-100 text-blue-700 rounded" title="View"><Eye size={18} /></button>
                    <button onClick={() => openEdit(g)} className="p-1 bg-green-100 text-green-700 rounded" title="Edit"><Pencil size={18} /></button>
                    <button onClick={() => del(g._id)} className="p-1 bg-red-100 text-red-700 rounded" title="Delete"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p style={FONT}>No aluminium items yet.</p>}

      {modal.type && <AluminiumModal mode={modal.type} form={form} setForm={setForm} onSave={store} onClose={close} error={error} />}
    </div>
  );
}
