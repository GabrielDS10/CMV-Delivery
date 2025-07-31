import React from 'react';

// Receba as props necessárias para este componente
function Header({ userId, activeTab, setActiveTab }) {
    return (
        <>
            <header className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6 mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2"> CMV para Delivery</h1>
                <p className="text-lg text-gray-600">Gerencie suas compras e custos de pratos de forma eficiente.</p>
                {userId && (
                    <p className="text-sm text-gray-500 mt-2">
                        {/* ID do Usuário: <span className="font-mono bg-gray-100 px-2 py-1 rounded-md text-gray-700">{userId}</span> */}
                    </p>
                )}
            </header>

            {/* Navegação por abas */}
            <nav className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-2 mb-8 flex justify-around">
                <button
                    onClick={() => setActiveTab('compras')}
                    className={`py-3 px-6 rounded-lg text-lg font-semibold transition duration-300 ${activeTab === 'compras' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    Compras
                </button>
                <button
                    onClick={() => setActiveTab('pratos')}
                    className={`py-3 px-6 rounded-lg text-lg font-semibold transition duration-300 ${activeTab === 'pratos' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    Pratos
                </button>
                <button
                    onClick={() => setActiveTab('ifood')}
                    className={`py-3 px-6 rounded-lg text-lg font-semibold transition duration-300 ${activeTab === 'ifood' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    Cardápio iFood
                </button>
                <button
                    onClick={() => setActiveTab('relatorio')}
                    className={`py-3 px-6 rounded-lg text-lg font-semibold transition duration-300 ${activeTab === 'relatorio' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    Relatório de Lucro
                </button>
            </nav>
        </>
    );
}

export default Header;