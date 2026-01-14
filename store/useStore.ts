import { create } from "zustand";
import {
  Project,
  Material,
  ProjectItem,
  Machine,
  Task,
  User,
  ProductionLog,
  TaskStatus,
  ItemStepConfig,
  Shift,
  ProcessStep,
  SubAssembly,
  Supplier,
  RFQ,
  PurchaseOrder,
  ReceivingGoods,
  DeliveryOrder,
  ASSEMBLY_STEPS,
} from "../types";
import {
  projectsAPI,
  materialsAPI,
  machinesAPI,
  projectItemsAPI,
  tasksAPI,
  usersAPI,
  productionLogsAPI,
  suppliersAPI,
  rfqsAPI,
  purchaseOrdersAPI,
  receivingGoodsAPI,
  deliveryOrdersAPI,
  authAPI,
  subAssembliesAPI,
} from "../services/api";

// Helper function to convert SQLite boolean values (0/1) to JavaScript booleans
// Excludes specific fields that should remain as numbers
const convertSqliteBooleans = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;

  const converted = { ...obj };
  for (const key in converted) {
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

    if (
      !numericFieldsToPreserve.includes(key) &&
      typeof converted[key] === "number" &&
      (converted[key] === 0 || converted[key] === 1)
    ) {
      converted[key] = Boolean(converted[key]);
    }
    // Handle stats objects specially to preserve numeric values
    else if (
      (key === "stepStats" || key === "assemblyStats") &&
      typeof converted[key] === "object" &&
      converted[key] !== null
    ) {
      // Process each step in the stats object to preserve numeric values
      const updatedStats = {};
      for (const step in converted[key]) {
        const stepData = converted[key][step];
        updatedStats[step] = {
          produced:
            typeof stepData.produced === "number"
              ? stepData.produced
              : stepData.produced === true
              ? 1
              : stepData.produced === false
              ? 0
              : stepData.produced,
          available:
            typeof stepData.available === "number"
              ? stepData.available
              : stepData.available === true
              ? 1
              : stepData.available === false
              ? 0
              : stepData.available,
        };
      }
      converted[key] = updatedStats;
    } else if (typeof converted[key] === "object" && converted[key] !== null) {
      converted[key] = convertSqliteBooleans(converted[key]);
    }
  }
  return converted;
};

// Helper function to convert API response to expected frontend format
const normalizeResponse = (data) => {
  // The API service already handles boolean conversion and pagination unwrapping
  return data;
};

// Helper function to handle API errors
const handleApiError = (error) => {
  // You can add more sophisticated error handling here
  throw error;
};

interface AppState {
  currentUser: User | null;
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

  // Initialize the store with data from the API
  initialize: () => Promise<void>;

  can: (action: string, module: string) => boolean;
  login: (username: string) => Promise<boolean>;
  logout: () => void;

  addProjectItem: (item: ProjectItem) => Promise<void>;
  deleteProjectItem: (id: string) => Promise<void>;
  addSubAssembly: (itemId: string, sa: SubAssembly) => Promise<void>;
  lockSubAssembly: (itemId: string, saId: string) => Promise<void>;
  deleteSubAssembly: (itemId: string, saId: string) => Promise<void>;

  validateWorkflow: (
    itemId: string,
    workflow: ItemStepConfig[]
  ) => Promise<void>;
  validateFlowAssembly: (itemId: string) => Promise<void>;
  unlockWorkflow: (itemId: string) => Promise<void>;
  reportProduction: (
    taskId: string,
    goodQty: number,
    defectQty: number,
    shift: Shift,
    operator: string
  ) => Promise<void>;
  setTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  startDowntime: (taskId: string) => Promise<void>;
  endDowntime: (taskId: string) => Promise<void>;

