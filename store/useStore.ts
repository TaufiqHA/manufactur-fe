import { create } from 'zustand';
import {
  Project, Material, ProjectItem, Machine, Task, User, ProductionLog,
  TaskStatus, ItemStepConfig, Shift, ProcessStep, SubAssembly,
  Supplier, RFQ, PurchaseOrder, ReceivingGoods, DeliveryOrder,
  ASSEMBLY_STEPS
} from '../types';
import {
  getProjectsAPI,
  createProjectAPI,
  updateProjectAPI,
  deleteProjectAPI,
  getMaterialsAPI,
  createMaterialAPI,
  updateMaterialAPI,
  deleteMaterialAPI,
  getProjectItemsAPI,
  createProjectItemAPI,
  updateProjectItemAPI,
  deleteProjectItemAPI
} from '../lib/api';

// Import supplier API functions
import {
  getSuppliersAPI,
  createSupplierAPI,
  updateSupplierAPI,
  deleteSupplierAPI,
  getRfqItemsAPI,
  createRfqItemAPI,
  updateRfqItemAPI,
  deleteRfqItemAPI,
  getPurchaseOrdersAPI,
  getPurchaseOrderAPI,
  createPurchaseOrderAPI,
  updatePurchaseOrderAPI,
  deletePurchaseOrderAPI,
  getPoItemsAPI,
  getPoItemAPI,
  createPoItemAPI,
  updatePoItemAPI,
  deletePoItemAPI,
  getReceivingGoodsAPI,
  getReceivingGoodAPI,
  createReceivingGoodAPI,
  updateReceivingGoodAPI,
  deleteReceivingGoodAPI,
  getReceivingItemsAPI,
  getReceivingItemAPI,
  createReceivingItemAPI,
  updateReceivingItemAPI,
  deleteReceivingItemAPI,
  loginAPI,
  getMachinesAPI,
  getRfqsAPI
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
  initializeData: () => Promise<void>;

  addProjectItem: (item: ProjectItem) => Promise<void>;
  deleteProjectItem: (id: string) => Promise<void>;
  loadProjectItems: (projectId?: string) => Promise<void>;
  loadSubAssemblies: (itemId?: string) => Promise<void>;
  addSubAssembly: (itemId: string, sa: SubAssembly) => Promise<void>;
  lockSubAssembly: (itemId: string, saId: string) => Promise<void>;
  deleteSubAssembly: (itemId: string, saId: string) => Promise<void>;

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
  deleteMaterial: (id: string) => void;
  adjustStock: (matId: string, amount: number) => void;
  loadMaterials: () => Promise<void>;
  loadMachines: () => Promise<void>;
  addMachine: (m: Machine) => void;
  updateMachine: (um: Machine) => void;
  deleteMachine: (id: string) => Promise<boolean>;
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
  addRFQ: (rfq: RFQ) => Promise<void>;
  updateRFQ: (id: string, rfqData: Partial<RFQ>) => Promise<void>;
  deleteRFQ: (id: string) => Promise<void>;
  loadRFQs: () => Promise<void>;
  createPO: (po: PurchaseOrder) => void;
  receiveGoods: (receiving: ReceivingGoods) => void;
  createDeliveryOrder: (sj: DeliveryOrder) => void;
  updateDeliveryOrder: (sj: DeliveryOrder) => void;
  validateDeliveryOrder: (id: string) => void;
  deleteDeliveryOrder: (id: string) => void;

  loadSuppliers: () => Promise<void>;
  addSupplier: (supplier: Supplier) => Promise<void>;
  updateSupplier: (id: string, supplierData: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  // RFQ Item functions
  loadRfqItems: () => Promise<void>;
  addRfqItem: (rfqItem: any) => Promise<void>;
  updateRfqItem: (id: string, rfqItemData: Partial<any>) => Promise<void>;
  deleteRfqItem: (id: string) => Promise<void>;

  // Purchase Order functions
  loadPOs: () => Promise<void>;
  addPO: (po: any) => Promise<void>;
  updatePO: (id: string, poData: Partial<any>) => Promise<void>;
  deletePO: (id: string) => Promise<void>;

  // PO Item functions
  loadPoItems: () => Promise<void>;
  addPoItem: (poItem: any) => Promise<void>;
  updatePoItem: (id: string, poItemData: Partial<any>) => Promise<void>;
  deletePoItem: (id: string) => Promise<void>;

  // Receiving Goods functions
  loadReceivingGoods: () => Promise<void>;
  addReceivingGood: (receivingGood: any) => Promise<void>;
  updateReceivingGood: (id: string, receivingGoodData: Partial<any>) => Promise<void>;
  deleteReceivingGood: (id: string) => Promise<void>;

  // Receiving Item functions
  loadReceivingItems: () => Promise<void>;
  addReceivingItem: (receivingItem: any) => Promise<void>;
  updateReceivingItem: (id: string, receivingItemData: Partial<any>) => Promise<void>;
  deleteReceivingItem: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
  token: localStorage.getItem('token') || null,
  projects: [],
  materials: [],
  items: [],
  machines: [],
  tasks: [],
  users: [],
  logs: [],
  suppliers: [],
  rfqs: [],
  pos: [],
  receivings: [],
  deliveryOrders: [],

  // Initialize data if user is already logged in
  initializeData: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const projects = await getProjectsAPI(token);
        const materials = await getMaterialsAPI(token);
        const machines = await getMachinesAPI(token);
        const rfqs = await getRfqsAPI(token);
        const pos = await getPurchaseOrdersAPI(token);
        set({ projects, materials, machines, rfqs, pos });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check if it's a network error
        if (errorMessage.includes('Cannot connect to backend')) {
          // Backend is unreachable
        } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }

        set({ projects: [], materials: [], machines: [], rfqs: [], pos: [] });
      }
    } else {
      set({ projects: [], materials: [], machines: [], rfqs: [], pos: [] });
    }
  },

  // Function to load materials when needed
  loadMaterials: async () => {
    const token = get().token;
    if (token) {
      try {
        const materials = await getMaterialsAPI(token);
        set({ materials });
      } catch (error) {
        set({ materials: [] });
      }
    } else {
      set({ materials: [] });
    }
  },

  can: (a, m) => true,
  login: async (email, password) => {
    try {
      const { user, token } = await loginAPI(email, password);
      set({ currentUser: user, token });
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token);

      // Load projects, materials, machines, RFQs, and POs after successful login
      if (token) {
        try {
          const projects = await getProjectsAPI(token);
          const machines = await getMachinesAPI(token);
          set({ projects, machines });
          // Load materials using the loadMaterials function
          await get().loadMaterials();
          // Load RFQs using the new loadRFQs function
          await get().loadRFQs();
          // Load POs using the new loadPOs function
          await get().loadPOs();
        } catch (error) {
          // Set empty arrays if loading fails
          set({ projects: [], materials: [], machines: [], rfqs: [], pos: [] });
        }
      } else {
        // If no token, set empty projects, materials, machines, RFQs, and POs
        set({ projects: [], materials: [], machines: [], rfqs: [], pos: [] });
      }

      return true;
    } catch (error) {
      return false;
    }
  },
  logout: () => {
    // Try to call the logout API if we have a token
    const token = get().token;
    if (token) {
      import('../lib/api').then(mod => {
        mod.logoutAPI(token).catch(() => {
          // Logout API failed
        });
      });
    }

    set({ currentUser: null, token: null, projects: [], materials: [], machines: [], users: [] });
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  },

  addProjectItem: async (item) => {
    const token = get().token;
    if (!token) {
      set(s => ({ items: [...s.items, item] })); // Fallback to local state
      return;
    }

    try {
      const projectItemData = {
        project_id: item.projectId,
        name: item.name,
        dimensions: item.dimensions,
        thickness: item.thickness,
        qty_set: item.qtySet,
        quantity: item.quantity,
        unit: item.unit,
        is_bom_locked: item.isBomLocked,
        is_workflow_locked: item.isWorkflowLocked,
        flow_type: item.flowType,
        warehouse_qty: item.warehouseQty || 0,
        shipped_qty: item.shippedQty || 0
      };

      const createdProjectItem = await createProjectItemAPI(projectItemData, token);

      // Transform API response to match the ProjectItem type
      const transformedItem: ProjectItem = {
        id: createdProjectItem.id,
        projectId: createdProjectItem.project_id,
        name: createdProjectItem.name,
        dimensions: createdProjectItem.dimensions,
        thickness: createdProjectItem.thickness,
        qtySet: createdProjectItem.qty_set,
        quantity: createdProjectItem.quantity,
        unit: createdProjectItem.unit,
        isBomLocked: createdProjectItem.is_bom_locked,
        isWorkflowLocked: createdProjectItem.is_workflow_locked,
        flowType: createdProjectItem.flow_type,
        warehouseQty: createdProjectItem.warehouse_qty,
        shippedQty: createdProjectItem.shipped_qty,
        bom: [],
        workflow: [],
        subAssemblies: [],
        assemblyStats: {}
      };

      set(s => ({ items: [...s.items, transformedItem] }));
    } catch (error) {
      // Fallback to local state if API fails
      set(s => ({ items: [...s.items, item] }));
      throw error;
    }
  },

  deleteProjectItem: async (id) => {
    const token = get().token;
    if (!token) {
      set(s => ({ items: s.items.filter(i => i.id !== id) })); // Fallback to local state
      return;
    }

    try {
      await deleteProjectItemAPI(id, token);
      set(s => ({ items: s.items.filter(i => i.id !== id) }));
    } catch (error) {
      // Fallback to local state if API fails
      set(s => ({ items: s.items.filter(i => i.id !== id) }));
      throw error;
    }
  },

  loadProjectItems: async (projectId?) => {
    const token = get().token;
    if (!token) {
      return;
    }

    try {
      const projectItems = await getProjectItemsAPI(token, projectId);

      // Transform API response to match the ProjectItem type
      const transformedItems = projectItems.map((item: any) => ({
        id: item.id,
        projectId: item.project_id,
        name: item.name,
        dimensions: item.dimensions,
        thickness: item.thickness,
        qtySet: item.qty_set,
        quantity: item.quantity,
        unit: item.unit,
        isBomLocked: item.is_bom_locked,
        isWorkflowLocked: item.is_workflow_locked,
        flowType: item.flow_type,
        warehouseQty: item.warehouse_qty,
        shippedQty: item.shipped_qty,
        bom: [],
        workflow: [],
        subAssemblies: [],
        assemblyStats: {}
      }));

      set({ items: transformedItems });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if it's a network error
      if (errorMessage.includes('Cannot connect to backend')) {
        // Backend API is unreachable
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      } else if (errorMessage.includes('500')) {
        // Server error encountered
      }

      // Don't crash - just set empty items and continue
      // This allows the page to still work even if items can't be loaded
      set({ items: [] });
    }
  },

  loadSubAssemblies: async (itemId?) => {
    const token = get().token;
    if (!token) {
      return;
    }

    try {
      const subAssemblies = await import('../lib/api').then(mod =>
        mod.getSubAssembliesAPI(token, itemId)
      );

      // Update items in state with their sub assemblies
      set(s => {
        if (itemId) {
          // Update specific item with its sub assemblies
          return {
            items: s.items.map(item =>
              item.id === itemId ? { ...item, subAssemblies } : item
            )
          };
        } else {
          // Group sub assemblies by item_id and update all items
          const subAssembliesByItem = subAssemblies.reduce((acc, sa) => {
            if (!acc[sa.item_id]) {
              acc[sa.item_id] = [];
            }
            acc[sa.item_id].push(sa);
            return acc;
          }, {} as Record<string, any[]>);

          return {
            items: s.items.map(item => ({
              ...item,
              subAssemblies: subAssembliesByItem[item.id] || item.subAssemblies
            }))
          };
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if it's a network error
      if (errorMessage.includes('Cannot connect to backend')) {
        // Backend API is unreachable
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      } else if (errorMessage.includes('500')) {
        // Server error encountered
      }

      // Don't crash - just continue with existing sub assemblies
      // This allows the page to still work even if sub assemblies can't be loaded
    }
  },

  addSubAssembly: async (itemId, sa) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({
        items: s.items.map(i => i.id === itemId ? { ...i, subAssemblies: [...i.subAssemblies, { ...sa, stepStats: {} }] } : i)
      }));
      return;
    }

    try {
      const subAssemblyData = {
        item_id: itemId,
        name: sa.name,
        qty_per_parent: sa.qtyPerParent,
        total_needed: sa.totalNeeded,
        completed_qty: sa.completedQty || 0,
        total_produced: sa.totalProduced || 0,
        consumed_qty: sa.consumedQty || 0,
        material_id: sa.materialId,
        processes: sa.processes,
        step_stats: sa.stepStats || {},
        is_locked: sa.isLocked || false
      };

      const createdSubAssembly = await import('../lib/api').then(mod =>
        mod.createSubAssemblyAPI(subAssemblyData, token)
      );

      // Update the state with the created sub assembly from the API
      set(s => ({
        items: s.items.map(i => i.id === itemId ? { ...i, subAssemblies: [...i.subAssemblies, createdSubAssembly] } : i)
      }));
    } catch (error) {
      console.error('Failed to create sub assembly via API:', error);
      // Fallback to local state if API fails
      set(s => ({
        items: s.items.map(i => i.id === itemId ? { ...i, subAssemblies: [...i.subAssemblies, { ...sa, stepStats: {} }] } : i)
      }));
      throw error;
    }
  },

  lockSubAssembly: async (itemId, saId) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({
        items: s.items.map(i => i.id === itemId ? {
          ...i,
          subAssemblies: i.subAssemblies.map(sa => sa.id === saId ? { ...sa, isLocked: true } : sa)
        } : i)
      }));
      return;
    }

    try {
      const updatedSubAssembly = await import('../lib/api').then(mod =>
        mod.updateSubAssemblyAPI(saId, { is_locked: true }, token)
      );

      // Update the state with the updated sub assembly from the API
      set(s => ({
        items: s.items.map(i => i.id === itemId ? {
          ...i,
          subAssemblies: i.subAssemblies.map(sa => sa.id === saId ? updatedSubAssembly : sa)
        } : i)
      }));
    } catch (error) {
      console.error('Failed to lock sub assembly via API:', error);
      // Fallback to local state if API fails
      set(s => ({
        items: s.items.map(i => i.id === itemId ? {
          ...i,
          subAssemblies: i.subAssemblies.map(sa => sa.id === saId ? { ...sa, isLocked: true } : sa)
        } : i)
      }));
      throw error;
    }
  },

  deleteSubAssembly: async (itemId, saId) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({
        items: s.items.map(i => i.id === itemId ? { ...i, subAssemblies: i.subAssemblies.filter(sa => sa.id !== saId) } : i)
      }));
      return;
    }

    try {
      await import('../lib/api').then(mod =>
        mod.deleteSubAssemblyAPI(saId, token)
      );

      // Update the state to remove the deleted sub assembly
      set(s => ({
        items: s.items.map(i => i.id === itemId ? { ...i, subAssemblies: i.subAssemblies.filter(sa => sa.id !== saId) } : i)
      }));
    } catch (error) {
      console.error('Failed to delete sub assembly via API:', error);
      // Fallback to local state if API fails
      set(s => ({
        items: s.items.map(i => i.id === itemId ? { ...i, subAssemblies: i.subAssemblies.filter(sa => sa.id !== saId) } : i)
      }));
      throw error;
    }
  },

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
      // Reload projects to ensure consistency even if there's an error
      try {
        const token = get().token;
        if (token) {
          const projects = await getProjectsAPI(token);
          set(s => ({ projects }));
        }
      } catch (reloadError) {
        // Failed to reload projects
      }
      throw error;
    }
  },

  updateProject: async (p) => {
    const token = get().token;
    if (!token) {
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
        // Failed to reload projects
      }
      throw error;
    }
  },

  validateProject: async (id) => {
    const token = get().token;
    if (!token) {
      return;
    }

    try {
      const updatedProject = await updateProjectAPI(id, { isLocked: true, status: 'IN_PROGRESS' } as Partial<Project>, token);
      // Reload projects to ensure consistency with backend
      const updatedProjects = await getProjectsAPI(token);
      set(s => ({ projects: updatedProjects }));
    } catch (error) {
      // Reload projects to ensure consistency even if there's an error
      try {
        const token = get().token;
        if (token) {
          const projects = await getProjectsAPI(token);
          set(s => ({ projects }));
        }
      } catch (reloadError) {
        // Failed to reload projects
      }
      throw error;
    }
  },

  deleteProject: async (id) => {
    const token = get().token;
    if (!token) {
      return;
    }

    try {
      await deleteProjectAPI(id, token);
      // Reload projects to ensure consistency with backend
      const updatedProjects = await getProjectsAPI(token);
      set(s => ({ projects: updatedProjects }));
    } catch (error) {
      // Reload projects to ensure consistency even if there's an error
      try {
        const token = get().token;
        if (token) {
          const projects = await getProjectsAPI(token);
          set(s => ({ projects }));
        }
      } catch (reloadError) {
        // Failed to reload projects
      }
      throw error;
    }
  },

  reloadProjects: async () => {
    const token = get().token;
    if (!token) {
      set({ projects: [], materials: [], machines: [], users: [], rfqs: [], pos: [] });
      return;
    }

    try {
      const projects = await getProjectsAPI(token);
      const materials = await getMaterialsAPI(token);
      const machines = await import('../lib/api').then(mod => mod.getMachinesAPI(token));
      const rfqs = await import('../lib/api').then(mod => mod.getRfqsAPI(token));
      const pos = await import('../lib/api').then(mod => mod.getPurchaseOrdersAPI(token));
      const { getUsersAPI } = await import('../lib/api');
      const users = await getUsersAPI(token);
      set({ projects, materials, machines, rfqs, pos, users });
    } catch (error) {
      set({ projects: [], materials: [], machines: [], rfqs: [], pos: [], users: [] });
    }
  },

  addMaterial: async (m) => {
    const token = get().token;
    if (!token) {
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
      // Fallback to local state if API fails
      set(s => ({ materials: s.materials.map(x => x.id === m.id ? m : x) }));
      throw error;
    }
  },
  adjustStock: async (id, q) => {
    const token = get().token;
    if (!token) {
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
      // Fallback to local state if API fails
      set(s => ({ materials: s.materials.map(x => x.id === id ? {...x, currentStock: x.currentStock + q} : x) }));
      throw error;
    }
  },
  deleteMaterial: async (id: string) => {
    const token = get().token;
    if (!token) {
      set(s => ({ materials: s.materials.filter(x => x.id !== id) })); // Fallback to local state
      return;
    }

    try {
      await deleteMaterialAPI(id, token);
      set(s => ({ materials: s.materials.filter(x => x.id !== id) }));
    } catch (error) {
      // Fallback to local state if API fails
      set(s => ({ materials: s.materials.filter(x => x.id !== id) }));
      throw error;
    }
  },
  addMachine: async (m) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ machines: [...s.machines, m] }));
      return;
    }

    try {
      // Format the machine data for the API
      const machineData = {
        user_id: m.userId,
        code: m.code,
        name: m.name,
        type: m.type,
        capacity_per_hour: m.capacityPerHour,
        status: m.status,
        is_maintenance: m.isMaintenance
      };

      // Create the machine via API
      const createdMachine = await import('../lib/api').then(mod =>
        mod.createMachineAPI(machineData, token)
      );

      // Update the state with the created machine from the API (which may have additional fields)
      set(s => ({ machines: [...s.machines, createdMachine] }));
    } catch (error) {
      console.error('Failed to create machine via API:', error);
      // Fallback to local state if API fails
      set(s => ({ machines: [...s.machines, m] }));
      throw error;
    }
  },
  updateMachine: async (m) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ machines: s.machines.map(x => x.id === m.id ? m : x) }));
      return;
    }

    try {
      // Format the machine data for the API
      const machineData = {
        user_id: m.userId,
        code: m.code,
        name: m.name,
        type: m.type,
        capacity_per_hour: m.capacityPerHour,
        status: m.status,
        is_maintenance: m.isMaintenance
      };

      // Update the machine via API
      const updatedMachine = await import('../lib/api').then(mod =>
        mod.updateMachineAPI(m.id, machineData, token)
      );

      // Update the state with the updated machine from the API
      set(s => ({ machines: s.machines.map(x => x.id === m.id ? updatedMachine : x) }));
    } catch (error) {
      console.error('Failed to update machine via API:', error);
      // Fallback to local state if API fails
      set(s => ({ machines: s.machines.map(x => x.id === m.id ? m : x) }));
      throw error;
    }
  },
  deleteMachine: async (id) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ machines: s.machines.filter(x => x.id !== id) }));
      return true;
    }

    try {
      // Delete the machine via API
      await import('../lib/api').then(mod =>
        mod.deleteMachineAPI(id, token)
      );

      // Update the state to remove the deleted machine
      set(s => ({ machines: s.machines.filter(x => x.id !== id) }));
      return true;
    } catch (error) {
      console.error('Failed to delete machine via API:', error);
      // Fallback to local state if API fails
      set(s => ({ machines: s.machines.filter(x => x.id !== id) }));
      return true;
    }
  },
  toggleMaintenance: async (id) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ machines: s.machines.map(x => x.id === id ? {...x, isMaintenance: !x.isMaintenance} : x) }));
      return;
    }

    try {
      // Toggle maintenance via API
      const updatedMachine = await import('../lib/api').then(mod =>
        mod.toggleMachineMaintenanceAPI(id, token)
      );

      // Update the state with the updated machine from the API
      set(s => ({ machines: s.machines.map(x => x.id === id ? updatedMachine : x) }));
    } catch (error) {
      console.error('Failed to toggle machine maintenance via API:', error);
      // Fallback to local state if API fails
      set(s => ({ machines: s.machines.map(x => x.id === id ? {...x, isMaintenance: !x.isMaintenance} : x) }));
      throw error;
    }
  },
  addUser: (u) => set(s => ({ users: [...s.users, u] })),
  updateUser: (u) => set(s => ({ users: s.users.map(x => x.id === u.id ? u : x) })),
  deleteUser: (id) => set(s => ({ users: s.users.filter(x => x.id !== id) })),
  loadUsersFromAPI: async () => {
    const token = get().token;
    if (!token) {
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
      const userDataForAPI: any = {
        ...userData,
        email: userData.email || userData.username,
      };

      if ((userData as any).password) {
        userDataForAPI.password = (userData as any).password;
        userDataForAPI.password_confirmation = (userData as any).password;
      }
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
      if ('password' in userData && userData.password) {
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

  addRFQ: async (rfq) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ rfqs: [rfq, ...s.rfqs] }));
      return;
    }

    try {
      // Format the RFQ data for the API
      const rfqData = {
        code: rfq.code,
        date: rfq.date,
        description: rfq.description,
        status: rfq.status,
        items: rfq.items.map(item => ({
          material_id: item.materialId,
          name: item.name,
          qty: item.qty,
          price: item.price
        }))
      };

      // Create the RFQ via API
      const createdRfq = await import('../lib/api').then(mod =>
        mod.createRfqAPI(rfqData, token)
      );

      // Update the state with the created RFQ from the API (which may have additional fields)
      set(s => ({ rfqs: [createdRfq, ...s.rfqs] }));
    } catch (error) {
      console.error('Failed to create RFQ via API:', error);
      // Fallback to local state if API fails
      set(s => ({ rfqs: [rfq, ...s.rfqs] }));
      throw error;
    }
  },
  updateRFQ: async (id, rfqData) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ rfqs: s.rfqs.map(r => r.id === id ? { ...r, ...rfqData } : r) }));
      return;
    }

    try {
      // Update the RFQ via API
      const updatedRfq = await import('../lib/api').then(mod =>
        mod.updateRfqAPI(id, rfqData, token)
      );

      // Update the state with the updated RFQ from the API
      set(s => ({ rfqs: s.rfqs.map(r => r.id === id ? updatedRfq : r) }));
    } catch (error) {
      console.error('Failed to update RFQ via API:', error);
      // Fallback to local state if API fails
      set(s => ({ rfqs: s.rfqs.map(r => r.id === id ? { ...r, ...rfqData } : r) }));
      throw error;
    }
  },
  deleteRFQ: async (id) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ rfqs: s.rfqs.filter(r => r.id !== id) }));
      return;
    }

    try {
      // Delete the RFQ via API
      await import('../lib/api').then(mod =>
        mod.deleteRfqAPI(id, token)
      );

      // Update the state to remove the deleted RFQ
      set(s => ({ rfqs: s.rfqs.filter(r => r.id !== id) }));
    } catch (error) {
      console.error('Failed to delete RFQ via API:', error);
      // Fallback to local state if API fails
      set(s => ({ rfqs: s.rfqs.filter(r => r.id !== id) }));
      throw error;
    }
  },
  loadRFQs: async () => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      // Load RFQs first
      const rfqs = await import('../lib/api').then(mod =>
        mod.getRfqsAPI(token)
      );

      // Load RFQ items to associate with RFQs
      const rfqItems = await import('../lib/api').then(mod =>
        mod.getRfqsAPI(token) // This might not be correct - let's load RFQ items separately
      );

      // Actually, let's load RFQ items separately
      let allRfqItems: any[] = [];
      try {
        allRfqItems = await import('../lib/api').then(mod =>
          mod.getRfqItemsAPI(token)
        );
      } catch (itemsError) {
        console.error('Failed to load RFQ items, continuing with RFQs only:', itemsError);
        // Continue with just the RFQs if items fail to load
        set({ rfqs });
        return;
      }

      // Group RFQ items by rfq_id to associate with RFQs
      const itemsByRfq = allRfqItems.reduce((acc, item) => {
        if (!acc[item.rfq_id]) {
          acc[item.rfq_id] = [];
        }
        acc[item.rfq_id].push({
          materialId: item.material_id,
          name: item.name,
          qty: item.qty,
          price: item.price
        });
        return acc;
      }, {} as Record<string, any[]>);

      // Update RFQs with their associated items
      const rfqsWithItems = rfqs.map((rfq: any) => ({
        ...rfq,
        items: itemsByRfq[rfq.id] || []
      }));

      set({ rfqs: rfqsWithItems });
    } catch (error) {
      console.error('Failed to load RFQs from API:', error);
      set({ rfqs: [] });
      throw error;
    }
  },
  loadMachines: async () => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      const machines = await import('../lib/api').then(mod => mod.getMachinesAPI(token));
      set({ machines });
    } catch (error) {
      console.error('Failed to load machines from API:', error);
      set({ machines: [] });
      throw error;
    }
  },
  loadSuppliers: async () => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      const suppliers = await getSuppliersAPI(token);
      set({ suppliers });
    } catch (error) {
      console.error('Failed to load suppliers from API:', error);
      set({ suppliers: [] });
      throw error;
    }
  },
  addSupplier: async (supplier) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ suppliers: [supplier, ...s.suppliers] }));
      return;
    }

    try {
      // Format the supplier data for the API
      const supplierData = {
        name: supplier.name,
        address: supplier.address,
        contact: supplier.contact,
      };

      // Create the supplier via API
      const createdSupplier = await createSupplierAPI(supplierData, token);

      // Update the state with the created supplier from the API (which may have additional fields)
      set(s => ({ suppliers: [createdSupplier, ...s.suppliers] }));
    } catch (error) {
      console.error('Failed to create supplier via API:', error);
      // Fallback to local state if API fails
      set(s => ({ suppliers: [supplier, ...s.suppliers] }));
      throw error;
    }
  },
  updateSupplier: async (id, supplierData) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ suppliers: s.suppliers.map(sup => sup.id === id ? { ...sup, ...supplierData } : sup) }));
      return;
    }

    try {
      // Update the supplier via API
      const updatedSupplier = await updateSupplierAPI(id, supplierData, token);

      // Update the state with the updated supplier from the API
      set(s => ({ suppliers: s.suppliers.map(sup => sup.id === id ? updatedSupplier : sup) }));
    } catch (error) {
      console.error('Failed to update supplier via API:', error);
      // Fallback to local state if API fails
      set(s => ({ suppliers: s.suppliers.map(sup => sup.id === id ? { ...sup, ...supplierData } : sup) }));
      throw error;
    }
  },
  deleteSupplier: async (id) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ suppliers: s.suppliers.filter(sup => sup.id !== id) }));
      return;
    }

    try {
      // Delete the supplier via API
      await deleteSupplierAPI(id, token);

      // Update the state to remove the deleted supplier
      set(s => ({ suppliers: s.suppliers.filter(sup => sup.id !== id) }));
    } catch (error) {
      console.error('Failed to delete supplier via API:', error);
      // Fallback to local state if API fails
      set(s => ({ suppliers: s.suppliers.filter(sup => sup.id !== id) }));
      throw error;
    }
  },
  createPO: async (po) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ pos: [po, ...s.pos] }));
      return;
    }

    try {
      // Format the PO data for the API
      const poData = {
        code: po.code,
        date: po.date,
        supplier_id: po.supplierId,
        rfq_id: po.rfq_id || po.rfqId,
        description: po.description,
        status: po.status,
        grand_total: po.grandTotal,
        po_items: Array.isArray(po.items) ? po.items.map(item => ({
          material_id: item.materialId || item.material_id,
          name: item.name,
          qty: item.qty,
          price: item.price
        })) : []
      };

      // Create the PO via API
      const createdPo = await createPurchaseOrderAPI(poData, token);

      // Update the state with the created PO from the API (which may have additional fields)
      set(s => ({ pos: [createdPo, ...s.pos] }));
    } catch (error) {
      console.error('Failed to create PO via API:', error);
      // Fallback to local state if API fails
      set(s => ({ pos: [po, ...s.pos] }));
      throw error;
    }
  },
  receiveGoods: (r) => set(s => ({ receivings: [r, ...s.receivings] })),
  createDeliveryOrder: (sj) => set(s => ({ deliveryOrders: [sj, ...s.deliveryOrders] })),
  updateDeliveryOrder: (sj) => set(s => ({ deliveryOrders: s.deliveryOrders.map(x => x.id === sj.id ? sj : x) })),
  validateDeliveryOrder: (id) => set(s => ({ deliveryOrders: s.deliveryOrders.map(x => x.id === id ? {...x, status: 'VALIDATED'} : x) })),
  deleteDeliveryOrder: (id) => set(s => ({ deliveryOrders: s.deliveryOrders.filter(x => x.id !== id) })),

  // RFQ Item functions
  loadRfqItems: async () => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      const rfqItems = await getRfqItemsAPI(token);
      // We don't store RFQ items in the state since they're part of RFQs
      // This function is just a wrapper for the API call
    } catch (error) {
      console.error('Failed to load RFQ items from API:', error);
      throw error;
    }
  },
  addRfqItem: async (rfqItem) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      console.error('No token available for API call');
      return;
    }

    try {
      // Create the RFQ item via API
      const createdRfqItem = await createRfqItemAPI(rfqItem, token);
      return createdRfqItem;
    } catch (error) {
      console.error('Failed to create RFQ item via API:', error);
      throw error;
    }
  },
  updateRfqItem: async (id, rfqItemData) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      console.error('No token available for API call');
      return;
    }

    try {
      // Update the RFQ item via API
      const updatedRfqItem = await updateRfqItemAPI(id, rfqItemData, token);
      return updatedRfqItem;
    } catch (error) {
      console.error('Failed to update RFQ item via API:', error);
      throw error;
    }
  },
  deleteRfqItem: async (id) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      console.error('No token available for API call');
      return;
    }

    try {
      // Delete the RFQ item via API
      await deleteRfqItemAPI(id, token);
    } catch (error) {
      console.error('Failed to delete RFQ item via API:', error);
      throw error;
    }
  },

  // Purchase Order functions
  loadPOs: async () => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      const pos = await getPurchaseOrdersAPI(token);
      set({ pos });
    } catch (error) {
      console.error('Failed to load purchase orders from API:', error);
      set({ pos: [] });
      throw error;
    }
  },
  addPO: async (po) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ pos: [po, ...s.pos] }));
      return;
    }

    try {
      // Format the PO data for the API
      const poData = {
        code: po.code,
        date: po.date,
        supplier_id: po.supplierId,
        rfq_id: po.rfq_id || po.rfqId,
        description: po.description,
        status: po.status,
        grand_total: po.grandTotal,
        po_items: Array.isArray(po.items) ? po.items.map(item => ({
          material_id: item.materialId || item.material_id,
          name: item.name,
          qty: item.qty,
          price: item.price
        })) : []
      };

      // Create the PO via API
      const createdPo = await createPurchaseOrderAPI(poData, token);

      // Update the state with the created PO from the API (which may have additional fields)
      set(s => ({ pos: [createdPo, ...s.pos] }));
    } catch (error) {
      console.error('Failed to create PO via API:', error);
      // Fallback to local state if API fails
      set(s => ({ pos: [po, ...s.pos] }));
      throw error;
    }
  },
  updatePO: async (id, poData) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ pos: s.pos.map(p => p.id === id ? { ...p, ...poData } : p) }));
      return;
    }

    try {
      // For status-only updates, we might need to send a complete PO object to satisfy backend validation
      // First, get the current PO from the store to have all the required data
      const currentPO = get().pos.find(p => p.id === id);

      // If we have the current PO data, merge it with the updates
      let fullPoData = poData;
      if (currentPO && Object.keys(poData).length === 1 && poData.status !== undefined) {
        // If only updating status, send the complete PO data with the new status
        fullPoData = {
          ...currentPO,
          status: poData.status
        };
      }

      const updatedPo = await updatePurchaseOrderAPI(id, fullPoData, token);

      // Update the state with the updated PO from the API
      set(s => ({ pos: s.pos.map(p => p.id === id ? updatedPo : p) }));
    } catch (error) {
      console.error('Failed to update PO via API:', error);
      // Fallback to local state if API fails
      set(s => ({ pos: s.pos.map(p => p.id === id ? { ...p, ...poData } : p) }));
      throw error;
    }
  },
  deletePO: async (id) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ pos: s.pos.filter(p => p.id !== id) }));
      return;
    }

    try {
      // Delete the PO via API
      await deletePurchaseOrderAPI(id, token);

      // Update the state to remove the deleted PO
      set(s => ({ pos: s.pos.filter(p => p.id !== id) }));
    } catch (error) {
      console.error('Failed to delete PO via API:', error);
      // Fallback to local state if API fails
      set(s => ({ pos: s.pos.filter(p => p.id !== id) }));
      throw error;
    }
  },

  // PO Item functions
  loadPoItems: async () => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      const poItems = await getPoItemsAPI(token);
      // We don't store PO items separately in the state since they're part of POs
      // This function is just a wrapper for the API call
    } catch (error) {
      console.error('Failed to load PO items from API:', error);
      throw error;
    }
  },
  addPoItem: async (poItem) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      console.error('No token available for API call');
      return;
    }

    try {
      // Create the PO item via API
      const createdPoItem = await createPoItemAPI(poItem, token);
      return createdPoItem;
    } catch (error) {
      console.error('Failed to create PO item via API:', error);
      throw error;
    }
  },
  updatePoItem: async (id, poItemData) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      console.error('No token available for API call');
      return;
    }

    try {
      // Update the PO item via API
      const updatedPoItem = await updatePoItemAPI(id, poItemData, token);
      return updatedPoItem;
    } catch (error) {
      console.error('Failed to update PO item via API:', error);
      throw error;
    }
  },
  deletePoItem: async (id) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      console.error('No token available for API call');
      return;
    }

    try {
      // Delete the PO item via API
      await deletePoItemAPI(id, token);
    } catch (error) {
      console.error('Failed to delete PO item via API:', error);
      throw error;
    }
  },

  // Receiving Goods functions
  loadReceivingGoods: async () => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      const receivingGoods = await getReceivingGoodsAPI(token);
      set({ receivings: receivingGoods });
    } catch (error) {
      console.error('Failed to load receiving goods from API:', error);
      set({ receivings: [] });
      throw error;
    }
  },
  addReceivingGood: async (receivingGood) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ receivings: [receivingGood, ...s.receivings] }));
      return;
    }

    try {
      // Create a clean receiving good data object with only required fields
      const receivingGoodData = {
        code: receivingGood.code,
        date: receivingGood.date,
        po_id: receivingGood.poId || receivingGood.po_id,
        items: Array.isArray(receivingGood.items) ? receivingGood.items.map(item => ({
          material_id: item.materialId || item.material_id,
          name: item.name,
          qty: Number(item.qty)
        })) : []
      };

      // Create the receiving good via API
      const createdReceivingGood = await createReceivingGoodAPI(receivingGoodData, token);

      // Update the state with the created receiving good from the API (which may have additional fields)
      set(s => ({ receivings: [createdReceivingGood, ...s.receivings] }));
    } catch (error) {
      console.error('Failed to create receiving good via API:', error);
      // Fallback to local state if API fails
      set(s => ({ receivings: [receivingGood, ...s.receivings] }));
      throw error;
    }
  },
  updateReceivingGood: async (id, receivingGoodData) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ receivings: s.receivings.map(r => r.id === id ? { ...r, ...receivingGoodData } : r) }));
      return;
    }

    try {
      // Update the receiving good via API
      const updatedReceivingGood = await updateReceivingGoodAPI(id, receivingGoodData, token);

      // Update the state with the updated receiving good from the API
      set(s => ({ receivings: s.receivings.map(r => r.id === id ? updatedReceivingGood : r) }));
    } catch (error) {
      console.error('Failed to update receiving good via API:', error);
      // Fallback to local state if API fails
      set(s => ({ receivings: s.receivings.map(r => r.id === id ? { ...r, ...receivingGoodData } : r) }));
      throw error;
    }
  },
  deleteReceivingGood: async (id) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      set(s => ({ receivings: s.receivings.filter(r => r.id !== id) }));
      return;
    }

    try {
      // Delete the receiving good via API
      await deleteReceivingGoodAPI(id, token);

      // Update the state to remove the deleted receiving good
      set(s => ({ receivings: s.receivings.filter(r => r.id !== id) }));
    } catch (error) {
      console.error('Failed to delete receiving good via API:', error);
      // Fallback to local state if API fails
      set(s => ({ receivings: s.receivings.filter(r => r.id !== id) }));
      throw error;
    }
  },

  // Receiving Item functions
  loadReceivingItems: async () => {
    const token = get().token;
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      const receivingItems = await getReceivingItemsAPI(token);
      // We don't store receiving items separately in the state since they're part of receiving goods
      // This function is just a wrapper for the API call
    } catch (error) {
      console.error('Failed to load receiving items from API:', error);
      throw error;
    }
  },
  addReceivingItem: async (receivingItem) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      console.error('No token available for API call');
      return;
    }

    try {
      // Create the receiving item via API
      const createdReceivingItem = await createReceivingItemAPI(receivingItem, token);
      return createdReceivingItem;
    } catch (error) {
      console.error('Failed to create receiving item via API:', error);
      throw error;
    }
  },
  updateReceivingItem: async (id, receivingItemData) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      console.error('No token available for API call');
      return;
    }

    try {
      // Update the receiving item via API
      const updatedReceivingItem = await updateReceivingItemAPI(id, receivingItemData, token);
      return updatedReceivingItem;
    } catch (error) {
      console.error('Failed to update receiving item via API:', error);
      throw error;
    }
  },
  deleteReceivingItem: async (id) => {
    const token = get().token;
    if (!token) {
      // Fallback to local state if no token
      console.error('No token available for API call');
      return;
    }

    try {
      // Delete the receiving item via API
      await deleteReceivingItemAPI(id, token);
    } catch (error) {
      console.error('Failed to delete receiving item via API:', error);
      throw error;
    }
  }
}));
