import React from "react";
import { AlertTriangle } from "lucide-react";
import { useDeleteRoutine } from "@/lib/queries/useRoutines";
import { RoutineBlock } from "@/types/api";
import { ResponsiveModal, ResponsiveModalFooter } from "@/components/ui/ResponsiveModal";

interface DeleteRoutineModalProps {
  routine: RoutineBlock;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteRoutineModal({ routine, isOpen, onClose }: DeleteRoutineModalProps) {
  const { mutate: deleteRoutine, isPending } = useDeleteRoutine();

  const handleDelete = () => {
    deleteRoutine(routine.id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      icon={
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
      }
      title="Delete Routine?"
      description={
        <>
          Are you sure you want to delete <strong className="text-white font-medium">&quot;{routine.name}&quot;</strong>?
          <br /><br />
          This will remove the routine from your dashboard. However, your historical progress, XP, and streaks will remain intact safely in the background.
        </>
      }
      className="border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)] bg-gradient-to-br from-red-500/5 to-transparent"
    >
      <ResponsiveModalFooter>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="w-full sm:flex-1 py-3.5 sm:py-2.5 rounded-xl bg-red-500/90 hover:bg-red-500 border border-red-500/50 text-white text-sm font-semibold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Delete Routine"
          )}
        </button>
        <button 
          onClick={onClose}
          disabled={isPending}
          className="w-full sm:flex-1 py-3.5 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-colors text-white"
        >
          Cancel
        </button>
      </ResponsiveModalFooter>
    </ResponsiveModal>
  );
}
