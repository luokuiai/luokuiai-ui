export function GET() {
  return Response.json({ configured: false, provider: null, providerLabel: null, model: null })
}
