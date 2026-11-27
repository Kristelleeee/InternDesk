'use strict';

const $ = id => document.getElementById(id);
const form = $('record-form');
const dialog = $('editor');
const fields = form.elements;
const storageKey = 'interndesk.planner.v1';
let state = { tasks: [], events: [] };
let storageReadable = true;

try {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.events)) {
      throw new Error('Invalid planner data');
    }
    state = parsed;
  }
} catch {
  storageReadable = false;
  $('status').textContent = 'Saved planner data could not be loaded. Changes are disabled to protect your data.';
}

function save(collection, record) {
  if (!storageReadable) return false;
  const existing = state[collection].some(item => item.id === record.id);
  const records = existing
    ? state[collection].map(item => item.id === record.id ? record : item)
    : [...state[collection], record];
  const nextState = { ...state, [collection]: records };
  try {
    localStorage.setItem(storageKey, JSON.stringify(nextState));
  } catch {
    $('status').textContent = 'Your browser could not save the change. Check that local storage is available.';
    return false;
  }
  state = nextState;
  $('status').textContent = '';
  return true;
}

const today = new Date();
const longDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' });
const shortDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const monthFormat = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
let selected = today;
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let editing;

function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

function element(tag, label, className) {
  const node = document.createElement(tag);
  if (label) node.textContent = label;
  if (className) node.className = className;
  return node;
}

