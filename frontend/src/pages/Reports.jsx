import axios from "axios";

function Reports({
  analysisResult,
  verificationStatus
}) {

  const generatePDFReport = async () => {

    if (!analysisResult) {
      alert(
        "Please upload and analyse a CSV file first."
      );
      return;
    }

    try {

      const reportData = {

        ...analysisResult,

        industry_risks:
          (analysisResult.industry_risks || [])
            .map((industry) => ({

              ...industry,

              verification_status:
                verificationStatus[
                  industry.industry_id
                ] ||
                "VERIFICATION REQUIRED"

            }))

      };

      const response = await axios.post(
        "http://127.0.0.1:8000/generate-report",
        reportData,
        {
          responseType: "blob"
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf"
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "pollution_compliance_report.pdf";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error(error);

      alert(
        "PDF report generation failed. Please make sure the backend is running."
      );

    }
  };

  return (
    <div className="dashboard">

      <div className="header">

        <h1>Reports</h1>

        <p>
          Compliance reports and AI analysis summaries.
        </p>

      </div>

      <div className="section-card">

        <h2>📄 Compliance Report</h2>

        {!analysisResult ? (

          <div className="alert">
            No analysed data available.
            Upload a CSV file first.
          </div>

        ) : (

          <>

            <div className="risk-cards">

              <div className="risk-card total">
                <h3>Industries</h3>
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

            <div className="alert">

              Overall Risk Score:{" "}
              <strong>
                {analysisResult.risk_assessment?.risk_score || 0}
              </strong>

              {" / 100"}

              <br />

              Risk Level:{" "}
              <strong>
                {analysisResult.risk_assessment?.risk_level || "UNKNOWN"}
              </strong>

            </div>

            <button
              className="pdf-button"
              onClick={generatePDFReport}
            >
              📄 Generate & Download PDF Report
            </button>

          </>

        )}

      </div>

      {analysisResult && (

        <div className="section-card">

          <h2>📋 Report Contents</h2>

          <div className="alert">
            ✅ Data validation results
          </div>

          <div className="alert">
            ✅ Rule-based anomaly findings
          </div>

          <div className="alert">
            ✅ Isolation Forest ML anomalies
          </div>

          <div className="alert">
            ✅ Industry-wise risk scores
          </div>

          <div className="alert">
            ✅ Verification status
          </div>

          <div className="alert">
            ✅ Compliance review recommendations
          </div>

        </div>

      )}

      <div className="section-card">

        <div className="alert">

          ⚠️ Reports present suspicious-pattern
          detection results for compliance verification.
          They do not independently confirm fraud.

        </div>

      </div>

    </div>
  );
}

export default Reports;