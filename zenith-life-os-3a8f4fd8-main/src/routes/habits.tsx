import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "../components/Dashboard";

export const Route = createFileRoute("/habits")({
  head: () => ({ meta: [{ title: "Zenith — العادات" }] }),
  component: () => <Placeholder title="العادات" />,
});
