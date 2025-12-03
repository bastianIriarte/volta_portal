import React from 'react';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

const Error404 = () => {
  return (
    <div className="bg-gray-50 flex items-center justify-center px-4" style={{ height: "70vh" }}>
      <div className="text-center max-w-md w-full">
        {/* Error Badge */}
        <div className="inline-block bg-white text-black px-6 py-2 rounded-full text-sm font-semibold tracking-wide mb-8 shadow-sm border border-gray-200">
          ERROR 404
        </div>

        {/* Main Title */}
        <h1 className="text-gray-900 text-3xl md:text-4xl font-bold mb-4 leading-tight">
          Oops, Esta Página No Existe
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Te Llevamos De Vuelta.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            className="w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 border border-gray-200 flex items-center justify-center gap-2 hover:scale-105 transform shadow-sm"
            onClick={() => window.location.href = '/'}
            icon={Home}
          >
            Ir al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error404;