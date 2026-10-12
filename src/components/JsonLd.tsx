export function JsonLd({
  data,
}: {
  data:
    | Record<string, unknown>
    | null
    | undefined
    | Array<Record<string, unknown> | null | undefined>;
}) {
  const payload = (Array.isArray(data) ? data : [data]).filter(
    (x): x is Record<string, unknown> => x != null && typeof x === "object"
  );
  if (payload.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload),
      }}
    />
  );
}
