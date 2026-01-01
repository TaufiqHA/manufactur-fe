import { User, Project } from '../types';

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

  if (isCreate && frontendUser.password) {
    apiUser.password = frontendUser.password;
    apiUser.password_confirmation = frontendUser.password;
  }

  if (frontendUser.password) {
    apiUser.password = frontendUser.password;
    apiUser.password_confirmation = frontendUser.password;
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
  const apiUserData = convertFrontendUserToApi(userData, true);

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