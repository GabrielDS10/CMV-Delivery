import React, { useState, useEffect } from 'react';

// Componente para o formulário de adicionar pratos
const AddDishForm = ({ dishName, setDishName, sellingPrice, setSellingPrice, addDish }) => (
    <>
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
                    placeholder="Ex: Hambúrguer Clássico"
                    required
                />
            </div>
            <div>
                <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda do Prato (R$):</label>
                <input
                    type="number"
                    id="sellingPrice"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Ex: 29.90"
                    step="0.01"
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-300 ease-in-out font-semibold text-lg shadow-md"
            >
                Adicionar Prato
            </button>
        </form>
    </>
);

// Componente para o formulário de adicionar ingredientes
const AddIngredientForm = ({ selectedDish, purchases, ingredientId, setIngredientId, ingredientQuantity, setIngredientQuantity, addIngredientToDish, onCancel }) => (
    <>
        <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-2xl font-bold text-gray-800">Ingredientes para "{selectedDish.name}"</h2>

        </div>
        <form onSubmit={addIngredientToDish} className="space-y-4">
            <div>
                <label htmlFor="ingredientId" className="block text-sm font-medium text-gray-700 mb-1">Ingrediente (das suas compras):</label>
                <select
                    id="ingredientId"
                    value={ingredientId}
                    onChange={(e) => setIngredientId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white transition"
                    required
                >
                    <option value="">Selecione um ingrediente</option>
                    {purchases.map(purchase => (
                        <option key={purchase.id} value={purchase.id}>
                            {purchase.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="ingredientQuantity" className="block text-sm font-medium text-gray-700 mb-1">Quantidade para o prato (em g, ml ou un):</label>
                <input
                    type="number"
                    id="ingredientQuantity"
                    value={ingredientQuantity}
                    onChange={(e) => setIngredientQuantity(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Ex: 150 (g), 200 (ml), 1 (un)"
                    step="0.01"
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out font-semibold text-lg shadow-md"
            >
                Adicionar Ingrediente
            </button>
            <button onClick={onCancel} className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition duration-300 ease-in-out font-semibold text-lg shadow-md">
                Cancelar
            </button>
        </form>
    </>
);

function Dishes({
    dishName, setDishName, addDish, dishes, selectedDish, setSelectedDish,
    purchases, ingredientId, setIngredientId, ingredientQuantity, setIngredientQuantity,
    addIngredientToDish, sellingPrice, setSellingPrice, editingDish, setEditingDish,
    handleUpdateDish, handleDeleteClick, handleEditIngredientClick
}) {

    // Estado local para os campos do modal de edição de prato
    const [editDishName, setEditDishName] = useState('');
    const [editSellingPrice, setEditSellingPrice] = useState('');

    // Efeito para preencher o formulário de edição quando um prato é selecionado para edição
    useEffect(() => {
        if (editingDish) {
            setEditDishName(editingDish.name);
            setEditSellingPrice(editingDish.sellingPrice || '');
        }
    }, [editingDish]);

    // Função para lidar com o clique no botão de edição de prato
    const handleEditDishClick = (dish) => {
        setEditingDish(dish);
    };

    // Função para cancelar a edição do prato
    const handleCancelEditDish = () => {
        setEditingDish(null);
    };

    // Função para salvar as alterações do prato
    const handleSaveEditDish = (e) => {
        e.preventDefault();
        handleUpdateDish({
            ...editingDish,
            name: editDishName,
            sellingPrice: parseFloat(editSellingPrice)
        });
    };

    return (
        <>
            {/* Coluna da Esquerda: Formulários */}
            <section className="bg-white shadow-lg rounded-xl p-6">
                {selectedDish ? (
                    <AddIngredientForm
                        selectedDish={selectedDish}
                        purchases={purchases}
                        ingredientId={ingredientId}
                        setIngredientId={setIngredientId}
                        ingredientQuantity={ingredientQuantity}
                        setIngredientQuantity={setIngredientQuantity}
                        addIngredientToDish={addIngredientToDish}
                        onCancel={() => setSelectedDish(null)}
                    />
                ) : (
                    <AddDishForm
                        dishName={dishName}
                        setDishName={setDishName}
                        sellingPrice={sellingPrice}
                        setSellingPrice={setSellingPrice}
                        addDish={addDish}
                    />
                )}
            </section>

            {/* Coluna da Direita: Lista de Pratos */}
            <section className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Meus Pratos</h2>
                {dishes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum prato registrado ainda.</p>
                ) : (
                    <ul className="space-y-4">
                        {dishes.map((dish) => {
                            const totalDishCost = (dish.ingredients || []).reduce((sum, ing) => sum + (ing.cost || 0), 0);
                            const cmv = dish.sellingPrice > 0 ? (totalDishCost / dish.sellingPrice) * 100 : 0;

                            return (
                                <li key={dish.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-lg font-semibold text-gray-800 truncate pr-2">{dish.name}</p>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <button onClick={() => handleEditDishClick(dish)} title="Editar Prato" className="text-yellow-500 hover:text-yellow-700 transition p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5.207 14.793a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414l9-9a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-9 9z" /></svg></button>
                                            <button onClick={() => setSelectedDish(dish)} title="Adicionar Ingredientes" className="text-blue-500 hover:text-blue-700 transition p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></button>
                                            <button onClick={() => handleDeleteClick(dish.id, 'dish')} title="Excluir Prato" className="text-red-500 hover:text-red-700 transition p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    </div>
                                    <div className="text-sm space-y-1 mb-3">
                                        <p><span className="font-semibold">Custo:</span> R$ {totalDishCost.toFixed(2)}</p>
                                        <p><span className="font-semibold">Preço Venda:</span> R$ {parseFloat(dish.sellingPrice).toFixed(2)}</p>
                                        <p><span className="font-semibold">CMV:</span> {cmv.toFixed(2)}%</p>
                                    </div>

                                    {dish.ingredients && dish.ingredients.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600 mb-1">Ingredientes:</p>
                                            <ul className="space-y-1.5 text-sm text-gray-700">
                                                {dish.ingredients.map((ing, idx) => (
                                                    <li key={idx} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                                                        <span>{ing.name}: {ing.quantity} {ing.unit}</span>
                                                        <div className="flex items-center space-x-2">
                                                            <button onClick={() => handleEditIngredientClick(dish.id, ing, idx)} title="Editar Ingrediente" className="text-yellow-600 hover:text-yellow-800"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5.207 14.793a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414l9-9a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-9 9z" /></svg></button>
                                                            <button onClick={() => handleDeleteClick(dish.id, 'ingredient', { index: idx })} title="Remover Ingrediente" className="text-red-600 hover:text-red-800"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {/* Modal de Edição de Prato */}
            {editingDish && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Prato: {editingDish.name}</h3>
                        <form onSubmit={handleSaveEditDish} className="space-y-4">
                            <div>
                                <label htmlFor="editDishName" className="block text-sm font-medium text-gray-700 mb-1">Nome do Prato:</label>
                                <input
                                    type="text"
                                    id="editDishName"
                                    value={editDishName}
                                    onChange={(e) => setEditDishName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="editSellingPrice" className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda (R$):</label>
                                <input
                                    type="number"
                                    id="editSellingPrice"
                                    value={editSellingPrice}
                                    onChange={(e) => setEditSellingPrice(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button type="button" onClick={handleCancelEditDish} className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400">Cancelar</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Dishes;
