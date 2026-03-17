<template>
  <div class="stats-panel">
    <h3>📊 今日统计</h3>
    <div v-if="!stats" class="empty">暂无数据</div>
    <div v-else class="stats-grid">
      <div class="stat-item">
        <div class="stat-icon">📝</div>
        <span class="stat-value">{{ stats.recordCount }}</span>
        <span class="stat-label">记录次数</span>
      </div>
      <div class="stat-item">
        <div class="stat-icon">💧</div>
        <span class="stat-value">{{ stats.totalDrink }}</span>
        <span class="stat-label">总饮水 (ml)</span>
      </div>
      <div class="stat-item">
        <div class="stat-icon">🚽</div>
        <span class="stat-value">{{ stats.totalUrine }}</span>
        <span class="stat-label">总排尿 (ml)</span>
      </div>
      <div class="stat-item night" v-if="stats.nightCount > 0">
        <div class="stat-icon">🌙</div>
        <span class="stat-value">{{ stats.nightCount }}</span>
        <span class="stat-label">夜尿次数</span>
      </div>
      <div class="stat-item" :class="'level-' + urgencyLevel">
        <div class="stat-icon">⚡</div>
        <span class="stat-value">{{ stats.avgUrgency }}</span>
        <span class="stat-label">平均尿急感</span>
      </div>
      <div class="stat-item" :class="'level-' + painLevel">
        <div class="stat-icon">🔴</div>
        <span class="stat-value">{{ stats.avgPain }}</span>
        <span class="stat-label">平均疼痛</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Object, default: null }
})

const urgencyLevel = computed(() => {
  if (!props.stats) return 0
  const v = parseFloat(props.stats.avgUrgency) || 0
  return v >= 2.5 ? 3 : v >= 1.5 ? 2 : v >= 0.5 ? 1 : 0
})

const painLevel = computed(() => {
  if (!props.stats) return 0
  const v = parseFloat(props.stats.avgPain) || 0
  return v >= 2.5 ? 3 : v >= 1.5 ? 2 : v >= 0.5 ? 1 : 0
})
</script>

<style scoped>
.stats-panel {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}

.stats-panel h3 {
  margin: 0 0 16px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.empty {
  text-align: center;
  color: #999;
  padding: 30px 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 400px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.stat-item {
  background: #f8f9fa;
  padding: 16px 12px;
  border-radius: 10px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.stat-item.night {
  background: #f3e5f5;
}

.stat-item.level-1 {
  border-color: #ff9800;
  background: #fff3e0;
}

.stat-item.level-2 {
  border-color: #f44336;
  background: #ffebee;
}

.stat-item.level-3 {
  border-color: #b71c1c;
  background: #b71c1c;
  color: #fff;
}

.stat-item.level-3 .stat-label {
  color: rgba(255,255,255,0.9);
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-item.level-3 .stat-value {
  color: #fff;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 400px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
