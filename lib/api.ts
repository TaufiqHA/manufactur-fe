import { User, Project, Material, RFQ, Supplier } from '../types';

interface LoginResponse {
  user: User;
  token: string;
}

interface ErrorResponse {
  message?: string;
  errors?: {
    [key: string]: string[];
  };
}

/**
 * Convert API response field names to frontend field names
 */
const convertApiUserToFrontend = (apiUser: any): User => {
  let permissions: any = {};

  // Handle permissions - it might be a JSON string or already an object
  if (typeof apiUser.permissions === 'string') {
    try {
      permissions = JSON.parse(apiUser.permissions);
    } catch (e) {
      permissions = {};
    }
  } else if (apiUser.permissions) {
    permissions = apiUser.permissions;
  }

  return {
    id: apiUser.id.toString(), // Convert to string to match frontend type
    name: apiUser.name,
    username: apiUser.username || apiUser.email, // Use username if available, otherwise email
    email: apiUser.email,
    email_verified_at: apiUser.email_verified_at,
    created_at: apiUser.created_at,
    updated_at: apiUser.updated_at,
    role: apiUser.role || 'OPERATOR', // Default role if not provided
    permissions: permissions,
  };
};

/**
 * Convert frontend field names to API request field names
 */
const convertFrontendUserToApi = (frontendUser: Partial<User>, isCreate: boolean = false): any => {
  const apiUser: any = {
    name: frontendUser.name,
    email: frontendUser.email || frontendUser.username, // Use email if available, otherwise username
  };

  if (isCreate && (frontendUser as any).password) {
    apiUser.password = (frontendUser as any).password;
    apiUser.password_confirmation = (frontendUser as any).password;
  }

  if ('password' in frontendUser && (frontendUser as any).password) {
    apiUser.password = (frontendUser as any).password;
    apiUser.password_confirmation = (frontendUser as any).password;
  }

  return apiUser;
};

/**
 * Get all users API call
 */
export const getUsersAPI = async (token: string): Promise<User[]> => {
  const response = await fetch('http://localhost:8000/api/users', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch users');
  }

  const apiResponse = await response.json();
  // Handle paginated response - users are in the nested 'data.data' property
  const usersData = Array.isArray(apiResponse) ? apiResponse : (apiResponse.data?.data || []);
  return usersData.map(convertApiUserToFrontend);
};

/**
 * Get single user API call
 */
export const getUserAPI = async (id: string | number, token: string): Promise<User> => {
  const response = await fetch(`http://localhost:8000/api/users/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user');
  }

  const apiUser = await response.json();
  return convertApiUserToFrontend(apiUser);
};

/**
 * Create user API call
 */
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
  permissions?: any;
}

export const createUserAPI = async (userData: CreateUserData, token: string): Promise<User> => {
  // Create a copy of userData with proper role typing
  const userDataWithValidRole = {
    ...userData,
    role: userData.role as 'ADMIN' | 'OPERATOR' | 'MANAGER' || 'OPERATOR'
  };

  const apiUserData = convertFrontendUserToApi(userDataWithValidRole, true);

  const response = await fetch('http://localhost:8000/api/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiUserData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to create user');
    }
  }

  const createdUser = await response.json();
  return convertApiUserToFrontend(createdUser);
};

/**
 * Update user API call
 */
export const updateUserAPI = async (id: string | number, userData: Partial<User>, token: string): Promise<User> => {
  const apiUserData = convertFrontendUserToApi(userData);

  const response = await fetch(`http://localhost:8000/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiUserData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to update user');
    }
  }

  const updatedUser = await response.json();
  return convertApiUserToFrontend(updatedUser);
};

/**
 * Delete user API call
 */
export const deleteUserAPI = async (id: string | number, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete user');
  }

  // DELETE request typically doesn't return a body, so we just check the response status
  if (response.status !== 200 && response.status !== 204) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete user');
  }
};

/**
 * Login API call
 */
export const loginAPI = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch('http://localhost:8000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else if (response.status === 401) {
      // Unauthorized
      throw new Error(errorData.message || 'Invalid credentials');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Server error occurred');
    }
  }

  return response.json();
};

/**
 * Get user profile API call
 */
export const getProfileAPI = async (token: string): Promise<User> => {
  const response = await fetch('http://localhost:8000/api/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user profile');
  }

  return response.json();
};

/**
 * Logout API call
 */
export const logoutAPI = async (token: string): Promise<void> => {
  const response = await fetch('http://localhost:8000/api/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to logout');
  }

  return response.json();
};

/**
 * Convert API response field names to frontend field names
 */
const convertApiProjectToFrontend = (apiProject: any): Project => {
  return {
    id: apiProject.id,
    code: apiProject.code,
    name: apiProject.name,
    customer: apiProject.customer,
    startDate: apiProject.start_date || apiProject.startDate,
    deadline: apiProject.deadline,
    status: apiProject.status,
    progress: apiProject.progress,
    qtyPerUnit: apiProject.qty_per_unit || apiProject.qtyPerUnit,
    procurementQty: apiProject.procurement_qty || apiProject.procurementQty,
    totalQty: apiProject.total_qty || apiProject.totalQty,
    unit: apiProject.unit,
    isLocked: apiProject.is_locked || apiProject.isLocked,
  };
};

/**
 * Get all projects API call
 */
