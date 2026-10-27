-- このファイルは最初に一度実行する。既存のタスクは消さない。
CREATE DATABASE IF NOT EXISTS se_task_lesson CHARACTER SET utf8mb4;
USE se_task_lesson;

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL
);

-- 最初は0件。レクチャー中にINSERTや画面の追加で増やす。
SELECT id, title FROM tasks ORDER BY id;
