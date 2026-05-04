import type { RoutineRunSnapshot, RoutineScheduleSnapshot, RoutineSnapshot } from "./types.js";

export class Routine {
  constructor(private readonly snapshot: RoutineSnapshot) {}

  static fromSnapshot(snapshot: RoutineSnapshot): Routine {
    return new Routine(snapshot);
  }

  toSnapshot(): RoutineSnapshot {
    return this.snapshot;
  }
}

export class RoutineRun {
  constructor(private readonly snapshot: RoutineRunSnapshot) {}

  static fromSnapshot(snapshot: RoutineRunSnapshot): RoutineRun {
    return new RoutineRun(snapshot);
  }

  toSnapshot(): RoutineRunSnapshot {
    return this.snapshot;
  }
}

export class RoutineSchedule {
  constructor(private readonly snapshot: RoutineScheduleSnapshot) {}

  static fromSnapshot(snapshot: RoutineScheduleSnapshot): RoutineSchedule {
    return new RoutineSchedule(snapshot);
  }

  toSnapshot(): RoutineScheduleSnapshot {
    return this.snapshot;
  }
}