export const getProjectsAPI = async (token: string): Promise<Project[]> => {
  try {
    const response = await fetch('http://localhost:8000/api/projects', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch projects (${response.status})`);
    }

    const apiProjects = await response.json();
    return apiProjects.map(convertApiProjectToFrontend);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to backend. Is the API server running at http://localhost:8000?');
    }
    throw error;
  }
};

/**
 * Get single project API call
 */
export const getProjectAPI = async (id: string | number, token: string): Promise<Project> => {
  const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch project');
  }

  const apiProject = await response.json();
  return convertApiProjectToFrontend(apiProject);
};

/**
 * Create project API call
 */
export interface CreateProjectData {
  name: string;
  customer: string;
  startDate?: string;
  deadline: string;
  status?: string;
  progress?: number;
  qtyPerUnit: number;
  procurementQty: number;
  totalQty: number;
  unit: string;
  isLocked?: boolean;
}

export const createProjectAPI = async (projectData: CreateProjectData, token: string): Promise<Project> => {
  // Map frontend field names to backend field names
  const backendData = {
    name: projectData.name,
    code: `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`, // Generate code on frontend
    customer: projectData.customer,
    start_date: projectData.startDate || new Date().toISOString().split('T')[0],
    deadline: projectData.deadline,
    status: projectData.status || 'PLANNED',
    progress: projectData.progress || 0,
    qty_per_unit: projectData.qtyPerUnit,
    procurement_qty: projectData.procurementQty,
    total_qty: projectData.totalQty,
    unit: projectData.unit,
    is_locked: projectData.isLocked || false,
  };

  const response = await fetch('http://localhost:8000/api/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to create project');
    }
  }

  const createdProject = await response.json();
  return convertApiProjectToFrontend(createdProject);
};

/**
 * Update project API call
 */
export const updateProjectAPI = async (id: string | number, projectData: Partial<Project>, token: string): Promise<Project> => {
  // Map frontend field names to backend field names
  const backendData = {
    ...(projectData.name !== undefined && { name: projectData.name }),
    ...(projectData.code !== undefined && { code: projectData.code }),
    ...(projectData.customer !== undefined && { customer: projectData.customer }),
    ...(projectData.startDate !== undefined && { start_date: projectData.startDate }),
    ...(projectData.deadline !== undefined && { deadline: projectData.deadline }),
    ...(projectData.status !== undefined && { status: projectData.status }),
    ...(projectData.progress !== undefined && { progress: projectData.progress }),
    ...(projectData.qtyPerUnit !== undefined && { qty_per_unit: projectData.qtyPerUnit }),
    ...(projectData.procurementQty !== undefined && { procurement_qty: projectData.procurementQty }),
    ...(projectData.totalQty !== undefined && { total_qty: projectData.totalQty }),
    ...(projectData.unit !== undefined && { unit: projectData.unit }),
    ...(projectData.isLocked !== undefined && { is_locked: projectData.isLocked }),
  };

  const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to update project');
    }
  }

  const updatedProject = await response.json();
  return convertApiProjectToFrontend(updatedProject);
};

/**
 * Delete project API call
 */
export const deleteProjectAPI = async (id: string | number, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete project');
  }

  // DELETE request typically doesn't return a body, so we just check the response status
  if (response.status !== 200 && response.status !== 204) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete project');
  }
};

/**
 * Convert API response field names to frontend field names for Material
 */
const convertApiMaterialToFrontend = (apiMaterial: any): Material => {
  return {
    id: apiMaterial.id.toString(), // Convert to string to match frontend type
    code: apiMaterial.code,
    name: apiMaterial.name,
    unit: apiMaterial.unit,
    currentStock: apiMaterial.current_stock || apiMaterial.currentStock || 0,
    safetyStock: apiMaterial.safety_stock || apiMaterial.safetyStock || 0,
    pricePerUnit: parseFloat(apiMaterial.price_per_unit || apiMaterial.pricePerUnit || 0),
    category: apiMaterial.category,
  };
};

/**
 * Convert frontend field names to API request field names for Material
 */
const convertFrontendMaterialToApi = (frontendMaterial: Partial<Material>, isCreate: boolean = false): any => {
  const apiMaterial: any = {
    code: frontendMaterial.code,
    name: frontendMaterial.name,
    unit: frontendMaterial.unit,
    current_stock: frontendMaterial.currentStock,
    safety_stock: frontendMaterial.safetyStock,
    price_per_unit: frontendMaterial.pricePerUnit,
    category: frontendMaterial.category,
  };

  // Only include id if it's not for creation
  if (!isCreate && frontendMaterial.id) {
    apiMaterial.id = frontendMaterial.id;
  }

  return apiMaterial;
};

/**
 * Get all materials API call
 */
export const getMaterialsAPI = async (token: string): Promise<Material[]> => {
  const response = await fetch('http://localhost:8000/api/materials', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch materials');
  }

  const apiResponse = await response.json();
  // Handle both array response and paginated response
  const materialsData = Array.isArray(apiResponse) ? apiResponse : (apiResponse.data?.data || apiResponse.data || []);
  return materialsData.map(convertApiMaterialToFrontend);
};

/**
 * Get single material API call
 */
export const getMaterialAPI = async (id: string | number, token: string): Promise<Material> => {
  const response = await fetch(`http://localhost:8000/api/materials/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch material');
  }

  const apiMaterial = await response.json();
  return convertApiMaterialToFrontend(apiMaterial);
};

/**
 * Create material API call
 */
export interface CreateMaterialData {
  code: string;
  name: string;
  unit: string;
  current_stock: number;
  safety_stock: number;
  price_per_unit: number;
  category: 'RAW' | 'FINISHING' | 'HARDWARE';
}

export const createMaterialAPI = async (materialData: CreateMaterialData, token: string): Promise<Material> => {
  const response = await fetch('http://localhost:8000/api/materials', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(materialData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to create material');
    }
  }

  const createdMaterial = await response.json();
  return convertApiMaterialToFrontend(createdMaterial);
};

/**
 * Update material API call
 */
export const updateMaterialAPI = async (id: string | number, materialData: Partial<Material>, token: string): Promise<Material> => {
  const apiMaterialData = {
    code: materialData.code,
    name: materialData.name,
    unit: materialData.unit,
    current_stock: materialData.currentStock,
    safety_stock: materialData.safetyStock,
    price_per_unit: materialData.pricePerUnit,
    category: materialData.category,
  };

  const response = await fetch(`http://localhost:8000/api/materials/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiMaterialData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to update material');
    }
  }

  const updatedMaterial = await response.json();
  return convertApiMaterialToFrontend(updatedMaterial);
};

/**
 * Delete material API call
 */
export const deleteMaterialAPI = async (id: string | number, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/materials/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete material');
  }

  // DELETE request typically doesn't return a body, so we just check the response status
  if (response.status !== 200 && response.status !== 204) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete material');
  }
};

/**
 * Convert API response field names to frontend field names for RFQ
 */
const convertApiRfqToFrontend = (apiRfq: any): RFQ => {
  return {
    id: apiRfq.id.toString(), // Convert to string to match frontend type
    code: apiRfq.code,
    date: apiRfq.date,
    description: apiRfq.description,
    items: Array.isArray(apiRfq.items) ? apiRfq.items.map((item: any) => ({
      materialId: item.materialId?.toString() || item.material_id?.toString(),
      name: item.name,
      qty: item.qty || item.quantity,
      price: item.price
    })) : [],
    status: apiRfq.status
  };
};

/**
 * Convert frontend field names to API request field names for RFQ
 */
const convertFrontendRfqToApi = (frontendRfq: Partial<RFQ>, isCreate: boolean = false): any => {
  const apiRfq: any = {
    code: frontendRfq.code,
    date: frontendRfq.date,
    description: frontendRfq.description,
    status: frontendRfq.status,
  };

  // Only include items if they exist
  if (frontendRfq.items && Array.isArray(frontendRfq.items)) {
    apiRfq.items = frontendRfq.items.map(item => ({
      material_id: item.materialId,
      name: item.name,
      qty: item.qty,
      price: item.price
    }));
  }

  return apiRfq;
};

/**
 * Get all RFQs API call
 */
export const getRfqsAPI = async (token: string): Promise<RFQ[]> => {
  const response = await fetch('http://localhost:8000/api/rfqs', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch RFQs');
  }

  const apiResponse = await response.json();
  // Handle both array response and paginated response
  const rfqsData = Array.isArray(apiResponse) ? apiResponse : (apiResponse.data?.data || apiResponse.data || []);
  return rfqsData.map(convertApiRfqToFrontend);
};

/**
 * Get single RFQ API call
 */
export const getRfqAPI = async (id: string | number, token: string): Promise<RFQ> => {
  const response = await fetch(`http://localhost:8000/api/rfqs/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch RFQ with ID: ${id}`);
  }

  const apiRfq = await response.json();
  return convertApiRfqToFrontend(apiRfq);
};

/**
 * Create RFQ API call
 */
export interface CreateRfqData {
  code: string;
  date: string;
  description: string;
  status: 'DRAFT' | 'PO_CREATED';
  items: {
    material_id: string;
    name: string;
    qty: number;
    price?: number;
  }[];
}

export const createRfqAPI = async (rfqData: CreateRfqData, token: string): Promise<RFQ> => {
  const response = await fetch('http://localhost:8000/api/rfqs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rfqData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to create RFQ');
    }
  }

  const createdRfq = await response.json();
  return convertApiRfqToFrontend(createdRfq);
};

