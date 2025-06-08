const API_URL = import.meta.env.VITE_API_URL || 'https://corn-grader.onrender.com'

export async function uploadImage(formData) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: formData,
  })
  if (!res.ok) {
    throw new Error(`Server responded with ${res.status}`)
  }
  return response.text();
}
