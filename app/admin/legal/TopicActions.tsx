"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLegalTopicPublished, deleteLegalTopic } from "./actions";

// Внутренний кураторский тул — интерфейс на английском (не пользовательский).
export default function TopicActions({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(fn: () => Promise<unknown>, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setLegalTopicPublished(id, !published))}
        className={published ? "btn-ghost" : "btn-primary"}
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => deleteLegalTopic(id), "Delete this topic?")}
        className="btn-danger"
      >
        Delete
      </button>
    </div>
  );
}
