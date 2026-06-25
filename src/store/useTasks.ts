import { create } from 'zustand';

import { tasksQ } from '@/db';
import type { ID, Task } from '@/types';

interface TasksState {
  tasks: Task[];
  refresh: () => void;
  create: (input: Partial<Task> & { title: string }) => Task;
  toggle: (id: ID) => void;
  update: (id: ID, patch: Partial<Pick<Task, 'title' | 'dueAt' | 'priority' | 'recurrence'>>) => void;
  remove: (id: ID) => void;
}

export const useTasks = create<TasksState>((set) => {
  const refresh = () => set({ tasks: tasksQ.listTasks() });
  return {
    tasks: [],
    refresh,
    create: (input) => {
      const t = tasksQ.createTask(input);
      refresh();
      return t;
    },
    toggle: (id) => {
      tasksQ.toggleTask(id);
      refresh();
    },
    update: (id, patch) => {
      tasksQ.updateTask(id, patch);
      refresh();
    },
    remove: (id) => {
      tasksQ.deleteTask(id);
      refresh();
    },
  };
});
