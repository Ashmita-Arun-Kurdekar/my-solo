# Machine-learning resource allocation

## Problem and architecture

This system treats employee-task suitability as supervised binary classification: estimate the probability that assigning a candidate to a task will result in successful, on-time completion. React never calls Python directly. The request path is React -> authenticated Express API -> private FastAPI service -> persisted scikit-learn model -> Express -> React. The manager reviews the ranking and explicitly chooses an assignee; manual assignment remains available.

## Dataset and target

The initial model uses 6,000 reproducible, seeded synthetic historical scenarios because the current PostgreSQL history is too small. These rows are labeled `synthetic_demo` and saved only under `ai-service/data`; they are never inserted into application tables. The generator encodes plausible correlations (for example, excessive workload and overdue work reduce the probability of success, while relevant history and strong completion performance increase it), then samples outcomes with noise. It does not generate recommendation scores; the trained classifier does that.

The target `successful_allocation` is 1 when a historical assignment was completed on or before its due date, otherwise 0. For later retraining, export real historical candidate/task snapshots with the documented feature columns and target, then pass that CSV to `train.py --real-data`. This preserves clear `postgres_history` versus `synthetic_demo` provenance.

## Features

PostgreSQL supplies candidate features at request time: project/employee department match, designation, profile experience, active task count, completed task count, overdue task count, on-time completion rate, average completion duration, completed tasks in projects from the same department, availability, and workload derived from active tasks. The task supplies priority and planned duration. Missing profile values are safely defaulted; unavailable employees are not sent to the model.

No task-complexity or skill-match feature is claimed because tasks currently do not store structured complexity or required skills. Future migrations could add `tasks.complexity` and `tasks.required_skills`, but they should only enter training after reliable history exists.

## Model and evaluation

The pipeline contains one-hot encoding for categorical fields and a Random Forest classifier (350 trees, balanced classes, minimum leaf size 5). Random Forest was chosen for nonlinear tabular relationships, modest preprocessing needs, probability output, and interview-friendly feature reasoning. A seeded stratified 80/20 train/test split is used.

Current held-out metrics (`models/metrics.json`): accuracy 0.6625, precision 0.6672, recall 0.6748, F1 0.6710, ROC-AUC 0.7173, confusion matrix `[[382, 206], [199, 413]]`. These measure synthetic-demo behavior, not proven business performance.

## Training and running

From `ai-service`:

```powershell
python -m pip install -r requirements.txt
python train.py
python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

Optional real-history retraining:

```powershell
python train.py --real-data data/real_task_history.csv
```

From `backend`, set `ML_SERVICE_URL=http://127.0.0.1:8000` if needed, then run `npm start`. From `frontend`, run `npm run dev`.

## API and security

FastAPI provides `POST /predict`, `POST /recommend-employees`, and `GET /health`. Express exposes `POST /api/allocation/recommend-task` only behind JWT and Admin/Manager RBAC. A manager can request candidates only for a project they manage. Candidate queries use project membership, so selecting a recommendation remains compatible with existing task validation.

If Python is stopped, times out, has no model, or returns invalid data, Express responds with `ML_UNAVAILABLE` and HTTP 503. The UI displays “AI recommendations are temporarily unavailable” and retains manual assignment and normal task creation.

## Explainability and limitations

The match percentage is `RandomForestClassifier.predict_proba`, never a hard-coded or random UI score. Reasons are factual summaries of the exact input features (workload, department match, completion rate, relevant history, overdue work, and experience); they are not presented as causal model explanations.

The bootstrap model is limited by synthetic training data, possible historical selection bias, uncalibrated probabilities, absence of structured task skills/complexity, and a workload proxy based on active task count rather than effort estimates. Before production use: collect recommendation/selection/outcome snapshots, monitor performance and fairness by department/designation, calibrate probabilities, add time-aware validation, and replace synthetic rows as sufficient real outcomes accumulate. Power BI remains an analytics consumer and is not part of prediction serving.

## Interview summary

- Problem: rank project members by predicted probability of successful on-time task completion.
- Model: explainable, practical Random Forest pipeline for mixed tabular data.
- Training: explicitly labeled seeded synthetic bootstrap plus an optional real-history CSV path.
- Integration: React asks Express; Express enforces RBAC, derives PostgreSQL features, and calls FastAPI.
- Failure mode: 503 fallback message with uninterrupted manual assignment.
- Improvement path: log real candidate snapshots and outcomes, retrain offline, validate, then version and deploy the new artifact.
