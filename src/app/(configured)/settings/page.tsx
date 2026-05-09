import { config } from "@/lib/config";
import { SettingsForm } from "./SettingsForm";
import { DisconnectButton } from "./DisconnectButton";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const { dataFile, ...settings } = config.get();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-stone-900 mb-6">Settings</h1>
        <SettingsForm initial={settings} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-1">Data file</h2>
        <p className="text-xs text-stone-400 font-mono mb-3 break-all">{dataFile}</p>
        <DisconnectButton />
      </div>
    </div>
  );
}
