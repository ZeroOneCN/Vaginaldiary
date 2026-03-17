import { jsPDF } from 'jspdf'

// 思源黑体 Normal 字体数据（base64 编码的字体子集）
// 这是一个简化的中文字体解决方案
// 完整实现需要加载完整的中文字体文件

// 方法：使用在线字体或本地字体文件
export async function loadChineseFont() {
  // 尝试从 Google Fonts 加载 Noto Sans SC
  const fontUrl = 'https://fonts.gstatic.com/s/notosanssc/v26/k3kx8e8iVE68aYKzQv-5kKv.woff2'
  
  try {
    const response = await fetch(fontUrl)
    const fontBuffer = await response.arrayBuffer()
    const fontBase64 = arrayBufferToBase64(fontBuffer)
    return fontBase64
  } catch (err) {
    console.error('加载字体失败:', err)
    return null
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// 创建支持中文的 PDF 文档
export function createChinesePDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  
  // 注意：jsPDF 需要额外的中文字体支持
  // 推荐使用 pdfmake 或 html2canvas+jsPDF 方案来生成中文 PDF
  
  return doc
}
