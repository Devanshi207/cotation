import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { ArrowLeft } from "lucide-react";

export default function MTOPage() {
  const { id } = useParams(); 
  const nav = useNavigate();
  const [mto, setMto] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.post(`/mto/generate/${id}`)
      .then((res) => {
        console.log("✅ Generated MTO Data:", res.data);
        setMto(res.data);
      })
      .catch(() => setError("No MTO found. Click below to generate one."));
  }, [id]);

  const handleGenerate = async () => {
    try {
      const { data } = await api.post(`/mto/generate/${id}`);
      setMto(data);
      setError(""); 
    } catch (err) {
      console.error(err);
      setError("Failed to generate MTO");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Material Take-Off (MTO)</h1>
        <button
          onClick={() => nav(-1)}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 flex items-center gap-1 text-sm"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Generate MTO
          </button>
        </div>
      )}

      {mto && (
        <div className="space-y-8">
          {mto.map((section) => (
            <div key={section.category}>
              <h2 className="text-lg font-bold underline mb-2">{section.category}</h2>
              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-3 py-2 text-center w-12">SrNo.</th>
                      <th className="border px-3 py-2 text-left">Material</th>
                      <th className="border px-3 py-2 text-center w-40">Quantity</th>
                      <th className="border px-3 py-2 text-center w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item) => (
                      <tr key={item.srNo} className="even:bg-gray-50">
                        <td className="border px-3 py-2 text-center">{item.srNo}</td>
                        <td className="border px-3 py-2">{item.material}</td>
                        <td className="border px-3 py-2 text-center">{item.quantity}</td>
                        <td className="border px-3 py-2 text-center">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
