// Shared safe status vocabulary. Never render raw upstream errors or messages.
export function jevErrorMessage(code, en = false) {
  if (code === 'JEV_TUNNEL_DISCONNECTED') return en ? 'Jev is not connected (tunnel is closed).' : 'Jev 未连接（隧道未开）'
  if (code === 'JEV_DISABLED' || code === 'LOCAL_CREDENTIAL_UNAVAILABLE') return en ? 'Jev is not connected.' : 'Jev 未连接'
  if (code === 'MODEL_BUSY' || code === 'JEV_QUEUE_TIMEOUT') return en ? 'Jev is busy. Please try again shortly.' : 'Jev 正忙，请稍后重试'
  // Public site: the shared rank function is capped; results below are the explicit-fact matches.
  if (code === 'RANK_DAILY_LIMIT') return en ? "Today's AI ranking quota is used up. Showing first-pass matches." : '今日 AI 精排额度已用完，以下是初筛结果'
  if (code === 'RANK_RATE_LIMITED') return en ? 'Too many requests. AI ranking will be back shortly; showing first-pass matches.' : '请求太频繁，AI 精排稍后再试；以下是初筛结果'
  if (code === 'RANK_UNAVAILABLE') return en ? 'AI ranking is unavailable. Showing first-pass matches.' : 'AI 精排暂不可用，以下是初筛结果'
  return en ? 'Jev is temporarily unavailable. Please retry.' : 'Jev 暂不可用，请稍后重试'
}
