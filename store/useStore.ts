
import { create } from 'zustand';
import {
  Project, Material, ProjectItem, Machine, Task, User, ProductionLog,
  TaskStatus, ItemStepConfig, Shift, ProcessStep, SubAssembly,
  Supplier, RFQ, PurchaseOrder, ReceivingGoods, DeliveryOrder,
  ASSEMBLY_STEPS
} from '../types';
import {
  MOCK_ITEMS, MOCK_MACHINES, MOCK_TASKS, MOCK_USERS, MOCK_LOGS,
  MOCK_SUPPLIERS, MOCK_RFQS, MOCK_POS, MOCK_RECEIVINGS, MOCK_DELIVERY_ORDERS
} from '../lib/mockData';
import {
  getProjectsAPI,
  createProjectAPI,
  updateProjectAPI,
  deleteProjectAPI,
  getMaterialsAPI,
  createMaterialAPI,
  updateMaterialAPI,
  deleteMaterialAPI
} from '../lib/api';

interface AppState {
  currentUser: User | null;
  token: string | null;
  projects: Project[];
  materials: Material[];
  items: ProjectItem[];
  machines: Machine[];
  tasks: Task[];
  users: User[];
  logs: ProductionLog[];
  suppliers: Supplier[];
  rfqs: RFQ[];
  pos: PurchaseOrder[];
  receivings: ReceivingGoods[];
  deliveryOrders: DeliveryOrder[];

  can: (action: string, module: string) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  addProjectItem: (item: ProjectItem) => void;
  deleteProjectItem: (id: string) => void;
  addSubAssembly: (itemId: string, sa: SubAssembly) => void;
  lockSubAssembly: (itemId: string, saId: string) => void;
  deleteSubAssembly: (itemId: string, saId: string) => void;

  validateWorkflow: (itemId: string, workflow: ItemStepConfig[]) => void;
  unlockWorkflow: (itemId: string) => void;
  reportProduction: (taskId: string, goodQty: number, defectQty: number, shift: Shift, operator: string) => void;
  setTaskStatus: (taskId: string, status: TaskStatus) => void;
  startDowntime: (taskId: string) => void;
  endDowntime: (taskId: string) => void;

  addProject: (p: Project) => void;
  updateProject: (p: Project) => void;
  validateProject: (id: string) => void;
  deleteProject: (id: string) => void;
  reloadProjects: () => Promise<void>;
  addMaterial: (m: Material) => void;
  updateMaterial: (um: Material) => void;
  adjustStock: (matId: string, amount: number) => void;
  addMachine: (m: Machine) => void;
  updateMachine: (um: Machine) => void;
  deleteMachine: (id: string) => boolean;
  toggleMaintenance: (macId: string) => void;
  addUser: (u: User) => void;
  updateUser: (u: User) => void;
  deleteUser: (id: string) => void;
  loadUsersFromAPI: () => Promise<void>;
  addUserAPI: (userData: User) => Promise<void>;
  updateUserAPI: (userData: User) => Promise<void>;
  deleteUserAPI: (id: string) => Promise<void>;
  downloadDatabase: () => void;
  validateToWarehouse: (itemId: string, qty: number) => void;
  addRFQ: (rfq: RFQ) => void;
  createPO: (po: PurchaseOrder) => void;
  receiveGoods: (receiving: ReceivingGoods) => void;
  createDeliveryOrder: (sj: DeliveryOrder) => void;
  updateDeliveryOrder: (sj: DeliveryOrder) => void;
  validateDeliveryOrder: (id: string) => void;
  deleteDeliveryOrder: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
  token: localStorage.getItem('token') || null,
  projects: [],
  materials: [],
  items: MOCK_ITEMS,
  machines: MOCK_MACHINES,
  tasks: MOCK_TASKS,
  users: [],
  logs: MOCK_LOGS,
  suppliers: MOCK_SUPPLIERS,
  rfqs: MOCK_RFQS,
  pos: MOCK_POS,
  receivings: MOCK_RECEIVINGS,
  deliveryOrders: MOCK_DELIVERY_ORDERS,

