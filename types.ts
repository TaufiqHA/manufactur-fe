
export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
export type Shift = 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3';

export interface Project {
  id: string;
  code: string;
  name: string;
  customer: string; 
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  progress: number;
  qtyPerUnit: number;
  procurementQty: number;
  totalQty: number;
  unit: string;
  isLocked: boolean;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentStock: number;
  safetyStock: number;
  pricePerUnit: number;
  category: 'RAW' | 'FINISHING' | 'HARDWARE';
}

export type ProcessStep = 'POTONG' | 'PLONG' | 'PRESS' | 'LAS' | 'PHOSPHATING' | 'CAT' | 'PACKING';
export const RAW_STEPS: ProcessStep[] = ['POTONG', 'PLONG', 'PRESS'];
export const ASSEMBLY_STEPS: ProcessStep[] = ['LAS', 'PHOSPHATING', 'CAT', 'PACKING'];
export const ALL_STEPS: ProcessStep[] = [...RAW_STEPS, ...ASSEMBLY_STEPS];

export interface SubAssembly {
  id: string;
  name: string;
  qtyPerParent: number;
  totalNeeded: number;
  completedQty: number; 
  totalProduced: number; 
  consumedQty: number;  
  materialId: string;
  processes: ProcessStep[]; 
  stepStats: Partial<Record<ProcessStep, { produced: number, available: number }>>;
  isLocked: boolean;
}

export interface MachineAllocation {
  id: string;
  machineId?: string;
  targetQty: number;
  note?: string;
}

export interface ItemStepConfig {
  step: ProcessStep;
  sequence: number;
  allocations: MachineAllocation[];
}

export interface BomItem {
  id: string;
  itemId: string; 
  materialId: string;
  quantityPerUnit: number; 
  totalRequired: number; 
  allocated: number;
  realized: number;
}

export interface ProjectItem {
  id: string;
  projectId: string;
  name: string;
  dimensions: string;
  thickness: string;
  qtySet: number;
  quantity: number;
  unit: string;
  isBomLocked: boolean;
  isWorkflowLocked: boolean;
  flowType: 'OLD' | 'NEW'; 
  subAssemblies: SubAssembly[]; 
  bom: BomItem[];
  workflow: ItemStepConfig[];
  warehouseQty: number; 
  shippedQty: number; 
  assemblyStats: Partial<Record<ProcessStep, { produced: number, available: number }>>;
}

export type MachineStatus = 'IDLE' | 'RUNNING' | 'MAINTENANCE' | 'OFFLINE' | 'DOWNTIME';

export interface Machine {
  id: string;
  userId?: string;
  code: string;
  name: string;
  type: ProcessStep;
  capacityPerHour: number;
  status: MachineStatus;
  personnel: any[];
  isMaintenance: boolean;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'DOWNTIME';

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  itemId: string;
  itemName: string;
  subAssemblyId?: string; 
  subAssemblyName?: string;
  step: ProcessStep;
  machineId?: string; 
  targetQty: number;
  dailyTarget?: number;
  completedQty: number;
  defectQty: number;
  status: TaskStatus;
  note?: string;
  totalDowntimeMinutes: number;
}

export interface ProductionLog {
  id: string;
  taskId: string;
  machineId?: string;
  itemId: string;
  subAssemblyId?: string;
  projectId: string;
  step: ProcessStep;
  shift: Shift;
  goodQty: number;
  defectQty: number;
  operator: string;
  timestamp: string;
  type: 'OUTPUT' | 'DOWNTIME_START' | 'DOWNTIME_END' | 'WAREHOUSE_ENTRY';
}

export type ModuleName = 'PROJECTS' | 'MATERIALS' | 'MACHINES' | 'USERS' | 'DASHBOARD' | 'REPORTS' | 'PROCUREMENT' | 'SJ' | 'WAREHOUSE' | 'EXECUTIVE' | 'BULK_ENTRY';

export type PermissionMap = {
  [key in ModuleName]: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
};

export interface User {
  id: string;
  name: string;
  username: string; // Using email as username
  email?: string; // Added from API response
  email_verified_at?: string; // Added from API response
  created_at?: string; // Added from API response
  updated_at?: string; // Added from API response
  role: 'ADMIN' | 'OPERATOR' | 'MANAGER';
  permissions: PermissionMap;
}

export interface UnitMaster {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  contact: string;
}

export interface ProcurementItem {
  materialId: string;
  material_id?: string;
  name: string;
  qty: number;
  price?: number;
}

export interface RFQ {
  id: string;
  code: string;
  date: string;
  description: string;
  items: ProcurementItem[];
  status: 'DRAFT' | 'PO_CREATED';
}

export interface PurchaseOrder {
  id: string;
  code: string;
  date: string;
  supplierId: string;
  rfq_id?: string;
  rfqId?: string;
  description: string;
  items: ProcurementItem[];
  status: 'OPEN' | 'RECEIVED';
  grandTotal: number;
}

export interface RFQItem {
  id: string;
  rfq_id: string;
  material_id: string;
  name: string;
  qty: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface ReceivingItem {
  id: string;
  receiving_id: string;
  material_id: string;
  name: string;
  qty: number;
  created_at?: string;
  updated_at?: string;
  material?: Material;
  receiving?: ReceivingGood;
}

export interface ReceivingGood {
  id: string;
  code: string;
  date: string;
  po_id: string;
  created_at?: string;
  updated_at?: string;
  purchase_order?: PurchaseOrder;
  items: ReceivingItem[];
}

export interface ReceivingGoods {
  id: string;
  code: string;
  date: string;
  poId: string;
  items: ProcurementItem[];
}

export interface DeliveryOrderItem {
  projectId: string;
  projectName: string;
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
}

export interface DeliveryOrder {
  id: string;
  code: string;
  date: string;
  customer: string;
  address: string;
  driverName: string;
  vehiclePlate: string;
  items: DeliveryOrderItem[];
  status: 'DRAFT' | 'VALIDATED';
}
