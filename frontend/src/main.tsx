import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Reports from "./Reports";
import CreateOrder from "./CreateOrder";
import "./index.css";
import Login from "./Login";
import App from "./App";
import Dashboard from "./Dashboard";
import Products from "./Products";
import Categories from "./Categories";
import Orders from "./Orders";
import Invoices from "./Invoices";
import Customers from "./Customers";
import Staffs from "./Staffs";
import AssignOrder from "./AssignOrder";
import CreateInvoice from "./CreateInvoice";
import InvoiceView from "./InvoiceView";
import OrderData from "./OrderData";
import PaymentHistory from "./PaymentHistory";
import CollectPayment from "./CollectPayment";
import PayBill from "./PayBill";
import CustomerLedger from "./CustomerLedger";
import StaffDashboard from "./StaffDashboard";
import DeliveryManagement from "./DeliveryManagement";
import OutstandingReport from "./OutstandingReport";
import Inventory from "./Inventory";
import Suppliers from "./Suppliers";
import Purchases from "./Purchases";
import StockMovementReport from "./StockMovementReport";
import StaffAssignedOrders from "./StaffAssignedOrders";
import StaffDeliveries from "./StaffDeliveries";
import TransportPaymentReport from "./TransportPaymentReport";
import ProtectedRoute from "./ProtectedRoute";
import CustomerDashboard from "./CustomerDashboard";
import CustomerOrders from "./CustomerOrders";
import CustomerInvoices from "./CustomerInvoices";
import CustomerOutstanding from "./CustomerOutstanding";
import CustomerTrackDelivery from "./CustomerTrackDelivery";
import CustomerProfile from "./CustomerProfile";
import CustomerPoints from "./CustomerPoints";
import CustomerShop from "./CustomerShop";
import AdminCollectionReport from "./AdminCollectionReport";
import CustomerOutstandingReport from "./CustomerOutstandingReport";
import AdminFaceManagement from "./AdminFaceManagement";
import CustomerCart from "./CustomerCart";
import AdminRewards from "./AdminRewards";
import AdminRedemptions from "./AdminRedemptions";
import AdminOffers from "./AdminOffers";
import OfferCarousel from "./OfferCarousel";
import Home from "./Home";
import AdminOwnerMessage from "./AdminOwnerMessage";
import About from "./About";
import AdminGallery from "./AdminGallery";
import Contact from "./Contact";
import AdminWebsiteManagement from "./AdminWebsiteManagement";
import ScrollToTop from "./ScrollToTop";
import CustomerCheckout from"./CustomerCheckout";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        
      <Route
  path="/categories"
  element={<Categories />}
/>
<Route
  path="/admin-owner-message"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminOwnerMessage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin-gallery"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminGallery />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin-website"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminWebsiteManagement />
    </ProtectedRoute>
  }
/>
<Route path="/customer-checkout" element={<CustomerCheckout />} />
<Route path="/contact" element={<Contact />} />
<Route path="/about" element={<About />} />
<Route path="/home" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/orders" element={<Orders />} />
<Route path="/invoices" element={<Invoices />} />
<Route path="/reports" element={<Reports />} />
<Route path="/customers" element={<Customers />} />
<Route path="/create-order" element={<CreateOrder />} />
<Route path="/staffs" element={<Staffs />} />
<Route path="/assign-order" element={<AssignOrder />} />
<Route path="/create-invoice/:orderId" element={<CreateInvoice />} />
<Route path="/invoice-view/:id" element={<InvoiceView />} />
<Route path="/order-data" element={<OrderData />} />
<Route path="/payment-history" element={<PaymentHistory />} />
<Route path="/collect-payment/:orderId" element={<CollectPayment />} />
<Route path="/pay-bill" element={<PayBill />} />
<Route path="/view-invoice/:id" element={<InvoiceView />} />
<Route path="/customer-invoice/:id" element={<InvoiceView />} />
<Route
  path="/customer-ledger"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <CustomerLedger />
    </ProtectedRoute>
  }
/>
<Route path="/staff-dashboard" element={<StaffDashboard />} />
<Route path="/delivery-management" element={<DeliveryManagement />} />
<Route path="/outstanding-report" element={<OutstandingReport />} />
<Route path="/inventory" element={<Inventory />} />
<Route path="/suppliers" element={<Suppliers />} />
<Route path="/staff-dashboard" element={<StaffDashboard />} />
<Route path="/staff-assigned-orders" element={<StaffAssignedOrders />} />
<Route path="/staff-deliveries" element={<StaffDeliveries />} />
<Route path="/collection-report" element={<AdminCollectionReport />} />
<Route path="/admin-face-management" element={<AdminFaceManagement />} />
<Route
  path="/admin-offers"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminOffers />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin-rewards"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminRewards />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin-redemptions"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminRedemptions />
    </ProtectedRoute>
  }
/>
<Route
  path="/stock-movement-report"
  element={<StockMovementReport />}
/>
<Route
  path="/transport-payment-report"
  element={<TransportPaymentReport />}
/>
<Route
  path="/stock-movement-report"
  element={<StockMovementReport />}
/>
<Route
  path="/purchases"
  element={<Purchases />}
/>
<Route
  path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <Dashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/staff-dashboard"
  element={
    <ProtectedRoute allowedRoles={["STAFF"]}>
      <StaffDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/create-order"
  element={
    <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
      <CreateOrder />
    </ProtectedRoute>
  }
/>
<Route
  path="/customer-dashboard"
  element={
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <CustomerDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer-orders"
  element={
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <CustomerOrders />
    </ProtectedRoute>
  }
/>
<Route
  path="/customer-invoices"
  element={
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <CustomerInvoices />
    </ProtectedRoute>
  }
/>
<Route
  path="/customer-outstanding"
  element={
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <CustomerOutstanding />
    </ProtectedRoute>
  }
/>
<Route
  path="/customer-track-delivery"
  element={
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <CustomerTrackDelivery />
    </ProtectedRoute>
  }
/>
<Route
  path="/customer-profile"
  element={
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <CustomerProfile />
    </ProtectedRoute>
  }
/>
<Route
  path="/customer-points"
  element={
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <CustomerPoints />
    </ProtectedRoute>
  }
/>
<Route
  path="/customer-shop"
  element={
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <CustomerShop />
    </ProtectedRoute>
  }
/>
<Route
  path="/customer-cart"
  element={
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <CustomerCart />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer-outstanding-report"
  element={<CustomerOutstandingReport />}
/>


      </Routes>
    
    </BrowserRouter>
      
  </StrictMode>
);