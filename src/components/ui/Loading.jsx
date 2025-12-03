const Loading = ({ text = 'Cargando...' }) => (
    <div className="justify-center bg-gray-50">
        <div className="flex flex-col items-center mx-auto">
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 text-sm">{text}</p>
        </div>
    </div>
);
export default Loading;
