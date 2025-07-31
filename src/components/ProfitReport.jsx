import React from 'react';

function ProfitReport({ dishes }) {
    // Calcula a margem de lucro para cada prato e ordena
    const sortedDishes = [...dishes].map(dish => {
        const totalDishCost = (dish.ingredients || []).reduce((sum, ing) => sum + (ing.cost || 0), 0);
        const profit = (dish.sellingPrice || 0) - totalDishCost;
        const profitMargin = (dish.sellingPrice && dish.sellingPrice > 0)
            ? (profit / dish.sellingPrice) * 100
            : -Infinity; // Pratos sem preço de venda ou com preço 0 terão margem muito baixa

        return {
            ...dish,
            totalDishCost,
            profit,
            profitMargin
        };
    }).sort((a, b) => b.profitMargin - a.profitMargin); // Ordena do maior lucro para o menor

    return (
        <section className="bg-white shadow-lg rounded-xl p-6 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Relatório de Lucro por Prato</h2>
            {dishes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum prato registrado ainda. Adicione pratos na aba "Pratos" para gerar o relatório de lucro.</p>
            ) : (
                <ul className="space-y-4">
                    {sortedDishes.map((dish) => (
                        <li key={dish.id} className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
                            <p className="text-lg font-semibold text-gray-800">{dish.name}</p>
                            <p className="text-md text-gray-700">Preço de Venda: R$ {dish.sellingPrice ? dish.sellingPrice.toFixed(2) : 'N/A'}</p>
                            <p className="text-md text-gray-700">Custo Total dos Ingredientes: R$ {dish.totalDishCost.toFixed(2)}</p>
                            <p className="text-md text-gray-700">Lucro por Unidade: R$ {dish.profit.toFixed(2)}</p>
                            <p className={`text-md font-bold ${dish.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Margem de Lucro: {dish.profitMargin.toFixed(2)}%
                            </p>
                            {dish.sellingPrice === 0 && (
                                <p className="text-sm text-red-500 mt-1">Defina um Preço de Venda para este prato para calcular a margem de lucro.</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default ProfitReport;
