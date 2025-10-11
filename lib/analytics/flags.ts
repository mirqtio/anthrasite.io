export const analyticsEnabled =
  /(1|true|on)/i.test(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS ?? '')