/**
 * Update RFQ API call
 */
export const updateRfqAPI = async (id: string | number, rfqData: Partial<RFQ>, token: string): Promise<RFQ> => {
  const apiRfqData: any = {
    code: rfqData.code,
    date: rfqData.date,
    description: rfqData.description,
    status: rfqData.status,
  };

  // Only include items if they exist
  if ('items' in rfqData && (rfqData as any).items && Array.isArray((rfqData as any).items)) {
    apiRfqData.items = (rfqData as any).items.map((item: any) => ({
      material_id: item.materialId,
      name: item.name,
      qty: item.qty,
      price: item.price
    }));
  }

  const response = await fetch(`http://localhost:8000/api/rfqs/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiRfqData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else if (response.status === 404) {
      throw new Error('RFQ not found');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to update RFQ');
    }
  }

  const updatedRfq = await response.json();
  return convertApiRfqToFrontend(updatedRfq);
};

/**
 * Delete RFQ API call
 */
export const deleteRfqAPI = async (id: string | number, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/rfqs/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 404) {
      throw new Error('RFQ not found');
    } else {
      throw new Error(errorData.message || 'Failed to delete RFQ');
    }
  }

  // DELETE request typically doesn't return a body, so we just check the response status
  if (response.status !== 200 && response.status !== 204) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete RFQ');
  }
};

/**
 * Convert API response field names to frontend field names for Supplier
 */
const convertApiSupplierToFrontend = (apiSupplier: any): Supplier => {
  return {
    id: apiSupplier.id.toString(), // Convert to string to match frontend type
    name: apiSupplier.name,
    address: apiSupplier.address,
    contact: apiSupplier.contact,
  };
};

/**
 * Convert frontend field names to API request field names for Supplier
 */
const convertFrontendSupplierToApi = (frontendSupplier: Partial<Supplier>): any => {
  return {
    name: frontendSupplier.name,
    address: frontendSupplier.address,
    contact: frontendSupplier.contact,
  };
};

/**
 * Get all suppliers API call
 */
export const getSuppliersAPI = async (token: string): Promise<Supplier[]> => {
  const response = await fetch('http://localhost:8000/api/suppliers', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch suppliers');
  }

  const apiResponse = await response.json();
  // Handle both array response and paginated response
  const suppliersData = Array.isArray(apiResponse) ? apiResponse : (apiResponse.data?.data || apiResponse.data || []);
  return suppliersData.map(convertApiSupplierToFrontend);
};

/**
 * Get single supplier API call
 */
export const getSupplierAPI = async (id: string | number, token: string): Promise<Supplier> => {
  const response = await fetch(`http://localhost:8000/api/suppliers/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch supplier with ID: ${id}`);
  }

  const apiSupplier = await response.json();
  return convertApiSupplierToFrontend(apiSupplier);
};

/**
 * Create supplier API call
 */
export interface CreateSupplierData {
  name: string;
  address: string;
  contact: string;
}

export const createSupplierAPI = async (supplierData: CreateSupplierData, token: string): Promise<Supplier> => {
  const response = await fetch('http://localhost:8000/api/suppliers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(supplierData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to create supplier');
    }
  }

  const createdSupplier = await response.json();
  return convertApiSupplierToFrontend(createdSupplier);
};

/**
 * Update supplier API call
 */
export const updateSupplierAPI = async (id: string | number, supplierData: Partial<Supplier>, token: string): Promise<Supplier> => {
  const apiSupplierData = {
    name: supplierData.name,
    address: supplierData.address,
    contact: supplierData.contact,
  };

  const response = await fetch(`http://localhost:8000/api/suppliers/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiSupplierData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else if (response.status === 404) {
      throw new Error('Supplier not found');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to update supplier');
    }
  }

  const updatedSupplier = await response.json();
  return convertApiSupplierToFrontend(updatedSupplier);
};

/**
 * Delete supplier API call
 */
export const deleteSupplierAPI = async (id: string | number, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/suppliers/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 404) {
      throw new Error('Supplier not found');
    } else {
      throw new Error(errorData.message || 'Failed to delete supplier');
    }
  }

  // DELETE request typically doesn't return a body, so we just check the response status
  if (response.status !== 200 && response.status !== 204) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete supplier');
  }
};

/**
 * Convert API response field names to frontend field names for RFQ Item
 */
const convertApiRfqItemToFrontend = (apiRfqItem: any): any => {
  return {
    id: apiRfqItem.id?.toString(),
    rfq_id: apiRfqItem.rfq_id?.toString(),
    material_id: apiRfqItem.material_id?.toString(),
    name: apiRfqItem.name,
    qty: apiRfqItem.qty,
    price: parseFloat(apiRfqItem.price) || 0,
    created_at: apiRfqItem.created_at,
    updated_at: apiRfqItem.updated_at,
  };
};

/**
 * Get all RFQ Items API call
 */
export const getRfqItemsAPI = async (token: string): Promise<any[]> => {
  const response = await fetch('http://localhost:8000/api/rfq-items', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch RFQ items');
  }

  const apiResponse = await response.json();
  // Handle both array response and paginated response
  const rfqItemsData = Array.isArray(apiResponse) ? apiResponse : (apiResponse.data?.data || apiResponse.data || []);
  return rfqItemsData.map(convertApiRfqItemToFrontend);
};

/**
 * Get single RFQ Item API call
 */
export const getRfqItemAPI = async (id: string | number, token: string): Promise<any> => {
  const response = await fetch(`http://localhost:8000/api/rfq-items/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch RFQ item with ID: ${id}`);
  }

  const apiRfqItem = await response.json();
  return convertApiRfqItemToFrontend(apiRfqItem);
};