function button(label, action, className) {
  const node = element('button', label, className);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

function parseLink(value) {
  const text = value.trim();
  if (!text) return '';
  try {
    const address = /^(https?:\/\/)/i.test(text) ? text : 'https://' + text;
    const url = new URL(address);
    if (!url.hostname.includes('.') || url.username || url.password || /\s/.test(text)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function recordLink(record) {
  const href = parseLink(record.link ?? '');
  if (!href) return null;
  const link = element('a', new URL(href).hostname, 'record-link');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', 'Open resource for ' + record.title + ' (new tab)');
  return link;
}

const priorityLabels = new Map([
  ['urgent', 'Urgent'],
  ['normal', 'Normal'],
  ['low', 'Low'],
]);

function taskPriority(task) {
  return priorityLabels.has(task?.priority) ? task.priority : 'normal';
}

function priorityBadge(task) {
  const priority = taskPriority(task);
  return element('span', priorityLabels.get(priority), 'priority priority-' + priority);
}

function openEditor(kind, record, parentId = '') {
  editing = { kind, record, parentId };
  const isEvent = kind === 'event';
  const typeLabel = isEvent ? 'event' : parentId ? 'subtask' : 'task';
  form.reset();
  $('form-error').textContent = '';
  $('editor-title').textContent = (record ? 'Edit ' : 'New ') + typeLabel;
  $('event-fields').hidden = !isEvent;
  $('task-fields').hidden = isEvent;
  fields.date.required = isEvent;
  $('date-label').firstChild.textContent = isEvent ? 'Date ' : 'Due date ';
  fields.title.value = record?.title ?? '';
  fields.link.value = record?.link ?? '';
  fields.date.value = record?.date ?? (isEvent ? dateKey(selected) : '');
  fields.type.value = record?.type ?? 'Check-in';
  fields.time.value = record?.time ?? '';
  fields.details.value = record?.details ?? '';
  fields.priority.value = taskPriority(record);
  fields.blocked.checked = record?.blocked ?? false;
  fields.blocker.value = record?.blocker ?? '';
  dialog.showModal();
  fields.title.focus();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const title = fields.title.value.trim();
  if (!title) {
    $('form-error').textContent = 'Enter a title.';
    fields.title.focus();
    return;
  }
  const link = parseLink(fields.link.value);
  if (link === null) {
    $('form-error').textContent = 'Enter a website link, such as https://docs.google.com/…';
    fields.link.focus();
    return;
  }
  const { kind, record, parentId } = editing;
  const base = { id: record?.id ?? crypto.randomUUID(), title, date: fields.date.value, link };
  const isEvent = kind === 'event';
  const saved = isEvent
    ? { ...base, type: fields.type.value, time: fields.time.value, details: fields.details.value.trim() }
    : { ...base, parentId, priority: fields.priority.value, done: record?.done ?? false, blocked: fields.blocked.checked, blocker: fields.blocker.value.trim() };
  if (!save(isEvent ? 'events' : 'tasks', saved)) {
    $('form-error').textContent = 'The change could not be saved.';
    return;
  }
  if (isEvent) {
    selected = new Date(saved.date + 'T12:00:00');
    visibleMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
  }
  dialog.close();
  render();
  const recordButton = [...document.querySelectorAll('button[data-record]')].find(node => node.dataset.record === saved.id);
  (recordButton ?? $(isEvent ? 'new-event' : 'new-task')).focus();
});

function changeTask(task, checkbox) {
  if (!save('tasks', { ...task, done: checkbox.checked })) {
    checkbox.checked = task.done;
    return;
  }
  render();
  const updated = document.getElementById(checkbox.id);
  (updated ?? $('filter')).focus();
}

function editButton(label, record, kind, showFromTaskList = false) {
  const edit = button(label, () => openEditor(kind, record, record.parentId));
  edit.setAttribute('aria-label', 'Edit ' + record.title);
  if (showFromTaskList) edit.dataset.record = record.id;
  return edit;
}

function taskRow(task, children) {
  const row = element('li', '', 'record');
  const head = element('div', '', 'record-head');
  const label = element('label', '', 'inline');
  const checkbox = element('input');
  checkbox.id = 'task-' + task.id;
  checkbox.type = 'checkbox';
  checkbox.checked = task.done;
  checkbox.addEventListener('change', () => changeTask(task, checkbox));
  label.append(checkbox, element('span', task.title, task.done ? 'done' : ''));
  head.append(label, priorityBadge(task), editButton('Edit', task, 'task', true));
  row.append(head);
  const link = recordLink(task);
  if (link) row.append(link);
  if (task.date) row.append(element('p', 'Due ' + shortDate.format(new Date(task.date + 'T12:00:00')), 'metadata'));
  if (!task.done && task.blocked) {
    row.append(element('p', task.blocker ? 'Waiting for: ' + task.blocker : 'Waiting on something', 'metadata blocker'));
  }
  if (children) {
    const list = element('ul', '', 'subtasks');
    for (const child of children) list.append(taskRow(child));
    row.append(list, button('+ Add subtask', () => openEditor('task', null, task.id), 'add-subtask'));
  }
  return row;
}

const filters = {
  all: () => true,
  open: task => !task.done,
  blocked: task => !task.done && task.blocked,
  done: task => task.done,
};

function renderTasks() {
  const tasks = $('tasks');
  const matchesStatus = filters[$('filter').value];
  const priority = $('priority-filter').value;
  const matches = task => matchesStatus(task) && (priority === 'all' || taskPriority(task) === priority);
  tasks.replaceChildren();
  for (const task of state.tasks.filter(task => !task.parentId)) {
    const children = state.tasks.filter(child => child.parentId === task.id);
    const matchingChildren = children.filter(matches);
    if (matches(task) || matchingChildren.length) tasks.append(taskRow(task, matchingChildren));
  }
  if (!tasks.children.length) {
    tasks.append(element('li', state.tasks.length ? 'No tasks match this filter.' : 'No tasks yet. Add a task to start your plan.', 'empty'));
  }
  for (const key of ['open', 'blocked', 'done']) {
    $(key + '-count').textContent = state.tasks.filter(filters[key]).length;
  }
}

function renderCalendar() {
  const calendar = $('calendar');
  calendar.replaceChildren();
  const entriesByDate = new Map();
  for (const task of state.tasks.filter(task => task.date)) {
    const entries = entriesByDate.get(task.date) ?? [];
    entries.push({ kind: 'task', record: task, detail: task.done ? 'Completed deadline' : 'Task deadline' });
    entriesByDate.set(task.date, entries);
  }
  const sortedEvents = [...state.events].sort((a, b) => a.time.localeCompare(b.time));
  for (const event of sortedEvents) {
    const entries = entriesByDate.get(event.date) ?? [];
    entries.push({ kind: 'event', record: event, detail: [event.type, event.time, event.details].filter(Boolean).join(' · ') });
    entriesByDate.set(event.date, entries);
  }

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const selectedKey = dateKey(selected);
  $('month').textContent = monthFormat.format(visibleMonth);
  for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
    calendar.append(element('span', day, 'weekday'));
  }
  for (let blank = 0; blank < (visibleMonth.getDay() + 6) % 7; blank++) {
    calendar.append(element('span'));
  }
  for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
    const date = new Date(year, month, day);
    const key = dateKey(date);
    const count = entriesByDate.get(key)?.length ?? 0;
    const dayButton = button(String(day), () => {
      selected = date;
      renderCalendar();
      document.getElementById('day-' + key).focus();
    }, count ? 'marked' : '');
    dayButton.id = 'day-' + key;
    dayButton.setAttribute('aria-label', longDate.format(date) + (count ? ', entries: ' + count : ''));
    dayButton.setAttribute('aria-pressed', String(key === selectedKey));
    if (key === dateKey(today)) dayButton.setAttribute('aria-current', 'date');
    calendar.append(dayButton);
  }

  $('agenda-date').textContent = longDate.format(selected);
  const agenda = $('agenda');
  agenda.replaceChildren();
  for (const { kind, record, detail } of entriesByDate.get(selectedKey) ?? []) {
    const row = element('li', '', 'record');
    const head = element('div', '', 'record-head');
    head.append(element('strong', record.title));
    if (kind === 'task') head.append(priorityBadge(record));
    const edit = editButton('Details', record, kind);
    edit.dataset.record = record.id;
    head.append(edit);
    row.append(head, element('p', detail, 'metadata'));
    const link = recordLink(record);
    if (link) row.append(link);
    agenda.append(row);
  }
  if (!agenda.children.length) agenda.append(element('li', 'No deadlines or events on this day.', 'empty'));
}

function shiftMonth(amount) {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1);
  selected = dateKey(today).slice(0, 7) === dateKey(visibleMonth).slice(0, 7) ? today : visibleMonth;
  renderCalendar();
}

function render() {
  renderTasks();
  renderCalendar();
}

$('new-task').addEventListener('click', () => openEditor('task'));
$('new-event').addEventListener('click', () => openEditor('event'));
$('cancel').addEventListener('click', () => dialog.close());
$('filter').addEventListener('change', renderTasks);
$('priority-filter').addEventListener('change', renderTasks);
$('prev').addEventListener('click', () => shiftMonth(-1));
$('next').addEventListener('click', () => shiftMonth(1));
render();
