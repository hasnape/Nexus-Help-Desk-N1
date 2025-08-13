import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const InfographieNexus: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
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

    const tooltipTitleCallback = (tooltipItems: any) => {
      const item = tooltipItems[0];
      let label = item.chart.data.labels[item.dataIndex];
      if (Array.isArray(label)) {
        return label.join(" ");
      }
      return label;
    };

    const defaultChartOptions = {
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
    const featuresDonutCtx = document.getElementById(
      "featuresDonutChart"
    ) as HTMLCanvasElement | null;
    if (featuresDonutCtx) {
      if (donutChartRef.current) donutChartRef.current.destroy();
      donutChartRef.current = new Chart(featuresDonutCtx, {
        type: "doughnut",
        data: {
          labels: [
            "Gestion des Tickets",
            "Assistant IA",
            "Analytique & Rapports",
            "Portails & Rôles",
            "Intégrations",
          ],
          datasets: [
            {
              label: "Répartition des Fonctionnalités",
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
    const securityRadarCtx = document.getElementById(
      "securityRadarChart"
    ) as HTMLCanvasElement | null;
    if (securityRadarCtx) {
      if (radarChartRef.current) radarChartRef.current.destroy();
      radarChartRef.current = new Chart(securityRadarCtx, {
        type: "radar",
        data: {
          labels: processLabels([
            "Authentification & Sessions",
            "Protection des Données (XSS, CSRF)",
            "Conformité (RGPD)",
            "Gestion des Permissions",
            "Sécurité des Intégrations API",
          ]),
          datasets: [
            {
              label: "Niveau de Couverture",
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
    const satisfactionLineCtx = document.getElementById(
      "satisfactionLineChart"
    ) as HTMLCanvasElement | null;
    if (satisfactionLineCtx) {
      if (lineChartRef.current) lineChartRef.current.destroy();
      lineChartRef.current = new Chart(satisfactionLineCtx, {
        type: "line",
        data: {
          labels: [
            "Lancement",
            "Mois 1",
            "Mois 2",
            "Mois 3",
            "Mois 4",
            "Mois 5",
            "Mois 6",
          ],
          datasets: [
            {
              label: "Satisfaction Client (CSAT %)",
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
      donutChartRef.current?.destroy();
      radarChartRef.current?.destroy();
      lineChartRef.current?.destroy();
    };
  }, []);

  return (
    <div className="bg-[#f0f4f8] font-sans text-gray-800">
      <header className="bg-[#003f5c] text-white p-8 text-center shadow-lg">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          Nexus Support Hub
        </h1>
        <p className="mt-4 text-xl md:text-2xl font-light">
          Révolutionner la Gestion du Support Client avec l'IA
        </p>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        {/* Intro */}
        <section id="intro" className="text-center my-12">
          <h2 className="text-3xl font-bold mb-4">
            Le défi : une expérience client exigeante
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-8">
            Dans un monde numérique, les clients attendent des réponses rapides,
            personnalisées et efficaces. Les entreprises peinent à centraliser
            les demandes, à réduire les temps de traitement et à offrir un
            support multilingue de qualité. C'est ici que Nexus Support Hub
            intervient.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="stat-card rounded-lg p-6 shadow-md bg-white bg-opacity-80 backdrop-blur border border-white/20">
              <div className="text-5xl font-extrabold text-[#bc5090]">86%</div>
              <p className="mt-2 font-semibold text-gray-700">
                des clients sont prêts à payer plus pour une meilleure
                expérience.
              </p>
            </div>
            <div className="stat-card rounded-lg p-6 shadow-md bg-white bg-opacity-80 backdrop-blur border border-white/20">
              <div className="text-5xl font-extrabold text-[#ef5675]">40%</div>
              <p className="mt-2 font-semibold text-gray-700">
                de productivité en plus attendus grâce à l'IA dans le support.
              </p>
            </div>
            <div className="stat-card rounded-lg p-6 shadow-md bg-white bg-opacity-80 backdrop-blur border border-white/20">
              <div className="text-5xl font-extrabold text-[#ff764a]">7j/7</div>
              <p className="mt-2 font-semibold text-gray-700">
                est la nouvelle norme d'accessibilité attendue par les
                utilisateurs.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="my-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              Une Solution Complète et Intelligente
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mt-2">
              Nexus Support Hub centralise toutes les facettes du support client
              dans une interface unifiée, conçue pour l'efficacité et la
              simplicité.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-center">
                Répartition des fonctionnalités clés
              </h3>
              <p className="text-center text-gray-600 mb-4">
                La plateforme est équilibrée entre la gestion des requêtes,
                l'intelligence artificielle et les outils analytiques pour
                offrir une solution complète.
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
                <canvas ref={chartRef} id="featuresDonutChart" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-5xl mb-3">🎫</div>
                <h4 className="font-bold text-lg">Gestion de Tickets</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Création, suivi et résolution des demandes dans un flux de
                  travail optimisé.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-5xl mb-3">🤖</div>
                <h4 className="font-bold text-lg">Assistant IA Gemini</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Réponses automatiques et suggestions intelligentes pour
                  accélérer la résolution.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-5xl mb-3">🌐</div>
                <h4 className="font-bold text-lg">Support Multilingue</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Interface en Français, Anglais et Arabe pour une portée
                  globale.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-5xl mb-3">📊</div>
                <h4 className="font-bold text-lg">Tableaux de Bord</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Statistiques en temps réel pour suivre la performance des
                  équipes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tech stack */}
        <section id="tech-stack" className="my-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              Une Architecture Moderne et Robuste
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mt-2">
              Nexus est construit sur des technologies de pointe, garantissant
              performance, scalabilité et une expérience utilisateur fluide.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="tech-card rounded-lg p-6 border border-[#003f5c20] transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
                <h4 className="font-bold text-xl text-[#003f5c]">Frontend</h4>
                <p className="text-gray-500 text-sm mb-4">
                  Interface réactive et ultra-rapide
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center">
                    <span className="font-bold text-[#7a5195] mr-2">●</span>
                    React (TypeScript)
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#7a5195] mr-2">●</span>
                    Vite
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#7a5195] mr-2">●</span>
                    Tailwind CSS
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#7a5195] mr-2">●</span>
                    React Router
                  </li>
                </ul>
              </div>
              <div className="tech-card rounded-lg p-6 border border-[#003f5c20] transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
                <h4 className="font-bold text-xl text-[#003f5c]">
                  Backend & BDD
                </h4>
                <p className="text-gray-500 text-sm mb-4">
                  Données sécurisées et temps réel
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center">
                    <span className="font-bold text-[#bc5090] mr-2">●</span>
                    Supabase
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#bc5090] mr-2">●</span>
                    Auth & JWT
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#bc5090] mr-2">●</span>
                    Base de données PostgreSQL
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#bc5090] mr-2">●</span>
                    API REST Temps Réel
                  </li>
                </ul>
              </div>
              <div className="tech-card rounded-lg p-6 border border-[#003f5c20] transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
                <h4 className="font-bold text-xl text-[#003f5c]">
                  Services & Intégrations
                </h4>
                <p className="text-gray-500 text-sm mb-4">
                  Fonctionnalités étendues
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center">
                    <span className="font-bold text-[#ff764a] mr-2">●</span>
                    Google Gemini AI
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#ff764a] mr-2">●</span>
                    EmailJS
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#ff764a] mr-2">●</span>
                    i18next
                  </li>
                  <li className="flex items-center">
                    <span className="font-bold text-[#ff764a] mr-2">●</span>
                    PayPal API
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
              La Sécurité comme Priorité Absolue
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mt-2">
              Une approche multi-couches pour protéger vos données et celles de
              vos clients, en conformité avec les normes les plus strictes.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-center">
                Couverture des Domaines de Sécurité
              </h3>
              <p className="text-center text-gray-600 mb-4">
                Nexus implémente des mesures robustes sur tous les fronts, de
                l'authentification à la conformité des données.
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
                <canvas id="securityRadarChart"></canvas>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-center">
                Mesures de Protection
              </h3>
              <p className="text-center text-gray-600 mb-4">
                Chaque interaction est sécurisée par des pratiques standards de
                l'industrie pour prévenir les attaques courantes.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-2xl text-green-500 mr-3">✔</span>
                  <div>
                    <h5 className="font-semibold">Authentification Forte</h5>
                    <p className="text-gray-600 text-sm">
                      JWT & OAuth via Supabase pour des sessions sécurisées.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl text-green-500 mr-3">✔</span>
                  <div>
                    <h5 className="font-semibold">Politique CSP Stricte</h5>
                    <p className="text-gray-600 text-sm">
                      Protection contre les attaques XSS et le détournement de
                      contenu.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl text-green-500 mr-3">✔</span>
                  <div>
                    <h5 className="font-semibold">Permissions par Rôle</h5>
                    <p className="text-gray-600 text-sm">
                      Accès aux données strictement limité selon le profil
                      (user, agent, manager).
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl text-green-500 mr-3">✔</span>
                  <div>
                    <h5 className="font-semibold">Conformité RGPD</h5>
                    <p className="text-gray-600 text-sm">
                      Respect des bonnes pratiques de gestion des données
                      personnelles.
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
              Un Impact Mesurable sur votre Performance
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mt-2">
              L'adoption de Nexus se traduit par des gains concrets en
              efficacité et en satisfaction client, visibles dès les premiers
              mois.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-center">
                Projection de la Satisfaction Client
              </h3>
              <p className="text-center text-gray-600 mb-4">
                L'automatisation intelligente et la rapidité de traitement ont
                un effet direct et positif sur la perception de votre service
                par les clients.
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
                <canvas id="satisfactionLineChart"></canvas>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6 flex flex-col justify-center">
              <div className="stat-card rounded-lg p-6 shadow-md text-center bg-white bg-opacity-80 backdrop-blur border border-white/20">
                <div className="text-5xl font-extrabold text-[#7a5195]">
                  -35%
                </div>
                <p className="mt-2 font-semibold text-gray-700">
                  Temps de résolution moyen des tickets
                </p>
              </div>
              <div className="stat-card rounded-lg p-6 shadow-md text-center bg-white bg-opacity-80 backdrop-blur border border-white/20">
                <div className="text-5xl font-extrabold text-[#ff764a]">
                  +25%
                </div>
                <p className="mt-2 font-semibold text-gray-700">
                  Tickets traités par agent par jour
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-[#003f5c] text-white mt-16 p-8 text-center">
        <h3 className="text-2xl font-bold">
          Prêt à transformer votre support client ?
        </h3>
        <p className="mt-2 max-w-2xl mx-auto">
          Nexus Support Hub est la solution innovante, sécurisée et évolutive
          pour les entreprises qui visent l'excellence.
        </p>
      </footer>
    </div>
  );
};

export default InfographieNexus;
