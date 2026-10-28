// ブラウザで動くReactの画面。タスク一覧・入力欄・ボタンと、その操作を担当する。
// 取得・追加はfetchでserver.mjsのAPIに依頼し、返されたデータを画面に反映する。
import React, { useEffect, useState } from 'react';

export default function App() {
  // この画面で使う状態をまとめて用意する。
  // tasksは表示する一覧、titleは入力欄の文字。残りは取得・保存の進行状況と
  // エラー表示に使う。set〜で値を変えると、Reactが画面を描き直す。
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 画面を開いたときに一覧を取得するブロック。
  // 前回はsampleTasks.jsの配列を初期値にしたが、今回はNode.jsのAPIへGETを送り、
  // 返ってきたJSONをtasksに入れる。通信に失敗したら理由を表示し、
  // 最後に読み込み中の表示を終える。末尾の[]は初回表示時に実行する指定。
  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('取得失敗');
        setTasks(await response.json());
      } catch {
        setLoadError(true);
        setError('タスクを取得できません。MySQLとNode.jsサーバーを確認し、ページを再読み込みしてください。');
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  // 追加ボタンを押したときのブロック。
  // フォームの標準動作によるページ移動を止め、空欄を確認してから
  // タスク名をJSONでNode.jsへPOSTする。MySQLへの保存はNode.js側が担当する。
  async function addTask(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('タスク名を入力してください。');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle }),
      });
      if (!response.ok) throw new Error('保存失敗');

      // 保存後に返されたID付きの1件を、画面の一覧にも反映する。
      // 再読み込みしたときは、上のGETでMySQLに保存された一覧を取り直す。
      const savedTask = await response.json();
      setTasks((current) => [...current, savedTask]);
      setTitle('');
    } catch {
      setError('タスクを保存できません。MySQLとNode.jsサーバーを確認してください。');
    } finally {
      setSaving(false);
    }
  }

  // 表示を組み立てるブロック。上の処理で変わった状態に合わせて内容が変わる。
  return (
    <main>
      <h1>制作タスク管理（MySQL版）</h1>
      <p>追加したタスクはMySQLに保存され、再読み込みしても残ります。</p>

      {/* 入力欄の値はtitleと連動する。送信中・取得中・取得失敗時は追加を止める。 */}
      <form onSubmit={addTask}>
        <label htmlFor="task-title">タスク名</label>
        <input
          id="task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={100}
          placeholder="例：ナレーション原稿を確認"
        />
        <button type="submit" disabled={saving || loading || loadError}>{saving ? '保存中…' : '追加する'}</button>
      </form>

      {/* 取得・保存の結果に応じて、エラー、読み込み中、空欄、一覧を出し分ける。 */}
      {error && <p role="alert" className="error">{error}</p>}
      <h2>タスク一覧{!loading && !loadError && `（${tasks.length}件）`}</h2>
      {loading ? <p>読み込み中…</p> : loadError ? null : tasks.length === 0 ? <p>タスクはまだありません。</p> : (
        <ul>
          {tasks.map((task) => <li key={task.id}>#{task.id} {task.title}</li>)}
        </ul>
      )}
    </main>
  );
}
