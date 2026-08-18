"""Train the employee-task suitability model.

Synthetic records bootstrap the demo and are never written to PostgreSQL. Optional
real CSV rows can be supplied with --real-data; they must contain the feature
columns below plus successful_allocation (0/1).
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / "models"
DATA_DIR = ROOT / "data"
MODEL_PATH = MODEL_DIR / "employee_task_suitability.joblib"
METRICS_PATH = MODEL_DIR / "metrics.json"
FEATURES = ["department_match", "designation", "experience_years", "active_tasks", "completed_tasks", "overdue_tasks", "completion_rate", "average_completion_days", "similar_tasks_completed", "current_workload", "availability_status", "task_priority", "planned_duration_days"]
CATEGORICAL = ["designation", "availability_status", "task_priority"]
NUMERIC = [column for column in FEATURES if column not in CATEGORICAL]


def synthetic_history(rows: int = 6000, seed: int = 42) -> pd.DataFrame:
    """Generate reproducible scenarios with plausible causal relationships."""
    rng = np.random.default_rng(seed)
    designation = rng.choice(["Junior Engineer", "Software Engineer", "Senior Engineer", "Analyst", "Team Lead"], rows, p=[.18, .30, .22, .18, .12])
    experience = np.clip(rng.gamma(2.2, 2.0, rows), 0, 15)
    completed = rng.poisson(5 + experience * 2.2)
    active = np.clip(rng.poisson(2.2, rows), 0, 9)
    overdue = np.minimum(rng.poisson(.7 + active * .12, rows), completed + active)
    completion_rate = np.clip(rng.beta(7, 2, rows) - overdue * .018, .2, 1)
    workload = np.clip(active * 14 + rng.normal(12, 10, rows), 0, 100)
    department_match = rng.binomial(1, .62, rows)
    similar = rng.poisson(.5 + department_match * 3 + experience * .18)
    priority = rng.choice(["Low", "Medium", "High"], rows, p=[.22, .50, .28])
    duration = rng.integers(2, 61, rows)
    avg_days = np.clip(rng.normal(12 - experience * .25 + overdue * .8, 4, rows), 1, 45)
    availability = np.where(workload >= 90, "Unavailable", np.where(workload >= 65, "Busy", "Available"))
    seniority = np.select([np.char.find(designation.astype(str), "Senior") >= 0, designation == "Team Lead", designation == "Software Engineer"], [.8, .9, .45], default=.15)
    priority_penalty = np.where(priority == "High", .35, 0)
    latent = (-1.25 + 1.1 * department_match + .055 * experience + 1.45 * completion_rate + .11 * np.sqrt(similar) + .35 * seniority - .20 * active - .32 * overdue - .012 * workload + .012 * np.minimum(duration, 30) - priority_penalty + rng.normal(0, .65, rows))
    probability = 1 / (1 + np.exp(-latent))
    target = rng.binomial(1, probability)
    return pd.DataFrame({"department_match": department_match, "designation": designation, "experience_years": experience.round(1), "active_tasks": active, "completed_tasks": completed, "overdue_tasks": overdue, "completion_rate": completion_rate.round(4), "average_completion_days": avg_days.round(2), "similar_tasks_completed": similar, "current_workload": workload.round(1), "availability_status": availability, "task_priority": priority, "planned_duration_days": duration, "successful_allocation": target, "data_source": "synthetic_demo"})


def train(real_data: Path | None = None, synthetic_rows: int = 6000) -> dict:
    data = synthetic_history(synthetic_rows)
    real_rows = 0
    if real_data:
        real = pd.read_csv(real_data)
        missing = set(FEATURES + ["successful_allocation"]) - set(real.columns)
        if missing:
            raise ValueError(f"Real dataset is missing columns: {sorted(missing)}")
        real = real[FEATURES + ["successful_allocation"]].copy()
        real["data_source"] = "postgres_history"
        real_rows = len(real)
        data = pd.concat([data, real], ignore_index=True)
    DATA_DIR.mkdir(exist_ok=True)
    MODEL_DIR.mkdir(exist_ok=True)
    data.to_csv(DATA_DIR / "training_history.csv", index=False)
    x_train, x_test, y_train, y_test = train_test_split(data[FEATURES], data["successful_allocation"], test_size=.2, random_state=42, stratify=data["successful_allocation"])
    pipeline = Pipeline([("preprocess", ColumnTransformer([("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL), ("numeric", "passthrough", NUMERIC)])), ("model", RandomForestClassifier(n_estimators=350, min_samples_leaf=5, class_weight="balanced", random_state=42, n_jobs=-1))])
    pipeline.fit(x_train, y_train)
    predicted = pipeline.predict(x_test)
    probability = pipeline.predict_proba(x_test)[:, 1]
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, predicted, average="binary", zero_division=0)
    metrics = {"accuracy": round(accuracy_score(y_test, predicted), 4), "precision": round(precision, 4), "recall": round(recall, 4), "f1": round(f1, 4), "roc_auc": round(roc_auc_score(y_test, probability), 4), "confusion_matrix": confusion_matrix(y_test, predicted).tolist(), "training_rows": len(data), "real_rows": real_rows, "synthetic_rows": synthetic_rows, "target": "successful_allocation: completed on or before the due date", "random_seed": 42}
    joblib.dump({"pipeline": pipeline, "features": FEATURES, "metrics": metrics, "model_version": "1.0.0"}, MODEL_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--real-data", type=Path)
    parser.add_argument("--synthetic-rows", type=int, default=6000)
    args = parser.parse_args()
    print(json.dumps(train(args.real_data, args.synthetic_rows), indent=2))
