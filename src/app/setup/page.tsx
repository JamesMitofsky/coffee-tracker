import { SetupClient } from "./SetupClient";
import os from "os";

export default function SetupPage() {
  const home = os.homedir();
  const suggestedPath = `${home}/Documents/coffee-brews.json`;
  return <SetupClient suggestedPath={suggestedPath} />;
}
