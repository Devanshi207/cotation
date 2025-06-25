import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Pencil, Eye } from 'lucide-react';
import api from '../api';

const blank = { title: '', brand: '', description: '', rate: '' };

/* field */
const Field = ({ name, label, value, onChange, readOnly=false, type='text' }) => (
  <div className="flex flex-col gap-1">
    <label className="font-medium">{label}</label>
    {readOnly ? (
      <div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-700">{value||'-'}</div>
    ) : (
      <input required type={type} name={name} value={value} placeholder={label}
        onChange={onChange}
        className="border rounded-md px-3 py-2 dark:bg-slate-700 dark:border-slate-600"/>
    )}
  </div>
);

/* modal */
const LockModal = ({ mode, form, setForm, onSave, onClose }) => {
  const handle = e => setForm(p=>({...p,[e.target.name]:e.target.value}));
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold capitalize">{mode} Lock</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        {mode==='view'?(
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title"       value={form.title} readOnly/>
            <Field label="Brand"       value={form.brand} readOnly/>
            <Field label="Description" value={form.description} readOnly/>
            <Field label="Rate"         value={form.rate} readOnly/>
          </div>
        ):(
          <form onSubmit={onSave} className="grid grid-cols-2 gap-4">
            <Field name="title" label="Title" value={form.title} onChange={handle}/>
            <Field name="brand" label="Brand" value={form.brand} onChange={handle}/>
            <Field name="description" label="Description" value={form.description} onChange={handle}/>
            <Field name="rate" label="Rate" type="number" value={form.rate} onChange={handle}/>
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button type="submit" className="px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90">{mode==='add'?'Store':'Update'}</button>
              <button type="button" onClick={onClose} className="px-4 py-2 bg-[#EE4B2B] text-white rounded-md">Back</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* main */
export default function Lock(){
  const [items,setItems]=useState([]);
  const [modal,setModal]=useState({type:null,item:null});
  const [form,setForm]=useState(blank);

  /* initial fetch */
  useEffect(()=>{ api.get('/locks').then(r=>setItems(r.data)).catch(console.error); },[]);

  /* helpers */
  const openAdd =()=>{setForm(blank);setModal({type:'add'});};
  const openEdit=i=>{setForm(i);setModal({type:'edit',item:i});};
  const openView=i=>{setForm(i);setModal({type:'view',item:i});};
  const close  =()=>setModal({type:null});

  const store=async e=>{
    e.preventDefault();
    try{
      if(modal.type==='add'){
        const {data}=await api.post('/locks',form);
        setItems([data,...items]);
      }else{
        const {data}=await api.put(`/locks/${modal.item._id}`,form);
        setItems(items.map(x=>x._id===data._id?data:x));
      }
      close();
    }catch(err){alert('Save error');console.error(err);}
  };

  const del=async id=>{
    if(!window.confirm('Delete?'))return;
    try{await api.delete(`/locks/${id}`);setItems(items.filter(x=>x._id!==id));}
    catch(err){alert('Delete error');console.error(err);}
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-4xl font-bold">Lock</h2>
        <button onClick={openAdd} className="flex gap-1 px-4 py-2 bg-[#74bbbd] text-white rounded-md hover:opacity-90"><Plus size={18}/>Add Lock</button>
      </div>
      {items.length?(
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead><tr className="bg-gray-100">{['Title','Brand','Description','Rate','Actions'].map(h=><th key={h} className="px-4 py-2 border">{h}</th>)}</tr></thead>
            <tbody>{items.map(i=>(
              <tr key={i._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{i.title}</td>
                <td className="px-4 py-2 border">{i.brand}</td>
                <td className="px-4 py-2 border">{i.description}</td>
                <td className="px-4 py-2 border">{i.rate}</td>
                <td className="px-4 py-2 border space-x-2 text-center">
                  <button onClick={()=>openView(i)} className="p-1 bg-blue-100 text-blue-700"><Eye size={18}/></button>
                  <button onClick={()=>openEdit(i)} className="p-1 bg-green-100 text-green-700"><Pencil size={18}/></button>
                  <button onClick={()=>del(i._id)} className="p-1 bg-red-100 text-red-700"><Trash2 size={18}/></button>
                </td>
              </tr>))}</tbody>
          </table>
        </div>
      ):<p>No locks yet.</p>}
      {modal.type&&<LockModal mode={modal.type} form={form} setForm={setForm} onSave={store} onClose={close}/>}
    </div>
  );
}
