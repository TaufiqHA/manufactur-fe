// frontend/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';

// Utility function to get token from localStorage
const getAuthToken = () => {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    return user.token; // Assuming the login response includes a token
  }
  return null;
};

// Utility function to convert SQLite boolean values (0/1) to JavaScript booleans
const convertSqliteBooleans = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  // Skip conversion for specific numeric fields that should remain as numbers
  const numericFieldsToPreserve = [
    "totalDowntimeMinutes",
    "qtyPerUnit",
    "procurementQty",
    "totalQty",
    "qtyPerParent",
    "totalNeeded",
    "completedQty",
    "totalProduced",
    "consumedQty",
    "quantity",
    "qtySet",
    "warehouseQty",
    "shippedQty",
    "produced",
    "available",
  ];

  const converted = { ...obj };
  for (const key in converted) {
    if (
      !numericFieldsToPreserve.includes(key) &&
      typeof converted[key] === 'number' &&
      (converted[key] === 0 || converted[key] === 1)
    ) {
      converted[key] = Boolean(converted[key]);
    } else if (typeof converted[key] === 'object' && converted[key] !== null) {
      converted[key] = convertSqliteBooleans(converted[key]);
    }
  }
  return converted;
};

// Utility function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle different response types
    if (response.status === 204) {
      // No content response
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || `API request failed: ${response.status}`;
      throw new Error(errorMsg);
    }

    // Convert SQLite boolean values (0/1) to JavaScript booleans (false/true)
    const convertedData = convertSqliteBooleans(data);

    // Normalize response format - always return data array
    if (Array.isArray(convertedData)) {
      // Already an array, return as-is
      return convertedData;
    }

    if (convertedData.data !== undefined) {
      // Has pagination wrapper, extract data
      return Array.isArray(convertedData.data) ? convertedData.data : convertedData.data;
    }

    // Fallback: return the whole response
    return convertedData;
  } catch (error) {
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    return response.json();
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/projects?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/projects/${id}`);
  },
  
  create: async (project) => {
    return apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },
  
  update: async (id, project) => {
    return apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// Materials API
export const materialsAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/materials?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/materials/${id}`);
  },
  
  create: async (material) => {
    return apiRequest('/materials', {
      method: 'POST',
      body: JSON.stringify(material),
    });
  },
  
  update: async (id, material) => {
    return apiRequest(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(material),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/materials/${id}`, {
      method: 'DELETE',
    });
  },
  
  adjustStock: async (id, amount) => {
    return apiRequest(`/materials/${id}/adjust-stock`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    });
  },
};

// Machines API
export const machinesAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/machines?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/machines/${id}`);
  },
  
  create: async (machine) => {
    return apiRequest('/machines', {
      method: 'POST',
      body: JSON.stringify(machine),
    });
  },
  
  update: async (id, machine) => {
    return apiRequest(`/machines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(machine),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/machines/${id}`, {
      method: 'DELETE',
    });
  },
  
  toggleMaintenance: async (id) => {
    return apiRequest(`/machines/${id}/toggle-maintenance`, {
      method: 'PUT',
    });
  },
};

// Project Items API
export const projectItemsAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/project-items?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/project-items/${id}`);
  },
  
  getByProjectId: async (projectId) => {
    return apiRequest(`/project-items/project/${projectId}`);
  },
  
  create: async (item) => {
    return apiRequest('/project-items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },
  
  update: async (id, item) => {
    return apiRequest(`/project-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/project-items/${id}`, {
      method: 'DELETE',
    });
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/tasks?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/tasks/${id}`);
  },
  
  getByProjectId: async (projectId) => {
    return apiRequest(`/tasks/project/${projectId}`);
  },
  
  getByItemId: async (itemId) => {
    return apiRequest(`/tasks/item/${itemId}`);
  },
  
  create: async (task) => {
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },
  
  update: async (id, task) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

// Production Logs API
export const productionLogsAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/production-logs?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/production-logs/${id}`);
  },
  
  getByTaskId: async (taskId) => {
    return apiRequest(`/production-logs/task/${taskId}`);
  },
  
  getByProjectId: async (projectId) => {
    return apiRequest(`/production-logs/project/${projectId}`);
  },
  
  create: async (log) => {
    return apiRequest('/production-logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  },
  
  update: async (id, log) => {
    return apiRequest(`/production-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(log),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/production-logs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API
