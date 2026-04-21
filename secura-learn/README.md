This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Clerk Webhook Setup

SecuraLearn uses Clerk webhooks to sync user and organization data into the Prisma database. Follow these steps to register the webhook endpoint.

### Register the Endpoint

1. Navigate to **Clerk Dashboard → Webhooks → Add Endpoint**
2. Set the **Endpoint URL** to:
   ```
   https://{your-domain}/api/webhooks/clerk
   ```
3. Under **Subscribe to events**, select the following events:
   - `user.created`
   - `organization.created`
   - `organizationMembership.created`
4. Click **Create** to save the endpoint
5. Copy the **Signing Secret** (starts with `whsec_...`) and add it to your `.env.local`:
   ```bash
   CLERK_WEBHOOK_SECRET="whsec_..."
   ```

### Local Development

For local development, Clerk cannot reach `localhost` directly. Use a tunnel to expose your local server:

```bash
ngrok http 3000
```

Use the generated `https://` URL (e.g., `https://abc123.ngrok.io`) as the endpoint URL in the Clerk Dashboard instead of your production domain. Remember to update the endpoint URL each time ngrok generates a new tunnel address.