/**
 * Create RFQ Item API call
 */
export interface CreateRfqItemData {
  rfq_id: string | number;
  material_id: string | number;
  name: string;
  qty: number;
  price?: number;
}

export const createRfqItemAPI = async (rfqItemData: CreateRfqItemData, token: string): Promise<any> => {
  const response = await fetch('http://localhost:8000/api/rfq-items', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rfqItemData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to create RFQ item');
    }
  }

  const createdRfqItem = await response.json();
  return convertApiRfqItemToFrontend(createdRfqItem);
};

/**
 * Update RFQ Item API call
 */
export const updateRfqItemAPI = async (id: string | number, rfqItemData: Partial<any>, token: string): Promise<any> => {
  const apiRfqItemData: any = {
    ...(rfqItemData.rfq_id !== undefined && { rfq_id: rfqItemData.rfq_id }),
    ...(rfqItemData.material_id !== undefined && { material_id: rfqItemData.material_id }),
    ...(rfqItemData.name !== undefined && { name: rfqItemData.name }),
    ...(rfqItemData.qty !== undefined && { qty: rfqItemData.qty }),
    ...(rfqItemData.price !== undefined && { price: rfqItemData.price }),
  };

  const response = await fetch(`http://localhost:8000/api/rfq-items/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiRfqItemData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else if (response.status === 404) {
      throw new Error('RFQ item not found');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to update RFQ item');
    }
  }

  const updatedRfqItem = await response.json();
  return convertApiRfqItemToFrontend(updatedRfqItem);
};

/**
 * Delete RFQ Item API call
 */
export const deleteRfqItemAPI = async (id: string | number, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/rfq-items/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 404) {
      throw new Error('RFQ item not found');
    } else {
      throw new Error(errorData.message || 'Failed to delete RFQ item');
    }
  }

  // DELETE request typically doesn't return a body, so we just check the response status
  if (response.status !== 200 && response.status !== 204) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete RFQ item');
  }
};

/**
 * Convert API response field names to frontend field names for Purchase Order
 */
const convertApiPurchaseOrderToFrontend = (apiPo: any): any => {
  return {
    id: apiPo.id?.toString(),
    code: apiPo.code,
    date: apiPo.date,
    supplierId: apiPo.supplier_id?.toString(),
    rfq_id: apiPo.rfq_id?.toString(),
    description: apiPo.description,
    status: apiPo.status,
    grandTotal: parseFloat(apiPo.grand_total) || 0,
    created_at: apiPo.created_at,
    updated_at: apiPo.updated_at,
    items: Array.isArray(apiPo.items) ? apiPo.items.map((item: any) => ({
      id: item.id?.toString(),
      po_id: item.po_id?.toString(),
      material_id: item.material_id?.toString(),
      name: item.name,
      qty: item.qty,
      price: parseFloat(item.price) || 0,
      created_at: item.created_at,
      updated_at: item.updated_at
    })) : [],
    supplier: apiPo.supplier ? {
      id: apiPo.supplier.id?.toString(),
      name: apiPo.supplier.name,
      address: apiPo.supplier.address,
      contact: apiPo.supplier.contact,
    } : undefined,
    rfq: apiPo.rfq ? {
      id: apiPo.rfq.id?.toString(),
      code: apiPo.rfq.code,
      date: apiPo.rfq.date,
      description: apiPo.rfq.description,
      status: apiPo.rfq.status,
    } : undefined
  };
};

/**
 * Convert frontend field names to API request field names for Purchase Order
 */
const convertFrontendPurchaseOrderToApi = (frontendPo: any, isCreate: boolean = false): any => {
  const apiPo: any = {
    code: frontendPo.code,
    date: frontendPo.date,
    supplier_id: frontendPo.supplierId,
    rfq_id: frontendPo.rfq_id,
    description: frontendPo.description,
    status: frontendPo.status,
    grand_total: frontendPo.grandTotal,
  };

  // Only include items if they exist and it's a create operation
  if (isCreate && frontendPo.items && Array.isArray(frontendPo.items)) {
    apiPo.po_items = frontendPo.items.map((item: any) => ({
      material_id: item.material_id || item.materialId,
      name: item.name,
      qty: item.qty,
      price: item.price
    }));
  }

  return apiPo;
};

/**
 * Get all Purchase Orders API call
 */
export const getPurchaseOrdersAPI = async (token: string): Promise<any[]> => {
  const response = await fetch('http://localhost:8000/api/purchase-orders', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch purchase orders');
  }

  const apiResponse = await response.json();
  // Handle both array response and paginated response
  const posData = Array.isArray(apiResponse.data) ? apiResponse.data : (apiResponse.data?.data || apiResponse.data || []);
  return posData.map(convertApiPurchaseOrderToFrontend);
};

/**
 * Get single Purchase Order API call
 */
export const getPurchaseOrderAPI = async (id: string | number, token: string): Promise<any> => {
  const response = await fetch(`http://localhost:8000/api/purchase-orders/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch purchase order with ID: ${id}`);
  }

  const apiPo = await response.json();
  return convertApiPurchaseOrderToFrontend(apiPo);
};

/**
 * Create Purchase Order API call
 */
export interface CreatePurchaseOrderData {
  code: string;
  date: string;
  supplier_id: string | number;
  rfq_id: string | number;
  description: string;
  status: 'OPEN' | 'RECEIVED';
  grand_total: number;
  po_items: {
    material_id: string | number;
    name: string;
    qty: number;
    price?: number;
  }[];
}

