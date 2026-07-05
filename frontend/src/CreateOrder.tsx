import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function CreateOrder() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showCustomerResults, setShowCustomerResults] = useState(false);

  const [productSearch, setProductSearch] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [labourType, setLabourType] = useState<
    "NONE" | "LOADING" | "UNLOADING" | "BOTH"
  >("NONE");

  const [transportCharge, setTransportCharge] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    mobile: "",
    address: "",
  });

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

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (v: any) => Number(v || 0).toFixed(2);

  const loadData = async () => {
    const customerRes = await axios.get("http://localhost:5000/api/customers", {
      headers,
    });

    const productRes = await axios.get("http://localhost:5000/api/products", {
      headers,
    });

    setCustomers(customerRes.data.data || []);
    setProducts(
      (productRes.data.data || []).filter((p: any) => p.isActive !== false)
    );
  };

  const loadAddresses = async (customerId: string) => {
    if (!customerId) {
      setAddresses([]);
      setSelectedAddressId("");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/customer-addresses/customer/${customerId}`,
        { headers }
      );

      const list = res.data.data || [];
      setAddresses(list);

      const def = list.find((a: any) => a.isDefault) || list[0];
      setSelectedAddressId(def?.id || "");
    } catch {
      setAddresses([]);
      setSelectedAddressId("");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAddresses(selectedCustomerId);
  }, [selectedCustomerId]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const addressText = (a: any) =>
    [
      a?.label,
      a?.contactPerson,
      a?.mobile,
      a?.addressLine1,
      a?.addressLine2,
      a?.landmark,
      a?.city,
      a?.state,
      a?.pincode,
    ]
      .filter(Boolean)
      .join(", ");

  const deliveryAddressSnapshot =
    selectedAddress
      ? addressText(selectedAddress)
      : selectedCustomer?.address || "";

  const filteredCustomers = customers
    .filter((c) => {
      const text = `${c.name || ""} ${c.mobile || ""} ${
        c.customerNumber || ""
      }`.toLowerCase();

      return text.includes(customerSearch.toLowerCase());
    })
    .slice(0, 8);

  const filteredProducts = products.filter((p) => {
    const text = `${p.name || ""} ${p.sku || ""} ${
      p.category?.name || ""
    }`.toLowerCase();

    return text.includes(productSearch.toLowerCase());
  });

  const selectCustomer = (customer: any) => {
    setSelectedCustomerId(customer.id);
    setCustomerSearch(
      `${customer.name || ""} - ${customer.mobile || customer.customerNumber || ""}`
    );
    setShowCustomerResults(false);
  };

  const addProduct = (product: any) => {
    const existing = cart.find((i) => i.productId === product.id);

    if (existing) {
      setCart(
        cart.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: Number(i.quantity || 0) + 1 }
            : i
        )
      );
      return;
    }

    setCart([
      ...cart,
      {
        productId: product.id,
        name: product.name,
        unit: product.unit || "PCS",
        price: Number(product.price || 0),
        labourRate: Number(product.labourRate || 0),
        imageUrl: product.imageUrl,
        stock: product.stock,
        categoryName: product.category?.name || "",
        quantity: 1,
      },
    ]);
  };

  const increaseQty = (productId: string) => {
    setCart(
      cart.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Number(i.quantity || 0) + 1 }
          : i
      )
    );
  };

 const decreaseQty = (productId: string) => {
  setCart(
    cart
      .map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, Number(i.quantity || 1) - 1) }
          : i
      )
  );
};

  const updateQty = (productId: string, value: any) => {
  setCart(
    cart.map((i) =>
      i.productId === productId
        ? { ...i, quantity: value === "" ? "" : Number(value) }
        : i
    )
  );
};

  const removeItem = (productId: string) => {
    setCart(cart.filter((i) => i.productId !== productId));
  };

  const materialTotal = useMemo(
    () =>
      cart.reduce(
        (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
        0
      ),
    [cart]
  );

  const labourMultiplier =
    labourType === "BOTH"
      ? 2
      : labourType === "LOADING" || labourType === "UNLOADING"
      ? 1
      : 0;

  const labourAmount = useMemo(
    () =>
      cart.reduce(
        (sum, i) =>
          sum +
          Number(i.labourRate || 0) *
            Number(i.quantity || 0) *
            labourMultiplier,
        0
      ),
    [cart, labourMultiplier]
  );

  const grandTotal =
    materialTotal + labourAmount + Number(transportCharge || 0);

  const createQuickCustomer = async () => {
    if (!newCustomer.name || !newCustomer.mobile) {
      alert("Customer name and mobile required");
      return;
    }

    const res = await axios.post(
      "http://localhost:5000/api/customers",
      newCustomer,
      { headers }
    );

    const created = res.data.data;

    setCustomers([created, ...customers]);
    selectCustomer(created);
    setShowNewCustomer(false);
    setNewCustomer({ name: "", mobile: "", address: "" });

    alert("Customer created");
  };

  const saveAddress = async () => {
    if (!selectedCustomerId) {
      alert("Select customer first");
      return;
    }

    if (!addressForm.addressLine1) {
      alert("Address Line 1 is required");
      return;
    }

    const res = await axios.post(
      "http://localhost:5000/api/customer-addresses",
      {
        ...addressForm,
        customerId: selectedCustomerId,
      },
      { headers }
    );

    await loadAddresses(selectedCustomerId);

    if (res.data.data?.id) {
      setSelectedAddressId(res.data.data.id);
    }

    setShowAddressForm(false);
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

    alert("Address saved");
  };

  const createOrder = async () => {
    try {
      if (!selectedCustomerId) {
        alert("Select customer");
        return;
      }

      if (cart.length === 0) {
        alert("Add products");
        return;
      }

      if (!deliveryAddressSnapshot) {
        alert("Select or add delivery address");
        return;
      }

      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/orders",
        {
          customerId: selectedCustomerId,
          customerRecordId: selectedCustomerId,
          labourType,
          transportCharge: Number(transportCharge || 0),
          deliveryAddressId: selectedAddressId || undefined,
          deliveryAddressSnapshot,
          deliveryLocation: deliveryAddressSnapshot,
          deliveryNote,
          items: cart.map((i) => ({
            productId: i.productId,
            quantity: Number(i.quantity),
          })),
        },
        { headers }
      );

      alert("Order created successfully");

      setCart([]);
      setSelectedCustomerId("");
      setSelectedAddressId("");
      setAddresses([]);
      setCustomerSearch("");
      setProductSearch("");
      setLabourType("NONE");
      setTransportCharge("");
      setDeliveryNote("");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };
    return (
    <AdminLayout>
      <style>{`
        .page{min-height:100vh;background:#f3f4f6;padding:22px;color:#111827}
        .header{background:linear-gradient(135deg,#111827,#1f2937);color:white;border-radius:22px;padding:24px;margin-bottom:18px}
        .layout{display:grid;grid-template-columns:1fr 420px;gap:18px;align-items:start}
        .card{background:white;border-radius:20px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.08);margin-bottom:16px}
        .input{width:100%;padding:12px;border-radius:12px;border:1px solid #d1d5db;margin-bottom:10px}
        .btn{border:none;border-radius:12px;padding:11px 13px;background:#111827;color:white;font-weight:900;cursor:pointer}
        .green{background:#16a34a}.blue{background:#2563eb}.red{background:#dc2626}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .search-wrap{position:relative}
        .dropdown{position:absolute;top:48px;left:0;right:0;background:white;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.18);z-index:20;max-height:280px;overflow:auto}
        .drop-item{padding:12px;border-bottom:1px solid #f3f4f6;cursor:pointer}
        .drop-item:hover{background:#f3f4f6}
        .customer-card{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:14px;margin-top:10px}
        .address{border:1px solid #e5e7eb;border-radius:14px;padding:12px;margin-bottom:10px;cursor:pointer;background:#f9fafb}
        .address.active{border-color:#2563eb;background:#eff6ff}
        .products{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
        .product{background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:12px;display:flex;flex-direction:column;min-height:285px}
        .pimg{height:115px;border-radius:14px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:36px;overflow:hidden;margin-bottom:10px}
        .pimg img{width:100%;height:100%;object-fit:cover}
        .pname{font-weight:1000;min-height:40px}
        .price{color:#16a34a;font-weight:1000;margin:7px 0}
        .cart-item{border-bottom:1px solid #e5e7eb;padding:12px 0}
        .cart-item:last-child{border-bottom:none}
        .cart-top{display:flex;justify-content:space-between;gap:10px}
        .qty{display:grid;grid-template-columns:36px 1fr 36px;gap:7px;margin-top:10px}
        .qty button{border:none;border-radius:10px;background:#111827;color:white;font-size:18px;font-weight:1000}
        .qty input{height:38px;border:1px solid #d1d5db;border-radius:10px;text-align:center;font-weight:1000}
        .summary-row{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding:10px 0}
        .total{font-size:24px;font-weight:1000;color:#16a34a}
        .sticky-mobile{display:none}

        @media(max-width:950px){.layout{grid-template-columns:1fr}.products{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:650px){
          .page{padding:10px;padding-bottom:90px}
          .grid{grid-template-columns:1fr}
          .products{grid-template-columns:1fr 1fr;gap:10px}
          .product{min-height:260px;padding:10px}
          .pimg{height:90px}
          .layout{gap:10px}
          .sticky-mobile{display:block;position:fixed;left:10px;right:10px;bottom:10px;z-index:999}
          .sticky-mobile .btn{width:100%;padding:15px}
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>🧾 Create Order</h1>
          <p style={{ margin: "6px 0 0" }}>
            Search customer, choose address, add products, labour and transport.
          </p>
        </div>

        <div className="layout">
          <main>
            <div className="card">
              <h2>Customer</h2>

              <div className="grid">
                <div className="search-wrap">
                  <input
                    className="input"
                    placeholder="Search customer by name, mobile or ID"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerResults(true);
                    }}
                    onFocus={() => setShowCustomerResults(true)}
                  />

                  {showCustomerResults && customerSearch && (
                    <div className="dropdown">
                      {filteredCustomers.map((c) => (
                        <div
                          key={c.id}
                          className="drop-item"
                          onClick={() => selectCustomer(c)}
                        >
                          <b>{c.name}</b>
                          <br />
                          <small>{c.mobile || "-"} | {c.customerNumber || "No ID"}</small>
                        </div>
                      ))}

                      {filteredCustomers.length === 0 && (
                        <div className="drop-item">No customer found</div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  className="btn blue"
                  onClick={() => setShowNewCustomer(!showNewCustomer)}
                >
                  {showNewCustomer ? "Close" : "+ New Customer"}
                </button>
              </div>

              {showNewCustomer && (
                <div className="card" style={{ boxShadow: "none", border: "1px solid #e5e7eb" }}>
                  <input
                    className="input"
                    placeholder="Customer Name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Mobile"
                    value={newCustomer.mobile}
                    onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Basic Address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                  <button className="btn green" onClick={createQuickCustomer}>
                    Save Customer
                  </button>
                </div>
              )}

              {selectedCustomer && (
                <div className="customer-card">
                  <b>{selectedCustomer.name}</b>
                  <p style={{ margin: "5px 0" }}>
                    {selectedCustomer.mobile || "-"} | {selectedCustomer.customerNumber || "No ID"}
                  </p>
                  <small>Outstanding: ₹{money(selectedCustomer.outstandingAmount)}</small>
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="card">
                <h2>Delivery Address</h2>

                {addresses.map((a) => (
                  <div
                    key={a.id}
                    className={selectedAddressId === a.id ? "address active" : "address"}
                    onClick={() => setSelectedAddressId(a.id)}
                  >
                    <b>{a.label || "Address"}</b>
                    <div>{addressText(a)}</div>
                  </div>
                ))}

                {addresses.length === 0 && selectedCustomer.address && (
                  <div className="address active">
                    <b>Profile Address</b>
                    <div>{selectedCustomer.address}</div>
                  </div>
                )}

                <button
                  className="btn blue"
                  style={{ width: "100%" }}
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  {showAddressForm ? "Close Address Form" : "+ Add New Address"}
                </button>

                {showAddressForm && (
                  <div style={{ marginTop: 12 }}>
                    <div className="grid">
                      {Object.keys(addressForm).map((key) => (
                        <input
                          key={key}
                          className="input"
                          placeholder={key}
                          value={(addressForm as any)[key]}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, [key]: e.target.value })
                          }
                        />
                      ))}
                    </div>

                    <button className="btn green" style={{ width: "100%" }} onClick={saveAddress}>
                      Save Address To Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="card">
              <h2>Products</h2>
              <input
                className="input"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />

              <div className="products">
                {filteredProducts.map((p) => (
                  <div className="product" key={p.id}>
                    <div className="pimg">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : "📦"}
                    </div>
                    <div className="pname">{p.name}</div>
                    <small>{p.category?.name || "Product"}</small>
                    <div className="price">₹{money(p.price)} / {p.unit || "PCS"}</div>
                    <small>Stock: {p.stock}</small>
                    <button
                      className="btn green"
                      style={{ marginTop: "auto", width: "100%" }}
                      onClick={() => addProduct(p)}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </main>

          <aside>
            <div className="card">
              <h2>Cart</h2>

              {cart.map((item) => (
                <div className="cart-item" key={item.productId}>
                  <div className="cart-top">
                    <div>
                      <b>{item.name}</b>
                      <br />
                      <small>₹{money(item.price)} / {item.unit}</small>
                    </div>
                    <button className="btn red" onClick={() => removeItem(item.productId)}>
                      Remove
                    </button>
                  </div>

                  <div className="qty">
                    <button onClick={() => decreaseQty(item.productId)}>-</button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQty(item.productId, e.target.value)}
                    />
                    <button onClick={() => increaseQty(item.productId)}>+</button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && <p>No products added.</p>}
            </div>

            <div className="card">
              <h2>Labour & Transport</h2>

              <select
                className="input"
                value={labourType}
                onChange={(e) => setLabourType(e.target.value as any)}
              >
                <option value="NONE">No Labour</option>
                <option value="LOADING">Loading</option>
                <option value="UNLOADING">Unloading</option>
                <option value="BOTH">Loading + Unloading</option>
              </select>

              <input
                className="input"
                type="number"
                placeholder="Transport Charge"
                value={transportCharge}
                onChange={(e) => setTransportCharge(e.target.value)}
              />

              <textarea
                className="input"
                placeholder="Delivery / transport note"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
              />
            </div>

            <div className="card">
              <h2>Summary</h2>

              <div className="summary-row">
                <span>Material</span>
                <b>₹{money(materialTotal)}</b>
              </div>
              <div className="summary-row">
                <span>Labour</span>
                <b>₹{money(labourAmount)}</b>
              </div>
              <div className="summary-row">
                <span>Transport</span>
                <b>₹{money(transportCharge)}</b>
              </div>
              <div className="summary-row">
                <span>Total</span>
                <span className="total">₹{money(grandTotal)}</span>
              </div>

              <button
                className="btn green"
                style={{ width: "100%", marginTop: 12 }}
                onClick={createOrder}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Order"}
              </button>
            </div>
          </aside>
        </div>

        <div className="sticky-mobile">
          <button className="btn green" onClick={createOrder} disabled={loading}>
            {loading ? "Creating..." : `Create Order ₹${money(grandTotal)}`}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default CreateOrder;