  can: (a, m) => true,
  login: async (email, password) => {
    try {
      const { user, token } = await import('../lib/api').then(mod => mod.loginAPI(email, password));
      set({ currentUser: user, token });
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token);

      // Load projects and materials after successful login
      if (token) {
        try {
          const projects = await getProjectsAPI(token);
          const materials = await getMaterialsAPI(token);
          set({ projects, materials });
        } catch (error) {
          console.error('Failed to load projects and materials:', error);
          // Set empty arrays if loading fails
          set({ projects: [], materials: [] });
        }
      } else {
        // If no token, set empty projects and materials
        set({ projects: [], materials: [] });
      }

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },
  logout: () => {
    // Try to call the logout API if we have a token
    const token = get().token;
    if (token) {
      import('../lib/api').then(mod => {
        mod.logoutAPI(token).catch(err => console.error('Logout API failed:', err));
      });
    }

    set({ currentUser: null, token: null, projects: [], users: [] });
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  },

  addProjectItem: (item) => set(s => ({ items: [...s.items, item] })),
  deleteProjectItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),

  addSubAssembly: (itemId, sa) => set(s => ({
    items: s.items.map(i => i.id === itemId ? { ...i, subAssemblies: [...i.subAssemblies, { ...sa, stepStats: {} }] } : i)
  })),

  lockSubAssembly: (itemId, saId) => set(s => ({
    items: s.items.map(i => i.id === itemId ? {
      ...i,
      subAssemblies: i.subAssemblies.map(sa => sa.id === saId ? { ...sa, isLocked: true } : sa)
    } : i)
  })),

  deleteSubAssembly: (itemId, saId) => set(s => ({
    items: s.items.map(i => i.id === itemId ? { ...i, subAssemblies: i.subAssemblies.filter(sa => sa.id !== saId) } : i)
  })),

  validateWorkflow: (itemId, workflow) => set((state) => {
    const item = state.items.find(i => i.id === itemId);
    const project = state.projects.find(p => p.id === item?.projectId);
    if (!item || !project) return state;

    const newTasks: Task[] = [];

    if (item.flowType === 'NEW') {
      item.subAssemblies.forEach(sa => {
        sa.processes.forEach(proc => {
          newTasks.push({
            id: `task-sa-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            projectId: project.id, projectName: project.name, itemId: item.id, itemName: item.name,
            subAssemblyId: sa.id, subAssemblyName: sa.name, step: proc,
            targetQty: sa.totalNeeded, completedQty: 0, defectQty: 0, status: 'PENDING', totalDowntimeMinutes: 0
          });
        });
      });
    }

    workflow.forEach(stepConfig => {
      stepConfig.allocations.forEach(alloc => {
        newTasks.push({
          id: `task-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          projectId: project.id, projectName: project.name, itemId: item.id, itemName: item.name,
          step: stepConfig.step, machineId: alloc.machineId, targetQty: alloc.targetQty,
          completedQty: 0, defectQty: 0, status: 'PENDING', note: alloc.note, totalDowntimeMinutes: 0
        });
      });
    });

    return {
      items: state.items.map(i => i.id === itemId ? { ...i, isWorkflowLocked: true, workflow } : i),
      tasks: [...state.tasks.filter(t => t.itemId !== itemId), ...newTasks]
    };
  }),

  unlockWorkflow: (itemId) => set(s => ({
    items: s.items.map(i => i.id === itemId ? { ...i, isWorkflowLocked: false } : i),
    tasks: s.tasks.filter(t => t.itemId !== itemId)
  })),

  reportProduction: (taskId, goodQty, defectQty, shift, operator) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return state;

    const item = state.items.find(i => i.id === task.itemId);
    if (!item) return state;

    let updatedItems = [...state.items];
    const totalConsumed = goodQty + defectQty;

    if (task.subAssemblyId) {
      updatedItems = state.items.map(it => {
        if (it.id !== item.id) return it;
        return {
          ...it,
          subAssemblies: it.subAssemblies.map(sa => {
            if (sa.id !== task.subAssemblyId) return sa;
            const processIdx = sa.processes.indexOf(task.step);
            const nextStats = { ...sa.stepStats };

            const current = nextStats[task.step] || { produced: 0, available: 0 };
            nextStats[task.step] = {
              produced: current.produced + goodQty,
              available: current.available + goodQty
            };

            if (processIdx > 0) {
               const prevStep = sa.processes[processIdx - 1];
               const prevData = nextStats[prevStep] || { produced: 0, available: 0 };
               nextStats[prevStep] = { ...prevData, available: Math.max(0, prevData.available - totalConsumed) };
            }

            const isLastStep = processIdx === sa.processes.length - 1;
            return {
              ...sa,
              stepStats: nextStats,
              totalProduced: isLastStep ? sa.totalProduced + goodQty : sa.totalProduced,
              completedQty: isLastStep ? sa.completedQty + goodQty : sa.completedQty
            };
          })
        };
      });
    } else {
      updatedItems = state.items.map(it => {
        if (it.id !== item.id) return it;
        const nextAssemblyStats = { ...it.assemblyStats };
        const currentStepIdx = ASSEMBLY_STEPS.indexOf(task.step);

        const current = nextAssemblyStats[task.step] || { produced: 0, available: 0 };
        nextAssemblyStats[task.step] = {
           produced: current.produced + goodQty,
           available: current.available + goodQty
        };

        if (currentStepIdx > 0) {
           const prevStep = ASSEMBLY_STEPS[currentStepIdx - 1];
           const prevData = nextAssemblyStats[prevStep] || { produced: 0, available: 0 };
           nextAssemblyStats[prevStep] = { ...prevData, available: Math.max(0, prevData.available - totalConsumed) };
           return { ...it, assemblyStats: nextAssemblyStats };
        } else if (task.step === 'LAS') {
           return {
              ...it,
              assemblyStats: nextAssemblyStats,
              subAssemblies: it.subAssemblies.map(sa => {
                 const newCompletedQty = Math.max(0, sa.completedQty - (totalConsumed * sa.qtyPerParent));
                 const nextSaStats = { ...sa.stepStats };
                 const lastProcess = sa.processes[sa.processes.length - 1];

                 if (lastProcess) {
                   const lpData = nextSaStats[lastProcess] || { produced: 0, available: 0 };
                   nextSaStats[lastProcess] = { ...lpData, available: newCompletedQty };
                 }

                 return {
                    ...sa,
                    stepStats: nextSaStats,
                    completedQty: newCompletedQty,
                    consumedQty: sa.consumedQty + (totalConsumed * sa.qtyPerParent)
                 };
              })
           };
        }
        return { ...it, assemblyStats: nextAssemblyStats };
      });
    }

    return {
      items: updatedItems,
      tasks: state.tasks.map(t => t.id === taskId ? {
        ...t, completedQty: t.completedQty + goodQty, defectQty: t.defectQty + defectQty,
        status: (t.completedQty + goodQty) >= t.targetQty ? 'COMPLETED' : t.status
      } : t),
      logs: [{
        id: `log-${Date.now()}`, taskId, machineId: task.machineId, itemId: task.itemId, subAssemblyId: task.subAssemblyId,
        projectId: task.projectId, step: task.step, shift, goodQty, defectQty, operator, timestamp: new Date().toISOString(), type: 'OUTPUT'
      }, ...state.logs]
    };
  }),

  setTaskStatus: (taskId, status) => set(s => ({
    tasks: s.tasks.map(t => t.id === taskId ? { ...t, status } : t),
    machines: s.machines.map(m => {
      const task = s.tasks.find(x => x.id === taskId);
      if (m.id === task?.machineId) return { ...m, status: status === 'IN_PROGRESS' ? 'RUNNING' : 'IDLE' };
      return m;
    })
  })),

  startDowntime: (taskId) => set(s => ({
    tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: 'DOWNTIME' } : t),
    machines: s.machines.map(m => {
      const task = s.tasks.find(x => x.id === taskId);
      if (m.id === task?.machineId) return { ...m, status: 'DOWNTIME' };
      return m;
    })
  })),

  endDowntime: (taskId) => set(s => ({
    tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: 'IN_PROGRESS', totalDowntimeMinutes: (t.totalDowntimeMinutes || 0) + 10 } : t),
    machines: s.machines.map(m => {
      const task = s.tasks.find(x => x.id === taskId);
      if (m.id === task?.machineId) return { ...m, status: 'RUNNING' };
      return m;
    })
  })),

  addProject: async (p) => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      // Format the date to YYYY-MM-DD format for the backend
      const projectData = {
        name: p.name,
        customer: p.customer,
        startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        deadline: p.deadline,
        status: p.status,
        progress: p.progress,
        qtyPerUnit: p.qtyPerUnit,
        procurementQty: p.procurementQty,
        totalQty: p.totalQty,
        unit: p.unit,
        isLocked: p.isLocked
      };

      const createdProject = await createProjectAPI(projectData, token);
      // Reload projects to ensure consistency with backend
      const updatedProjects = await getProjectsAPI(token);
      set(s => ({ projects: updatedProjects }));
    } catch (error) {
      console.error('Failed to create project:', error);
      // Reload projects to ensure consistency even if there's an error
      try {
        const token = get().token;
        if (token) {
          const projects = await getProjectsAPI(token);
          set(s => ({ projects }));
        }
      } catch (reloadError) {
        console.error('Failed to reload projects after error:', reloadError);
      }
      throw error;
    }
  },

  updateProject: async (p) => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      // Format the date to YYYY-MM-DD format for the backend
      const projectData = {
        ...p,
        startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : undefined
      };

      const updatedProject = await updateProjectAPI(p.id, projectData, token);
      // Reload projects to ensure consistency with backend
      const updatedProjects = await getProjectsAPI(token);
      set(s => ({ projects: updatedProjects }));
    } catch (error) {
      console.error('Failed to update project:', error);
      // Reload projects to ensure consistency even if there's an error
      try {
        const token = get().token;
        if (token) {
          const projects = await getProjectsAPI(token);
          set(s => ({ projects }));
        }
      } catch (reloadError) {
        console.error('Failed to reload projects after error:', reloadError);
      }
      throw error;
    }
  },

  validateProject: async (id) => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      const updatedProject = await updateProjectAPI(id, { isLocked: true, status: 'IN_PROGRESS' } as Partial<Project>, token);
      // Reload projects to ensure consistency with backend
      const updatedProjects = await getProjectsAPI(token);
      set(s => ({ projects: updatedProjects }));
    } catch (error) {
      console.error('Failed to validate project:', error);
      // Reload projects to ensure consistency even if there's an error
      try {
        const token = get().token;
        if (token) {
          const projects = await getProjectsAPI(token);
          set(s => ({ projects }));
        }
      } catch (reloadError) {
        console.error('Failed to reload projects after error:', reloadError);
      }
      throw error;
    }
  },

  deleteProject: async (id) => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      await deleteProjectAPI(id, token);
      // Reload projects to ensure consistency with backend
      const updatedProjects = await getProjectsAPI(token);
      set(s => ({ projects: updatedProjects }));
    } catch (error) {
      console.error('Failed to delete project:', error);
      // Reload projects to ensure consistency even if there's an error
      try {
        const token = get().token;
        if (token) {
          const projects = await getProjectsAPI(token);
          set(s => ({ projects }));
        }
      } catch (reloadError) {
        console.error('Failed to reload projects after error:', reloadError);
      }
      throw error;
    }
  },

  reloadProjects: async () => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      set({ projects: [], materials: [], users: [] });
      return;
    }

    try {
      const projects = await getProjectsAPI(token);
      const materials = await getMaterialsAPI(token);
      const { getUsersAPI } = await import('../lib/api');
      const users = await getUsersAPI(token);
      set({ projects, materials, users });
    } catch (error) {
      console.error('Failed to reload projects, materials and users:', error);
      set({ projects: [], materials: [], users: [] });
    }
  },

  addMaterial: async (m) => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      set(s => ({ materials: [m, ...s.materials] })); // Fallback to local state
      return;
    }

    try {
      const materialData = {
        code: m.code,
        name: m.name,
        unit: m.unit,
        current_stock: m.currentStock || 0,
        safety_stock: m.safetyStock || 0,
        price_per_unit: m.pricePerUnit || 0,
        category: m.category
      };
      const createdMaterial = await createMaterialAPI(materialData, token);
      set(s => ({ materials: [createdMaterial, ...s.materials] }));
    } catch (error) {
      console.error('Failed to add material via API:', error);
      // Fallback to local state if API fails
      set(s => ({ materials: [m, ...s.materials] }));
      throw error;
    }
  },
  updateMaterial: async (m) => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      set(s => ({ materials: s.materials.map(x => x.id === m.id ? m : x) })); // Fallback to local state
      return;
    }

    try {
      const materialData = {
        code: m.code,
        name: m.name,
        unit: m.unit,
        current_stock: m.currentStock,
        safety_stock: m.safetyStock,
        price_per_unit: m.pricePerUnit,
        category: m.category
      };
      const updatedMaterial = await updateMaterialAPI(m.id, materialData, token);
      set(s => ({ materials: s.materials.map(x => x.id === m.id ? updatedMaterial : x) }));
    } catch (error) {
      console.error('Failed to update material via API:', error);
      // Fallback to local state if API fails
      set(s => ({ materials: s.materials.map(x => x.id === m.id ? m : x) }));
      throw error;
    }
  },
  adjustStock: async (id, q) => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      set(s => ({ materials: s.materials.map(x => x.id === id ? {...x, currentStock: x.currentStock + q} : x) })); // Fallback to local state
      return;
    }

    try {
      // First get the current material
      const currentMaterial = get().materials.find(x => x.id === id);
      if (!currentMaterial) {
        throw new Error('Material not found');
      }

      // Update the material with the new stock
      const updatedMaterial = {
        ...currentMaterial,
        currentStock: currentMaterial.currentStock + q
      };

      const materialData = {
        code: currentMaterial.code,
        name: currentMaterial.name,
        unit: currentMaterial.unit,
        current_stock: updatedMaterial.currentStock,
        safety_stock: currentMaterial.safetyStock,
        price_per_unit: currentMaterial.pricePerUnit,
        category: currentMaterial.category
      };

      const result = await updateMaterialAPI(id, materialData, token);
      set(s => ({ materials: s.materials.map(x => x.id === id ? result : x) }));
    } catch (error) {
      console.error('Failed to adjust stock via API:', error);
      // Fallback to local state if API fails
      set(s => ({ materials: s.materials.map(x => x.id === id ? {...x, currentStock: x.currentStock + q} : x) }));
      throw error;
    }
  },
  deleteMaterial: async (id: string) => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      set(s => ({ materials: s.materials.filter(x => x.id !== id) })); // Fallback to local state
      return;
    }

    try {
      await deleteMaterialAPI(id, token);
      set(s => ({ materials: s.materials.filter(x => x.id !== id) }));
    } catch (error) {
      console.error('Failed to delete material via API:', error);
      // Fallback to local state if API fails
      set(s => ({ materials: s.materials.filter(x => x.id !== id) }));
      throw error;
    }
  },
  addMachine: (m) => set(s => ({ machines: [...s.machines, m] })),
  updateMachine: (m) => set(s => ({ machines: s.machines.map(x => x.id === m.id ? m : x) })),
  deleteMachine: (id) => { set(s => ({ machines: s.machines.filter(x => x.id !== id) })); return true; },
  toggleMaintenance: (id) => set(s => ({ machines: s.machines.map(x => x.id === id ? {...x, isMaintenance: !x.isMaintenance} : x) })),
  addUser: (u) => set(s => ({ users: [...s.users, u] })),
  updateUser: (u) => set(s => ({ users: s.users.map(x => x.id === u.id ? u : x) })),
  deleteUser: (id) => set(s => ({ users: s.users.filter(x => x.id !== id) })),
  loadUsersFromAPI: async () => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      const { getUsersAPI } = await import('../lib/api');
      const users = await getUsersAPI(token);
      set({ users });
    } catch (error) {
      console.error('Failed to load users from API:', error);
      throw error;
    }
  },
  addUserAPI: async (userData) => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      const { createUserAPI } = await import('../lib/api');
      // Prepare user data for API call
      const userDataForAPI = {
        ...userData,
        email: userData.email || userData.username,
        password: userData.password,
        password_confirmation: userData.password
      };
      const newUser = await createUserAPI(userDataForAPI as any, token);
      set(s => ({ users: [...s.users, newUser] }));
    } catch (error) {
      console.error('Failed to add user via API:', error);
      throw error;
    }
  },
  updateUserAPI: async (userData) => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      const { updateUserAPI } = await import('../lib/api');
      // Prepare user data for API call - only include password if it's provided
      const userDataForAPI: any = {
        ...userData,
        email: userData.email || userData.username,
      };

      // Only include password fields if password is provided
      if (userData.password) {
        userDataForAPI.password = userData.password;
        userDataForAPI.password_confirmation = userData.password;
      }

      const updatedUser = await updateUserAPI(userData.id, userDataForAPI, token);
      set(s => ({ users: s.users.map(u => u.id === userData.id ? updatedUser : u) }));
    } catch (error) {
      console.error('Failed to update user via API:', error);
      throw error;
    }
  },
  deleteUserAPI: async (id) => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      const { deleteUserAPI } = await import('../lib/api');
      await deleteUserAPI(id, token);
      set(s => ({ users: s.users.filter(u => u.id !== id) }));
    } catch (error) {
      console.error('Failed to delete user via API:', error);
      throw error;
    }
  },
  downloadDatabase: () => {},

  validateToWarehouse: (itemId, qty) => set(state => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return state;

    const nextAssemblyStats = { ...item.assemblyStats };
    const packingData = nextAssemblyStats['PACKING'] || { produced: 0, available: 0 };

    nextAssemblyStats['PACKING'] = {
      ...packingData,
      available: Math.max(0, packingData.available - qty)
    };

    return {
      items: state.items.map(i => i.id === itemId ? {
        ...i,
        warehouseQty: (i.warehouseQty || 0) + qty,
        assemblyStats: nextAssemblyStats
      } : i),
      logs: [{
        id: `log-wh-${Date.now()}`, taskId: 'WAREHOUSE', machineId: 'WH', itemId: itemId,
        projectId: item.projectId, step: 'PACKING', shift: 'SHIFT_1', goodQty: qty, defectQty: 0,
        operator: state.currentUser?.name || 'Admin', timestamp: new Date().toISOString(), type: 'WAREHOUSE_ENTRY'
      }, ...state.logs]
    };
  }),

  addRFQ: (rfq) => set(s => ({ rfqs: [rfq, ...s.rfqs] })),
  createPO: (po) => set(s => ({ pos: [po, ...s.pos] })),
  receiveGoods: (r) => set(s => ({ receivings: [r, ...s.receivings] })),
  createDeliveryOrder: (sj) => set(s => ({ deliveryOrders: [sj, ...s.deliveryOrders] })),
  updateDeliveryOrder: (sj) => set(s => ({ deliveryOrders: s.deliveryOrders.map(x => x.id === sj.id ? sj : x) })),
  validateDeliveryOrder: (id) => set(s => ({ deliveryOrders: s.deliveryOrders.map(x => x.id === id ? {...x, status: 'VALIDATED'} : x) })),
  deleteDeliveryOrder: (id) => set(s => ({ deliveryOrders: s.deliveryOrders.filter(x => x.id !== id) }))
}));
