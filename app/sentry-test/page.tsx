"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Test Page
 *
 * Use this page to verify Sentry is correctly configured and capturing errors.
 *
 * Expected behavior after clicking "Trigger Error":
 * 1. Error appears in Sentry dashboard
 * 2. Event tagged with release (VERCEL_GIT_COMMIT_SHA)
 * 3. Sourcemaps resolve correctly (you see actual source code, not minified)
 * 4. Event routed through /monitoring tunnel (check Network tab)
 * 5. request_id tag present if using observability helpers
 *
 * After testing, remove this route or protect with auth.
 */
export default function SentryTestPage() {
  const [testResult, setTestResult] = useState<string>("");

  const triggerError = () => {
    try {
      setTestResult("Throwing error...");
      // This will be captured by Sentry
      throw new Error("Sentry Test Error - Client Side");
    } catch (error) {
      Sentry.captureException(error);
      setTestResult("Error thrown! Check Sentry dashboard.");
    }
  };

  const triggerMessage = () => {
    setTestResult("Sending message...");
    Sentry.captureMessage("Sentry Test Message - Client Side", "info");
    setTestResult("Message sent! Check Sentry dashboard.");
  };

  const triggerTransaction = () => {
    setTestResult("Starting transaction...");
    Sentry.startSpan(
      {
        name: "test-transaction",
        op: "test",
      },
      () => {
        // Simulate some work
        const start = Date.now();
        while (Date.now() - start < 100) {
          // Busy wait
        }
      }
    );
    setTestResult("Transaction completed! Check Sentry Performance.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">Sentry Test Page</h1>
        <p className="text-gray-600 mb-8">
          Use these buttons to verify Sentry integration. Check the Sentry
          dashboard for captured events.
        </p>

        <div className="space-y-4">
          <button
            onClick={triggerError}
            className="w-full px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition"
          >
            Trigger Client Error
          </button>

          <button
            onClick={triggerMessage}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            Send Test Message
          </button>

          <button
            onClick={triggerTransaction}
            className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition"
          >
            Test Performance Tracking
          </button>

          {testResult && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <p className="text-sm font-mono">{testResult}</p>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h2 className="font-semibold text-yellow-900 mb-2">
            Verification Checklist
          </h2>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>✓ Error appears in Sentry Issues</li>
            <li>✓ Release tag matches commit SHA</li>
            <li>✓ Sourcemaps resolve correctly</li>
            <li>✓ Events routed through /monitoring</li>
            <li>✓ No errors in browser console</li>
          </ul>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>
            <strong>Note:</strong> Remove or protect this route before deploying
            to production.
          </p>
        </div>
      </div>
    </div>
  );
}
