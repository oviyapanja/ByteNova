import pandas as pd


# ============================================================
# REFERENCE LIMITS
# Prototype/demo reference values.
# These are NOT universal legal limits.
# ============================================================

REFERENCE_LIMITS = {
    "BOD": 30.0,
    "COD": 250.0,
    "TSS": 100.0
}


# ============================================================
# HELPERS
# ============================================================

def clamp(value, minimum=0.0, maximum=100.0):
    return max(minimum, min(float(value), maximum))


def safe_mean(series):
    values = pd.to_numeric(series, errors="coerce").dropna()

    if len(values) == 0:
        return None

    return float(values.mean())


def safe_std(series):
    values = pd.to_numeric(series, errors="coerce").dropna()

    if len(values) < 2:
        return 0.0

    return float(values.std())


def coefficient_of_variation(series):
    values = pd.to_numeric(series, errors="coerce").dropna()

    if len(values) < 2:
        return None

    mean_value = float(values.mean())

    if mean_value == 0:
        return None

    std_value = float(values.std())

    return abs(std_value / mean_value) * 100


# ============================================================
# 1. CURRENT VALUE vs REFERENCE LIMIT
# ============================================================

def calculate_limit_proximity(df):

    result = {}

    for parameter, limit in REFERENCE_LIMITS.items():

        if parameter not in df.columns:
            continue

        current_average = safe_mean(df[parameter])

        if current_average is None:
            continue

        proximity = abs(current_average) / limit * 100

        result[parameter] = {
            "current_average": round(current_average, 2),
            "reference_limit": limit,
            "proximity_percent": round(
                clamp(proximity), 2
            )
        }

    return result


# ============================================================
# 2. HISTORICAL COMPARISON
# ============================================================

def calculate_historical_comparison(df):

    if "date" not in df.columns:
        return {
            "available": False,
            "message": "Historical baseline unavailable."
        }

    data = df.copy()

    data["date"] = pd.to_datetime(
        data["date"],
        errors="coerce"
    )

    data = data.dropna(
        subset=["date"]
    ).sort_values("date")

    if len(data) < 4:
        return {
            "available": False,
            "message": "Not enough historical records."
        }

    parameters = [
        "BOD",
        "COD",
        "TSS"
    ]

    result = {}

    years = sorted(
        data["date"].dt.year.unique()
    )

    # --------------------------------------------------------
    # Actual year-to-year comparison
    # --------------------------------------------------------

    if len(years) >= 2:

        current_year = years[-1]
        previous_year = years[-2]

        current_data = data[
            data["date"].dt.year == current_year
        ]

        previous_data = data[
            data["date"].dt.year == previous_year
        ]

        comparison_label = (
            f"{current_year} vs {previous_year}"
        )

    # --------------------------------------------------------
    # If only one year exists:
    # compare recent period vs earlier period
    # --------------------------------------------------------

    else:

        midpoint = len(data) // 2

        previous_data = data.iloc[:midpoint]
        current_data = data.iloc[midpoint:]

        comparison_label = (
            "Recent period vs earlier period"
        )

    for parameter in parameters:

        if parameter not in data.columns:
            continue

        current_average = safe_mean(
            current_data[parameter]
        )

        previous_average = safe_mean(
            previous_data[parameter]
        )

        if current_average is None:
            continue

        if previous_average in [None, 0]:

            result[parameter] = {
                "current_average": round(
                    current_average, 2
                ),
                "historical_average": None,
                "deviation_percent": None,
                "comparison": comparison_label
            }

            continue

        deviation = (
            (current_average - previous_average)
            / abs(previous_average)
        ) * 100

        result[parameter] = {
            "current_average": round(
                current_average, 2
            ),
            "historical_average": round(
                previous_average, 2
            ),
            "deviation_percent": round(
                deviation, 2
            ),
            "comparison": comparison_label
        }

    return {
        "available": True,
        "comparison": comparison_label,
        "parameters": result
    }


# ============================================================
# 3. PEER / SIMILAR INDUSTRY COMPARISON
# ============================================================

