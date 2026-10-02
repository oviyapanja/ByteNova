function Satellite({ analysisResult }) {

  const industries =
    analysisResult?.industry_risks || [];

  const satelliteImage =
    "https://www.igik.edu.pl/upload/2019-08-28_Sentinel-2_CIR_Czajka_4_OPIS.png";

  return (
    <div className="dashboard">

      <div className="header">

        <h1>Satellite Verification</h1>

        <p>
          Satellite-style supporting evidence
          for environmental compliance inspection.
        </p>

      </div>

      <div className="section-card">

        <h2>🛰️ Satellite Monitoring</h2>

        <div className="alert">

          DEMO MODE — The displayed imagery is
          reference imagery and is not linked to
          a specific industry location.

        </div>

        <div className="satellite-demo-panel">

          <div className="satellite-demo-title">
            🛰️ Sentinel-2 Reference Imagery
          </div>

          <div className="satellite-info-row">

            <strong>
              Verification Mode:
            </strong>

            <span>
              DEMO / SIMULATED
            </span>

          </div>

          <div className="satellite-info-row">

            <strong>
              Satellite:
            </strong>

            <span>
              Sentinel-2 Reference Imagery
            </span>

          </div>

          <div className="satellite-info-row">

            <strong>
              GIS Coordinates:
            </strong>

            <span>
              Not configured
            </span>

          </div>

          <div className="satellite-image-wrap">

            <img
              src={satelliteImage}
              alt="Sentinel-2 reference imagery"
              className="satellite-demo-image"
            />

            <p className="satellite-image-caption">
              Sentinel-2 reference imagery — DEMO ONLY
            </p>

          </div>

          <div className="satellite-warning">

            ⚠️ This image does not confirm pollution,
            discharge or fraud.

          </div>

          <div className="satellite-next-step">

            🔗 Future Integration:
            Sentinel-2 imagery + GIS coordinates +
            before/after environmental comparison.

          </div>

        </div>

      </div>

      <div className="section-card">

        <h2>🏭 Industry Satellite Verification</h2>

        {industries.length === 0 ? (

          <div className="alert">
            Upload pollution data to associate
            industries with the verification workflow.
          </div>

        ) : (

          industries.map(
            (industry, index) => (

              <div
                className="alert"
                key={index}
              >

                🏭{" "}
                <strong>
                  {industry.industry_id}
                </strong>

                {" — "}

                Risk Score:{" "}
                {industry.risk_score}

                {" — "}

                Satellite verification:
                {" "}
                DEMO

              </div>

            )
          )

        )}

      </div>

    </div>
  );
}

export default Satellite;