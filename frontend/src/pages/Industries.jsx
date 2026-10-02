function Industries({
  analysisResult,
  verificationStatus,
  updateVerificationStatus
}) {

  const industries =
    analysisResult?.industry_risks || [];

  return (
    <div className="dashboard">

      <div className="header">

        <div>

          <h1>
            Industry Monitoring
          </h1>

          <p>
            Industry-wise pollution risk and
            anomaly findings.
          </p>

        </div>

        <div className="dashboard-status">
          <span className="status-dot"></span>
          Monitoring Active
        </div>

      </div>


      {/* SUMMARY */}

      <div className="risk-cards">

        <div className="risk-card total">

          <div className="card-icon">
            🏭
          </div>

          <h3>
            Industries
          </h3>

          <div className="number">
            {analysisResult?.industry_count || 0}
          </div>

        </div>


        <div className="risk-card high">

          <div className="card-icon">
            🚨
          </div>

          <h3>
            High Risk
          </h3>

          <div className="number">
            {analysisResult?.high_risk || 0}
          </div>

        </div>


        <div className="risk-card medium">

          <div className="card-icon">
            ⚠️
          </div>

          <h3>
            Medium Risk
          </h3>

          <div className="number">
            {analysisResult?.medium_risk || 0}
          </div>

        </div>


        <div className="risk-card low">

          <div className="card-icon">
            ✓
          </div>

          <h3>
            Low Risk
          </h3>

          <div className="number">
            {analysisResult?.low_risk || 0}
          </div>

        </div>

      </div>


      {!analysisResult ? (

        <div className="section-card">

          <div className="empty-state">

            <div className="empty-icon">
              🏭
            </div>

            <h2>
              No Industry Data Available
            </h2>

            <p>
              Industry-wise risk information will appear
              here after pollution data analysis.
            </p>

            <p className="helper-text">
              Use <strong>Upload Data</strong> from the
              sidebar to analyse a CSV file.
            </p>

          </div>

        </div>

      ) : (

        <div className="section-card">

          <div className="section-title-row">

            <div>

              <h2>
                🏭 Industry Risk Details
              </h2>

              <p>
                Review AI-generated risk findings and
                compliance verification status.
              </p>

            </div>

          </div>


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
                  key={index}
                >

                  <div className="industry-detail-header">

                    <div>

                      <h3>
                        {industry.industry_id}
                      </h3>

                      <span>
                        Priority #{index + 1}
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


                  <div className="industry-metrics">

                    <div>
                      <span>
                        Risk Score
                      </span>

                      <strong>
                        {industry.risk_score}/100
                      </strong>
                    </div>


                    <div>
                      <span>
                        Verification
                      </span>

                      <strong>
                        {status}
                      </strong>
                    </div>

                  </div>


                  <div className="verification-box">

                    <strong>
                      Compliance Verification
                    </strong>

                    <p>
                      Update the review status after
                      appropriate verification.
                    </p>


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
                        🔎 Under Review
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
                        ✓ Mark as Verified
                      </button>

                    </div>

                  </div>


                  <h4>
                    🔍 Detected Findings
                  </h4>


                  {industry.reasons?.length > 0 ? (

                    industry.reasons.map(
                      (reason, reasonIndex) => (

                        <div
                          className="finding-item"
                          key={reasonIndex}
                        >

                          <span className="finding-number">
                            {reasonIndex + 1}
                          </span>

                          <span>
                            {reason}
                          </span>

                        </div>

                      )
                    )

                  ) : (

                    <div className="finding-item safe">
                      ✓ No suspicious findings detected.
                    </div>

                  )}

                </div>

              );
            }
          )}

        </div>

      )}


      <div className="compliance-disclaimer">

        <span>⚠️</span>

        <p>
          Industry risk scores are AI-assisted indicators
          for compliance verification and do not independently
          confirm fraud.
        </p>

      </div>

    </div>
  );
}

export default Industries;