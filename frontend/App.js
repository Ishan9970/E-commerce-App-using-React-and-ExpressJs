import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Welcome from "./Welcome";
import ProductDetails from "./ProductDetails";
import Profile from "./Profile";
import UpdateProfile from "./UpdateProfile";
import AdminDashboard from "./AdminDashboard";
import InsertProduct from "./InsertProduct";
import UpdateProduct from "./UpdateProduct";
import DeleteProduct from "./DeleteProduct";
import Cart from "./Cart";
import Payment from "./Payment";
import "bootstrap/dist/css/bootstrap.min.css";

import { AuthContext, AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProfileProvider } from "./context/ProfileContext";

function ProtectedRoute({ children }) {
  const { token, userId } = useContext(AuthContext);
  if (!token || !userId) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { token, userId, role } = useContext(AuthContext);
  if (!token || !userId) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'admin') {
    return <Navigate to="/welcome" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />

              <Route
                path="/welcome"
                element={
                  <ProtectedRoute>
                    <Welcome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/product_details"
                element={
                  <ProtectedRoute>
                    <ProductDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/update_profile"
                element={
                  <ProtectedRoute>
                    <UpdateProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/insert_product"
                element={
                  <AdminRoute>
                    <InsertProduct />
                  </AdminRoute>
                }
              />
              <Route
                path="/update_product"
                element={
                  <AdminRoute>
                    <UpdateProduct />
                  </AdminRoute>
                }
              />
              <Route
                path="/delete_product"
                element={
                  <AdminRoute>
                    <DeleteProduct />
                  </AdminRoute>
                }
              />

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </CartProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
