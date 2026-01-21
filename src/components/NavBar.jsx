// File: src/components/NavBar.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, RefreshCcw, LogOut, ChevronDown, ChevronRight, User } from "lucide-react";
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
  const [expandedMenus, setExpandedMenus] = useState({});
  const { session, logout } = useAuth();

  const toggleSubmenu = (itemId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const closeBtnRef = useRef(null);
  const drawerRef = useRef(null);
  const userMenuRef = useRef(null);

  const user = session?.user || {};
  const userRole = session.user.roleName;
  const userName = user.name || user.email?.split('@')[0] || "Usuario";
  const userEmail = user.email;
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const location = useLocation();

  useEffect(() => {
    if (open) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => closeBtnRef.current?.focus(), 0);
  }, [open]);

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

  const UserArea = ({ mobile = false }) => {
    if (mobile) {
      return (
        <div className="w-full space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-sm">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium text-sm truncate">{userName}</p>
              <p className="text-gray-500 text-xs truncate">{userEmail}</p>
              <span className="inline-block mt-1 text-xs text-gray-500">{userRole}</span>
            </div>
          </div>
          <Link
            to="/dashboard/mi-perfil"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <User className="w-4 h-4" />
            Mi Perfil
          </Link>
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

    return (
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={cls(
            "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors",
            "hover:bg-gray-100",
            userMenuOpen && "bg-gray-100"
          )}
        >
          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-xs font-semibold">
            {userInitials}
          </div>
          <span className="hidden lg:block text-sm font-medium text-gray-700">{userName}</span>
          <ChevronDown className={cls(
            "w-4 h-4 text-gray-400 transition-transform duration-150",
            userMenuOpen && "rotate-180"
          )} />
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-sm">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  <span className="text-xs text-gray-400">{userRole}</span>
                </div>
              </div>
            </div>

            <div className="p-1">
              <Link
                to="/dashboard/mi-perfil"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Mi Perfil</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-8xl mx-auto h-14 flex items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 text-sm transition-colors"
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-5 h-5" />
            <span className="font-medium">Menú</span>
          </button>

          <Link to={'/dashboard'} className="hidden sm:flex items-center gap-2">
            <img
              src="/volta_logo.png"
              alt="Logo"
              className="h-6 object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {showReload && (
            <Button
              variant="ghost"
              onClick={onReload}
              className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="hidden md:inline">Recargar</span>
            </Button>
          )}
          <div className="hidden md:block">
            <UserArea />
          </div>
        </div>
      </div>

      {createPortal(
        <>
          <div
            className={cls(
              "fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300 z-40",
              open ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setOpen(false)}
          />
          <aside
            ref={drawerRef}
            className={cls(
              "fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-200 ease-out z-50 flex flex-col",
              open ? "translate-x-0" : "-translate-x-full"
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <img
                src="/volta_logo.png"
                alt="Logo"
                className="h-5 object-contain"
              />
              <button
                ref={closeBtnRef}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
              {(() => {
                const sections = {
                  inicio: "Inicio",
                  reportes: "Reportes",
                  administracion: "Administración",
                  compras: "Compras",
                  ventas: "Ventas",
                  listados: "Mantenedores",
                  sistema: "Sistema",
                  documentos: "Documentos",
                  certificados: "Certificados"
                };

                const groupedItems = items.reduce((acc, item) => {
                  const section = item.section || "otros";
                  if (!acc[section]) acc[section] = [];
                  acc[section].push(item);
                  return acc;
                }, {});

                return Object.entries(groupedItems).map(([sectionKey, sectionItems], sectionIndex) => (
                  <div key={sectionKey} className={cls(
                    "pb-4",
                    sectionIndex > 0 && "pt-4 border-t border-gray-100"
                  )}>
                    <h3 className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-2 px-4">
                      {sections[sectionKey] || sectionKey}
                    </h3>
                    <div className="space-y-1 px-2">
                      {sectionItems.map((it) => {
                        const currentPath = location.pathname;
                        const currentSearch = location.search;
                        const isActive = currentPath === it.to || currentPath.startsWith(it.to + "/");

                        if (it.children && it.children.length > 0) {
                          const isExpanded = expandedMenus[it.id];
                          const hasActiveChild = it.children.some(child =>
                            currentPath + currentSearch === child.to ||
                            (currentPath === child.to.split('?')[0] && currentSearch.includes(child.to.split('?')[1] || ''))
                          );

                          return (
                            <div key={it.id}>
                              <button
                                onClick={() => toggleSubmenu(it.id)}
                                className={cls(
                                  "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                                  hasActiveChild
                                    ? "text-gray-900 bg-blue-50 border border-blue-100"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  {it.icon && <it.icon size={18} className={hasActiveChild ? "text-blue-600" : "text-gray-400"} />}
                                  <span className="font-medium">{it.label}</span>
                                </div>
                                <ChevronRight
                                  size={16}
                                  className={cls(
                                    "text-gray-400 transition-transform duration-150",
                                    isExpanded && "rotate-90"
                                  )}
                                />
                              </button>
                              {isExpanded && (
                                <div className="ml-7 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-3">
                                  {it.children.map((child) => {
                                    const childIsActive =
                                      currentPath + currentSearch === child.to ||
                                      (currentPath === child.to.split('?')[0] && currentSearch.includes(child.to.split('?')[1] || ''));

                                    return (
                                      <Link
                                        key={child.id}
                                        to={child.to}
                                        onClick={() => setOpen(false)}
                                        className={cls(
                                          "block px-3 py-2 rounded-md text-sm transition-colors",
                                          childIsActive
                                            ? "text-blue-700 bg-blue-50 font-medium"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                        )}
                                      >
                                        {child.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (it.to === "/dashboard" && currentPath !== "/dashboard") {
                          return (
                            <Link
                              key={it.to}
                              to={it.to}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                              {it.icon && <it.icon size={18} className="text-gray-400" />}
                              <span className="font-medium">{it.label}</span>
                            </Link>
                          );
                        }

                        return (
                          <Link
                            key={it.to}
                            to={it.to}
                            onClick={() => setOpen(false)}
                            className={cls(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                              isActive
                                ? "text-blue-700 bg-blue-50 font-medium border border-blue-100"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            )}
                          >
                            {it.icon && <it.icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />}
                            <span className="font-medium">{it.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </nav>
          </aside>
        </>,
        document.body
      )}
    </header>
  );
}
