import React, { useState, useMemo } from "react";
import { useStore } from "../store/useStore";
import {
  Save,
  CheckCircle,
  Search,
  Filter,
  Info,
  Hammer,
  Box,
  LayoutGrid,
  Target,
  Users as UsersIcon,
  Clock,
  Component,
  Layers,
  Package,
  Smartphone,
} from "lucide-react";
import {
  Shift,
  Task,
  ASSEMBLY_STEPS,
  ProcessStep,
  ALL_STEPS,
  ProjectItem,
  Project,
} from "../types";

interface InputRowState {
  good: number;
  defect: number;
  pic: string;
  shift: Shift | "";
}

const STEP_PRIORITY: Record<ProcessStep, number> = {
  POTONG: 1,
  PLONG: 2,
  PRESS: 3,
  LAS: 4,
  PHOSPHATING: 5,
  CAT: 6,
  PACKING: 7,
};

export const BulkEntry: React.FC = () => {
  const { projects, items, tasks, currentUser, users, reportProduction } =
    useStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");
  const [selectedStep, setSelectedStep] = useState<string>("ALL");
  const [inputs, setInputs] = useState<Record<string, InputRowState>>({});
  const [successRows, setSuccessRows] = useState<Record<string, boolean>>({});

  const formatNumber = (num: number) => {
    return num.toLocaleString("id-ID");
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(
      (p) => selectedProjectId === "ALL" || p.id === selectedProjectId
    );
  }, [projects, selectedProjectId]);

  const getDailyTarget = (task: Task) => {
    const project = projects.find((p) => p.id === task.projectId);
    if (!project) return 0;

    const deadline = new Date(project.deadline).getTime();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysLeft = Math.max(
      1,
      Math.ceil((deadline - today.getTime()) / (1000 * 60 * 60 * 24))
    );
    const remainingQty = task.targetQty - task.completedQty;

    return Math.ceil(remainingQty / daysLeft);
  };

  const getReadyQty = (task: Task) => {
    const item = items.find((i) => i.id === task.itemId);
    if (!item) return 0;

    if (task.subAssemblyId) {
      const sa = item.subAssemblies.find((x) => x.id === task.subAssemblyId);
      if (!sa) return 0;

      // Convert processes to array if it's stored as an object
      const processesArray = Array.isArray(sa.processes)
        ? sa.processes
        : Object.values(sa.processes || []);
      const processIdx = processesArray.indexOf(task.step);

      if (processIdx === 0) {
        const producedAtThisStep = sa.stepStats[task.step]?.produced || 0;
        return Math.max(0, sa.totalNeeded - producedAtThisStep);
      }
      const prevStep = sa.processes[processIdx - 1];
      return sa.stepStats[prevStep]?.available || 0;
    } else {
      const currentStepIdx = ASSEMBLY_STEPS.indexOf(task.step);
      if (task.step === "LAS") {
        const saBalances = item.subAssemblies.map((sa) => {
          return Math.floor(sa.completedQty / sa.qtyPerParent);
        });
        return saBalances.length > 0
          ? Math.min(...saBalances)
          : Math.max(0, task.targetQty - task.completedQty);
      }
      if (currentStepIdx > 0) {
        const prevStep = ASSEMBLY_STEPS[currentStepIdx];
        console.info(item);
        return item.assemblyStats?.[prevStep]?.available || 0;
      }
      return Math.max(0, task.targetQty - task.completedQty);
    }
  };

  const handleInputChange = (
    taskId: string,
    field: keyof InputRowState,
    value: string | number
  ) => {
    setInputs((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || { good: 0, defect: 0, pic: "", shift: "" }),
        [field]: value,
      },
    }));
    if (successRows[taskId]) {
      setSuccessRows((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const handleSaveRow = (task: Task) => {
    const row = inputs[task.id];
    if (!row) return;
    if (row.good === 0 && row.defect === 0) return;
    if (!row.pic) return alert("Pilih PIC Lapangan!");
    if (!row.shift) return alert("Pilih Shift!");

    const ready = getReadyQty(task);
    const totalInput = row.good + row.defect;

    if (totalInput > ready) {
      if (
        !confirm(
          `Input (${formatNumber(
            totalInput
          )}) melebihi stok tersedia (${formatNumber(ready)}). Simpan?`
        )
      )
        return;
    }

    // CATATAN PENTING:
    // Untuk benar-benar memperbarui data sub assembly di backend,
    // fungsi updateSubAssemblyStats perlu ditambahkan ke store Zustand
    // yang akan mengirim permintaan ke API untuk memperbarui data di database.
    // Fungsi ini seharusnya mengurangi available untuk step saat ini
    // dan menambahkan available untuk step berikutnya.

    // Panggil reportProduction yang akan menangani sisa logika produksi
    reportProduction(
      task.id,
      row.good,
      row.defect,
      row.shift as Shift,
      row.pic
    );

    setSuccessRows((prev) => ({ ...prev, [task.id]: true }));
    setInputs((prev) => ({
      ...prev,
      [task.id]: { ...prev[task.id], good: 0, defect: 0 },
    }));

    setTimeout(() => {
      setSuccessRows((prev) => ({ ...prev, [task.id]: false }));
    }, 2000);
  };

  const renderTaskTable = (title: string, taskList: Task[], color: string) => {
    if (taskList.length === 0) return null;

    return (
      <div className="space-y-4 mb-10">
        <div
          className={`px-6 py-3 rounded-2xl flex items-center justify-between ${
            color === "amber" ? "bg-amber-100/50" : "bg-blue-100/50"
          }`}
        >
          <h4
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              color === "amber" ? "text-amber-700" : "text-blue-700"
            }`}
          >
            {title}
          </h4>
        </div>

        {/* Desktop View */}
        <div className="hidden xl:block bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-black uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-8 py-5 sticky left-0 bg-slate-900 z-10">
                    Tahapan
                  </th>
                  <th className="px-6 py-5 text-center">Progress</th>
                  <th className="px-6 py-5 text-center">Daily Target</th>
                  <th className="px-6 py-5 text-center bg-blue-600/10 text-blue-400">
                    Sedia
                  </th>
                  <th className="px-6 py-5 text-center bg-emerald-900 text-emerald-400">
                    Bagus
                  </th>
                  <th className="px-6 py-5 text-center bg-red-900 text-red-400">
                    Defect
                  </th>
                  <th className="px-6 py-5 text-center">Shift</th>
                  <th className="px-6 py-5">PIC</th>
                  <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {taskList.map((task) => {
                  const ready = getReadyQty(task);
                  const dailyTarget = getDailyTarget(task);
                  const rowState = inputs[task.id] || {
                    good: 0,
                    defect: 0,
                    pic: "",
                    shift: "",
                  };
                  const isSuccess = successRows[task.id];
                  const progressPerc = Math.round(
                    (task.completedQty / task.targetQty) * 100
                  );

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSuccess ? "bg-emerald-50/50" : ""
                      }`}
                    >
                      <td className="px-8 py-5 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10">
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase leading-none mb-1">
                            {task.step}
                          </p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">
                            {task.subAssemblyName || "FINAL"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`text-xl font-black ${
                            progressPerc === 100
                              ? "text-emerald-500"
                              : "text-blue-600"
                          }`}
                        >
                          {progressPerc}%
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-sm font-black text-amber-700">
                          {formatNumber(dailyTarget)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center bg-blue-600/5">
                        <span
                          className={`text-lg font-black ${
                            ready > 0 ? "text-blue-600" : "text-slate-300"
                          }`}
                        >
                          {formatNumber(ready)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center bg-emerald-50/30">
                        <input
                          type="number"
                          className="w-24 p-2 bg-white border border-emerald-100 rounded-xl text-center font-black text-lg text-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all shadow-sm"
                          value={rowState.good || ""}
                          onChange={(e) =>
                            handleInputChange(
                              task.id,
                              "good",
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-5 text-center bg-red-50/30">
                        <input
                          type="number"
                          className="w-24 p-2 bg-white border border-red-100 rounded-xl text-center font-black text-lg text-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all shadow-sm"
                          value={rowState.defect || ""}
                          onChange={(e) =>
                            handleInputChange(
                              task.id,
                              "defect",
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-5 text-center">
                        <select
                          className={`w-24 p-2 bg-slate-50 border rounded-xl text-[9px] font-black uppercase outline-none ${
                            !rowState.shift
                              ? "border-red-200"
                              : "border-slate-200"
                          }`}
                          value={rowState.shift}
                          onChange={(e) =>
                            handleInputChange(task.id, "shift", e.target.value)
                          }
                        >
                          <option value="">Shift?</option>
                          <option value="SHIFT_1">S1</option>
                          <option value="SHIFT_2">S2</option>
                          <option value="SHIFT_3">S3</option>
                        </select>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          className={`w-32 p-2 bg-white border rounded-xl text-[9px] font-black uppercase outline-none ${
                            !rowState.pic
                              ? "border-red-200"
                              : "border-slate-200"
                          }`}
                          value={rowState.pic}
                          onChange={(e) =>
                            handleInputChange(task.id, "pic", e.target.value)
                          }
                        >
                          <option value="">Pilih PIC...</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => handleSaveRow(task)}
                          disabled={
                            (rowState.good === 0 && rowState.defect === 0) ||
                            !rowState.pic ||
                            !rowState.shift ||
                            isSuccess
                          }
                          className={`w-12 h-12 rounded-xl transition-all shadow-lg active:scale-90 flex items-center justify-center ${
                            isSuccess
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-900 text-white hover:bg-blue-600 disabled:opacity-5"
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle size={20} />
                          ) : (
                            <Save size={20} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile / Card View */}
        <div className="xl:hidden space-y-4">
          {taskList.map((task) => {
            const ready = getReadyQty(task);
            const dailyTarget = getDailyTarget(task);
            const rowState = inputs[task.id] || {
              good: 0,
              defect: 0,
              pic: "",
              shift: "",
            };
            const isSuccess = successRows[task.id];
            const progressPerc = Math.round(
              (task.completedQty / task.targetQty) * 100
            );

            return (
              <div
                key={task.id}
                className={`bg-white rounded-3xl border-2 p-6 shadow-sm space-y-6 transition-all ${
                  isSuccess
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-100"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      {task.step}
                    </p>
                    <h5 className="text-sm font-black text-slate-900 uppercase">
                      {task.subAssemblyName || "FINAL PROCESS"}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-blue-600">
                      {progressPerc}%
                    </span>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">
                      Progress
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex flex-col items-center">
                    <p className="text-[8px] font-black text-amber-500 uppercase mb-1">
                      Target Hari Ini
                    </p>
                    <p className="text-lg font-black text-amber-700">
                      {formatNumber(dailyTarget)}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 flex flex-col items-center">
                    <p className="text-[8px] font-black text-blue-500 uppercase mb-1">
                      Sedia Diolah
                    </p>
                    <p className="text-lg font-black text-blue-700">
                      {formatNumber(ready)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">
                      Qty Bagus
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-center text-xl text-emerald-600 outline-none"
                      value={rowState.good || ""}
                      onChange={(e) =>
                        handleInputChange(
                          task.id,
                          "good",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">
                      Qty Defect
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-center text-xl text-red-500 outline-none"
                      value={rowState.defect || ""}
                      onChange={(e) =>
                        handleInputChange(
                          task.id,
                          "defect",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="p-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-xs uppercase"
                    value={rowState.shift}
                    onChange={(e) =>
                      handleInputChange(task.id, "shift", e.target.value)
                    }
                  >
                    <option value="">SHIFT?</option>
                    <option value="SHIFT_1">S1 (PAGI)</option>
                    <option value="SHIFT_2">S2 (SORE)</option>
                    <option value="SHIFT_3">S3 (MALAM)</option>
                  </select>
                  <select
                    className="p-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-xs uppercase"
                    value={rowState.pic}
                    onChange={(e) =>
                      handleInputChange(task.id, "pic", e.target.value)
                    }
                  >
                    <option value="">PIC?</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleSaveRow(task)}
                  disabled={
                    (rowState.good === 0 && rowState.defect === 0) ||
                    !rowState.pic ||
                    !rowState.shift ||
                    isSuccess
                  }
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 ${
                    isSuccess
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-900 text-white hover:bg-blue-600 disabled:opacity-5"
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle size={18} />
                  ) : (
                    <>
                      <Save size={18} /> SIMPAN LAPORAN
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Operator Admin
          </h1>
          <p className="text-slate-500 font-bold mt-3 uppercase tracking-[0.2em] text-[10px]">
            Dashboard Input Produksi Lapangan
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <div className="bg-white p-2.5 rounded-2xl border flex items-center gap-3 shadow-sm flex-1 xl:flex-none">
            <LayoutGrid size={20} className="text-slate-400" />
            <select
              className="flex-1 bg-transparent border-none outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="ALL">SEMUA PROJECT</option>
              {projects
                .filter((p) => p.status === "IN_PROGRESS" || p.isLocked)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border flex items-center gap-3 shadow-sm flex-1 xl:flex-none">
            <Filter size={20} className="text-slate-400" />
            <select
              className="flex-1 bg-transparent border-none outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer"
              value={selectedStep}
              onChange={(e) => setSelectedStep(e.target.value)}
            >
              <option value="ALL">SEMUA PROSES</option>
              {ALL_STEPS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {filteredProjects.map((project) => {
          const projectItems = items.filter(
            (it) => it.projectId === project.id
          );
          if (projectItems.length === 0) return null;

          return (
            <div key={project.id} className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-lg" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                  {project.name}
                </h2>
              </div>

              {projectItems.map((item) => {
                const itemTasks = tasks
                  .filter(
                    (t) =>
                      t.itemId === item.id &&
                      t.status !== "COMPLETED" &&
                      (selectedStep === "ALL" || t.step === selectedStep)
                  )
                  .sort(
                    (a, b) =>
                      (STEP_PRIORITY[a.step] || 99) -
                      (STEP_PRIORITY[b.step] || 99)
                  );

                if (itemTasks.length === 0) return null;

                const rawTasks = itemTasks.filter((t) => !!t.subAssemblyId);
                const finishTasks = itemTasks.filter((t) => !t.subAssemblyId);

                return (
                  <div
                    key={item.id}
                    className="bg-slate-100/50 p-6 xl:p-10 rounded-[48px] border border-white shadow-inner space-y-8"
                  >
                    <div className="px-2">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                        <Box size={18} className="text-blue-500" /> {item.name}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                        {item.dimensions} | Qty: {formatNumber(item.quantity)}{" "}
                        Unit
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {renderTaskTable(
                        `BAHAN MENTAH (SUB-ASSEMBLY)`,
                        rawTasks,
                        "amber"
                      )}
                      {renderTaskTable(
                        `ALUR ASSEMBLY (FINAL ASSEMBLY)`,
                        finishTasks,
                        "blue"
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="py-60 text-center text-slate-300 font-black uppercase italic tracking-[0.5em] text-[10px]">
            Silahkan pilih project melalui filter di atas.
          </div>
        )}
      </div>

      {/* Manual Legend Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 xl:hidden">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
          <Smartphone size={24} className="text-blue-500 shrink-0" />
          <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
            Tampilan telah dioptimasi untuk penggunaan smartphone di lapangan.
          </p>
        </div>
      </div>
    </div>
  );
};
