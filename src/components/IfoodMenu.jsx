import React, { useState, useEffect } from 'react';

const IfoodMenu = ({ dishes, initialFee, initialMarkup, onSaveSettings }) => {
    // Estados locais para gerir os valores nos campos de texto.
    // São inicializados com os valores que vêm de App.jsx.
    const [localFee, setLocalFee] = useState(initialFee);
    const [localMarkup, setLocalMarkup] = useState(initialMarkup);

    // Este efeito garante que, se os valores em App.jsx mudarem,
    // os campos de texto aqui são atualizados.
    useEffect(() => {
        setLocalFee(initialFee);
        setLocalMarkup(initialMarkup);
    }, [initialFee, initialMarkup]);

    // Função que é chamada quando o botão "Salvar" é clicado.
    // Ela chama a função que veio de App.jsx para guardar os valores permanentemente.
    const handleSave = () => {
        onSaveSettings(localFee, localMarkup);
    };

    return (
        <div className="col-span-1 md:col-span-2 bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Cardápio iFood</h2>

            <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="ifoodFee" className="block text-sm font-medium text-gray-700 mb-1">
                            Taxa do iFood (%):
                        </label>
                        <input
                            type="number"
                            id="ifoodFee"
                            value={localFee}
                            onChange={(e) => setLocalFee(Number(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="markup" className="block text-sm font-medium text-gray-700 mb-1">
                            Margem de Lucro (Markup %):
                        </label>
                        <input
                            type="number"
                            id="markup"
                            value={localMarkup}
                            onChange={(e) => setLocalMarkup(Number(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: 200 para 3x o custo"
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                        Salvar Configurações
                    </button>
                </div>
            </div>

            {dishes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum prato cadastrado para exibir no cardápio.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dishes.map((dish) => {
                        // Os cálculos usam os valores guardados (initialFee, initialMarkup) para consistência.
                        const totalCost = (dish.ingredients || []).reduce((sum, ing) => sum + (ing.cost || 0), 0);
                        const markupMultiplier = 1 + (initialMarkup / 100);
                        const targetBasePrice = totalCost * markupMultiplier;
                        const feeDecimal = initialFee / 100;
                        const suggestedIfoodPrice = targetBasePrice / (1 - feeDecimal);
                        const currentSellingPrice = parseFloat(dish.sellingPrice);
                        const isPriceIdeal = Math.abs(currentSellingPrice - suggestedIfoodPrice) < 0.01;

                        return (
                            <div key={dish.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-800 truncate mb-3">{dish.name}</h3>
                                <div className="text-sm space-y-2 flex-grow">
                                    <p>Custo dos Ingredientes: <span className="font-semibold">R$ {totalCost.toFixed(2)}</span></p>
                                    <p>Preço de Venda Atual: <span className="font-semibold">R$ {currentSellingPrice.toFixed(2)}</span></p>
                                </div>
                                <div className="mt-3">
                                    {isPriceIdeal ? (
                                        <div className="p-3 bg-green-100 text-green-800 rounded-md text-center">
                                            <p className="font-bold text-lg flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                Preço Ideal!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-red-100 text-red-800 rounded-md">
                                            <p className="text-sm font-medium">Preço Sugerido ({initialFee}%):</p>
                                            <p className="font-bold text-xl">R$ {suggestedIfoodPrice.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default IfoodMenu;
