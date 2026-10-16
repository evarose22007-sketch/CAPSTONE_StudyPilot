/**
 * Every request to the StudyPilot API goes through this module.
 * Base URL comes from VITE_API_URL (see .env.example).
 */
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'studypilot.token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable (private mode) — session lasts until refresh */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

/** Error with the API's message and per-field details, e.g. err.details.title */
export class ApiError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Called when the API says our session is no longer valid (set by AuthContext).
let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(path, { method = 'GET', body, query } = {}) {
  const url = new URL(BASE_URL + path);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, "Can't reach StudyPilot. Check your connection and try again.");
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, data.error?.message || 'Something went wrong. Please try again.', data.error?.details);
  }
  return data;
}

export const api = {
  // Accounts
  register: (input) => request('/auth/register', { method: 'POST', body: input }),
  login: (input) => request('/auth/login', { method: 'POST', body: input }),
  me: () => request('/auth/me'),

  // Courses
  listCourses: () => request('/courses'),
  createCourse: (input) => request('/courses', { method: 'POST', body: input }),
  updateCourse: (id, input) => request(`/courses/${id}`, { method: 'PATCH', body: input }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: 'DELETE' }),

  // Tasks
  listTasks: (filters) => request('/tasks', { query: filters }),
  // Send the student's local date so "overdue" matches what they see.
  getSummary: () => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return request('/tasks/summary', { query: { today } });
  },
  createTask: (input) => request('/tasks', { method: 'POST', body: input }),
  updateTask: (id, input) => request(`/tasks/${id}`, { method: 'PATCH', body: input }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
