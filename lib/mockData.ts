
import { Project, Material, ProjectItem, Machine, Task, User, UnitMaster, ProductionLog, PermissionMap, ProcessStep, Supplier, RFQ, PurchaseOrder, ReceivingGoods, DeliveryOrder } from '../types';

export const MOCK_UNITS: UnitMaster[] = [
  { id: 'u1', name: 'Unit' },
  { id: 'u2', name: 'Set' },
  { id: 'u3', name: 'Pcs' },
  { id: 'u6', name: 'Lembar' },
];

export const MOCK_MATERIALS: Material[] = [
  { id: 'm1', code: 'ST-SHEET-2MM', name: 'Steel Sheet 2mm', unit: 'Lembar', currentStock: 450, safetyStock: 100, pricePerUnit: 50, category: 'RAW' },
  { id: 'm3', code: 'PWD-COAT-WHT', name: 'Powder Coat White', unit: 'KG', currentStock: 200, safetyStock: 50, pricePerUnit: 30, category: 'FINISHING' },
  { id: 'm4', code: 'SCREW-M6', name: 'M6 Screw Set', unit: 'Box', currentStock: 500, safetyStock: 200, pricePerUnit: 5, category: 'HARDWARE' },
];

export const MOCK_MACHINES: Machine[] = [
  { id: 'mac1', code: 'CUT-01', name: 'Laser Cutting 01', type: 'POTONG', capacityPerHour: 50, status: 'IDLE', personnel: [], isMaintenance: false },
  { id: 'mac2', code: 'LAS-01', name: 'Welding Station 01', type: 'LAS', capacityPerHour: 30, status: 'IDLE', personnel: [], isMaintenance: false },
  { id: 'mac3', code: 'PHO-01', name: 'Phosphating Tank 01', type: 'PHOSPHATING', capacityPerHour: 100, status: 'IDLE', personnel: [], isMaintenance: false },
  { id: 'mac4', code: 'CAT-01', name: 'Powder Coating Line', type: 'CAT', capacityPerHour: 60, status: 'IDLE', personnel: [], isMaintenance: false },
  { id: 'mac5', code: 'PCK-01', name: 'Packing & QC Area', type: 'PACKING', capacityPerHour: 80, status: 'IDLE', personnel: [], isMaintenance: false },
];

export const MOCK_PROJECTS: Project[] = [
  { 
    id: 'p1', code: 'PRJ-GONDOLA', name: 'Project Gondola Toko', customer: 'Toko Maju Jaya', startDate: '2024-01-01', deadline: '2024-12-31', status: 'IN_PROGRESS', progress: 50, qtyPerUnit: 3, procurementQty: 12155, totalQty: 36465, unit: 'Set', isLocked: true
  }
];

export const MOCK_ITEMS: ProjectItem[] = [
  {
    id: 'i1', projectId: 'p1', name: 'Tiang Gondola 2m', dimensions: '2000x50x50', thickness: '2mm', qtySet: 2, quantity: 24310, unit: 'Pcs', isBomLocked: true, isWorkflowLocked: true,
    shippedQty: 0,
    warehouseQty: 0,
    flowType: 'NEW',
    subAssemblies: [],
    workflow: [],
    bom: [],
    assemblyStats: {}
  }
];

export const MOCK_TASKS: Task[] = [];

export const MOCK_LOGS: ProductionLog[] = [];

const FULL_ACCESS = { view: true, create: true, edit: true, delete: true };
export const ADMIN_PERMISSIONS: PermissionMap = { 
  PROJECTS: FULL_ACCESS, 
  MATERIALS: FULL_ACCESS, 
  MACHINES: FULL_ACCESS, 
  USERS: FULL_ACCESS, 
  DASHBOARD: FULL_ACCESS, 
  REPORTS: FULL_ACCESS, 
  PROCUREMENT: FULL_ACCESS, 
  SJ: FULL_ACCESS, 
  WAREHOUSE: FULL_ACCESS, 
  EXECUTIVE: FULL_ACCESS,
  BULK_ENTRY: FULL_ACCESS
};

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Super Admin', username: 'admin', role: 'ADMIN', permissions: ADMIN_PERMISSIONS },
];

export const MOCK_SUPPLIERS: Supplier[] = [];
export const MOCK_RFQS: RFQ[] = [];
export const MOCK_POS: PurchaseOrder[] = [];
export const MOCK_RECEIVINGS: ReceivingGoods[] = [];
export const MOCK_DELIVERY_ORDERS: DeliveryOrder[] = [];
