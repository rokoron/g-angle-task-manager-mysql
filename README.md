# 制作タスク管理（MySQL版）

前回のReact版に、MySQLへの保存を加えた教材です。できることは**タスク一覧の取得**と**追加**だけ。追加したタスクは、再読み込み後も残ります。

## インストール済みなら：毎回の起動

最初の準備（`npm install`、`setup.sql`の実行、`.env`の設定）が済んでいれば、毎回の操作は次の4つです。インストールや表の作成をやり直す必要はありません。

1. **MySQLサーバーが起動していることを確認する。** 自動起動していれば操作は不要です。停止している場合はMySQLの設定画面やサービス管理画面から起動します。SQLを打つための`mysql>`画面を開く必要はありません。
2. **このフォルダでターミナルを開き、`npm run server`を実行する。** Node.jsが`server.mjs`を実行し、`.env`を読み、MySQLの`tasks`表に接続できるか確認します。成功すると`API起動: http://127.0.0.1:3001/api/tasks`と表示され、画面からの依頼を待ちます。
3. **同じフォルダで別のターミナルを開き、`npm run dev`を実行する。** Viteが起動し、`http://127.0.0.1:5173/`で画面用ファイルを届けられる状態になります。
4. **ブラウザで http://127.0.0.1:5173/ を開く。** 画面が表示され、MySQLに保存されているタスクを取得します。

手順2・3のターミナルは、アプリを使う間は開いたままにします。終了するときは、それぞれで`Ctrl + C`を押します。停止してもMySQLに保存したタスクは残ります。

`npm run server`と`npm run dev`は、`package.json`の`scripts`に付けた名前です。前者は`node server.mjs`、後者は`vite --host 127.0.0.1`を実行します。**どちらもNode.js上で動くプログラムです。Reactはブラウザの中で動くため、別の起動コマンドはありません。**

## ブラウザを開いた後の流れ

まず、Viteから画面用のファイルを受け取ります。

```text
ブラウザがURLを開く
  → index.htmlを読み込む
  → src/main.jsxからsrc/App.jsxを読み込む
  → ViteがJSXなどをブラウザで動く形に変換して届ける
  → ブラウザのReactが画面を作る
```

続いて、`App.jsx`の処理が保存済みのタスクを取得します。

```text
ブラウザ → Vite（5173番）→ Node.jsのAPI（3001番）→ MySQL
          /api/tasksを中継                         SELECTで取得
ブラウザ ← Vite          ← Node.jsのAPI           ← MySQL
  → Reactが受け取ったタスクを一覧に表示する
```

`vite.config.js`が、`/api`で始まる依頼をNode.jsのAPIへ中継する設定です。追加ボタンを押したときも同じ経路を通り、APIが`INSERT`でMySQLに保存します。

## ファイルの役割

アプリのコードは小さくまとめてあります。講師用台本はアプリフォルダの外へ分離しています。

| ファイル・フォルダ | 役割・使う場面 |
| --- | --- |
| `index.html` | ブラウザが最初に読むページ。Reactの表示場所を用意する |
| `src/main.jsx` | Reactを使って`App`の画面を表示し、CSSを読み込む入口 |
| `src/App.jsx` | タスク一覧・入力欄・取得・追加の処理 |
| `src/styles.css` | 文字・色・余白などの見た目 |
| `server.mjs` | Node.jsで動くAPI。依頼を受けてMySQLを読み書きする |
| `.env` | このPCのMySQL接続情報。`server.mjs`が読む |
| `vite.config.js` | ViteのURL・ポート・APIへの中継先の設定 |
| `package.json` | 必要なライブラリと、`npm run`のコマンドの定義 |
| `node_modules/` | `npm install`で入ったReact・Viteなどの本体。削除すると再インストールが必要 |
| `setup.sql` | 初回にデータベースと表を作るSQL。毎回の起動では実行しない |
| `.env.example` | 初回に`.env`を作るためのひな型 |
| `package-lock.json` | 同じバージョンのライブラリを再インストールするための記録 |
| `.gitignore` | Gitを使う場合に、パスワードや自動生成物を記録しないための設定 |
| `README.md` | この説明書。アプリのプログラムからは読み込まれない |

ここから下は初回準備と授業中の確認手順です。

## 授業前の準備（共通）

