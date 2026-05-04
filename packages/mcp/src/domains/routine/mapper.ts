import type {
  PaperclipIssue,
  PaperclipRoutine,
  PaperclipRoutineRun,
  PaperclipRoutineSchedule,
} from "../../types.js";
import { Routine, RoutineRun, RoutineSchedule } from "./entity.js";
import type { RoutineRunSnapshot, RoutineScheduleSnapshot, RoutineSnapshot } from "./types.js";

function toRoutineIdFromIssue(issue: PaperclipIssue): string {
  return `routine-${issue.id.substring(0, 8)}`;
}

function isRoutineIssue(issue: PaperclipIssue): boolean {
  return issue.title.toLowerCase().includes("routine");
}

export function toRoutineDomain(issue: PaperclipIssue): Routine {
  const raw: PaperclipRoutine = { id: toRoutineIdFromIssue(issue), name: issue.title };
  const snapshot: RoutineSnapshot = {
    id: raw.id,
    companyId: issue.companyId,
    name: raw.name,
    raw,
  };
  return Routine.fromSnapshot(snapshot);
}

export function toRoutineDomainList(issues: PaperclipIssue[]): Routine[] {
  const routines = issues.filter(isRoutineIssue).map((issue) => toRoutineDomain(issue));
  const dedup = new Map<string, Routine>();
  for (const routine of routines) {
    dedup.set(routine.toSnapshot().id, routine);
  }
  return Array.from(dedup.values());
}

export function toRoutineRunDomain(issue: PaperclipIssue, routineId: string): RoutineRun {
  const raw: PaperclipRoutineRun = {
    id: issue.id,
    status: issue.status,
    createdAt: issue.createdAt,
    ...(issue.completedAt ? { completedAt: issue.completedAt } : {}),
  };
  const snapshot: RoutineRunSnapshot = {
    id: raw.id,
    routineId,
    status: raw.status,
    createdAt: raw.createdAt,
    completedAt: issue.completedAt,
    raw,
  };
  return RoutineRun.fromSnapshot(snapshot);
}

export function toRoutineRunDomainList(issues: PaperclipIssue[], routineId: string): RoutineRun[] {
  return issues.map((issue) => toRoutineRunDomain(issue, routineId));
}

export function toRoutineScheduleDomain(
  routineId: string,
  schedule: PaperclipRoutineSchedule,
): RoutineSchedule {
  const snapshot: RoutineScheduleSnapshot = {
    routineId,
    nextRunAt: schedule.nextRunAt,
    frequency: schedule.frequency,
    raw: schedule,
  };
  return RoutineSchedule.fromSnapshot(snapshot);
}