export const createPurchaseOrderAPI = async (poData: CreatePurchaseOrderData, token: string): Promise<any> => {
  const response = await fetch('http://localhost:8000/api/purchase-orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(poData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to create purchase order');
    }
  }

  const createdPo = await response.json();
  return convertApiPurchaseOrderToFrontend(createdPo);
};

/**
 * Update Purchase Order API call
 */
export const updatePurchaseOrderAPI = async (id: string | number, poData: Partial<any>, token: string): Promise<any> => {
  // Only include fields that are actually being updated to avoid validation errors
  const apiPoData: any = {};

  if (poData.code !== undefined) apiPoData.code = poData.code;
  if (poData.date !== undefined) apiPoData.date = poData.date;
  if (poData.supplierId !== undefined) apiPoData.supplier_id = poData.supplierId;
  if (poData.supplier_id !== undefined) apiPoData.supplier_id = poData.supplier_id;
  if (poData.rfq_id !== undefined) apiPoData.rfq_id = poData.rfq_id;
  if (poData.rfqId !== undefined) apiPoData.rfq_id = poData.rfqId; // Handle both field names
  if (poData.description !== undefined) apiPoData.description = poData.description;
  if (poData.status !== undefined) apiPoData.status = poData.status;
  if (poData.grandTotal !== undefined) apiPoData.grand_total = poData.grandTotal;
  if (poData.grand_total !== undefined) apiPoData.grand_total = poData.grand_total;

  const response = await fetch(`http://localhost:8000/api/purchase-orders/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPoData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else if (response.status === 404) {
      throw new Error('Purchase order not found');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to update purchase order');
    }
  }

  const updatedPo = await response.json();
  return convertApiPurchaseOrderToFrontend(updatedPo);
};

/**
 * Delete Purchase Order API call
 */
export const deletePurchaseOrderAPI = async (id: string | number, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/purchase-orders/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 404) {
      throw new Error('Purchase order not found');
    } else {
      throw new Error(errorData.message || 'Failed to delete purchase order');
    }
  }

  // DELETE request typically doesn't return a body, so we just check the response status
  if (response.status !== 200 && response.status !== 204) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete purchase order');
  }
};

/**
 * Convert API response field names to frontend field names for PO Item
 */
const convertApiPoItemToFrontend = (apiPoItem: any): any => {
  return {
    id: apiPoItem.id?.toString(),
    po_id: apiPoItem.po_id?.toString(),
    material_id: apiPoItem.material_id?.toString(),
    name: apiPoItem.name,
    qty: apiPoItem.qty,
    price: parseFloat(apiPoItem.price) || 0,
    created_at: apiPoItem.created_at,
    updated_at: apiPoItem.updated_at,
    purchaseOrder: apiPoItem.purchaseOrder ? {
      id: apiPoItem.purchaseOrder.id?.toString(),
      code: apiPoItem.purchaseOrder.code,
      date: apiPoItem.purchaseOrder.date,
      supplier_id: apiPoItem.purchaseOrder.supplier_id?.toString(),
      description: apiPoItem.purchaseOrder.description,
      status: apiPoItem.purchaseOrder.status,
      grand_total: parseFloat(apiPoItem.purchaseOrder.grand_total) || 0,
    } : undefined,
    material: apiPoItem.material ? {
      id: apiPoItem.material.id?.toString(),
      name: apiPoItem.material.name,
    } : undefined
  };
};

/**
 * Get all PO Items API call
 */
export const getPoItemsAPI = async (token: string): Promise<any[]> => {
  const response = await fetch('http://localhost:8000/api/po-items', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch PO items');
  }

  const apiResponse = await response.json();
  // Handle both array response and paginated response
  const poItemsData = Array.isArray(apiResponse.data) ? apiResponse.data : (apiResponse.data?.data || apiResponse.data || []);
  return poItemsData.map(convertApiPoItemToFrontend);
};

/**
 * Get single PO Item API call
 */
export const getPoItemAPI = async (id: string | number, token: string): Promise<any> => {
  const response = await fetch(`http://localhost:8000/api/po-items/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch PO item with ID: ${id}`);
  }

  const apiPoItem = await response.json();
  return convertApiPoItemToFrontend(apiPoItem);
};

/**
 * Create PO Item API call
 */
export interface CreatePoItemData {
  po_id: string | number;
  material_id: string | number;
  name: string;
  qty: number;
  price?: number;
}

export const createPoItemAPI = async (poItemData: CreatePoItemData, token: string): Promise<any> => {
  const response = await fetch('http://localhost:8000/api/po-items', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(poItemData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to create PO item');
    }
  }

  const createdPoItem = await response.json();
  return convertApiPoItemToFrontend(createdPoItem);
};

/**
 * Update PO Item API call
 */
