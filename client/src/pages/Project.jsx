// src/pages/Project.jsx
import React, { useState, useEffect } from "react";
import { Plus, Trash2, X, Pencil, Eye } from "lucide-react";

import { useNavigate } from "react-router-dom";   // ← NEW
import api from "../api";

/* ---------- helpers ------------------------------------------------ */
const blank = {
  title: "",
  location: "",
  address: "",
  contactName: "",
  contactMobile: "",
  contactEmail: "",
};

const Field = ({
  name,
  label,
  value,
  onChange,
  readOnly = false,
  type = "text",
}) => (
  <div className="flex flex-col gap-1">
    <label className="font-medium">{label}</label>
    {readOnly ? (
      <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-700">
        {value || "-"}
      </div>
    ) : (
      <input
        required
        name={name}
        value={value}
        placeholder={label}
        type={type}
        onChange={onChange}
        className="border rounded-md px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
      />
    )}
  </div>
);

const ProjModal = ({ mode, form, setForm, onSave, onClose }) => {
  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const Bar = () => (
    <div
      className="col-span-2 px-2 py-1 text-lg font-semibold text-white rounded-md"
      style={{ background: "#74bbbd" }}
    >
      Contact Person
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl max-w-5xl w-full">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold">{mode} Project</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {mode === "view" ? (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title" value={form.title} readOnly />
            <Field label="Location" value={form.location} readOnly />
            <Field label="Unique ID" value={form.uniqueId} readOnly />
            <Field label="Address" value={form.address} readOnly />
            <Bar />
            <Field label="Contact Name" value={form.contactName} readOnly />
            <Field label="Contact Mobile" value={form.contactMobile} readOnly />
            <Field label="Contact Email" value={form.contactEmail} readOnly />
          </div>
        ) : (
          <form onSubmit={onSave} className="grid grid-cols-2 gap-4">
            <Field
              name="title"
              label="Title"
              value={form.title}
              onChange={handle}
            />
            <Field
              name="location"
              label="Location"
              value={form.location}
              onChange={handle}
            />
            {form.uniqueId && (
              <Field label="Unique ID" value={form.uniqueId} readOnly />
            )}
            <Field
              name="address"
              label="Address"
              value={form.address}
              onChange={handle}
            />
            <Bar />
            <Field
              name="contactName"
              label="Contact Name"
              value={form.contactName}
              onChange={handle}
            />
            <Field
              name="contactMobile"
              label="Contact Mobile"
              value={form.contactMobile}
              onChange={handle}
            />
            <Field
              name="contactEmail"
              label="Contact Email"
              value={form.contactEmail}
              onChange={handle}
              type="email"
            />
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button className="px-4 py-2 bg-[#74bbbd] text-white rounded-md">
                {mode === "add" ? "Store" : "Update"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#EE4B2B] text-white rounded-md"
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

export default function Project() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ type: null, item: null });
  const [form, setForm] = useState(blank);
  const navigate = useNavigate();                // ← NEW
  
  /* ---------- lifecycle ------------------------------------------- */
  useEffect(() => {
    api
      .get("/projects")
      .then((r) => setItems(r.data))
      .catch(console.error);
  }, []);

  /* ---------- modal handlers -------------------------------------- */
  const openAdd = () => {
    setForm(blank);
    setModal({ type: "add" });
  };
  const openEdit = (p) => {
    setForm(p);
    setModal({ type: "edit", item: p });
  };
  const openView = (p) => {
    setForm(p);
    setModal({ type: "view", item: p });
  };
  const close = () => setModal({ type: null });

  /* ---------- quotation handlers ---------------------------------- */
  const addQuotation = (proj) =>
    navigate(`/quotation/add?project=${proj._id}`);
  const viewQuotation = (proj) =>
    navigate(`/quotation?project=${proj._id}`);

  /* ---------- CRUD ------------------------------------------------ */
  const store = async (e) => {
    e.preventDefault();
    try {
      if (modal.type === "add") {
        const { data } = await api.post("/projects", form); // uniqueId auto-created
        setItems([data, ...items]);
      } else {
        const { data } = await api.put(`/projects/${modal.item._id}`, form);
        setItems(items.map((x) => (x._id === data._id ? data : x)));
      }
      close();
    } catch (err) {
      alert("Save error");
      console.error(err);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await api.delete(`/projects/${id}`);
      setItems(items.filter((x) => x._id !== id));
    } catch (err) {
      alert("Delete error");
      console.error(err);
    }
  };

  /* ---------- render ---------------------------------------------- */
  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-4xl font-bold">Projects</h2>
        <button
          onClick={openAdd}
          className="flex gap-1 px-4 py-2 bg-[#74bbbd] text-white rounded-md"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {items.length ? (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              {[
                "Title",
                "Location",
                "Unique ID",
                "Address",
                "Name",
                "Mobile",
                "Email",
                "Quotation",   // ← NEW
                "Actions",
              ].map((h) => (
                <th key={h} className="px-4 py-2 border">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{p.title}</td>
                <td className="px-4 py-2 border">{p.location}</td>
                <td className="px-4 py-2 border">{p.uniqueId}</td>
                <td className="px-4 py-2 border">{p.address}</td>
                <td className="px-4 py-2 border">{p.contactName}</td>
                <td className="px-4 py-2 border">{p.contactMobile}</td>
                <td className="px-4 py-2 border">{p.contactEmail}</td>

                {/* ---------- Quotation buttons ---------- */}
                <td className="px-4 py-2 border space-x-2 text-center">
                  <button
                    onClick={() =>
                      p.quotationId
                        ? navigate(`/quotation/${p.quotationId}`) // edit
                        : navigate(`/quotation/add?project=${p._id}&name=${encodeURIComponent(p.contactName)}&city=${encodeURIComponent(p.location)}`)
                    }
                    title={p.quotationId ? "Edit Quotation" : "Add Quotation"}
                    className={`p-1 rounded ${
                      p.quotationId
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {p.quotationId ? <Pencil size={18} /> : <Plus size={18} />}
                  </button>

                  <button
                    onClick={() => navigate(`/quotation?project=${p._id}`)}
                    title="View Quotation"
                    className="p-1 bg-indigo-100 text-indigo-700 rounded"
                  >
                    <Eye size={18} />
                  </button>
                </td>




                {/* ---------- Edit / Delete / View buttons ---------- */}
                <td className="px-4 py-2 border space-x-2 text-center">
                  <button
                    onClick={() => openView(p)}
                    className="p-1 bg-blue-100 text-blue-700"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    className="p-1 bg-green-100 text-green-700"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => del(p._id)}
                    className="p-1 bg-red-100 text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
      ) : (
        <p>No projects yet.</p>
      )}

      {modal.type && (
        <ProjModal
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