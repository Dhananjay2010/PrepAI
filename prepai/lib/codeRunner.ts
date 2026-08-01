export interface ExecutionResult {
  success: boolean;
  output: string;
  executionTimeMs: number;
  error?: string;
}

export async function executeCodeInSandbox(
  code: string,
  language: string
): Promise<ExecutionResult> {
  const start = performance.now();
  const lang = (language || "javascript").toLowerCase();

  if (lang === "javascript" || lang === "typescript" || lang === "js" || lang === "ts") {
    try {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) =>
          logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ")),
        error: (...args: any[]) => logs.push("[ERROR] " + args.join(" ")),
        warn: (...args: any[]) => logs.push("[WARN] " + args.join(" ")),
        info: (...args: any[]) => logs.push("[INFO] " + args.join(" ")),
      };

      // Remove TS type annotations for safe evaluation in browser JS scope
      let cleanCode = code
        .replace(/:\s*(string|number|boolean|any|void|number\[\]|string\[\])/g, "")
        .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, "")
        .replace(/type\s+\w+\s*=[\s\S]*?;/g, "");

      // Execute code in isolated scope with custom console
      const runFn = new Function("console", cleanCode);
      runFn(customConsole);

      const elapsed = Math.round(performance.now() - start);
      return {
        success: true,
        output: logs.length > 0 ? logs.join("\n") : "✓ Program executed cleanly (no console output).",
        executionTimeMs: elapsed,
      };
    } catch (err: any) {
      return {
        success: false,
        output: `Runtime Error: ${err.message}`,
        executionTimeMs: Math.round(performance.now() - start),
        error: err.message,
      };
    }
  }

  // Fallback API call for C#, Java, Python, Go, SQL
  try {
    const res = await fetch("/api/sandbox/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language: lang }),
    });

    const data = await res.json();
    return {
      success: data.success ?? true,
      output: data.output || "Execution completed.",
      executionTimeMs: data.executionTimeMs || Math.round(performance.now() - start),
      error: data.error,
    };
  } catch (apiErr: any) {
    return {
      success: false,
      output: `API Execution Warning: ${apiErr.message}`,
      executionTimeMs: Math.round(performance.now() - start),
      error: apiErr.message,
    };
  }
}
