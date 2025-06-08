<template>
  <div class="min-h-screen bg-gray-900 text-white p-6 font-sans">
    <h1 class="text-3xl font-bold mb-4">🌽 Corn Kernel Grading System</h1>

    <form @submit.prevent="submitForm" class="space-y-4">
      <input type="file" @change="handleFile" required class="block" />
      <input type="number" step="0.1" v-model="weight" placeholder="Weight (lb/bu)" required class="block text-black px-2" />
      <input type="number" step="0.1" v-model="moisture" placeholder="Moisture (%)" required class="block text-black px-2" />
      <button class="bg-green-600 hover:bg-green-800 px-4 py-2 rounded">Analyze</button>
    </form>

    <div v-html="result" class="mt-8" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { uploadImage } from './api'

const file = ref(null)
const weight = ref(56)
const moisture = ref(15.5)
const result = ref("")

const handleFile = e => {
  file.value = e.target.files[0]
}

const submitForm = async () => {
  const formData = new FormData()
  formData.append("image", file.value)
  formData.append("weight", weight.value)
  formData.append("moisture", moisture.value)
  result.value = await uploadImage(formData)
}
</script>