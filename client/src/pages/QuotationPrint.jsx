import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Printer, Download, ArrowLeft } from "lucide-react";
import api from "../api";
import html2pdf from "html2pdf.js";
import logo from "../assets/logo.png";

const FONT = { fontFamily: "Times New Roman, serif" };

export default function QuotationPrint() {
  const { id } = useParams();
  const nav = useNavigate();
  const [q, setQ] = useState(null);
  const [err, setErr] = useState(null);
  const ref = useRef();
  const [searchParams] = useSearchParams();
  const rateUnit = searchParams.get("unit") || "sqm";
  const [glassList, setGlassList] = useState([]);

  useEffect(() => {
    if (!id) return setErr("Missing quotation ID.");
    api.get(`/quotationEditor/${id}`)
      .then(res => setQ(res.data))
      .catch(error => {
        let msg = "Could not load quotation.";
        if (error.response) {
          msg = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.data?.msg || 'No additional info'}`;
        } else if (error.request) {
          msg = "No response from server. Check your network connection.";
        } else {
          msg = `Request error: ${error.message}`;
        }
        setErr(msg);
      });
    api.get("/glass")
      .then(res => setGlassList(res.data))
      .catch(err => console.error("Failed to load glass list:", err));
  }, [id]);

  const downloadPDF = () => {
    if (ref.current && q?.header) {
      const versionSuffix = q.version > 1 ? `_v${q.version}` : '';
      const filename = `quotation_${q.header.uniqueID || 'no_id'}${versionSuffix}.pdf`;

      ref.current.classList.add('pdf-mode');
      const pages = ref.current.querySelectorAll('.print-page');
      pages.forEach(page => {
        page.style.width = '210mm';
        page.style.minHeight = '297mm';
        page.style.padding = '5mm';
        page.style.margin = '0';
        page.style.border = '2px solid black';
        page.style.boxSizing = 'border-box';
        page.style.background = 'white';
        page.style.pageBreakAfter = 'always';
        page.style.overflow = 'visible';
      });

      html2pdf()
        .from(ref.current)
        .set({
          margin: 0,
          filename,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0,
            windowWidth: 1200,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save()
        .finally(() => {
          ref.current.classList.remove('pdf-mode');
        });
    }
  };

  if (err) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-medium">{err}</p>
        <button onClick={() => nav(-1)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  if (!q) return <p className="p-6 text-gray-600">Loading quotation data...</p>;

  const shortId = id.slice(-6);
  const quotationDate = q.createdAt ? new Date(q.createdAt) : new Date();
const rowsPerPage = 10;
const rowPages = [];
for (let i = 0; i < q.rows.length; i += rowsPerPage) {
  rowPages.push(q.rows.slice(i, i + rowsPerPage));
}

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Action bar */}
      <div className="mb-6 flex gap-3 print-hide">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          <Printer size={16} /> Print
        </button>
        <button onClick={downloadPDF} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
          <Download size={16} /> Download PDF
        </button>
      </div>

      {/* Printable content */}
      <div id="print-section" ref={ref} style={{ ...FONT, width: '210mm' }}>

        <style>{`
@media screen {
  .print-page {
    display: block;
    border: 2px solid black;
    width: 210mm;
    min-height: 297mm;
    padding: 5mm;
    margin: 0 auto 10mm auto;
    background: white;
    box-sizing: border-box;
    page-break-after: always;
  }
}
@media print {
 html, body {
    margin: 0 !important;
    padding: 0 !important;
  }
  @page {
    size: A4;
    margin: 10mm 3mm 10mm 3mm;
  }

  body * {
    visibility: hidden !important;
  }

  #print-section,
  #print-section * {
    visibility: visible !important;
  }

  #print-section {
    position: absolute;
    top: 0;
    left: 0;
    width: 190mm;
    margin: 0 auto;
    padding: 0;
    z-index: 9999;
  }

  .print-page {
    background: white;
    box-sizing: border-box;
    border: 2px solid black;
    width: 100%;
    min-height: 277mm; /* 297mm - 2*10mm page margin */
    padding: 10mm;
    margin: 0;
    page-break-after: always;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .print-page:not(:first-child) {
    margin-top: 10mm; /* Add space at the top of subsequent pages */
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #ccc;
  }

  thead {
    display: table-header-group;
  }

  tr {
    page-break-inside: avoid;
    border-bottom: 1px solid #ccc;
  }

  th, td {
    border: 1px solid #ccc;
    padding: 6px;
    text-align: left;
    page-break-inside: avoid;
  }

  .totals-wrapper,
  .signature-block {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    gap: 2rem;
    page-break-inside: avoid;
  }

  .page-break {
    page-break-before: always;
  }
}
        `}</style>

        <div className="print-page">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#0066b3] tracking-wider uppercase">A C C O R R</h1>
              <p className="text-sm text-gray-600 leading-5 mt-2">
                Plot No. 35-37 & 68-70, Samruddhi Corporation,<br />
                Opp. Dastan Residence, Bagumara Gaam,<br />
                Kadodara Bardoli Road, Kadodara,<br />
                Surat-394310, Gujarat, India<br />
                <span className="font-medium">M:</span>
                <a href="tel:+919825307189" className="text-blue-600 hover:underline ml-1">+91-9825307189</a>,
                <a href="tel:+919879241002" className="text-blue-600 hover:underline ml-1">+91-9879241002</a><br />
                <span className="font-medium">E:</span>
                <a href="mailto:mihir@accorr.in" className="text-blue-600 hover:underline ml-1">mihir@accorr.in</a>,
                <a href="mailto:suresh@accorr.in" className="text-blue-600 hover:underline ml-1">suresh@accorr.in</a>
              </p>
            </div>
            <img src={logo} alt="Accorr Logo" className="h-24 object-contain" style={{ maxWidth: '100px' }} />
          </div>

          <hr className="my-4 border-gray-300" />

          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Quotation</h2>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium">To:</span> {q.header?.clientName || "Client"}<br />
                {q.header?.clientCity || ""}
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

          {/* Table + Totals */}
          {rowPages.map((rows, index) => (
           <div className="print-page" key={index}>
            <table className="w-full text-xs border-collapse border border-gray-300 mb-6">
              <thead className="bg-gray-100">
                <tr>
                  {["Sr No.", "Width (mm)", "Height (mm)", "Series", "Typology", "Glass", "QTY", rateUnit === "sqft" ? "Sq.Ft" : "Sq.Mtr", `Rate / ${rateUnit === "sqft" ? "Sq.Ft" : "Sq.Mtr"}`, "Amount"].map((th, i) => (
                    <th key={i} className="border border-gray-300 p-2 font-semibold text-gray-800">{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.rows.map((r, i) => {
                  const glassItem = glassList.find(g => g._id === r.glass);
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border border-gray-300 text-center p-2">{i + 1}</td>
                      <td className="border border-gray-300 text-center p-2">{r.widthMM || "0"}</td>
                      <td className="border border-gray-300 text-center p-2">{r.heightMM || "0"}</td>
                      <td className="border border-gray-300 text-center p-2">{r.series || "N/A"}</td>
                      <td className="border border-gray-300 text-center p-2">{r.typology || "N/A"}</td>
                      <td className="border border-gray-300 text-center p-2">{glassItem?.title || "N/A"}</td>
                      <td className="border border-gray-300 text-center p-2">{r.qty || "1"}</td>
                      <td className="border border-gray-300 text-center p-2">{rateUnit === "sqft" ? r.sqft || "0.00" : r.sqm || "0.00"}</td>
                      <td className="border border-gray-300 text-center p-2">{rateUnit === "sqft" ? r.rateSqFt || "0.00" : r.rateSqM || "0.00"}</td>
                      <td className="border border-gray-300 text-center p-2">{r.amount || "0.00"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="w-full mb-8">
              <table className="text-sm text-right w-full">
                <tbody>
                  <tr>
                    <td className="font-semibold text-gray-800 py-1 pr-2 pl-80">Total Before Tax:</td>
                    <td className="font-semibold text-gray-800">{q.totalAmt?.toFixed(2) || "0.00"}</td>
                  </tr>
                  {q.header?.location === "gujarat" ? (
                    <>
                      <tr><td className="text-gray-700 py-1 pr-2">CGST ({q.header.cgst}%) :</td><td>{((q.totalAmt || 0) * (q.header.cgst || 0) / 100).toFixed(2)}</td></tr>
                      <tr><td className="text-gray-700 py-1 pr-2">SGST ({q.header.sgst}%) :</td><td>{((q.totalAmt || 0) * (q.header.sgst || 0) / 100).toFixed(2)}</td></tr>
                    </>
                  ) : (
                    <tr><td className="text-gray-700 py-1 pr-2">IGST {q.header.igst}%:</td><td>{((q.totalAmt || 0) * (q.header.igst || 0) / 100).toFixed(2)}</td></tr>
                  )}
                  <tr className="border-t-2 border-gray-400">
                    <td className="font-bold text-gray-800 py-1 pr-2">GRAND TOTAL:</td>
                    <td className="font-bold text-gray-800">{q.grand || "0.00"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          ))}
        </div>

        {/* Page Break: Terms & Signatures */}
        <div className="print-page page-break">
          <div className="text-sm text-gray-600 mb-8">
            <p className="text-lg font-semibold text-gray-800">Terms & Conditions:</p>
            <div className="whitespace-pre-wrap mt-2 pl-2">
              {q.header?.terms || "No terms provided."}
            </div>
          </div>

          <div className="flex justify-between items-end text-sm text-gray-600 signature-block">
            <div>
              <p className="font-semibold">For ACCORR</p>
              <div className="mt-12"><p>Authorized Signatory</p></div>
            </div>
            <div className="text-right">
              <p className="font-semibold">Customer Acceptance</p>
              <div className="mt-12"><p>Signature</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  