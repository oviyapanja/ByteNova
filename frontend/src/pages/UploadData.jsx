import { useState } from "react";
import axios from "axios";

function UploadData({
  analysisResult,
  setAnalysisResult,
  setActivePage
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData
      );

      setAnalysisResult(response.data);

      alert(
        `Analysis completed!\n\nRisk Score: ${
          response.data.risk_assessment?.risk_score ?? 0
        }\nRisk Level: ${
          response.data.risk_assessment?.risk_level ?? "UNKNOWN"
        }`
      );
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(
          err.response.data?.detail ||
            "Upload failed."
        );
      } else {
        setError(
          "Upload failed. Make sure backend server is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csv = `industry_id,industry_name,date,pH,BOD,COD,TSS,flow_rate,temperature
IND001,Factory A,2026-09-01,7.2,31,108,43,120,28
IND001,Factory A,2026-09-02,7.1,30,110,45,121,28
IND001,Factory A,2026-09-03,7.2,32,107,42,119,27
IND002,Factory B,2026-09-01,7.4,45,150,60,135,29
IND002,Factory B,2026-09-02,7.3,44,152,61,134,29`;

    const blob = new Blob(
      [csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "sample_pollution_data.csv";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const risk = analysisResult?.risk_assessment;

  const breakdown = risk?.score_breakdown || {};

  const comparisons = risk?.comparisons || {};

  const limitAnalysis =
    comparisons?.limit_analysis || {};

  const historicalAnalysis =
    comparisons?.historical_analysis || {};

  const peerAnalysis =
    comparisons?.peer_analysis || {};

  const variationAnalysis =
    comparisons?.variation_analysis || {};

  const getRiskClass = (level) => {
    if (level === "HIGH") return "high";
    if (level === "MEDIUM") return "medium";
    return "low";
  };

  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return "N/A";
    }

    return Number(value).toFixed(2);
  };

  return (
    <div className="dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="header">
        <h1>Upload Pollution Data</h1>

        <p>
          Upload industrial pollution CSV data
          for AI-powered anomaly detection and
          compliance risk monitoring.
        </p>
      </div>


      {/* =====================================================
          UPLOAD SECTION
      ===================================================== */}

      <div className="section-card">

        <h2>📤 CSV Data Upload</h2>

        <p>
          Required columns:
        </p>

        <div className="alert">
          industry_id, industry_name, date, pH,
          BOD, COD, TSS, flow_rate, temperature
        </div>

        <div
          style={{
            marginTop: "25px",
            padding: "35px",
            border: "2px dashed #334155",
            borderRadius: "14px",
            textAlign: "center"
          }}
        >

          <input
            type="file"
            accept=".csv"
            onChange={(event) => {
              setFile(event.target.files[0]);
              setError("");
            }}
          />

          {file && (
            <p>
              Selected:{" "}
              <strong>{file.name}</strong>
            </p>
          )}

          <div style={{ marginTop: "20px" }}>

            <button
              className="sample-button"
              onClick={downloadSampleCSV}
            >
              ⬇️ Download Sample CSV
            </button>

            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={loading}
              style={{
                marginLeft: "10px",
                padding: "12px 22px",
                borderRadius: "8px",
                border: "none"
              }}
            >
              {loading
                ? "Analysing..."
                : "🚀 Upload & Analyse"}
            </button>

          </div>

        </div>

        {error && (
          <div className="alert">
            ⚠️ {error}
          </div>
        )}

      </div>


      {/* =====================================================
          ANALYSIS RESULT
      ===================================================== */}

      {analysisResult && (
        <>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="risk-cards">

            <div className="risk-card total">
              <h3>Total Industries</h3>

              <div className="number">
                {analysisResult.industry_count || 0}
              </div>
            </div>


            <div className="risk-card high">
              <h3>High Risk</h3>

              <div className="number">
                {analysisResult.high_risk || 0}
              </div>
            </div>


            <div className="risk-card medium">
              <h3>Medium Risk</h3>

              <div className="number">
                {analysisResult.medium_risk || 0}
              </div>
            </div>


            <div className="risk-card low">
              <h3>Low Risk</h3>

              <div className="number">
                {analysisResult.low_risk || 0}
              </div>
            </div>

          </div>


          {/* =================================================
              OVERALL RISK
          ================================================= */}

          {risk && (
            <div className="section-card">

              <h2>🤖 AI Comparative Risk Assessment</h2>

              <div
                className={`alert ${getRiskClass(
                  risk.risk_level
                )}`}
              >

                <strong>
                  Risk Score:
                </strong>{" "}

                {risk.risk_score}/100

                <br />

                <strong>
                  Risk Level:
                </strong>{" "}

                {risk.risk_level}

              </div>


              {/* =================================================
                  SCORE BREAKDOWN
              ================================================= */}

              <h3>
                📊 Why This Risk Score?
              </h3>

              <p>
                Risk score is calculated using multiple
                mathematical and AI signals.
              </p>

              <div
                className="risk-cards"
                style={{
                  marginTop: "15px"
                }}
              >

                <div className="risk-card total">
                  <h3>Reference Limit</h3>

                  <div className="number">
                    {breakdown.limit_proximity !== null &&
                    breakdown.limit_proximity !== undefined
                      ? `${formatNumber(
                          breakdown.limit_proximity
                        )}%`
                      : "N/A"}
                  </div>
                </div>


                <div className="risk-card medium">
                  <h3>Historical Deviation</h3>

                  <div className="number">
                    {breakdown.historical_deviation !== null &&
                    breakdown.historical_deviation !== undefined
                      ? `${formatNumber(
                          breakdown.historical_deviation
                        )}%`
                      : "N/A"}
                  </div>
                </div>


                <div className="risk-card total">
                  <h3>Peer Deviation</h3>

                  <div className="number">
                    {breakdown.peer_deviation !== null &&
                    breakdown.peer_deviation !== undefined
                      ? `${formatNumber(
                          breakdown.peer_deviation
                        )}%`
                      : "N/A"}
                  </div>
                </div>


                <div className="risk-card medium">
                  <h3>Variation Signal</h3>

                  <div className="number">
                    {breakdown.variation_anomaly !== null &&
                    breakdown.variation_anomaly !== undefined
                      ? `${formatNumber(
                          breakdown.variation_anomaly
                        )}`
                      : "N/A"}
                  </div>
                </div>


                <div className="risk-card high">
                  <h3>Rule Signal</h3>

                  <div className="number">
                    {formatNumber(
                      breakdown.rule_signal
                    )}
                  </div>
                </div>


                <div className="risk-card high">
                  <h3>ML Signal</h3>

                  <div className="number">
                    {formatNumber(
                      breakdown.ml_anomaly
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}


          {/* =================================================
              REFERENCE LIMIT COMPARISON
          ================================================= */}

          <div className="section-card">

            <h2>
              📏 Current vs Reference Limit
            </h2>

            <p>
              Current average pollution values are
              compared with prototype reference limits.
            </p>

            {Object.keys(limitAnalysis).length > 0 ? (

              <div
                style={{
                  overflowX: "auto",
                  marginTop: "15px"
                }}
              >

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse"
                  }}
                >

                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Current Average</th>
                      <th>Reference Limit</th>
                      <th>Proximity</th>
                    </tr>
                  </thead>

                  <tbody>

                    {Object.entries(
                      limitAnalysis
                    ).map(
                      ([parameter, data]) => (

                        <tr key={parameter}>

                          <td>
                            <strong>
                              {parameter}
                            </strong>
                          </td>

                          <td>
                            {formatNumber(
                              data.current_average
                            )}
                          </td>

                          <td>
                            {formatNumber(
                              data.reference_limit
                            )}
                          </td>

                          <td>
                            {formatNumber(
                              data.proximity_percent
                            )}
                            %
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="alert">
                Reference comparison data unavailable.
              </div>

            )}

            <div className="alert">
              ⚠️ Prototype reference values are used
              for demonstration and are not universal
              legal limits.
            </div>

          </div>


          {/* =================================================
              HISTORICAL COMPARISON
          ================================================= */}

          <div className="section-card">

            <h2>
              📈 Historical Comparison
            </h2>

            {historicalAnalysis.available ? (

              <>

                <p>
                  Comparison:
                  <strong>
                    {" "}
                    {historicalAnalysis.comparison}
                  </strong>
                </p>

                <div
                  style={{
                    overflowX: "auto"
                  }}
                >

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse"
                    }}
                  >

                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Current Average</th>
                        <th>Historical Average</th>
                        <th>Deviation</th>
                      </tr>
                    </thead>

                    <tbody>

                      {Object.entries(
                        historicalAnalysis.parameters || {}
                      ).map(
                        ([parameter, data]) => (

                          <tr key={parameter}>

                            <td>
                              <strong>
                                {parameter}
                              </strong>
                            </td>

                            <td>
                              {formatNumber(
                                data.current_average
                              )}
                            </td>

                            <td>
                              {formatNumber(
                                data.historical_average
                              )}
                            </td>

                            <td>
                              {formatNumber(
                                data.deviation_percent
                              )}
                              %
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </>

            ) : (

              <div className="alert">
                ℹ️{" "}
                {historicalAnalysis.message ||
                  "Historical baseline unavailable."}
              </div>

            )}

          </div>


          {/* =================================================
              PEER INDUSTRY COMPARISON
          ================================================= */}

          <div className="section-card">

            <h2>
              🏭 Similar Industry Comparison
            </h2>

            {peerAnalysis.available ? (

              Object.entries(
                peerAnalysis.parameters || {}
              ).map(
                ([parameter, data]) => (

                  <div
                    key={parameter}
                    style={{
                      marginBottom: "25px"
                    }}
                  >

                    <h3>
                      {parameter}
                    </h3>

                    <p>
                      Overall peer average:{" "}
                      <strong>
                        {formatNumber(
                          data.overall_peer_average
                        )}
                      </strong>
                    </p>

                    {Object.entries(
                      data.industries || {}
                    ).map(
                      ([industryId, industryData]) => (

                        <div
                          className="alert"
                          key={industryId}
                        >

                          <strong>
                            {industryId}
                          </strong>

                          {" — Current: "}

                          {formatNumber(
                            industryData.current_average
                          )}

                          {" | Peer Average: "}

                          {formatNumber(
                            industryData.peer_average
                          )}

                          {" | Deviation: "}

                          {formatNumber(
                            industryData.deviation_percent
                          )}

                          %

                        </div>

                      )
                    )}

                  </div>

                )
              )

            ) : (

              <div className="alert">
                ℹ️{" "}
                {peerAnalysis.message ||
                  "Peer comparison unavailable."}
              </div>

            )}

          </div>


          {/* =================================================
              MATHEMATICAL VARIATION ANALYSIS
          ================================================= */}

          <div className="section-card">

            <h2>
              🧮 Mathematical Variation Analysis
            </h2>

            <p>
              The system analyses mean, standard
              deviation, coefficient of variation
              and value uniqueness.
            </p>

            {Object.keys(
              variationAnalysis
            ).length > 0 ? (

              <div
                style={{
                  overflowX: "auto"
                }}
              >

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse"
                  }}
                >

                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Mean</th>
                      <th>Std Dev</th>
                      <th>CV %</th>
                      <th>Unique %</th>
                      <th>Variation Signal</th>
                    </tr>
                  </thead>

                  <tbody>

                    {Object.entries(
                      variationAnalysis
                    ).map(
                      ([parameter, data]) => (

                        <tr key={parameter}>

                          <td>
                            <strong>
                              {parameter}
                            </strong>
                          </td>

                          <td>
                            {formatNumber(
                              data.mean
                            )}
                          </td>

                          <td>
                            {formatNumber(
                              data.standard_deviation
                            )}
                          </td>

                          <td>
                            {formatNumber(
                              data.coefficient_of_variation
                            )}
                            %
                          </td>

                          <td>
                            {formatNumber(
                              data.unique_ratio_percent
                            )}
                            %
                          </td>

                          <td>
                            {formatNumber(
                              data.variation_anomaly_score
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="alert">
                Variation analysis unavailable.
              </div>

            )}

          </div>


          {/* =================================================
              WHY FLAGGED
          ================================================= */}

          {risk && (

            <div className="section-card">

              <h2>
                🔍 Why Flagged?
              </h2>

              {risk.reasons?.length > 0 ? (

                risk.reasons.map(
                  (reason, index) => (

                    <div
                      className="alert"
                      key={index}
                    >
                      🚨 {reason}
                    </div>

                  )
                )

              ) : (

                <div className="alert">
                  ✅ No suspicious patterns detected.
                </div>

              )}

            </div>

          )}


          {/* =================================================
              DETECTION SUMMARY
          ================================================= */}

          <div className="section-card">

            <h2>
              🧠 Detection Summary
            </h2>

            <p>
              Records analysed:{" "}
              <strong>
                {analysisResult.rows || 0}
              </strong>
            </p>

            <p>
              ML anomalies:{" "}
              <strong>
                {analysisResult.ml_anomaly_findings?.length || 0}
              </strong>
            </p>

            <p>
              Rule findings:{" "}
              <strong>
                {(analysisResult.rule_findings?.length || 0) +
                  (analysisResult.threshold_findings?.length || 0) +
                  (analysisResult.sudden_change_findings?.length || 0) +
                  (analysisResult.missing_data_findings?.length || 0)}
              </strong>
            </p>

            <button
              className="sample-button"
              onClick={() =>
                setActivePage("industries")
              }
            >
              🏭 View Industry Analysis
            </button>

          </div>


          {/* =================================================
              DISCLAIMER
          ================================================= */}

          <div className="section-card">

            <div className="alert">

              ⚠️ <strong>Important:</strong>{" "}
              Risk scores indicate suspicious
              pollution-data patterns that may
              require compliance verification.
              They do not by themselves confirm
              fraud or wrongdoing.

            </div>

          </div>

        </>
      )}

    </div>
  );
}

export default UploadData;