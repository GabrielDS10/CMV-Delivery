import React from 'react';

// Receba todas as props necessárias, incluindo as novas para edição
function ShoppingForm({
    itemName, setItemName, itemCategory, setItemCategory,
    itemQuantity, setItemQuantity, itemUnit, setItemUnit,
    itemPrice, setItemPrice, addPurchase, purchases, handleDeleteClick,
    // Novas props para edição
    editingPurchase, setEditingPurchase,
    editName, setEditName,
    editCategory, setEditCategory,
    editQuantity, setEditQuantity,
    editUnit, setEditUnit,
    editPrice, setEditPrice,
    handleEditClick, handleCancelEdit, handleSaveEdit
}) {
    return (
        <>
            {/* Formulário de Compras */}
            <section className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Registro de Compras Semanais</h2>
                <form onSubmit={addPurchase} className="space-y-4">
                    <div>
                        <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">Nome do Item:</label>
                        <input
                            type="text"
                            id="itemName"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="Ex: Arroz, Tomate"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="itemCategory" className="block text-sm font-medium text-gray-700 mb-1">Categoria (Opcional):</label>
                        <input
                            type="text"
                            id="itemCategory"
                            value={itemCategory}
                            onChange={(e) => setItemCategory(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="Ex: Grãos, Vegetais, Carnes"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="itemQuantity" className="block text-sm font-medium text-gray-700 mb-1">Quantidade:</label>
                            <input
                                type="number"
                                id="itemQuantity"
                                value={itemQuantity}
                                onChange={(e) => setItemQuantity(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                placeholder="Ex: 5"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="itemUnit" className="block text-sm font-medium text-gray-700 mb-1">Unidade:</label>
                            <select
                                id="itemUnit"
                                value={itemUnit}
                                onChange={(e) => setItemUnit(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
                            >
                                <option value="kg">Quilogramas (kg)</option>
                                <option value="litro">Litros (L)</option>
                                <option value="unidade">Unidade (un)</option>
                                <option value="pacote">Pacote (pct)</option>
                                <option value="grama">Gramas (g)</option>
                                <option value="ml">Mililitros (ml)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700 mb-1">Preço Total da Compra (R$):</label>
                        <input
                            type="number"
                            id="itemPrice"
                            value={itemPrice}
                            onChange={(e) => setItemPrice(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="Ex: 15.50"
                            step="0.01"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out font-semibold text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Adicionar Compra
                    </button>
                </form>
            </section>

            {/* Lista de Compras */}
            <section className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Minhas Compras</h2>
                {purchases.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhuma compra registrada ainda. Adicione uma ao lado!</p>
                ) : (
                    <ul className="space-y-4">
                        {purchases.map((purchase) => (
                            <li key={purchase.id} className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200 flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-semibold text-gray-800">{purchase.name}</p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Categoria:</span> {purchase.category || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Quantidade:</span> {purchase.quantity} {purchase.unit}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Preço Total:</span> R$ {purchase.price.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Registrado em: {purchase.createdAt ? new Date(purchase.createdAt.toDate()).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="flex space-x-2"> {/* Botões de Ação */}
                                    <button
                                        onClick={() => handleEditClick(purchase)}
                                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                        title="Editar Compra"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(purchase.id, 'purchase')}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                        title="Excluir Compra"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Modal/Formulário de Edição de Compra  */}
            {editingPurchase && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Compra: {editingPurchase.name}</h3>
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">Nome do Item:</label>
                                <input
                                    type="text"
                                    id="editName"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="editCategory" className="block text-sm font-medium text-gray-700 mb-1">Categoria (Opcional):</label>
                                <input
                                    type="text"
                                    id="editCategory"
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="editQuantity" className="block text-sm font-medium text-gray-700 mb-1">Quantidade:</label>
                                    <input
                                        type="number"
                                        id="editQuantity"
                                        value={editQuantity}
                                        onChange={(e) => setEditQuantity(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editUnit" className="block text-sm font-medium text-gray-700 mb-1">Unidade:</label>
                                    <select
                                        id="editUnit"
                                        value={editUnit}
                                        onChange={(e) => setEditUnit(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
                                        required
                                    >
                                        <option value="kg">Quilogramas (kg)</option>
                                        <option value="litro">Litros (L)</option>
                                        <option value="unidade">Unidade (un)</option>
                                        <option value="pacote">Pacote (pct)</option>
                                        <option value="grama">Gramas (g)</option>
                                        <option value="ml">Mililitros (ml)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="editPrice" className="block text-sm font-medium text-gray-700 mb-1">Preço Total da Compra (R$):</label>
                                <input
                                    type="number"
                                    id="editPrice"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default ShoppingForm;
