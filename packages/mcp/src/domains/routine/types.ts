import type {
  PaperclipRoutine,
  PaperclipRoutineRun,
  PaperclipRoutineSchedule,
} from "../../types.js";

export interface RoutineSnapshot {
  id: string;
  companyId: string;
  name: string;
  raw: PaperclipRoutine;
}

export interface RoutineRunSnapshot {
  id: string;
  routineId: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  raw: PaperclipRoutineRun;
}

export interface RoutineScheduleSnapshot {
  routineId: string;
  nextRunAt: string;
  frequency: string;
  raw: PaperclipRoutineSchedule;
}
