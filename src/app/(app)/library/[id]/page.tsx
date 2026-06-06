import { LibraryBrowser } from "@/components/LibraryBrowser";

export const metadata = { title: "Support Library — ZenSpace" };

/** Deep link that opens straight into a specific guided session. */
export default function LibraryItemPage({
  params,
}: {
  params: { id: string };
}) {
  return <LibraryBrowser initialOpenId={params.id} />;
}
