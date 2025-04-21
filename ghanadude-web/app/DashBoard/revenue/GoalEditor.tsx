import React from "react";

interface GoalEditorProps {
  goals: { [key: string]: number };
  setGoals: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
}

const GoalEditor: React.FC<GoalEditorProps> = ({ goals, setGoals }) => {
  const handleGoalChange = (month: string, value: number) => {
    setGoals((prev) => ({ ...prev, [month]: value }));
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">📌 Edit Monthly Goals</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.keys(goals).map((month) => (
          <div key={month}>
            <label className="block text-sm font-medium">{month}</label>
            <input
              type="number"
              value={goals[month]}
              onChange={(e) => handleGoalChange(month, Number(e.target.value))}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalEditor;