def calculate_peer_comparison(df):

    if "industry_id" not in df.columns:
        return {
            "available": False,
            "message": "Industry peer data unavailable."
        }

    industry_ids = (
        df["industry_id"]
        .dropna()
        .unique()
        .tolist()
    )

    if len(industry_ids) < 2:

        return {
            "available": False,
            "message": (
                "Peer comparison requires "
                "multiple industries."
            )
        }

    parameters = [
        "BOD",
        "COD",
        "TSS"
    ]

    result = {}

    for parameter in parameters:

        if parameter not in df.columns:
            continue

        industry_means = (
            df.groupby("industry_id")[parameter]
            .mean()
            .dropna()
        )

        if len(industry_means) < 2:
            continue

        parameter_result = {}

        overall_peer_mean = (
            float(industry_means.mean())
        )

        for industry_id in industry_means.index:

            current_average = float(
                industry_means[industry_id]
            )

            peer_values = industry_means.drop(
                labels=[industry_id]
            )

            if len(peer_values) == 0:
                continue

            peer_average = float(
                peer_values.mean()
            )

            if peer_average == 0:
                deviation = 0
            else:
                deviation = (
                    (
                        current_average
                        - peer_average
                    )
                    / abs(peer_average)
                ) * 100

            parameter_result[str(industry_id)] = {
                "current_average": round(
                    current_average, 2
                ),
                "peer_average": round(
                    peer_average, 2
                ),
                "deviation_percent": round(
                    deviation, 2
                ),
                "peer_count": len(peer_values)
            }

        result[parameter] = {
            "overall_peer_average": round(
                overall_peer_mean, 2
            ),
            "industries": parameter_result
        }

    return {
        "available": True,
        "parameters": result
    }


# ============================================================
# 4. MATHEMATICAL VARIATION ANALYSIS
# ============================================================

def calculate_variation_analysis(df):

    parameters = [
        "BOD",
        "COD",
        "TSS"
    ]

    result = {}

    for parameter in parameters:

        if parameter not in df.columns:
            continue

        values = pd.to_numeric(
            df[parameter],
            errors="coerce"
        ).dropna()

        if len(values) == 0:
            continue

        mean_value = float(values.mean())
        std_value = safe_std(values)
        cv = coefficient_of_variation(values)

        unique_ratio = (
            values.nunique()
            / len(values)
        ) * 100

        # Low CV = suspiciously stable/flat pattern
        if cv is not None and cv < 5:
            variation_anomaly_score = 100
        elif cv is not None and cv < 10:
            variation_anomaly_score = 70
        elif cv is not None and cv < 20:
            variation_anomaly_score = 40
        else:
            variation_anomaly_score = 0

        result[parameter] = {
            "mean": round(mean_value, 2),
            "standard_deviation": round(
                std_value, 2
            ),
            "coefficient_of_variation": (
                round(cv, 2)
                if cv is not None
                else None
            ),
            "unique_ratio_percent": round(
                unique_ratio, 2
            ),
            "variation_anomaly_score": (
                variation_anomaly_score
            )
        }

    return result


# ============================================================
# 5. COMPARATIVE RISK ENGINE
# ============================================================

