import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('sanity-preview-secret');
  const pathname = searchParams.get('sanity-preview-pathname') ?? '/';

  if (!secret || secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid secret', { status: 401 });
  }

  (await draftMode()).enable();
  redirect(pathname);
}
