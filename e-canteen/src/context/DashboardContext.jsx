import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";

// Create API instance outside the component to avoid recreation
const createAPI = () => {
  const baseURL = 'http://localhost:5000/api';
  
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const request = async (endpoint, options = {}) => {
    const token = getToken();
    
    console.log('API Request:', endpoint, 'Token exists:', !!token);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${baseURL}${endpoint}`, config);
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.reload();
        throw new Error('Authentication failed. Please login again.');
      }
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  return {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
    patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
  };
};

// Create API instance once
const api = createAPI();

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('token');
    return !!token;
  }, []);

  // Memoized load functions
  const loadFoodItems = useCallback(async () => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      setLoading(true);
      setError(null);
      const response = await api.get('/food-items');
      const items = response.data || response || [];
      setFoodItems(Array.isArray(items) ? items : []);
      return items;
    } catch (error) {
      setError(error.message);
      console.error('Failed to load food items:', error);
      
      if (error.message.includes('Authentication failed') || error.message.includes('Not authenticated')) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.reload();
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadOrders = useCallback(async () => {
  try {
    if (!isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);
    
    // Get current user role from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userRole = currentUser.role;
    
    console.log('🔧 DASHBOARD CONTEXT - Current user:', {
      id: currentUser.id,
      name: currentUser.fullname,
      role: userRole,
      email: currentUser.email
    });
    
    // console.log('Loading orders for role:', userRole);
    
    const response = await api.get('/orders');
    const ordersData = response.data || response || [];
    
    // console.log('Orders loaded:', ordersData.length);
    // console.log('First order user:', ordersData[0]?.user?.fullname);
    
    setOrders(Array.isArray(ordersData) ? ordersData : []);
    
    const completedOrders = ordersData.filter(order => order.status === 'completed');
    const revenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    setTotalRevenue(revenue);
    
    return ordersData;
  } catch (error) {
    // ... error handling
  } finally {
    setLoading(false);
  }
}, [isAuthenticated]);

  const addFoodItem = useCallback(async (itemData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      const response = await api.post('/food-items', itemData);
      const newItem = response.data || response;
      setFoodItems(prev => [...prev, newItem]);
      return newItem;
    } catch (error) {
      throw new Error(error.message || 'Failed to add food item');
    }
  }, [isAuthenticated]);

  const updateFoodItem = useCallback(async (id, itemData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      const response = await api.put(`/food-items/${id}`, itemData);
      const updatedItem = response.data || response;
      setFoodItems(prev => prev.map(item => 
        (item._id === id || item.id === id) ? updatedItem : item
      ));
      return updatedItem;
    } catch (error) {
      throw new Error(error.message || 'Failed to update food item');
    }
  }, [isAuthenticated]);

  const deleteFoodItem = useCallback(async (id) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      await api.delete(`/food-items/${id}`);
      setFoodItems(prev => prev.filter(item => item._id !== id && item.id !== id));
    } catch (error) {
      throw new Error(error.message || 'Failed to delete food item');
    }
  }, [isAuthenticated]);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      const response = await api.patch(`/orders/${orderId}/status`, { status });
      const updatedOrder = response.data || response;
      setOrders(prev => prev.map(order => 
        (order._id === orderId || order.id === orderId) ? updatedOrder : order
      ));
      return updatedOrder;
    } catch (error) {
      throw new Error(error.message || 'Failed to update order status');
    }
  }, [isAuthenticated]);

  const createOrder = useCallback(async (orderData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      // console.log('Creating order with data:', orderData);
      
      // FIXED: Properly extract foodItem IDs from the order data
      const items = orderData.items.map(item => {
        // The foodItem ID should come directly from the item.foodItem field
        // or from the item itself if it's already the ID
        const foodItemId = item.foodItem || item._id || item.id;
        
        if (!foodItemId) {
          console.error('Invalid item missing foodItem ID:', item);
          throw new Error(`Food item ID is missing for item: ${item.name || 'Unknown item'}`);
        }

        return {
          foodItem: foodItemId,
          quantity: item.quantity || item.qty || 1
        };
      });

      const orderPayload = {
        items,
        total: orderData.total,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        specialInstructions: orderData.specialInstructions || ""
      };

      console.log('Order payload being sent to API:', orderPayload);

      const response = await api.post('/orders', orderPayload);
      const newOrder = response.data || response;
      
      setOrders(prev => [...prev, newOrder]);
      return newOrder;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw new Error(error.message || 'Failed to create order');
    }
  }, [isAuthenticated]);

  // Load data only once when component mounts and is authenticated
  useEffect(() => {
    const loadInitialData = async () => {
      if (isAuthenticated() && !dataLoaded) {
        console.log('Loading initial data...');
        try {
          await Promise.all([loadFoodItems(), loadOrders()]);
          setDataLoaded(true);
        } catch (error) {
          console.error('Failed to load initial data:', error);
        }
      }
    };

    loadInitialData();
  }, [isAuthenticated, dataLoaded, loadFoodItems, loadOrders]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    foodItems,
    orders,
    totalRevenue,
    loading,
    error,
    loadFoodItems,
    loadOrders,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    updateOrderStatus,
    createOrder,
    isAuthenticated
  }), [
    foodItems,
    orders,
    totalRevenue,
    loading,
    error,
    loadFoodItems,
    loadOrders,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    updateOrderStatus,
    createOrder,
    isAuthenticated
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};