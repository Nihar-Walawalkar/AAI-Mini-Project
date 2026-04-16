const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function superResolve({ file, enhance, sharpenStrength, deblock }) {
  const form = new FormData()
  form.append('file', file)
  form.append('enhance', String(enhance))
  form.append('sharpen_strength', String(sharpenStrength))
  form.append('deblock', String(deblock))

  const response = await fetch(`${API_BASE}/super-resolve`, {
    method: 'POST',
    body: form,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}
