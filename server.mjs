// Node.jsで動くサーバー側のプログラム。画面からの取得・追加の依頼に応じてSQLでMySQLを読み書きする。
// npm run serverで起動し、.envの接続情報を使って、処理結果をJSONで画面へ返す。
import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';

if (!process.env.DB_PASSWORD) {
  console.error('.env の DB_PASSWORD に、MySQLで設定したrootパスワードを入力してください。');
  process.exit(1);
}

// MySQLの接続情報はNode.jsだけが読む。ブラウザへパスワードを渡さない。
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'se_task_lesson',
  charset: 'utf8mb4',
});

const app = express();
app.use(express.json()); // POSTで送られたJSONをrequest.bodyとして読めるようにする。

app.get('/api/tasks', async (_request, response) => {
  try {
    // executeの結果は[行の配列, 列の情報]。画面へ返すのは行の配列だけ。
    const [rows] = await pool.execute('SELECT id, title FROM tasks ORDER BY id');
    response.json(rows);
  } catch {
    response.status(503).json({ error: 'タスクを取得できません。MySQLの接続を確認してください。' });
  }
});

app.post('/api/tasks', async (request, response) => {
  const title = request.body?.title;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 100) {
    response.status(400).json({ error: 'タスク名は1〜100文字で入力してください。' });
    return;
  }

  try {
    const cleanTitle = title.trim();
    // ?へタスク名を別渡しする。入力値をSQL文に直接つなげない。
    const [result] = await pool.execute('INSERT INTO tasks (title) VALUES (?)', [cleanTitle]);
    response.status(201).json({ id: result.insertId, title: cleanTitle });
  } catch {
    response.status(503).json({ error: 'タスクを保存できません。MySQLの接続を確認してください。' });
  }
});

try {
  // 起動時に表の存在まで確認する。setup.sqlの実行忘れもここで分かる。
  await pool.execute('SELECT id FROM tasks LIMIT 1');
  app.listen(3001, '127.0.0.1', () => {
    console.log('API起動: http://127.0.0.1:3001/api/tasks');
  });
} catch (error) {
  console.error(`MySQLに接続できません。設定とsetup.sqlを確認してください。 (${error.code || error.message})`);
  await pool.end();
  process.exitCode = 1;
}
