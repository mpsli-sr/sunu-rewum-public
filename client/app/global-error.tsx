"use client";
export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body>
        <div style={{ padding: 20, textAlign: "center" }}>
          <h2>Une erreur est survenue</h2>
          <p>{error.message}</p>
        </div>
      </body>
    </html>
  );
}
