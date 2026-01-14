import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import {
  Plus,
  Trash2,
  X,
  Box,
  Layers,
  Settings2,
  Component,
  ArrowRight,
  Info,
  Lock,
  Save,
  Trash,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  ChevronLeft,
  Target,
  Clock,
  Hammer,
  Calendar,
  ClipboardList,
} from "lucide-react";
import {
  RAW_STEPS,
  ASSEMBLY_STEPS,
  ProcessStep,
  ItemStepConfig,
} from "../types";

// Memoized sub-assembly item component
const SubAssemblyItem = memo(
  ({ sa, isSubModalOpen, lockSubAssembly, deleteSubAssembly }) => {
    return (
      <div
        key={sa.id}
        className="bg-white border-2 border-slate-50 p-8 rounded-[40px] flex justify-between items-center shadow-sm hover:border-blue-200 transition-all"
      >
        <div className="space-y-2">
          <p className="font-black text-slate-900 uppercase text-lg">
            {sa.name}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-bold text-slate-400 uppercase px-2 py-0.5 bg-slate-50 rounded-lg">
              {sa.qtyPerParent} PCS / UNIT
            </span>
            <div className="flex gap-1">
              {(Array.isArray(sa.processes) ? sa.processes : []).map((p, i) => (
                <span
                  key={i}
                  className="text-[8px] font-black text-blue-600 uppercase border border-blue-100 px-2 py-0.5 rounded-lg"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!sa.isLocked ? (
            <button
              onClick={() => lockSubAssembly(isSubModalOpen!, sa.id)}
              className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm hover:bg-emerald-600 hover:text-white transition-all"
            >
              <Lock size={20} />
            </button>
          ) : (
            <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg">
              <Lock size={20} />
            </div>
          )}
          <button
            onClick={() => deleteSubAssembly(isSubModalOpen!, sa.id)}
            className="p-4 bg-red-50 text-red-300 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash size={20} />
          </button>
        </div>
      </div>
    );
  }
);

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projects,
    items,
    machines,
    materials,
    tasks,
    logs,
    addProjectItem,
    deleteProjectItem,
    validateWorkflow,
    addSubAssembly,
    deleteSubAssembly,
    lockSubAssembly,
  } = useStore();

  // Force update state to ensure re-render when needed
  const [, forceUpdate] = useState({});

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState<string | null>(null);
  const [logDetailSa, setLogDetailSa] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [newItem, setNewItem] = useState({
    name: "",
    dimensions: "",
    thickness: "",
    qtySet: 1,
    unit: "PCS",
    flowType: "NEW" as "OLD" | "NEW",
  });
  const [newSub, setNewSub] = useState({
    name: "",
    qtyPerParent: 1,
    materialId: "",
    processes: [] as ProcessStep[],
  });

  const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID');
  };

  const project = projects.find((p) => p.id === id);
  const projectItems = items?.filter((i) => i.projectId === id) || [];

  // Track the total number of sub-assemblies to trigger re-renders
  const totalSubAssemblies = useMemo(() => {
    return projectItems.reduce((total, item) => {
      return total + (item.subAssemblies?.length || 0);
    }, 0);
  }, [projectItems]);

  // State to force re-render when sub-assemblies change
  const [subAssemblyCount, setSubAssemblyCount] = useState(totalSubAssemblies);

  // Update the count when the total changes
  useEffect(() => {
    if (totalSubAssemblies !== subAssemblyCount) {
      setSubAssemblyCount(totalSubAssemblies);
    }
  }, [totalSubAssemblies, subAssemblyCount]);

  // Log when sub-assemblies are fetched from backend
  // We'll use a flag to track if this is the first render
  const hasLoggedRef = React.useRef(false);

  useEffect(() => {
    // Only log if we haven't logged before and there are project items
    if (!hasLoggedRef.current && projectItems.length > 0) {
      console.log(
        `Fetched ${projectItems.length} project items for project ${
          project?.name || id
        }`
      );
      projectItems.forEach((item) => {
        if (item.subAssemblies && item.subAssemblies.length > 0) {
          console.log(
            `Item "${item.name}" has ${item.subAssemblies.length} sub-assemblies:`,
            item.subAssemblies.map((sa) => ({
              id: sa.id,
              name: sa.name,
              qtyPerParent: sa.qtyPerParent,
              processes: sa.processes,
              totalNeeded: sa.totalNeeded,
              completedQty: sa.completedQty,
              totalProduced: sa.totalProduced,
              consumedQty: sa.consumedQty,
              materialId: sa.materialId,
              stepStats: sa.stepStats,
              isLocked: sa.isLocked,
            }))
          );
        } else {
          console.log(`Item "${item.name}" has no sub-assemblies`);
        }
      });

      // Mark that we've logged once
      hasLoggedRef.current = true;
    }
  }, [projectItems, id, project?.name]);

  // Define all callbacks before any conditional returns to follow React Hooks rules
  const handleAddItem = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      addProjectItem({
        ...newItem,
        id: `item-${Date.now()}`,
        projectId: project.id,
        quantity: project.totalQty * newItem.qtySet,
        isBomLocked: false,
        isWorkflowLocked: false,
        bom: [],
        workflow: [],
        subAssemblies: [],
        warehouseQty: 0,
        shippedQty: 0,
        assemblyStats: {},
      } as any);
      setIsItemModalOpen(false);
    },
    [newItem, project, addProjectItem]
  );

  const handleAddSub = useCallback(
    async (itemId: string) => {
      console.log("handleAddSub - newSub before adding:", newSub);
      console.log(
        "handleAddSub - qtyPerParent value:",
        newSub.qtyPerParent,
        typeof newSub.qtyPerParent
      );
      if (
        !newSub.name ||
        !newSub.materialId ||
        (Array.isArray(newSub.processes) ? newSub.processes.length === 0 : true)
      ) {
        alert("Lengkapi Nama, Material, dan Tahapan Proses!");
        return;
      }
      console.log(
        "About to call addSubAssembly with qtyPerParent:",
        newSub.qtyPerParent
      );

      // Create the new sub-assembly object
      const newSubAssembly = {
        ...newSub,
        id: `sa-${Date.now()}`,
        totalNeeded:
          (items.find((i) => i.id === itemId)?.quantity || 0) *
          newSub.qtyPerParent,
        completedQty: 0,
        totalProduced: 0,
        consumedQty: 0,
        // Initialize stepStats for all processes in the sub-assembly
        stepStats: newSub.processes.reduce((stats, process, index) => {
          stats[process] = {
            produced: 0,
            available: index === 0 ? ((items.find((i) => i.id === itemId)?.quantity || 0) * newSub.qtyPerParent) : 0
          };
          return stats;
        }, {}),
        isLocked: false,
      };

      // Call the store function to add the sub-assembly
      await addSubAssembly(itemId, newSubAssembly);

      setNewSub({ name: "", qtyPerParent: 1, materialId: "", processes: [] });
    },
    [newSub, items, addSubAssembly]
  );

  const stats = useMemo(() => {
    const totalTarget = project?.totalQty || 0;
    const completed = tasks
      .filter((t) => t.projectId === id && t.step === "PACKING")
      .reduce((acc, t) => acc + t.completedQty, 0);
    const progress = totalTarget > 0 ? (completed / totalTarget) * 100 : 0;
    return { totalTarget, completed, progress };
  }, [id, tasks, project]);

  // Check if store is still loading initial data
  const isStoreLoading =
    projects.length === 0 && items.length === 0 && materials.length === 0;

  if (isStoreLoading) {
    return (
      <div className="p-10 text-center font-bold text-slate-400 font-sans">
        Memuat data...
      </div>
    );
  }

  if (!project)
    return (
      <div className="p-10 text-center font-bold text-slate-400 font-sans">
        Project Tidak Ditemukan
      </div>
    );

  // Use the subAssemblyCount to ensure re-render when sub-assemblies change
  if (subAssemblyCount !== undefined) {
    // This is just to use the variable to prevent React from optimizing it away
  }

  return (
    <div className="space-y-10 pb-20 font-sans">
      {/* HEADER */}
      <div className="bg-slate-900 rounded-[56px] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
          <div className="space-y-6">
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              <ChevronLeft size={16} /> Kembali Ke Daftar
            </button>
            <div className="flex items-center gap-4">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-xl font-black text-xs tracking-widest">
                {project.code}
              </span>
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-tight">
                {project.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-8 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400">
                  <Target size={20} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase">
                    Pelanggan
                  </p>
                  <p className="text-sm font-black">{project.customer}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase">
                    Deadline
                  </p>
                  <p className="text-sm font-black">
                    {new Date(project.deadline).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full xl:w-96 bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-md">
            <div className="flex justify-between items-end mb-4">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                Progress Global Proyek
              </p>
              <p className="text-3xl font-black text-white">
                {Math.round(stats.progress)}%
              </p>
            </div>
            <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden mb-6">
              <div
                className="bg-emerald-500 h-full transition-all duration-1000"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">
                  Target
                </p>
                <p className="text-lg font-black text-white">
                  {stats.totalTarget}{" "}
                  <span className="text-[10px]">{project.unit}</span>
                </p>
              </div>
              <div className="border-l border-white/10">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">
                  Aktual
                </p>
                <p className="text-lg font-black text-emerald-400">
                  {stats.completed}{" "}
                  <span className="text-[10px]">{project.unit}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
          <Layers className="text-blue-600" /> Item Kerja & Alur Produksi
        </h2>
        <button
          onClick={() => setIsItemModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-[24px] font-black text-xs flex items-center gap-3 shadow-2xl hover:bg-blue-700 transition-all"
        >
          <Plus size={20} /> TAMBAH ITEM
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {projectItems.map((item, idx) => {
          const itemTasks = tasks.filter((t) => t.itemId === item.id);
          const packingTask = itemTasks.find((t) => t.step === "PACKING");
          const finishedQty = packingTask?.completedQty || 0;
          const globalItemPerc =
            item.quantity > 0
              ? Math.round((finishedQty / item.quantity) * 100)
              : 0;

          return (
            <div
              key={item.id}
              className="bg-white rounded-[56px] border border-slate-100 shadow-xl overflow-hidden flex flex-col group transition-all"
            >
              <div className="p-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-gradient-to-r from-slate-50/50 to-white">
                <div className="flex gap-8 items-center flex-1">
                  <div className="w-20 h-20 bg-white border border-slate-200 rounded-[32px] flex items-center justify-center font-black text-slate-900 text-2xl shadow-sm">
                    {globalItemPerc}%
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-6 mt-2">
                      <span className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        <Box size={14} className="text-blue-500" />{" "}
                        {item.dimensions} | {item.thickness}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          item.flowType === "NEW"
                            ? "bg-amber-100 text-amber-600 border border-amber-200"
                            : "bg-blue-100 text-blue-600 border border-blue-200"
                        }`}
                      >
                        ALUR {item.flowType === "NEW" ? "RAKITAN" : "LANGSUNG"}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 text-[11px] font-black text-slate-800 uppercase tracking-widest">
                          <Target size={14} className="text-blue-600" />{" "}
                          {formatNumber(item.quantity)} Target
                        </span>
                        <span className="flex items-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                          <CheckCircle2 size={14} /> {finishedQty} Sudah Jadi
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                  {item.flowType === "NEW" && (
                    <button
                      onClick={() => setIsSubModalOpen(item.id)}
                      className="flex-1 bg-amber-500 text-white px-8 py-5 rounded-[24px] font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                      <Component size={20} /> MASTER RAKITAN
                    </button>
                  )}
                  <button
                    onClick={() => deleteProjectItem(item.id)}
                    className="p-5 text-slate-300 hover:text-red-500 rounded-3xl transition-all"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>

              {/* 1. MONITORING RAKITAN */}
              {item.flowType === "NEW" && (
                <div
                  key={`monitoring-rakitan-${item.id}`}
                  className="p-10 pt-0 space-y-8"
                >
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-3">
                    <Component size={14} /> MONITORING RAKITAN (BAHAN MENTAH)
                  </h4>
                  <div className="border rounded-[40px] overflow-hidden bg-white shadow-sm overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs min-w-[1000px]">
                      <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b">
                        <tr>
                          <th className="px-8 py-5">Komponen</th>
                          <th className="px-8 py-5 text-center">Qty/Unit</th>
                          <th className="px-8 py-5 text-center">Total Perlu</th>
                          {RAW_STEPS.map((s) => (
                            <th key={s} className="px-8 py-5 text-center">
                              {s} <br />
                              <span className="text-[8px] opacity-60">
                                (Hasil / Sedia)
                              </span>
                            </th>
                          ))}
                          <th className="px-8 py-5 text-center bg-emerald-50/50">
                            Sisa Stok <br />
                            <span className="text-[8px] opacity-60">
                              (Siap Las)
                            </span>
                          </th>
                          <th className="px-8 py-5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-bold">
                        {item.subAssemblies && item.subAssemblies.length > 0 ? (
                          item.subAssemblies.map((sa) => (
                            <tr
                              key={sa.id}
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-8 py-6 uppercase font-black text-slate-900">
                                {sa.name}
                              </td>
                              <td className="px-8 py-6 text-center text-slate-400">
                                {sa.qtyPerParent}
                              </td>
                              <td className="px-8 py-6 text-center text-slate-900 font-black">
                                {formatNumber(sa.totalNeeded)}
                              </td>
                              {RAW_STEPS.map((s) => {
                                const processes = (() => {
                                  if (Array.isArray(sa.processes))
                                    return sa.processes;
                                  if (
                                    typeof sa.processes === "object" &&
                                    sa.processes !== null
                                  )
                                    return Object.values(sa.processes);
                                  return [];
                                })();

                                const isIncluded = processes.includes(s);

                                const stats = sa.stepStats?.[s] || {
                                  produced: 0,
                                  available: 0,
                                };
                                console.info(isIncluded);
                                const perc =
                                  sa.totalNeeded > 0
                                    ? Math.round(
                                        (stats.produced / sa.totalNeeded) * 100
                                      )
                                    : 0;

                                //   console.info(perc);
                                return (
                                  <td key={s} className="px-8 py-6 text-center">
                                    {isIncluded ? (
                                      <div className="flex flex-col items-center">
                                        <span
                                          className={`px-3 py-1 rounded-xl font-black text-[11px] bg-slate-100 text-slate-800 shadow-sm`}
                                        >
                                          {formatNumber(stats.produced)}{" "}
                                          <span className="text-[8px] opacity-40 ml-1">
                                            {perc}%
                                          </span>
                                        </span>
                                        <span
                                          className={`text-[10px] font-black mt-1 ${
                                            stats.available > 0
                                              ? "text-blue-600"
                                              : "text-slate-300"
                                          }`}
                                        >
                                          Sedia: {formatNumber(stats.available)}
                                        </span>
                                      </div>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                );
                              })}
                              <td className="px-8 py-6 text-center text-emerald-600 font-black text-lg bg-emerald-50/20">
                                {sa.completedQty}
                              </td>
                              <td className="px-8 py-6 text-right">
                                <button
                                  onClick={() =>
                                    setLogDetailSa({ id: sa.id, name: sa.name })
                                  }
                                  className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                                >
                                  <ClipboardList size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-8 py-12 text-center text-slate-400 font-black italic"
                            >
                              Belum ada komponen rakitan. Silakan tambahkan dari
                              tombol "MASTER RAKITAN".
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. MONITORING ASSEMBLY */}
              <div className="px-10 pb-10 space-y-8">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-3">
                  <Hammer size={14} /> MONITORING ALUR ASSEMBLY (BARANG JADI)
                </h4>
                <div className="border rounded-[40px] overflow-hidden bg-white shadow-sm overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs min-w-[800px]">
                    <thead className="bg-slate-900 text-slate-400 font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-5">Nama Item</th>
                        <th className="px-8 py-5 text-center">Total Target</th>
                        {ASSEMBLY_STEPS.map((s) => (
                          <th key={s} className="px-8 py-5 text-center">
                            {s} <br />
                            <span className="text-[8px] opacity-60">
                              (Hasil / Sedia)
                            </span>
                          </th>
                        ))}
                        <th className="px-8 py-5 text-right">Log</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-bold">
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 uppercase font-black text-slate-900">
                          {item.name}
                        </td>
                        <td className="px-8 py-6 text-center text-slate-900">
                          {formatNumber(item.quantity)}
                        </td>
                        {ASSEMBLY_STEPS.map((s) => {
                          const stats = item.assemblyStats?.[s] || {
                            produced: 0,
                            available: 0,
                          };
                          const perc =
                            item.quantity > 0
                              ? Math.round(
                                  (stats.produced / item.quantity) * 100
                                )
                              : 0;

                          // Calculate available quantity for LAS step based on sub-assemblies
                          let availableQty = stats.available;
                          if (s === "LAS") {
                            const saBalances = (item.subAssemblies || []).map(
                              (sa) => {
                                return Math.floor(
                                  sa.completedQty / sa.qtyPerParent
                                );
                              }
                            );
                            availableQty =
                              saBalances.length > 0
                                ? Math.min(...saBalances)
                                : Math.max(
                                    0,
                                    item.quantity -
                                      (item.assemblyStats?.[s]?.produced || 0)
                                  );
                          }

                          return (
                            <td key={s} className="px-8 py-6 text-center">
                              <div className="flex flex-col items-center">
                                <span className="px-3 py-1 rounded-xl font-black text-[11px] bg-blue-50 text-blue-600 shadow-sm">
                                  {formatNumber(stats.produced)}{" "}
                                  <span className="text-[8px] opacity-40 ml-1">
                                    {perc}%
                                  </span>
                                </span>
                                <span
                                  className={`text-[10px] font-black mt-1 ${
                                    availableQty > 0
                                      ? "text-emerald-600"
                                      : "text-slate-300"
                                  }`}
                                >
                                  Sedia: {formatNumber(availableQty)}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() =>
                              setLogDetailSa({ id: item.id, name: item.name })
                            }
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                          >
                            <ClipboardList size={18} />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {ASSEMBLY_STEPS.map((step) => {
                    const task = itemTasks.find((t) => t.step === step);
                    const perc = task
                      ? Math.round((task.completedQty / task.targetQty) * 100)
                      : 0;
                    return (
                      <div
                        key={step}
                        className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {step}
                          </span>
                          <span
                            className={`text-xs font-black ${
                              perc === 100
                                ? "text-emerald-500"
                                : "text-blue-600"
                            }`}
                          >
                            {perc}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-700 ${
                              perc === 100 ? "bg-emerald-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${perc}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase">
                              Input
                            </p>
                            <p className="text-xl font-black text-slate-900">
                              {task?.completedQty || 0}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-black text-slate-400 uppercase">
                              Target
                            </p>
                            <p className="text-sm font-black text-slate-500">
                              {formatNumber(item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL LOG RIWAYAT */}
      {logDetailSa && (
        <div className="fixed inset-0 bg-slate-950/90 z-[600] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[56px] w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-12 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase">
                  Riwayat Input: {logDetailSa.name}
                </h2>
                <p className="text-[10px] font-black text-blue-600 uppercase mt-2">
                  Log PIC & Waktu Pengerjaan
                </p>
              </div>
              <button
                onClick={() => setLogDetailSa(null)}
                className="p-4 text-slate-400 hover:bg-slate-200 rounded-full transition-all"
              >
                <X size={32} />
              </button>
            </div>
            <div className="p-12 overflow-y-auto custom-scrollbar space-y-4">
              {logs.filter(
                (l) =>
                  l.subAssemblyId === logDetailSa.id ||
                  l.itemId === logDetailSa.id
              ).length > 0 ? (
                logs
                  .filter(
                    (l) =>
                      l.subAssemblyId === logDetailSa.id ||
                      l.itemId === logDetailSa.id
                  )
                  .map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex justify-between items-center"
                    >
                      <div className="flex gap-6 items-center">
                        <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                          <Clock size={28} />
                        </div>
                        <div>
                          <p className="text-slate-800 font-black text-sm uppercase">
                            PROSES: {log.step}
                          </p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                            PIC: {log.operator} |{" "}
                            {new Date(log.timestamp).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-emerald-600 leading-none">
                          +{log.goodQty}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                          Dihasilkan
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-20 text-center text-slate-300 font-black italic uppercase">
                  Belum ada riwayat.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL MASTER RAKITAN */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 z-[500] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[56px] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-12 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase">
                  Konfigurasi Rakitan
                </h2>
                <p className="text-[10px] font-black text-blue-600 uppercase mt-2">
                  Daftar Komponen & Alur Bahan Mentah
                </p>
              </div>
              <button
                onClick={() => setIsSubModalOpen(null)}
                className="p-4 text-slate-400 hover:bg-slate-200 rounded-full transition-all"
              >
                <X size={32} />
              </button>
            </div>
            <div className="p-12 overflow-y-auto space-y-12 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-slate-100 p-10 rounded-[48px] border-2 border-white shadow-inner">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                    NAMA KOMPONEN
                  </label>
                  <input
                    className="w-full p-5 bg-white border border-slate-200 rounded-[28px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-100"
                    placeholder="e.g. TIANG UTAMA"
                    value={newSub.name}
                    onChange={(e) =>
                      setNewSub({ ...newSub, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                    MATERIAL
                  </label>
                  <select
                    className="w-full p-5 bg-white border border-slate-200 rounded-[28px] font-black outline-none"
                    value={newSub.materialId}
                    onChange={(e) =>
                      setNewSub({ ...newSub, materialId: e.target.value })
                    }
                  >
                    <option value="">Pilih...</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                    QTY / UNIT JADI
                  </label>
                  <input
                    type="number"
                    className="w-full p-5 bg-white border border-slate-200 rounded-[28px] font-black outline-none text-center"
                    value={newSub.qtyPerParent}
                    onChange={(e) =>
                      setNewSub({
                        ...newSub,
                        qtyPerParent: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-4 md:col-span-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                    ALUR PROSES RAKITAN
                  </label>
                  <div className="flex flex-wrap gap-4 p-6 bg-white rounded-[32px] border border-slate-200">
                    {RAW_STEPS.map((s, idx) => {
                      const isAdded = Array.isArray(newSub.processes)
                        ? newSub.processes.includes(s)
                        : false;
                      return (
                        <button
                          key={s}
                          onClick={() =>
                            setNewSub((p) => ({
                              ...p,
                              processes: isAdded
                                ? Array.isArray(p.processes)
                                  ? p.processes.filter((x) => x !== s)
                                  : []
                                : [
                                    ...(Array.isArray(p.processes)
                                      ? p.processes
                                      : []),
                                    s,
                                  ],
                            }))
                          }
                          className={`px-8 py-4 rounded-[20px] border-2 font-black text-xs uppercase transition-all flex items-center gap-3 ${
                            isAdded
                              ? "bg-blue-600 border-blue-600 text-white shadow-xl"
                              : "bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-300"
                          }`}
                        >
                          <span className="opacity-50">{idx + 1}.</span> {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => handleAddSub(isSubModalOpen!)}
                  className="md:col-span-4 py-6 bg-slate-900 text-white rounded-[28px] font-black uppercase text-sm tracking-widest shadow-2xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-4"
                >
                  <Save size={20} /> TAMBAHKAN KE RAKITAN
                </button>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                  <Hammer size={14} /> KOMPONEN TERDAFTAR
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(() => {
                    const currentItem = items.find(
                      (i) => i.id === isSubModalOpen
                    );

                    return currentItem &&
                      currentItem.subAssemblies &&
                      currentItem.subAssemblies.length > 0 ? (
                      currentItem.subAssemblies.map((sa) => (
                        <SubAssemblyItem
                          key={sa.id}
                          sa={sa}
                          isSubModalOpen={isSubModalOpen}
                          lockSubAssembly={lockSubAssembly}
                          deleteSubAssembly={deleteSubAssembly}
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center text-slate-400 font-black italic">
                        Belum ada komponen rakitan terdaftar. Silakan tambahkan
                        menggunakan form di atas.
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT ITEM */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-[400] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[56px] w-full max-w-xl shadow-2xl animate-in zoom-in-95">
            <div className="p-10 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-black text-slate-900 uppercase">
                Input Item Baru
              </h2>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-all"
              >
                <X size={28} />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-12 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                  Gunakan Alur
                </label>
                <div className="flex bg-slate-100 p-2 rounded-[24px]">
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, flowType: "OLD" })}
                    className={`flex-1 py-5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                      newItem.flowType === "OLD"
                        ? "bg-white text-blue-600 shadow-xl"
                        : "text-slate-400"
                    }`}
                  >
                    DIRECT (LAMA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, flowType: "NEW" })}
                    className={`flex-1 py-5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                      newItem.flowType === "NEW"
                        ? "bg-white text-amber-600 shadow-xl"
                        : "text-slate-400"
                    }`}
                  >
                    RAKITAN (BARU)
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                  Nama Item Jadi
                </label>
                <input
                  required
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[28px] font-black uppercase outline-none"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder="TIANG GONDOLA DOUBLE"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                    Dimensi
                  </label>
                  <input
                    required
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[28px] font-black outline-none"
                    value={newItem.dimensions}
                    onChange={(e) =>
                      setNewItem({ ...newItem, dimensions: e.target.value })
                    }
                    placeholder="2000x50x50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                    Qty / Set
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[28px] font-black outline-none"
                    value={newItem.qtySet}
                    onChange={(e) =>
                      setNewItem({ ...newItem, qtySet: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-7 bg-blue-600 text-white rounded-[32px] font-black uppercase text-sm tracking-[0.3em] shadow-2xl hover:bg-blue-700 transition-all active:scale-95"
              >
                SIMPAN ITEM KERJA
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
