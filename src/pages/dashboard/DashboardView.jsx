import React, { useEffect, useState } from "react";
import DashboardAdminView from "./admin/DashboardAdminView";
import DashboardParentView from "./parent/DashboardParentView";
import { useAuth } from "../../context/auth";
import { getDataDashboard } from "../../services/dashboardService";
import Loading from "../../components/ui/Loading";

export default function DashboardView() {
  const { session } = useAuth();
  const role = session?.user?.role;
  const [dataDashboard, setDataDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDataDashboard();
        if (res.success) {
          const data = res.data;
          setDataDashboard(data);
        } else {
          setDataDashboard(null);
        }
      } catch (e) {
        console.error("Error obteniendo datos del periodo:", e);
        setDataDashboard(null);
      } finally {
        setTimeout(() => {
          setLoading(false);

        }, 300);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando Dashboard...</p>
        </div>
      </div>
    );
  }


  // Mostrar dashboard según rol
  if (role === "parent") {
    return <DashboardParentView dataDashboard={dataDashboard} />;
  }

  return <DashboardAdminView dataDashboard={dataDashboard} />;
}
