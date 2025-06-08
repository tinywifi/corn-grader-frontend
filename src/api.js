const API_URL = import.meta.env.VITE_API_URL || 'https://corn-grader.onrender.com'
const USE_CORS_PROXY = import.meta.env.VITE_USE_CORS_PROXY === 'true'

export const uploadImage = async (formData) => {
  const endpoint = `${API_URL}/`
  const url = USE_CORS_PROXY
    ? `https://corsproxy.io/?${encodeURIComponent(endpoint)}`
    : endpoint
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    throw new Error(`Server responded with ${res.status}`)
  }
  return await res.text()
}
