<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="32" height="32">
            <path d="M12 2C13.5 2 15 3.5 15 5.5C15 6.5 14.5 7.5 14 8.5C14.5 8.5 15 8.5 15.5 8.5C17.5 8.5 19 10 19 12V13H20C21.1 13 22 13.9 22 15V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V15C2 13.9 2.9 13 4 13H5V12C5 10 6.5 8.5 8.5 8.5C9 8.5 9.5 8.5 10 8.5C9.5 7.5 9 6.5 9 5.5C9 3.5 10.5 2 12 2ZM12 4C11.5 4 11 4.5 11 5.5C11 6.5 11.5 7 12 7C12.5 7 13 6.5 13 5.5C13 4.5 12.5 4 12 4ZM8.5 10.5C7.5 10.5 7 11 7 12V13H17V12C17 11 16.5 10.5 15.5 10.5C14.5 10.5 14 11 14 12V13H10V12C10 11 9.5 10.5 8.5 10.5Z"/>
          </svg>
        </div>
        <div class="title-group">
          <h1>排尿日记</h1>
          <p class="subtitle">专业版 - 您的健康记录助手</p>
        </div>
      </div>
    </header>

    <main class="main">
      <!-- 日期选择 -->
      <div class="date-picker">
        <button @click="prevDay" class="nav-btn" title="前一天">◀</button>
        <input 
          type="date" 
          v-model="currentDate" 
          :max="today"
          class="date-input"
        >
        <button @click="nextDay" class="nav-btn" title="后一天">▶</button>
      </div>

      <!-- 统计面板 -->
      <StatsPanel :stats="dailyStats" />

      <!-- 记录表单 -->
      <RecordForm 
        :urgency-labels="URGENCY_LABELS"
        :pain-labels="PAIN_LABELS"
        :drink-types="DRINK_TYPES"
        @submit="addRecord"
      />

      <!-- 记录列表 -->
      <RecordList 
        :records="records"
        :urgency-labels="URGENCY_LABELS"
        :pain-labels="PAIN_LABELS"
        @delete-record="deleteRecord"
      />

      <!-- 图表面板 -->
      <ChartsPanel 
        v-if="showCharts"
        :stats-data="rangeStats"
      />

      <!-- 导出面板 -->
      <ExportPanel />
    </main>

    <footer class="footer">
      <button @click="toggleCharts" class="toggle-btn">
        {{ showCharts ? '隐藏' : '显示' }} 图表
      </button>
      <p>💡 建议连续记录至少 3 天，以便医生更好地诊断</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  fetchRecords,
  addRecord as apiAddRecord,
  deleteRecord as apiDeleteRecord,
  fetchStatsRange
} from './api'
import { showToast, showConfirm } from './utils/toast'
import StatsPanel from './components/StatsPanel.vue'
import RecordForm from './components/RecordForm.vue'
import RecordList from './components/RecordList.vue'
import ChartsPanel from './components/ChartsPanel.vue'
import ExportPanel from './components/ExportPanel.vue'

const URGENCY_LABELS = ['无', '轻微', '中等', '强烈']
const PAIN_LABELS = ['无', '轻微', '中等', '严重']
const DRINK_TYPES = ['白开水', '茶', '咖啡', '果汁', '碳酸饮料', '牛奶', '柠檬水', '其他']

const currentDate = ref(new Date().toISOString().split('T')[0])
const today = new Date().toISOString().split('T')[0]
const showCharts = ref(false)

const records = ref([])
const rangeStats = ref([])

// 加载当日数据
async function loadDayData(date) {
  try {
    records.value = await fetchRecords(date)
  } catch (err) {
    console.error('加载数据失败:', err)
  }
}

// 加载统计数据（最近 30 天）
async function loadRangeStats() {
  try {
    const endDate = today
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    rangeStats.value = await fetchStatsRange(startDate, endDate)
  } catch (err) {
    console.error('加载统计失败:', err)
  }
}

// 监听日期变化
watch(currentDate, (newDate) => {
  loadDayData(newDate)
})

onMounted(() => {
  loadDayData(currentDate.value)
  loadRangeStats()
})

// 计算当日统计
const dailyStats = computed(() => {
  if (records.value.length === 0) return null
  
  const totalDrink = records.value.reduce((sum, r) => sum + (r.drink_volume || 0), 0)
  const totalUrine = records.value.reduce((sum, r) => sum + (r.urine_volume || 0), 0)
  const avgUrgency = records.value.length > 0 
    ? (records.value.reduce((sum, r) => sum + (r.urgency || 0), 0) / records.value.length).toFixed(1)
    : 0
  const avgPain = records.value.length > 0 
    ? (records.value.reduce((sum, r) => sum + (r.pain || 0), 0) / records.value.length).toFixed(1)
    : 0
  const nightCount = records.value.filter(r => r.is_night).length

  return {
    recordCount: records.value.length,
    totalDrink: totalDrink.toFixed(0),
    totalUrine: totalUrine.toFixed(0),
    avgUrgency,
    avgPain,
    nightCount
  }
})

async function addRecord(data) {
  try {
    await apiAddRecord({
      ...data,
      date: currentDate.value
    })
    await loadDayData(currentDate.value)
    await loadRangeStats()
  } catch (err) {
    showToast('添加失败：' + err.message, 'error')
    return
  }
  showToast('记录已添加', 'success')
}

async function deleteRecord(id) {
  if (!await showConfirm('确定删除这条记录吗？')) return
  try {
    await apiDeleteRecord(id)
    await loadDayData(currentDate.value)
    await loadRangeStats()
    showToast('记录已删除', 'info')
  } catch (err) {
    showToast('删除失败：' + err.message, 'error')
  }
}

function prevDay() {
  const date = new Date(currentDate.value)
  date.setDate(date.getDate() - 1)
  currentDate.value = date.toISOString().split('T')[0]
}

function nextDay() {
  const date = new Date(currentDate.value)
  const todayDate = new Date(today)
  if (date < todayDate) {
    date.setDate(date.getDate() + 1)
    currentDate.value = date.toISOString().split('T')[0]
  }
}

function toggleCharts() {
  showCharts.value = !showCharts.value
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: #2c3e50;
  padding: 24px 20px;
}

.header-content {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
}

.title-group {
  flex: 1;
}

.header h1 {
  margin: 0;
  color: #fff;
  font-size: 26px;
  font-weight: 600;
}

.subtitle {
  margin: 6px 0 0;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
}

.main {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
}

@media (max-width: 768px) {
  .main {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .main {
    padding: 8px;
  }
}

.date-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .date-picker {
    padding: 12px;
    gap: 8px;
  }
}

.nav-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #f0f2f5;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #4a90d9;
  color: #fff;
}

.date-input {
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  background: #fff;
  transition: border-color 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: #4a90d9;
}

.footer {
  background: #fff;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

@media (max-width: 768px) {
  .footer {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 12px;
  }
}

.footer p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.toggle-btn {
  padding: 10px 24px;
  background: #6f42c1;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 12px;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #5a32a3;
}
</style>
