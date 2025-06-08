<template>
  <div class="min-h-screen bg-gray-900 text-white p-6 font-sans">
    <el-container class="max-w-md mx-auto">
      <h1 class="text-3xl font-bold mb-6 text-center">🌽 Corn Kernel Grading System</h1>

      <el-form label-position="top" @submit.prevent="submitForm">
        <el-form-item label="Image">
          <el-upload
            drag
            :auto-upload="false"
            accept="image/*"
            :on-change="handleFile"
            :show-file-list="false"
            class="w-full">
            <div class="el-upload__text">
              Drop file here or <em>click to upload</em>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="Weight (lb/bu)">
          <el-input-number v-model="weight" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="Moisture (%)">
          <el-input-number v-model="moisture" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submitForm">Analyze</el-button>
          <el-button @click="resetForm" type="info">Clear</el-button>
        </el-form-item>
      </el-form>

      <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
      <div v-if="result" class="mt-4" v-html="result"></div>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { uploadImage } from './api'

const file = ref(null)
const weight = ref(56)
const moisture = ref(15.5)
const loading = ref(false)
const result = ref('')
const error = ref('')

const handleFile = ({ raw }) => {
  file.value = raw
}

const resetForm = () => {
  file.value = null
  weight.value = 56
  moisture.value = 15.5
  result.value = ''
  error.value = ''
}

const submitForm = async () => {
  if (!file.value) {
    error.value = 'Please select an image.'
    return
  }
  const formData = new FormData()
  formData.append('image', file.value)
  formData.append('weight', weight.value)
  formData.append('moisture', moisture.value)

  loading.value = true
  error.value = ''
  try {
    result.value = await uploadImage(formData)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
