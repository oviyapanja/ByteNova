function Dashboard({
  analysisResult
}) {
  const risk = analysisResult?.risk_assessment;

  const industries =
    analysisResult?.industry_risks || [];

  const mlCount =
    analysisResult?.ml_anomaly_findings?.length || 0;

  const ruleCount =
    (analysisResult?.rule_findings?.length || 0) +
    (analysisResult?.threshold_findings?.length || 0) +
    (analysisResult?.sudden_change_findings?.length || 0) +
    (analysisResult?.missing_data_findings?.length || 0);

  return (
    <div className="dashboard">

      {/* HEADER */}

      <div className="header">

        <div>
          <h1>
            AI Data Analysis & Risk Monitoring Dashboard
          </h1>

          <p>
            AI-powered pollution data anomaly detection
            & compliance monitoring overview.
          </p>
        </div>

        <div className="dashboard-status">
          <span className="status-dot"></span>
          AI Engine Active
        </div>

      </div>


      {/* SUMMARY CARDS */}

      <div className="risk-cards">

        <div className="risk-card total">
          <div className="card-icon">🏭</div>

          <h3>Total Industries</h3>

          <div className="number">
            {analysisResult?.industry_count || 0}
          </div>

          <span className="card-label">
            Monitored
          </span>
        </div>


        <div className="risk-card high">
          <div className="card-icon">🚨</div>

          <h3>High Risk</h3>

          <div className="number">
            {analysisResult?.high_risk || 0}
          </div>

          <span className="card-label">
            Priority verification
          </span>
        </div>


        <div className="risk-card medium">
          <div className="card-icon">⚠️</div>

          <h3>Medium Risk</h3>

          <div className="number">
            {analysisResult?.medium_risk || 0}
          </div>

          <span className="card-label">
            Requires review
          </span>
        </div>


        <div className="risk-card low">
          <div className="card-icon">✓</div>

          <h3>Low Risk</h3>

          <div className="number">
            {analysisResult?.low_risk || 0}
          </div>

          <span className="card-label">
            Routine monitoring
          </span>
        </div>

      </div>


      {/* AI STATUS */}

      <div className="section-card">

        <div className="section-title-row">

          <div>
            <h2>🤖 AI Monitoring Status</h2>

            <p>
              Current pollution data analysis engine status.
            </p>
          </div>

          <span className="live-badge">
            ● LIVE
          </span>

        </div>


        <div className="risk-cards compact">

          <div className="mini-stat">

            <span className="mini-stat-icon">
              📋
            </span>

            <div>
              <span>
                Records Analysed
              </span>

              <strong>
                {analysisResult?.rows || 0}
              </strong>
            </div>

          </div>


          <div className="mini-stat">

            <span className="mini-stat-icon">
              🧠
            </span>

            <div>
              <span>
                ML Anomalies
              </span>

              <strong>
                {mlCount}
              </strong>
            </div>

          </div>


          <div className="mini-stat">

            <span className="mini-stat-icon">
              🔎
            </span>

            <div>
              <span>
                Rule Findings
              </span>

              <strong>
                {ruleCount}
              </strong>
            </div>

          </div>


          <div className="mini-stat">

            <span className="mini-stat-icon">
              🌲
            </span>

            <div>
              <span>
                ML Model
              </span>

              <strong>
                Isolation Forest
              </strong>
            </div>

          </div>

        </div>

      </div>


      {/* LATEST ANALYSIS */}

      <div className="section-card">

        <div className="section-title-row">

          <div>
            <h2>🎯 Latest Risk Assessment</h2>

            <p>
              Most recent AI-based pollution anomaly assessment.
            </p>
          </div>

        </div>


        {risk ? (

          <div className="latest-risk">

            <div className="score-panel">

              <span>
                Overall Risk Score
              </span>

              <strong>
                {risk.risk_score}
              </strong>

              <small>
                out of 100
              </small>

            </div>


            <div className="risk-info">

              <span className="risk-info-label">
                Risk Level
              </span>

              <div
                className={`risk-badge ${
                  risk.risk_level?.toLowerCase()
                }`}
              >
                {risk.risk_level}
              </div>

              <p>
                {risk.risk_level === "HIGH"
                  ? "Priority compliance verification required."
                  : risk.risk_level === "MEDIUM"
                  ? "Additional review is recommended."
                  : "Routine monitoring recommended."
                }
              </p>

            </div>

          </div>

        ) : (

          <div className="empty-state">

            <div className="empty-icon">
              📊
            </div>

            <h3>
              No analysis available
            </h3>

            <p>
              Upload pollution monitoring data from the
              <strong> Upload Data </strong>
              section to generate AI risk analysis.
            </p>

          </div>

        )}

      </div>


      {/* RECENT FINDINGS */}

      {risk && (

        <div className="section-card">

          <div className="section-title-row">

            <div>
              <h2>🚨 Recent Findings</h2>

              <p>
                Suspicious data patterns detected by the system.
              </p>
            </div>

          </div>


          {risk.reasons?.length > 0 ? (

            risk.reasons
              .slice(0, 5)
              .map((reason, index) => (

                <div
                  className="finding-item"
                  key={index}
                >

                  <span className="finding-number">
                    {index + 1}
                  </span>

                  <span>
                    {reason}
                  </span>

                </div>

              ))

          ) : (

            <div className="finding-item safe">
              ✓ No suspicious findings detected.
            </div>

          )}

        </div>

      )}


      {/* INDUSTRY MONITORING */}

      <div className="section-card">

        <div className="section-title-row">

          <div>
            <h2>🏭 Industry Monitoring</h2>

            <p>
              Current industry-level risk overview.
            </p>
          </div>

        </div>


        {industries.length > 0 ? (

          industries
            .slice(0, 5)
            .map((industry, index) => (

              <div
                className="industry-row"
                key={index}
              >

                <div className="industry-name">

                  <span className="industry-number">
                    {index + 1}
                  </span>

                  <div>

                    <strong>
                      {industry.industry_id}
                    </strong>

                    <small>
                      Industry monitoring
                    </small>

                  </div>

                </div>


                <div className="industry-score">

                  <span>
                    Score
                  </span>

                  <strong>
                    {industry.risk_score}
                  </strong>

                </div>


                <div
                  className={`risk-badge ${
                    industry.risk_level?.toLowerCase()
                  }`}
                >
                  {industry.risk_level}
                </div>

              </div>

            ))

        ) : (

          <div className="empty-state small">

            <p>
              Industry risk data will appear after
              CSV analysis.
            </p>

          </div>

        )}

      </div>


      {/* DISCLAIMER */}

      <div className="compliance-disclaimer">

        <span>⚠️</span>

        <p>
          <strong>Important:</strong>{" "}
          Risk scores indicate suspicious data patterns
          requiring compliance verification. They do not
          independently confirm fraud.
        </p>

      </div>

    </div>
  );
}

export default Dashboard;