  addProject: (p: Project) => Promise<void>;
  updateProject: (p: Project) => Promise<void>;
  validateProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMaterial: (m: Material) => Promise<void>;
  updateMaterial: (um: Material) => Promise<void>;
  adjustStock: (matId: string, amount: number) => Promise<void>;
  addMachine: (m: Machine) => Promise<void>;
  updateMachine: (um: Machine) => Promise<void>;
  deleteMachine: (id: string) => Promise<boolean>;
  toggleMaintenance: (macId: string) => Promise<void>;
  addUser: (u: User) => Promise<void>;
  updateUser: (u: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  downloadDatabase: () => void;
  validateToWarehouse: (itemId: string, qty: number) => Promise<void>;
  addRFQ: (rfq: RFQ) => Promise<void>;
  createPO: (po: PurchaseOrder) => Promise<void>;
  receiveGoods: (receiving: ReceivingGoods) => Promise<void>;
  addSupplier: (supplier: Supplier) => Promise<void>;
  refreshRFQs: () => Promise<void>;
  createDeliveryOrder: (sj: DeliveryOrder) => Promise<void>;
  updateDeliveryOrder: (sj: DeliveryOrder) => Promise<void>;
  validateDeliveryOrder: (id: string) => Promise<void>;
  deleteDeliveryOrder: (id: string) => Promise<void>;
  updatePO: (po: PurchaseOrder) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: JSON.parse(localStorage.getItem("currentUser") || "null"),
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

  // Initialize the store by fetching data from the API
  initialize: async () => {
    try {
      // Fetch all data from the API
      const [
        projectsRes,
        materialsRes,
        itemsRes,
        machinesRes,
        tasksRes,
        usersRes,
        logsRes,
        suppliersRes,
        rfqsRes,
        posRes,
        receivingsRes,
        deliveryOrdersRes,
        subAssembliesRes,
      ] = await Promise.allSettled([
        projectsAPI.getAll(1, 10000), // Get all projects
        materialsAPI.getAll(1, 10000), // Get all materials
        projectItemsAPI.getAll(1, 10000), // Get all items
        machinesAPI.getAll(1, 10000), // Get all machines
        tasksAPI.getAll(1, 10000), // Get all tasks
        usersAPI.getAll(1, 10000), // Get all users
        productionLogsAPI.getAll(1, 10000), // Get all logs
        suppliersAPI.getAll(1, 10000), // Get all suppliers
        rfqsAPI.getAll(1, 10000), // Get all rfqs
        purchaseOrdersAPI.getAll(1, 10000), // Get all purchase orders
        receivingGoodsAPI.getAll(1, 10000), // Get all receiving goods
        deliveryOrdersAPI.getAll(1, 10000), // Get all delivery orders
        subAssembliesAPI.getAll(1, 10000), // Get all sub-assemblies
      ]);

      // Helper to safely extract array from response
      const safeArray = (res) => {
        if (res.status === "fulfilled" && res.value) {
          // First check if the value is already an array
          if (Array.isArray(res.value)) return res.value;

          // Then check if it has a data property that is an array
          if (
            res.value &&
            typeof res.value === "object" &&
            res.value.data &&
            Array.isArray(res.value.data)
          ) {
            return res.value.data;
          }

          // If value is an object but doesn't have data property, check if it's a direct array-like object
          if (Array.isArray(Object.values(res.value || {}))) {
            return Object.values(res.value);
          }
        }
        return [];
      };

      const projectsData = safeArray(projectsRes);
      const materialsData = safeArray(materialsRes);
      const itemsData = safeArray(itemsRes);
      const machinesData = safeArray(machinesRes);
      const tasksData = safeArray(tasksRes);
      const usersData = safeArray(usersRes);
      const logsData = safeArray(logsRes);
      const suppliersData = safeArray(suppliersRes);
      const rfqsData = safeArray(rfqsRes);
      const posData = safeArray(posRes);
      const receivingsData = safeArray(receivingsRes);
      const deliveryOrdersData = safeArray(deliveryOrdersRes);
      const subAssembliesData = safeArray(subAssembliesRes);

      // Normalize RFQs to ensure items is always an array
      const normalizedRFQs = rfqsData.map((rfq) => {
        // Parse items if it's a JSON string, otherwise handle as object/array
        let parsedItems = [];
        if (typeof rfq.items === 'string') {
          try {
            parsedItems = JSON.parse(rfq.items);
          } catch (e) {
            console.error('Error parsing RFQ items in frontend:', e);
            parsedItems = [];
          }
        } else if (Array.isArray(rfq.items)) {
          parsedItems = rfq.items;
        } else if (typeof rfq.items === "object" && rfq.items !== null) {
          parsedItems = Object.values(rfq.items);
        }

        return {
          ...rfq,
          items: parsedItems,
        };
      });

      // Normalize POs to ensure items is always an array
      const normalizedPOs = posData.map((po) => ({
        ...po,
        items: Array.isArray(po.items)
          ? po.items
          : typeof po.items === "object" && po.items !== null
          ? Object.values(po.items)
          : [],
      }));

      // Normalize Receivings to ensure items is always an array
      const normalizedReceivings = receivingsData.map((receiving) => ({
        ...receiving,
        items: Array.isArray(receiving.items)
          ? receiving.items
          : typeof receiving.items === "object" && receiving.items !== null
          ? Object.values(receiving.items)
          : [],
      }));

      // Group sub-assemblies by itemId to attach to items
      const subAssembliesByItem = subAssembliesData.reduce((acc, sa) => {
        if (!acc[sa.itemId]) {
          acc[sa.itemId] = [];
        }
        acc[sa.itemId].push(sa);
        return acc;
      }, {});

      // Attach sub-assemblies to their respective items and ensure all required properties exist
      const itemsWithSubAssemblies = itemsData.map((item) => {
        const subAssemblies = (subAssembliesByItem[item.id] || []).map((sa) => {
          // Initialize stepStats for all process steps according to API specification
          const initializedStepStats = (() => {
            // Start with the stepStats from the API response
            const initialStepStats = { ...sa.stepStats };

            // Ensure all processes in the sub-assembly have stepStats entries
            if (Array.isArray(sa.processes) && sa.processes.length > 0) {
              sa.processes.forEach((process, index) => {
                if (!initialStepStats[process]) {
                  initialStepStats[process] = {
                    produced: 0,
                    available: index === 0 ? sa.totalNeeded : 0, // Only first step starts with total needed as available
                  };
                }
              });
            }

            return initialStepStats;
          })();

          return {
            ...sa,
            stepStats: initializedStepStats,
          };
        });

        // Initialize assemblyStats with all assembly steps
        const workflow = Array.isArray(item.workflow) ? item.workflow : [];

        // Initialize with all assembly steps to ensure they exist
        const initializedAssemblyStats = {};
        ASSEMBLY_STEPS.forEach((step) => {
          initializedAssemblyStats[step] = {
            produced: 0,
            available: 0,
          };
        });

        // Then add any workflow-specific steps
        workflow.forEach((config) => {
          if (!initializedAssemblyStats[config.step]) {
            initializedAssemblyStats[config.step] = {
              produced: 0,
              available: 0,
            };
          }
        });

        return {
          ...item,
          subAssemblies,
          workflow,
          warehouseQty:
            typeof item.warehouseQty === "number" ? item.warehouseQty : 0,
          shippedQty: typeof item.shippedQty === "number" ? item.shippedQty : 0,
          assemblyStats: {
            ...initializedAssemblyStats,
            ...(typeof item.assemblyStats === "object" &&
            item.assemblyStats !== null
              ? item.assemblyStats
              : {}),
          },
        };
      });

      set({
        projects: projectsData,
        materials: materialsData,
        items: itemsWithSubAssemblies,
        machines: machinesData,
        tasks: tasksData,
        users: usersData,
        logs: logsData,
        suppliers: suppliersData,
        rfqs: normalizedRFQs,
        pos: normalizedPOs,
        receivings: normalizedReceivings,
        deliveryOrders: deliveryOrdersData,
      });
    } catch (error) {
      // Initialize with empty arrays if there's an error
      set({
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
      });
    }
  },

  can: (a, m) => true,

  login: async (username, password) => {
    try {
      const loginResponse = await authAPI.login(username, password);
      const user = loginResponse.user;
      user.token = loginResponse.token; // Store the token with the user

      localStorage.setItem("currentUser", JSON.stringify(user));
      set({ currentUser: user });
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("currentUser");
    set({ currentUser: null });
  },

  // Project Items
  addProjectItem: async (item) => {
    try {
      // Ensure all required properties exist when creating a new item
      const itemWithDefaults = {
        ...item,
        id: item.id || `item-${Date.now()}`, // Ensure ID is provided
        workflow: item.workflow || [],
        warehouseQty:
          typeof item.warehouseQty === "number" ? item.warehouseQty : 0,
        shippedQty: typeof item.shippedQty === "number" ? item.shippedQty : 0,
        assemblyStats:
          typeof item.assemblyStats === "object" && item.assemblyStats !== null
            ? item.assemblyStats
            : {},
      };
      const newItem = await projectItemsAPI.create(itemWithDefaults);
      set((state) => ({ items: [...state.items, normalizeResponse(newItem)] }));
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteProjectItem: async (id) => {
    try {
      await projectItemsAPI.delete(id);
      set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    } catch (error) {
      handleApiError(error);
    }
  },

  // Sub-assemblies
  addSubAssembly: async (itemId, sa) => {
    try {
      // Ensure proper data types for the API request while preserving all original values
      const subAssemblyForApi = {
        ...sa, // Spread all existing properties first
        itemId: itemId, // Override itemId
        isLocked: sa.isLocked || false, // Ensure isLocked is properly set
        // Ensure proper types for numeric fields
        qtyPerParent: Number(sa.qtyPerParent) || 0,
        totalNeeded: Number(sa.totalNeeded) || 0,
        completedQty: Number(sa.completedQty) || 0,
        totalProduced: Number(sa.totalProduced) || 0,
        consumedQty: Number(sa.consumedQty) || 0,
        // Ensure processes is an array
        processes: Array.isArray(sa.processes) ? [...sa.processes] : [],
        // Ensure stepStats is an object
        stepStats:
          typeof sa.stepStats === "object" && sa.stepStats !== null
            ? { ...sa.stepStats }
            : {},
      };

      // Add the sub-assembly via API
      let newSubAssembly = await subAssembliesAPI.create(subAssemblyForApi);

      // Ensure processes is an array after API response
      if (!Array.isArray(newSubAssembly.processes)) {
        newSubAssembly = {
          ...newSubAssembly,
          processes:
            typeof newSubAssembly.processes === "object" &&
            newSubAssembly.processes !== null
              ? Object.values(newSubAssembly.processes)
              : [],
        };
      }

      // Get the item to access its project and other details
      const item = get().items.find((i) => i.id === itemId);
      if (!item) {
        throw new Error("Item not found");
      }

      // Create tasks for each process step in the sub-assembly
      const tasksToCreate = [];

      // Ensure processes is an array - convert from object if needed
      const processesArray = Array.isArray(newSubAssembly.processes)
        ? newSubAssembly.processes
        : Object.values(newSubAssembly.processes || []);

      if (processesArray.length > 0) {
        for (const process of processesArray) {
          // Create a task for each process step
          tasksToCreate.push({
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
            projectId: item.projectId,
            projectName: item.name,
            itemId: item.id,
            itemName: item.name,
            subAssemblyId: newSubAssembly.id, // Associate with the new sub-assembly
            subAssemblyName: newSubAssembly.name,
            step: process,
            machineId: "", // No machine assigned initially
            targetQty: newSubAssembly.totalNeeded, // Use sub-assembly's total needed quantity
            completedQty: 0,
            defectQty: 0,
            status: "PENDING",
            totalDowntimeMinutes: 0,
          });
        }
      }

      // Create all tasks via API
      const createdTasks = await Promise.all(
        tasksToCreate.map((task) => tasksAPI.create(task))
      );

      // Update the local state to reflect the change
      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                subAssemblies: [
                  ...(i.subAssemblies || []),
                  {
                    ...normalizeResponse(newSubAssembly),
                    // Initialize stepStats for all process steps according to API specification
                    stepStats: (() => {
                      // Start with the stepStats from the API response
                      const initialStepStats = { ...newSubAssembly.stepStats };

                      // Ensure all processes in the sub-assembly have stepStats entries
                      processesArray.forEach((process, index) => {
                        if (!initialStepStats[process]) {
                          initialStepStats[process] = {
                            produced: 0,
                            available: index === 0 ? newSubAssembly.totalNeeded : 0, // Only first step starts with total needed as available
                          };
                        }
                      });

                      return initialStepStats;
                    })(),
                  },
                ],
              }
            : i
        ),
        tasks: [
          ...state.tasks,
          ...createdTasks.map((t) => normalizeResponse(t)),
        ],
      }));

      // Update assembly stats after adding a sub-assembly
      const currentItem = get().items.find((i) => i.id === itemId);
      if (currentItem) {
        // Calculate updated assembly stats based on sub-assemblies
        // When sub-assemblies are added, we need to update the main item's assembly stats
        // to reflect the availability of sub-assemblies for the next process steps
        const updatedAssemblyStats = { ...currentItem.assemblyStats };

        // Initialize all assembly steps if they don't exist
        ASSEMBLY_STEPS.forEach((step) => {
          if (!updatedAssemblyStats[step]) {
            updatedAssemblyStats[step] = {
              produced: 0,
              available: 0,
            };
          }
        });

        // If there are sub-assemblies and the workflow includes LAS step,
        // we need to update the availability in the LAS step
        if (
          currentItem.subAssemblies &&
          currentItem.subAssemblies.length > 0 &&
          currentItem.workflow
        ) {
          // Check if workflow includes LAS step
          const hasLASStep =
            Array.isArray(currentItem.workflow) &&
            currentItem.workflow.some((config) => config.step === "LAS");

          if (hasLASStep) {
            // Calculate total needed for all sub-assemblies that would be consumed in LAS step
            const totalSubAssembliesNeeded = currentItem.subAssemblies.reduce(
              (total, sa) => total + sa.totalNeeded,
              0
            );

            // Update the LAS step availability to reflect the sub-assemblies that will be used
            updatedAssemblyStats["LAS"] = {
              ...updatedAssemblyStats["LAS"],
              available:
                (updatedAssemblyStats["LAS"]?.available || 0) +
                totalSubAssembliesNeeded,
            };
          }
        }

        // Update the item with the new assembly stats
        const updatedItem = await projectItemsAPI.update(itemId, {
          ...currentItem,
          workflow: currentItem?.workflow || [],
          warehouseQty:
            typeof currentItem?.warehouseQty === "number"
              ? currentItem.warehouseQty
              : 0,
          shippedQty:
            typeof currentItem?.shippedQty === "number"
              ? currentItem.shippedQty
              : 0,
          assemblyStats: updatedAssemblyStats,
        });

        // Update the local state to reflect the changes
        // Preserve sub-assemblies from the current state since API doesn't return them
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId
              ? {
                  ...normalizeResponse(updatedItem),
                  subAssemblies: i.subAssemblies, // Preserve existing sub-assemblies
                }
              : i
          ),
        }));
      }

      // Automatically validate flow assembly after adding a sub-assembly
      await get().validateFlowAssembly(itemId);

      // If the workflow is not locked, create assembly tasks without raw steps
      const itemAfterUpdate = get().items.find((i) => i.id === itemId);
      if (
        itemAfterUpdate &&
        !itemAfterUpdate.isWorkflowLocked &&
        itemAfterUpdate.quantity
      ) {
        // Create a default workflow configuration with assembly steps
        const defaultWorkflow = ASSEMBLY_STEPS.map((step, idx) => ({
          step,
          sequence: idx + 1,
          allocations: [
            {
              id: `alloc-${Date.now()}-${idx}`,
              machineId: "",
              targetQty: itemAfterUpdate.quantity,
            },
          ],
        }));

        // Create tasks only for assembly steps (not raw steps) to avoid duplication
        const tasksToCreate = defaultWorkflow.flatMap((config) => {
          // For assembly steps, create a single task for the main item
          return [
            {
              id: `task-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`, // Generate unique ID
              projectId: itemAfterUpdate.projectId,
              projectName: itemAfterUpdate.name,
              itemId: itemAfterUpdate.id,
              itemName: itemAfterUpdate.name,
              step: config.step,
              machineId: config.allocations[0].machineId,
              targetQty: config.allocations[0].targetQty,
              completedQty: 0,
              defectQty: 0,
              status: "PENDING",
              note: config.allocations[0].note,
              totalDowntimeMinutes: 0,
            },
          ];
        });

        // Create all tasks via API
        const createdTasks = await Promise.all(
          tasksToCreate.map((task) => tasksAPI.create(task))
        );

        // Initialize assemblyStats with all workflow steps
        const initializedAssemblyStats = defaultWorkflow.reduce(
          (stats, config) => {
            if (!stats[config.step]) {
              stats[config.step] = {
                produced: 0,
                available: 0,
              };
            }
            return stats;
          },
          itemAfterUpdate.assemblyStats || {}
        );

        // Update the item to lock the workflow via API, ensuring proper types
        const updatedItem = await projectItemsAPI.update(itemId, {
          ...itemAfterUpdate,
          isWorkflowLocked: true,
          workflow: defaultWorkflow,
          warehouseQty:
            typeof itemAfterUpdate.warehouseQty === "number"
              ? itemAfterUpdate.warehouseQty
              : 0,
          shippedQty:
            typeof itemAfterUpdate.shippedQty === "number"
              ? itemAfterUpdate.shippedQty
              : 0,
          assemblyStats: initializedAssemblyStats,
        });

        // Update the local state to reflect the changes
        // Preserve sub-assemblies from the current state since API doesn't return them
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId
              ? {
                  ...normalizeResponse(updatedItem),
                  assemblyStats: initializedAssemblyStats,
                  subAssemblies: i.subAssemblies, // Preserve existing sub-assemblies
                }
              : i
          ),
          tasks: [
            ...state.tasks.filter((t) => t.itemId !== itemId),
            ...createdTasks.map((t) => normalizeResponse(t)),
          ],
        }));
      }
    } catch (error) {
      handleApiError(error);
    }
  },

  lockSubAssembly: async (itemId, saId) => {
    try {
      // Find the sub-assembly to get its current values
      const item = get().items.find((i) => i.id === itemId);
      if (!item) return;

      const subAssembly = item.subAssemblies?.find((sa) => sa.id === saId);
      if (!subAssembly) return;

      // Preserve the original processes array before any modifications
      const originalProcesses = Array.isArray(subAssembly.processes)
        ? [...subAssembly.processes]
        : [];

      // Use the specific lock endpoint: /sub-assemblies/item/:itemId/lock
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
        }/sub-assemblies/item/${itemId}/lock`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${get().currentUser?.token || ""}`,
          },
          body: JSON.stringify({ isLocked: true }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to lock sub-assembly: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      // Update the local state to reflect the change, preserving all original values
      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                subAssemblies: i.subAssemblies.map((sa) =>
                  sa.id === saId
                    ? normalizeResponse({
                        ...sa,
                        isLocked: true,
                        processes: originalProcesses, // Explicitly preserve the original processes field
                      })
                    : sa
                ),
              }
            : i
        ),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteSubAssembly: async (itemId, saId) => {
    try {
      // Delete the sub-assembly via API
      await subAssembliesAPI.delete(saId);
      // Update the local state to reflect the change
      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                subAssemblies: i.subAssemblies.filter((sa) => sa.id !== saId),
              }
            : i
        ),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  validateWorkflow: async (itemId, workflow) => {
    try {
      const currentItem = get().items.find((i) => i.id === itemId);
      if (!currentItem) return;

      // Initialize assemblyStats with all workflow steps before sending to API
      const workflowAssemblyStats = workflow.reduce((stats, config) => {
        if (!stats[config.step]) {
          stats[config.step] = {
            produced: 0,
            available: 0,
          };
        }
        return stats;
      }, currentItem.assemblyStats || {});

      // Update the item to lock the workflow via API, ensuring proper types
      const updatedItem = await projectItemsAPI.update(itemId, {
        ...currentItem,
        isWorkflowLocked: true,
        workflow,
        warehouseQty:
          typeof currentItem.warehouseQty === "number"
            ? currentItem.warehouseQty
            : 0,
        shippedQty:
          typeof currentItem.shippedQty === "number"
            ? currentItem.shippedQty
            : 0,
        assemblyStats: workflowAssemblyStats,
      });

      // Create tasks for both workflow steps and raw steps
      // First, get all the steps from the workflow
      const workflowSteps = workflow.map((config) => config.step);

      // Define all steps that should have tasks created
      let allSteps = [...workflowSteps];

      // Always add raw steps (POTONG, PLONG, PRESS) for NEW flow type items
      if (currentItem.flowType === "NEW") {
        const rawSteps = ["POTONG", "PLONG", "PRESS"];
        rawSteps.forEach((rawStep) => {
          if (!allSteps.includes(rawStep)) {
            allSteps.push(rawStep);
          }
        });
      }

      // Create tasks for all required steps
      const tasksToCreate = allSteps.flatMap((step) => {
        // Find allocation for assembly steps from workflow
        const workflowAllocation = workflow.find(
          (config) => config.step === step
        )?.allocations[0];

        // For raw steps that aren't in the workflow, create default allocations
        const allocation = workflowAllocation || {
          id: `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          machineId: "",
          targetQty: currentItem.quantity,
        };

        // Determine if this is a raw step that should be associated with sub-assemblies
        const isRawStep = ["POTONG", "PLONG", "PRESS"].includes(step);

        if (
          isRawStep &&
          currentItem.subAssemblies &&
          currentItem.subAssemblies.length > 0
        ) {
          // For raw steps, create a task for each sub-assembly that includes this process
          return currentItem.subAssemblies
            .filter(
              (sa) =>
                Array.isArray(sa.processes) &&
                sa.processes.includes(step as ProcessStep)
            )
            .map((sa) => ({
              id: `task-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`, // Generate unique ID
              projectId: updatedItem.projectId,
              projectName: updatedItem.name,
              itemId: updatedItem.id,
              itemName: updatedItem.name,
              subAssemblyId: sa.id, // Associate with sub-assembly
              subAssemblyName: sa.name,
              step: step,
              machineId: allocation.machineId,
              targetQty: sa.totalNeeded, // Use sub-assembly's total needed quantity
              completedQty: 0,
              defectQty: 0,
              status: "PENDING",
              note: allocation.note,
              totalDowntimeMinutes: 0,
            }));
        } else {
          // For assembly steps, create a single task for the main item
          return [
            {
              id: `task-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`, // Generate unique ID
              projectId: updatedItem.projectId,
              projectName: updatedItem.name,
              itemId: updatedItem.id,
              itemName: updatedItem.name,
              step: step,
              machineId: allocation.machineId,
              targetQty: allocation.targetQty,
              completedQty: 0,
              defectQty: 0,
              status: "PENDING",
              note: allocation.note,
              totalDowntimeMinutes: 0,
            },
          ];
        }
      });

      // Create all tasks via API
      const createdTasks = await Promise.all(
        tasksToCreate.map((task) => tasksAPI.create(task))
      );

      // Initialize assemblyStats with all workflow steps
      const initializedAssemblyStats = workflow.reduce((stats, config) => {
        if (!stats[config.step]) {
          stats[config.step] = {
            produced: 0,
            available: 0,
          };
        }
        return stats;
      }, updatedItem.assemblyStats || {});

      // Update the local state to reflect the changes
      // Preserve sub-assemblies from the current state since API doesn't return them
      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId
            ? {
                ...normalizeResponse(updatedItem),
                assemblyStats: initializedAssemblyStats,
                subAssemblies: i.subAssemblies, // Preserve existing sub-assemblies
              }
            : i
        ),
        tasks: [
          ...state.tasks.filter((t) => t.itemId !== itemId),
          ...createdTasks.map((t) => normalizeResponse(t)),
        ],
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  validateFlowAssembly: async (itemId) => {
    try {
      const currentItem = get().items.find((i) => i.id === itemId);
      if (!currentItem) return;

      // Calculate updated assembly stats based on sub-assemblies
      // When sub-assemblies are added, we need to update the main item's assembly stats
      // to reflect the availability of sub-assemblies for the next process steps
      const updatedAssemblyStats = { ...currentItem.assemblyStats };

      // Initialize all assembly steps if they don't exist
      ASSEMBLY_STEPS.forEach((step) => {
        if (!updatedAssemblyStats[step]) {
          updatedAssemblyStats[step] = {
            produced: 0,
            available: 0,
          };
        }
      });

      // If there are sub-assemblies and the workflow includes LAS step,
      // we need to update the availability in the LAS step
      if (
        currentItem.subAssemblies &&
        currentItem.subAssemblies.length > 0 &&
        currentItem.workflow
      ) {
        // Check if workflow includes LAS step
        const hasLASStep =
          Array.isArray(currentItem.workflow) &&
          currentItem.workflow.some((config) => config.step === "LAS");

        if (hasLASStep) {
          // Calculate total needed for all sub-assemblies that would be consumed in LAS step
          const totalSubAssembliesNeeded = currentItem.subAssemblies.reduce(
            (total, sa) => total + sa.totalNeeded,
            0
          );

          // Update the LAS step availability to reflect the sub-assemblies that will be used
          updatedAssemblyStats["LAS"] = {
            ...updatedAssemblyStats["LAS"],
            available:
              (updatedAssemblyStats["LAS"]?.available || 0) +
              totalSubAssembliesNeeded,
          };
        }
      }

      // Update the item to indicate that flow assembly is validated
      const updatedItem = await projectItemsAPI.update(itemId, {
        ...currentItem,
        workflow: currentItem?.workflow || [],
        warehouseQty:
          typeof currentItem?.warehouseQty === "number"
            ? currentItem.warehouseQty
            : 0,
        shippedQty:
          typeof currentItem?.shippedQty === "number"
            ? currentItem.shippedQty
            : 0,
        assemblyStats: updatedAssemblyStats,
      });

      // Update the local state to reflect the changes
      // Preserve sub-assemblies from the current state since API doesn't return them
      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId
            ? {
                ...normalizeResponse(updatedItem),
                subAssemblies: i.subAssemblies, // Preserve existing sub-assemblies
              }
            : i
        ),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  unlockWorkflow: async (itemId) => {
    try {
      const currentItem = get().items.find((i) => i.id === itemId);
      // Update the item to unlock the workflow via API
      const updatedItem = await projectItemsAPI.update(itemId, {
        ...currentItem,
        isWorkflowLocked: false,
        workflow: currentItem?.workflow || [],
        warehouseQty:
          typeof currentItem?.warehouseQty === "number"
            ? currentItem.warehouseQty
            : 0,
        shippedQty:
          typeof currentItem?.shippedQty === "number"
            ? currentItem.shippedQty
            : 0,
        assemblyStats:
          typeof currentItem?.assemblyStats === "object" &&
          currentItem?.assemblyStats !== null
            ? currentItem.assemblyStats
            : {},
      });

      // Delete tasks associated with this item via API
      const itemTasks = get().tasks.filter((t) => t.itemId === itemId);
      await Promise.all(itemTasks.map((task) => tasksAPI.delete(task.id)));

      // Update the local state to reflect the changes
      // Preserve sub-assemblies from the current state since API doesn't return them
      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId
            ? {
                ...normalizeResponse(updatedItem),
                subAssemblies: i.subAssemblies, // Preserve existing sub-assemblies
              }
            : i
        ),
        tasks: state.tasks.filter((t) => t.itemId !== itemId),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  reportProduction: async (taskId, goodQty, defectQty, shift, operator) => {
    try {
      const task = get().tasks.find((t) => t.id === taskId);
      if (!task) return;

      const item = get().items.find((i) => i.id === task.itemId);
      if (!item) return;

      // Log the current state of the item before update

      // Create a production log
      const log = await productionLogsAPI.create({
        id: `log-${Date.now()}`,
        taskId,
        machineId: task.machineId,
        itemId: task.itemId,
        subAssemblyId: task.subAssemblyId,
        projectId: task.projectId,
        step: task.step,
        shift,
        goodQty,
        defectQty,
        operator,
        timestamp: new Date().toISOString(),
        type: "OUTPUT",
      });

      // Update the task, ensuring totalDowntimeMinutes remains as a number
      const updatedTask = await tasksAPI.update(taskId, {
        ...task,
        totalDowntimeMinutes:
          typeof task.totalDowntimeMinutes === "number"
            ? task.totalDowntimeMinutes
            : 0,
        completedQty: task.completedQty + goodQty,
        defectQty: task.defectQty + defectQty,
        status:
          task.completedQty + goodQty >= task.targetQty
            ? "COMPLETED"
            : task.status,
      });

      // Update the item's assembly stats
      let updatedItems = [...get().items];
      let subAssembliesToUpdate = [];

      if (task.subAssemblyId) {
        updatedItems = get().items.map((it) => {
          if (it.id !== item.id) return it;
          // Initialize assemblyStats if not present
          const nextAssemblyStats = { ...it.assemblyStats };
          ASSEMBLY_STEPS.forEach((step) => {
            if (!nextAssemblyStats[step]) {
              nextAssemblyStats[step] = {
                produced: 0,
                available: 0,
              };
            }
          });

          // SPECIAL CASE: When PRESS step is completed in a sub-assembly task,
          // we need to update the LAS step available in the main assembly
          if (task.step === "PRESS") {
            // Add the good quantity to the LAS step in the main assembly
            nextAssemblyStats["LAS"] = {
              ...nextAssemblyStats["LAS"],
              available: (nextAssemblyStats["LAS"]?.available || 0) + goodQty,
            };
          }

          return {
            ...it,
            workflow: it.workflow || [],
            warehouseQty:
              typeof it.warehouseQty === "number" ? it.warehouseQty : 0,
            shippedQty: typeof it.shippedQty === "number" ? it.shippedQty : 0,
            assemblyStats: nextAssemblyStats,
            subAssemblies: it.subAssemblies.map((sa) => {
              if (sa.id !== task.subAssemblyId) return sa;
              // Convert processes to array if it's stored as an object
              const processesArray = Array.isArray(sa.processes)
                ? sa.processes
                : Object.values(sa.processes || []);
              const processIdx = processesArray.indexOf(task.step);

              // Initialize all steps in stepStats if not already present
              const nextStats = { ...sa.stepStats };
              processesArray.forEach((process, idx) => {
                if (!nextStats[process]) {
                  nextStats[process] = {
                    produced: 0,
                    available: idx === 0 ? sa.totalNeeded : 0,
                  };
                }
              });

              const current = nextStats[task.step] || {
                produced: 0,
                available: 0,
              };

              // Update current step stats
              nextStats[task.step] = {
                produced: current.produced + goodQty,
                available: Math.max(
                  0,
                  current.available - (goodQty + defectQty)
                ),
              };

              // Add good quantity to the next step's available
              if (processIdx + 1 < processesArray.length) {
                const nextStep = processesArray[processIdx + 1];
                nextStats[nextStep] = {
                  ...nextStats[nextStep],
                  available: (nextStats[nextStep]?.available || 0) + goodQty,
                };
              }

              const isLastStep = processIdx === processesArray.length - 1;
              const updatedSubAssembly = {
                ...sa,
                stepStats: nextStats,
                totalProduced: isLastStep
                  ? sa.totalProduced + goodQty
                  : sa.totalProduced,
                completedQty: isLastStep
                  ? sa.completedQty + goodQty
                  : sa.completedQty,
              };

              // Add to list of sub-assemblies to update in backend
              subAssembliesToUpdate.push(updatedSubAssembly);

              return updatedSubAssembly;
            }),
          };
        });
      } else {
        updatedItems = get().items.map((it) => {
          if (it.id !== item.id) return it;
          const nextAssemblyStats = { ...it.assemblyStats };
          const currentStepIdx = ASSEMBLY_STEPS.indexOf(task.step);

          // Initialize all assembly steps in assemblyStats if not already present
          ASSEMBLY_STEPS.forEach((step) => {
            if (!nextAssemblyStats[step]) {
              nextAssemblyStats[step] = {
                produced: 0,
                available: 0,
              };
            }
          });

          const current = nextAssemblyStats[task.step] || {
            produced: 0,
            available: 0,
          };

          // Update current step stats - decrease available for all assembly steps
          nextAssemblyStats[task.step] = {
            produced: current.produced + goodQty,
            available: Math.max(0, current.available - (goodQty + defectQty)),
          };

          // Add good quantity to the next step's available (except for PACKING which is the last step)
          if (
            task.step !== "PACKING" &&
            currentStepIdx >= 0 &&
            currentStepIdx < ASSEMBLY_STEPS.length - 1
          ) {
            const nextStep = ASSEMBLY_STEPS[currentStepIdx + 1];
            nextAssemblyStats[nextStep] = {
              ...nextAssemblyStats[nextStep],
              available:
                (nextAssemblyStats[nextStep]?.available || 0) + goodQty,
            };
          }

          if (currentStepIdx > 0) {
            return {
              ...it,
              workflow: it.workflow || [],
              warehouseQty:
                typeof it.warehouseQty === "number" ? it.warehouseQty : 0,
              shippedQty: typeof it.shippedQty === "number" ? it.shippedQty : 0,
              assemblyStats: nextAssemblyStats,
            };
          } else {
            // For all assembly steps (including LAS)
            // Do not update sub-assembly stats - only assembly stats
            return {
              ...it,
              workflow: it.workflow || [],
              warehouseQty:
                typeof it.warehouseQty === "number" ? it.warehouseQty : 0,
              shippedQty: typeof it.shippedQty === "number" ? it.shippedQty : 0,
              assemblyStats: nextAssemblyStats,
            };
          }
        });
      }

      // Special handling for LAS step: reduce sub-assembly completedQty by consumption
      if (!task.subAssemblyId && task.step === "LAS") {
        updatedItems = updatedItems.map((it) => {
          if (it.id !== item.id) return it;

          // For each sub-assembly, reduce completedQty by the amount consumed in LAS
          const updatedSubAssemblies = it.subAssemblies.map((sa) => {
            const consumedFromThisSubAssembly =
              goodQty * (sa.qtyPerParent || 1);
            const updatedSA = {
              ...sa,
              completedQty: Math.max(
                0,
                sa.completedQty - consumedFromThisSubAssembly
              ),
            };
            subAssembliesToUpdate.push(updatedSA);
            return updatedSA;
          });

          return {
            ...it,
            subAssemblies: updatedSubAssemblies,
          };
        });
      }

      // Update sub-assemblies in the backend
      if (subAssembliesToUpdate.length > 0) {
        await Promise.all(
          subAssembliesToUpdate.map((sa) =>
            subAssembliesAPI.update(sa.id, {
              ...sa,
              processes: Array.isArray(sa.processes)
                ? [...sa.processes]
                : sa.processes
                ? Object.values(sa.processes)
                : [],
              stepStats: (() => {
                // Ensure all processes in the sub-assembly have stepStats entries
                const updatedStepStats = { ...sa.stepStats };

                if (Array.isArray(sa.processes)) {
                  sa.processes.forEach((process, index) => {
                    if (!updatedStepStats[process]) {
                      updatedStepStats[process] = {
                        produced: 0,
                        available: index === 0 ? sa.totalNeeded : 0, // Only first step starts with total needed as available
                      };
                    }
                  });
                }

                return updatedStepStats;
              })(),
              qtyPerParent: Number(sa.qtyPerParent) || 1, // Default to 1 if not a valid number
              totalNeeded: Number(sa.totalNeeded) || 0,
              completedQty: Number(sa.completedQty) || 0,
              totalProduced: Number(sa.totalProduced) || 0,
              consumedQty: Number(sa.consumedQty) || 0,
            })
          )
        );
      }

      // Log the updated items

      // Update the item in the backend
      const itemToUpdate = updatedItems.find((i) => i.id === item.id);
      if (itemToUpdate) {
        await projectItemsAPI.update(itemToUpdate.id, {
          ...itemToUpdate,
          warehouseQty: Number(itemToUpdate.warehouseQty) || 0,
          shippedQty: Number(itemToUpdate.shippedQty) || 0,
          assemblyStats: { ...itemToUpdate.assemblyStats },
        });
      }

      set({
        items: updatedItems,
        tasks: get().tasks.map((t) =>
          t.id === taskId
            ? {
                ...updatedTask,
                totalDowntimeMinutes:
                  typeof updatedTask.totalDowntimeMinutes === "number"
                    ? updatedTask.totalDowntimeMinutes
                    : 0,
              }
            : t
        ),
        logs: [normalizeResponse(log), ...get().logs],
      });
    } catch (error) {
      handleApiError(error);
    }
  },

  setTaskStatus: async (taskId, status) => {
    try {
      const task = get().tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedTask = await tasksAPI.update(taskId, {
        ...task,
        status,
      });

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        machines: state.machines.map((m) => {
          if (m.id === task.machineId)
            return {
              ...m,
              status: status === "IN_PROGRESS" ? "RUNNING" : "IDLE",
            };
          return m;
        }),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  startDowntime: async (taskId) => {
    try {
      const task = get().tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedTask = await tasksAPI.update(taskId, {
        ...task,
        status: "DOWNTIME",
      });

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        machines: state.machines.map((m) => {
          if (m.id === task.machineId) return { ...m, status: "DOWNTIME" };
          return m;
        }),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  endDowntime: async (taskId) => {
    try {
      const task = get().tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedTask = await tasksAPI.update(taskId, {
        ...task,
        status: "IN_PROGRESS",
        totalDowntimeMinutes: (task.totalDowntimeMinutes || 0) + 10,
      });

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        machines: state.machines.map((m) => {
          if (m.id === task.machineId) return { ...m, status: "RUNNING" };
          return m;
        }),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  // Projects
  addProject: async (p) => {
    try {
      const newProject = await projectsAPI.create(p);
      set((state) => ({
        projects: [normalizeResponse(newProject), ...state.projects],
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  updateProject: async (p) => {
    try {
      const updatedProject = await projectsAPI.update(p.id, p);
      set((state) => ({
        projects: state.projects.map((x) =>
          x.id === p.id ? normalizeResponse(updatedProject) : x
        ),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  validateProject: async (id) => {
    try {
      const currentProject = get().projects.find((x) => x.id === id);
      const project = await projectsAPI.update(id, {
        ...currentProject,
        progress: currentProject?.progress || 0, // Ensure progress is included and valid
        isLocked: true,
        status: "IN_PROGRESS",
      });
      set((state) => ({
        projects: state.projects.map((x) =>
          x.id === id ? normalizeResponse(project) : x
        ),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteProject: async (id) => {
    try {
      await projectsAPI.delete(id);
      set((state) => ({ projects: state.projects.filter((x) => x.id !== id) }));
    } catch (error) {
      handleApiError(error);
    }
  },

  // Materials
  addMaterial: async (m) => {
    try {
      const newMaterial = await materialsAPI.create(m);
      set((state) => ({
        materials: [normalizeResponse(newMaterial), ...state.materials],
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  updateMaterial: async (m) => {
    try {
      const updatedMaterial = await materialsAPI.update(m.id, m);
      set((state) => ({
        materials: state.materials.map((x) =>
          x.id === m.id ? normalizeResponse(updatedMaterial) : x
        ),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  adjustStock: async (id, q) => {
    try {
      const updatedMaterial = await materialsAPI.adjustStock(id, q);
      set((state) => ({
        materials: state.materials.map((x) =>
          x.id === id ? normalizeResponse(updatedMaterial) : x
        ),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  // Machines
  addMachine: async (m) => {
    try {
      const newMachine = await machinesAPI.create(m);
      set((state) => ({
        machines: [...state.machines, normalizeResponse(newMachine)],
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  updateMachine: async (m) => {
    try {
      const updatedMachine = await machinesAPI.update(m.id, m);
      set((state) => ({
        machines: state.machines.map((x) =>
          x.id === m.id ? normalizeResponse(updatedMachine) : x
        ),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteMachine: async (id) => {
    try {
      await machinesAPI.delete(id);
      set((state) => ({ machines: state.machines.filter((x) => x.id !== id) }));
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  toggleMaintenance: async (id) => {
    try {
      const updatedMachine = await machinesAPI.toggleMaintenance(id);
      set((state) => ({
        machines: state.machines.map((x) =>
          x.id === id ? normalizeResponse(updatedMachine) : x
        ),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  // Users
  addUser: async (u) => {
    try {
      const newUser = await usersAPI.create(u);
      set((state) => ({ users: [...state.users, normalizeResponse(newUser)] }));
    } catch (error) {
      handleApiError(error);
    }
  },

  updateUser: async (u) => {
    try {
      const updatedUser = await usersAPI.update(u.id, u);
      set((state) => ({
        users: state.users.map((x) =>
          x.id === u.id ? normalizeResponse(updatedUser) : x
        ),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteUser: async (id) => {
    try {
      await usersAPI.delete(id);
      set((state) => ({ users: state.users.filter((x) => x.id !== id) }));
    } catch (error) {
      handleApiError(error);
    }
  },

  downloadDatabase: () => {
    // This function is no longer needed since we're using a real database
  },

  validateToWarehouse: async (itemId, qty) => {
    try {
      const item = get().items.find((i) => i.id === itemId);
      if (!item) return;

      // Create a warehouse entry log
      const log = await productionLogsAPI.create({
        id: `log-wh-${Date.now()}`,
        taskId: "WAREHOUSE",
        machineId: "WH",
        itemId: itemId,
        projectId: item.projectId,
        step: "PACKING",
        shift: "SHIFT_1",
        goodQty: qty,
        defectQty: 0,
        operator: get().currentUser?.name || "Admin",
        timestamp: new Date().toISOString(),
        type: "WAREHOUSE_ENTRY",
      });

      // Update assembly stats to remove the validated quantity from PACKING.produced
      // (not available, because available is for items ready to enter PACKING)
      const updatedAssemblyStats = { ...item.assemblyStats };
      if (!updatedAssemblyStats["PACKING"]) {
        updatedAssemblyStats["PACKING"] = { produced: 0, available: 0 };
      }
      updatedAssemblyStats["PACKING"] = {
        ...updatedAssemblyStats["PACKING"],
        produced: Math.max(
          0,
          (updatedAssemblyStats["PACKING"]?.produced || 0) - qty
        ),
      };

      // Update the item's warehouse quantity
      const updatedItem = await projectItemsAPI.update(itemId, {
        ...item,
        workflow: item.workflow || [],
        warehouseQty:
          (typeof item.warehouseQty === "number" ? item.warehouseQty : 0) + qty,
        shippedQty: typeof item.shippedQty === "number" ? item.shippedQty : 0,
        assemblyStats: updatedAssemblyStats,
      });

      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId
            ? {
                ...updatedItem,
                subAssemblies: i.subAssemblies, // Preserve existing sub-assemblies
              }
            : i
        ),
        logs: [normalizeResponse(log), ...state.logs],
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  // Procurement
  addRFQ: async (rfq) => {
    try {
      const newRfq = await rfqsAPI.create(rfq);
      set((state) => ({ rfqs: [normalizeResponse(newRfq), ...state.rfqs] }));
    } catch (error) {
      handleApiError(error);
    }
  },

  createPO: async (po) => {
    try {
      const newPo = await purchaseOrdersAPI.create(po);
      set((state) => ({ pos: [normalizeResponse(newPo), ...state.pos] }));
    } catch (error) {
      handleApiError(error);
    }
  },

  updatePO: async (po) => {
    try {
      const updatedPo = await purchaseOrdersAPI.update(po.id, po);
      set((state) => ({
        pos: state.pos.map(p => p.id === po.id ? normalizeResponse(updatedPo) : p)
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  receiveGoods: async (r) => {
    try {
      const newReceiving = await receivingGoodsAPI.create(r);

      // Update material stock for each received item
      const updatedMaterials = [...get().materials];
      for (const item of r.items) {
        const materialIndex = updatedMaterials.findIndex(m => m.id === item.materialId);
        if (materialIndex !== -1) {
          const material = updatedMaterials[materialIndex];
          const updatedMaterial = {
            ...material,
            currentStock: material.currentStock + item.qty,
            // Ensure pricePerUnit is a valid non-negative number
            pricePerUnit: typeof material.pricePerUnit === 'number' && material.pricePerUnit >= 0
              ? material.pricePerUnit
              : 0
          };

          // Update the material in the API
          await materialsAPI.update(material.id, updatedMaterial);
          updatedMaterials[materialIndex] = normalizeResponse(updatedMaterial);
        }
      }

      // Update the purchase order status to 'RECEIVED'
      const poToBeUpdated = get().pos.find(po => po.id === r.poId);
      if (poToBeUpdated) {
        const updatedPo = {
          ...poToBeUpdated,
          status: 'RECEIVED'
        };

        await get().updatePO(updatedPo);
      }

      set((state) => ({
        receivings: [normalizeResponse(newReceiving), ...state.receivings],
        materials: updatedMaterials
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  addSupplier: async (supplier) => {
    try {
      const newSupplier = await suppliersAPI.create(supplier);
      set((state) => ({
        suppliers: [normalizeResponse(newSupplier), ...state.suppliers],
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  refreshRFQs: async () => {
    try {
      const rfqsRes = await rfqsAPI.getAll(1, 10000);
      const rfqsData = Array.isArray(rfqsRes) ? rfqsRes : [];

      // Normalize RFQs to ensure items is always an array
      const normalizedRFQs = rfqsData.map((rfq) => {
        // Parse items if it's a JSON string, otherwise handle as object/array
        let parsedItems = [];
        if (typeof rfq.items === 'string') {
          try {
            parsedItems = JSON.parse(rfq.items);
          } catch (e) {
            console.error('Error parsing RFQ items in frontend:', e);
            parsedItems = [];
          }
        } else if (Array.isArray(rfq.items)) {
          parsedItems = rfq.items;
        } else if (typeof rfq.items === "object" && rfq.items !== null) {
          parsedItems = Object.values(rfq.items);
        }

        return {
          ...rfq,
          items: parsedItems,
        };
      });

      set((state) => ({ rfqs: normalizedRFQs }));
    } catch (error) {
      handleApiError(error);
    }
  },

  // Delivery Orders
  createDeliveryOrder: async (sj) => {
    try {
      const newSj = await deliveryOrdersAPI.create(sj);
      set((state) => ({
        deliveryOrders: [normalizeResponse(newSj), ...state.deliveryOrders],
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  updateDeliveryOrder: async (sj) => {
    try {
      const updatedSj = await deliveryOrdersAPI.update(sj.id, sj);
      set((state) => ({
        deliveryOrders: state.deliveryOrders.map((x) =>
          x.id === sj.id ? normalizeResponse(updatedSj) : x
        ),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  validateDeliveryOrder: async (id) => {
    try {
      const updatedSj = await deliveryOrdersAPI.update(id, {
        ...get().deliveryOrders.find((x) => x.id === id),
        status: "VALIDATED",
      });
      set((state) => ({
        deliveryOrders: state.deliveryOrders.map((x) =>
          x.id === id ? normalizeResponse(updatedSj) : x
        ),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteDeliveryOrder: async (id) => {
    try {
      await deliveryOrdersAPI.delete(id);
      set((state) => ({
        deliveryOrders: state.deliveryOrders.filter((x) => x.id !== id),
      }));
    } catch (error) {
      handleApiError(error);
    }
  },
}));
