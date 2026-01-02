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
      console.warn('Failed to parse permissions:', e);
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
  const response = await fetch('http://localhost:8000/api/projects', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch projects');
  }

  const apiProjects = await response.json();
  return apiProjects.map(convertApiProjectToFrontend);
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