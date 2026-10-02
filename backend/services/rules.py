import pandas as pd


POLLUTION_COLUMNS = [
    "pH",
    "BOD",
    "COD",
    "TSS",
    "flow_rate",
    "temperature"
]


def detect_flat_readings(df: pd.DataFrame):
    findings = []

    for industry_id, group in df.groupby("industry_id"):

        for column in POLLUTION_COLUMNS:

            values = pd.to_numeric(
                group[column],
                errors="coerce"
            ).dropna()

            if len(values) < 3:
                continue

            unique_values = values.nunique()

            if unique_values == 1:
                findings.append({
                    "industry_id": industry_id,
                    "rule": "FLAT_READING",
                    "parameter": column,
                    "severity": "HIGH",
                    "message": (
                        f"{column} has the same value across "
                        f"{len(values)} observations."
                    )
                })

            elif unique_values / len(values) <= 0.25:
                findings.append({
                    "industry_id": industry_id,
                    "rule": "LOW_VARIATION",
                    "parameter": column,
                    "severity": "MEDIUM",
                    "message": (
                        f"{column} shows unusually low variation "
                        f"across {len(values)} observations."
                    )
                })

    return findings
def detect_threshold_proximity(df: pd.DataFrame):
    findings = []

    # Prototype thresholds for demonstration.
    # These are NOT universal legal limits.
    limits = {
        "BOD": 30,
        "COD": 250,
        "TSS": 100
    }

    for industry_id, group in df.groupby("industry_id"):

        for parameter, limit in limits.items():

            values = pd.to_numeric(
                group[parameter],
                errors="coerce"
            ).dropna()

            if len(values) == 0:
                continue

            # Within 10% of the configured limit
            threshold = limit * 0.90

            close_count = int(
                (values >= threshold).sum()
            )

            if close_count >= 2:

                findings.append({
                    "industry_id": industry_id,
                    "rule": "THRESHOLD_PROXIMITY",
                    "parameter": parameter,
                    "severity": "MEDIUM",
                    "limit": limit,
                    "message": (
                        f"{parameter} was close to the configured "
                        f"threshold in {close_count} observations."
                    )
                })

    return findings
def detect_sudden_changes(df: pd.DataFrame):
    findings = []

    parameters = [
        "pH",
        "BOD",
        "COD",
        "TSS",
        "flow_rate",
        "temperature"
    ]

    for industry_id, group in df.groupby("industry_id"):

        group = group.copy()

        group["date"] = pd.to_datetime(
            group["date"],
            errors="coerce"
        )

        group = group.sort_values("date")

        for parameter in parameters:

            values = pd.to_numeric(
                group[parameter],
                errors="coerce"
            )

            previous_values = values.shift(1)

            percentage_change = (
                (values - previous_values).abs()
                / previous_values.abs().replace(0, pd.NA)
            ) * 100

            suspicious_rows = group[
                percentage_change > 50
            ]

            for index in suspicious_rows.index:

                current_value = values.loc[index]
                previous_value = previous_values.loc[index]

                findings.append({
                    "industry_id": industry_id,
                    "rule": "SUDDEN_CHANGE",
                    "parameter": parameter,
                    "severity": "HIGH",
                    "date": str(group.loc[index, "date"].date()),
                    "previous_value": float(previous_value),
                    "current_value": float(current_value),
                    "percentage_change": round(
                        float(percentage_change.loc[index]),
                        2
                    ),
                    "message": (
                        f"{parameter} changed by "
                        f"{round(float(percentage_change.loc[index]), 2)}% "
                        f"compared with the previous reading."
                    )
                })

    return findings
def detect_missing_data(df: pd.DataFrame):
    findings = []

    for industry_id, group in df.groupby("industry_id"):

        group = group.copy()

        group["date"] = pd.to_datetime(
            group["date"],
            errors="coerce"
        )

        group = group.dropna(subset=["date"])
        group = group.sort_values("date")

        if len(group) < 2:
            continue

        date_differences = group["date"].diff().dt.days

        suspicious_rows = group[
            date_differences > 1
        ]

        for index in suspicious_rows.index:

            previous_date = group.loc[index - 1, "date"]
            current_date = group.loc[index, "date"]

            missing_days = int(
                (current_date - previous_date).days - 1
            )

            findings.append({
                "industry_id": industry_id,
                "rule": "MISSING_DATA",
                "severity": "MEDIUM",
                "previous_date": str(previous_date.date()),
                "current_date": str(current_date.date()),
                "missing_days": missing_days,
                "message": (
                    f"{missing_days} day(s) of pollution data "
                    f"missing between "
                    f"{previous_date.date()} and "
                    f"{current_date.date()}."
                )
            })

    return findings