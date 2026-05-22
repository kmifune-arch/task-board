# task-board

タスク管理ボードアプリケーション。

## デプロイ先

https://kmifune-arch.github.io/task-board/

main への push で `.github/workflows/deploy.yml` が起動し、`next build`（`output: "export"`）で生成した `out/` を GitHub Pages にデプロイする。

## 技術スタック

- **フレームワーク**: Next.js 16（App Router、Turbopack、`output: "export"` で静的書き出し）
- **UIライブラリ**: React 19（Client Component中心。`"use client"` を `src/app/page.tsx` 先頭に付与）
- **言語**: TypeScript 5（`strict` 有効、`@/*` パスエイリアスは `src/*` を指す）
- **スタイル**: Tailwind CSS 4（PostCSS プラグイン経由、`src/app/globals.css` で読み込み）
- **リンタ**: ESLint 9 + `eslint-config-next`
- **パッケージマネージャ**: npm
- **ホスティング**: GitHub Pages（Project Pages、basePath `/task-board`）
- **CI/CD**: GitHub Actions（`actions/upload-pages-artifact` + `actions/deploy-pages`）
- **状態永続化**: ブラウザの `localStorage`（キー: `task-board:tasks`、JSON シリアライズ）

## Git運用ルール

**コードを変更するたびにGitHubへプッシュすること。**

具体的な手順:

1. ファイルを変更したら、関連する変更ごとに `git add` でステージング
2. 意味のある単位で `git commit` を作成（コミットメッセージは変更の「なぜ」を簡潔に）
3. コミット直後に `git push` でリモート（GitHub）へ反映
4. 作業中のブランチが未追跡の場合は `git push -u origin <branch>` で上流を設定

注意点:

- ローカルで複数のコミットを溜め込まない（最大でも1機能・1バグ修正単位でプッシュ）
- `git push --force` は使わない（必要な場合は事前にユーザーへ確認）
- `main` ブランチへ直接プッシュする運用か、PR経由かはプロジェクト方針に従う
- pre-commit / pre-push フックが失敗した場合は `--no-verify` でスキップせず、原因を解消してから再実行

## 開発コマンド

（プロジェクトのセットアップが進んだら、開発サーバ起動・テスト・ビルドのコマンドをここに追記）

## ディレクトリ構成

（実装が始まったら主要ディレクトリと役割をここに追記）

## コンポーネント命名規約

現状は1ファイル構成だが、今後コンポーネントを切り出す際は以下に従う。

- **ファイル名**
  - Next.js の特殊ファイル（`page.tsx`、`layout.tsx`、`not-found.tsx`、`route.ts` 等）は小文字固定
  - それ以外の React コンポーネントは PascalCase の `.tsx`（例: `TaskList.tsx`、`TaskItem.tsx`）
  - カスタムフックは camelCase で `use` プレフィックスの `.ts`（例: `useTasks.ts`）
  - ユーティリティは camelCase の `.ts`（例: `storage.ts`）
- **エクスポート**
  - ルート用コンポーネント（`page.tsx` の `Home` など）は default export
  - 共有コンポーネントは named export を基本にして再利用時の検索性を確保
- **シンボル命名**
  - React コンポーネント / 型 / Enum: `PascalCase`（例: `Task`、`TaskItemProps`）
  - 変数 / 関数 / フック: `camelCase`（例: `loadTasks`、`useTasks`）
  - モジュールスコープの定数: `SCREAMING_SNAKE_CASE`（例: `STORAGE_KEY`）
  - イベントハンドラ: `handleXxx`（例: `handleSubmit`、`handleToggle`）、props として渡す場合は `onXxx`
  - 真偽値: `is/has/can` 等の接頭辞（例: `isDone`、`hasTasks`）
- **その他の規約**
  - `localStorage` のキーは `task-board:<名前>` 形式（例: `task-board:tasks`）で名前空間を分ける
  - ID 生成は `crypto.randomUUID()` を優先、利用不可な実行コンテキスト向けにフォールバック関数を経由
  - Tailwind のクラスは状態ごとに条件で組み立て、テンプレートリテラルで結合

## アーキテクチャメモ

（重要な設計判断やドメインモデルをここに追記）
