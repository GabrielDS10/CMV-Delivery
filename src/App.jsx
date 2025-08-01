import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Header from './components/Header.jsx';
import ShoppingForm from './components/ShoppingForm.jsx';
import Dishes from './components/DishesForm.jsx';
import Footer from './components/Footer.jsx';
import IfoodMenu from './components/IfoodMenu.jsx';
import ProfitReport from './components/ProfitReport.jsx';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const appId = firebaseConfig.appId;

const EditIngredientModal = ({ data, onSave, onCancel }) => {
  const [quantity, setQuantity] = useState('');
  useEffect(() => { setQuantity(data?.ingredient?.quantity || ''); }, [data]);
  const handleSave = (e) => { e.preventDefault(); onSave(quantity); };
  if (!data) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Ingrediente: {data.ingredient.name}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="editIngredientQty" className="block text-sm font-medium text-gray-700 mb-1">Nova Quantidade ({data.ingredient.unit}):</label>
            <input type="number" id="editIngredientQty" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md" step="0.01" required />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400">Cancelar</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MessageModal = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Aviso</h3>
      <p className="text-gray-700 mb-6">{message}</p>
      <button onClick={onClose} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Entendi</button>
    </div>
  </div>
);

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmação</h3>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end space-x-4">
        <button onClick={onCancel} className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400">Cancelar</button>
        <button onClick={onConfirm} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">Confirmar Exclusão</button>
      </div>
    </div>
  </div>
);

