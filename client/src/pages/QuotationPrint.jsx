import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, Download, ArrowLeft } from "lucide-react";
import api from "../api";
import html2pdf from "html2pdf.js";
import logo from "../assets/logo.png"; // Import the logo from src/assets/logo.png

const FONT = { fontFamily: "Times New Roman, serif" };

export default function QuotationPrint() {
  const { id } = useParams();
  const nav = useNavigate();
  const [q, setQ] = useState(null);
  const [err, setErr] = useState(null);
  const ref = useRef();

  useEffect(() => {
    if (!id) {
      setErr("Missing quotation ID.");
      return;
    }

    console.log("Fetching quotation with ID:", id);
    
    api.get(`/quotationEditor/${id}`)
      .then(res => {
        console.log("Quotation data received:", res.data);
        setQ(res.data);
      })
      .catch(error => {
        console.error("Print fetch error:", error);
        
        let msg = "Could not load quotation.";
        if (error.response) {
          msg = `Server error: ${error.response.status} - ${
            error.response.data?.message || error.response.data?.msg || 'No additional info'
          }`;
          console.error("Error response data:", error.response.data);
        } else if (error.request) {
          msg = "No response from server. Check your network connection.";
          console.error("Request:", error.request);
        } else {
          msg = `Request error: ${error.message}`;
        }
        
        setErr(msg);
      });
  }, [id]);

  const downloadPDF = () => {
    if (ref.current) {
      html2pdf().from(ref.current)
        .set({ 
          margin: [15, 10, 15, 10],
          filename: `quotation_${id}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save();
    }
  };

  if (err) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-medium">{err}</p>
        <button 
          onClick={() => nav(-1)} 
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  if (!q) {
    return <p className="p-6 text-gray-600">Loading quotation data...</p>;
  }

  const shortId = id.slice(-6);
  const quotationDate = q.createdAt ? new Date(q.createdAt) : new Date();
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Action bar */}
      <div className="mb-6 flex gap-3">
        <button 
          onClick={() => nav(-1)} 
          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Printer size={16} /> Print
        </button>
        <button 
          onClick={downloadPDF} 
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          <Download size={16} /> Download PDF
        </button>
      </div>

      {/* Printable area */}
      <div 
        ref={ref} 
        className="bg-white p-8 border border-gray-300 rounded-lg shadow-lg" 
        style={{ ...FONT, maxWidth: '210mm', margin: '0 auto' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0066b3] tracking-wider uppercase">A C C O R R</h1>
            <p className="text-sm text-gray-600 leading-5 mt-2">
              Plot No. 35-37 & 68-70, Samruddhi Corporation,<br />
              Opp. Dastan Residence, Bagumara Gaam,<br />
              Kadodara Bardoli Road, Kadodara,<br />
              Surat-394310, Gujarat, India<br />
              <span className="font-medium">M:</span> +91-9825307189, +91-9879241002<br />
              <span className="font-medium">E:</span> mihir@accorr.in, suresh@accorr.in
            </p>
          </div>
          <img 
            src={logo} 
            alt="Accorr Logo" 
            className="h-24 object-contain" 
            style={{ maxWidth: '100px' }}
          />
        </div>

        <hr className="my-4 border-gray-300" />

        {/* Client Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Quotation</h2>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">To:</span> {q.header?.clientName || "Client"} 
             <p> {q.header?.clientCity ? ` ${q.header.clientCity}` : ""}</p>
            </p>
          </div>
          <div className="text-right text-sm text-gray-700">
            <p><span className="font-medium">Quote No.:</span> <span className="font-bold">{shortId}</span></p>
            <p><span className="font-medium">Date:</span> <span className="font-bold">{quotationDate.toLocaleDateString()}</span></p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Dear Sir/Madam,<br />
          We thank you for giving us an opportunity to quote for the following items:
        </p>

{/* Updated Quotation Items Table */}
<table className="w-full text-xs border-collapse border border-gray-300 mb-6">
  <thead className="bg-gray-100">
    <tr>
      {["Sr No.", "Width (mm)", "Height (mm)", "Series", "Typology", "Glass", "QTY", "Sq.Mtr", "Rate / Sq.Mtr", "Amount"]
        .map((h, i) => (
          <th key={i} className="border border-gray-300 p-2 font-semibold text-gray-800">{h}</th>
        ))}
    </tr>
  </thead>
  <tbody>
    {q.rows.map((r, i) => (
      <tr key={i} className="hover:bg-gray-50">
        <td className="border border-gray-300 text-center p-2">{i + 1}</td>
        <td className="border border-gray-300 text-center p-2">{r.widthMM || "0"}</td>
        <td className="border border-gray-300 text-center p-2">{r.heightMM || "0"}</td>
        <td className="border border-gray-300 text-center p-2">{r.series || "N/A"}</td>
        <td className="border border-gray-300 text-center p-2">{r.typology || "N/A"}</td>
        <td className="border border-gray-300 text-center p-2">{r.glass || "N/A"}</td>
        <td className="border border-gray-300 text-center p-2">{r.qty || "1"}</td>
        <td className="border border-gray-300 text-center p-2">{r.sqmtr || r.sqmt || r.sqm || r.sqMtr || "0.00"}</td>
        <td className="border border-gray-300 text-center p-2">{r.rateSqMtr || r.rateSqM || "0.00"}</td>
        <td className="border border-gray-300 text-center p-2">{r.amount || "0.00"}</td>
      </tr>
    ))}
  </tbody>
</table>

{/* Totals - Left Aligned */}
<div className="w-full mb-8">
  <table className="text-sm text-right w-full ">
    <tbody>
      <tr>
        <td className="font-semibold text-gray-800 py-1 pr-2 pl-80">Total Before Tax:</td>
        <td className="font-semibold text-gray-800">{q.totalAmt?.toFixed(2) || "0.00"}</td>
      </tr>
      {q.header?.location === "gujarat" ? (
        <>
          <tr>
            <td className="text-gray-700 py-1 pr-2">CGST ({q.header.cgst}%) :</td>
            <td className="text-gray-800">{((q.totalAmt || 0) * (q.header.cgst || 0) / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td className="text-gray-700 py-1 pr-2">SGST ({q.header.sgst}%) :</td>
            <td className="text-gray-800">{((q.totalAmt || 0) * (q.header.sgst || 0) / 100).toFixed(2)}</td>
          </tr>
        </>
      ) : (
        <tr>
          <td className="text-gray-700 py-1 pr-2">IGST {q.header.igst}%:</td>
          <td className="text-gray-800">{((q.totalAmt || 0) * (q.header.igst || 0) / 100).toFixed(2)}</td>
        </tr>
      )}
      <tr className="border-t-2 border-gray-400">
        <td className="font-bold text-gray-800 py-1 pr-2">GRAND TOTAL:</td>
        <td className="font-bold text-gray-800">{q.grand || "0.00"}</td>
      </tr>
    </tbody>
  </table>
</div>


        {/* Terms & Conditions */}
        <div className="text-sm text-gray-600 mb-8">
          <p className="font-bold">Terms & Conditions:</p>
          <ol className="list-decimal pl-5 mt-2">
            <li>Prices are inclusive of all taxes.</li>
            <li>Validity: 30 days from date of quotation.</li>
            <li>Delivery: 4-6 weeks after order confirmation.</li>
            <li>Payment: 50% advance with order, 50% before dispatch.</li>
          </ol>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end text-sm text-gray-600">
          <div>
            <p className="font-semibold">For ACCORR</p>
            <div className="mt-12">
              <p>Authorized Signatory</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">Customer Acceptance</p>
            <div className="mt-12">
              <p>Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}