1. VS CodeとNode.jsを用意します。この教材のVite 7にはNode.js 20.19以上または22.12以上が必要です（[Viteの要件](https://v7.vite.dev/guide/)）。
2. このフォルダを開き、ターミナルで`npm install`を実行します。これで`node_modules`という自動生成フォルダができます。教材の配布ファイルには含めていません。
3. MySQL Community Server **8.4 LTS**のインストーラーをダウンロードします。MySQLのインストールと表の作成は授業中に行います。既にMySQLが入っている場合は、再インストールする前に接続できるか確認してください。

### Windowsの場合

- [MySQL公式ダウンロードページ](https://dev.mysql.com/downloads/mysql/8.4.html?os=3)でWindows用の**MSI**を選びます。インストールには管理者権限が必要です。Visual C++再頒布パッケージの要件も[公式手順](https://dev.mysql.com/doc/refman/8.4/en/windows-installation.html)で確認します。
- 授業中にMSIを実行し、続いてMySQL Configuratorで初期設定をします。`Type and Networking`では`Development`、TCP/IPポート`3306`を選びます。同じPCから使うため、外部接続用のファイアウォール開放は不要です（[Configuratorの説明](https://dev.mysql.com/doc/refman/8.4/en/mysql-configurator-workflow-server.html)）。rootパスワードを入力する場所は下の「rootパスワードを決める」を参照してください。
- VS CodeのPowerShellから接続します。インストール先を変更した場合はパスを読み替えてください。パスワードは`-p`の後に直接書かず、表示された入力欄へ入れます。

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -h 127.0.0.1 -u root -p
```

### Macの場合

- [MySQL公式ダウンロードページ](https://dev.mysql.com/downloads/mysql/)で8.4 LTSを選び、Macの種類に合う**DMG**をダウンロードします。Apple SiliconはARM、Intel Macはx86です。インストールには管理者権限が必要です。
- 授業中にDMGを開いて中のパッケージを実行します。rootパスワードは**ファイルのインストールが終わった後**の設定画面で入力します。手順は下の「rootパスワードを決める」を参照してください（[macOS向け公式手順](https://dev.mysql.com/doc/refman/8.4/en/macos-installation-pkg.html)）。
- ターミナルから接続します。公式パッケージの標準的なインストール先を使ったコマンドです。

```bash
/usr/local/mysql/bin/mysql -h 127.0.0.1 -u root -p
```

## rootパスワードを決める

ここでいう`root`は**MySQLの管理者ユーザー**です。WindowsやMacへのログイン用パスワードとは別です。インストーラーがPCの管理者パスワードを求めた場合は、その画面ではPC側のパスワードを入力します。MySQL用の新しいパスワードは、次の画面で自分で決めます。

**Windowsで新規インストールする場合**

1. MSIでMySQL Serverをインストールし、続いて**MySQL Configurator**を開きます。
2. `Type and Networking`などの画面を進めると、**`Accounts and Roles`**が表示されます。
3. その画面の**`Root Account Password`**と確認用の入力欄に、同じ新しいパスワードを入力します。これは既存のパスワードを尋ねている画面ではありません。強度の表示や条件が出たら、それに合うものを選びます。
4. 追加ユーザーは今回作らずに進みます。`Windows Service`の設定は標準のままでよく、最後の`Apply Configuration`で`Execute`を押し、成功を確認して終了します。

**Macで新規インストールする場合**

1. DMG内のパッケージを実行し、案内に沿ってインストールします。
2. ファイルのインストール後に出る**rootパスワードの設定画面**で、MySQL用の新しいパスワードを入力します。確認欄があれば同じものを入力します。
3. MySQLサーバーをインストール後に起動する設定にして完了します。起動しなかった場合はMySQLの設定画面から起動します。

決めたパスワードは安全な場所に控えてください。設定後、上に示した自分のOS用の`mysql ... -u root -p`コマンドを実行します。`Enter password:`と表示されたら**MySQL用に今決めたパスワード**を入力してEnterを押します。入力中は画面に文字が出なくても正常です。`mysql>`が表示されたら、設定とログインは成功です。コマンドの`-p`の直後にパスワードを書かないでください。

すでにMySQLをインストールしてある場合、rootパスワードは設定済みの可能性があります。まず上のコマンドでログインを試してください。忘れてログインできない場合は、新規インストールの手順では変更できません。[MySQL公式の再設定手順](https://dev.mysql.com/doc/refman/8.4/en/resetting-permissions.html)を使うため、既存のデータを消す再インストールはしないでください。

## 授業中：表を作り、SQLを試す

MySQLへの接続後、`mysql>`が表示されたら[setup.sql](./setup.sql)の内容を貼り付けて実行します。続けて自分で次を打ちます。

```sql
INSERT INTO tasks (title) VALUES ('ナレーション原稿を確認');
SELECT id, title FROM tasks ORDER BY id;
```

`INSERT`は書き込み、`SELECT`は取得です。`id`はMySQLが自動で付けます。授業では後でSQLの確認をするため、この操作用ターミナルを開いたままにします。アプリを使うだけなら閉じても構いません。MySQLサーバー自体は起動したままにします。

## 授業中：画面を起動する

初回だけ、このフォルダで`.env.example`を`.env`にコピーします。設定済みの`.env`がある場合はコピー不要です。

```powershell
# Windows（PowerShell）
Copy-Item .env.example .env
```

```bash
# Mac（ターミナル）
cp .env.example .env
```

`.env`の`DB_PASSWORD=""`の引用符の中に、**ログインに成功した同じMySQL用rootパスワード**を入力します。PCのログイン用パスワードは入れません。このファイルは配布ファイルに含めず、Gitの管理対象にも入れません。

ターミナルをさらに二つ開き、同じフォルダで別々に実行します。コマンドはWindowsとMacで共通です。

```text
ターミナル1：npm run server （Node.jsのAPIを起動）
ターミナル2：npm run dev    （Viteを起動）
```

ブラウザで`http://127.0.0.1:5173/`を開きます。先ほどSQLで追加した行が表示されるか確認し、画面からもう1件追加して再読み込みします。MySQLのターミナルで`SELECT id, title FROM se_task_lesson.tasks ORDER BY id;`を実行すると、画面から追加した行も確認できます。

## コードを読む順番

1. `setup.sql`：どんな表に保存するか。
2. `server.mjs`：MySQLへの接続、`SELECT`での取得、`INSERT`での追加。
3. `src/App.jsx`：画面を開いたときの取得と、追加ボタンからの送信。
4. `vite.config.js`：画面からの`/api`をNode.jsへ渡す設定。

## つまずいたら

| 症状 | 確認すること |
| --- | --- |
| `mysql`コマンドが見つからない | 上記のフルパスと実際のインストール先が一致しているか |
| `Access denied` | MySQLに入力したrootパスワードと`.env`の値 |
| `Unknown database`または`Table ... doesn't exist` | `setup.sql`を実行したか |
| ブラウザで取得できない | MySQLが起動しているか、`npm run server`が動いているか |

授業では理解しやすさのため、ローカルPCのrootユーザーで接続します。実務では権限を絞った専用ユーザーを作ります。
