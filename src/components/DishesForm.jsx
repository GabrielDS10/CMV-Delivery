import React from 'react';

// Receba as props que são necessárias para este componente, incluindo sellingPrice e setSellingPrice
function Dishes({
    dishName, setDishName, addDish, dishes, selectedDish,
    setSelectedDish, purchases, ingredientId, setIngredientId,
    ingredientQuantity, setIngredientQuantity, addIngredientToDish,
    handleDeleteClick, // Já existente
    // Novas props para o preço de venda do prato
    sellingPrice, setSellingPrice
}) {
    return (
        <>
            {/* Formulário de Pratos */}
            <section className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Cadastro de Pratos</h2>
                <form onSubmit={addDish} className="space-y-4 mb-8">
                    <div>
                        <label htmlFor="dishName" className="block text-sm font-medium text-gray-700 mb-1">Nome do Prato:</label>
                        <input
                            type="text"
                            id="dishName"
                            value={dishName}
                            onChange={(e) => setDishName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="Ex: Hambúrguer Clássico, Salada Caesar"
                            required
                        />
                    </div>
                    {/* NOVO CAMPO: Preço de Venda do Prato */}
                    <div>
                        <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda do Prato (R$):</label>
                        <input
                            type="number"
                            id="sellingPrice"
                            value={sellingPrice}
                            onChange={(e) => setSellingPrice(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="Ex: 25.00"
                            step="0.01"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-300 ease-in-out font-semibold text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                        Adicionar Prato
                    </button>
                </form>

                {selectedDish && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Ingredientes a "{selectedDish.name}"</h3>
                        <form onSubmit={addIngredientToDish} className="space-y-4">
                            <div>
                                <label htmlFor="ingredientId" className="block text-sm font-medium text-gray-700 mb-1">Ingrediente (das suas compras):</label>
                                <select
                                    id="ingredientId"
                                    value={ingredientId}
                                    onChange={(e) => setIngredientId(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
                                    required
                                >
                                    <option value="">Selecione um ingrediente</option>
                                    {purchases.map(purchase => (
                                        <option key={purchase.id} value={purchase.id}>
                                            {purchase.name} ({purchase.quantity} {purchase.unit}) - R$ {purchase.price.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="ingredientQuantity" className="block text-sm font-medium text-gray-700 mb-1">Quantidade para o prato (em gramas/ml/unidades):</label>
                                <input
                                    type="number"
                                    id="ingredientQuantity"
                                    value={ingredientQuantity}
                                    onChange={(e) => setIngredientQuantity(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    placeholder="Ex: 150 (gramas), 200 (ml), 1 (unidade)"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition duration-300 ease-in-out font-semibold text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                            >
                                Adicionar Ingrediente
                            </button>
                        </form>
                    </div>
                )}
            </section>

            {/* Lista de Pratos */}
            <section className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Meus Pratos</h2>
                {dishes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum prato registrado ainda. Adicione um ao lado!</p>
                ) : (
                    <ul className="space-y-4">
                        {dishes.map((dish) => {
                            const totalDishCost = (dish.ingredients || []).reduce((sum, ing) => sum + (ing.cost || 0), 0);
                            // NOVO: Cálculo do CMV
                            const cmv = dish.sellingPrice && dish.sellingPrice > 0
                                ? (totalDishCost / dish.sellingPrice) * 100
                                : 0; // Se sellingPrice for 0 ou não definido, CMV é 0

                            return (
                                <li key={dish.id} className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-lg font-semibold text-gray-800">{dish.name}</p>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setSelectedDish(dish)}
                                                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                                title="Gerenciar Ingredientes"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(dish.id, 'dish')}
                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                                title="Excluir Prato"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-md text-gray-700 font-medium">Custo Total dos Ingredientes: R$ {totalDishCost.toFixed(2)}</p>
                                    {/* NOVO: Exibição do Preço de Venda e CMV */}
                                    <p className="text-md text-gray-700 font-medium">Preço de Venda: R$ {dish.sellingPrice ? dish.sellingPrice.toFixed(2) : 'N/A'}</p>
                                    <p className="text-md text-gray-700 font-medium">CMV: {cmv.toFixed(2)}%</p>

                                    {dish.ingredients && dish.ingredients.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-sm font-medium text-gray-600 mb-1">Ingredientes:</p>
                                            <ul className="list-disc list-inside text-sm text-gray-600">
                                                {dish.ingredients.map((ing, idx) => (
                                                    <li key={idx}>
                                                        {ing.name}: {ing.quantity} {ing.unit} (Custo: R$ {ing.cost.toFixed(2)})
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                        Registrado em: {dish.createdAt ? new Date(dish.createdAt.toDate()).toLocaleString() : 'N/A'}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </>
    );
}

export default Dishes;
