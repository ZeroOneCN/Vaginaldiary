<template>
  <div class="export-panel">
    <div class="export-header">
      <div class="export-title">
        <span class="title-icon">📄</span>
        <span>导出 PDF 报告</span>
      </div>
      <span class="export-subtitle">生成专业医疗报告</span>
    </div>
    <div class="export-form">
      <div class="form-row">
        <label>
          <span>开始日期</span>
          <input type="date" v-model="startDate" :max="endDate">
        </label>
        <label>
          <span>结束日期</span>
          <input type="date" v-model="endDate" :min="startDate" :max="today">
        </label>
      </div>
      <button @click="exportPDF" class="export-btn">
        <span>📥</span>
        <span>导出 PDF 报告</span>
      </button>
    </div>
    
    <!-- 隐藏的 PDF 报告模板 -->
    <div ref="reportRef" class="pdf-report hidden">
      <div class="report-header">
        <h1>排尿日记报告</h1>
        <p class="report-period">报告期间：{{ startDate }} 至 {{ endDate }}</p>
      </div>
      
      <div class="report-section">
        <h2>汇总统计</h2>
        <table class="summary-table">
          <tbody>
            <tr><td class="label">总记录次数</td><td>{{ data.length }} 次</td></tr>
            <tr><td class="label">总饮水量</td><td>{{ summary.totalDrink }} ml</td></tr>
            <tr><td class="label">总排尿量</td><td>{{ summary.totalUrine }} ml</td></tr>
            <tr><td class="label">夜尿次数</td><td>{{ summary.nightCount }} 次</td></tr>
            <tr><td class="label">平均尿急感</td><td>{{ summary.avgUrgency }} 分</td></tr>
            <tr><td class="label">平均疼痛</td><td>{{ summary.avgPain }} 分</td></tr>
          </tbody>
        </table>
      </div>
      
      <div class="report-section">
        <h2>详细记录</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>时间</th>
              <th>饮水</th>
              <th>饮水量</th>
              <th>杯数</th>
              <th>排尿量</th>
              <th>杯数</th>
              <th>尿急</th>
              <th>疼痛</th>
              <th>夜尿</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in data" :key="r.id">
              <td>{{ r.date }}</td>
              <td>{{ r.time }}</td>
              <td>{{ getDrinkIcon(r.drink_type) }} {{ r.drink_type }}</td>
              <td>{{ r.drink_volume }}ml</td>
              <td>{{ r.drink_cups }}</td>
              <td>{{ r.urine_volume }}ml</td>
              <td>{{ r.urine_cups }}</td>
              <td>{{ r.urgency }}</td>
              <td>{{ r.pain }}</td>
              <td>{{ r.is_night ? '✓' : '' }}</td>
              <td>{{ r.note || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="report-footer">
        <p>生成日期：{{ new Date().toLocaleDateString('zh-CN') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { fetchExportData } from '../api'
import { showToast } from '../utils/toast'

const today = new Date().toISOString().split('T')[0]
const startDate = ref(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
const endDate = ref(today)
const reportRef = ref(null)
const data = ref([])

const URGENCY_LABELS = ['无', '轻微', '中等', '强烈']
const PAIN_LABELS = ['无', '轻微', '中等', '严重']

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

const summary = computed(() => {
  const totalDrink = data.value.reduce((sum, r) => sum + (r.drink_volume || 0), 0)
  const totalUrine = data.value.reduce((sum, r) => sum + (r.urine_volume || 0), 0)
  const avgUrgency = data.value.length > 0 
    ? (data.value.reduce((sum, r) => sum + (r.urgency || 0), 0) / data.value.length).toFixed(1)
    : 0
  const avgPain = data.value.length > 0 
    ? (data.value.reduce((sum, r) => sum + (r.pain || 0), 0) / data.value.length).toFixed(1)
    : 0
  const nightCount = data.value.filter(r => r.is_night).length

  return {
    totalDrink: totalDrink.toFixed(0),
    totalUrine: totalUrine.toFixed(0),
    avgUrgency,
    avgPain,
    nightCount
  }
})

function getDrinkIcon(type) {
  return DRINK_ICONS[type] || '🫗'
}

async function exportPDF() {
  try {
    const exportData = await fetchExportData(startDate.value, endDate.value)
    if (!exportData || exportData.length === 0) {
      showToast('所选日期范围内没有记录', 'info')
      return
    }
    data.value = exportData
    
    // 等待 DOM 更新
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 显示报告模板
    reportRef.value.classList.remove('hidden')
    
    // 使用 html2canvas 渲染
    const canvas = await html2canvas(reportRef.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    })
    
    // 隐藏报告模板
    reportRef.value.classList.add('hidden')
    
    // 创建 PDF
    const imgData = canvas.toDataURL('image/png', 1.0)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pdfWidth - 20 // 留边距
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = 10
    
    // 第一页
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= (pdfHeight - 20)
    
    // 多页支持
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= (pdfHeight - 20)
    }
    
    pdf.save(`排尿日记_${startDate.value}_${endDate.value}.pdf`)
    showToast('PDF 导出成功', 'success')
  } catch (err) {
    showToast('导出失败：' + err.message, 'error')
  }
}
</script>

<style scoped>
.export-panel {
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 20px;
  width: 100%;
  border: 1px solid #e0e0e0;
}

@media (max-width: 768px) {
  .export-panel {
    padding: 20px;
  }
}

.export-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.export-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.title-icon {
  font-size: 22px;
}

.export-subtitle {
  color: #888;
  font-size: 13px;
}

@media (max-width: 480px) {
  .export-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

.export-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-row label {
  display: block;
}

.form-row span {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-size: 14px;
  font-weight: 500;
}

.form-row input[type="date"] {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  background: #fff;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-row input[type="date"]:focus {
  outline: none;
  border-color: #2e7d32;
}

.export-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover {
  background: #1b5e20;
}

.export-btn:active {
  transform: scale(0.98);
}

.export-btn span:first-child {
  font-size: 18px;
}

/* PDF 报告模板样式 */
.pdf-report {
  position: fixed;
  top: 0;
  left: 0;
  width: 794px;
  padding: 30px 40px;
  background: #fff;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.pdf-report.hidden {
  position: absolute;
  left: -9999px;
  top: -9999px;
}

.pdf-report .report-header {
  text-align: center;
  border-bottom: 3px solid #2c3e50;
  padding-bottom: 20px;
  margin-bottom: 25px;
}

.pdf-report .report-header h1 {
  margin: 0 0 10px;
  font-size: 26px;
  color: #2c3e50;
}

.pdf-report .report-period {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.pdf-report .report-section {
  margin-bottom: 25px;
}

.pdf-report .report-section h2 {
  margin: 0 0 15px;
  font-size: 17px;
  color: #2c3e50;
  border-left: 4px solid #4a90d9;
  padding-left: 12px;
}

.pdf-report .summary-table {
  width: 100%;
  border-collapse: collapse;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.pdf-report .summary-table tr {
  border-bottom: 1px solid #e0e0e0;
}

.pdf-report .summary-table tr:last-child {
  border-bottom: none;
}

.pdf-report .summary-table td {
  padding: 12px 16px;
  font-size: 14px;
}

.pdf-report .summary-table td.label {
  font-weight: 600;
  color: #555;
  width: 40%;
}

.pdf-report .data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.pdf-report .data-table thead {
  background: #4a90d9;
  color: #fff;
}

.pdf-report .data-table thead th {
  padding: 10px 6px;
  font-weight: 600;
  text-align: left;
  border: 1px solid #3a7bc8;
}

.pdf-report .data-table tbody tr:nth-child(even) {
  background: #f8f9fa;
}

.pdf-report .data-table tbody td {
  padding: 8px 6px;
  border: 1px solid #e0e0e0;
}

.pdf-report .report-footer {
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.pdf-report .report-footer p {
  margin: 0;
  color: #888;
  font-size: 11px;
}
</style>
