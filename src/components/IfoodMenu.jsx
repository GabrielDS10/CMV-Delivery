import React from 'react';

function IfoodMenu({ dishes }) {
    const IFOOD_COMMISSION_PERCENTAGE = 0.27; // 27% de comissão do iFood

    return (
        <section className="bg-white shadow-lg rounded-xl p-6 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Cardápio iFood</h2>
            {dishes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum prato registrado ainda. Adicione pratos na aba "Pratos" para gerar o cardápio iFood.</p>
            ) : (
                <ul className="space-y-4">
                    {dishes.map((dish) => {
                        const originalSellingPrice = dish.sellingPrice || 0;
                        // Calcula o preço ajustado para o iFood
                        const ifoodSellingPrice = originalSellingPrice > 0
                            ? originalSellingPrice / (1 - IFOOD_COMMISSION_PERCENTAGE)
                            : 0;

                        return (
                            <li key={dish.id} className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
                                <p className="text-lg font-semibold text-gray-800">{dish.name}</p>
                                <p className="text-md text-gray-700">Preço de Venda Original: R$ {originalSellingPrice.toFixed(2)}</p>
                                <p className="text-md text-green-700 font-bold">Preço Sugerido iFood (com 27% de ajuste): R$ {ifoodSellingPrice.toFixed(2)}</p>
                                {originalSellingPrice === 0 && (
                                    <p className="text-sm text-red-500 mt-1">Defina um Preço de Venda para este prato na aba "Pratos" para calcular o preço iFood.</p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

export default IfoodMenu;
