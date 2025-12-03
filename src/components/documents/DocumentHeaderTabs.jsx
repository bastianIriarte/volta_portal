import React from "react";

const DocumentHeaderTabs = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: "contenido", label: "Contenido" },
    ];

    return (
        <div className="border-b">
            <div className="flex gap-1 px-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`px-4 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                            activeTab === tab.id
                                ? 'border-blue-600 text-blue-600 bg-white'
                                : 'border-transparent text-gray-600 hover:text-gray-800 bg-gray-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DocumentHeaderTabs;