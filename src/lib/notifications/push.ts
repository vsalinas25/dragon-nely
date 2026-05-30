import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

interface PushPayload {
  title: string
  body: string
  icon?: string
  url?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendPush(subscription: any, payload: PushPayload) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        ...payload,
        icon: payload.icon ?? '/icons/icon-192.svg',
        badge: '/icons/badge-72.svg',
      })
    )
  } catch (err) {
    console.error('Push send error:', err)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendPushToAll(subscriptions: any[], payload: PushPayload) {
  await Promise.allSettled(subscriptions.map((sub) => sendPush(sub, payload)))
}
