"use client";

import { useRoutine, useUpdateRoutine, useCreateRoutine, useDeleteRoutine, useRoutineTasks, useCreateTask, useDeleteTask } from "@/lib/queries/useRoutines";
import { PageTransition } from "@/components/layouts/PageTransition";
import { Skeleton } from "@/components/shared/Skeleton";
import { ChevronLeft, Save, Trash2, Plus, GripVertical, Clock } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function RoutineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const id = isNew ? "" : (params.id as string);

  const { data: routine, isLoading } = useRoutine(id);
  const { data: tasks } = useRoutineTasks(id);
  
  const createMutation = useCreateRoutine();
  const updateMutation = useUpdateRoutine();
  const deleteMutation = useDeleteRoutine();
  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "📋",
    color: "#6254f8",
    time_of_day: "anytime" as any,
    schedule_type: "daily" as any,
    is_active: true,
  });

  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState("");

  useEffect(() => {
    if (routine) {
      setFormData({
        name: routine.name,
        description: routine.description || "",
        icon: routine.icon,
        color: routine.color,
        time_of_day: routine.time_of_day,
        schedule_type: routine.schedule?.recurrence_type === "weekly" ? "specific_days" : "daily",
        is_active: routine.is_active,
      });
    }
  }, [routine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      color: formData.color,
      time_of_day: formData.time_of_day,
      is_active: formData.is_active,
      schedule: {
        recurrence_type: (formData.schedule_type === "specific_days" ? "weekly" : "daily") as "daily" | "weekly",
        days_of_week: formData.schedule_type === "specific_days" ? [0, 1, 2, 3, 4, 5, 6] : [],
      }
    };

    if (isNew) {
      createMutation.mutate(payload, {
        onSuccess: (data) => router.push(`/routines/${data.id}`),
      });
    } else {
      updateMutation.mutate({ id, data: payload });
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this routine? This action cannot be undone.")) {
      deleteMutation.mutate(id, {
        onSuccess: () => router.push("/routines"),
      });
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    
    createTaskMutation.mutate({
      routineId: id,
      taskData: {
        name: newTaskName,
        duration_minutes: newTaskDuration ? parseInt(newTaskDuration, 10) : 0,
      }
    }, {
      onSuccess: () => {
        setNewTaskName("");
        setNewTaskDuration("");
      }
    });
  };

  if (isLoading && !isNew) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  return (
    <PageTransition>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/routines" className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold">
            {isNew ? "Create Routine" : "Edit Routine"}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="forge-input"
                  placeholder="e.g. Morning Focus"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="forge-input h-24 resize-none"
                  placeholder="What is the purpose of this routine?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Icon (Emoji)</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={formData.icon}
                    onChange={e => setFormData({...formData, icon: e.target.value})}
                    className="forge-input text-xl text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData({...formData, color: e.target.value})}
                    className="h-[42px] w-full rounded-forge cursor-pointer bg-transparent border-none p-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Time of Day</label>
                  <select
                    value={formData.time_of_day}
                    onChange={e => setFormData({...formData, time_of_day: e.target.value as any})}
                    className="forge-input"
                  >
                    <option value="anytime">Any Time</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Schedule</label>
                  <select
                    value={formData.schedule_type}
                    onChange={e => setFormData({...formData, schedule_type: e.target.value as any})}
                    className="forge-input"
                  >
                    <option value="daily">Daily</option>
                    <option value="specific_days">Specific Days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 rounded border-border bg-white/5 accent-forge-500"
                />
                <span className="text-sm font-medium">Active</span>
              </label>

              <button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-forge"
              >
                <Save className="w-4 h-4" />
                {isNew ? "Create" : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Tasks Section */}
          {!isNew && (
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <h3 className="text-lg font-semibold mb-1">Tasks</h3>
                <p className="text-sm text-muted-foreground mb-4">Add tasks to be completed during this routine.</p>
                
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newTaskName}
                    onChange={e => setNewTaskName(e.target.value)}
                    className="forge-input flex-1"
                    placeholder="Task name"
                  />
                  <div className="relative w-24 shrink-0">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="number"
                      min="0"
                      value={newTaskDuration}
                      onChange={e => setNewTaskDuration(e.target.value)}
                      className="forge-input pl-9 text-center"
                      placeholder="min"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={createTaskMutation.isPending || !newTaskName.trim()}
                    className="btn-forge whitespace-nowrap px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>

              <div className="p-2">
                {(!tasks || tasks.length === 0) ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No tasks added yet.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 group transition-colors">
                        <GripVertical className="w-4 h-4 text-muted-foreground/30 cursor-grab opacity-0 group-hover:opacity-100" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.name}</p>
                          {task.duration_minutes > 0 && (
                            <p className="text-xs text-muted-foreground">{task.duration_minutes} mins</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteTaskMutation.mutate({ routineId: id, taskId: task.id })}
                          className="p-2 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {!isNew && (
            <div className="glass-card p-6 border-danger/20">
              <h3 className="text-lg font-semibold text-danger mb-2">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Deleting this routine will also delete all associated tasks, but completion history will remain.
              </p>
              <button 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="w-full btn-ghost border-danger/20 text-danger hover:bg-danger/10 hover:text-danger hover:border-danger/30"
              >
                <Trash2 className="w-4 h-4" />
                Delete Routine
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
