import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Pencil, Eye } from 'lucide-react';
import api from '../api';

const blank={name:'',description:''};

const Field=({name,label,value,onChange,readOnly=false})=>(
  <div className="flex flex-col gap-1">
    <label className="font-medium">{label}</label>
    {readOnly?(<div className="border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-700">{value||'-'}</div>):(
      <input required name={name} value={value} placeholder={label} onChange={onChange}
        className="border rounded-md px-3 py-2 dark:bg-slate-700 dark:border-slate-600"/>
    )}
  </div>
);

const PgModal=({mode,form,setForm,onSave,onClose})=>{
  const handle=e=>setForm(p=>({...p,[e.target.name]:e.target.value}));
  return(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl max-w-lg w-full">
        <div className="flex justify-between mb-4"><h3 className="text-xl font-semibold">{mode} Product Group</h3><button onClick={onClose}><X size={20}/></button></div>
        {mode==='view'?(
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" value={form.name} readOnly/>
            <Field label="Description" value={form.description} readOnly/>
          </div>
        ):(
          <form onSubmit={onSave} className="grid grid-cols-2 gap-4">
            <Field name="name" label="Name" value={form.name} onChange={handle}/>
            <Field name="description" label="Description" value={form.description} onChange={handle}/>
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button className="px-4 py-2 bg-[#74bbbd] text-white rounded-md">{mode==='add'?'Store':'Update'}</button>
              <button type="button" onClick={onClose} className="px-4 py-2 bg-[#EE4B2B] text-white rounded-md">Back</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default function ProductGroup(){
  const[items,setItems]=useState([]);
  const[modal,setModal]=useState({type:null,item:null});
  const[form,setForm]=useState(blank);

  useEffect(()=>{api.get('/product-groups').then(r=>setItems(r.data)).catch(console.error);},[]);

  const openAdd =()=>{setForm(blank);setModal({type:'add'});};
  const openEdit=i=>{setForm(i);setModal({type:'edit',item:i});};
  const openView=i=>{setForm(i);setModal({type:'view',item:i});};
  const close=()=>setModal({type:null});

  const store=async e=>{
    e.preventDefault();
    try{
      if(modal.type==='add'){
        const {data}=await api.post('/product-groups',form);
        setItems([data,...items]);
      }else{
        const {data}=await api.put(`/product-groups/${modal.item._id}`,form);
        setItems(items.map(x=>x._id===data._id?data:x));
      }
      close();
    }catch(err){alert('Save error');console.error(err);}
  };

  const del=async id=>{
    if(!window.confirm('Delete?'))return;
    try{await api.delete(`/product-groups/${id}`);setItems(items.filter(x=>x._id!==id));}
    catch(err){alert('Delete error');console.error(err);}
  };

  return(
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-4xl font-bold">Product Group</h2>
        <button onClick={openAdd} className="flex gap-1 px-4 py-2 bg-[#74bbbd] text-white rounded-md"><Plus size={18}/>Add Group</button>
      </div>
      {items.length?(
        <table className="min-w-full border text-sm">
          <thead><tr className="bg-gray-100">{['Name','Description','Actions'].map(h=><th key={h} className="px-4 py-2 border">{h}</th>)}</tr></thead>
          <tbody>{items.map(i=>(
            <tr key={i._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{i.name}</td>
              <td className="px-4 py-2 border">{i.description}</td>
              <td className="px-4 py-2 border space-x-2 text-center">
                <button onClick={()=>openView(i)} className="p-1 bg-blue-100 text-blue-700"><Eye size={18}/></button>
                <button onClick={()=>openEdit(i)} className="p-1 bg-green-100 text-green-700"><Pencil size={18}/></button>
                <button onClick={()=>del(i._id)} className="p-1 bg-red-100 text-red-700"><Trash2 size={18}/></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      ):<p>No product groups.</p>}
      {modal.type&&<PgModal mode={modal.type} form={form} setForm={setForm} onSave={store} onClose={close}/>}
    </div>
  );
}
