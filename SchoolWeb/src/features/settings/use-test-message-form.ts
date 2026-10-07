import { useState } from "react";
import { useWatch } from "react-hook-form";
import { useServerForm } from "@/lib/use-server-form";
import { sendTestMessage } from "./support-api";
import { testMessageSchema, type TestMessageResult, type TestMessageValues } from "./test-message-schema";

/** Settings › Support "Send test message": shows the provider's answer inline. */
export function useTestMessageForm() {
  const [result, setResult] = useState<TestMessageResult | null>(null);
  const server = useServerForm<TestMessageValues, Awaited<ReturnType<typeof sendTestMessage>>>({
    schema: testMessageSchema,
    defaultValues: { channel: "EMAIL", to: "" },
    onSubmit: (values) => {
      setResult(null);
      return sendTestMessage({ ...values, to: values.to.trim() });
    },
    onSuccess: (response) => setResult(response.data),
  });
  const channel = useWatch({ control: server.form.control, name: "channel" });
  return { ...server, channel, result };
}
