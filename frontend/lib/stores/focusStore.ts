import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak" | "deepWork";
export type FocusStatus = "idle" | "running" | "paused" | "completed";

export const TIMER_MODES: Record<TimerMode, { label: string; duration: number }> = {
  pomodoro: { label: "Pomodoro (25m)", duration: 25 * 60 },
  shortBreak: { label: "Short Break (5m)", duration: 5 * 60 },
  longBreak: { label: "Long Break (15m)", duration: 15 * 60 },
  deepWork: { label: "Deep Work (50m)", duration: 50 * 60 },
};

export interface FocusState {
  mode: TimerMode;
  status: FocusStatus;
  duration: number; // total duration in seconds
  remainingTime: number; // remaining time in seconds
  targetEndTime: number | null; // Date.now() timestamp in ms
  selectedTask: string;
  pomodoroCount: number;
  ambientSound: string;
  isPlayingSound: boolean;

  // Actions
  setMode: (mode: TimerMode) => void;
  setSelectedTask: (task: string) => void;
  setAmbientSound: (sound: string) => void;
  setIsPlayingSound: (playing: boolean) => void;
  startSession: (mode?: TimerMode, duration?: number, task?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  resetSession: () => void;
  tick: () => void;
  completeSession: () => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      mode: "pomodoro",
      status: "idle",
      duration: TIMER_MODES.pomodoro.duration,
      remainingTime: TIMER_MODES.pomodoro.duration,
      targetEndTime: null,
      selectedTask: "Core Strategic Routine",
      pomodoroCount: 0,
      ambientSound: "none",
      isPlayingSound: false,

      setMode: (newMode) => {
        const dur = TIMER_MODES[newMode].duration;
        set({
          mode: newMode,
          duration: dur,
          remainingTime: dur,
          status: "idle",
          targetEndTime: null,
        });
      },

      setSelectedTask: (task) => set({ selectedTask: task }),
      setAmbientSound: (sound) => set({ ambientSound: sound }),
      setIsPlayingSound: (playing) => set({ isPlayingSound: playing }),

      startSession: (customMode, customDuration, customTask) => {
        const state = get();
        const modeToUse = customMode || state.mode;
        const durToUse = customDuration || TIMER_MODES[modeToUse].duration;
        const taskToUse = customTask || state.selectedTask;

        set({
          mode: modeToUse,
          duration: durToUse,
          remainingTime: durToUse,
          targetEndTime: Date.now() + durToUse * 1000,
          status: "running",
          selectedTask: taskToUse,
        });
      },

      pauseSession: () => {
        const { status, targetEndTime } = get();
        if (status === "running" && targetEndTime) {
          const now = Date.now();
          const diffSecs = Math.max(0, Math.round((targetEndTime - now) / 1000));
          set({
            status: "paused",
            remainingTime: diffSecs,
            targetEndTime: null,
          });
        } else if (status === "running") {
          set({ status: "paused", targetEndTime: null });
        }
      },

      resumeSession: () => {
        const { status, remainingTime } = get();
        if (status === "paused" && remainingTime > 0) {
          set({
            status: "running",
            targetEndTime: Date.now() + remainingTime * 1000,
          });
        }
      },

      stopSession: () => {
        const { duration } = get();
        set({
          status: "idle",
          remainingTime: duration,
          targetEndTime: null,
          isPlayingSound: false,
        });
      },

      resetSession: () => {
        const { duration } = get();
        set({
          status: "idle",
          remainingTime: duration,
          targetEndTime: null,
        });
      },

      completeSession: () => {
        const { mode, pomodoroCount } = get();
        const isWork = mode === "pomodoro" || mode === "deepWork";
        set({
          status: "completed",
          remainingTime: 0,
          targetEndTime: null,
          pomodoroCount: isWork ? pomodoroCount + 1 : pomodoroCount,
        });
      },

      tick: () => {
        const { status, targetEndTime } = get();
        if (status !== "running" || !targetEndTime) return;

        const now = Date.now();
        const diffSecs = Math.max(0, Math.round((targetEndTime - now) / 1000));

        if (diffSecs <= 0) {
          get().completeSession();
        } else {
          set({ remainingTime: diffSecs });
        }
      },
    }),
    {
      name: "yvy-focus-storage",
      partialize: (state) => ({
        mode: state.mode,
        status: state.status,
        duration: state.duration,
        remainingTime: state.remainingTime,
        targetEndTime: state.targetEndTime,
        selectedTask: state.selectedTask,
        pomodoroCount: state.pomodoroCount,
        ambientSound: state.ambientSound,
      }),
    }
  )
);
