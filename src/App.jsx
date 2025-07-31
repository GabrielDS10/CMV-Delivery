import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
// Asuming these components are in the same directory as the original code
import Header from './components/Header.jsx';
import ShoppingForm from './components/ShoppingForm.jsx';
// CORREÇÃO: A linha abaixo foi alterada para importar o componente Dishes do arquivo correto
import Dishes from './components/DishesForm.jsx';
import Footer from './components/Footer.jsx';
import IfoodMenu from './components/IfoodMenu.jsx';
import ProfitReport from './components/ProfitReport.jsx';

// Defina firebaseConfig usando as variáveis de ambiente do Vite (import.meta.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Use o appId do objeto firebaseConfig
const appId = firebaseConfig.appId;
const initialAuthToken = null; // Mantenha como null se não estiver usando um token personalizado

function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('compras'); // 'compras', 'pratos', 'ifood' ou 'relatorio'
  // NEW STATE: State to control the development modal
  const [showDevelopmentModal, setShowDevelopmentModal] = useState(true);

  // Estados para Compras
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemUnit, setItemUnit] = useState('kg');
  const [itemPrice, setItemPrice] = useState('');
  const [purchases, setPurchases] = useState([]);

  // Estados para Edição de Compras (NOVOS ESTADOS)
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Estados para Pratos
  const [dishName, setDishName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [ingredientId, setIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');

  // Estados para Modais e Mensagens
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Função utilitária para converter unidades para uma base comum (gramas ou ml)
  const convertToBaseUnit = useCallback((quantity, unit) => {
    switch (unit) {
      case 'kg': return quantity * 1000;
      case 'litro': return quantity * 1000;
      case 'unidade': return quantity;
      case 'pacote': return quantity;
      case 'grama': return quantity;
      case 'ml': return quantity;
      default: return quantity;
    }
  }, []);

  // Inicializa o Firebase e a autenticação
  useEffect(() => {
    try {
      if (!firebaseConfig.projectId) {
        console.error("Firebase config is missing projectId. Check your .env.local file and VITE_ prefixes.");
        setMessage("Erro ao carregar o aplicativo. O ID do projeto Firebase não foi fornecido. Verifique seu arquivo .env.local e os prefixos VITE_.");
        setShowModal(true);
        return;
      }

      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          if (initialAuthToken) {
            try {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } catch (error) {
              console.error("Erro ao fazer login com token personalizado:", error);
              await signInAnonymously(firebaseAuth);
            }
          } else {
            await signInAnonymously(firebaseAuth);
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Erro ao inicializar Firebase:", error);
      setMessage("Erro ao carregar o aplicativo. Verifique a configuração do Firebase.");
      setShowModal(true);
    }
  }, [initialAuthToken]);

  // Escuta por mudanças nas compras do Firestore
  useEffect(() => {
    if (db && userId && isAuthReady) {
      const purchasesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/purchases`);
      const q = query(purchasesCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        items.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
        setPurchases(items);
      }, (error) => {
        console.error("Erro ao buscar compras:", error);
        setMessage("Erro ao carregar suas compras.");
        setShowModal(true);
      });

      return () => unsubscribe();
    }
  }, [db, userId, isAuthReady, appId]);

  // Escuta por mudanças nos pratos do Firestore
  useEffect(() => {
    if (db && userId && isAuthReady) {
      const dishesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/dishes`);
      const q = query(dishesCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        items.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
        setDishes(items);
      }, (error) => {
        console.error("Erro ao buscar pratos:", error);
        setMessage("Erro ao carregar seus pratos.");
        setShowModal(true);
      });

      return () => unsubscribe();
    }
  }, [db, userId, isAuthReady, appId]);

  // Função para adicionar uma nova compra
  const addPurchase = useCallback(async (e) => {
    e.preventDefault();
    if (!db || !userId) {
      setMessage("O aplicativo não está pronto. Tente novamente.");
      setShowModal(true);
      return;
    }

    if (!itemName || !itemQuantity || !itemPrice) {
      setMessage("Por favor, preencha todos os campos obrigatórios (Nome, Quantidade, Preço).");
      setShowModal(true);
      return;
    }

    const parsedQuantity = parseFloat(itemQuantity);
    const parsedPrice = parseFloat(itemPrice);

    if (isNaN(parsedQuantity) || isNaN(parsedPrice) || parsedQuantity <= 0 || parsedPrice <= 0) {
      setMessage("Quantidade e Preço devem ser números positivos.");
      setShowModal(true);
      return;
    }

    try {
      const purchasesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/purchases`);
      await addDoc(purchasesCollectionRef, {
        name: itemName,
        category: itemCategory,
        quantity: parsedQuantity,
        unit: itemUnit,
        price: parsedPrice,
        createdAt: serverTimestamp()
      });
      setMessage("Compra adicionada com sucesso!");
      setShowModal(true);
      setItemName('');
      setItemCategory('');
      setItemQuantity('');
      setItemPrice('');
      setItemUnit('kg');
    } catch (error) {
      console.error("Erro ao adicionar compra:", error);
      setMessage("Erro ao adicionar compra. Tente novamente.");
      setShowModal(true);
    }
  }, [db, userId, itemName, itemCategory, itemQuantity, itemUnit, itemPrice, appId]);

  // Funções para Edição de Compras
  const handleEditClick = useCallback((purchase) => {
    setEditingPurchase(purchase);
    setEditName(purchase.name);
    setEditCategory(purchase.category);
    setEditQuantity(purchase.quantity);
    setEditUnit(purchase.unit);
    setEditPrice(purchase.price);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingPurchase(null);
    setEditName('');
    setEditCategory('');
    setEditQuantity('');
    setEditUnit('');
    setEditPrice('');
  }, []);

  const handleSaveEdit = useCallback(async (e) => {
    e.preventDefault();
    if (!db || !userId || !editingPurchase) {
      setMessage("Erro: Banco de dados não pronto ou item de edição não selecionado.");
      setShowModal(true);
      return;
    }

    const parsedQuantity = parseFloat(editQuantity);
    const parsedPrice = parseFloat(editPrice);

    if (isNaN(parsedQuantity) || isNaN(parsedPrice) || parsedQuantity <= 0 || parsedPrice <= 0) {
      setMessage("Quantidade e Preço devem ser números positivos.");
      setShowModal(true);
      return;
    }

    try {
      const purchaseRef = doc(db, `artifacts/${appId}/users/${userId}/purchases`, editingPurchase.id);
      const updatedData = {
        name: editName,
        category: editCategory,
        quantity: parsedQuantity,
        unit: editUnit,
        price: parsedPrice,
        // Você pode adicionar um campo 'updatedAt: serverTimestamp()' aqui se quiser registrar a última atualização
      };

      await updateDoc(purchaseRef, updatedData);
      setMessage("Compra atualizada com sucesso!");
      setShowModal(true);
      handleCancelEdit();
    } catch (error) {
      console.error("Erro ao atualizar compra:", error);
      setMessage("Erro ao atualizar compra. Tente novamente.");
      setShowModal(true);
    }
  }, [db, userId, editingPurchase, editName, editCategory, editQuantity, editUnit, editPrice, handleCancelEdit, appId]);


  // Função para adicionar um novo prato
  const addDish = useCallback(async (e) => {
    e.preventDefault();
    if (!db || !userId) {
      setMessage("O aplicativo não está pronto. Tente novamente.");
      setShowModal(true);
      return;
    }

    if (!dishName || !sellingPrice) {
      setMessage("Por favor, preencha o nome do prato e o preço de venda.");
      setShowModal(true);
      return;
    }

    const parsedSellingPrice = parseFloat(sellingPrice);
    if (isNaN(parsedSellingPrice) || parsedSellingPrice <= 0) {
      setMessage("O preço de venda deve ser um número positivo.");
      setShowModal(true);
      return;
    }

    try {
      const dishesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/dishes`);
      await addDoc(dishesCollectionRef, {
        name: dishName,
        sellingPrice: parsedSellingPrice,
        ingredients: [],
        createdAt: serverTimestamp()
      });
      setMessage("Prato adicionado com sucesso!");
      setShowModal(true);
      setDishName('');
      setSellingPrice('');
    } catch (error) {
      console.error("Erro ao adicionar prato:", error);
      setMessage("Erro ao adicionar prato. Tente novamente.");
      setShowModal(true);
    }
  }, [db, userId, dishName, sellingPrice, appId]);

  // Função para adicionar ingrediente a um prato
  const addIngredientToDish = useCallback(async (e) => {
    e.preventDefault();
    if (!db || !userId || !selectedDish) {
      setMessage("Selecione um prato e certifique-se de que o aplicativo está pronto.");
      setShowModal(true);
      return;
    }

    if (!ingredientId || !ingredientQuantity) {
      setMessage("Por favor, selecione um ingrediente e informe a quantidade.");
      setShowModal(true);
      return;
    }

    const parsedIngredientQuantity = parseFloat(ingredientQuantity);
    if (isNaN(parsedIngredientQuantity) || parsedIngredientQuantity <= 0) {
      setMessage("A quantidade do ingrediente deve ser um número positivo.");
      setShowModal(true);
      return;
    }

    const selectedPurchase = purchases.find(p => p.id === ingredientId);
    if (!selectedPurchase) {
      setMessage("Ingrediente selecionado não encontrado nas suas compras.");
      setShowModal(true);
      return;
    }

    // Calcular o custo por unidade base (grama ou ml) do ingrediente
    const basePurchaseQuantity = convertToBaseUnit(selectedPurchase.quantity, selectedPurchase.unit);
    const costPerBaseUnit = selectedPurchase.price / basePurchaseQuantity;

    // Calcular o custo do ingrediente para o prato
    const ingredientCost = costPerBaseUnit * parsedIngredientQuantity;

    const newIngredient = {
      purchaseId: selectedPurchase.id,
      name: selectedPurchase.name,
      quantity: parsedIngredientQuantity,
      unit: selectedPurchase.unit === 'kg' ? 'grama' : (selectedPurchase.unit === 'litro' ? 'ml' : selectedPurchase.unit), // Armazena em unidade base para o prato
      cost: ingredientCost,
      originalUnit: selectedPurchase.unit, // Mantém a unidade original da compra para referência
      originalQuantity: selectedPurchase.quantity // Mantém a quantidade original da compra para referência
    };

    try {
      const dishRef = doc(db, `artifacts/${appId}/users/${userId}/dishes`, selectedDish.id);
      const updatedIngredients = [...(selectedDish.ingredients || []), newIngredient];
      await updateDoc(dishRef, { ingredients: updatedIngredients });

      // Atualiza o estado local do prato selecionado
      setSelectedDish(prev => ({
        ...prev,
        ingredients: updatedIngredients
      }));

      setMessage(`Ingrediente "${selectedPurchase.name}" adicionado ao prato "${selectedDish.name}" com sucesso!`);
      setShowModal(true);
      setIngredientId('');
      setIngredientQuantity('');
    } catch (error) {
      console.error("Erro ao adicionar ingrediente ao prato:", error);
      setMessage("Erro ao adicionar ingrediente ao prato. Tente novamente.");
      setShowModal(true);
    }
  }, [db, userId, selectedDish, ingredientId, ingredientQuantity, purchases, convertToBaseUnit, appId]);

  // Função para iniciar o processo de exclusão (abre o modal de confirmação)
  const handleDeleteClick = useCallback((id, type) => {
    setItemToDelete({ id, type });
    setShowConfirmModal(true);
  }, []);

  // Função para confirmar e executar a exclusão
  const confirmDelete = useCallback(async () => {
    if (!db || !userId || !itemToDelete) {
      setMessage("Não foi possível excluir o item. Tente novamente.");
      setShowModal(true);
      setShowConfirmModal(false);
      return;
    }

    try {
      let docRef;
      if (itemToDelete.type === 'purchase') {
        docRef = doc(db, `artifacts/${appId}/users/${userId}/purchases`, itemToDelete.id);
      } else if (itemToDelete.type === 'dish') {
        docRef = doc(db, `artifacts/${appId}/users/${userId}/dishes`, itemToDelete.id);
      } else {
        setMessage("Tipo de item para exclusão inválido.");
        setShowModal(true);
        setShowConfirmModal(false);
        return;
      }

      await deleteDoc(docRef);
      setMessage(`${itemToDelete.type === 'purchase' ? 'Compra' : 'Prato'} excluído com sucesso!`);
      setShowModal(true);
      setShowConfirmModal(false);
      setItemToDelete(null);
      setSelectedDish(null); // Limpa o prato selecionado se ele for excluído
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      setMessage("Erro ao excluir item. Tente novamente.");
      setShowModal(true);
      setShowConfirmModal(false);
    }
  }, [db, userId, itemToDelete, appId]);

  // Modal de mensagem personalizado
  const MessageModal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Aviso</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Entendi
        </button>
      </div>
    </div>
  );

  // Novo Modal de Confirmação
  const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmação</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );

  // NEW MODAL: Component for the development message
  const DevelopmentModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Atenção!</h3>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Este site está atualmente em desenvolvimento e pode conter funcionalidades incompletas ou erros.
          Agradecemos a sua compreensão enquanto trabalhamos para melhorá-lo.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Entendido
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-4 font-sans flex flex-col items-center">
      {/* Modais de Mensagem e Confirmação */}
      {showModal && <MessageModal message={message} onClose={() => setShowModal(false)} />}
      {showConfirmModal && (
        <ConfirmModal
          message={`Tem certeza que deseja excluir ${itemToDelete?.type === 'purchase' ? 'esta compra' : 'este prato'}? Esta ação não pode ser desfeita.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmModal(false);
            setItemToDelete(null);
          }}
        />
      )}
      {/* NEW MODAL: Development warning modal */}
      {showDevelopmentModal && <DevelopmentModal onClose={() => setShowDevelopmentModal(false)} />}

      {/* Header com as props */}
      <Header
        userId={userId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {activeTab === 'compras' && (
          <ShoppingForm
            itemName={itemName}
            setItemName={setItemName}
            itemCategory={itemCategory}
            setItemCategory={setItemCategory}
            itemQuantity={itemQuantity}
            setItemQuantity={setItemQuantity}
            itemUnit={itemUnit}
            setItemUnit={setItemUnit}
            itemPrice={itemPrice}
            setItemPrice={setItemPrice}
            addPurchase={addPurchase}
            purchases={purchases}
            handleDeleteClick={handleDeleteClick}
            // Novas props para edição de compras
            editingPurchase={editingPurchase}
            setEditingPurchase={setEditingPurchase}
            editName={editName}
            setEditName={setEditName}
            editCategory={editCategory}
            setEditCategory={setEditCategory}
            editQuantity={editQuantity}
            setEditQuantity={setEditQuantity}
            editUnit={editUnit}
            setEditUnit={setEditUnit}
            editPrice={editPrice}
            setEditPrice={setEditPrice}
            handleEditClick={handleEditClick}
            handleCancelEdit={handleCancelEdit}
            handleSaveEdit={handleSaveEdit}
          />
        )}

        {activeTab === 'pratos' && (
          <Dishes
            dishName={dishName}
            setDishName={setDishName}
            addDish={addDish}
            dishes={dishes}
            selectedDish={selectedDish}
            setSelectedDish={setSelectedDish}
            purchases={purchases}
            ingredientId={ingredientId}
            setIngredientId={setIngredientId}
            ingredientQuantity={ingredientQuantity}
            setIngredientQuantity={setIngredientQuantity}
            addIngredientToDish={addIngredientToDish}
            handleDeleteClick={handleDeleteClick}
            sellingPrice={sellingPrice}
            setSellingPrice={setSellingPrice}
          />
        )}
        {activeTab === 'ifood' && (
          <IfoodMenu
            dishes={dishes}
          />
        )}
        {activeTab === 'relatorio' && (
          <ProfitReport
            dishes={dishes}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
