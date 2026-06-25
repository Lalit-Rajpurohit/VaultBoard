import type { ID, Priority, Recurrence, Task, TaskStatus } from '@/types';
import { addDays, now, startOfDay, endOfDay } from '@/utils/date';
import { createId } from '@/utils/id';

import { all, first, run } from '../client';

interface TaskRow {
  id: string;
  title: string;
  note_id: string | null;
  card_id: string | null;
  due_at: number | null;
  priority: number;
  status: string;
  recurrence: string;
  completed_at: number | null;
  created_at: number;
}

const mapTask = (r: TaskRow): Task => ({
  id: r.id,
  title: r.title,
  noteId: r.note_id,
  cardId: r.card_id,
  dueAt: r.due_at,
  priority: r.priority as Priority,
  status: r.status as TaskStatus,
  recurrence: r.recurrence as Recurrence,
  completedAt: r.completed_at,
  createdAt: r.created_at,
});

export function listTasks(): Task[] {
  return all<TaskRow>(
    `SELECT * FROM tasks ORDER BY status = 'done', due_at IS NULL, due_at, priority DESC`
  ).map(mapTask);
}

export function todayTasks(): Task[] {
  const start = startOfDay(new Date()).getTime();
  const end = endOfDay(new Date()).getTime();
  return all<TaskRow>(
    `SELECT * FROM tasks
     WHERE status != 'done' AND (due_at BETWEEN ? AND ? OR due_at < ?)
     ORDER BY due_at, priority DESC`,
    [start, end, start]
  ).map(mapTask);
}

export function upcomingTasks(days = 7): Task[] {
  const start = endOfDay(new Date()).getTime();
  const end = endOfDay(addDays(new Date(), days)).getTime();
  return all<TaskRow>(
    `SELECT * FROM tasks WHERE status != 'done' AND due_at BETWEEN ? AND ?
     ORDER BY due_at, priority DESC`,
    [start, end]
  ).map(mapTask);
}

export function completedTasks(): Task[] {
  return all<TaskRow>(
    `SELECT * FROM tasks WHERE status = 'done' ORDER BY completed_at DESC LIMIT 100`
  ).map(mapTask);
}

export function completedTodayCount(): number {
  const start = startOfDay(new Date()).getTime();
  const end = endOfDay(new Date()).getTime();
  return (
    first<{ n: number }>(
      `SELECT COUNT(*) AS n FROM tasks WHERE status = 'done' AND completed_at BETWEEN ? AND ?`,
      [start, end]
    )?.n ?? 0
  );
}

export function createTask(input: Partial<Task> & { title: string }): Task {
  const id = createId('task');
  run(
    `INSERT INTO tasks(id, title, note_id, card_id, due_at, priority, status, recurrence, completed_at, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      input.title.trim(),
      input.noteId ?? null,
      input.cardId ?? null,
      input.dueAt ?? null,
      input.priority ?? 0,
      input.status ?? 'todo',
      input.recurrence ?? 'none',
      null,
      now(),
    ]
  );
  return mapTask(first<TaskRow>('SELECT * FROM tasks WHERE id = ?', [id])!);
}

const RECUR_DAYS: Record<Recurrence, number> = {
  none: 0,
  daily: 1,
  weekly: 7,
  monthly: 30,
};

/** Toggle done. If a recurring task is completed, spawn the next occurrence. */
export function toggleTask(id: ID): void {
  const t = first<TaskRow>('SELECT * FROM tasks WHERE id = ?', [id]);
  if (!t) return;
  const becomingDone = t.status !== 'done';
  run('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?', [
    becomingDone ? 'done' : 'todo',
    becomingDone ? now() : null,
    id,
  ]);
  if (becomingDone && t.recurrence !== 'none' && t.due_at) {
    const nextDue = addDays(t.due_at, RECUR_DAYS[t.recurrence as Recurrence]).getTime();
    createTask({
      title: t.title,
      dueAt: nextDue,
      priority: t.priority as Priority,
      recurrence: t.recurrence as Recurrence,
    });
  }
}

export function updateTask(
  id: ID,
  patch: Partial<Pick<Task, 'title' | 'dueAt' | 'priority' | 'recurrence'>>
): void {
  const t = first<TaskRow>('SELECT * FROM tasks WHERE id = ?', [id]);
  if (!t) return;
  run(
    'UPDATE tasks SET title = ?, due_at = ?, priority = ?, recurrence = ? WHERE id = ?',
    [
      patch.title ?? t.title,
      patch.dueAt !== undefined ? patch.dueAt : t.due_at,
      patch.priority ?? t.priority,
      patch.recurrence ?? t.recurrence,
      id,
    ]
  );
}

export function deleteTask(id: ID): void {
  run('DELETE FROM tasks WHERE id = ?', [id]);
}
