import React, { useState } from "react";
import {
  FaBuilding,
  FaUser,
  FaCalendarAlt,
  FaHashtag,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaPrint,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

const defaultInvoice = {
  company: {
    name: "ZenCode Digital",
    address: "123 Main Street, Mumbai, India",
    email: "info@zencode.com",
    phone: "+91 98765 43210",
    logo: "",
  },
  client: {
    name: "Nilesh Kumar",
    address: "456 Client Ave, Delhi, India",
    email: "client@email.com",
    phone: "+91 91234 56789",
  },
  invoice: {
    number: "INV-2026-001",
    issueDate: "2026-03-25",
    dueDate: "2026-04-10",
    status: "Paid",
    items: [
      { name: "Website Design", qty: 1, unit: 25000 },
    ],
    tax: 0.18,
    discount: 0,
  },
};

export default function ModernInvoice() {
  const [form, setForm] = useState(defaultInvoice);

  // Derived values
  const subtotal = form.invoice.items.reduce((sum, i) => sum + Number(i.qty) * Number(i.unit), 0);
  const taxAmount = subtotal * Number(form.invoice.tax);
  const total = subtotal + taxAmount - (Number(form.invoice.discount) || 0);

  // Handlers
  const handleChange = (section, field, value) => {
    setForm(f => ({
      ...f,
      [section]: {
        ...f[section],
        [field]: value,
      },
    }));
  };
  const handleInvoiceChange = (field, value) => {
    setForm(f => ({
      ...f,
      invoice: {
        ...f.invoice,
        [field]: value,
      },
    }));
  };
  const handleItemChange = (idx, field, value) => {
    setForm(f => ({
      ...f,
      invoice: {
        ...f.invoice,
        items: f.invoice.items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
      },
    }));
  };
  const addItem = () => {
    setForm(f => ({
      ...f,
      invoice: {
        ...f.invoice,
        items: [...f.invoice.items, { name: "", qty: 1, unit: 0 }],
      },
    }));
  };
  const removeItem = idx => {
    setForm(f => ({
      ...f,
      invoice: {
        ...f.invoice,
        items: f.invoice.items.filter((_, i) => i !== idx),
      },
    }));
  };

  return (
    <div className="invoice-bg">
      <div className="invoice-card" style={{ maxWidth: 900 }}>
        {/* --- Invoice Creation Form --- */}
        <form className="invoice-form" style={{ marginBottom: 32, background: '#f8fafc', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px 0 rgba(30,64,175,0.06)' }} onSubmit={e => e.preventDefault()}>
          <div className="form-section-title">Company Info</div>
          <div className="form-row">
            <input className="form-input" placeholder="Company Name" value={form.company.name} onChange={e => handleChange('company', 'name', e.target.value)} />
            <input className="form-input" placeholder="Address" value={form.company.address} onChange={e => handleChange('company', 'address', e.target.value)} />
            <input className="form-input" placeholder="Email" value={form.company.email} onChange={e => handleChange('company', 'email', e.target.value)} />
            <input className="form-input" placeholder="Phone" value={form.company.phone} onChange={e => handleChange('company', 'phone', e.target.value)} />
          </div>
          <div className="form-section-title">Client Info</div>
          <div className="form-row">
            <input className="form-input" placeholder="Client Name" value={form.client.name} onChange={e => handleChange('client', 'name', e.target.value)} />
            <input className="form-input" placeholder="Address" value={form.client.address} onChange={e => handleChange('client', 'address', e.target.value)} />
            <input className="form-input" placeholder="Email" value={form.client.email} onChange={e => handleChange('client', 'email', e.target.value)} />
            <input className="form-input" placeholder="Phone" value={form.client.phone} onChange={e => handleChange('client', 'phone', e.target.value)} />
          </div>
          <div className="form-section-title">Invoice Details</div>
          <div className="form-row">
            <input className="form-input" placeholder="Invoice Number" value={form.invoice.number} onChange={e => handleInvoiceChange('number', e.target.value)} />
            <input className="form-input" type="date" value={form.invoice.issueDate} onChange={e => handleInvoiceChange('issueDate', e.target.value)} />
            <input className="form-input" type="date" value={form.invoice.dueDate} onChange={e => handleInvoiceChange('dueDate', e.target.value)} />
            <select className="form-input" value={form.invoice.status} onChange={e => handleInvoiceChange('status', e.target.value)}>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="form-section-title">Items</div>
          <div className="form-row-col">
            {form.invoice.items.map((item, idx) => (
              <div className="item-row" key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" placeholder="Item Name" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} />
                <input className="form-input" type="number" min="1" placeholder="Qty" value={item.qty} onChange={e => handleItemChange(idx, 'qty', e.target.value)} style={{ width: 70 }} />
                <input className="form-input" type="number" min="0" placeholder="Unit Price" value={item.unit} onChange={e => handleItemChange(idx, 'unit', e.target.value)} style={{ width: 120 }} />
                <span style={{ alignSelf: 'center', fontWeight: 600 }}>{formatCurrency(item.qty * item.unit)}</span>
                <button type="button" className="item-remove-btn" onClick={() => removeItem(idx)} title="Remove"><FaTrash /></button>
              </div>
            ))}
            <button type="button" className="item-add-btn" onClick={addItem} style={{ marginTop: 4 }}><FaPlus /> Add Item</button>
          </div>
          <div className="form-row">
            <input className="form-input" type="number" min="0" step="0.01" placeholder="GST (%)" value={form.invoice.tax * 100} onChange={e => handleInvoiceChange('tax', Number(e.target.value) / 100)} style={{ width: 120 }} />
            <input className="form-input" type="number" min="0" placeholder="Discount" value={form.invoice.discount} onChange={e => handleInvoiceChange('discount', e.target.value)} style={{ width: 120 }} />
          </div>
        </form>

        {/* --- Invoice Preview --- */}
        <div className="invoice-preview">
          {/* Header */}
          <div className="invoice-header">
            <div className="logo-wrap">
              {form.company.logo ? (
                <img src={form.company.logo} alt="Logo" className="logo-img" />
              ) : (
                <div className="logo-placeholder">
                  <FaBuilding size={32} />
                </div>
              )}
              <span className="company-name">{form.company.name}</span>
            </div>
            <div className="invoice-title">
              <span>INVOICE</span>
              <span className={`status-badge ${form.invoice.status.toLowerCase()}`}>
                {form.invoice.status === "Paid" ? <><FaCheckCircle /> Paid</> : <><FaClock /> Pending</>}
              </span>
            </div>
          </div>
          {/* Company & Client Details */}
          <div className="details-row">
            <div className="details-block">
              <div className="details-title"><FaBuilding /> Company</div>
              <div>{form.company.name}</div>
              <div>{form.company.address}</div>
              <div>{form.company.email}</div>
              <div>{form.company.phone}</div>
            </div>
            <div className="details-block">
              <div className="details-title"><FaUser /> Bill To</div>
              <div>{form.client.name}</div>
              <div>{form.client.address}</div>
              <div>{form.client.email}</div>
              <div>{form.client.phone}</div>
            </div>
            <div className="details-block meta-block">
              <div className="details-title"><FaHashtag /> Invoice Info</div>
              <div><b>No:</b> {form.invoice.number}</div>
              <div><FaCalendarAlt /> Issue: {form.invoice.issueDate}</div>
              <div><FaCalendarAlt /> Due: {form.invoice.dueDate}</div>
            </div>
          </div>
          {/* Items Table */}
          <div className="table-wrap">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {form.invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{formatCurrency(item.unit)}</td>
                    <td>{formatCurrency(item.qty * item.unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Summary */}
          <div className="summary-row">
            <div className="summary-labels">
              <div>Subtotal</div>
              <div>GST ({Number(form.invoice.tax * 100)}%)</div>
              {form.invoice.discount > 0 ? <div>Discount</div> : null}
              <div className="grand-label">Grand Total</div>
            </div>
            <div className="summary-values">
              <div>{formatCurrency(subtotal)}</div>
              <div>{formatCurrency(taxAmount)}</div>
              {form.invoice.discount > 0 ? <div>-{formatCurrency(form.invoice.discount)}</div> : null}
              <div className="grand-value">{formatCurrency(total)}</div>
            </div>
          </div>
          {/* Actions */}
          <div className="actions-row">
            <button className="action-btn"><FaDownload /> Download PDF</button>
            <button className="action-btn"><FaPrint /> Print</button>
          </div>
          {/* Footer */}
          <div className="footer-row">
            <div className="thanks">Thank you for your business!</div>
            <div className="terms">Payment due within 15 days. Please contact us for any queries.</div>
          </div>
        </div>
        <style>{`
          .invoice-bg {
            min-height: 100vh;
            background: #f4f7fb;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px 8px;
          }
          .invoice-card {
            background: #fff;
            border-radius: 22px;
            box-shadow: 0 6px 32px 0 rgba(30, 64, 175, 0.10), 0 1.5px 6px 0 rgba(0,0,0,0.04);
            max-width: 900px;
            width: 100%;
            padding: 36px 28px 24px 28px;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            color: #1e293b;
            display: flex;
            flex-direction: column;
            gap: 28px;
          }
          .invoice-form {
            margin-bottom: 32px;
          }
          .form-section-title {
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 6px;
            margin-top: 18px;
            font-size: 1.08rem;
          }
          .form-row {
            display: flex;
            gap: 12px;
            margin-bottom: 10px;
            flex-wrap: wrap;
          }
          .form-row-col {
            display: flex;
            flex-direction: column;
            gap: 0;
          }
          .form-input {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 1rem;
            min-width: 120px;
            background: #fff;
            color: #1e293b;
            outline: none;
            transition: border 0.15s;
          }
          .form-input:focus {
            border: 1.5px solid #2563eb;
          }
          .item-add-btn {
            background: #2563eb;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 7px 16px;
            font-size: 1rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
          }
          .item-add-btn:hover {
            background: #1d4ed8;
            transform: scale(1.04);
          }
          .item-remove-btn {
            background: #f87171;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 7px 10px;
            font-size: 1rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
          }
          .item-remove-btn:hover {
            background: #dc2626;
            transform: scale(1.08);
          }
          .invoice-header {
            display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1.5px solid #e0e7ef;
          padding-bottom: 18px;
        }
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-img {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 12px;
          border: 1.5px solid #e0e7ef;
        }
        .logo-placeholder {
          width: 48px;
          height: 48px;
          background: #e0e7ef;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563eb;
          font-weight: bold;
          font-size: 1.2rem;
        }
        .company-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2563eb;
        }
        .invoice-title {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }
        .invoice-title > span:first-child {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 0.04em;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: 8px;
          padding: 3px 12px;
          background: #e0e7ef;
          color: #64748b;
        }
        .status-badge.paid {
          background: #e0f7ef;
          color: #059669;
        }
        .status-badge.pending {
          background: #fef9c3;
          color: #b45309;
        }
        .details-row {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          justify-content: space-between;
        }
        .details-block {
          background: #f8fafc;
          border-radius: 14px;
          box-shadow: 0 1.5px 6px 0 rgba(0,0,0,0.03);
          padding: 18px 16px;
          min-width: 180px;
          flex: 1 1 180px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .details-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .meta-block {
          min-width: 160px;
        }
        .table-wrap {
          overflow-x: auto;
        }
        .items-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1.5px 6px 0 rgba(0,0,0,0.03);
        }
        .items-table th, .items-table td {
          padding: 13px 12px;
          text-align: left;
        }
        .items-table th {
          background: #f1f5f9;
          color: #2563eb;
          font-size: 1rem;
          font-weight: 700;
          border-bottom: 1.5px solid #e0e7ef;
        }
        .items-table tbody tr {
          transition: background 0.18s;
        }
        .items-table tbody tr:hover {
          background: #e0e7ef;
        }
        .items-table td {
          font-size: 1rem;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }
        .items-table tbody tr:last-child td {
          border-bottom: none;
        }
        .summary-row {
          display: flex;
          justify-content: flex-end;
          gap: 32px;
          margin-top: 10px;
        }
        .summary-labels, .summary-values {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }
        .grand-label {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2563eb;
        }
        .grand-value {
          font-size: 1.2rem;
          font-weight: 800;
          color: #1e293b;
          background: #e0e7ef;
          border-radius: 8px;
          padding: 2px 16px;
        }
        .actions-row {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
        }
        .action-btn {
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 18px;
          font-size: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 1.5px 6px 0 rgba(37,99,235,0.08);
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
        }
        .action-btn:hover {
          background: #1d4ed8;
          box-shadow: 0 4px 16px 0 rgba(37,99,235,0.13);
          transform: translateY(-2px) scale(1.03);
        }
        .footer-row {
          border-top: 1.5px solid #e0e7ef;
          margin-top: 18px;
          padding-top: 14px;
          text-align: center;
        }
        .thanks {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2563eb;
        }
        .terms {
          font-size: 0.98rem;
          color: #64748b;
          margin-top: 4px;
        }
        @media (max-width: 700px) {
          .invoice-card {
            padding: 18px 4px 12px 4px;
            gap: 18px;
          }
          .details-row {
            flex-direction: column;
            gap: 10px;
          }
          .summary-row {
            flex-direction: column;
            gap: 8px;
            align-items: flex-end;
          }
          .actions-row {
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
          }
        }
      `}</style>
      </div>
    </div>
  );
}