export const updatePoItemAPI = async (id: string | number, poItemData: Partial<any>, token: string): Promise<any> => {
  const apiPoItemData: any = {
    ...(poItemData.po_id !== undefined && { po_id: poItemData.po_id }),
    ...(poItemData.material_id !== undefined && { material_id: poItemData.material_id }),
    ...(poItemData.name !== undefined && { name: poItemData.name }),
    ...(poItemData.qty !== undefined && { qty: poItemData.qty }),
    ...(poItemData.price !== undefined && { price: poItemData.price }),
  };

  const response = await fetch(`http://localhost:8000/api/po-items/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPoItemData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else if (response.status === 404) {
      throw new Error('PO item not found');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to update PO item');
    }
  }

  const updatedPoItem = await response.json();
  return convertApiPoItemToFrontend(updatedPoItem);
};

/**
 * Delete PO Item API call
 */
export const deletePoItemAPI = async (id: string | number, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/po-items/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 404) {
      throw new Error('PO item not found');
    } else {
      throw new Error(errorData.message || 'Failed to delete PO item');
    }
  }

  // DELETE request typically doesn't return a body, so we just check the response status
  if (response.status !== 200 && response.status !== 204) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete PO item');
  }
};

/**
 * Convert API response field names to frontend field names for Receiving Good
 */
const convertApiReceivingGoodToFrontend = (apiReceivingGood: any): any => {
  return {
    id: apiReceivingGood.id?.toString(),
    code: apiReceivingGood.code,
    date: apiReceivingGood.date,
    po_id: apiReceivingGood.po_id?.toString(),
    created_at: apiReceivingGood.created_at,
    updated_at: apiReceivingGood.updated_at,
    purchase_order: apiReceivingGood.purchase_order ? {
      id: apiReceivingGood.purchase_order.id?.toString(),
      code: apiReceivingGood.purchase_order.code,
      date: apiReceivingGood.purchase_order.date,
      supplier_id: apiReceivingGood.purchase_order.supplier_id?.toString(),
      description: apiReceivingGood.purchase_order.description,
      status: apiReceivingGood.purchase_order.status,
      grand_total: parseFloat(apiReceivingGood.purchase_order.grand_total) || 0,
      supplier: apiReceivingGood.purchase_order.supplier ? {
        id: apiReceivingGood.purchase_order.supplier.id?.toString(),
        name: apiReceivingGood.purchase_order.supplier.name,
        contact_person: apiReceivingGood.purchase_order.supplier.contact_person,
        phone: apiReceivingGood.purchase_order.supplier.phone,
        email: apiReceivingGood.purchase_order.supplier.email,
        address: apiReceivingGood.purchase_order.supplier.address,
      } : undefined,
    } : undefined,
    items: Array.isArray(apiReceivingGood.items) ? apiReceivingGood.items.map((item: any) => ({
      id: item.id?.toString(),
      receiving_id: item.receiving_id?.toString(),
      material_id: item.material_id?.toString(),
      name: item.name,
      qty: item.qty,
      created_at: item.created_at,
      updated_at: item.updated_at,
      material: item.material ? {
        id: item.material.id?.toString(),
        code: item.material.code,
        name: item.material.name,
        unit: item.material.unit,
        current_stock: item.material.current_stock,
        safety_stock: item.material.safety_stock,
        price_per_unit: parseFloat(item.material.price_per_unit) || 0,
        category: item.material.category,
      } : undefined,
    })) : [],
  };
};

/**
 * Get all Receiving Goods API call
 */
export const getReceivingGoodsAPI = async (token: string): Promise<any[]> => {
  const response = await fetch('http://localhost:8000/api/receiving-goods', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch receiving goods');
  }

  const apiResponse = await response.json();
  // Handle paginated response
  const receivingGoodsData = apiResponse.data?.data || apiResponse.data || [];
  return receivingGoodsData.map(convertApiReceivingGoodToFrontend);
};

/**
 * Get single Receiving Good API call
 */
export const getReceivingGoodAPI = async (id: string | number, token: string): Promise<any> => {
  const response = await fetch(`http://localhost:8000/api/receiving-goods/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch receiving good with ID: ${id}`);
  }

  const apiReceivingGood = await response.json();
  return convertApiReceivingGoodToFrontend(apiReceivingGood);
};

/**
 * Create Receiving Good API call
 */
export interface CreateReceivingGoodData {
  code: string;
  date: string;
  po_id: string | number;
  items: {
    material_id: string | number;
    name: string;
    qty: number;
  }[];
}

export const createReceivingGoodAPI = async (receivingGoodData: CreateReceivingGoodData, token: string): Promise<any> => {
  const response = await fetch('http://localhost:8000/api/receiving-goods', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(receivingGoodData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to create receiving good');
    }
  }

  const createdReceivingGood = await response.json();
  return convertApiReceivingGoodToFrontend(createdReceivingGood);
};

/**
 * Update Receiving Good API call
 */
export const updateReceivingGoodAPI = async (id: string | number, receivingGoodData: Partial<any>, token: string): Promise<any> => {
  const apiReceivingGoodData: any = {
    ...(receivingGoodData.code !== undefined && { code: receivingGoodData.code }),
    ...(receivingGoodData.date !== undefined && { date: receivingGoodData.date }),
    ...(receivingGoodData.po_id !== undefined && { po_id: receivingGoodData.po_id }),
  };

  // Only include items if they exist
  if ('items' in receivingGoodData && receivingGoodData.items && Array.isArray(receivingGoodData.items)) {
    apiReceivingGoodData.items = receivingGoodData.items.map((item: any) => ({
      material_id: item.material_id || item.materialId,
      name: item.name,
      qty: item.qty,
    }));
  }

  const response = await fetch(`http://localhost:8000/api/receiving-goods/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiReceivingGoodData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else if (response.status === 404) {
      throw new Error('Receiving good not found');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to update receiving good');
    }
  }

  const updatedReceivingGood = await response.json();
  return convertApiReceivingGoodToFrontend(updatedReceivingGood);
};

/**
 * Delete Receiving Good API call
 */
export const deleteReceivingGoodAPI = async (id: string | number, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/receiving-goods/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 404) {
      throw new Error('Receiving good not found');
    } else {
      throw new Error(errorData.message || 'Failed to delete receiving good');
    }
  }

  // DELETE request typically doesn't return a body, so we just check the response status
  if (response.status !== 200 && response.status !== 204) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete receiving good');
  }
};

/**
 * Convert API response field names to frontend field names for Receiving Item
 */
const convertApiReceivingItemToFrontend = (apiReceivingItem: any): any => {
  return {
    id: apiReceivingItem.id?.toString(),
    receiving_id: apiReceivingItem.receiving_id?.toString(),
    material_id: apiReceivingItem.material_id?.toString(),
    name: apiReceivingItem.name,
    qty: apiReceivingItem.qty,
    created_at: apiReceivingItem.created_at,
    updated_at: apiReceivingItem.updated_at,
    receiving: apiReceivingItem.receiving ? {
      id: apiReceivingItem.receiving.id?.toString(),
      code: apiReceivingItem.receiving.code,
      date: apiReceivingItem.receiving.date,
      po_id: apiReceivingItem.receiving.po_id?.toString(),
    } : undefined,
    material: apiReceivingItem.material ? {
      id: apiReceivingItem.material.id?.toString(),
      code: apiReceivingItem.material.code,
      name: apiReceivingItem.material.name,
      unit: apiReceivingItem.material.unit,
      current_stock: apiReceivingItem.material.current_stock,
      safety_stock: apiReceivingItem.material.safety_stock,
      price_per_unit: parseFloat(apiReceivingItem.material.price_per_unit) || 0,
      category: apiReceivingItem.material.category,
    } : undefined
  };
};

/**
 * Get all Receiving Items API call
 */
export const getReceivingItemsAPI = async (token: string): Promise<any[]> => {
  const response = await fetch('http://localhost:8000/api/receiving-items', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch receiving items');
  }

  const apiResponse = await response.json();
  // Handle paginated response
  const receivingItemsData = apiResponse.data?.data || apiResponse.data || [];
  return receivingItemsData.map(convertApiReceivingItemToFrontend);
};

/**
 * Get single Receiving Item API call
 */
export const getReceivingItemAPI = async (id: string | number, token: string): Promise<any> => {
  const response = await fetch(`http://localhost:8000/api/receiving-items/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch receiving item with ID: ${id}`);
  }

  const apiReceivingItem = await response.json();
  return convertApiReceivingItemToFrontend(apiReceivingItem);
};

