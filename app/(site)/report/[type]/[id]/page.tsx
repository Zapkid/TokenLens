import Link from "next/link";
import { Card } from "@/components/ui";
import { ReportView } from "@/components/report/ReportView";
import { generateReport } from "@/lib/report/pipeline";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ refresh?: string }>;
}) {
  const { type, id } = await params;
  const { refresh } = await searchParams;

  if (type !== "token" && type !== "chain") {
    return (
      <Card>
        <p className="text-sm">Unknown report type. Expected token or chain.</p>
      </Card>
    );
  }

  try {
    const report = await generateReport(type, decodeURIComponent(id), {
      refresh: refresh === "1",
    });
    return <ReportView report={report} />;
  } catch (e) {
    return (
      <Card>
        <h1 className="text-lg font-semibold">Report generation failed</h1>
        <p className="mt-2 text-sm text-ink-2">
          {e instanceof Error ? e.message : "Unknown error"}
        </p>
        <p className="mt-2 text-sm text-ink-2">
          This can happen when the data providers are unreachable from this
          deployment or the asset id is not resolvable.{" "}
          <Link className="underline" href="/">
            Back to search
          </Link>
        </p>
      </Card>
    );
  }
}
