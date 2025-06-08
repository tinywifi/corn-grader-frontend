export const uploadImage = async (formData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/`, {
    method: "POST",
    body: formData
  });
  return await res.text();
};