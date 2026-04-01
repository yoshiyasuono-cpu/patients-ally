# MedBase プロジェクト（patients-ally）

## 概要
自由診療の透明性インフラ「MedBase」のメインアプリケーション。
矯正歯科を起点に、クリニック比較・患者口コミ・実態調査を提供する。

Vercelにデプロイ中のReactアプリ（cliniccompass.jp）と、
Supabase（PostgreSQL）をバックエンドに使用。

## 作業ルール（※必ずこのルールに従うこと）

### 🟢 作業開始時（セッション開始で必ず実行）
1. `git pull origin main` を実行して最新コードを取得
2. コンフリクトがあれば報告して指示を待つ
3. 「前回の作業ログ」を読んで文脈を把握
4. 「前回○○をしました。今日は何をしますか？」と確認

### 🔴 作業終了時（「終わり」「pushして」「今日はここまで」等の発言で実行）
1. 「前回の作業ログ」を今回の内容で上書き更新
2. 「現在の状態」セクションも必要に応じて更新
3. `git add -A` → `git commit` → `git push`
4. push完了を報告

## 前回の作業ログ
- 作業日：2026-04-01
- 作業内容：医院詳細ページ改修 v3（ClinicDetail.jsx / ClinicDemoDetail.jsx）
  - TransparencySection.jsx 新設（透明性データ・n件数別バッジ・全体平均比較）
  - PatientCommentsSection.jsx 新設（審査済みコメント表示・モックデータ）
  - SurveyInlineForm.jsx 新設（Q1〜Q8＋確認問題＋自由記述・survey_responsesへINSERT・送信後完了メッセージ）
  - ClinicDetail: セクション4〜6追加、「口コミを投稿」→「あなたの経験を教えてください」(#survey-formへスクロール)
  - ClinicDemoDetail: 同3セクション追加、患者レビューセクションにボタン追加
  - sql/create_survey_response_tables.sql 作成（survey_responses / reward_claims / RLS）
  - Vercel（git push）+ XServer（FTPS）両方デプロイ完了
- 次回やること：
  - Supabase SQL Editorで create_survey_response_tables.sql を実行
  - patients-ally.vercel.app/clinics/nao で動作確認
  - 謝礼フォームURLが決まったら SurveyInlineForm.jsx の「QUOカードPay受け取り」リンクを差し替え
  - 透明性データのSupabase RPC（集計関数）実装（現在はモックデータ固定）

## 3サイト構成（MedBaseファミリー）

| サイト | ドメイン | 役割 | ホスティング |
|---|---|---|---|
| MedBase | medbase.jp | 親ブランド・基盤 | XServer（静的LP） |
| ClinicCompass | cliniccompass.jp | 患者向け比較サービス | Vercel → XServerにビルドも配置 |
| 矯正データラボ | kyoseidatalab.jp | 実態調査・統計 | XServer（静的LP） |

## 技術スタック

### フロントエンド（このリポジトリ）
- React 19.2.4
- React Router 7.13.1
- Vite 8.0.1
- Tailwind CSS 4.2.2
- Recharts 3.8.0（グラフ表示）

### バックエンド
- Supabase（PostgreSQL + Auth + RLS）
- プロジェクトURL：https://puzxthgbrjasyvpsubbb.supabase.co
- 環境変数は `.env` で管理（Git管理外）

### デプロイ
- Vercel（patients-allyプロジェクト）
- XServerにもビルド済みファイルを配置（cliniccompass.jp/public_html/）
- `npm run build` → `dist/` を生成

## ファイル構成
```
patients-ally/
├── src/
│   ├── App.jsx              # ルーティング定義
│   ├── main.jsx             # エントリーポイント
│   ├── index.css            # グローバルCSS（Tailwind）
│   ├── lib/
│   │   └── supabase.js      # Supabaseクライアント初期化
│   ├── pages/
│   │   ├── ClinicList.jsx   # クリニック一覧（トップページ）
│   │   ├── ClinicDetail.jsx # クリニック詳細ページ
│   │   ├── ConsultationForm.jsx # 相談フォーム
│   │   ├── ClinicAdmin.jsx  # クリニック管理画面
│   │   ├── ReviewForm.jsx   # 口コミ投稿フォーム
│   │   ├── Survey.jsx       # 患者アンケート
│   │   ├── ForClinics.jsx   # クリニック向けページ
│   │   ├── Policy.jsx       # プライバシーポリシー
│   │   └── SupabaseTest.jsx # Supabase接続テスト
│   ├── components/
│   │   ├── Header.jsx       # 共通ヘッダー
│   │   └── StarRating.jsx   # 星評価コンポーネント
│   └── data/
│       ├── clinics.js       # クリニックデータ（静的）
│       └── clinics_real.js  # クリニック実データ（静的）
├── sql/
│   ├── reset_and_create_tables.sql  # DB全テーブル作成
│   ├── insert_clinics.sql           # クリニックデータ投入
│   ├── insert_clinics_additional.sql # 追加データ投入
│   ├── recreate_surveys.sql         # surveysテーブル再作成
│   └── alter_reviews_add_status.sql # reviewsにカラム追加
├── public/                  # 静的ファイル
├── dist/                    # ビルド出力（Git管理外推奨）
├── vercel.json              # Vercel設定（SPA rewrites）
├── vite.config.js
├── package.json
└── .env                     # Supabase接続情報（Git管理外）
```

## ルーティング

| パス | コンポーネント | 機能 |
|---|---|---|
| `/` | ClinicList | クリニック一覧・検索 |
| `/clinic/:id` | ClinicDetail | クリニック詳細・口コミ表示 |
| `/consult` | ConsultationForm | 無料相談フォーム |
| `/review` | ReviewForm | 口コミ投稿 |
| `/survey` | Survey | 患者アンケート |
| `/clinic-admin` | ClinicAdmin | クリニック管理（認証必要） |
| `/for-clinics` | ForClinics | クリニック向け案内 |
| `/policy` | Policy | プライバシーポリシー |
| `/supabase-test` | SupabaseTest | DB接続テスト |

## Supabase DBスキーマ

### clinics（クリニック情報）
- id, name, area, address, station, tel, url
- fee_min, fee_max, fee_note, total_fee
- wire_available, invisalign_available, risk_description
- RLS: 読み取り=全員、書き込み=認証済み

### reviews（患者口コミ）
- id, clinic_id(FK), nickname, treatment_type
- estimate_amount, actual_amount, extra_cost_occurred
- explanation_clarity(1-5), price_transparency(1-5), pushed_to_sign(1-5)
- risk_explained, comment_good, comment_bad, verified
- RLS: 読み取り=全員、投稿=全員

### surveys（患者アンケート）
- id, age_group, gender, concern, priority
- budget_min, budget_max, preferred_type, fear, visited_count
- RLS: 投稿=全員、読み取り=認証済み

## 現在の状態

### 完成済み
- Reactフロントエンド全ページ実装・Vercelデプロイ
- Supabase DB設計・テーブル作成・RLS設定
- クリニックデータ投入（東京都内）
- 口コミ投稿・表示機能
- アンケート収集フォーム
- XServerにもビルド済みファイル配置

### 未解決の課題
- medbase.jp / kyoseidatalab.jp はまだ静的LPのみ（Supabase未連携）
- 3サイトのsend.phpにスパム対策・PHPMailer未導入（xserver-sitesプロジェクトで対応）
- 統計データの自動集計・表示機能
- クリニック管理画面の認証フロー

## 関連リポジトリ
- **xserver-sites**: XServer上の全サイト管理（send.php、LP等）
  - https://github.com/yoshiyasuono-cpu/xserver-sites
- **patients-ally**: このリポジトリ（ClinicCompass本体）
  - https://github.com/yoshiyasuono-cpu/patients-ally

## 注意事項
- `.env` にSupabaseのURL・AnonKeyが入っている。絶対にコミットしない
- `dist/` はビルド成果物。基本的にGit管理しない
- XServerの `cliniccompass.jp/public_html/assets/` にはビルド済みファイルを手動配置している
- SQLファイルはSupabase SQL Editorで実行する（マイグレーションツール未導入）
