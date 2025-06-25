import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import UpdateProfile from "./pages/UpdateProfile";
import LoginPage from "./pages/LoginSignup";
import ChangePassword from "./pages/ChangePassword";
import Product from "./pages/Product";
import Glass from "./pages/Glass";
import HsnSac from "./pages/HsnSac";
import Project from "./pages/Project";
import ProductGroup from "./pages/ProductGroup";
import ProductType from "./pages/ProductType";
import Unit from "./pages/Unit";
import Lock from "./pages/Lock";
import Aluminium from "./pages/Aluminium";
import Hardware from "./pages/Hardware";
import QuotationEditor from "./pages/QuotationEditor";
import QuotationPrint  from "./pages/QuotationPrint";
import Finish from "./pages/Finish";

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}  
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="update-profile" element={<UpdateProfile />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="/product" element={<Product />} />
        <Route path="/glass" element={<Glass />} />
        <Route path="/hsn-sac-code" element={<HsnSac />} />
        <Route path="/project" element={<Project />} />
        <Route path="/product-group" element={<ProductGroup />} />
        <Route path="/product-type" element={<ProductType />} />
        <Route path="/unit" element={<Unit />} />
        <Route path="/lock" element={<Lock />} />
        <Route path="/aluminium" element={<Aluminium />} />
        <Route path="/hardware" element={<Hardware />} />
        <Route path="/quotation"           element={<QuotationEditor mode="list"   />} />
        <Route path="/quotation/add"       element={<QuotationEditor mode="add"    />} />
        <Route path="/quotation/:id/edit"  element={<QuotationEditor mode="edit"   />} />
        <Route path="/quotation/:id/print" element={<QuotationPrint />} />
        <Route path="/finish" element={<Finish />} />
      </Route>
    </Routes>
  );
}

export default App;
