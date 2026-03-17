import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9509;

// 中间件
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist')));

// 初始化数据库
const db = new sqlite3.Database('./diary.db', (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('已连接到 SQLite 数据库');
    initDatabase();
  }
});

// 初始化数据表
function initDatabase() {
  // 创建表（如果不存在）
  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,

      -- 饮水信息
      drink_type TEXT NOT NULL,
      drink_volume INTEGER NOT NULL,
      drink_cups REAL NOT NULL,

      -- 排尿信息
      urine_volume INTEGER NOT NULL,
      urine_cups REAL NOT NULL,
      urgency INTEGER NOT NULL,
      pain INTEGER NOT NULL,
      is_night INTEGER DEFAULT 0,

      -- 症状
      drink_symptoms TEXT DEFAULT '',
      urine_symptoms TEXT DEFAULT '',

      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('数据库表初始化完成');
}

// ============ 记录 API ============

// 获取指定日期的记录
app.get('/api/records/:date', (req, res) => {
  const { date } = req.params;
  db.all(
    'SELECT * FROM records WHERE date = ? ORDER BY time',
    [date],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// 添加记录
app.post('/api/records', (req, res) => {
  const { 
    date, time,
    drink_type, drink_volume, drink_cups,
    urine_volume, urine_cups,
    urgency, pain, is_night,
    drink_symptoms, urine_symptoms,
    note
  } = req.body;
  
  const sql = `
    INSERT INTO records (
      date, time,
      drink_type, drink_volume, drink_cups,
      urine_volume, urine_cups,
      urgency, pain, is_night,
      drink_symptoms, urine_symptoms,
      note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(
    sql,
    [
      date, time,
      drink_type, drink_volume, drink_cups,
      urine_volume, urine_cups,
      urgency, pain, is_night ? 1 : 0,
      JSON.stringify(drink_symptoms || []),
      JSON.stringify(urine_symptoms || []),
      note || ''
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

// 删除记录
app.delete('/api/records/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM records WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// 获取日期范围统计
app.get('/api/stats/range', (req, res) => {
  const { startDate, endDate } = req.query;
  
  const sql = `
    SELECT 
      date,
      COUNT(*) as record_count,
      SUM(drink_volume) as total_drink,
      SUM(urine_volume) as total_urine,
      AVG(urgency) as avg_urgency,
      AVG(pain) as avg_pain,
      SUM(CASE WHEN is_night = 1 THEN 1 ELSE 0 END) as night_count
    FROM records
    WHERE date BETWEEN ? AND ?
    GROUP BY date
    ORDER BY date
  `;
  
  db.all(sql, [startDate, endDate], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 获取所有记录（用于导出）
app.get('/api/export', (req, res) => {
  const { startDate, endDate } = req.query;
  
  db.all(
    'SELECT * FROM records WHERE date BETWEEN ? AND ? ORDER BY date, time',
    [startDate, endDate],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// 获取所有可用日期
app.get('/api/dates', (req, res) => {
  db.all(
    'SELECT DISTINCT date FROM records ORDER BY date DESC',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows.map(r => r.date));
    }
  );
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('关闭数据库失败:', err.message);
    }
    console.log('数据库连接已关闭');
    process.exit(0);
  });
});
