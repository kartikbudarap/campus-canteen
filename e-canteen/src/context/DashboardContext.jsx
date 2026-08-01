import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { io } from "socket.io-client";

// Create API instance outside the component to avoid recreation
const createAPI = () => {
  const baseURL = `${import.meta.env.VITE_API_URL}/api`;
  
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const request = async (endpoint, options = {}) => {
    const token = getToken();
    
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

export const DashboardProvider = ({ children, authToken }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadedToken, setLoadedToken] = useState(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const applyRealtimeOrder = useCallback((incomingOrder) => {
    if (!incomingOrder) return;
    const incomingId = incomingOrder._id || incomingOrder.id;
    if (!incomingId) return;

    setOrders((previous) => {
      const exists = previous.some((order) => (order._id || order.id) === incomingId);
      const next = exists
        ? previous.map((order) => (order._id || order.id) === incomingId ? incomingOrder : order)
        : [incomingOrder, ...previous];
      const revenue = next
        .filter((order) => order.status === 'completed')
        .reduce((sum, order) => sum + Number(order.total || 0), 0);
      setTotalRevenue(revenue);
      return next;
    });
  }, []);

  const replaceRealtimeOrders = useCallback((incomingOrders) => {
    if (!Array.isArray(incomingOrders)) return;
    setOrders(incomingOrders);
    setTotalRevenue(incomingOrders
      .filter((order) => order.status === 'completed')
      .reduce((sum, order) => sum + Number(order.total || 0), 0));
  }, []);
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
    
    const response = await api.get('/orders');
    const ordersData = response.data || response || [];
    
    setOrders(Array.isArray(ordersData) ? ordersData : []);
    
    const completedOrders = ordersData.filter(order => order.status === 'completed');
    const revenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    setTotalRevenue(revenue);
    
    return ordersData;
  } catch (error) {
    setError(error.message);
    throw error;
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
      applyRealtimeOrder(updatedOrder);
      return updatedOrder;
    } catch (error) {
      throw new Error(error.message || 'Failed to update order status');
    }
  }, [isAuthenticated, applyRealtimeOrder]);

  const getPickupPass = useCallback(async (orderId) => {
    const response = await api.get(`/orders/${orderId}/pickup-pass`);
    return response.data || response;
  }, []);

  const verifyPickup = useCallback(async (orderId, credential) => {
    const isPin = /^\d{6}$/.test(credential.trim());
    const response = await api.post(`/orders/${orderId}/verify-pickup`, isPin ? { pin: credential.trim() } : { token: credential.trim() });
    const updatedOrder = response.data || response;
    applyRealtimeOrder(updatedOrder);

    return updatedOrder;
  }, [applyRealtimeOrder]);
  const createOrder = useCallback(async (orderData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      
      // FIXED: Properly extract foodItem IDs from the order data
      const items = orderData.items.map(item => {
        // The foodItem ID should come directly from the item.foodItem field
        // or from the item itself if it's already the ID
        const foodItemId = item.foodItem || item._id || item.id;
        
        if (!foodItemId) {
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

      const response = await api.post('/orders', orderPayload);
      const newOrder = response.data || response;
      
      applyRealtimeOrder(newOrder);
      return newOrder;
    } catch (error) {
      throw new Error(error.message || 'Failed to create order');
    }
  }, [isAuthenticated, applyRealtimeOrder]);

  useEffect(() => {
    if (!authToken) {
      setRealtimeConnected(false);
      return undefined;
    }

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 8
    });

    socket.on('connect', () => setRealtimeConnected(true));
    socket.on('disconnect', () => setRealtimeConnected(false));
    socket.on('connect_error', () => setRealtimeConnected(false));
    socket.on('orders:snapshot', replaceRealtimeOrders);
    socket.on('order:created', applyRealtimeOrder);
    socket.on('order:updated', applyRealtimeOrder);

    return () => {
      socket.off('orders:snapshot', replaceRealtimeOrders);
      socket.off('order:created', applyRealtimeOrder);
      socket.off('order:updated', applyRealtimeOrder);
      socket.disconnect();
    };
  }, [applyRealtimeOrder, authToken, replaceRealtimeOrders]);

  // Recover automatically during a temporary socket outage; never require a page refresh.
  useEffect(() => {
    if (!authToken || realtimeConnected) return undefined;
    const interval = window.setInterval(() => {
      loadOrders().catch(() => {});
    }, 5000);
    return () => window.clearInterval(interval);
  }, [authToken, realtimeConnected, loadOrders]);
  // Load immediately after login and reload when a different account signs in.
  useEffect(() => {
    if (!authToken) {
      setOrders([]);
      setTotalRevenue(0);
      setLoadedToken(null);
      return;
    }
    if (loadedToken === authToken) return;

    const loadInitialData = async () => {
      try {
        await Promise.all([loadFoodItems(), loadOrders()]);
        setLoadedToken(authToken);
      } catch {
        // Individual loaders expose their own errors through context.
      }
    };

    loadInitialData();
  }, [authToken, loadedToken, loadFoodItems, loadOrders]);

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
    getPickupPass,
    verifyPickup,
    createOrder,
    isAuthenticated,
    realtimeConnected
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
    getPickupPass,
    verifyPickup,
    createOrder,
    isAuthenticated,
    realtimeConnected
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
