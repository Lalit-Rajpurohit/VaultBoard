import { addDays, now, startOfDay } from '@/utils/date';

import { first, getDb, tx } from './client';
import * as boards from './queries/boards';
import * as folders from './queries/folders';
import { createNote, setNoteTags, syncLinks } from './queries/notes';
import { createTask } from './queries/tasks';
import { ensureTag } from './queries/tags';

/** True if the DB already has user content (so we don't re-seed every launch). */
function hasContent(): boolean {
  const n = first<{ n: number }>('SELECT COUNT(*) AS n FROM notes');
  return (n?.n ?? 0) > 0;
}

/**
 * Idempotent first-launch seed: realistic notes (with backlinks), a populated
 * Kanban board, tasks, tags and folders so the app feels alive on first open.
 */
export function seedIfEmpty(): void {
  if (hasContent()) return;

  tx(() => {
    // Folders
    const fWork = folders.createFolder('Work');
    const fPersonal = folders.createFolder('Personal');
    const fIdeas = folders.createFolder('Ideas');

    // Tags
    const tProject = ensureTag('project', '#6D7CFF');
    const tReading = ensureTag('reading', '#34D399');
    const tIdea = ensureTag('idea', '#F5A623');
    const tDaily = ensureTag('daily', '#FB7185');

    // Notes — note that bodies reference each other via [[wiki links]].
    const welcome = createNote({
      title: 'Welcome to VaultBoard',
      folderId: fPersonal.id,
      isPinned: true,
      bodyMd: `# Welcome to VaultBoard 👋

Your notes, tasks, and knowledge in one calm vault.

## Try these
- Tap **+** to capture a thought in one tap
- Link notes with [[Product Roadmap]] style wiki links
- Organize work on the [[Sprint Board]] note's companion board
- Everything is stored **offline** on your device

> Tip: pull up Search to find anything instantly.`,
    });

    const roadmap = createNote({
      title: 'Product Roadmap',
      folderId: fWork.id,
      isPinned: true,
      bodyMd: `# Product Roadmap

A living plan for the next quarter. Related: [[Weekly Review]].

## Now
- Offline-first sync model
- Markdown editor polish

## Next
- Graph view for the knowledge vault
- Local reminders

## Later
- Optional encrypted backup`,
    });

    const review = createNote({
      title: 'Weekly Review',
      folderId: fWork.id,
      bodyMd: `# Weekly Review

Reflect every Friday. Pulls from the [[Product Roadmap]] and daily notes.

## Wins
- Shipped the dashboard

## Focus next week
- Close out the [[Reading List]] backlog`,
    });

    const reading = createNote({
      title: 'Reading List',
      folderId: fIdeas.id,
      bodyMd: `# Reading List

Books & articles worth revisiting.

- *Thinking in Systems* — Donella Meadows
- *The Pragmatic Programmer*
- Essays on tools for thought

Connected ideas live in [[Welcome to VaultBoard]].`,
    });

    const daily = createNote({
      title: 'Daily Note',
      folderId: fPersonal.id,
      bodyMd: `# ${new Date().toDateString()}

## Plan
- [ ] Review the [[Product Roadmap]]
- [ ] Tidy the [[Reading List]]

## Notes
Felt focused this morning.`,
    });

    // Tags on notes
    setNoteTags(roadmap.id, [tProject]);
    setNoteTags(review.id, [tProject, tDaily]);
    setNoteTags(reading.id, [tReading, tIdea]);
    setNoteTags(daily.id, [tDaily]);
    setNoteTags(welcome.id, [tIdea]);

    // Rebuild backlinks now that all titles exist.
    [welcome, roadmap, review, reading, daily].forEach((nNote) => {
      const fresh = first<{ id: string; body_md: string }>(
        'SELECT id, body_md FROM notes WHERE id = ?',
        [nNote.id]
      );
      if (fresh) syncLinks(fresh.id, fresh.body_md);
    });

    // Board with realistic cards (createBoard seeds the default To Do / In
    // Progress / Done columns, which the cards below rely on).
    const board = boards.createBoard('Sprint Board');
    boards.toggleBoardPin(board.id);
    const full = boards.getBoard(board.id)!;
    const [todo, doing, done] = full.columns;

    const c1 = boards.addCard(board.id, todo.id, 'Design empty states', {
      description: 'Every list needs an elegant empty state with a soft CTA.',
      priority: 2,
      dueAt: addDays(startOfDay(new Date()), 2).getTime(),
    });
    boards.setCardLabels(c1.id, ['design', 'ui']);
    boards.addChecklistItem(c1.id, 'Notes list');
    boards.addChecklistItem(c1.id, 'Boards list');
    boards.addChecklistItem(c1.id, 'Search');

    boards.addCard(board.id, todo.id, 'Wire local reminders', {
      description: 'Schedule notifications for tasks with due dates.',
      priority: 1,
    });

    const c3 = boards.addCard(board.id, doing.id, 'Markdown editor toolbar', {
      description: 'Bold, headings, lists, checkboxes, links.',
      priority: 3,
      dueAt: addDays(startOfDay(new Date()), 1).getTime(),
    });
    boards.setCardLabels(c3.id, ['editor']);
    boards.addChecklistItem(c3.id, 'Toolbar UI');
    const chk = boards.checklistForCard(c3.id)[0];
    if (chk) boards.toggleChecklistItem(chk.id);

    boards.addCard(board.id, done.id, 'Set up SQLite + FTS', {
      description: 'Schema, migrations, full-text search.',
      priority: 2,
    });
    boards.addCard(board.id, done.id, 'Theme system', {
      description: 'Dark mode, accent colors, typography scale.',
      priority: 1,
    });

    // Tasks
    const today = startOfDay(new Date());
    createTask({ title: 'Review Product Roadmap', dueAt: today.getTime(), priority: 2 });
    createTask({
      title: 'Stand-up notes',
      dueAt: today.getTime(),
      priority: 1,
      recurrence: 'daily',
    });
    createTask({
      title: 'Plan next sprint',
      dueAt: addDays(today, 2).getTime(),
      priority: 3,
    });
    createTask({
      title: 'Update Reading List',
      dueAt: addDays(today, 4).getTime(),
      priority: 1,
      noteId: reading.id,
    });
    const doneTask = createTask({
      title: 'Set up project repo',
      dueAt: addDays(today, -1).getTime(),
      priority: 2,
    });
    getDb().runSync(
      'UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?',
      ['done', now(), doneTask.id]
    );
  });
}
