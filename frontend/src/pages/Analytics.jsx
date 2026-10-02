import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

function Analytics({ analysisResult }) {

  const riskChartData = [
    {
      name: "High",
      value: analysisResult?.high_risk || 0
    },
    {
      name: "Medium",
      value: analysisResult?.medium_risk || 0
    },
    {
      name: "Low",
      value: analysisResult?.low_risk || 0
    }
  ];

  const trendData =
    analysisResult?.trend_data || [];

  return (
    <div className="dashboard">

      <div className="header">

        <h1>Analytics</h1>

        <p>
          Pollution trends, anomaly patterns and
          AI detection insights.
        </p>

      </div>

      <div className="risk-cards">

        <div className="risk-card total">
          <h3>Records</h3>
          <div className="number">
            {analysisResult?.rows || 0}
          </div>
        </div>

        <div className="risk-card high">
          <h3>ML Anomalies</h3>
          <div className="number">
            {analysisResult?.ml_anomaly_findings?.length || 0}
          </div>
        </div>

        <div className="risk-card medium">
          <h3>Rule Findings</h3>
          <div className="number">
            {(analysisResult?.rule_findings?.length || 0) +
            (analysisResult?.threshold_findings?.length || 0) +
            (analysisResult?.sudden_change_findings?.length || 0) +
            (analysisResult?.missing_data_findings?.length || 0)}
          </div>
        </div>

        <div className="risk-card low">
          <h3>Industries</h3>
          <div className="number">
            {analysisResult?.industry_count || 0}
          </div>
        </div>

      </div>

      <div className="section-card">

        <h2>📊 Risk Distribution</h2>

        {analysisResult ? (

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart data={riskChartData}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis dataKey="name" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="value"
                name="Industries"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        ) : (

          <div className="alert">
            Upload CSV data to display risk analytics.
          </div>

        )}

      </div>

      <div className="section-card">

        <h2>📈 Pollution Trend Analysis</h2>

        <p>
          BOD, COD and TSS values across uploaded observations.
        </p>

        {trendData.length > 0 ? (

          <ResponsiveContainer
            width="100%"
            height={380}
          >

            <LineChart data={trendData}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="BOD"
                name="BOD"
                stroke="#ef4444"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="COD"
                name="COD"
                stroke="#f59e0b"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="TSS"
                name="TSS"
                stroke="#3b82f6"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        ) : (

          <div className="alert">
            Pollution trend data will appear after CSV analysis.
          </div>

        )}

      </div>

      <div className="section-card">

        <h2>🤖 AI Detection Pipeline</h2>

        <div className="alert">
          1️⃣ Data Validation
        </div>

        <div className="alert">
          2️⃣ Rule-Based Detection
        </div>

        <div className="alert">
          3️⃣ Isolation Forest ML
        </div>

        <div className="alert">
          4️⃣ Risk Score Calculation
        </div>

        <div className="alert">
          5️⃣ Compliance Verification
        </div>

      </div>

    </div>
  );
}

export default Analytics;