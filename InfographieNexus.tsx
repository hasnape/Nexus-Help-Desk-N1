import React, { useEffect, useRef } from "react";
import type { ChartOptions, TooltipItem } from "chart.js";
import Chart from "chart.js/auto";
import { useTranslation } from "react-i18next";

const InfographieNexus: React.FC = () => {
  const { t } = useTranslation();
  const donutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const donutChartRef = useRef<Chart | null>(null);
  const radarChartRef = useRef<Chart | null>(null);
  const lineChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    // Palette couleurs
    const brilliantBlues = [
      "#7a5195",
      "#ef5675",
      "#ff764a",
      "#ffa600",
      "#003f5c",
      "#bc5090",
    ];
    const brilliantBluesBg = [
      "#7a519533",
      "#ef567533",
      "#ff764a33",
      "#ffa60033",
      "#003f5c33",
      "#bc509033",
    ];

    const processLabels = (labels: string[]) => {
      const maxLen = 16;
      return labels.map((label) => {
        if (label.length <= maxLen) return label;
        const words = label.split(" ");
        const lines: string[] = [];

        let currentLine = "";
        words.forEach((word) => {
          if ((currentLine + " " + word).trim().length > maxLen) {
            lines.push(currentLine.trim());
            currentLine = word;
          } else {
            currentLine = (currentLine + " " + word).trim();
          }
        });
        lines.push(currentLine.trim());
        return lines;
      });
    };

    const tooltipTitleCallback = (
      tooltipItems: TooltipItem<"doughnut" | "radar" | "line">[]
    ) => {
      const item = tooltipItems[0];
      const label = item.chart.data.labels?.[item.dataIndex];
      if (Array.isArray(label)) {
        return label.join(" ");
      }
      return label;
    };

    const defaultChartOptions: ChartOptions<"line" | "radar" | "doughnut"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#374151",
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          callbacks: {
            title: tooltipTitleCallback,
          },
        },
      },
      scales: {
        y: {
          ticks: { color: "#6b7280" },
          grid: { color: "#e5e7eb" },
        },
        x: {
          ticks: { color: "#6b7280" },
          grid: { display: false },
        },
      },
    };

    // Donut chart
    const featuresDonutCanvas = donutCanvasRef.current;
    if (featuresDonutCanvas) {
      if (donutChartRef.current) {
        donutChartRef.current.destroy();
        donutChartRef.current = null;
      }

      donutChartRef.current = new Chart(featuresDonutCanvas, {
        type: "doughnut",
        data: {
          labels: [
            t("infographie.features.labels.0"),
            t("infographie.features.labels.1"),
            t("infographie.features.labels.2"),
            t("infographie.features.labels.3"),
            t("infographie.features.labels.4"),
          ],
          datasets: [
            {
              label: t("infographie.features.distributionLabel"),
              data: [35, 25, 20, 15, 5],
              backgroundColor: brilliantBlues,
              borderColor: "#ffffff",
              borderWidth: 2,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          ...defaultChartOptions,
          cutout: "60%",
          scales: { y: { display: false }, x: { display: false } },
        },
      });
    }

    // Radar chart
    const securityRadarCanvas = radarCanvasRef.current;
    if (securityRadarCanvas) {
      if (radarChartRef.current) {
        radarChartRef.current.destroy();
        radarChartRef.current = null;
      }

      radarChartRef.current = new Chart(securityRadarCanvas, {
        type: "radar",
        data: {
          labels: processLabels([
            t("infographie.security.labels.0"),
            t("infographie.security.labels.1"),
            t("infographie.security.labels.2"),
            t("infographie.security.labels.3"),
            t("infographie.security.labels.4"),
          ]),
          datasets: [
            {
              label: t("infographie.security.coverageLabel"),
              data: [95, 90, 85, 98, 92],
              fill: true,
              backgroundColor: brilliantBluesBg[0],
              borderColor: brilliantBlues[0],
              pointBackgroundColor: brilliantBlues[0],
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: brilliantBlues[0],
            },
          ],
        },
        options: {
          ...defaultChartOptions,
          scales: {
            r: {
              angleLines: { color: "#d1d5db" },
              grid: { color: "#e5e7eb" },
              pointLabels: {
                color: "#374151",
                font: { size: 12, family: "'Inter', sans-serif" },
              },
              ticks: {
                color: "#6b7280",
                backdropColor: "#f0f4f8",
                stepSize: 20,
              },
              suggestedMin: 0,
              suggestedMax: 100,
            },
          },
        },
      });
    }

    // Line chart
    const satisfactionLineCanvas = lineCanvasRef.current;
    if (satisfactionLineCanvas) {
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
        lineChartRef.current = null;
      }

      lineChartRef.current = new Chart(satisfactionLineCanvas, {
        type: "line",
        data: {
          labels: [
            t("infographie.satisfaction.labels.0"),
            t("infographie.satisfaction.labels.1"),
            t("infographie.satisfaction.labels.2"),
            t("infographie.satisfaction.labels.3"),
            t("infographie.satisfaction.labels.4"),
            t("infographie.satisfaction.labels.5"),
            t("infographie.satisfaction.labels.6"),
          ],
          datasets: [
            {
              label: t("infographie.satisfaction.datasetLabel"),
              data: [72, 75, 79, 84, 88, 91, 94],
              fill: true,
              borderColor: brilliantBlues[1],
              backgroundColor: brilliantBluesBg[1],
              tension: 0.4,
              pointBackgroundColor: brilliantBlues[1],
              pointBorderColor: "#fff",
              pointRadius: 5,
              pointHoverRadius: 7,
            },
          ],
        },
        options: {
          ...defaultChartOptions,
          scales: {
            y: {
              ...defaultChartOptions.scales.y,
              suggestedMin: 65,
              suggestedMax: 100,
            },
          },
        },
      });
    }

    // Nettoyage à la destruction du composant
    return () => {
      if (donutChartRef.current) {
        donutChartRef.current.destroy();
        donutChartRef.current = null;
      }
      if (radarChartRef.current) {
        radarChartRef.current.destroy();
        radarChartRef.current = null;
      }
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
        lineChartRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-[#f0f4f8] font-sans text-gray-800">
      <header className="bg-[#003f5c] text-white p-8 text-center shadow-lg">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          {t("appName")}
        </h1>
        <p className="mt-4 text-xl md:text-2xl font-light">
          {t("infographie.header.subtitle")}
        </p>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        {/* Intro */}
        <section id="intro" className="text-center my-12">
          <h2 className="text-3xl font-bold mb-4">
            {t("infographie.intro.title")}
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-8">
            {t("infographie.intro.description")}
          </p>
          <div className="bg-white max-w-5xl mx-auto rounded-lg shadow-md p-6 border border-white/40">
            <p className="text-gray-700 font-semibold">
              {t("infographie.intro.betaStatus")}
            </p>
            <p className="text-gray-600 mt-3">
              {t("infographie.intro.objective")}
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="my-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              {t("infographie.features.title")}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mt-2">
              {t("infographie.features.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-center">
                {t("infographie.features.chartTitle")}
              </h3>
              <p className="text-center text-gray-600 mb-4">
                {t("infographie.features.chartDescription")}
              </p>
              <div
                className="chart-container"
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 600,
                  margin: "0 auto",
                  height: 300,
                  maxHeight: 400,
                }}
              >
                <canvas ref={donutCanvasRef} id="featuresDonutChart" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-5xl mb-3">🎫</div>
                <h4 className="font-bold text-lg">{t("infographie.features.cards.0.title")}</h4>
                <p className="text-gray-600 text-sm mt-1">
                  {t("infographie.features.cards.0.description")}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-5xl mb-3">🤖</div>
                <h4 className="font-bold text-lg">{t("infographie.features.cards.1.title")}</h4>
                <p className="text-gray-600 text-sm mt-1">
                  {t("infographie.features.cards.1.description")}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-5xl mb-3">🌐</div>
                <h4 className="font-bold text-lg">{t("infographie.features.cards.2.title")}</h4>
                <p className="text-gray-600 text-sm mt-1">
                  {t("infographie.features.cards.2.description")}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-5xl mb-3">📊</div>
                <h4 className="font-bold text-lg">{t("infographie.features.cards.3.title")}</h4>
                <p className="text-gray-600 text-sm mt-1">
                  {t("infographie.features.cards.3.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tech stack */}
        <section id="tech-stack" className="my-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              {t("infographie.tech.title")}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mt-2">
              {t("infographie.tech.subtitle")}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="tech-card rounded-lg p-6 border border-[#003f5c20] transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
                <h4 className="font-bold text-xl text-[#003f5c]">{t("infographie.tech.frontend.title")}</h4>
                <p className="text-gray-500 text-sm mb-4">
                  {t("infographie.tech.frontend.subtitle")}
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center">
                    <span className="font-bold text-[#7a5195] mr-2">●</span>
                    {t("infographie.tech.frontend.items.0")}
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#7a5195] mr-2">●</span>
                    {t("infographie.tech.frontend.items.1")}
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#7a5195] mr-2">●</span>
                    {t("infographie.tech.frontend.items.2")}
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#7a5195] mr-2">●</span>
                    {t("infographie.tech.frontend.items.3")}
                  </li>
                </ul>
              </div>
            <div className="tech-card rounded-lg p-6 border border-[#003f5c20] transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
              <h4 className="font-bold text-xl text-[#003f5c]">
                  {t("infographie.tech.backend.title")}
                </h4>
                <p className="text-gray-500 text-sm mb-4">
                  {t("infographie.tech.backend.subtitle")}
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center">
                    <span className="font-bold text-[#bc5090] mr-2">●</span>
                    {t("infographie.tech.backend.items.0")}
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#bc5090] mr-2">●</span>
                    {t("infographie.tech.backend.items.1")}
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#bc5090] mr-2">●</span>
                    {t("infographie.tech.backend.items.2")}
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#bc5090] mr-2">●</span>
                    {t("infographie.tech.backend.items.3")}
                  </li>
                </ul>
              </div>
              <div className="tech-card rounded-lg p-6 border border-[#003f5c20] transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
                <h4 className="font-bold text-xl text-[#003f5c]">
                  {t("infographie.tech.services.title")}
                </h4>
                <p className="text-gray-500 text-sm mb-4">
                  {t("infographie.tech.services.subtitle")}
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center">
                    <span className="font-bold text-[#ff764a] mr-2">●</span>
                    {t("infographie.tech.services.items.0")}
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#ff764a] mr-2">●</span>
                    {t("infographie.tech.services.items.1")}
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#ff764a] mr-2">●</span>
                    {t("infographie.tech.services.items.2")}
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#ff764a] mr-2">●</span>
                    {t("infographie.tech.services.items.3")}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="my-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              {t("infographie.security.sectionTitle")}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mt-2">
              {t("infographie.security.sectionSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-center">
                {t("infographie.security.title")}
              </h3>
              <p className="text-center text-gray-600 mb-4">
                {t("infographie.security.description")}
              </p>
              <div
                className="chart-container"
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 600,
                  margin: "0 auto",
                  height: 300,
                  maxHeight: 400,
                }}
              >
                <canvas id="securityRadarChart" ref={radarCanvasRef}></canvas>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-center">
                {t("infographie.security.measuresTitle")}
              </h3>
              <p className="text-center text-gray-600 mb-4">
                {t("infographie.security.measuresDescription")}
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-2xl text-green-500 mr-3">✔</span>
                  <div>
                    <h5 className="font-semibold">{t("infographie.security.measures.items.0.title")}</h5>
                    <p className="text-gray-600 text-sm">
                      {t("infographie.security.measures.items.0.description")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl text-green-500 mr-3">✔</span>
                  <div>
                    <h5 className="font-semibold">{t("infographie.security.measures.items.1.title")}</h5>
                    <p className="text-gray-600 text-sm">
                      {t("infographie.security.measures.items.1.description")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl text-green-500 mr-3">✔</span>
                  <div>
                    <h5 className="font-semibold">{t("infographie.security.measures.items.2.title")}</h5>
                    <p className="text-gray-600 text-sm">
                      {t("infographie.security.measures.items.2.description")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl text-green-500 mr-3">✔</span>
                  <div>
                    <h5 className="font-semibold">{t("infographie.security.measures.items.3.title")}</h5>
                    <p className="text-gray-600 text-sm">
                      {t("infographie.security.measures.items.3.description")}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Impact */}
        <section id="impact" className="my-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              {t("infographie.impact.title")}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mt-2">
              {t("infographie.impact.description")}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-center">
                {t("infographie.satisfaction.title")}
              </h3>
            <p className="text-center text-gray-600 mb-4">
                {t("infographie.satisfaction.description")}
            </p>
              <div
                className="chart-container h-80 md:h-96"
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 600,
                  margin: "0 auto",
                  height: 320,
                  maxHeight: 400,
                }}
              >
                <canvas id="satisfactionLineChart" ref={lineCanvasRef}></canvas>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6 flex flex-col justify-center">
              <div className="stat-card rounded-lg p-6 shadow-md text-center bg-white bg-opacity-80 backdrop-blur border border-white/20">
                <div className="text-3xl font-extrabold text-[#7a5195]">
                  {t("infographie.impact.cards.0.title")}
                </div>
                <p className="mt-2 font-semibold text-gray-700">
                  {t("infographie.impact.cards.0.description")}
                </p>
              </div>
              <div className="stat-card rounded-lg p-6 shadow-md text-center bg-white bg-opacity-80 backdrop-blur border border-white/20">
                <div className="text-3xl font-extrabold text-[#ff764a]">
                  {t("infographie.impact.cards.1.title")}
                </div>
                <p className="mt-2 font-semibold text-gray-700">
                  {t("infographie.impact.cards.1.description")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-[#003f5c] text-white mt-16 p-8 text-center">
        <h3 className="text-2xl font-bold">
          {t("infographie.footer.title")}
        </h3>
        <p className="mt-2 max-w-2xl mx-auto">
          {t("infographie.footer.description")}
        </p>
      </footer>
    </div>
  );
};

export default InfographieNexus;
