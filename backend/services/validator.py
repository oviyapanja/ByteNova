import pandas as pd


REQUIRED_COLUMNS = [
    "industry_id",
    "industry_name",
    "date",
    "pH",
    "BOD",
    "COD",
    "TSS",
    "flow_rate",
    "temperature"
]


def validate_pollution_data(df: pd.DataFrame):

    errors = []
    warnings = []

    # 1. Check required columns
    missing_columns = [
        column for column in REQUIRED_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        errors.append({
            "type": "MISSING_COLUMNS",
            "message": f"Missing required columns: {missing_columns}"
        })

    # Stop here if required columns are missing
    if missing_columns:
        return {
            "valid": False,
            "total_records": len(df),
            "errors": errors,
            "warnings": warnings
        }

    # 2. Check missing values
    missing_values = df[REQUIRED_COLUMNS].isnull().sum()

    for column, count in missing_values.items():
        if count > 0:
            warnings.append({
                "type": "MISSING_VALUES",
                "column": column,
                "count": int(count),
                "message": f"{count} missing value(s) found in {column}."
            })

    # 3. Check duplicate records
    duplicate_count = int(df.duplicated().sum())

    if duplicate_count > 0:
        warnings.append({
            "type": "DUPLICATE_RECORDS",
            "count": duplicate_count,
            "message": f"{duplicate_count} duplicate record(s) found."
        })

    # 4. Check date format
    converted_dates = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    invalid_dates = int(converted_dates.isna().sum())

    if invalid_dates > 0:
        warnings.append({
            "type": "INVALID_DATES",
            "count": invalid_dates,
            "message": f"{invalid_dates} invalid date value(s) found."
        })

    # 5. Check numeric columns
    numeric_columns = [
        "pH",
        "BOD",
        "COD",
        "TSS",
        "flow_rate",
        "temperature"
    ]

    for column in numeric_columns:

        converted = pd.to_numeric(
            df[column],
            errors="coerce"
        )

        invalid_count = int(converted.isna().sum())

        if invalid_count > 0:
            warnings.append({
                "type": "INVALID_NUMERIC_VALUES",
                "column": column,
                "count": invalid_count,
                "message": f"{invalid_count} invalid numeric value(s) found in {column}."
            })

    # 6. Check negative values
    for column in numeric_columns:

        numeric_values = pd.to_numeric(
            df[column],
            errors="coerce"
        )

        negative_count = int(
            (numeric_values < 0).sum()
        )

        if negative_count > 0:
            warnings.append({
                "type": "NEGATIVE_VALUES",
                "column": column,
                "count": negative_count,
                "message": f"{negative_count} negative value(s) found in {column}."
            })

    return {
        "valid": len(errors) == 0,
        "total_records": len(df),
        "errors": errors,
        "warnings": warnings
    }