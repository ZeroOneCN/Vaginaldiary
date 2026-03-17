<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>📈 趋势图表</h3>
      <span class="chart-subtitle">最近 30 天数据概览</span>
    </div>
    <div class="charts-grid">
      <div class="chart-item">
        <div class="chart-title">
          <span class="title-icon">📝</span>
          <span>记录次数</span>
        </div>
        <Line :data="recordCountChartData" :options="chartOptions" />
      </div>
      <div class="chart-item">
        <div class="chart-title">
          <span class="title-icon">💧</span>
          <span>饮水量 vs 排尿量</span>
        </div>
        <Bar :data="volumeChartData" :options="barChartOptions" />
      </div>
      <div class="chart-item">
        <div class="chart-title">
          <span class="title-icon">⚡</span>
          <span>平均尿急感</span>
        </div>
        <Line :data="urgencyChartData" :options="chartOptions" />
      </div>
      <div class="chart-item">
        <div class="chart-title">
          <span class="title-icon">🔴</span>
          <span>平均疼痛</span>
        </div>
        <Line :data="painChartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  statsData: { type: Array, required: true }
})

const commonFont = { family: "'Microsoft YaHei', sans-serif", size: 12 }

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(44, 62, 80, 0.95)',
      padding: 12,
      titleFont: { ...commonFont, size: 13, weight: 'bold' },
      bodyFont: { ...commonFont, size: 12 },
      cornerRadius: 8,
      displayColors: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: { ...commonFont, size: 11 },
        color: '#666'
      }
    },
    y: {
      beginAtZero: true,
      max: 3,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        font: { ...commonFont, size: 11 },
        color: '#666',
        precision: 0
      }
    }
  }
}

const barChartOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        font: commonFont,
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 15
      }
    }
  },
  scales: {
    ...chartOptions.scales,
    y: {
      ...chartOptions.scales.y,
      max: undefined,
      beginAtZero: true
    }
  }
}

const labels = computed(() => props.statsData.map(s => s.date.slice(5)))

const recordCountChartData = computed(() => ({
  labels: labels.value,
  datasets: [{
    label: '记录次数',
    data: props.statsData.map(s => s.record_count),
    borderColor: '#4a90d9',
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
    fill: true,
    tension: 0.4,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: '#fff',
    pointBorderColor: '#4a90d9',
    pointBorderWidth: 2
  }]
}))

const volumeChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: '饮水量 (ml)',
      data: props.statsData.map(s => s.total_drink || 0),
      backgroundColor: '#4caf50',
      borderRadius: 6,
      barPercentage: 0.7
    },
    {
      label: '排尿量 (ml)',
      data: props.statsData.map(s => s.total_urine || 0),
      backgroundColor: '#ff9800',
      borderRadius: 6,
      barPercentage: 0.7
    }
  ]
}))

const urgencyChartData = computed(() => ({
  labels: labels.value,
  datasets: [{
    label: '平均尿急感',
    data: props.statsData.map(s => parseFloat(s.avg_urgency || 0).toFixed(1)),
    borderColor: '#f57c00',
    backgroundColor: 'rgba(245, 124, 0, 0.1)',
    fill: true,
    tension: 0.4,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: '#fff',
    pointBorderColor: '#f57c00',
    pointBorderWidth: 2
  }]
}))

const painChartData = computed(() => ({
  labels: labels.value,
  datasets: [{
    label: '平均疼痛',
    data: props.statsData.map(s => parseFloat(s.avg_pain || 0).toFixed(1)),
    borderColor: '#d32f2f',
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    fill: true,
    tension: 0.4,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: '#fff',
    pointBorderColor: '#d32f2f',
    pointBorderWidth: 2
  }]
}))
</script>

<style scoped>
.chart-container {
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 20px;
  width: 100%;
}

@media (max-width: 768px) {
  .chart-container {
    padding: 16px;
  }
}

.chart-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 24px;
}

.chart-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.chart-subtitle {
  color: #888;
  font-size: 13px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .charts-grid {
    gap: 20px;
  }
}

@media (max-width: 640px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.chart-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  height: 280px;
}

@media (max-width: 768px) {
  .chart-item {
    height: 260px;
    padding: 16px;
  }
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.title-icon {
  font-size: 18px;
}
</style>
