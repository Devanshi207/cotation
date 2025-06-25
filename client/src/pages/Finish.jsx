import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Pencil, Eye } from 'lucide-react';
import api from '../api';

const FONT = { fontFamily: 'Times New Roman, serif' };

const blank = {
  title: '',
  rate: ''
};

const required = ['title', 'rate'];

const Field = ({ name, value, onChange, readOnly = false, autoFocus = false }) => {
  const labels = {
    title: 'Title',
    rate: 'Rate (₹)'
  };
  const label = labels[name];

  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium" style={FONT}>{label}</label>
      {readOnly ? (
        <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-700" style={FONT}>
          {value || '-'}
        </div>
      ) : (
        <input
          autoFocus={autoFocus}
          name={name}
          value={value}
          placeholder={label}
          onChange={name === 'rate'
            ? (e) => onChange({ target: { name, value: e.target.value.replace(/[^0-9.]/g, '') } })
            : onChange}
          required={required.includes(name)}
          type={name === 'rate' ? 'number' : 'text'}
          step={name === 'rate' ? 'any' : undefined}
          className="border rounded-md px-3 py-2 dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#74bbbd]"
          style={{ ...FONT, caretColor: 'black' }}
        />
      )}
    </div>
  );
};

const FinishModal = ({ mode, form, setForm, onSave, onClose, error }) => {
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold capitalize">{mode} Finish</h3>
          <button onClick={onClose} className="p-1"><X size={20} /></button>
        </div>
        {error && <div className="mb-4 px-4 py-2 rounded bg-red-100 text-red-800">{error}</div>}
        {mode === 'view' ? (
          <div className="grid grid-cols-1 gap-4">
            {Object.keys(blank).map(k => <Field key={k} name={k} value={form[k]} readOnly />)}
          </div>
        ) : (
          <form onSubmit={onSave} className="grid grid-cols-1 gap-4">
            {Object.keys(blank).map((k, i) => <Field key={k} name={k} value={form[k]} onChange={handle} autoFocus={i === 0} />)}
            <div className="flex justify-end gap-3 pt-2">
              <button type="submit" className="px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">{mode === 'add' ? 'Store' : 'Update'}</button>
              <button type="button" onClick={onClose} className="px-4 py-2 bg-[#EE4B2B] text-white rounded-md hover:opacity-90">Back</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default function Finish() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ type: null, item: null });
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/finish').then(r => setItems(r.data)).catch(console.error);
  }, []);

  const openAdd = () => {
    setForm(blank);
    setError('');
    setModal({ type: 'add' });
  };

  const openEdit = item => { setForm(item); setError(''); setModal({ type: 'edit', item }); };
  const openView = item => { setForm(item); setError(''); setModal({ type: 'view', item }); };
  const close = () => setModal({ type: null });

  const store = async e => {
  e.preventDefault();

  for (const k of required) if (!form[k]) return setError(`${k} is required`);

  try {
    const payload = { ...form, rate: Number(form.rate) };
    console.log('⏩ Submitting Payload:', payload); // Log payload

    let data;
    if (modal.type === 'add') {
      ({ data } = await api.post('/finish', payload));
    } else {
      ({ data } = await api.put(`/finish/${modal.item._id}`, payload));
    }

    console.log('✅ Server Response:', data); // Log success

    setItems(modal.type === 'add' ? [data, ...items] : items.map(i => i._id === data._id ? data : i));
    close();
  } catch (err) {
    console.error('❌ Save error:', err);
    console.error('❌ Full response:', err?.response);
    setError(err?.response?.data?.msg || 'Error saving');
  }
};


  const del = async id => {
    if (!window.confirm('Delete?')) return;
    await api.delete(`/finish/${id}`);
    setItems(items.filter(i => i._id !== id));
  };

  return (
    <div className="p-6 text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold" style={FONT}>Finish</h2>
        <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">
          <Plus size={18} /> Add Finish
        </button>
      </div>

      {items.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-slate-700 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-700">
                {['Title', 'Rate (₹)', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2 border font-semibold text-center text-lg" style={FONT}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(g => (
                <tr key={g._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-2 border text-center" style={FONT}>{g.title}</td>
                  <td className="px-4 py-2 border text-center" style={FONT}>{Number(g.rate).toFixed(2)}</td>
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
      ) : <p style={FONT}>No finish items yet.</p>}

      {modal.type && <FinishModal mode={modal.type} form={form} setForm={setForm} onSave={store} onClose={close} error={error} />}
    </div>
  );
}
