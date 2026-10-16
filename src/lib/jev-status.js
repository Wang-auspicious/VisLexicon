// Shared safe status vocabulary. Never render raw upstream errors or messages.
export function jevErrorMessage(code, en = false) {
  if (code === 'JEV_TUNNEL_DISCONNECTED') return en ? 'Jev is not connected (tunnel is closed).' : 'Jev 未连接（隧道未开）'
  if (code === 'JEV_DISABLED' || code === 'LOCAL_CREDENTIAL_UNAVAILABLE') return en ? 'Jev is not connected.' : 'Jev 未连接'
  if (code === 'MODEL_BUSY' || code === 'JEV_QUEUE_TIMEOUT') return en ? 'Jev is busy. Please try again shortly.' : 'Jev 正忙，请稍后重试'
  return en ? 'Jev is temporarily unavailable. Please retry.' : 'Jev 暂不可用，请稍后重试'
}
