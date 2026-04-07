import { useState } from 'react';
import Header from '../components/Header';

// アコーディオンセクション
function Section({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-xl px-5 py-4 transition"
      >
        <span className="text-xl font-bold text-gray-800">{title}</span>
        <span className="text-2xl text-gray-500 leading-none select-none">
          {open ? '−' : '＋'}
        </span>
      </button>
      {open && <div className="mt-4 space-y-8 px-1">{children}</div>}
    </div>
  );
}

// 条文ブロック
function Article({ number, title, children }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-800 text-base mb-2">
        第{number}条：{title}
      </h3>
      <div className="text-gray-700 text-base leading-relaxed pl-1">
        {children}
      </div>
    </div>
  );
}

// リスト
function Ul({ items }) {
  return (
    <ul className="list-disc list-inside space-y-1 mt-1">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function Policy() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <Header showBack backTo="/" title="掲載基準・中立性ポリシー" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* ページタイトル */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          投稿情報掲載基準・中立性ポリシー
          <span className="block text-lg font-normal text-gray-500 mt-1">
            （矯正歯科版）
          </span>
        </h1>

        {/* ブランドメッセージ */}
        <div className="text-center text-gray-600 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          <p>
            ClinicCompassは、感情的な「良かった・悪かった」よりも、
            <br className="hidden sm:inline" />
            比較に役立つ事実情報を大切にしています。
          </p>
          <p className="mt-3">
            矯正治療は高額で長期間にわたるからこそ、
            <br className="hidden sm:inline" />
            費用、説明、リスク、通院条件などをできるだけ透明にし、
            <br className="hidden sm:inline" />
            未来の患者さんの意思決定に役立つ情報だけを公開します。
          </p>
        </div>

        {/* 第0条 */}
        <div className="mb-10 bg-gray-50 rounded-xl p-5 sm:p-6">
          <h3 className="font-semibold text-gray-800 text-base mb-2">
            第0条：本書の目的
          </h3>
          <p className="text-gray-700 text-base leading-relaxed">
            ClinicCompassは、矯正歯科を検討する患者が、広告色の強い情報や印象論だけに頼らず、比較可能な事実情報に基づいて意思決定できる環境を整えることを目的とします。本サービスは、特定の医療機関への誘引を目的とした広告媒体ではなく、患者の比較検討を支援する情報基盤であることを基本姿勢とします。
          </p>
        </div>

        {/* 第1条 */}
        <div className="mb-10 bg-gray-50 rounded-xl p-5 sm:p-6">
          <h3 className="font-semibold text-gray-800 text-base mb-2">
            第1条：用語の定義
          </h3>
          <Ul
            items={[
              '「投稿情報」＝患者又はその家族から提供される、受診・相談・見積取得・費用・通院条件等に関する情報',
              '「感想」＝満足・不満・安心感などの主観的評価',
              '「構造化」＝自由記述を料金・治療方針・予約・リスク説明などの比較項目に整理する行為',
              '「クリニック関係者」＝院長、勤務医、スタッフ、業務委託先、代理店等',
            ]}
          />
        </div>

        {/* 第I部 */}
        <Section title="第I部：投稿情報掲載基準" defaultOpen>
          <Article number={2} title="基本方針">
            <Ul
              items={[
                '掲載対象は患者の比較検討に資する具体的・検証可能な情報を原則とする',
                '特定のクリニックを有利又は不利に見せる編集は行わない',
                '治療結果を保証する表現、医師の優秀性を断定する表現は掲載しない',
                '広告料、紹介料、営業関係の有無は掲載可否・点数・順位に影響しない',
              ]}
            />
          </Article>

          <Article number={3} title="掲載対象となる情報">
            <Ul
              items={[
                '初診相談の流れ、相談時間、検査の有無と内容',
                '料金項目（初診料、検査料、基本料、装置料、調整料、保定装置料、追加費用、分割条件等）',
                '治療方針（抜歯提案、装置種類、治療期間、通院頻度、転院時の扱い等）',
                'リスク・副作用の説明の有無と内容',
                '予約の取りやすさ、待ち時間、診療時間帯',
                '返金・解約・中途終了の取扱い',
              ]}
            />
          </Article>

          <Article number={4} title="掲載しない情報">
            <Ul
              items={[
                '「絶対に治る」等の治療効果保証・断定',
                '「日本一」「最高」等の優良誤認表現',
                '誹謗中傷、差別的表現',
                '未確認の噂、伝聞',
                'なりすまし、組織的投稿',
                '特典と引き換えの高評価投稿',
              ]}
            />
          </Article>

          <Article number={5} title="体験談・感想の扱い">
            <Ul
              items={[
                '感想は補足情報として位置づけ、事実情報と切り分けて表示',
                '感想のみの投稿は原則非掲載',
                '治療効果を強く印象づける表現は非掲載または要修正',
              ]}
            />
          </Article>

          <Article number={6} title="投稿者確認と掲載判断">
            <Ul
              items={[
                '必要に応じて受診時期等の追加確認を行う',
                '確認不十分な場合は掲載見送り',
                '同一人物の複数投稿、作為的な評価誘導は審査強化',
              ]}
            />
          </Article>

          <Article number={7} title="編集・AI利用の開示">
            <Ul
              items={[
                '投稿情報の要約・構造化・表記ゆれ補正にAIを補助的に使用する場合がある',
                'AIの提案内容はそのまま自動掲載せず、最終判断は人が行う',
                '投稿者の意図を不当に歪める編集は行わない',
              ]}
            />
          </Article>

          <Article number={8} title="謝礼・インセンティブの取扱い">
            <Ul
              items={[
                '謝礼は好意的な口コミの対価ではなく、事実情報の提供協力に対する一律の謝礼',
                '謝礼の有無は評価・点数・掲載可否・順位に影響しない',
                'ポジティブ・ネガティブいずれにも偏らない同一条件',
                '謝礼実施時はその旨をポリシー上で明示',
                'クリニックが独自に患者へ便益を提供して投稿を促した場合は非掲載・削除',
              ]}
            />
          </Article>

          <Article number={9} title="評価表示のルール">
            <Ul
              items={[
                '投稿0件の場合、点数・星評価は表示しない',
                '件数が少ない場合は「参考値」である旨を併記',
                '広告・送客契約の有無で評価表示は変動しない',
              ]}
            />
          </Article>

          <Article number={10} title="表示順位">
            <Ul
              items={[
                '広告料・紹介料で表示順位を変えない',
                '表示順は検索条件、情報充実度、更新状況等の客観的基準に基づく',
              ]}
            />
          </Article>

          <Article number={11} title="訂正・削除">
            <Ul
              items={[
                '投稿者本人またはクリニックから事実誤認の申告があった場合、確認のうえ対応',
                '患者の比較検討上重要な情報まで一律に削除はしない',
              ]}
            />
          </Article>

          <Article number={12} title="内部運用ルール（A〜D分類）">
            <div className="space-y-1 mt-1">
              <p>
                <span className="font-semibold">A 掲載可：</span>
                比較可能な事実情報が中心
              </p>
              <p>
                <span className="font-semibold">B 条件付き：</span>
                感想含むが事実情報も十分
              </p>
              <p>
                <span className="font-semibold">C 非掲載：</span>
                誇大、断定、誹謗中傷、誘導投稿
              </p>
              <p>
                <span className="font-semibold">D 要エスカレーション：</span>
                法的クレーム、医療事故主張、個人情報
              </p>
            </div>
          </Article>
        </Section>

        {/* 第II部 */}
        <Section title="第II部：中立性ポリシー">
          <Article number={13} title="基本宣言">
            <p>
              ClinicCompassは、患者の比較検討を支援する立場を優先し、広告主又は医療機関の意向から独立して判断を行う。
            </p>
          </Article>

          <Article number={14} title="収益と表示の分離">
            <Ul
              items={[
                '収益構造の有無は掲載基準・順位・点数・要約に影響しない',
                'クリニックからの依頼でネガティブ情報を不当に削除したりポジティブに書き換えたりしない',
              ]}
            />
          </Article>

          <Article number={15} title="紹介料・送客料の考え方">
            <Ul
              items={[
                'クリニックごとに金額差を設けて表示を変える運用は行わない',
                '基本原則は「全クリニック同一条件」「順位は販売しない」「掲載可否は基準準拠」',
              ]}
            />
          </Article>

          <Article number={16} title="クリニック関係者からの介入禁止">
            <Ul
              items={[
                '投稿内容・点数・順位への直接介入不可',
                '訂正依頼は事実誤認等の正当な目的に限り受付',
              ]}
            />
          </Article>

          <Article number={17} title="データ収集の原則">
            <Ul
              items={[
                '一次情報に基づいて整理',
                '情報が不完全な場合はその不完全性自体を表示し、推測で補完しない',
              ]}
            />
          </Article>

          <Article number={18} title="透明性の開示">
            <Ul
              items={[
                '掲載基準、中立性ポリシー、AI利用の有無と範囲を公開',
              ]}
            />
          </Article>

          <Article number={19} title="利益相反管理">
            <Ul
              items={[
                '営業担当と編集担当の役割は可能な範囲で分離',
                '利益相反の疑いがある案件は運用責任者レビュー対象',
              ]}
            />
          </Article>

          <Article number={20} title="サービスの立ち位置">
            <p>
              ClinicCompassは医療行為を行う者ではなく、診断・治療の決定主体でもない。掲載情報は患者の検討補助を目的とし、最終的な医療判断・契約判断は患者自身が行うものとする。
            </p>
          </Article>
        </Section>

        {/* 第III部 */}
        <Section title="第III部：広告・PR情報の取扱い">
          <Article number={21} title="PRエリアの運用">
            <Ul
              items={[
                'クリニックが作成した広告・PR情報を掲載する枠を設ける場合がある',
                'PRエリアの情報は比較情報とは性質を異にする',
                '法令、医療広告ガイドラインへの適合確認を行い、不適切な表現は掲載しない',
                '患者体験談、症例写真、誇大表現は掲載を制限することがある',
              ]}
            />
          </Article>

          <Article number={22} title="PRエリアの分離表示">
            <Ul
              items={[
                '比較情報と視覚的・構造的に明確に区別して表示',
                '「広告｜クリニック提供情報」を冒頭に明瞭表示',
              ]}
            />
            <p className="mt-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              注記：「この情報はクリニックが作成したPR情報です。当社の評価、掲載基準、順位付けとは独立しています。」
            </p>
          </Article>

          <Article number={23} title="比較ロジックとの非連動">
            <Ul
              items={[
                'PRエリアの有無は掲載順位・評価点数・比較表・推奨表示に影響しない',
                'PRエリアの情報は評価・スコアリングの根拠として用いない',
                'PRエリアを利用していないクリニックも公平に扱う',
              ]}
            />
          </Article>
        </Section>

        {/* 第IV部 */}
        <Section title="第IV部：歯科医院向けのご案内">
          <Article number={24} title="訂正依頼・お問い合わせ窓口">
            <p className="mb-2">
              歯科医院からの事実確認・訂正依頼を受け付けます。
            </p>
            <p className="font-semibold text-gray-800 mb-1">
              問い合わせ時の必要情報：
            </p>
            <Ul
              items={[
                '医院名 / 担当者名 / 役職',
                '対象ページURL',
                '訂正希望箇所と理由',
                '根拠資料',
              ]}
            />
            <p className="mt-3">
              窓口：
              <a
                href="mailto:info@kanja-mikata.com"
                className="text-teal-600 underline"
              >
                info@kanja-mikata.com
              </a>
            </p>
          </Article>

          <Article number={25} title="改定">
            <p>
              本ポリシーは法令・ガイドライン・運用実態の変更に応じて改定することがあります。
            </p>
          </Article>
        </Section>

        {/* フッター */}
        <div className="border-t border-gray-200 mt-10 pt-6 text-sm text-gray-500 space-y-1">
          <p>制定日：2026年3月27日</p>
          <p>
            参考：厚生労働省「医療広告ガイドライン」、消費者庁ステマ規制関連資料
          </p>
        </div>
      </div>
    </div>
  );
}
