// Shared in-memory tasks store used by both server rendering and API routes
// This avoids duplicate state and ID collisions.

let tasks = [];
let nextTaskId = 1;

function computeNextId() {
  nextTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
}

function seedIfEmpty(seedTasks = []) {
  if (tasks.length === 0 && Array.isArray(seedTasks) && seedTasks.length > 0) {
    tasks = seedTasks.map((t, idx) => ({
      id: t.id ?? (idx + 1),
      title: t.title,
      duration: t.duration,
      time: t.time,
      status: t.status || 'backlog',
      createdAt: new Date().toISOString(),
    }));
    computeNextId();
  }
}

function getAll() {
  return tasks.slice();
}

function getById(id) {
  return tasks.find(t => t.id === id) || null;
}

function addTask({ title, duration = '30 mins', time = '12:00 PM', status = 'backlog' }) {
  const newTask = {
    id: nextTaskId++,
    title,
    duration,
    time,
    status,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  return newTask;
}

function updateTask(id, fields = {}) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;
  const curr = tasks[idx];
  // Only update provided fields
  const updated = {
    ...curr,
    ...(fields.title !== undefined ? { title: fields.title } : {}),
    ...(fields.duration !== undefined ? { duration: fields.duration } : {}),
    ...(fields.time !== undefined ? { time: fields.time } : {}),
    ...(fields.status !== undefined ? { status: fields.status } : {}),
    updatedAt: new Date().toISOString(),
  };
  tasks[idx] = updated;
  return updated;
}

function deleteTask(id) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;
  const [deleted] = tasks.splice(idx, 1);
  return deleted;
}

module.exports = {
  seedIfEmpty,
  getAll,
  getById,
  addTask,
  updateTask,
  deleteTask,
};
