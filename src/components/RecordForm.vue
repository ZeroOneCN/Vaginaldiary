<template>
  <div class="record-form">
    <div class="form-header">
      <h3>📝 饮水排尿记录</h3>
      <p class="description">记录一次完整的饮水 - 排尿过程</p>
    </div>
    
    <form @submit.prevent="submit">
      <!-- 饮水部分 -->
      <div class="form-section drink-section">
        <h4>💧 饮水信息</h4>
        
        <div class="form-row">
          <label class="full-width">
            <span>饮水种类</span>
            <div class="drink-types">
              <button
                v-for="type in drinkTypes"
                :key="type"
                type="button"
                :class="['drink-type', { selected: form.drink_type === type }]"
                @click="form.drink_type = type"
              >
                <span class="icon">{{ getDrinkIcon(type) }}</span>
                <span class="name">{{ type }}</span>
              </button>
            </div>
          </label>
        </div>

        <div class="form-row">
          <label class="full-width">
            <span>饮水量</span>
            <div class="volume-input-group">
              <input 
                type="number" 
                v-model.number="form.drink_volume" 
                min="0" 
                step="50"
                placeholder="ml"
                required
              >
              <span class="unit">ml</span>
            </div>
          </label>
        </div>

        <div class="form-row">
          <label class="full-width">
            <span>杯数</span>
            <div class="cups-input-group">
              <button type="button" class="adjust-btn" @click="adjustDrinkCups(-0.5)">−</button>
              <span class="cups-display">{{ form.drink_cups }} 杯</span>
              <button type="button" class="adjust-btn" @click="adjustDrinkCups(0.5)">+</button>
            </div>
            <div class="quick-values">
              <button
                v-for="c in [0.5, 1, 1.5, 2]"
                :key="c"
                type="button"
                :class="['quick-btn', { active: form.drink_cups === c }]"
                @click="form.drink_cups = c"
              >
                {{ c }}杯
              </button>
            </div>
          </label>
        </div>

        <div class="form-row">
          <label class="full-width">
            <span>饮水后症状</span>
            <div class="symptom-tags">
              <button
                v-for="symptom in drinkSymptomOptions"
                :key="symptom"
                type="button"
                :class="['tag', { selected: form.drink_symptoms.includes(symptom) }]"
                @click="toggleDrinkSymptom(symptom)"
              >
                {{ symptom }}
              </button>
            </div>
          </label>
        </div>
      </div>

      <!-- 排尿部分 -->
      <div class="form-section urine-section">
        <h4>🚽 排尿信息</h4>
        
        <div class="form-row">
          <label class="full-width">
            <span>排尿量</span>
            <div class="volume-input-group">
              <input 
                type="number" 
                v-model.number="form.urine_volume" 
                min="0" 
                step="50"
                placeholder="ml"
                required
              >
              <span class="unit">ml</span>
            </div>
          </label>
        </div>

        <div class="form-row">
          <label class="full-width">
            <span>杯数</span>
            <div class="cups-input-group">
              <button type="button" class="adjust-btn" @click="adjustUrineCups(-0.5)">−</button>
              <span class="cups-display">{{ form.urine_cups }} 杯</span>
              <button type="button" class="adjust-btn" @click="adjustUrineCups(0.5)">+</button>
            </div>
            <div class="quick-values">
              <button
                v-for="c in [0.5, 1, 1.5, 2, 2.5, 3]"
                :key="c"
                type="button"
                :class="['quick-btn', { active: form.urine_cups === c }]"
                @click="form.urine_cups = c"
              >
                {{ c }}杯
              </button>
            </div>
          </label>
        </div>

        <div class="form-row">
          <label>
            <span>尿急感 (0-3)</span>
            <div class="rating-group">
              <button 
                v-for="i in 4" 
                :key="i - 1"
                type="button"
                :class="['rating-btn', { active: form.urgency === i - 1 }]"
                @click="form.urgency = i - 1"
              >
                {{ i - 1 }}
              </button>
            </div>
            <span :class="['rating-label', 'level-' + form.urgency]">
              {{ urgencyLabels[form.urgency] }}
            </span>
          </label>
        </div>

        <div class="form-row">
          <label>
            <span>排尿疼痛 (0-3)</span>
            <div class="rating-group">
              <button 
                v-for="i in 4" 
                :key="i - 1"
                type="button"
                :class="['rating-btn', { active: form.pain === i - 1 }]"
                @click="form.pain = i - 1"
              >
                {{ i - 1 }}
              </button>
            </div>
            <span :class="['rating-label', 'level-' + form.pain]">
              {{ painLabels[form.pain] }}
            </span>
          </label>
        </div>

        <div class="form-row">
          <label class="full-width">
            <span>夜尿标记</span>
            <div class="toggle-group">
              <button 
                type="button"
                :class="['toggle-btn', { active: !form.is_night }]"
                @click="form.is_night = false"
              >
                日间
              </button>
              <button 
                type="button"
                :class="['toggle-btn', 'night', { active: form.is_night }]"
                @click="form.is_night = true"
              >
                🌙 夜间
              </button>
            </div>
          </label>
        </div>

        <div class="form-row">
          <label class="full-width">
            <span>排尿症状</span>
            <div class="symptom-tags">
              <button
                v-for="symptom in urineSymptomOptions"
                :key="symptom"
                type="button"
                :class="['tag', { selected: form.urine_symptoms.includes(symptom) }]"
                @click="toggleUrineSymptom(symptom)"
              >
                {{ symptom }}
              </button>
            </div>
          </label>
        </div>
      </div>

      <!-- 备注 -->
      <div class="form-row">
        <label class="full-width">
          <span>备注</span>
          <input 
            type="text" 
            v-model="form.note" 
            placeholder="可选，记录特殊情况"
          >
        </label>
      </div>

      <button type="submit" class="submit-btn">添加记录</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  urgencyLabels: { type: Array, required: true },
  painLabels: { type: Array, required: true },
  drinkTypes: { type: Array, required: true }
})

