// src/pages/QuotationPrint.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, Download, ArrowLeft } from "lucide-react";
import api from "../api";
import html2pdf from "html2pdf.js";

const FONT = { fontFamily: "Times New Roman, serif" };

export default function QuotationPrint() {
  const { id, qid } = useParams();   // support either :id or :qid
  const nav = useNavigate();
  const actualId = id || qid;        // use whichever is present
  const [q, setQ] = useState(null);
  const [err, setErr] = useState(null);
  const ref = useRef();

  useEffect(() => {
    if (!actualId) {
      setErr("Missing quotation ID.");
      return;
    }

    api.get(`/quotations/${actualId}`)
      .then(res => {
        // supports both { quotation: {...} } or direct object
        const data = res.data?.quotation || res.data;
        setQ(data);
      })
      .catch(error => {
        console.error("Print fetch error:", error);
        setErr("Could not load quotation.");
      });
  }, [actualId]);

  if (err) return <p className="text-red-600 p-6">{err}</p>;
  if (!q) return <p className="p-6">Loading…</p>;

  const downloadPDF = () => {
    html2pdf().from(ref.current)
      .set({ margin: 0, filename: `quotation_${actualId}.pdf` })
      .save();
  };

  return (
    <div className="p-6">
      {/* Action bar */}
      <div className="mb-4 flex gap-3">
        <button onClick={() => nav(-1)} className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded">
          <Printer size={16} /> Print
        </button>
        <button onClick={downloadPDF} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded">
          <Download size={16} /> PDF
        </button>
      </div>

      {/* Printable area */}
      <div ref={ref} className="bg-white p-6 border" style={FONT}>
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0066b3] tracking-widest">A C C O R R</h1>
            <p className="text-xs leading-4">
              Plot no-35 to 37 and 68 to 70, Samruddhi Corporation Opp.<br />
              Dastan Residence, Bagumara Gaam, Kadodara Bardoli Road,<br />
              Kadodara, Surat-394310, Gujarat, India<br />
              M: +91-9825307189, +91-9879241002<br />
              E: mihir@accorr.in, suresh@accorr.in
            </p>
          </div>
          <img src="/logo192.png" alt="logo" className="h-20" />
        </div>

        <hr className="my-2" />

        {/* Client Info */}
        <table className="w-full text-xs mb-1">
          <tbody>
            <tr>
              <td><b>Client Quotation</b></td>
              <td className="text-right">ROO</td>
            </tr>
            <tr>
              <td>
                <b>
                  To,<br />
                  {q.header?.clientName || "Client"}<br />
                  {q.header?.clientCity || ""}
                </b>
              </td>
              <td className="text-right">
                Quote No.: <b>{q.number || actualId?.slice(0, 6)}</b><br />
                Date: <b>{new Date(q.date || Date.now()).toLocaleDateString()}</b>
              </td>
            </tr>
          </tbody>
        </table>

        <p className="text-xs mb-2">
          Dear Sir / Madam,<br />
          &nbsp;&nbsp;&nbsp;&nbsp;We thank you for giving us an opportunity…
        </p>

        {/* Quotation Items Table */}
        <table className="w-full text-[10px] border">
          <thead className="bg-gray-200">
            <tr>
              {["Sr", "W.code", "Location", "Width mm", "Height mm", "Series",
                "Description", "Glass", "Pos", "Sq.ft.", "Rate/Pos", "Amount"]
                .map(h => <th key={h} className="border">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {q.rows.map((r, i) => (
              <tr key={i}>
                <td className="border text-center">{i + 1}</td>
                <td className="border text-center">W{i + 1}</td>
                <td className="border text-center">GF 1</td>
                <td className="border text-center">{r.widthMM}</td>
                <td className="border text-center">{r.heightMM}</td>
                <td className="border text-center">{r.seriesName || ""}</td>
                <td className="border text-center">—</td>
                <td className="border text-center">{r.glassName || ""}</td>
                <td className="border text-center">{r.qty}</td>
                <td className="border text-center">{r.sqft}</td>
                <td className="border text-center">{r.rateSqFt}</td>
                <td className="border text-center">{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <table className="w-full text-[11px] mt-1">
          <tbody>
            <tr><td className="text-right pr-4">TOTAL:</td><td>{q.totalAmt?.toFixed(2)}</td></tr>

            {q.header?.location === "gujarat" ? (
              <>
                <tr><td className="text-right pr-4">CGST {q.header.cgst}% :</td><td>{(q.totalAmt * q.header.cgst / 100).toFixed(2)}</td></tr>
                <tr><td className="text-right pr-4">SGST {q.header.sgst}% :</td><td>{(q.totalAmt * q.header.sgst / 100).toFixed(2)}</td></tr>
              </>
            ) : (
              <tr><td className="text-right pr-4">IGST {q.header.igst}% :</td><td>{(q.totalAmt * q.header.igst / 100).toFixed(2)}</td></tr>
            )}

            <tr className="border-t-2"><td className="text-right pr-4"><b>GRAND TOTAL :</b></td><td><b>{q.grand}</b></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