export const usersAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/users?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/users/${id}`);
  },
  
  getByUsername: async (username) => {
    return apiRequest(`/users/username/${username}`);
  },
  
  create: async (user) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },
  
  update: async (id, user) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Suppliers API
export const suppliersAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/suppliers?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/suppliers/${id}`);
  },
  
  create: async (supplier) => {
    return apiRequest('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    });
  },
  
  update: async (id, supplier) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplier),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  },
};

// RFQs API
export const rfqsAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/rfqs?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/rfqs/${id}`);
  },
  
  create: async (rfq) => {
    return apiRequest('/rfqs', {
      method: 'POST',
      body: JSON.stringify(rfq),
    });
  },
  
  update: async (id, rfq) => {
    return apiRequest(`/rfqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rfq),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/rfqs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Purchase Orders API
export const purchaseOrdersAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/purchase-orders?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/purchase-orders/${id}`);
  },
  
  create: async (po) => {
    return apiRequest('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(po),
    });
  },
  
  update: async (id, po) => {
    return apiRequest(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(po),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/purchase-orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Receiving Goods API
export const receivingGoodsAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/receiving-goods?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/receiving-goods/${id}`);
  },
  
  create: async (receiving) => {
    return apiRequest('/receiving-goods', {
      method: 'POST',
      body: JSON.stringify(receiving),
    });
  },
  
  update: async (id, receiving) => {
    return apiRequest(`/receiving-goods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(receiving),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/receiving-goods/${id}`, {
      method: 'DELETE',
    });
  },
};

// Delivery Orders API
export const deliveryOrdersAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/delivery-orders?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/delivery-orders/${id}`);
  },
  
  create: async (deliveryOrder) => {
    return apiRequest('/delivery-orders', {
      method: 'POST',
      body: JSON.stringify(deliveryOrder),
    });
  },
  
  update: async (id, deliveryOrder) => {
    return apiRequest(`/delivery-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deliveryOrder),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/delivery-orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Sub-assemblies API
export const subAssembliesAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/sub-assemblies?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/sub-assemblies/${id}`);
  },
  
  getByItemId: async (itemId) => {
    return apiRequest(`/sub-assemblies/item/${itemId}`);
  },
  
  create: async (subAssembly) => {
    return apiRequest('/sub-assemblies', {
      method: 'POST',
      body: JSON.stringify(subAssembly),
    });
  },
  
  update: async (id, subAssembly) => {
    return apiRequest(`/sub-assemblies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subAssembly),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/sub-assemblies/${id}`, {
      method: 'DELETE',
    });
  },
};

// BOM Items API
export const bomItemsAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/bom-items?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/bom-items/${id}`);
  },
  
  getByItemId: async (itemId) => {
    return apiRequest(`/bom-items/item/${itemId}`);
  },
  
  create: async (bomItem) => {
    return apiRequest('/bom-items', {
      method: 'POST',
      body: JSON.stringify(bomItem),
    });
  },
  
  update: async (id, bomItem) => {
    return apiRequest(`/bom-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bomItem),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/bom-items/${id}`, {
      method: 'DELETE',
    });
  },
};

// Item Step Configs API
export const itemStepConfigsAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/item-step-configs?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/item-step-configs/${id}`);
  },
  
  getByItemId: async (itemId) => {
    return apiRequest(`/item-step-configs/item/${itemId}`);
  },
  
  create: async (config) => {
    return apiRequest('/item-step-configs', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
  
  update: async (id, config) => {
    return apiRequest(`/item-step-configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/item-step-configs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Machine Allocations API
export const machineAllocationsAPI = {
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/machine-allocations?page=${page}&limit=${limit}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/machine-allocations/${id}`);
  },
  
  getByStepConfigId: async (stepConfigId) => {
    return apiRequest(`/machine-allocations/step-config/${stepConfigId}`);
  },
  
  create: async (allocation) => {
    return apiRequest('/machine-allocations', {
      method: 'POST',
      body: JSON.stringify(allocation),
    });
  },
  
  update: async (id, allocation) => {
    return apiRequest(`/machine-allocations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(allocation),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/machine-allocations/${id}`, {
      method: 'DELETE',
    });
  },
};
