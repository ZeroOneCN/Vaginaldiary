const API_BASE = 'http://localhost:9509/api';

export async function fetchRecords(date) {
  const res = await fetch(`${API_BASE}/records/${date}`);
  if (!res.ok) throw new Error('获取记录失败');
  return await res.json();
}

export async function addRecord(data) {
  const res = await fetch(`${API_BASE}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('添加记录失败');
  return await res.json();
}

export async function deleteRecord(id) {
  const res = await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('删除失败');
  return await res.json();
}

export async function fetchStatsRange(startDate, endDate) {
  const res = await fetch(`${API_BASE}/stats/range?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error('获取统计失败');
  return await res.json();
}

export async function fetchExportData(startDate, endDate) {
  const res = await fetch(`${API_BASE}/export?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error('获取导出数据失败');
  return await res.json();
}

export async function fetchAllDates() {
  const res = await fetch(`${API_BASE}/dates`);
  if (!res.ok) throw new Error('获取日期列表失败');
  return await res.json();
}
