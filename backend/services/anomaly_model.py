import pandas as pd
from sklearn.ensemble import IsolationForest


POLLUTION_COLUMNS = [
    "pH",
    "BOD",
    "COD",
    "TSS",
    "flow_rate",
    "temperature"
]


def detect_ml_anomalies(df: pd.DataFrame):

    findings = []

    data = df.copy()

    for column in POLLUTION_COLUMNS:
        data[column] = pd.to_numeric(
            data[column],
            errors="coerce"
        )

    data = data.dropna(
        subset=POLLUTION_COLUMNS
    )

    if len(data) < 5:
        return findings

    model = IsolationForest(
        contamination=0.10,
        random_state=42
    )

    predictions = model.fit_predict(
        data[POLLUTION_COLUMNS]
    )

    anomaly_scores = model.decision_function(
        data[POLLUTION_COLUMNS]
    )

    for position, prediction in enumerate(predictions):

        if prediction == -1:

            row = data.iloc[position]

            findings.append({
                "industry_id": row["industry_id"],
                "rule": "ML_ANOMALY",
                "severity": "HIGH",
                "anomaly_score": round(
                    float(anomaly_scores[position]),
                    4
                ),
                "message": (
                    "This pollution record was identified "
                    "as statistically unusual by the "
                    "Isolation Forest model."
                )
            })

    return findings