def build_comparative_analysis(
    df,
    rule_findings,
    threshold_findings,
    sudden_change_findings,
    missing_data_findings,
    ml_anomaly_findings
):

    # --------------------------------------------------------
    # Mathematical analyses
    # --------------------------------------------------------

    limit_analysis = calculate_limit_proximity(
        df
    )

    historical_analysis = (
        calculate_historical_comparison(df)
    )

    peer_analysis = calculate_peer_comparison(
        df
    )

    variation_analysis = (
        calculate_variation_analysis(df)
    )

    # --------------------------------------------------------
    # LIMIT SCORE
    # --------------------------------------------------------

    limit_scores = []

    for item in limit_analysis.values():

        limit_scores.append(
            item["proximity_percent"]
        )

    limit_score = (
        sum(limit_scores) / len(limit_scores)
        if limit_scores
        else None
    )

    # --------------------------------------------------------
    # HISTORICAL SCORE
    # --------------------------------------------------------

    historical_scores = []

    if historical_analysis.get("available"):

        for item in historical_analysis[
            "parameters"
        ].values():

            deviation = item.get(
                "deviation_percent"
            )

            if deviation is not None:

                historical_scores.append(
                    abs(deviation)
                )

    historical_score = (
        sum(historical_scores)
        / len(historical_scores)
        if historical_scores
        else None
    )

    # --------------------------------------------------------
    # PEER SCORE
    # --------------------------------------------------------

    peer_scores = []

    if peer_analysis.get("available"):

        for parameter_data in peer_analysis[
            "parameters"
        ].values():

            for industry_data in (
                parameter_data[
                    "industries"
                ].values()
            ):

                peer_scores.append(
                    abs(
                        industry_data[
                            "deviation_percent"
                        ]
                    )
                )

    peer_score = (
        sum(peer_scores)
        / len(peer_scores)
        if peer_scores
        else None
    )

    # --------------------------------------------------------
    # VARIATION SCORE
    # --------------------------------------------------------

    variation_scores = []

    for item in variation_analysis.values():

        variation_scores.append(
            item["variation_anomaly_score"]
        )

    variation_score = (
        sum(variation_scores)
        / len(variation_scores)
        if variation_scores
        else None
    )

    # --------------------------------------------------------
    # RULE SCORE
    # --------------------------------------------------------

    total_rule_findings = (
        len(rule_findings)
        + len(threshold_findings)
        + len(sudden_change_findings)
        + len(missing_data_findings)
    )

    rule_score = clamp(
        total_rule_findings * 15
    )

    # --------------------------------------------------------
    # ML SCORE
    # --------------------------------------------------------

    ml_score = clamp(
        len(ml_anomaly_findings) * 20
    )

    # --------------------------------------------------------
    # WEIGHTED RISK SCORE
    #
    # Limit       = 25%
    # Historical  = 20%
    # Peer        = 15%
    # Variation   = 20%
    # Rules       = 10%
    # ML          = 10%
    # --------------------------------------------------------

    components = []

    if limit_score is not None:
        components.append(
            (limit_score, 0.25)
        )

    if historical_score is not None:
        components.append(
            (
                clamp(historical_score),
                0.20
            )
        )

    if peer_score is not None:
        components.append(
            (
                clamp(peer_score),
                0.15
            )
        )

    if variation_score is not None:
        components.append(
            (
                variation_score,
                0.20
            )
        )

    if total_rule_findings > 0:
        components.append(
            (
                rule_score,
                0.10
            )
        )

    if len(ml_anomaly_findings) > 0:
        components.append(
            (
                ml_score,
                0.10
            )
        )

    if components:

        weighted_total = sum(
            score * weight
            for score, weight in components
        )

        total_weight = sum(
            weight
            for _, weight in components
        )

        final_score = (
            weighted_total / total_weight
        )

    else:

        final_score = 0

    final_score = round(
        clamp(final_score)
    )

    # --------------------------------------------------------
    # RISK LEVEL
    # --------------------------------------------------------

    if final_score <= 30:
        risk_level = "LOW"

    elif final_score <= 60:
        risk_level = "MEDIUM"

    else:
        risk_level = "HIGH"

    # --------------------------------------------------------
    # WHY FLAGGED?
    # --------------------------------------------------------

    reasons = []

    if limit_score is not None:

        if limit_score >= 80:

            reasons.append(
                "Current pollution values are "
                "close to or above the reference "
                "limit range."
            )

    if historical_score is not None:

        if abs(historical_score) >= 20:

            reasons.append(
                "Current pollution levels show "
                "a significant deviation from the "
                "historical baseline."
            )

    if peer_score is not None:

        if abs(peer_score) >= 20:

            reasons.append(
                "Pollution levels differ significantly "
                "from the comparable industry average."
            )

    if variation_score is not None:

        if variation_score >= 70:

            reasons.append(
                "Mathematical variation analysis shows "
                "an unusually stable or low-variation "
                "pollution pattern."
            )

    if total_rule_findings > 0:

        reasons.append(
            f"Rule-based detection identified "
            f"{total_rule_findings} suspicious pattern(s)."
        )

    if len(ml_anomaly_findings) > 0:

        reasons.append(
            f"Isolation Forest identified "
            f"{len(ml_anomaly_findings)} "
            f"statistically unusual record(s)."
        )

    if not reasons:

        reasons.append(
            "No major suspicious pattern was detected "
            "by the current analysis."
        )

    # --------------------------------------------------------
    # RETURN
    # --------------------------------------------------------

    return {
        "risk_score": final_score,

        "risk_level": risk_level,

        "reasons": reasons,

        "score_breakdown": {
            "limit_proximity": (
                round(limit_score, 2)
                if limit_score is not None
                else None
            ),
            "historical_deviation": (
                round(historical_score, 2)
                if historical_score is not None
                else None
            ),
            "peer_deviation": (
                round(peer_score, 2)
                if peer_score is not None
                else None
            ),
            "variation_anomaly": (
                round(variation_score, 2)
                if variation_score is not None
                else None
            ),
            "rule_signal": round(
                rule_score, 2
            ),
            "ml_anomaly": round(
                ml_score, 2
            )
        },

        "comparisons": {
            "limit_analysis": limit_analysis,
            "historical_analysis": historical_analysis,
            "peer_analysis": peer_analysis,
            "variation_analysis": variation_analysis
        }
    }


# ============================================================
# 6. MAIN RISK FUNCTION
# ============================================================

