// File: src/components/NavBar.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, useMatch } from "react-router-dom";
import { Menu, X, RefreshCcw, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "./ui/Button";
import { cls } from "../utils/format";
import { useAuth } from "../context/auth";

export default function NavBar({
  items = [],
  showReload,
  onReload,
  extraRight
}) {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { session, logout } = useAuth();
  const closeBtnRef = useRef(null);
  const drawerRef = useRef(null);
  const userMenuRef = useRef(null);
  console.log(session)
  // Información del usuario
  const user = session?.user || {};
  const userRole = session.user.roleName;
  const userName = user.name || user.email?.split('@')[0] || "Usuario";
  const userEmail = user.email;
  const location = useLocation();


  // Bloquear scroll al abrir el drawer
  useEffect(() => {
    if (open) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  // Cerrar menú de usuario al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Enfocar botón cerrar al abrir
  useEffect(() => {
    if (open) setTimeout(() => closeBtnRef.current?.focus(), 0);
  }, [open]);

  // Escape = cerrar
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Focus trap básico dentro del drawer
  useEffect(() => {
    const trap = (e) => {
      if (!open || e.key !== "Tab") return;
      const root = drawerRef.current;
      if (!root) return;
      const f = root.querySelectorAll(
        "button, a, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus(); e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus(); e.preventDefault();
      }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [open]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  // Componente mejorado para el área de usuario
  const UserArea = ({ mobile = false }) => {
    if (mobile) {
      // Versión móvil - botón simple para el drawer
      return (
        <div className="w-full space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-black text-sm font-medium truncate">{userName}</p>
              <p className="text-black/70 text-xs truncate">{userRole}</p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="w-full"
            onClick={handleLogout}
            icon={LogOut}
          >
            Cerrar Sesión
          </Button>
        </div>
      );
    }

    // Versión desktop - dropdown mejorado
    return (
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 px-3 py-0 rounded-lg text-black hover:bg-white/10 transition-colors border"
        >
          {/* Avatar */}
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>

          {/* Nombre de usuario - solo en pantallas grandes */}
          <span className=" lg:inline text-sm font-medium">{userName}</span>

          <ChevronDown className={cls(
            "w-4 h-4 transition-transform duration-200",
            userMenuOpen && "rotate-180"
          )} />
        </button>

        {/* Dropdown menu */}
        {userMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-black-200 py-2 z-50">
            {/* Header con info del usuario */}
            <div className="px-4 py-3 border-b border-black-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10  rounded-full flex items-center justify-center border-2">
                  <User className="w-5 h-5 text-black " />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold   truncate">
                    {userName}
                  </p>
                  <p className="text-xs  truncate">
                    {userEmail}
                  </p>
                  <span className="inline-block  py-0.5 text-xs   rounded-full mt-1">
                    {userRole}
                  </span>
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* Botón de logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 navbar border-b border-black/10">
      {/* Top bar - mantengo tu estructura original */}
      <div className="max-w-7xl mx-auto py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Hamburguesa solo móvil */}
          <button
            className=" inline-flex items-center justify-center rounded-xl border border-black/10 px-3 py-2 2xl:ml-[-40px]"
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
          >
            Menú <Menu className="w-5 h-5" />
          </button>
          <Link to={'/dashboard'}>
           <img
            src="/volta_logo.png"
            alt="Logo"
            className="h-[25px] object-contain hidden sm:block"
          />
          </Link>

        </div>

        <div className="flex items-center gap-2">
          {showReload && (
            <Button variant="ghost" onClick={onReload} icon={RefreshCcw}>
              Recargar
            </Button>
          )}
          <div className="hidden md:block">
            <UserArea />
          </div>
        </div>
      </div>

      {/* Menú de rutas - mantengo tu estructura original */}
      {/* <nav className="max-w-7xl mx-auto px-2 pb-2  md:flex flex-wrap gap-2">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.exact}
            className={({ isActive }) =>
              cls(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-primary)] transition-colors",
                isActive ? "bg-white text-[var(--text-primary)]" : "hover:bg-black/10"
              )
            }
          >
            {it.icon && <it.icon className="w-4 h-4" />}
            {it.label}
          </NavLink>
        ))}
      </nav> */}

      {/* Drawer móvil - mantengo tu estructura con mejoras solo en usuario */}
      {createPortal(
        <>
          <div
            className={cls("fixed inset-0 bg-black/50 transition-opacity z-40",
              open ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setOpen(false)}
          />
          <aside
            ref={drawerRef}
            className={cls(
              "fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform z-50 flex flex-col",
              open ? "translate-x-0" : "-translate-x-full"
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            {/* Header del drawer */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mx-auto">
                <img
                  src="/volta_logo.png"
                  alt="Logo"
                  className="h-[25px] object-contain"
                />
              </div>
              <button
                ref={closeBtnRef}
                className="inline-flex items-center justify-center rounded-xl border border-black/10 px-2.5 py-1.5"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navegación del drawer */}

            <nav className="flex-1 p-4 overflow-y-auto">
              {(() => {
                // Definir títulos de secciones
                const sections = {
                  inicio: "Inicio",
                  reportes: "Reportes",
                  administracion: "Administración",
                  compras: "Compras",
                  ventas: "Ventas",
                  listados: "Mantenedores",
                  sistema: "Sistema"
                };

                // Agrupar items por sección
                const groupedItems = items.reduce((acc, item) => {
                  const section = item.section || "otros";
                  if (!acc[section]) acc[section] = [];
                  acc[section].push(item);
                  return acc;
                }, {});

                // Renderizar secciones
                return Object.entries(groupedItems).map(([sectionKey, sectionItems]) => (
                  <div key={sectionKey} className="mb-6">
                    <h3 className="text-xs text-gray-500 uppercase font-semibold mb-3 px-3">
                      {sections[sectionKey] || sectionKey}
                    </h3>
                    {sectionItems.map((it) => {
                      const currentPath = location.pathname;

                      // ✅ Coincidencia exacta o subruta directa
                      const isActive =
                        currentPath === it.to ||
                        currentPath.startsWith(it.to + "/");

                      // 🔒 Evitar que "/dashboard" se marque cuando estás en subrutas
                      if (it.to === "/dashboard" && currentPath !== "/dashboard") {
                        return (
                          <Link
                            key={it.to}
                            to={it.to}
                            onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all mb-1 text-gray-600 hover:text-black hover:bg-gray-50"
                          >
                            {it.icon && <it.icon size={18} />}
                            <span className="text-sm">{it.label}</span>
                          </Link>
                        );
                      }

                      return (
                        <Link
                          key={it.to}
                          to={it.to}
                          onClick={() => setOpen(false)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all mb-1 ${isActive
                            ? "text-black bg-gray-100 border-r-2 border-black"
                            : "text-gray-600 hover:text-black hover:bg-gray-50"
                            }`}
                        >
                          {it.icon && <it.icon size={18} />}
                          <span className="text-sm">{it.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ));
              })()}
            </nav>



            {/* Área de usuario y acciones en móvil */}
            {/* <div className="p-4 border-t border-gray-200 space-y-3">
              <UserArea mobile />
            </div> */}
          </aside>
        </>,
        document.body
      )}
    </header>
  );
}