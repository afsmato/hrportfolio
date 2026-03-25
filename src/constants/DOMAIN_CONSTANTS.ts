export const DOMAIN_CONSTANTS = {
  // ギャップスキル判定: スコアがこの値以下をギャップとみなす
  GAP_THRESHOLD: 2,

  // 棚卸しリマインダー: 最終評価からこの日数経過でリマインドを送信
  REVIEW_INTERVAL_DAYS: 90,

  // 成長実感アンケート: 初回スキルマップ完成日からこの日数後に表示
  // （フェーズ2ではサマリ生成ごとに実施するため、フェーズ1のみ適用）
  SURVEY_TRIGGER_DAYS: 90,
} as const;
