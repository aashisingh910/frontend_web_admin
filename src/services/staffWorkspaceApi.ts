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

export const staffWorkspaceApi = {
  dashboard: async () => {
    const res = await fetch(`${API_BASE_URL}/staff/dashboard`, { headers: authHeaders() });
    return handleResponse(res);
  },

  profile: async () => {
    const res = await fetch(`${API_BASE_URL}/staff/profile`, { headers: authHeaders() });
    return handleResponse(res);
  },

  courses: async (status = "") => {
    const url = status
      ? `${API_BASE_URL}/staff/courses?status=${status}`
      : `${API_BASE_URL}/staff/courses`;
    const res = await fetch(url, { headers: authHeaders() });
    return handleResponse(res);
  },

  startCourse: async (progressId: string) => {
    const res = await fetch(`${API_BASE_URL}/staff/courses/${progressId}/start`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  submitCourse: async (
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

  targets: async (month = "2026-07") => {
    const res = await fetch(`${API_BASE_URL}/staff/targets?month=${month}`, { headers: authHeaders() });
    return handleResponse(res);
  },

  attendance: async (month = "2026-07") => {
    const res = await fetch(`${API_BASE_URL}/staff/attendance?month=${month}`, { headers: authHeaders() });
    return handleResponse(res);
  },

  notices: async () => {
    const res = await fetch(`${API_BASE_URL}/staff/notices`, { headers: authHeaders() });
    return handleResponse(res);
  },

  incentives: async (month = "2026-07") => {
    const res = await fetch(`${API_BASE_URL}/staff/incentives?month=${month}`, { headers: authHeaders() });
    return handleResponse(res);
  },
};
