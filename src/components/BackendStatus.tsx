"use client";

import { useEffect, useState } from "react";
import { backendGet, ApiError } from "@/lib/api";

type Health = {
  status?: string;
  [key: string]: unknown;
};

type ConnState =
  | { state: "checking" }
  | { state: "ok"; health: Health }
  | { state: "error"; message: string };

/**
 * Dev-only widget that pings the backend's Spring Boot Actuator health
 * endpoint through the /api/backend proxy. This is just to prove the
 * frontend <-> backend wiring works end to end — swap it out once you're
 * calling real product/order endpoints elsewhere.
 *
 * Requires the backend to be running locally with
 * management.endpoints.web.exposure.include: "*" (already set in
 * application.yml), so GET /kisaan/actuator/health should respond.
 */
export default function BackendStatus() {
  const [conn, setConn] = useState<ConnState>({ state: "checking" });

  useEffect(() => {
    let cancelled = false;

    backendGet<Health>("/actuator/health")
      .then((health) => {
        if (!cancelled) setConn({ state: "ok", health });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? `Backend responded with ${err.status}`
            : err instanceof Error
              ? err.message
              : "Could not reach the backend";
        setConn({ state: "error", message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const style = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "1rem",
    padding: "0.5rem 0.9rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    border: "1px solid",
  } as const;

  if (conn.state === "checking") {
    return (
      <div style={{ ...style, borderColor: "#d1d5db", color: "#6b7280" }}>
        Checking backend connection…
      </div>
    );
  }

  if (conn.state === "ok") {
    return (
      <div style={{ ...style, borderColor: "#86efac", color: "#166534" }}>
        Backend connected — status: {String(conn.health.status ?? "UNKNOWN")}
      </div>
    );
  }

  return (
    <div style={{ ...style, borderColor: "#fca5a5", color: "#991b1b" }}>
      Backend not reachable: {conn.message}. Check that the Spring Boot app is
      running and BACKEND_ORIGIN in .env.local matches its port.
    </div>
  );
}
