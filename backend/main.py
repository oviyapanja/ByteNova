from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

import pandas as pd
import io
import os
import tempfile

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors


from services.validator import validate_pollution_data
from services.rules import detect_flat_readings
from services.rules import detect_threshold_proximity
from services.rules import detect_sudden_changes
from services.rules import detect_missing_data
from services.anomaly_model import detect_ml_anomalies

from services.risk_engine import (
    calculate_risk,
    calculate_industry_risks
)


app = FastAPI(
    title="Industrial Pollution Fraud Detection API",
    description="""
AI-powered pollution data anomaly detection and compliance monitoring API.

[🚀 Open Frontend Dashboard](http://localhost:5174)
""",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------
# ROOT
# -----------------------------------

@app.get("/")
def root():

    return {
        "message": "Pollution Fraud Detection API is running"
    }


# -----------------------------------
# CSV UPLOAD + ANALYSIS
# -----------------------------------

@app.post("/upload")
async def upload_pollution_data(
    file: UploadFile = File(...)
):

    # -----------------------------------
    # FILE VALIDATION
    # -----------------------------------

    if not file.filename.lower().endswith(".csv"):

        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file."
        )


    contents = await file.read()


    # -----------------------------------
    # READ CSV
    # -----------------------------------

    try:

        df = pd.read_csv(
            io.BytesIO(contents)
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Could not read CSV: {str(e)}"
        )


    # -----------------------------------
    # DATA VALIDATION
    # -----------------------------------

    validation_result = validate_pollution_data(
        df
    )


    # -----------------------------------
    # RULE-BASED DETECTION
    # -----------------------------------

    rule_findings = detect_flat_readings(
        df
    )

    threshold_findings = detect_threshold_proximity(
        df
    )

    sudden_change_findings = detect_sudden_changes(
        df
    )

    missing_data_findings = detect_missing_data(
        df
    )


    # -----------------------------------
    # MACHINE LEARNING DETECTION
    # -----------------------------------

    ml_anomaly_findings = detect_ml_anomalies(
        df
    )


    # -----------------------------------
    # OVERALL RISK
    # -----------------------------------

    risk_result = calculate_risk(
        rule_findings,
        threshold_findings,
        sudden_change_findings,
        missing_data_findings,
        ml_anomaly_findings,
        df
    )


    # -----------------------------------
    # INDUSTRY-WISE RISK
    # -----------------------------------

    industry_risks = calculate_industry_risks(
        rule_findings,
        threshold_findings,
        sudden_change_findings,
        missing_data_findings,
        ml_anomaly_findings,
        df
    )


    # -----------------------------------
    # INSPECTION PRIORITY
    # HIGH SCORE FIRST
    # -----------------------------------

    industry_risks = sorted(
        industry_risks,
        key=lambda x: x["risk_score"],
        reverse=True
    )


    # -----------------------------------
    # ADD PRIORITY NUMBER
    # -----------------------------------

    for index, industry in enumerate(
        industry_risks,
        start=1
    ):

        industry["priority"] = index


        if industry["risk_level"] == "HIGH":

            industry["priority_label"] = (
                "URGENT VERIFICATION"
            )


        elif industry["risk_level"] == "MEDIUM":

            industry["priority_label"] = (
                "REVIEW REQUIRED"
            )


        else:

            industry["priority_label"] = (
                "ROUTINE MONITORING"
            )


    # -----------------------------------
    # POLLUTION TREND DATA
    # -----------------------------------

    trend_columns = [
        "date",
        "BOD",
        "COD",
        "TSS",
        "pH"
    ]


    trend_data = df[
        trend_columns
    ].copy()


    trend_data["date"] = (
        trend_data["date"].astype(str)
    )


    trend_data = (
        trend_data
        .fillna(0)
        .to_dict(orient="records")
    )


    # -----------------------------------
    # FINAL RESPONSE
    # -----------------------------------

    return {

        "message":
            "Pollution data uploaded successfully",

        "filename":
            file.filename,

        "rows":
            len(df),

        "industry_count":
            df["industry_id"].nunique(),

        "industries":
            (
                df["industry_name"]
                .dropna()
                .unique()
                .tolist()
            ),

        "high_risk":
            (
                1
                if risk_result["risk_level"] == "HIGH"
                else 0
            ),

        "medium_risk":
            (
                1
                if risk_result["risk_level"] == "MEDIUM"
                else 0
            ),

        "low_risk":
            (
                1
                if risk_result["risk_level"] == "LOW"
                else 0
            ),

        "columns":
            list(df.columns),

        "validation":
            validation_result,

        "rule_findings":
            rule_findings,

        "threshold_findings":
            threshold_findings,

        "sudden_change_findings":
            sudden_change_findings,

        "missing_data_findings":
            missing_data_findings,

        "ml_anomaly_findings":
            ml_anomaly_findings,

        "risk_assessment":
            risk_result,

        "industry_risks":
            industry_risks,

        "trend_data":
            trend_data

    }


# ==================================================
# PDF COMPLIANCE REPORT
# ==================================================

