// File: src/App.jsx
import React from "react";
import "./theme.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import RecoveryPassword from "./components/RecoveryPassword";
import ActivateAccount from "./components/ActivateAccount";
import ValidateCertificate from "./components/ValidateCertificate";
import AppShell from "./web_routes/AppShell";
import { AuthProvider, useAuth } from "./context/auth";
import ReportFullscreenView from "./pages/reports/ReportFullscreenView";




export default function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas publicas - redirigen al dashboard si ya hay sesion */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/recuperar-password" element={<PublicRoute><RecoveryPassword /></PublicRoute>} />
            <Route path="/primera-vez" element={<PublicRoute><ActivateAccount /></PublicRoute>} />
            {/* Validacion de certificados - siempre publico */}
            <Route path="/validar-certificado" element={<ValidateCertificate />} />
            {/* Reporte fullscreen sin menú (protegido pero sin AppShell) */}
            <Route
              path="/report-fullscreen"
              element={
                <ProtectedRoute>
                  <ReportFullscreenView />
                </ProtectedRoute>
              }
            />
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
