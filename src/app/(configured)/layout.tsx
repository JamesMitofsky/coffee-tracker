import { redirect } from "next/navigation";
import { config } from "@/lib/config";

export default function ConfiguredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dataFile } = config.get();
  if (!dataFile) redirect("/setup");
  return <>{children}</>;
}
