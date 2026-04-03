'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Level 1 - "What is Learning?"
// A single-file React component you can drop into a Next.js page.
// Tailwind classes are used for quick styling (optional).

export default function Level1BakeML() {
  const router = useRouter();
  type Row = { id: number; customer_pref: string; time: string; label: string };
  type Rule = { feature: keyof Row | ""; op: string; value: string; result: string; id: number };
  type Prediction = { id: number; pred: string; matchedRule: Rule | null };

  const initialData: Row[] = [
    { id: 1, customer_pref: "sweet", time: "morning", label: "cinnamon roll" },
    { id: 2, customer_pref: "savory", time: "morning", label: "foccacia" },
    { id: 3, customer_pref: "sweet", time: "evening", label: "cinnamon roll" },
    { id: 4, customer_pref: "savory", time: "evening", label: "foccacia" },
    { id: 5, customer_pref: "sweet", time: "morning", label: "cinnamon roll" },
    { id: 6, customer_pref: "savory", time: "evening", label: "foccacia" }
  ];

  const [data] = useState<Row[]>(initialData);
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState<Rule>({
  feature: "",
  op: "",
  value: "",
  result: "",
  id: 0
});
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const isRuleComplete = Boolean(newRule.feature && newRule.op && newRule.value && newRule.result);

  function addRule() {
    if (!isRuleComplete) return;
    setRules((r) => [...r, { ...newRule, id: Date.now() }]);
  }

  function removeRule(id: number) {
    setRules((r) => r.filter((x) => x.id !== id));
  }

  function applyRules() {
    const preds = data.map((row) => {
      // apply rules in order
      for (const rule of rules) {
        if (!rule.feature || !rule.op || !rule.value || !rule.result) continue;
        if (rule.op === "==") {
          if (String(row[rule.feature as keyof Row]) === String(rule.value)) return { id: row.id, pred: rule.result, matchedRule: rule };
        } else if (rule.op === "!=") {
          if (String(row[rule.feature as keyof Row]) !== String(rule.value)) return { id: row.id, pred: rule.result, matchedRule: rule };
        }
      }
      return { id: row.id, pred: "unknown", matchedRule: null };
    });
    setPredictions(preds);
  }

  function computeAccuracy() {
    if (!predictions.length) return null;
    let correct = 0;
    for (const p of predictions) {
      const row = data.find((d) => d.id === p.id);
      if (row && p.pred === row.label) correct++;
    }
    return { correct, total: data.length, accuracy: (correct / data.length) * 100 };
  }

  const stats = computeAccuracy();

  useEffect(() => {
    if (!stats) return;
    try {
      localStorage.setItem(
        "bakeml.level1.score",
        JSON.stringify({
          correct: stats.correct,
          total: stats.total,
          accuracy: stats.accuracy,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore storage failures (private mode, disabled storage, etc.)
    }
  }, [stats?.correct, stats?.total, stats?.accuracy]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Level 1: What is Learning?</h1>
      <p className="mb-4">Help Clank by creating simple <strong>IF THEN</strong> rules. Rules are applied in order; Clank will repeat them exactly.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="font-semibold">Dataset (preview)</h2>
            <table className="w-full mt-2 table-auto text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="pr-4">id</th>
                  <th className="pr-4">customer_pref</th>
                  <th className="pr-4">time</th>
                  <th className="pr-4">label</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2">{r.id}</td>
                    <td className="py-2">{r.customer_pref}</td>
                    <td className="py-2">{r.time}</td>
                    <td className="py-2">{r.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold">Rules Builder</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              <strong>IF</strong>
              <select
                value={newRule.feature}
                onChange={(e) => setNewRule({ ...newRule, feature: e.target.value as keyof Row })}
                className="border rounded px-2 py-1"
              >
                <option value="">Select feature</option>
                <option value="customer_pref">customer_pref</option>
                <option value="time">time</option>
              </select>

              <select
                value={newRule.op}
                onChange={(e) => setNewRule({ ...newRule, op: e.target.value })}
                className="border rounded px-2 py-1"
              >
                <option value="">Select operator</option>
                <option value="==">IS</option>
                <option value="!=">IS NOT</option>
              </select>

              <select
                value={newRule.value}
                onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                className="border rounded px-2 py-1"
              >
                <option value="">Select value</option>
                {newRule.feature === "customer_pref" && (
                  <>
                    <option value="sweet">sweet</option>
                    <option value="savory">savory</option>
                  </>
                )}
                {newRule.feature === "time" && (
                  <>
                    <option value="morning">morning</option>
                    <option value="evening">evening</option>
                  </>
                )}
              </select>
              <strong>THEN BAKE</strong>

              <select
                value={newRule.result}
                onChange={(e) => setNewRule({ ...newRule, result: e.target.value })}
                className="border rounded px-2 py-1"
              >
                <option value="">Select bake</option>
                <option value="cinnamon roll">cinnamon roll</option>
                <option value="foccacia">foccacia</option>
              </select>

              <button
                onClick={addRule}
                disabled={!isRuleComplete}
                className="blue-bg text-white px-3 py-1 rounded disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Rule
              </button>
            </div>

            {!isRuleComplete && (
              <p className="mt-2 text-sm text-red-600">Please complete all rule fields before adding a rule.</p>
            )}

            <div className="mt-4">
              <h3 className="font-medium">Current Rules (applied top → bottom)</h3>
              <ul className="mt-2">
                {rules.map((r, i) => (
                  <li key={r.id} className="flex items-center justify-between border rounded px-3 py-2 mt-2">
                    <div>
                      <strong>{i + 1}.</strong> if <code>{r.feature}</code> {r.op} <code>{r.value}</code> → <em>{r.result}</em>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => removeRule(r.id)} className="text-sm red">Remove</button>
                    </div>
                  </li>
                ))}
                {!rules.length && <li className="text-sm text-gray-500 mt-2">No rules yet. Clank will do nothing.</li>}
              </ul>

              <div className="mt-4 flex gap-2">
                <button onClick={applyRules} className="red-bg text-white px-3 py-1 rounded">Apply Rules</button>
                <button onClick={() => { setRules([]); setPredictions([]); }} className="bg-gray-200 px-3 py-1 rounded">Reset</button>
              </div>
            </div>
          </div>
        </div>

        {predictions.length > 0 && (
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="font-semibold">Clank&apos;s Log</h2>
              <p className="text-sm mt-2">Clank will follow the rules you provide exactly. Use the dataset preview to find patterns and create simple IF THEN rules.</p>

              <div className="mt-3">
                <h3 className="font-medium">Predictions</h3>
                {!predictions.length && <p className="text-sm text-gray-500 mt-2">No predictions yet. Click <strong>Apply Rules</strong>.</p>}
                {predictions.length > 0 && (
                  <div className="mt-2 text-sm">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="text-xs text-gray-500 text-left">
                          <th className="pr-2">id</th>
                          <th className="pr-2">prediction</th>
                          <th className="pr-2">label</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictions.map((p) => {
                          const row = data.find((d) => d.id === p.id);
                          return (
                            <tr key={p.id} className="border-t">
                              <td className="py-1">{p.id}</td>
                              <td className="py-1">{p.pred}</td>
                              <td className="py-1">{row ? row.label : '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold">Bakery Simulation</h2>
              <div className="mt-3 text-sm">
                {stats ? (
                  <div>
                    <p>Correct: <strong>{stats.correct}</strong> / {stats.total}</p>
                    <p>Accuracy: <strong>{stats.accuracy.toFixed(1)}%</strong></p>
                  </div>
                ) : (
                  <p className="text-gray-500">Run predictions to see correctness.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {predictions.length > 0 && (
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/?completed=true')}
            className="brown-bg text-white px-4 py-2 rounded"
          >
            Go to Level 2
          </button>
        </div>
      )}
    </div>
  );
}
