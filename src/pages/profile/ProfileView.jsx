import { useState, useEffect } from "react";
import { User, Shield, Loader2 } from "lucide-react";
import { getMyProfile, updateMyProfile } from "../../services/myProfileService";
import { handleSnackbar } from "../../utils/messageHelpers";
import ProfileTab from "./components/ProfileTab";
import SecurityTab from "./components/SecurityTab";
import { useAuth } from "../../context/auth";

export default function ProfileView() {
  const { session, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const profileResponse = await getMyProfile();
      if (profileResponse.success) {
        setProfileData(profileResponse.data);
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      handleSnackbar("Error al cargar información del perfil", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await updateMyProfile(updatedData);
      if (response.success) {
        setProfileData(response.data);
        if (refreshSession) {
          await refreshSession();
        }
        handleSnackbar("Perfil actualizado correctamente", "success");
        return true;
      } else {
        handleSnackbar(response.message || "Error al actualizar perfil", "error");
        return false;
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      handleSnackbar("Error al actualizar perfil", "error");
      return false;
    }
  };

  const tabs = [
    { id: "profile", label: "Mi Perfil", icon: User },
    { id: "security", label: "Seguridad", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-bradford-navy mb-2">Mi Perfil</h2>
        <p className="text-bradford-navy/70">
          Gestiona tu información personal y seguridad de la cuenta
        </p>
      </div>

      {/* Tabs Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <nav className="flex flex-col sm:flex-row -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-l-4 sm:border-l-0 sm:border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 bg-blue-50 sm:bg-transparent"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 sm:hover:bg-transparent"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <ProfileTab
              profileData={profileData}
              onUpdate={handleUpdateProfile}
            />
          )}
          {activeTab === "security" && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}