function App() {
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('compras');
  const [purchases, setPurchases] = useState([]);
  const [dishes, setDishes] = useState([]);

  const [ifoodFee, setIfoodFee] = useState(() => {
    const savedFee = localStorage.getItem('ifoodFee');
    return savedFee !== null ? Number(savedFee) : 27;
  });
  const [markup, setMarkup] = useState(() => {
    const savedMarkup = localStorage.getItem('markup');
    return savedMarkup !== null ? Number(savedMarkup) : 200;
  });

  const [editingPurchase, setEditingPurchase] = useState(null);
  const [editingDish, setEditingDish] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemUnit, setItemUnit] = useState('kg');
  const [itemPrice, setItemPrice] = useState('');
  const [dishName, setDishName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [ingredientId, setIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const displayMessage = (msg) => {
    setMessage(msg);
    setShowModal(true);
  };

  const handleSaveIfoodSettings = useCallback((newFee, newMarkup) => {
    setIfoodFee(newFee);
    setMarkup(newMarkup);
    localStorage.setItem('ifoodFee', String(newFee));
    localStorage.setItem('markup', String(newMarkup));
    displayMessage("Configurações salvas com sucesso!");
  }, []);

  const convertToBaseUnit = useCallback((quantity, unit) => {
    const numQuantity = parseFloat(quantity);
    if (isNaN(numQuantity)) return 0;
    switch (unit) {
      case 'kg': return numQuantity * 1000;
      case 'litro': return numQuantity * 1000;
      default: return numQuantity;
    }
  }, []);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    setDb(firestore);
    onAuthStateChanged(auth, async (user) => {
      setUserId(user ? user.uid : (await signInAnonymously(auth)).user.uid);
      setIsAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isAuthReady || !db || !userId) return;
    const purchasesQuery = query(collection(db, `artifacts/${appId}/users/${userId}/purchases`));
    const unsubPurchases = onSnapshot(purchasesQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
      setPurchases(items);
    });

    const dishesQuery = query(collection(db, `artifacts/${appId}/users/${userId}/dishes`));
    const unsubDishes = onSnapshot(dishesQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
      setDishes(items);
    });
    return () => { unsubPurchases(); unsubDishes(); };
  }, [isAuthReady, db, userId, appId]);

  const addPurchase = useCallback(async (e) => {
    e.preventDefault();
    if (!db || !userId) return;
    const parsedPrice = parseFloat(itemPrice);
    if (!itemName || isNaN(parsedPrice) || parsedPrice <= 0) return;
    await addDoc(collection(db, `artifacts/${appId}/users/${userId}/purchases`), {
      name: itemName, category: itemCategory, quantity: parseFloat(itemQuantity), unit: itemUnit, price: parsedPrice, createdAt: serverTimestamp()
    });
    setItemName(''); setItemCategory(''); setItemQuantity(''); setItemUnit('kg'); setItemPrice('');
    displayMessage("Compra adicionada com sucesso!");
  }, [db, userId, itemName, itemCategory, itemQuantity, itemUnit, itemPrice, appId]);

  const handleEditClick = useCallback((purchase) => {
    setEditingPurchase(purchase);
    setEditName(purchase.name);
    setEditCategory(purchase.category || '');
    setEditQuantity(purchase.quantity);
    setEditUnit(purchase.unit);
    setEditPrice(purchase.price);
  }, []);

  const handleCancelEdit = useCallback(() => { setEditingPurchase(null); }, []);

  const handleSaveEdit = useCallback(async (e) => {
    e.preventDefault();
    if (!db || !userId || !editingPurchase) return;
    const parsedQuantity = parseFloat(editQuantity);
    const parsedPrice = parseFloat(editPrice);
    if (!editName || isNaN(parsedQuantity) || isNaN(parsedPrice)) return;
    const purchaseRef = doc(db, `artifacts/${appId}/users/${userId}/purchases`, editingPurchase.id);
    await updateDoc(purchaseRef, { name: editName, category: editCategory, quantity: parsedQuantity, unit: editUnit, price: parsedPrice });
    setEditingPurchase(null);
    displayMessage("Compra atualizada com sucesso!");
  }, [db, userId, editingPurchase, editName, editCategory, editQuantity, editUnit, editPrice, appId]);

  const addDish = useCallback(async (e) => {
    e.preventDefault();
    if (!db || !userId) return;
    const parsedSellingPrice = parseFloat(sellingPrice);
    if (!dishName || isNaN(parsedSellingPrice) || parsedSellingPrice <= 0) return;
    await addDoc(collection(db, `artifacts/${appId}/users/${userId}/dishes`), {
      name: dishName, sellingPrice: parsedSellingPrice, ingredients: [], createdAt: serverTimestamp()
    });
    setDishName(''); setSellingPrice('');
    displayMessage("Prato adicionado com sucesso!");
  }, [db, userId, dishName, sellingPrice, appId]);

  const handleUpdateDish = useCallback(async (updatedDish) => {
    if (!db || !userId || !updatedDish?.id) return;
    const dishRef = doc(db, `artifacts/${appId}/users/${userId}/dishes`, updatedDish.id);
    const { id, ...dataToUpdate } = updatedDish;
    await updateDoc(dishRef, dataToUpdate);
    setEditingDish(null);
    displayMessage("Prato atualizado com sucesso!");
  }, [db, userId, appId]);

  const addIngredientToDish = useCallback(async (e) => {
    e.preventDefault();
    if (!db || !userId || !selectedDish || !ingredientId) return;
    const parsedQty = parseFloat(ingredientQuantity);
    if (isNaN(parsedQty) || parsedQty <= 0) return;
    const purchase = purchases.find(p => p.id === ingredientId);
    if (!purchase) return;
    const baseQty = convertToBaseUnit(purchase.quantity, purchase.unit);
    const costPerUnit = purchase.price / baseQty;
    const newIngredient = {
      purchaseId: purchase.id, name: purchase.name, quantity: parsedQty,
      unit: purchase.unit === 'kg' ? 'g' : (purchase.unit === 'litro' ? 'ml' : purchase.unit),
      cost: costPerUnit * parsedQty,
    };
    const dishRef = doc(db, `artifacts/${appId}/users/${userId}/dishes`, selectedDish.id);
    await updateDoc(dishRef, { ingredients: [...(selectedDish.ingredients || []), newIngredient] });
    setIngredientId(''); setIngredientQuantity('');
    displayMessage("Ingrediente adicionado com sucesso!");
  }, [db, userId, selectedDish, ingredientId, ingredientQuantity, purchases, convertToBaseUnit, appId]);

  const handleUpdateIngredient = useCallback(async (newQuantity) => {
    if (!db || !userId || !editingIngredient) return;
    const { dishId, ingredient, index } = editingIngredient;
    const parsedNewQty = parseFloat(newQuantity);
    if (isNaN(parsedNewQty) || parsedNewQty <= 0) return;
    const dish = dishes.find(d => d.id === dishId);
    const purchase = purchases.find(p => p.id === ingredient.purchaseId);
    if (!dish || !purchase) return;
    const baseQty = convertToBaseUnit(purchase.quantity, purchase.unit);
    const costPerUnit = purchase.price / baseQty;
    const updatedIngredient = { ...ingredient, quantity: parsedNewQty, cost: costPerUnit * parsedNewQty };
    const updatedIngredients = [...dish.ingredients];
    updatedIngredients[index] = updatedIngredient;
    await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/dishes`, dishId), { ingredients: updatedIngredients });
    setEditingIngredient(null);
    displayMessage("Ingrediente atualizado com sucesso!");
  }, [db, userId, editingIngredient, dishes, purchases, convertToBaseUnit, appId]);

  const handleDeleteClick = useCallback((id, type, data) => { setItemToDelete({ id, type, data }); setShowConfirmModal(true); }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete || !db || !userId) return;
    const { id, type, data } = itemToDelete;
    try {
      if (type === 'purchase') {
        await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/purchases`, id));
        displayMessage('Compra excluída com sucesso!');
      } else if (type === 'dish') {
        await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/dishes`, id));
        displayMessage('Prato excluído com sucesso!');
      } else if (type === 'ingredient') {
        const dish = dishes.find(d => d.id === id);
        if (dish) {
          const updatedIngredients = dish.ingredients.filter((_, i) => i !== data.index);
          await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/dishes`, id), { ingredients: updatedIngredients });
          displayMessage('Ingrediente removido com sucesso!');
        }
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      displayMessage("Ocorreu um erro ao excluir.");
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, db, userId, appId, dishes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-4 font-sans flex flex-col items-center">
      {showModal && <MessageModal message={message} onClose={() => setShowModal(false)} />}
      {showConfirmModal && <ConfirmModal message={`Tem certeza que deseja excluir? Esta ação não pode ser desfeita.`} onConfirm={confirmDelete} onCancel={() => setShowConfirmModal(false)} />}
      <EditIngredientModal data={editingIngredient} onSave={handleUpdateIngredient} onCancel={() => setEditingIngredient(null)} />

      <Header userId={userId} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="w-full max-w-7xl mx-auto">
        {activeTab === 'compras' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ShoppingForm
              itemName={itemName} setItemName={setItemName}
              itemCategory={itemCategory} setItemCategory={setItemCategory}
              itemQuantity={itemQuantity} setItemQuantity={setItemQuantity}
              itemUnit={itemUnit} setItemUnit={setItemUnit}
              itemPrice={itemPrice} setItemPrice={setItemPrice}
              addPurchase={addPurchase}
              purchases={purchases}
              handleDeleteClick={handleDeleteClick}
              editingPurchase={editingPurchase}
              editName={editName} setEditName={setEditName}
              editCategory={editCategory} setEditCategory={setEditCategory}
              editQuantity={editQuantity} setEditQuantity={setEditQuantity}
              editUnit={editUnit} setEditUnit={setEditUnit}
              editPrice={editPrice} setEditPrice={setEditPrice}
              handleEditClick={handleEditClick}
              handleCancelEdit={handleCancelEdit}
              handleSaveEdit={handleSaveEdit}
            />
          </div>
        )}
        {activeTab === 'pratos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Dishes
              dishName={dishName} setDishName={setDishName} addDish={addDish} dishes={dishes}
              selectedDish={selectedDish} setSelectedDish={setSelectedDish} purchases={purchases}
              ingredientId={ingredientId} setIngredientId={setIngredientId}
              ingredientQuantity={ingredientQuantity} setIngredientQuantity={setIngredientQuantity}
              addIngredientToDish={addIngredientToDish} sellingPrice={sellingPrice}
              setSellingPrice={setSellingPrice} editingDish={editingDish} setEditingDish={setEditingDish}
              handleUpdateDish={handleUpdateDish} handleDeleteClick={handleDeleteClick}
              handleEditIngredientClick={(dishId, ing, idx) => setEditingIngredient({ dishId, ingredient: ing, index: idx })}
            />
          </div>
        )}
        {activeTab === 'ifood' && (
          <IfoodMenu
            dishes={dishes}
            initialFee={ifoodFee}
            initialMarkup={markup}
            onSaveSettings={handleSaveIfoodSettings}
          />
        )}
        {activeTab === 'relatorio' && <ProfitReport dishes={dishes} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
