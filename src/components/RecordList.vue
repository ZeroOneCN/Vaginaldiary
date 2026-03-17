<template>
  <div class="record-list">
    <div v-if="records.length === 0" class="empty">
      暂无记录
    </div>
    <div v-else class="list">
      <div 
        v-for="record in records" 
        :key="record.id" 
        :class="['record-item', { 'night-record': record.is_night }]"
      >
        <div class="record-header">
          <div class="time-group">
            <span class="time">{{ record.time }}</span>
            <span v-if="record.is_night" class="night-icon" title="夜尿">🌙</span>
          </div>
          <button class="delete-btn" @click="$emit('delete-record', record.id)" title="删除">×</button>
        </div>
        
        <div class="record-content">
          <!-- 饮水信息 -->
          <div class="info-section drink-info">
            <div class="section-title">
              <span class="icon">💧</span>
              <span>饮水</span>
            </div>
            <div class="details">
              <span class="badge type">
                {{ getDrinkIcon(record.drink_type) }} {{ record.drink_type }}
              </span>
              <span class="badge volume">{{ record.drink_volume }}ml</span>
              <span class="badge cups">{{ record.drink_cups }}杯</span>
            </div>
            <div v-if="record.drink_symptoms && record.drink_symptoms.length" class="symptoms">
              <span
                v-for="s in parseSymptoms(record.drink_symptoms)"
                :key="s"
                class="symptom-tag drink"
              >
                {{ s }}
              </span>
            </div>
          </div>
          
          <!-- 箭头 -->
          <div class="arrow">↓</div>
          
          <!-- 排尿信息 -->
          <div class="info-section urine-info">
            <div class="section-title">
              <span class="icon">🚽</span>
              <span>排尿</span>
            </div>
            <div class="details">
              <span class="badge volume">{{ record.urine_volume }}ml</span>
              <span class="badge cups">{{ record.urine_cups }}杯</span>
              <span 
                :class="['badge', 'urgency', 'u' + record.urgency]"
                :title="'尿急感：' + urgencyLabels[record.urgency]"
              >
                尿急 {{ record.urgency }}
              </span>
              <span 
                :class="['badge', 'pain', 'p' + record.pain]"
                :title="'疼痛：' + painLabels[record.pain]"
              >
                痛 {{ record.pain }}
              </span>
            </div>
            <div v-if="record.urine_symptoms && record.urine_symptoms.length" class="symptoms">
              <span
                v-for="s in parseSymptoms(record.urine_symptoms)"
                :key="s"
                class="symptom-tag urine"
              >
                {{ s }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-if="record.note" class="record-note">
          {{ record.note }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  records: { type: Array, required: true },
  urgencyLabels: { type: Array, required: true },
  painLabels: { type: Array, required: true }
})

const emit = defineEmits(['delete-record'])

const DRINK_ICONS = {
  '白开水': '💧',
  '茶': '🍵',
  '咖啡': '☕',
  '果汁': '🧃',
  '碳酸饮料': '🥤',
  '牛奶': '🥛',
  '柠檬水': '🍋',
  '其他': '🫗'
}

function getDrinkIcon(type) {
  return DRINK_ICONS[type] || '🫗'
}

function parseSymptoms(symptoms) {
  if (!symptoms) return []
  try {
    return JSON.parse(symptoms || '[]')
  } catch {
    return []
  }
}
</script>

<style scoped>
.record-list {
  margin-top: 20px;
  width: 100%;
}

.empty {
  color: #999;
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-left: 4px solid #4caf50;
  transition: all 0.2s;
}

.record-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.record-item.night-record {
  border-left-color: #6f42c1;
  background: #f3e5f5;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.time-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.night-icon {
  font-size: 16px;
}

.delete-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #ffcdd2;
  color: #c62828;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #ef5350;
  color: #fff;
}

.record-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.info-section {
  flex: 1;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.drink-info {
  border-left: 3px solid #4caf50;
}

.urine-info {
  border-left: 3px solid #ff9800;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

.section-title .icon {
  font-size: 16px;
}

.details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.badge.type {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge.volume {
  background: #e3f2fd;
  color: #1565c0;
}

.badge.cups {
  background: #bbdefb;
  color: #0d47a1;
}

.badge.urgency,
.badge.pain {
  background: #fff3e0;
  color: #e65100;
}

.badge.urgency.u0,
.badge.pain.p0 {
  background: #c8e6c9;
  color: #2e7d32;
}

.badge.urgency.u1,
.badge.pain.p1 {
  background: #ffe0b2;
  color: #ef6c00;
}

.badge.urgency.u2,
.badge.pain.p2 {
  background: #ffccbc;
  color: #c62828;
}

.badge.urgency.u3,
.badge.pain.p3 {
  background: #b71c1c;
  color: #fff;
}

.symptoms {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.symptom-tag {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
}

.symptom-tag.drink {
  background: #e8f5e9;
  color: #2e7d32;
}

.symptom-tag.urine {
  background: #fff3e0;
  color: #e65100;
}

.arrow {
  font-size: 24px;
  color: #999;
  font-weight: bold;
}

.record-note {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ddd;
  color: #666;
  font-size: 13px;
}

@media (max-width: 640px) {
  .record-content {
    flex-direction: column;
  }
  
  .arrow {
    transform: rotate(90deg);
  }
}
</style>
