function Inspections({
  analysisResult,
  verificationStatus,
  updateVerificationStatus
}) {

  const industries =
    [...(analysisResult?.industry_risks || [])]
      .sort(
        (a, b) =>
          (b.risk_score || 0) -
          (a.risk_score || 0)
      );

  return (
    <div className="dashboard">

      <div className="header">

        <h1>Inspections</h1>

        <p>
          AI-assisted inspection priority and
          compliance verification workflow.
        </p>

      </div>

      <div className="section-card">

        <h2>🔎 Inspection Workflow</h2>

        <div className="alert">
          1️⃣ Review AI risk score
        </div>

        <div className="alert">
          2️⃣ Review suspicious findings
        </div>

        <div className="alert">
          3️⃣ Perform field verification
        </div>

        <div className="alert">
          4️⃣ Update verification status
        </div>

      </div>

      {!analysisResult && (

        <div className="section-card">

          <div className="alert">
            No inspection data available.
            Upload pollution data first.
          </div>

        </div>

      )}

      {analysisResult && (

        <div className="section-card">

          <h2>🚨 Inspection Priority</h2>

          {industries.map(
            (industry, index) => {

              const status =
                verificationStatus[
                  industry.industry_id
                ] ||
                "VERIFICATION REQUIRED";

              return (

                <div
                  className="industry-detail-card"
                  key={industry.industry_id}
                >

                  <div className="industry-detail-header">

                    <div>

                      <h3>
                        #{index + 1} —{" "}
                        🏭 {industry.industry_id}
                      </h3>

                      <span>
                        Risk Score:{" "}
                        <strong>
                          {industry.risk_score}
                        </strong>
                      </span>

                    </div>

                    <div
                      className={`risk-badge ${
                        industry.risk_level?.toLowerCase()
                      }`}
                    >
                      {industry.risk_level}
                    </div>

                  </div>

                  <div className="industry-detail-info">

                    <div>
                      <strong>
                        Priority Action:
                      </strong>{" "}
                      {industry.priority_label ||
                        "Compliance verification"}
                    </div>

                    <div>
                      <strong>
                        Status:
                      </strong>{" "}
                      {status}
                    </div>

                  </div>

                  <h4>
                    🔍 Why this industry requires review
                  </h4>

                  {industry.reasons?.length > 0 ? (

                    industry.reasons.map(
                      (reason, reasonIndex) => (

                        <div
                          className="finding-item"
                          key={reasonIndex}
                        >
                          ⚠️ {reason}
                        </div>

                      )
                    )

                  ) : (

                    <div className="finding-item safe">
                      No suspicious findings.
                    </div>

                  )}

                  <div className="verification-buttons">

                    <button
                      className="review-button"
                      onClick={() =>
                        updateVerificationStatus(
                          industry.industry_id,
                          "UNDER REVIEW"
                        )
                      }
                    >
                      🔎 Start Review
                    </button>

                    <button
                      className="verified-button"
                      onClick={() =>
                        updateVerificationStatus(
                          industry.industry_id,
                          "MARKED VERIFIED"
                        )
                      }
                    >
                      ✅ Mark Verified
                    </button>

                  </div>

                </div>

              );
            }
          )}

        </div>

      )}

      <div className="section-card">

        <div className="alert">

          ⚠️ AI risk scores are prioritisation signals
          for compliance verification. They do not
          independently establish fraud or violations.

        </div>

      </div>

    </div>
  );
}

export default Inspections;