/**
 * Create Receiving Item API call
 */
export interface CreateReceivingItemData {
  receiving_id: string | number;
  material_id: string | number;
  name: string;
  qty: number;
}

export const createReceivingItemAPI = async (receivingItemData: CreateReceivingItemData, token: string): Promise<any> => {
  const response = await fetch('http://localhost:8000/api/receiving-items', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(receivingItemData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to create receiving item');
    }
  }

  const createdReceivingItem = await response.json();
  return convertApiReceivingItemToFrontend(createdReceivingItem);
};

/**
 * Update Receiving Item API call
 */
export const updateReceivingItemAPI = async (id: string | number, receivingItemData: Partial<any>, token: string): Promise<any> => {
  const apiReceivingItemData: any = {
    ...(receivingItemData.receiving_id !== undefined && { receiving_id: receivingItemData.receiving_id }),
    ...(receivingItemData.material_id !== undefined && { material_id: receivingItemData.material_id }),
    ...(receivingItemData.name !== undefined && { name: receivingItemData.name }),
    ...(receivingItemData.qty !== undefined && { qty: receivingItemData.qty }),
  };

  const response = await fetch(`http://localhost:8000/api/receiving-items/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiReceivingItemData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else if (response.status === 404) {
      throw new Error('Receiving item not found');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to update receiving item');
    }
  }

  const updatedReceivingItem = await response.json();
  return convertApiReceivingItemToFrontend(updatedReceivingItem);
};

/**
 * Delete Receiving Item API call
 */
export const deleteReceivingItemAPI = async (id: string | number, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/receiving-items/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 404) {
      throw new Error('Receiving item not found');
    } else {
      throw new Error(errorData.message || 'Failed to delete receiving item');
    }
  }

  // DELETE request typically doesn't return a body, so we just check the response status
  if (response.status !== 200 && response.status !== 204) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete receiving item');
  }
};

/**
 * Convert API response field names to frontend field names for Project Item
 */
const convertApiProjectItemToFrontend = (apiProjectItem: any): any => {
  return {
    id: apiProjectItem.id?.toString(),
    project_id: apiProjectItem.project_id?.toString(),
    name: apiProjectItem.name,
    dimensions: apiProjectItem.dimensions,
    thickness: apiProjectItem.thickness,
    qty_set: apiProjectItem.qty_set,
    quantity: apiProjectItem.quantity,
    unit: apiProjectItem.unit,
    is_bom_locked: apiProjectItem.is_bom_locked,
    is_workflow_locked: apiProjectItem.is_workflow_locked,
    flow_type: apiProjectItem.flow_type,
    warehouse_qty: apiProjectItem.warehouse_qty || 0,
    shipped_qty: apiProjectItem.shipped_qty || 0,
    created_at: apiProjectItem.created_at,
    updated_at: apiProjectItem.updated_at,
  };
};

/**
 * Convert frontend field names to API request field names for Project Item
 */
const convertFrontendProjectItemToApi = (frontendProjectItem: any): any => {
  return {
    project_id: frontendProjectItem.project_id,
    name: frontendProjectItem.name,
    dimensions: frontendProjectItem.dimensions,
    thickness: frontendProjectItem.thickness,
    qty_set: frontendProjectItem.qty_set,
    quantity: frontendProjectItem.quantity,
    unit: frontendProjectItem.unit,
    is_bom_locked: frontendProjectItem.is_bom_locked || false,
    is_workflow_locked: frontendProjectItem.is_workflow_locked || false,
    flow_type: frontendProjectItem.flow_type || 'NEW',
    warehouse_qty: frontendProjectItem.warehouse_qty || 0,
    shipped_qty: frontendProjectItem.shipped_qty || 0,
  };
};

/**
 * Get all project items API call
 */
export const getProjectItemsAPI = async (token: string, projectId?: string | number): Promise<any[]> => {
  let url = 'http://localhost:8000/api/project-items';
  if (projectId) {
    url += `?project_id=${projectId}`;
  }


  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData: any = {};
      let responseText = '';

      try {
        responseText = await response.text();
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText || 'Unknown error' };
      }


      const errorMessage = errorData.message
        || (errorData.errors && Object.values(errorData.errors).flat().join(', '))
        || `Failed to fetch project items (${response.status})`;

      throw new Error(errorMessage);
    }

    const apiResponse = await response.json();

    // Handle both paginated and array responses
    const projectItemsData = Array.isArray(apiResponse) ? apiResponse : (apiResponse.data?.data || apiResponse.data || []);
    return projectItemsData.map(convertApiProjectItemToFrontend);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to backend. Is the API server running at http://localhost:8000?');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw error;
  }
};

/**
 * Get single project item API call
 */
export const getProjectItemAPI = async (id: string | number, token: string): Promise<any> => {
  const response = await fetch(`http://localhost:8000/api/project-items/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch project item with ID: ${id}`);
  }

  const apiProjectItem = await response.json();
  return convertApiProjectItemToFrontend(apiProjectItem);
};

/**
 * Create project item API call
 */
export interface CreateProjectItemData {
  project_id: string | number;
  name: string;
  dimensions?: string;
  thickness?: string;
  qty_set: number;
  quantity: number;
  unit: string;
  is_bom_locked?: boolean;
  is_workflow_locked?: boolean;
  flow_type?: 'OLD' | 'NEW';
  warehouse_qty?: number;
  shipped_qty?: number;
}

export const createProjectItemAPI = async (projectItemData: CreateProjectItemData, token: string): Promise<any> => {
  const response = await fetch('http://localhost:8000/api/project-items', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(convertFrontendProjectItemToApi(projectItemData)),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to create project item');
    }
  }

  const createdProjectItem = await response.json();
  return convertApiProjectItemToFrontend(createdProjectItem.data || createdProjectItem);
};

/**
 * Update project item API call
 */
