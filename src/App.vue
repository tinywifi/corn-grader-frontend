<template>
  <div class="container">
    <div class="form-card">
      <h2>🌽 Corn Kernel Analyzer</h2>

        <el-upload
        drag
        action=""
        :auto-upload="false"
        :on-change="handleFileChange"
        :show-file-list="false"
        class="upload-area"
        >
        <i class="el-icon-upload"></i>
        <div v-if="!file">Drop file here or click to upload</div>
        <div v-else class="file-name">✅ Selected: {{ file.name }}</div>
        <div class="el-upload__tip">Only image files are supported</div>
        </el-upload>


      <el-input v-model="weight" type="number" placeholder="Weight (lb/bu)" />
      <el-input v-model="moisture" type="number" placeholder="Moisture (%)" />

      <el-button type="primary" @click="submitImage" :loading="loading">Analyze</el-button>

      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="result" class="result">
        <h3>Result</h3>
        <p><strong>Grade:</strong> {{ result.grade }}</p>
        <p><strong>Total Kernels:</strong> {{ result.total_kernels }}</p>
        <p><strong>Total Damage %:</strong> {{ result.total_damage_pct.toFixed(2) }}%</p>
        <p><strong>Heat Damage %:</strong> {{ result.heat_damage_pct.toFixed(2) }}%</p>
        <img :src="backendUrl + '/results/' + result.filename" class="result-image" />
        <pre>{{ JSON.stringify(result.raw_result, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { uploadImage } from './api.js'

const file = ref(null)
const weight = ref(56)
const moisture = ref(15.5)
const result = ref(null)
const loading = ref(false)
const error = ref('')
const backendUrl = 'https://corn-grader.onrender.com'

function handleFileChange(upload) {
  file.value = upload.raw
}

async function submitImage() {
  if (!file.value) {
    error.value = "Please select a file."
    return
  }

  error.value = ""
  loading.value = true

  const formData = new FormData()
  formData.append('image', file.value)
  formData.append('weight', weight.value)
  formData.append('moisture', moisture.value)

  try {
    const html = await uploadImage(formData)
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const extracted = {
      grade: doc.querySelector('strong:contains("Grade")')?.nextSibling?.textContent.trim() ?? 'Unknown',
      total_kernels: Number(doc.querySelector('strong:contains("Total Kernels")')?.nextSibling?.textContent.trim() ?? 0),
      total_damage_pct: parseFloat(doc.querySelector('strong:contains("Total damage %")')?.nextSibling?.textContent) ?? 0,
      heat_damage_pct: parseFloat(doc.querySelector('strong:contains("Heat damage %")')?.nextSibling?.textContent) ?? 0,
      filename: doc.querySelector('img')?.src?.split('/').pop(),
      raw_result: JSON.parse(doc.querySelector('pre')?.textContent ?? "{}")
    }

    result.value = extracted
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style>
body {
  margin: 0;
  background-color: #f4f4f4;
  font-family: 'Segoe UI', sans-serif;
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.form-card {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-area {
  border: 2px dashed #409EFF;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}

.result-image {
  width: 100%;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
