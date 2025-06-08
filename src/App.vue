<template>
  <div class="container">
    <div class="usda-float">
      <h3>📊 ระดับเกรดของข้าวโพดเมล็ดแห้งตาม USDA</h3>
      <table>
        <thead>
          <tr>
            <th>เกรด</th>
            <th>น้ำหนัก (lb/bu)</th>
            <th>ความชื้น (%)</th>
            <th>เมล็ดเสียหายรวม (%)</th>
            <th>เสียหายจากความร้อน (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>U.S. No. 1</td><td>56.0</td><td>15.5</td><td>≤3.0</td><td>≤0.1</td></tr>
          <tr><td>U.S. No. 2</td><td>54.0</td><td>15.5</td><td>≤5.0</td><td>≤0.2</td></tr>
          <tr><td>U.S. No. 3</td><td>52.0</td><td>15.5</td><td>≤7.0</td><td>≤0.5</td></tr>
          <tr><td>U.S. No. 4</td><td>49.0</td><td>15.5</td><td>≤10.0</td><td>≤1.0</td></tr>
          <tr><td>U.S. No. 5</td><td>46.0</td><td>15.5</td><td>≤15.0</td><td>≤3.0</td></tr>
          <tr><td>Sample Grade</td><td>-</td><td>-</td><td>>15.0</td><td>>3.0</td></tr>
        </tbody>
      </table>
    </div>

    <div class="form-card" v-if="!result">
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

      <label for="weight"><strong>Weight (lb/bu):</strong></label>
      <el-input id="weight" v-model="weight" type="number" placeholder="e.g., 56" />

      <label for="moisture"><strong>Moisture (%):</strong></label>
      <el-input id="moisture" v-model="moisture" type="number" placeholder="e.g., 15.5" />

      <el-button type="primary" @click="submitImage" :loading="loading">Analyze</el-button>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <div v-if="result" ref="resultSection" class="result-card">
      <h3>Result</h3>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="📘 Summary" name="summary">
          <p><strong>Grade:</strong> {{ result.grade }}</p>
          <p><strong>Total Kernels:</strong> {{ result.total_kernels }}</p>
          <p><strong>Total Damage %:</strong> {{ result.total_damage_pct.toFixed(2) }}%</p>
          <p><strong>Heat Damage %:</strong> {{ result.heat_damage_pct.toFixed(2) }}%</p>
          <div>
            <strong>Kernel Class Breakdown</strong>
            <ul v-if="result.class_counts && Object.keys(result.class_counts).length">
            <li v-for="(count, label) in result.class_counts" :key="label">
                <strong>{{ label }}:</strong> {{ count }}
            </li>
            </ul>
            <p v-else style="opacity: 0.7;">(No kernel class data available)</p>
        </div>
          <img :src="backendUrl + '/results/' + result.filename" class="result-image" />
        </el-tab-pane>

        <el-tab-pane label="📄 JSON Raw Output" name="json">
          <pre class="json-box">{{ JSON.stringify(result.raw_result, null, 2) }}</pre>
        </el-tab-pane>
      </el-tabs>

      <el-button @click="resetForm" type="info" icon="el-icon-back">Go Back</el-button>
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
const activeTab = ref('summary')
const backendUrl = 'https://corn-grader.onrender.com'

function handleFileChange(upload) {
  file.value = upload.raw
}

function resetForm() {
  file.value = null
  result.value = null
  error.value = ''
  weight.value = 56
  moisture.value = 15.5
  activeTab.value = 'summary'
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
      raw_result: JSON.parse(doc.querySelector('pre')?.textContent ?? "{}"),
      class_counts: (() => {
        try {
          const text = doc.querySelector('pre')?.textContent ?? '{}'
          const raw = JSON.parse(text)
          return raw.class_counts ?? {}
        } catch {
          return {}
        }
      })(),
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
body {
  font-family: 'Inter', sans-serif;
}

body {
  margin: 0;
  background-color: #121212;
  color: white;
  font-family: 'Segoe UI', sans-serif;
}

.container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  gap: 2rem;
}

.form-card, .result-card {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  background: #1c1c1c;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0,0,0,0.5);
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
.upload-area:hover {
  background: #283c5a;
}
.file-name {
  font-weight: bold;
  color: #00e676;
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
}

.usda-float {
  background: #1f1f1f;
  color: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(0,0,0,0.3);
  max-width: 350px;
  font-size: 14px;
}
.usda-float table {
  width: 100%;
  border-collapse: collapse;
}
.usda-float th,
.usda-float td {
  padding: 0.3rem;
  border: 1px solid #444;
  text-align: center;
}
.usda-float th {
  background-color: #333;
}
</style>