export const updateProjectItemAPI = async (id: string | number, projectItemData: Partial<any>, token: string): Promise<any> => {
  const apiProjectItemData = convertFrontendProjectItemToApi(projectItemData);

  const response = await fetch(`http://localhost:8000/api/project-items/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiProjectItemData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else if (response.status === 404) {
      throw new Error('Project item not found');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to update project item');
    }
  }

  const updatedProjectItem = await response.json();
  return convertApiProjectItemToFrontend(updatedProjectItem.data || updatedProjectItem);
};

/**
 * Delete project item API call
 */
export const deleteProjectItemAPI = async (id: string | number, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/project-items/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 404) {
      throw new Error('Project item not found');
    } else {
      throw new Error(errorData.message || 'Failed to delete project item');
    }
  }

  // DELETE request typically doesn't return a body, so we just check the response status
  if (response.status !== 200 && response.status !== 204) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete project item');
  }
};

/**
 * Convert API response field names to frontend field names for Machine
 */
const convertApiMachineToFrontend = (apiMachine: any): any => {
  // Extract the main user associated with the machine from the user field
  const mainUserPersonnel = apiMachine.user ? [{
    id: apiMachine.user.id?.toString() || apiMachine.user.id,
    name: apiMachine.user.username || apiMachine.user.name || '',
    role: 'PIC', // Default role for the main user
    shift: 'SHIFT_1' // Default shift
  }] : [];

  // Combine with any additional personnel if they exist
  const additionalPersonnel = Array.isArray(apiMachine.personnel) ? apiMachine.personnel.map((p: any) => ({
    id: p.id?.toString() || p.id,
    name: p.name || p.username || p.user?.name || '',
    role: p.role || p.position || 'OPERATOR',
    shift: p.shift || 'SHIFT_1'
  })) : [];

  return {
    id: apiMachine.id?.toString(),
    userId: apiMachine.user_id?.toString(),
    code: apiMachine.code,
    name: apiMachine.name,
    type: apiMachine.type,
    capacityPerHour: apiMachine.capacity_per_hour,
    status: apiMachine.status,
    isMaintenance: apiMachine.is_maintenance ? true : false, // Convert 0/1 to boolean
    createdAt: apiMachine.created_at,
    updatedAt: apiMachine.updated_at,
    personnel: [...mainUserPersonnel, ...additionalPersonnel],
  };
};

/**
 * Convert frontend field names to API request field names for Machine
 */
const convertFrontendMachineToApi = (frontendMachine: any, isCreate: boolean = false): any => {
  const apiMachine: any = {
    user_id: frontendMachine.userId || frontendMachine.user_id,
    code: frontendMachine.code,
    name: frontendMachine.name,
    type: frontendMachine.type,
    capacity_per_hour: frontendMachine.capacityPerHour,
    status: frontendMachine.status,
    is_maintenance: frontendMachine.isMaintenance,
  };

  // Handle personnel data if it exists
  if (Array.isArray(frontendMachine.personnel) && frontendMachine.personnel.length > 0) {
    // For now, we'll just send the personnel array as is
    // In a real implementation, you might want to separate the main user from other personnel
    apiMachine.personnel = frontendMachine.personnel.map((p: any) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      shift: p.shift
    }));
  }

  // Only include id if it's not for creation
  if (!isCreate && frontendMachine.id) {
    apiMachine.id = frontendMachine.id;
  }

  return apiMachine;
};

/**
 * Get all machines API call
 */
export const getMachinesAPI = async (token: string): Promise<any[]> => {
  const response = await fetch('http://localhost:8000/api/machines', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch machines');
  }

  const apiResponse = await response.json();
  // Handle both array response and paginated response
  const machinesData = Array.isArray(apiResponse) ? apiResponse : (apiResponse.data?.data || apiResponse.data || []);
  return machinesData.map(convertApiMachineToFrontend);
};

/**
 * Get single machine API call
 */
export const getMachineAPI = async (id: string | number, token: string): Promise<any> => {
  const response = await fetch(`http://localhost:8000/api/machines/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch machine with ID: ${id}`);
  }

  const apiMachine = await response.json();
  return convertApiMachineToFrontend(apiMachine);
};

/**
 * Create machine API call
 */
export interface CreateMachineData {
  user_id: string | number;
  code: string;
  name: string;
  type: string;
  capacity_per_hour: number;
  status: string;
  is_maintenance: boolean;
}

export const createMachineAPI = async (machineData: CreateMachineData, token: string): Promise<any> => {
  const response = await fetch('http://localhost:8000/api/machines', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(machineData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to create machine');
    }
  }

  const createdMachine = await response.json();
  return convertApiMachineToFrontend(createdMachine);
};

/**
 * Update machine API call
 */
export const updateMachineAPI = async (id: string | number, machineData: Partial<any>, token: string): Promise<any> => {
  const apiMachineData = {
    ...(machineData.userId !== undefined && { user_id: machineData.userId }),
    ...(machineData.user_id !== undefined && { user_id: machineData.user_id }),
    ...(machineData.code !== undefined && { code: machineData.code }),
    ...(machineData.name !== undefined && { name: machineData.name }),
    ...(machineData.type !== undefined && { type: machineData.type }),
    ...(machineData.capacityPerHour !== undefined && { capacity_per_hour: machineData.capacityPerHour }),
    ...(machineData.capacity_per_hour !== undefined && { capacity_per_hour: machineData.capacity_per_hour }),
    ...(machineData.status !== undefined && { status: machineData.status }),
    ...(machineData.isMaintenance !== undefined && { is_maintenance: machineData.isMaintenance }),
    ...(machineData.is_maintenance !== undefined && { is_maintenance: machineData.is_maintenance }),
  };

  const response = await fetch(`http://localhost:8000/api/machines/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiMachineData),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 422) {
      // Validation errors
      throw new Error(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Validation error');
    } else if (response.status === 404) {
      throw new Error('Machine not found');
    } else {
      // Other server errors
      throw new Error(errorData.message || 'Failed to update machine');
    }
  }

  const updatedMachine = await response.json();
  return convertApiMachineToFrontend(updatedMachine);
};

/**
 * Delete machine API call
 */
export const deleteMachineAPI = async (id: string | number, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/machines/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 404) {
      throw new Error('Machine not found');
    } else {
      throw new Error(errorData.message || 'Failed to delete machine');
    }
  }

  // DELETE request typically doesn't return a body, so we just check the response status
  if (response.status !== 200 && response.status !== 204) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete machine');
  }
};

/**
 * Toggle machine maintenance API call
 */
export const toggleMachineMaintenanceAPI = async (id: string | number, token: string): Promise<any> => {
  const response = await fetch(`http://localhost:8000/api/machines/${id}/toggle-maintenance`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to toggle machine maintenance');
  }

  const updatedMachine = await response.json();
  return convertApiMachineToFrontend(updatedMachine);
};
