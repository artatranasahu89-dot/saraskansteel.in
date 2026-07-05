import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import CustomerLayout from "./CustomerLayout";
import html2pdf from "html2pdf.js";

function InvoiceView() {
  const { id } = useParams();
  const billRef = useRef<HTMLDivElement>(null);

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const headers = {
    Authorization: "Bearer " + token,
  };

  const Layout = user?.role === "CUSTOMER" ? CustomerLayout : AdminLayout;

  const money = (value: any) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (value: any) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const loadInvoice = async () => {
    try {
      setLoading(true);

      const endpoints = [
        `http://localhost:5000/api/invoices/${id}`,
        `http://localhost:5000/api/customer-portal/invoices/${id}`,
      ];

      let loadedInvoice: any = null;
      let lastError: any = null;

      for (const endpoint of endpoints) {
        try {
          const res = await axios.get(endpoint, { headers });
          loadedInvoice = res.data?.data || res.data?.invoice || res.data;
          break;
        } catch (error: any) {
          lastError = error;
        }
      }

      if (!loadedInvoice && user?.role === "CUSTOMER") {
        const listRes = await axios.get(
          "http://localhost:5000/api/customer-portal/my-invoices",
          { headers }
        );

        const list = listRes.data?.data || listRes.data?.invoices || [];
        loadedInvoice = list.find((item: any) => item.id === id);
      }

      if (!loadedInvoice) {
        throw lastError || new Error("Estimated bill not found");
      }

      setInvoice(loadedInvoice);
    } catch (error) {
      console.log("Estimated bill load error:", error);
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const order = invoice?.order || {};
  const customer =
    order.customerRecord || order.customer || invoice?.customer || {};

  const getItems = (data: any) => {
    const orderData = data?.order || {};

    const possibleItems =
      data?.items ||
      data?.invoiceItems ||
      data?.billItems ||
      data?.products ||
      data?.orderItems ||
      data?.cartItems ||
      orderData.items ||
      orderData.invoiceItems ||
      orderData.billItems ||
      orderData.orderItems ||
      orderData.products ||
      orderData.cartItems ||
      [];

    if (!Array.isArray(possibleItems)) return [];

    return possibleItems;
  };

  const items = getItems(invoice);

  const getItemName = (item: any) =>
    item.product?.name ||
    item.productName ||
    item.name ||
    item.itemName ||
    item.description ||
    "Product";

  const getItemQty = (item: any) =>
    item.quantity ||
    item.qty ||
    item.bags ||
    item.weight ||
    item.actualWeight ||
    item.finalWeight ||
    0;

  const getItemUnit = (item: any) =>
    item.unit || item.product?.unit || item.unitName || "-";

  const getItemRate = (item: any) =>
    item.rate ||
    item.unitPrice ||
    item.price ||
    item.product?.price ||
    item.product?.sellingPrice ||
    0;

  const getItemAmount = (item: any) =>
    item.amount ||
    item.total ||
    item.lineTotal ||
    item.finalAmount ||
    Number(getItemQty(item) || 0) * Number(getItemRate(item) || 0);

  const getBillNumber = () =>
    invoice?.invoiceNumber || invoice?.invoiceNo || invoice?.id || "-";

  const getOrderNumber = () =>
    order.orderNumber || invoice?.orderNumber || "-";

  const getCustomerName = () =>
    invoice?.customerName || customer.name || user.name || "Customer";

  const getCustomerMobile = () =>
    invoice?.customerMobile || customer.mobile || user.mobile || "-";

  const getCustomerId = () =>
    customer.customerNumber ||
    customer.customerId ||
    customer.customerCode ||
    user.customerNumber ||
    user.customerId ||
    "-";

  const getCustomerAddress = () =>
    invoice?.customerAddress || customer.address || user.address || "-";

  const getDeliveryAddress = () =>
    order.deliveryAddressSnapshot ||
    order.deliveryLocation ||
    invoice?.deliveryAddress ||
    invoice?.customerAddress ||
    customer.address ||
    "-";

  const getStaffName = () =>
    order.assignedStaff?.name ||
    order.staff?.name ||
    order.deliveryStaff?.name ||
    invoice?.assignedStaffName ||
    "-";

  const getTransporter = () =>
    order.transport?.name ||
    order.transporter?.name ||
    invoice?.transporterName ||
    "-";

  const materialAmount =
    invoice?.materialAmount ||
    invoice?.subTotal ||
    invoice?.subtotal ||
    items.reduce(
      (sum: number, item: any) => sum + Number(getItemAmount(item)),
      0
    );

  const labourCharge = invoice?.labourCharge || order.labourCharge || 0;

  const transportCharge =
    invoice?.transportCharge ||
    order.transportCharge ||
    order.deliveryCharge ||
    0;

  const discountAmount = invoice?.discountAmount || order.discountAmount || 0;

  const totalBill =
    invoice?.finalAmount ||
    invoice?.invoiceValue ||
    invoice?.totalAmount ||
    order.invoiceValue ||
    Number(materialAmount) +
      Number(labourCharge) +
      Number(transportCharge) -
      Number(discountAmount);

  const previousOutstanding =
    order.previousOutstanding ||
    invoice?.previousOutstanding ||
    customer.outstandingBefore ||
    customer.outstandingAmount ||
    0;

  const totalPayable =
    order.totalPayable ||
    invoice?.totalPayable ||
    Number(totalBill) + Number(previousOutstanding);

  const todayPaid =
    order.amountPaidToday ||
    invoice?.amountPaidToday ||
    invoice?.paidAmount ||
    0;

  const currentOutstanding =
    order.nowOutstanding ||
    invoice?.nowOutstanding ||
    invoice?.outstandingAmount ||
    Number(totalPayable) - Number(todayPaid);

  const compactClass =
    items.length > 28
      ? "ultra-compact"
      : items.length > 18
      ? "super-compact"
      : items.length > 9
      ? "compact"
      : "";

  const downloadPDF = () => {
    if (!billRef.current || !invoice) return;

    html2pdf()
      .set({
        margin: 0,
        filename: `${getBillNumber()}-A5-estimated-bill.pdf`,
        image: {
          type: "jpeg",
          quality: 0.99,
        },
        html2canvas: {
          scale: 3,
          useCORS: true,
          scrollY: 0,
          windowWidth: billRef.current.scrollWidth,
          windowHeight: billRef.current.scrollHeight,
        },
        jsPDF: {
          unit: "mm",
          format: "a5",
          orientation: "portrait",
        },
      
      })
      .from(billRef.current)
      .save();
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 24 }}>
          <h2>Loading estimated bill...</h2>
        </div>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout>
        <div style={{ padding: 24 }}>
          <h2>Estimated bill not found</h2>

          <Link
            to={user?.role === "CUSTOMER" ? "/customer-invoices" : "/billing"}
          >
            Back
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @page {
          size: A5 portrait;
          margin: 0;
        }

        .invoice-page {
          min-height: 100vh;
          background: #f1f5f9;
          padding: 20px;
          color: #111827;
        }

        .action-bar {
          max-width: 148mm;
          margin: 0 auto 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          box-shadow: 0 8px 20px rgba(15,23,42,.08);
        }

        .action-bar h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 1000;
        }

        .action-bar p {
          margin: 3px 0 0;
          font-size: 12px;
          color: #64748b;
          font-weight: 800;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn {
          border: none;
          border-radius: 10px;
          padding: 9px 12px;
          background: #111827;
          color: white;
          font-weight: 1000;
          cursor: pointer;
          text-decoration: none;
          font-size: 12px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
        }

        .btn-gold {
          background: #f59e0b;
          color: #111827;
        }

        .btn-green {
          background: #16a34a;
          color: white;
        }

        .bill-holder {
          width: 148mm;
          margin: auto;
        }

        .bill {
          width: 148mm;
          height: 210mm;
          background: white;
          color: #111827;
          overflow: hidden;
          font-family: Arial, sans-serif;
          box-shadow: 0 20px 45px rgba(15,23,42,.18);
        }

        .bill-inner {
          padding: 5mm;
          height: 200mm;
          display: flex;
          flex-direction: column;
          gap: 2mm;
        }

        .top {
          background: linear-gradient(135deg, #111827, #292524);
          color: white;
          border-radius: 4mm;
          padding: 3.4mm 4mm;
          display: flex;
          flex-direction: column;
          gap: 2.4mm;
          flex-shrink: 0;
        }

        .brand h1 {
          margin: 0;
          font-size: 19px;
          font-weight: 1000;
          letter-spacing: .2px;
          line-height: 1;
          white-space: nowrap;
        }

        .brand h1 span {
          color: #f59e0b;
        }

        .brand p {
          margin: 2mm 0 0;
          color: #e5e7eb;
          font-size: 8.7px;
          line-height: 1.35;
          font-weight: 800;
        }

        .bill-line {
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 2.5mm;
          padding: 2.2mm 3mm;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 4mm;
          align-items: center;
        }

        .bill-title {
          color: #fde68a;
          font-size: 9px;
          font-weight: 1000;
          text-transform: uppercase;
        }

        .bill-number {
          color: white;
          font-size: 12px;
          font-weight: 1000;
          word-break: break-word;
        }

        .bill-date {
          color: #e5e7eb;
          font-size: 9px;
          font-weight: 1000;
          white-space: nowrap;
        }

        .details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3mm;
          flex-shrink: 0;
        }

        .box {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 3mm;
          padding: 2.6mm;
        }

        .box h3 {
          margin: 0 0 1.8mm;
          font-size: 10.5px;
          font-weight: 1000;
        }

        .row {
          display: grid;
          grid-template-columns: 22mm 1fr;
          gap: 2mm;
          border-bottom: 1px solid #e5e7eb;
          padding: 1mm 0;
          font-size: 8.1px;
          line-height: 1.13;
        }

        .row:last-child {
          border-bottom: none;
        }

        .row span {
          color: #64748b;
          font-weight: 900;
        }

        .row b {
          color: #111827;
          font-weight: 1000;
          word-break: break-word;
        }

        .delivery {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 3mm;
          padding: 2mm 3mm;
          flex-shrink: 0;
        }

        .delivery h3 {
          margin: 0 0 1.2mm;
          font-size: 10px;
          font-weight: 1000;
        }

        .delivery p {
          margin: 0;
          font-size: 8.2px;
          color: #475569;
          line-height: 1.18;
          font-weight: 800;
        }

        .items-area {
          flex-shrink: 0;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-radius: 3mm;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 8.2px;
        }

        th {
          background: #111827;
          color: white;
          padding: 1.45mm 1.1mm;
          text-align: left;
          font-weight: 1000;
        }

        td {
          padding: 1.15mm 1.1mm;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
          font-weight: 800;
          line-height: 1.1;
          word-break: break-word;
        }

        tbody tr:nth-child(even) {
          background: #f8fafc;
        }

        .sl-col {
          width: 8mm;
        }

        .qty-col {
          width: 15mm;
        }

        .unit-col {
          width: 13mm;
        }

        .rate-col {
          width: 23mm;
        }

        .amount-col {
          width: 25mm;
        }

        .center {
          text-align: center;
        }

        .right {
          text-align: right;
        }

        .bill-summary-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3mm;
          flex-shrink: 0;
        }

        .summary-box {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 3mm;
          padding: 2.2mm;
        }

        .summary-box h3 {
          margin: 0 0 1.4mm;
          font-size: 9.8px;
          font-weight: 1000;
          color: #111827;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 2mm;
          border-bottom: 1px solid #e5e7eb;
          padding: .95mm 0;
          color: #475569;
          font-size: 7.8px;
          font-weight: 900;
        }

        .summary-row:last-child {
          border-bottom: none;
        }

        .summary-row b {
          color: #111827;
          white-space: nowrap;
        }

        .summary-row.strong {
          font-size: 8.4px;
          color: #111827;
          font-weight: 1000;
        }

        .current-due {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
          border-radius: 3mm;
          padding: 2mm 3mm;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 4mm;
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 1000;
        }

        .current-due span {
          text-transform: uppercase;
          letter-spacing: .2px;
        }

        .current-due b {
          font-size: 12px;
          color: #92400e;
          white-space: nowrap;
        }

        .blank-space {
          flex: 1;
          min-height: 2mm;
        }

        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8mm;
          flex-shrink: 0;
          margin-top: .3mm;
        }

        .signature {
          text-align: center;
          font-size: 8px;
          font-weight: 1000;
        }

        .sign-line {
          border-top: 1px solid #111827;
          margin: 5.8mm 0 1mm;
        }

        .footer {
          background: #111827;
          color: white;
          padding: 1.8mm 4mm;
          font-size: 7.5px;
          font-weight: 900;
          display: flex;
          justify-content: space-between;
          gap: 3mm;
          flex-shrink: 0;
        }

        .footer span {
          color: #fbbf24;
        }

        .compact .bill-inner {
          gap: 1.45mm;
          padding: 4.3mm;
          height: 201.4mm;
        }

        .compact .brand h1 {
          font-size: 17px;
        }

        .compact .brand p,
        .compact .bill-date,
        .compact .row,
        .compact .delivery p,
        .compact td,
        .compact th,
        .compact .summary-row,
        .compact .signature,
        .compact .footer {
          font-size: 6.9px;
        }

        .compact td {
          padding: .78mm .75mm;
        }

        .compact th {
          padding: .9mm .75mm;
        }

        .compact .box,
        .compact .delivery,
        .compact .summary-box {
          padding: 1.6mm;
        }

        .compact .current-due {
          padding: 1.5mm 2.2mm;
          font-size: 8.5px;
        }

        .super-compact .bill-inner {
          gap: 1mm;
          padding: 3.6mm;
          height: 202.8mm;
        }

        .super-compact .top {
          padding: 2mm;
          gap: 1.2mm;
        }

        .super-compact .brand h1 {
          font-size: 15px;
        }

        .super-compact .brand p,
        .super-compact .bill-title,
        .super-compact .bill-date,
        .super-compact .row,
        .super-compact .delivery p,
        .super-compact td,
        .super-compact th,
        .super-compact .summary-row,
        .super-compact .signature,
        .super-compact .footer {
          font-size: 6px;
        }

        .super-compact .box h3,
        .super-compact .delivery h3,
        .super-compact .summary-box h3 {
          font-size: 7.8px;
        }

        .super-compact .box,
        .super-compact .delivery,
        .super-compact .summary-box {
          padding: 1.15mm;
        }

        .super-compact td {
          padding: .45mm .45mm;
          line-height: 1.02;
        }

        .super-compact th {
          padding: .65mm .45mm;
        }

        .super-compact .current-due {
          padding: 1.1mm 1.8mm;
          font-size: 7.3px;
        }

        .super-compact .current-due b {
          font-size: 8.3px;
        }

        .super-compact .sign-line {
          margin-top: 3.4mm;
        }

        .ultra-compact .bill-inner {
          gap: .7mm;
          padding: 2.8mm;
          height: 204.4mm;
        }

        .ultra-compact .top {
          padding: 1.4mm;
          gap: .7mm;
        }

        .ultra-compact .brand h1 {
          font-size: 13px;
        }

        .ultra-compact .brand p,
        .ultra-compact .bill-title,
        .ultra-compact .bill-number,
        .ultra-compact .bill-date,
        .ultra-compact .row,
        .ultra-compact .delivery p,
        .ultra-compact td,
        .ultra-compact th,
        .ultra-compact .summary-row,
        .ultra-compact .signature,
        .ultra-compact .footer {
          font-size: 5.1px;
        }

        .ultra-compact .box h3,
        .ultra-compact .delivery h3,
        .ultra-compact .summary-box h3 {
          font-size: 6.5px;
        }

        .ultra-compact .box,
        .ultra-compact .delivery,
        .ultra-compact .summary-box {
          padding: .8mm;
        }

        .ultra-compact td {
          padding: .25mm .3mm;
          line-height: .98;
        }

        .ultra-compact th {
          padding: .42mm .3mm;
        }

        .ultra-compact .current-due {
          padding: .8mm 1.3mm;
          font-size: 6.2px;
        }

        .ultra-compact .current-due b {
          font-size: 7px;
        }

        .ultra-compact .sign-line {
          margin-top: 2.2mm;
        }

        @media print {
          html,
          body {
            width: 148mm;
            height: 210mm;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }

          .action-bar,
          .customer-topbar,
          .topbar,
          .sidebar,
          .mobile-menu,
          .customer-sidebar {
            display: none !important;
          }

          .invoice-page {
            padding: 0 !important;
            background: white !important;
            width: 148mm !important;
            height: 210mm !important;
            overflow: hidden !important;
          }

          .bill-holder {
            width: 148mm !important;
            height: 210mm !important;
            margin: 0 !important;
          }

          .bill {
            width: 148mm !important;
            height: 210mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          .top,
          th,
          .footer,
          .current-due {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }

        @media(max-width: 760px) {
          .invoice-page {
            padding: 10px;
          }

          .bill-holder {
            width: 100%;
            overflow-x: auto;
          }

          .action-bar,
          .actions,
          .btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="invoice-page">
        <div className="action-bar">
          <div>
            <h1>Single Page A5 Estimated Bill</h1>
            <p>
              {getBillNumber()} | {getCustomerName()}
            </p>
          </div>

          <div className="actions">
            <Link
              className="btn"
              to={user?.role === "CUSTOMER" ? "/customer-invoices" : "/billing"}
            >
              ← Back
            </Link>

            <button className="btn btn-green" onClick={() => window.print()}>
              Print A5
            </button>

            <button className="btn btn-gold" onClick={downloadPDF}>
              Download A5 PDF
            </button>
          </div>
        </div>

        <div className="bill-holder">
          <div className={`bill ${compactClass}`} ref={billRef}>
            <div className="bill-inner">
              <div className="top">
                <div className="brand">
                  <h1>
                    SARASKANA <span>STEEL</span>
                  </h1>

                  <p>
                    Saraskana, Odisha | Phone: 9438085096, 6371608996
                    <br />
                    Email: SARSKANASTEEL@GMAIL.COM
                  </p>
                </div>

                <div className="bill-line">
                  <div>
                    <div className="bill-title">Estimated Bill - Not A Tax Invoice</div>
                    <div className="bill-number">{getBillNumber()}</div>
                  </div>

                  <div className="bill-date">
                    Date: {formatDate(invoice.createdAt)}
                  </div>
                </div>
              </div>

              <div className="details">
                <div className="box">
                  <h3>Customer Details</h3>

                  <div className="row">
                    <span>Name</span>
                    <b>{getCustomerName()}</b>
                  </div>

                  <div className="row">
                    <span>Customer ID</span>
                    <b>{getCustomerId()}</b>
                  </div>

                  <div className="row">
                    <span>Mobile</span>
                    <b>{getCustomerMobile()}</b>
                  </div>

                  <div className="row">
                    <span>Address</span>
                    <b>{getCustomerAddress()}</b>
                  </div>
                </div>

                <div className="box">
                  <h3>Order Details</h3>

                  <div className="row">
                    <span>Order No</span>
                    <b>{getOrderNumber()}</b>
                  </div>

                  <div className="row">
                    <span>Bill Date</span>
                    <b>{formatDate(invoice.createdAt)}</b>
                  </div>

                  <div className="row">
                    <span>Staff</span>
                    <b>{getStaffName()}</b>
                  </div>

                  <div className="row">
                    <span>Transport</span>
                    <b>{getTransporter()}</b>
                  </div>

                  <div className="row">
                    <span>Status</span>
                    <b>{invoice.status || order.status || "ESTIMATED"}</b>
                  </div>
                </div>
              </div>

              <div className="delivery">
                <h3>Delivery Address</h3>
                <p>{getDeliveryAddress()}</p>
              </div>

              <div className="items-area">
                <table>
                  <thead>
                    <tr>
                      <th className="center sl-col">Sl</th>
                      <th>Product</th>
                      <th className="center qty-col">Qty</th>
                      <th className="center unit-col">Unit</th>
                      <th className="right rate-col">Rate</th>
                      <th className="right amount-col">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item: any, index: number) => (
                      <tr key={item.id || index}>
                        <td className="center">{index + 1}</td>
                        <td>{getItemName(item)}</td>
                        <td className="center">{getItemQty(item)}</td>
                        <td className="center">{getItemUnit(item)}</td>
                        <td className="right">₹{money(getItemRate(item))}</td>
                        <td className="right">₹{money(getItemAmount(item))}</td>
                      </tr>
                    ))}

                    {items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="center">
                          No product items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bill-summary-section">
                <div className="summary-box">
                  <h3>Bill Summary</h3>

                  <div className="summary-row">
                    <span>Material Amount</span>
                    <b>₹{money(materialAmount)}</b>
                  </div>

                  <div className="summary-row">
                    <span>Labour Charge</span>
                    <b>₹{money(labourCharge)}</b>
                  </div>

                  <div className="summary-row">
                    <span>Transport Charge</span>
                    <b>₹{money(transportCharge)}</b>
                  </div>

                  <div className="summary-row">
                    <span>Discount</span>
                    <b>₹{money(discountAmount)}</b>
                  </div>
                </div>

                <div className="summary-box">
                  <h3>Payment Summary</h3>

                  <div className="summary-row strong">
                    <span>Total Bill</span>
                    <b>₹{money(totalBill)}</b>
                  </div>

                  <div className="summary-row">
                    <span>Previous Outstanding</span>
                    <b>₹{money(previousOutstanding)}</b>
                  </div>

                  <div className="summary-row">
                    <span>Total Payable</span>
                    <b>₹{money(totalPayable)}</b>
                  </div>

                  <div className="summary-row">
                    <span>Today Paid</span>
                    <b>₹{money(todayPaid)}</b>
                  </div>
                </div>
              </div>

              <div className="current-due">
                <span>Current Outstanding</span>
                <b>₹{money(currentOutstanding)}</b>
              </div>

              <div className="blank-space"></div>

              <div className="signatures">
                <div className="signature">
                  <div className="sign-line"></div>
                  Customer Signature
                </div>

                <div className="signature">
                  <div className="sign-line"></div>
                  Authorized Signature
                </div>
              </div>

              <div className="footer">
                <div>
                  Powered by <span>STRIDE</span>
                </div>

                <div>SARASKANA STEEL | Estimated Material Bill</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default InvoiceView;
