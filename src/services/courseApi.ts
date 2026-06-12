import { API_BASE_URL } from "@/lib/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "API request failed");
  }
  return data.data;
}

export const adminCourseApi = {
  list: async (status = "") => {
    const url = status
      ? `${API_BASE_URL}/courses?status=${status}`
      : `${API_BASE_URL}/courses`;
    const res = await fetch(url, { headers: authHeaders() });
    return handleResponse(res);
  },

  getById: async (courseId: string) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  create: async (payload: object) => {
    const res = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  update: async (courseId: string, payload: object) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  assign: async (payload: object) => {
    const res = await fetch(`${API_BASE_URL}/courses/assign`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
};

export const staffCourseApi = {
  list: async (status = "") => {
    const url = status
      ? `${API_BASE_URL}/staff/courses?status=${status}`
      : `${API_BASE_URL}/staff/courses`;
    const res = await fetch(url, { headers: authHeaders() });
    return handleResponse(res);
  },

  start: async (progressId: string) => {
    const res = await fetch(`${API_BASE_URL}/staff/courses/${progressId}/start`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  submit: async (
    progressId: string,
    answers: { questionId: string; answer: string }[]
  ) => {
    const res = await fetch(`${API_BASE_URL}/staff/courses/${progressId}/submit`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ answers }),
    });
    return handleResponse(res);
  },
};

export const managerCourseApi = {
  list: async (status = "") => {
    const url = status
      ? `${API_BASE_URL}/manager/courses?status=${status}`
      : `${API_BASE_URL}/manager/courses`;
    const res = await fetch(url, { headers: authHeaders() });
    return handleResponse(res);
  },
};
