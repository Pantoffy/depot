/**
 * Helper to download an Excel file from a backend API endpoint.
 * Attaches the current access token from localStorage.
 */
export async function downloadExcelFromApi(
  apiPath: string,
  filename: string
): Promise<void> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(apiPath, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Không thể xuất Excel: ${text}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
