// Viteの開発サーバーの設定。画面を開くアドレスとポートを決める。
// /apiへの依頼をserver.mjsのAPIへ中継する。npm run devでViteが読み込む。
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // ブラウザの/apiへのリクエストを、Node.jsサーバーへ転送する。
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
});
