export async function GET() {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const hasPublishable = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
    const hasSecret = Boolean(process.env.CLERK_SECRET_KEY);

    // If not in production and Clerk keys aren't present, consider keyless dev mode
    const clerkKeyless = !isProd && !(hasPublishable && hasSecret);

    return new Response(JSON.stringify({ clerkKeyless }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ clerkKeyless: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