def calculate_risk(
    rule_findings,
    threshold_findings,
    sudden_change_findings,
    missing_data_findings,
    ml_anomaly_findings,
    df=None
):

    # New mathematical risk engine
    if df is not None:

        return build_comparative_analysis(
            df,
            rule_findings,
            threshold_findings,
            sudden_change_findings,
            missing_data_findings,
            ml_anomaly_findings
        )

    # --------------------------------------------------------
    # Fallback for old calls
    # --------------------------------------------------------

    score = 0
    reasons = []

    for finding in rule_findings:

        if finding.get("rule") == "FLAT_READING":

            score += 20
            reasons.append(
                finding["message"]
            )

        elif finding.get("rule") == "LOW_VARIATION":

            score += 10
            reasons.append(
                finding["message"]
            )

    for finding in threshold_findings:

        score += 10

        reasons.append(
            finding["message"]
        )

    for finding in sudden_change_findings:

        score += 20

        reasons.append(
            finding["message"]
        )

    for finding in missing_data_findings:

        score += 10

        reasons.append(
            finding["message"]
        )

    for finding in ml_anomaly_findings:

        score += 20

        reasons.append(
            finding["message"]
        )

    score = min(
        score,
        100
    )

    if score <= 30:

        risk_level = "LOW"

    elif score <= 60:

        risk_level = "MEDIUM"

    else:

        risk_level = "HIGH"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "reasons": reasons
    }


# ============================================================
# 7. INDUSTRY-WISE RISK
# ============================================================

def calculate_industry_risks(
    rule_findings,
    threshold_findings,
    sudden_change_findings,
    missing_data_findings,
    ml_anomaly_findings,
    df=None
):

    # --------------------------------------------------------
    # If dataframe is available, analyse every industry
    # --------------------------------------------------------

    if df is not None and "industry_id" in df.columns:

        industry_results = []

        industry_ids = (
            df["industry_id"]
            .dropna()
            .unique()
            .tolist()
        )

        for industry_id in industry_ids:

            industry_df = df[
                df["industry_id"] == industry_id
            ].copy()

            industry_rule_findings = [
                finding
                for finding in rule_findings
                if finding.get(
                    "industry_id"
                ) == industry_id
            ]

            industry_threshold_findings = [
                finding
                for finding in threshold_findings
                if finding.get(
                    "industry_id"
                ) == industry_id
            ]

            industry_sudden_findings = [
                finding
                for finding in sudden_change_findings
                if finding.get(
                    "industry_id"
                ) == industry_id
            ]

            industry_missing_findings = [
                finding
                for finding in missing_data_findings
                if finding.get(
                    "industry_id"
                ) == industry_id
            ]

            industry_ml_findings = [
                finding
                for finding in ml_anomaly_findings
                if finding.get(
                    "industry_id"
                ) == industry_id
            ]

            risk_result = calculate_risk(
                industry_rule_findings,
                industry_threshold_findings,
                industry_sudden_findings,
                industry_missing_findings,
                industry_ml_findings,
                industry_df
            )

            industry_results.append({

                "industry_id":
                    industry_id,

                "risk_score":
                    risk_result[
                        "risk_score"
                    ],

                "risk_level":
                    risk_result[
                        "risk_level"
                    ],

                "reasons":
                    risk_result[
                        "reasons"
                    ],

                "score_breakdown":
                    risk_result.get(
                        "score_breakdown",
                        {}
                    ),

                "comparisons":
                    risk_result.get(
                        "comparisons",
                        {}
                    )
            })

        return industry_results

    # --------------------------------------------------------
    # Fallback old behaviour
    # --------------------------------------------------------

    industry_ids = set()

    all_findings = (
        rule_findings
        + threshold_findings
        + sudden_change_findings
        + missing_data_findings
        + ml_anomaly_findings
    )

    for finding in all_findings:

        if finding.get("industry_id"):

            industry_ids.add(
                finding["industry_id"]
            )

    industry_results = []

    for industry_id in industry_ids:

        industry_rule_findings = [
            finding
            for finding in rule_findings
            if finding.get(
                "industry_id"
            ) == industry_id
        ]

        industry_threshold_findings = [
            finding
            for finding in threshold_findings
            if finding.get(
                "industry_id"
            ) == industry_id
        ]

        industry_sudden_findings = [
            finding
            for finding in sudden_change_findings
            if finding.get(
                "industry_id"
            ) == industry_id
        ]

        industry_missing_findings = [
            finding
            for finding in missing_data_findings
            if finding.get(
                "industry_id"
            ) == industry_id
        ]

        industry_ml_findings = [
            finding
            for finding in ml_anomaly_findings
            if finding.get(
                "industry_id"
            ) == industry_id
        ]

        risk_result = calculate_risk(
            industry_rule_findings,
            industry_threshold_findings,
            industry_sudden_findings,
            industry_missing_findings,
            industry_ml_findings
        )

        industry_results.append({

            "industry_id":
                industry_id,

            "risk_score":
                risk_result[
                    "risk_score"
                ],

            "risk_level":
                risk_result[
                    "risk_level"
                ],

            "reasons":
                risk_result[
                    "reasons"
                ]
        })

    return industry_results