# 患者の味方スコア設計仕様

## 概要

患者口コミの5軸スコアから重み付き平均を計算し、
Supabase の `clinics.score` カラム（JSONB）に格納する。

---

## スコアの5軸

| 軸 | フィールド名 | 重み | 説明 |
|---|---|---|---|
| 料金の透明性 | `price_transparency` | 1.3 | 総額の明示、追加費用の有無 |
| 技術・仕上がり | `skill` | 1.2 | 治療結果の品質 |
| 説明・ホスピタリティ | `hospitality` | 1.0 | スタッフ・医師の対応 |
| プロセスの誠実さ | `process_integrity` | 1.3 | 見積もり通りの進行、信頼性 |
| 総合満足度 | `overall_satisfaction` | 1.2 | 患者の総合的な満足度 |

各軸 1〜5 点。口コミが 0 件のクリニックは `null`。

---

## 計算フロー

```
clinics_real.js の reviews[].scores
        │
        ▼
calcAiScore() in seedClinics.js
  1. 各軸の口コミ平均を算出
  2. 重み付き平均で total を計算
        │
        ▼
Supabase clinics.score（JSONB）
  {
    total: 4.2,
    price_transparency: 4.3,
    skill: 4.5,
    hospitality: 4.0,
    process_integrity: 4.3,
    overall_satisfaction: 4.5
  }
        │
        ▼
mapFromDb() → clinic.score
        │
        ▼
ClinicDetail.jsx の subScores 表示
  clinic.score?.price_transparency ?? 3
```

---

## Supabase への反映手順

### 1. score カラムを追加（初回のみ）

Supabase の SQL Editor で以下を実行：

```
src/lib/addScoreColumn.sql
```

### 2. データを投入

デプロイ後、ブラウザで `/supabase-test` を開き
「シードデータを投入する」ボタンをクリック。

`seedClinics()` が実行され、`calcAiScore()` で計算した
スコアが `clinics.score` に upsert される。

### 3. 確認

`/clinic/:id` を開き、患者の味方スコアカードの数値が
「3.0」固定でなく、口コミから計算された値になっていることを確認。

---

## 口コミデータの追加方法

`src/data/clinics_real.js` の各クリニックの `reviews` 配列に
以下の形式で追加し、再シードする：

```js
{
  id: "r001",
  author: "30代女性",
  date: "2025-11",
  treatment: "マウスピース矯正",
  duration_months: 18,
  total_cost_man: 88,
  scores: {
    price_transparency: 4,
    skill: 5,
    hospitality: 4,
    process_integrity: 4,
    overall_satisfaction: 5,
  },
  comment: "コメント本文",
  verified: true,
}
```

---

## ファイル一覧

| ファイル | 役割 |
|---|---|
| `src/data/clinics_real.js` | 口コミ・クリニックデータのマスター |
| `src/lib/seedClinics.js` | calcAiScore・mapClinic・seedClinics 実装 |
| `src/lib/addScoreColumn.sql` | Supabase への score カラム追加 SQL |
| `src/pages/SupabaseTest.jsx` | シード実行用管理ページ（`/supabase-test`） |
| `src/pages/ClinicDetail.jsx` | スコア表示（`clinic.score?.xxx ?? 3`） |
