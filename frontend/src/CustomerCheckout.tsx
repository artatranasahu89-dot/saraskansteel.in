import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import CustomerLayout from "./CustomerLayout";

function CustomerCheckout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [addressForm, setAddressForm] = useState({
    label: "",
    contactPerson: "",
    mobile: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [checkoutForm, setCheckoutForm] = useState({
    deliveryAddress: "",
    deliveryNote: "",
    paymentMode: "CASH",
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const headers = {
    Authorization: "Bearer " + token,
  };

  const money = (value: any) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const onlyDigits = (value: any) => {
    return String(value || "").replace(/\D/g, "").slice(0, 10);
  };

  const getProduct = (item: any) => {
    return item.product || item.productData || item;
  };

  const getProductId = (item: any) => {
    return item.productId || item.product?.id || item.id;
  };

  const getName = (item: any) => {
    const product = getProduct(item);

    return (
      product?.name ||
      item.productName ||
      item.name ||
      item.itemName ||
      "Product"
    );
  };

  const getCategory = (item: any) => {
    const product = getProduct(item);

    return (
      product?.category?.name ||
      product?.categoryName ||
      item.categoryName ||
      item.category ||
      "Construction Material"
    );
  };

  const getUnit = (item: any) => {
    const product = getProduct(item);

    return product?.unit || item.unit || "";
  };

  const getPrice = (item: any) => {
    const product = getProduct(item);

    return Number(
      item.price ||
        item.unitPrice ||
        product?.price ||
        product?.sellingPrice ||
        0
    );
  };

  const getQuantity = (item: any) => {
    return Number(item.quantity || item.qty || item.bags || 1);
  };

  const getLineTotal = (item: any) => {
    return getPrice(item) * getQuantity(item);
  };

  const readLocalCart = () => {
    try {
      const local =
        localStorage.getItem("customerCart") ||
        localStorage.getItem("cart") ||
        "[]";

      const parsed = JSON.parse(local);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveLocalCart = (items: any[]) => {
    localStorage.setItem("customerCart", JSON.stringify(items));
    localStorage.setItem("cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const buildAddressText = (address: any) => {
    if (!address) return "";

    return [
      address.contactPerson,
      address.mobile,
      address.addressLine1,
      address.addressLine2,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const loadCheckout = async () => {
    try {
      setLoading(true);

      const localCart = readLocalCart();
      setCartItems(localCart);

      try {
        const summaryRes = await axios.get(
          "https://saraskansteel-in.onrender.com/api/customer-portal/summary",
          { headers }
        );

        setSummary(summaryRes.data?.data || summaryRes.data || {});
      } catch {
        setSummary({});
      }

      try {
        const addressRes = await axios.get(
          "https://saraskansteel-in.onrender.com/api/customer-addresses",
          { headers }
        );

        const addressList =
          addressRes.data?.data || addressRes.data?.addresses || [];

        setAddresses(addressList);

        const defaultAddress =
          addressList.find((address: any) => address.isDefault) ||
          addressList[0];

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setCheckoutForm((prev) => ({
            ...prev,
            deliveryAddress: buildAddressText(defaultAddress),
          }));
        } else if (user?.address) {
          setCheckoutForm((prev) => ({
            ...prev,
            deliveryAddress: user.address,
          }));
        }
      } catch {
        setAddresses([]);

        if (user?.address) {
          setCheckoutForm((prev) => ({
            ...prev,
            deliveryAddress: user.address,
          }));
        }
      }
    } catch (error) {
      console.log("Checkout load error:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckout();
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + getLineTotal(item), 0);
  }, [cartItems]);

  const totalQty = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + getQuantity(item), 0);
  }, [cartItems]);

  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId
  );

  const selectAddress = (address: any) => {
    setSelectedAddressId(address.id);
    setCheckoutForm((prev) => ({
      ...prev,
      deliveryAddress: buildAddressText(address),
    }));
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: "",
      contactPerson: "",
      mobile: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const saveAddress = async () => {
    try {
      if (!addressForm.addressLine1.trim()) {
        alert("Address Line 1 is required");
        return;
      }

      if (addressForm.mobile.trim() && onlyDigits(addressForm.mobile).length !== 10) {
        alert("Mobile number must be 10 digits, or leave it empty");
        return;
      }

      const res = await axios.post(
        "https://saraskansteel-in.onrender.com/api/customer-addresses",
        {
          ...addressForm,
          mobile: onlyDigits(addressForm.mobile),
        },
        { headers }
      );

      const newAddress = res.data?.data || res.data?.address;

      alert("Address saved successfully");

      resetAddressForm();
      setShowAddressForm(false);

      await loadCheckout();

      if (newAddress?.id) {
        setSelectedAddressId(newAddress.id);
        setCheckoutForm((prev) => ({
          ...prev,
          deliveryAddress: buildAddressText(newAddress),
        }));
      }
    } catch (error: any) {
      console.log("Save address error:", error?.response?.data || error);

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Address save failed"
      );
    }
  };

  const clearCartAfterOrder = () => {
    saveLocalCart([]);
    setCartItems([]);
  };

  const placeOrder = async () => {
    try {
      if (cartItems.length === 0) {
        alert("Your cart is empty");
        return;
      }

      if (!checkoutForm.deliveryAddress.trim()) {
        alert("Delivery address is required");
        return;
      }

      setPlacing(true);

      const orderItems = cartItems.map((item) => ({
        productId: getProductId(item),
        name: getName(item),
        productName: getName(item),
        categoryName: getCategory(item),
        quantity: getQuantity(item),
        qty: getQuantity(item),
        unit: getUnit(item),
        price: getPrice(item),
        unitPrice: getPrice(item),
        total: getLineTotal(item),
      }));
      const customerData = summary?.customer || user || {};

const customerId =
  customerData.id ||
  customerData.customerRecordId ||
  customerData.customerId ||
  user.id ||
  user.customerId ||
  "";

      const payload = {
        customerId,
customerRecordId: customerId,
customer: customerId,
customerName: customerData.name || user.name || "",
customerMobile: customerData.mobile || user.mobile || "",
        items: orderItems,
        cartItems: orderItems,
        products: orderItems,

        addressId: selectedAddressId || undefined,
        customerAddressId: selectedAddressId || undefined,

        deliveryAddress: checkoutForm.deliveryAddress,
        deliveryAddressSnapshot: checkoutForm.deliveryAddress,
        deliveryLocation: checkoutForm.deliveryAddress,

        deliveryNote: checkoutForm.deliveryNote,
        notes: checkoutForm.deliveryNote,
        customerNote: checkoutForm.deliveryNote,

        paymentMode: checkoutForm.paymentMode,

        subtotal,
        totalAmount: subtotal,
        grandTotal: subtotal,
        invoiceValue: subtotal,
      };

      const endpoints = [
        "https://saraskansteel-in.onrender.com/api/customer-portal/place-order",
        "https://saraskansteel-in.onrender.com/api/customer-portal/orders",
        "https://saraskansteel-in.onrender.com/api/orders/customer",
        "https://saraskansteel-in.onrender.com/api/orders",
      ];

      let successResponse: any = null;
      let lastError: any = null;

      for (const endpoint of endpoints) {
        try {
          const res = await axios.post(endpoint, payload, { headers });
          successResponse = res;
          break;
        } catch (error: any) {
          lastError = error;
        }
      }

      if (!successResponse) {
        throw lastError;
      }

      clearCartAfterOrder();

      alert("Order placed successfully");

      navigate("/customer-orders");
    } catch (error: any) {
      console.log("Place order error:", error?.response?.data || error);

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Order place failed"
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <CustomerLayout>
      <style>{`
        .checkout-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(245,158,11,.16), transparent 30%),
            radial-gradient(circle at bottom right, rgba(15,23,42,.10), transparent 30%),
            #f8fafc;
          padding: 28px;
          color: #111827;
        }

        .hero {
          background:
            linear-gradient(135deg, rgba(17,24,39,.96), rgba(41,37,36,.93)),
            url("https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          border-radius: 34px;
          padding: 36px;
          margin-bottom: 24px;
          box-shadow: 0 24px 60px rgba(15,23,42,.24);
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .hero::after {
          content: "";
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          right: -120px;
          top: -120px;
          background: rgba(245,158,11,.22);
        }

        .hero-content,
        .hero-actions {
          position: relative;
          z-index: 2;
        }

        .hero-badge {
          display: inline-flex;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.2);
          color: #fde68a;
          padding: 9px 15px;
          border-radius: 999px;
          font-weight: 1000;
          margin-bottom: 18px;
        }

        .hero h1 {
          margin: 0;
          font-size: 44px;
          font-weight: 1000;
          letter-spacing: -0.5px;
        }

        .hero h1 span {
          color: #f59e0b;
        }

        .hero p {
          color: #e5e7eb;
          line-height: 1.8;
          margin: 14px 0 0;
          max-width: 760px;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          border: none;
          border-radius: 16px;
          padding: 13px 18px;
          font-weight: 1000;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 15px;
          white-space: nowrap;
        }

        .btn-primary {
          background: #f59e0b;
          color: #111827;
          box-shadow: 0 14px 26px rgba(245,158,11,.25);
        }

        .btn-dark {
          background: #111827;
          color: white;
        }

        .btn-light {
          background: rgba(255,255,255,.12);
          color: white;
          border: 1px solid rgba(255,255,255,.22);
        }

        .btn-green {
          background: #16a34a;
          color: white;
        }

        .btn-gray {
          background: #64748b;
          color: white;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .summary-card {
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(18px);
          border: 1px solid #e5e7eb;
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
          position: relative;
          overflow: hidden;
        }

        .summary-card::after {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          right: -52px;
          top: -52px;
          background: rgba(245,158,11,.14);
          border-radius: 50%;
        }

        .summary-icon {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin-bottom: 14px;
          position: relative;
          z-index: 2;
        }

        .summary-card h3 {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          font-weight: 1000;
          position: relative;
          z-index: 2;
        }

        .summary-card h2 {
          margin: 9px 0 0;
          font-size: 30px;
          font-weight: 1000;
          position: relative;
          z-index: 2;
        }

        .blue { color: #2563eb; }
        .green { color: #16a34a; }
        .orange { color: #d97706; }
        .red { color: #dc2626; }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 390px;
          gap: 22px;
          align-items: start;
        }

        .section,
        .order-summary {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          padding: 24px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
          margin-bottom: 22px;
        }

        .order-summary {
          position: sticky;
          top: 96px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .section-head h2,
        .order-summary h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 1000;
        }

        .customer-box {
          background:
            linear-gradient(135deg, #111827, #292524);
          color: white;
          border-radius: 26px;
          padding: 22px;
          margin-bottom: 22px;
        }

        .customer-box h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 1000;
        }

        .customer-box p {
          color: #e5e7eb;
          line-height: 1.7;
          margin: 10px 0 0;
          font-weight: 800;
        }

        .address-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .address-card {
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          border-radius: 22px;
          padding: 16px;
          cursor: pointer;
          transition: .25s;
        }

        .address-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 30px rgba(15,23,42,.10);
        }

        .address-card.active {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        .address-card h3 {
          margin: 0 0 10px;
          font-size: 18px;
          font-weight: 1000;
        }

        .address-card p {
          color: #475569;
          line-height: 1.65;
          font-weight: 800;
          margin: 0;
        }

        .address-card.active p {
          color: #d1d5db;
        }

        .input,
        .textarea,
        .select {
          width: 100%;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 15px;
          outline: none;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .textarea {
          min-height: 110px;
          resize: vertical;
          line-height: 1.6;
        }

        .input:focus,
        .textarea:focus,
        .select:focus {
          border-color: #f59e0b;
          background: white;
          box-shadow: 0 0 0 4px rgba(245,158,11,.16);
        }

        .address-form {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 18px;
          margin-bottom: 18px;
        }

        .address-form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .address-form-grid .full {
          grid-column: 1 / -1;
        }

        .cart-list {
          display: grid;
          gap: 14px;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 16px;
        }

        .cart-item h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 1000;
        }

        .cart-item p {
          margin: 7px 0 0;
          color: #64748b;
          font-weight: 800;
        }

        .cart-price {
          text-align: right;
          font-weight: 1000;
          color: #16a34a;
          font-size: 18px;
        }

        .bill-row {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #e5e7eb;
          color: #475569;
          font-weight: 900;
        }

        .bill-row b {
          color: #111827;
        }

        .bill-total {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 22px 0;
          font-size: 23px;
          font-weight: 1000;
        }

        .note-box {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          border-radius: 18px;
          padding: 14px;
          line-height: 1.6;
          font-weight: 900;
          margin-bottom: 16px;
        }

        .order-actions {
          display: grid;
          gap: 12px;
        }

        .empty {
          background: white;
          border: 2px dashed #cbd5e1;
          border-radius: 28px;
          padding: 42px;
          text-align: center;
          color: #64748b;
          font-weight: 900;
          box-shadow: 0 16px 36px rgba(15,23,42,.06);
        }

        .empty h2 {
          margin: 0 0 10px;
          color: #111827;
        }

        @media(max-width: 1100px) {
          .hero,
          .checkout-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .order-summary {
            position: static;
          }
        }

        @media(max-width: 700px) {
          .checkout-page {
            padding: 14px;
          }

          .hero {
            padding: 26px;
            border-radius: 26px;
            flex-direction: column;
            align-items: flex-start;
          }

          .hero h1 {
            font-size: 34px;
          }

          .hero-actions,
          .btn {
            width: 100%;
          }

          .summary-grid,
          .address-form-grid {
            grid-template-columns: 1fr;
          }

          .section-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .cart-item {
            grid-template-columns: 1fr;
          }

          .cart-price {
            text-align: left;
          }
        }
      `}</style>

      <div className="checkout-page">
        <div className="hero">
          <div className="hero-content">
            <div className="hero-badge">✅ Checkout</div>

            <h1>
              Confirm your <span>STRIDE order</span>
            </h1>

            <p>
              Review selected products, delivery address and order notes before
              placing your material order.
            </p>
          </div>

          <div className="hero-actions">
            <Link className="btn btn-primary" to="/customer-cart">
              🧺 Back to Cart
            </Link>

            <Link className="btn btn-light" to="/customer-shop">
              🛒 Shop
            </Link>

            <Link className="btn btn-light" to="/home">
              🏠 Home
            </Link>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">📦</div>
            <h3>Products</h3>
            <h2>{cartItems.length}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🔢</div>
            <h3>Total Quantity</h3>
            <h2 className="blue">{totalQty}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <h3>Estimated Amount</h3>
            <h2 className="orange">₹{money(subtotal)}</h2>
          </div>
        </div>

        {loading ? (
          <div className="empty">Loading checkout...</div>
        ) : cartItems.length === 0 ? (
          <div className="empty">
            <h2>Your cart is empty</h2>
            <p>Add products before checkout.</p>

            <div style={{ marginTop: 18 }}>
              <Link className="btn btn-primary" to="/customer-shop">
                Go to Shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="checkout-grid">
            <div>
              <div className="customer-box">
                <h3>{summary?.customer?.name || user?.name || "Customer"}</h3>
                <p>
                  Customer ID:{" "}
                  <b>
                    {summary?.customer?.customerNumber ||
                      summary?.customer?.customerId ||
                      user?.customerNumber ||
                      user?.customerId ||
                      "-"}
                  </b>
                  <br />
                  Mobile: <b>{summary?.customer?.mobile || user?.mobile || "-"}</b>
                </p>
              </div>

              <div className="section">
                <div className="section-head">
                  <h2>Delivery Address</h2>

                  <button
                    className="btn btn-dark"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                  >
                    {showAddressForm ? "Close Form" : "+ Add Address"}
                  </button>
                </div>

                {addresses.length > 0 && (
                  <div className="address-grid">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={
                          selectedAddressId === address.id
                            ? "address-card active"
                            : "address-card"
                        }
                        onClick={() => selectAddress(address)}
                      >
                        <h3>{address.label || "Delivery Address"}</h3>

                        <p>{buildAddressText(address)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {showAddressForm && (
                  <div className="address-form">
                    <div className="address-form-grid">
                      <input
                        className="input"
                        placeholder="Label: Home / Shop / Site"
                        value={addressForm.label}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            label: e.target.value,
                          })
                        }
                      />

                      <input
                        className="input"
                        placeholder="Contact Person"
                        value={addressForm.contactPerson}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            contactPerson: e.target.value,
                          })
                        }
                      />

                      <input
                        className="input"
                        placeholder="Mobile optional"
                        value={addressForm.mobile}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            mobile: onlyDigits(e.target.value),
                          })
                        }
                      />

                      <input
                        className="input full"
                        placeholder="Address Line 1 *"
                        value={addressForm.addressLine1}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            addressLine1: e.target.value,
                          })
                        }
                      />

                      <input
                        className="input full"
                        placeholder="Address Line 2"
                        value={addressForm.addressLine2}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            addressLine2: e.target.value,
                          })
                        }
                      />

                      <input
                        className="input"
                        placeholder="Landmark"
                        value={addressForm.landmark}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            landmark: e.target.value,
                          })
                        }
                      />

                      <input
                        className="input"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            city: e.target.value,
                          })
                        }
                      />

                      <input
                        className="input"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            state: e.target.value,
                          })
                        }
                      />

                      <input
                        className="input"
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            pincode: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button className="btn btn-green" onClick={saveAddress}>
                        Save Address
                      </button>

                      <button
                        className="btn btn-gray"
                        onClick={() => {
                          resetAddressForm();
                          setShowAddressForm(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <textarea
                  className="textarea"
                  placeholder="Final delivery address *"
                  value={checkoutForm.deliveryAddress}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      deliveryAddress: e.target.value,
                    })
                  }
                />

                <textarea
                  className="textarea"
                  placeholder="Delivery note optional: site name, unloading instruction, preferred time..."
                  value={checkoutForm.deliveryNote}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      deliveryNote: e.target.value,
                    })
                  }
                />

                <select
                  className="select"
                  value={checkoutForm.paymentMode}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      paymentMode: e.target.value,
                    })
                  }
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CREDIT">Credit / Outstanding</option>
                </select>
              </div>

              <div className="section">
                <div className="section-head">
                  <h2>Products Selected</h2>
                  <Link className="btn btn-dark" to="/customer-cart">
                    Edit Cart
                  </Link>
                </div>

                <div className="cart-list">
                  {cartItems.map((item, index) => (
                    <div className="cart-item" key={getProductId(item) || index}>
                      <div>
                        <h3>{getName(item)}</h3>
                        <p>
                          {getCategory(item)} | Quantity: {getQuantity(item)}{" "}
                          {getUnit(item)}
                          <br />
                          Rate: ₹{money(getPrice(item))}
                          {getUnit(item) ? ` / ${getUnit(item)}` : ""}
                        </p>
                      </div>

                      <div className="cart-price">
                        ₹{money(getLineTotal(item))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-summary">
              <h2>Order Summary</h2>

              <div className="bill-row">
                <span>Products</span>
                <b>{cartItems.length}</b>
              </div>

              <div className="bill-row">
                <span>Total Quantity</span>
                <b>{totalQty}</b>
              </div>

              <div className="bill-row">
                <span>Estimated Subtotal</span>
                <b>₹{money(subtotal)}</b>
              </div>

              <div className="bill-row">
                <span>Payment Mode</span>
                <b>{checkoutForm.paymentMode}</b>
              </div>

              <div className="bill-total">
                <span>Total</span>
                <span>₹{money(subtotal)}</span>
              </div>

              <div className="note-box">
                Final billing may include transport charge, labour charge,
                discount, coupon and actual TMT weight adjustment by admin.
              </div>

              <div className="order-actions">
                <button
                  className="btn btn-primary"
                  onClick={placeOrder}
                  disabled={placing}
                >
                  {placing ? "Placing Order..." : "Place Order"}
                </button>

                <Link className="btn btn-dark" to="/customer-cart">
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

export default CustomerCheckout;