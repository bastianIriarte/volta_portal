// File: src/App.jsx
import React from "react";
import "./theme.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import RecoveryPassword from "./components/RecoveryPassword";
import ActivateAccount from "./components/ActivateAccount";
import AppShell from "./web_routes/AppShell";
import { AuthProvider, useAuth } from "./context/auth";




export default function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Login siempre público */}
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-password" element={<RecoveryPassword />} />
            <Route path="/primera-vez" element={<ActivateAccount />} />
            {/* Todo lo demás protegido */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