const emit = defineEmits(['submit'])

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

const drinkSymptomOptions = ['无不适', '口渴缓解', '胃部不适', '恶心', '腹胀', '其他']
const urineSymptomOptions = ['尿频', '尿不尽', '排尿困难', '滴漏', '血尿', '浑浊']

const form = reactive({
  drink_type: '白开水',
  drink_volume: '',
  drink_cups: 1,
  drink_symptoms: [],
  urine_volume: '',
  urine_cups: 1,
  urgency: 0,
  pain: 0,
  is_night: false,
  urine_symptoms: [],
  note: ''
})

function getDrinkIcon(type) {
  return DRINK_ICONS[type] || '🫗'
}

function adjustDrinkCups(delta) {
  const newCups = (form.drink_cups || 0) + delta
  if (newCups >= 0) form.drink_cups = newCups
}

function adjustUrineCups(delta) {
  const newCups = (form.urine_cups || 0) + delta
  if (newCups >= 0) form.urine_cups = newCups
}

function toggleDrinkSymptom(symptom) {
  const index = form.drink_symptoms.indexOf(symptom)
  if (index > -1) {
    form.drink_symptoms.splice(index, 1)
  } else {
    form.drink_symptoms.push(symptom)
  }
}

function toggleUrineSymptom(symptom) {
  const index = form.urine_symptoms.indexOf(symptom)
  if (index > -1) {
    form.urine_symptoms.splice(index, 1)
  } else {
    form.urine_symptoms.push(symptom)
  }
}

function submit() {
  emit('submit', {
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    drink_type: form.drink_type,
    drink_volume: parseFloat(form.drink_volume) || 0,
    drink_cups: form.drink_cups,
    drink_symptoms: [...form.drink_symptoms],
    urine_volume: parseFloat(form.urine_volume) || 0,
    urine_cups: form.urine_cups,
    urgency: form.urgency,
    pain: form.pain,
    is_night: form.is_night,
    urine_symptoms: [...form.urine_symptoms],
    note: form.note
  })
  
  // 重置表单
  form.drink_volume = ''
  form.drink_cups = 1
  form.drink_symptoms = []
  form.urine_volume = ''
  form.urine_cups = 1
  form.urgency = 0
  form.pain = 0
  form.is_night = false
  form.urine_symptoms = []
  form.note = ''
}
</script>

<style scoped>
.record-form {
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  width: 100%;
}

@media (max-width: 768px) {
  .record-form {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .record-form {
    padding: 12px;
  }
}

.form-header {
  margin-bottom: 24px;
}

.form-header h3 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.description {
  margin: 0;
  color: #888;
  font-size: 13px;
}

.form-section {
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 12px;
  background: #f8f9fa;
}

.drink-section {
  border-left: 4px solid #4caf50;
}

.urine-section {
  border-left: 4px solid #ff9800;
}

.form-section h4 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.form-row {
  margin-bottom: 20px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-row label {
  display: block;
}

.form-row span:first-child {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-size: 14px;
  font-weight: 500;
}

.full-width {
  display: block;
}

.drink-types {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

@media (max-width: 640px) {
  .drink-types {
    grid-template-columns: repeat(3, 1fr);
  }
}

.drink-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.drink-type:hover {
  border-color: #4caf50;
  background: #f1f8e9;
}

.drink-type.selected {
  border-color: #4caf50;
  background: #4caf50;
  color: #fff;
}

.drink-type .icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.drink-type .name {
  font-size: 12px;
}

.volume-input-group,
.cups-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-input-group input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.volume-input-group input:focus {
  outline: none;
  border-color: #4caf50;
}

.volume-input-group .unit {
  color: #666;
  font-size: 16px;
  min-width: 40px;
}

.cups-display {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
}

.adjust-btn {
  width: 48px;
  height: 48px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
  font-size: 24px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.adjust-btn:hover {
  border-color: #4caf50;
  color: #4caf50;
}

.quick-values {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.quick-btn {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: #fff;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  border-color: #4caf50;
  color: #4caf50;
}

.quick-btn.active {
  background: #4caf50;
  border-color: #4caf50;
  color: #fff;
}

.symptom-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #fff;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.tag:hover {
  border-color: #4caf50;
  color: #4caf50;
}

.tag.selected {
  background: #4caf50;
  border-color: #4caf50;
  color: #fff;
}

.rating-group {
  display: flex;
  gap: 10px;
}

.rating-btn {
  width: 48px;
  height: 48px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
  font-size: 18px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.rating-btn:hover {
  border-color: #ff9800;
  background: #fff3e0;
  color: #ff9800;
}

.rating-btn.active {
  border-color: #ff9800;
  background: #ff9800;
  color: #fff;
}

.rating-label {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.rating-label.level-0 {
  background: #e8f5e9;
  color: #2e7d32;
}

.rating-label.level-1 {
  background: #fff3e0;
  color: #ef6c00;
}

.rating-label.level-2 {
  background: #ffebee;
  color: #c62828;
}

.rating-label.level-3 {
  background: #b71c1c;
  color: #fff;
}

.toggle-group {
  display: flex;
  gap: 10px;
}

.toggle-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  border-color: #ff9800;
}

.toggle-btn.active {
  border-color: #ff9800;
  background: #ff9800;
  color: #fff;
}

.toggle-btn.night.active {
  border-color: #6f42c1;
  background: #6f42c1;
}

.form-row input[type="text"] {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-row input[type="text"]:focus {
  outline: none;
  border-color: #ff9800;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 24px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}
</style>
