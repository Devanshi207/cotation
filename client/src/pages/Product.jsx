import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Pencil, Eye } from 'lucide-react';
import api from '../api';  // <-- use shared Axios instance

const blank = { series: '', typology: '', type: '' };
const label = {
  series: 'Product Series',
  typology: 'Product Typology',
  type: 'Product Type',
};

const Field = ({ name, value, onChange, readOnly=false }) => (
  <div className="flex flex-col gap-1">
    <label className="font-medium">{label[name]}</label>
    {readOnly ? (
      <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-700">{value || '-'}</div>
    ) : (
      <input
        name={name}
        value={value}
        placeholder={label[name]}
        onChange={onChange}
        required
        className="border rounded-md px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
      />
    )}
  </div>
);

const ProdModal = ({ mode, form, setForm, onSave, onClose }) => {
  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold capitalize">{mode} Product</h3>
          <button onClick={onClose} className="p-1"><X size={20}/></button>
        </div>
        {mode === "view" ? (
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(blank).map(k => (
              <Field key={k} name={k} value={form[k]} readOnly />
            ))}
          </div>
        ) : (
          <form onSubmit={onSave} className="grid grid-cols-2 gap-4">
            {Object.keys(blank).map(k => (
              <Field key={k} name={k} value={form[k]} onChange={handle} />
            ))}
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button type="submit" className="px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">
                {mode === "add" ? "Store" : "Update"}
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

export default function Product() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ type: null, item: null });
  const [form, setForm] = useState(blank);

  useEffect(() => {
    api.get('/products')
       .then(res => setItems(res.data))
       .catch(err => console.error(err));
  }, []);

  const openAdd = () => { setForm(blank); setModal({ type: 'add' }); };
  const openEdit = p => { setForm(p); setModal({ type: 'edit', item: p }); };
  const openView = p => { setForm(p); setModal({ type: 'view', item: p }); };
  const closeMod = () => setModal({ type: null });

  const store = async (e) => {
    e.preventDefault();
    try {
      if (modal.type === 'add') {
        const { data } = await api.post('/products', form);
        setItems([data, ...items]);
      } else {
        const { data } = await api.put(`/products/${modal.item._id}`, form);
        setItems(items.map(p => p._id === data._id ? data : p));
      }
      closeMod();
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete?')) return;
    try {
      await api.delete(`/products/${id}`);
      setItems(items.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting product');
    }
  };

  return (
    <div className="p-6 text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold" style={{ fontFamily: 'Times New Roman, serif' }}>
          Products
        </h2>
        <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">
          <Plus size={18}/> Add Product
        </button>
      </div>

      {items.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-slate-700 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-700">
                {["Series", "Typology", "Type", "Actions"].map(h => (
                  <th key={h} className="px-4 py-2 border font-semibold text-center text-lg">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-2 border text-base text-center">{p.series}</td>
                  <td className="px-4 py-2 border text-base text-center">{p.typology}</td>
                  <td className="px-4 py-2 border text-base text-center">{p.type}</td>
                  <td className="px-4 py-2 border space-x-2 text-center">
                    <button onClick={() => openView(p)} className="p-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200" title="View"><Eye size={18}/></button>
                    <button onClick={() => openEdit(p)} className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200" title="Edit"><Pencil size={18}/></button>
                    <button onClick={() => del(p._id)} className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200" title="Delete"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No products yet.</p>
      )}

      {modal.type && (
        <ProdModal
          mode={modal.type}
          form={form}
          setForm={setForm}
          onSave={store}
          onClose={closeMod}
        />
      )}
    </div>
  );
}
