// src/pages/ProductType.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Pencil, Eye } from 'lucide-react';
import api from '../api';                     // shared Axios instance

/* blank record */
const blank = { name: '', description: '' };

/* ─ reusable input/display field ─ */
const Field = ({ name, label, value, onChange, readOnly = false }) => (
  <div className="flex flex-col gap-1">
    <label className="font-medium">{label}</label>
    {readOnly ? (
      <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-700">
        {value || '-'}
      </div>
    ) : (
      <input
        required
        name={name}
        value={value}
        placeholder={label}
        onChange={onChange}
        className="border rounded-md px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
      />
    )}
  </div>
);

/* ─ modal ─ */
const PtModal = ({ mode, form, setForm, onSave, onClose }) => {
  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold capitalize">{mode} Product Type</h3>
          <button onClick={onClose} className="p-1">
            <X size={20} />
          </button>
        </div>

        {mode === 'view' ? (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product Type Name" value={form.name} readOnly />
            <Field label="Description" value={form.description} readOnly />
          </div>
        ) : (
          <form onSubmit={onSave} className="grid grid-cols-2 gap-4">
            <Field
              name="name"
              label="Product Type Name"
              value={form.name}
              onChange={handle}
            />
            <Field
              name="description"
              label="Description"
              value={form.description}
              onChange={handle}
            />
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90"
              >
                {mode === 'add' ? 'Add' : 'Update'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#EE4B2B] text-white rounded-md hover:opacity-90"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ─ main page ─ */
export default function ProductType() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ type: null, item: null });
  const [form, setForm] = useState(blank);

  /* initial fetch */
  useEffect(() => {
    api
      .get('/product-types')
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err));
  }, []);

  /* modal helpers */
  const openAdd = () => {
    setForm(blank);
    setModal({ type: 'add' });
  };
  const openEdit = (i) => {
    setForm(i);
    setModal({ type: 'edit', item: i });
  };
  const openView = (i) => {
    setForm(i);
    setModal({ type: 'view', item: i });
  };
  const close = () => setModal({ type: null });

  /* create / update */
  const store = async (e) => {
    e.preventDefault();
    try {
      if (modal.type === 'add') {
        const { data } = await api.post('/product-types', form);
        setItems([data, ...items]);
      } else {
        const { data } = await api.put(`/product-types/${modal.item._id}`, form);
        setItems(items.map((x) => (x._id === data._id ? data : x)));
      }
      close();
    } catch (err) {
      console.error(err);
      alert('Error saving Product Type');
    }
  };

  /* delete */
  const del = async (id) => {
    if (!window.confirm('Delete?')) return;
    try {
      await api.delete(`/product-types/${id}`);
      setItems(items.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting Product Type');
    }
  };

  /* UI */
  return (
    <div className="p-6 text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-4xl font-bold"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Product Type
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1 px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90"
        >
          <Plus size={18} /> Add Type
        </button>
      </div>

      {items.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-slate-700 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-700">
                {['Product Type Name', 'Description', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-2 border font-semibold text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-2 border text-center">{i.name}</td>
                  <td className="px-4 py-2 border text-center">{i.description}</td>
                  <td className="px-4 py-2 border space-x-2 text-center">
                    <button
                      onClick={() => openView(i)}
                      className="p-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => openEdit(i)}
                      className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => del(i._id)}
                      className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No product types yet.</p>
      )}

      {modal.type && (
        <PtModal
          mode={modal.type}
          form={form}
          setForm={setForm}
          onSave={store}
          onClose={close}
        />
      )}
    </div>
  );
}