@app.post("/generate-report")
async def generate_report(
    report_data: dict
):

    # -----------------------------------
    # CREATE TEMP PDF FILE
    # -----------------------------------

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    )

    pdf_path = temp_file.name

    temp_file.close()


    # -----------------------------------
    # PDF DOCUMENT
    # -----------------------------------

    document = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )


    styles = getSampleStyleSheet()

    title_style = styles["Title"]

    heading_style = styles["Heading2"]

    normal_style = styles["BodyText"]


    story = []


    # -----------------------------------
    # TITLE
    # -----------------------------------

    story.append(
        Paragraph(
            "Industrial Pollution Compliance Report",
            title_style
        )
    )

    story.append(
        Spacer(1, 15)
    )


    story.append(
        Paragraph(
            "AI-Powered Pollution Data Anomaly Detection & Compliance Monitoring",
            normal_style
        )
    )

    story.append(
        Spacer(1, 20)
    )


    # -----------------------------------
    # BASIC INFORMATION
    # -----------------------------------

    filename = report_data.get(
        "filename",
        "Uploaded CSV"
    )

    rows = report_data.get(
        "rows",
        0
    )

    industry_count = report_data.get(
        "industry_count",
        0
    )


    story.append(
        Paragraph(
            "<b>Uploaded File:</b> "
            + str(filename),
            normal_style
        )
    )

    story.append(
        Paragraph(
            "<b>Records Analysed:</b> "
            + str(rows),
            normal_style
        )
    )

    story.append(
        Paragraph(
            "<b>Industries Reviewed:</b> "
            + str(industry_count),
            normal_style
        )
    )

    story.append(
        Spacer(1, 15)
    )


    # -----------------------------------
    # RISK ASSESSMENT
    # -----------------------------------

    risk_assessment = report_data.get(
        "risk_assessment",
        {}
    )


    risk_score = risk_assessment.get(
        "risk_score",
        0
    )

    risk_level = risk_assessment.get(
        "risk_level",
        "LOW"
    )


    story.append(
        Paragraph(
            "Overall Risk Assessment",
            heading_style
        )
    )


    story.append(
        Paragraph(
            f"<b>Risk Score:</b> {risk_score}",
            normal_style
        )
    )


    story.append(
        Paragraph(
            f"<b>Risk Level:</b> {risk_level}",
            normal_style
        )
    )


    story.append(
        Spacer(1, 15)
    )


    # -----------------------------------
    # WHY FLAGGED
    # -----------------------------------

    story.append(
        Paragraph(
            "Why Flagged?",
            heading_style
        )
    )


    reasons = risk_assessment.get(
        "reasons",
        []
    )


    if reasons:

        for reason in reasons:

            story.append(
                Paragraph(
                    "• " + str(reason),
                    normal_style
                )
            )

    else:

        story.append(
            Paragraph(
                "No suspicious patterns detected.",
                normal_style
            )
        )


    story.append(
        Spacer(1, 15)
    )


    # -----------------------------------
    # INDUSTRY FINDINGS
    # -----------------------------------

    story.append(
        Paragraph(
            "Industry Findings",
            heading_style
        )
    )


    industry_risks = report_data.get(
        "industry_risks",
        []
    )


    if industry_risks:

        for industry in industry_risks:

            industry_id = industry.get(
                "industry_id",
                "Unknown"
            )

            industry_score = industry.get(
                "risk_score",
                0
            )

            industry_level = industry.get(
                "risk_level",
                "LOW"
            )

            priority = industry.get(
                "priority",
                "-"
            )

            priority_label = industry.get(
                "priority_label",
                "ROUTINE MONITORING"
            )

            # -----------------------------------
            # VERIFICATION STATUS
            # -----------------------------------

            verification_status = industry.get(
                "verification_status",
                "VERIFICATION REQUIRED"
            )


            story.append(
                Paragraph(
                    f"<b>Industry:</b> {industry_id}",
                    normal_style
                )
            )

            story.append(
                Paragraph(
                    f"<b>Risk Score:</b> {industry_score}",
                    normal_style
                )
            )

            story.append(
                Paragraph(
                    f"<b>Risk Level:</b> {industry_level}",
                    normal_style
                )
            )

            story.append(
                Paragraph(
                    f"<b>Inspection Priority:</b> #{priority}",
                    normal_style
                )
            )

            story.append(
                Paragraph(
                    f"<b>Action:</b> {priority_label}",
                    normal_style
                )
            )

            story.append(
                Paragraph(
                    f"<b>Verification Status:</b> {verification_status}",
                    normal_style
                )
            )


            industry_reasons = industry.get(
                "reasons",
                []
            )


            if industry_reasons:

                story.append(
                    Paragraph(
                        "<b>Detected Findings:</b>",
                        normal_style
                    )
                )


                for reason in industry_reasons:

                    story.append(
                        Paragraph(
                            "• " + str(reason),
                            normal_style
                        )
                    )


            story.append(
                Spacer(1, 12)
            )


    else:

        story.append(
            Paragraph(
                "No industry-specific findings detected.",
                normal_style
            )
        )


    # -----------------------------------
    # ML FINDINGS
    # -----------------------------------

    ml_findings = report_data.get(
        "ml_anomaly_findings",
        []
    )


    story.append(
        Paragraph(
            "Machine Learning Findings",
            heading_style
        )
    )


    if ml_findings:

        story.append(
            Paragraph(
                f"Isolation Forest identified "
                f"{len(ml_findings)} statistically unusual "
                f"pollution record(s).",
                normal_style
            )
        )


        for finding in ml_findings:

            story.append(
                Paragraph(
                    "• "
                    + str(
                        finding.get(
                            "message",
                            "ML anomaly detected."
                        )
                    ),
                    normal_style
                )
            )

    else:

        story.append(
            Paragraph(
                "No ML anomalies detected.",
                normal_style
            )
        )


    story.append(
        Spacer(1, 15)
    )


    # -----------------------------------
    # DISCLAIMER
    # -----------------------------------

    story.append(
        Paragraph(
            "<b>Disclaimer:</b> Risk scores indicate "
            "suspicious data patterns requiring compliance "
            "verification. They do not confirm fraud.",
            normal_style
        )
    )


    # -----------------------------------
    # BUILD PDF
    # -----------------------------------

    document.build(story)


    # -----------------------------------
    # RETURN PDF
    # -----------------------------------

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="pollution_compliance_report.pdf"
    )