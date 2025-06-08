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
        <div v-if="!file">📂 Drop file here or click to upload</div>
        <div v-else class="file-name">✅ Selected: {{ file.name }}</div>
        <div class="el-upload__tip">Only image files are supported</div>
      </el-upload>

      <el-input v-model="weight" type="number" placeholder="Weight (lb/bu)" />
      <el-input v-model="moisture" type="number" placeholder="Moisture (%)" />

      <el-button type="primary" @click="submitImage" :loading="loading">Analyze</el-button>

      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="result" ref="resultSection" class="result">
        <h3>Result</h3>
        <p><strong>Grade:</strong> {{ result.grade }}</p>
        <p><strong>Total Kernels:</strong> {{ result.total_kernels }}</p>
        <p><strong>Total Damage %:</strong> {{ result.total_damage_pct.toFixed(2) }}%</p>
        <p><strong>Heat Damage %:</strong> {{ result.heat_damage_pct.toFixed(2) }}%</p>
        <img :src="backendUrl + '/results/' + result.filename" class="result-image" />
        <pre class="json-box">{{ JSON.stringify(result.raw_result, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { uploadImage } from './api.js'

const file = ref(null)
const weight = ref(56)
const moisture = ref(15.5)
const result = ref(null)
const loading = ref(false)
const error = ref('')
const resultSection = ref(null)
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

    const getValueAfterLabel = (label) => {
      const nodes = [...doc.querySelectorAll('strong')]
      const target = nodes.find(n => n.textContent.trim().toLowerCase().includes(label.toLowerCase()))
      return target ? target.nextSibling?.textContent?.trim() : ''
    }

    const extracted = {
      grade: getValueAfterLabel("Grade") || 'Unknown',
      total_kernels: Number(getValueAfterLabel("Total Kernels") || 0),
      total_damage_pct: parseFloat(getValueAfterLabel("Total damage %") || 0),
      heat_damage_pct: parseFloat(getValueAfterLabel("Heat damage %") || 0),
      filename: doc.querySelector('img')?.src?.split('/').pop(),
      raw_result: JSON.parse(doc.querySelector('pre')?.textContent ?? "{}")
    }

    result.value = extracted
    await nextTick()
    resultSection.value?.scrollIntoView({ behavior: 'smooth' })
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
  padding: 20px;
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
  animation: fadeIn 0.4s ease;
}

.upload-area {
  border: 2px dashed #409EFF;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s;
}
.upload-area:hover {
  background: #f0f8ff;
}

.file-name {
  font-weight: bold;
  color: green;
}

.result-image {
  width: 100%;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.json-box {
  margin-top: 10px;
  background: #1e1e1e;
  color: #c5f3ff;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.85rem;
  border-radius: 6px;
  overflow-x: auto;
}

.error {
  color: red;
  margin-top: 10px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
