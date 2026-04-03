'use client';

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";

// Level 3 - Decision Tree Prediction Puzzle for BakeML
export default function Level3BakeML() {
  type Row = {
    id: number;
    sweet: boolean;
    length: "long" | "short";
    round: boolean;
    _predicted?: string;
  };

  const initialData: Row[] = [
    { id: 1, sweet: true, length: "short", round: true },
    { id: 2, sweet: false, length: "long", round: true },
    { id: 3, sweet: true, length: "short", round: false },
    { id: 4, sweet: false, length: "short", round: false }
  ];

  const [data, setData] = useState<Row[]>(initialData);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [isTreeZoomed, setIsTreeZoomed] = useState(false);
  const [depthAnswer, setDepthAnswer] = useState<string>("");
  const [isEvaluationConfirmed, setIsEvaluationConfirmed] = useState(false);
  const possiblePredictions = ["Donut", "Croissant", "Baguette", "Sandwich Bread"];

  function applyPrediction(rowId: number, prediction: string) {
    setData(prev => prev.map(r => r.id === rowId ? { ...r, _predicted: prediction } : r));
    setSelectedRow(null);
    setIsEvaluationConfirmed(false);
  }

  // Decision logic for correct prediction
  function getCorrectPrediction(row: Row): string {
    if (row.sweet && row.round && row.length === "short") return "Donut";
    if (row.sweet && !row.round && row.length === "short") return "Croissant";
    if (!row.sweet && row.round && row.length === "long") return "Baguette";
    if (!row.sweet && !row.round && row.length === "short") return "Sandwich Bread";
    // fallback
    return "Sandwich Bread";
  }

  // Check if all predictions are filled
  const allAnswered = data.every(row => row._predicted);

  // Compute correctness summary
  const correctCount = data.filter(row => row._predicted === getCorrectPrediction(row)).length;
  const totalCount = data.length;
  const accuracy = ((correctCount / totalCount) * 100).toFixed(1);

  useEffect(() => {
    if (!allAnswered) return;
    try {
      localStorage.setItem(
        "bakeml.level3.score",
        JSON.stringify({
          correct: correctCount,
          total: totalCount,
          accuracy,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore storage failures
    }
  }, [allAnswered, correctCount, totalCount, accuracy]);

  return (
    <div className="relative p-6 max-w-5xl mx-auto overflow-visible">
      <h1 className="text-2xl font-bold mb-4">Level 3: Introduction to Decision Trees</h1>
      <p className="mb-4">Help Clank predict the type of each pastry. Click a row and pick the answer.</p>
      <div className="mb-4 rounded-lg border-l-4 border-amber-500 bg-amber-100 px-4 py-3 text-sm text-gray-900 shadow-sm">
        <p><strong>Tip:</strong> Use the decision tree image to help you pick the correct answer for each row.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dataset Table */}
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto md:col-start-1 md:row-start-1">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1">id</th>
                  <th className="px-2 py-1">sweet</th>
                  <th className="px-2 py-1">length</th>
                  <th className="px-2 py-1">round</th>
                  <th className="px-2 py-1">Prediction</th>
                </tr>
              </thead>
              <tbody>
                {data.map(row => (
                  <tr key={row.id} onClick={() => setSelectedRow(row.id)} className={`border-t cursor-pointer transition-colors hover:bg-gray-100 ${selectedRow === row.id ? 'bg-yellow-100' : ''}`}>
                    <td className="px-2 py-1">{row.id}</td>
                    <td className="px-2 py-1">{row.sweet ? 'Yes' : 'No'}</td>
                    <td className="px-2 py-1">{row.length}</td>
                    <td className="px-2 py-1">{row.round ? 'Yes' : 'No'}</td>
                    <td className="px-2 py-1 font-semibold">{row._predicted || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!selectedRow && (
              <p className="text-sm text-gray-500 mt-2">Select a row to pick the prediction.</p>
            )}
            {selectedRow && (
              <>
                <p className="mb-2 mt-4">Pick the prediction for <strong>row {selectedRow}</strong>:</p>
                <div className="flex gap-2 flex-wrap mb-2">
                  {possiblePredictions.map((pred) => (
                    <button
                      key={pred}
                      type="button"
                      className="blue-bg text-white px-3 py-1 rounded"
                      onClick={() => applyPrediction(selectedRow, pred)}
                    >
                      {pred}
                    </button>
                  ))}
                </div>
              </>
            )}

            {allAnswered && (
              !isEvaluationConfirmed ? (
                <div className="mt-4 rounded border p-3 bg-gray-50 text-sm">
                  <p className="font-semibold">All predictions are filled.</p>
                  <p className="mt-1 text-gray-700">Confirm your answers to see the evaluation.</p>
                  <button
                    type="button"
                    onClick={() => setIsEvaluationConfirmed(true)}
                    className="mt-3 brown-bg text-white px-4 py-2 rounded"
                  >
                    Confirm
                  </button>
                </div>
              ) : (
              <div className="mt-4 rounded border p-3 bg-gray-50 text-sm">
                <p>
                  Correct predictions: <strong>{correctCount}</strong> / {totalCount}
                </p>
                <p>
                  Accuracy: <strong>{accuracy}%</strong>
                </p>
                {correctCount === totalCount
                  ? <span className="text-green-700 font-bold">All predictions are correct! Well done!</span>
                  : <span className="text-red-700 font-bold">Some predictions are incorrect — you can still continue or change your answers.</span>
                }
              </div>
              )
            )}

            {allAnswered && isEvaluationConfirmed && (
              <div className="mt-4 rounded border p-3 bg-white text-sm">
                <p className="font-semibold">Extra Question: What is the depth of this decision tree?</p>
                <div className="mt-2 flex gap-4">
                  {['1', '2', '3'].map((value) => (
                    <label key={value} className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="tree-depth"
                        value={value}
                        checked={depthAnswer === value}
                        onChange={(e) => setDepthAnswer(e.target.value)}
                      />
                      {value}
                    </label>
                  ))}
                </div>
                {depthAnswer === "2" && <p className="mt-2 text-green-700">Correct. The deepest leaf is at depth 2.</p>}
                {depthAnswer !== "" && depthAnswer !== "2" && <p className="mt-2 text-red-700">Not quite. Try again.</p>}
              </div>
            )}
        </div>

        {/* Decision Tree Panel */}
        <div className="bg-white rounded-lg shadow p-2 md:col-start-2 md:row-start-1">
          <h2 className="font-semibold mb-2">Decision Tree</h2>
          {!allAnswered && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-gray-800">
              <p className="font-semibold">Clank says: Use these tree terms while solving.</p>
              <p><strong>Node</strong>: A point where the tree asks a question about the data.</p>
              <p><strong>Branch</strong>: The path taken after each answer (for example, Yes or No).</p>
              <p><strong>Leaf</strong>: The final end point where a prediction is made.</p>
              <p><strong>Depth</strong>: How many questions from the root to reach a node (root depth is 0).</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsTreeZoomed(true)}
            className="w-full cursor-zoom-in"
            aria-label="Open enlarged decision tree"
          >
            <Image src="/decisiontree.png" alt="Decision Tree" width={800} height={600} className="w-full h-auto rounded" />
          </button>
          <p className="mt-2 text-xs text-gray-500">Click image to enlarge</p>
        </div>
      </div>

      {allAnswered && isEvaluationConfirmed && (
        <div className="mt-4 flex justify-start">
          <Link
            href="/?completed=true&level2Completed=true&level3Completed=true"
            className="brown-bg text-white px-4 py-2 rounded inline-block"
          >
            Go to Level 4
          </Link>
        </div>
      )}

      {isTreeZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setIsTreeZoomed(false)}
        >
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTreeZoomed(false)}
                className="rounded bg-white px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-2xl">
              <Image src="/decisiontree.png" alt="Decision Tree enlarged" width={1600} height={1200} className="w-full h-auto rounded" />
            </div>
          </div>
        </div>
      )}

      {!allAnswered && (
        <aside className="hidden xl:block absolute top-56 -right-56 pointer-events-none">
          <Image
            src="/robot_baker.png"
            alt="Clank the robot baker"
            width={260}
            height={260}
            className="shrink-0"
          />
        </aside>
      )}
    </div>
  );
}