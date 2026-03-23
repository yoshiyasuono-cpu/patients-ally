# エージェント②：ポータルサイト改修（patients-ally）

## プロジェクト概要
矯正歯科クリニックの中立比較ポータル「患者の味方」
患者がクリニックを比較・検討できる情報サイト

## ビジネスモデル
患者には完全無料。クリニック側からカウンセリング紹介料＋成約成功報酬を受け取る

## ターゲットユーザー
矯正を検討中の20〜40代。費用・期間・クリニック選びに不安を持つ患者

---

## 技術スタック
- フレームワーク：React（Vite）
- スタイリング：Tailwind CSS
- ルーティング：React Router
- デプロイ先：Vercel
- データ：`src/data/clinics_real.js`（静的データ）

## ファイル構成
- `src/App.jsx`：ルーティング定義
- `src/pages/ClinicList.jsx`：クリニック一覧ページ
- `src/pages/ClinicDetail.jsx`：クリニック詳細ページ
- `src/pages/ConsultationForm.jsx`：無料相談フォーム
- `src/pages/ClinicAdmin.jsx`：管理ページ
- `src/components/Header.jsx`：共通ヘッダー
- `src/components/StarRating.jsx`：星評価コンポーネント
- `src/data/clinics_real.js`：クリニックデータ

---

## 開発ルール
- コードを変更したら、必ず最後に `git add -A && git commit -m "説明" && git push` まで実行する
- commitメッセージは日本語でOK
- コメントは日本語
- 変更は差分で示す（全体の貼り直し不要）
- 提案は1つに絞る

## NGワード
「絶対」「必ず」「No.1」「最安値」など誇大表現全般
クリニック名・個人名をコードやコメントに含めない
