import { useAuth } from "../../context/auth";
import { Calendar } from "lucide-react";

export const WelcomeBanner = () => {
  const { session } = useAuth();
  const userName = session?.user?.name || "Usuario";

  const today = new Date();
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('es-CL', options);

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour >= 5 && hour < 12) return "Buenos Dias";
    if (hour >= 12 && hour < 20) return "Buenas Tardes";
    return "Buenas Noches";
  };

  return (
    <div className="flex items-start justify-between mb-2 bg-white border rounded-2xl p-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Aqui esta lo que esta pasando hoy
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl  border-gray-200">
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-600">{formattedDate}</span>
      </div>
    </div>
  );
};
