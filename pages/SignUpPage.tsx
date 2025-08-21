import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../App";
import { Button, Input, Select } from "../components/FormElements";
import { useLanguage, Locale } from "../contexts/LanguageContext";
import { UserRole } from "../types";
import Layout from "../components/Layout";

const paypalLinks = {
  freemium: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-3KG35083B1716942TNBYOA4Q",
  standard: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0E515487AE797135CNBTRYKA",
  pro: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-7HP75881LB3608938NBTBGUA",
};

const FreemiumModal = ({
  showFreemiumModal,
  setShowFreemiumModal,
  handleFreemiumPurchase,
  t,
}: {
  showFreemiumModal: boolean;
  setShowFreemiumModal: (show: boolean) => void;
  handleFreemiumPurchase: () => void;
  t: (key: string, options?: { [key: string]: any }) => string;
}) => {
  if (!showFreemiumModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("signupPlans.Freemium.modal.title", {
                default: "Offre Freemium - Détails",
              })}
            </h2>
            <button
              onClick={() => setShowFreemiumModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-primary">1€</span>
                <span className="text-gray-600 text-lg">
                  {t("signupPlans.Freemium.modal.pricing", {
                    default: "mois",
                  })}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t("signupPlans.Freemium.modal.features.title", {
                  default: "Fonctionnalités Freemium",
                })}
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.Freemium.modal.features.unlimited", {
                    default: "3 Agents, 200 Tickets mois",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.Freemium.modal.features.voice", {
                    default: "Commandes vocales avancées",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.Freemium.modal.features.multilingual", {
                    default: "Support multilingue (FR/EN)",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.Freemium.modal.features.appointments", {
                    default: "Planification de rendez-vous",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.Freemium.modal.features.priority", {
                    default: "Support mail",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.Freemium.modal.features.analytics", {
                    default: "Statistiques avancées",
                  })}
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                {t("signupPlans.Freemium.modal.trial.title", {
                  default: "1€ par mois",
                })}
              </h4>
              <p className="text-blue-800 text-sm">
                {t("signupPlans.Freemium.modal.trial.description", {
                  default:
                    "Commencez pour seulement 1€ par mois. Annulez à tout moment.",
                })}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">
                {t("signupPlans.Freemium.modal.billing.title", {
                  default: "Facturation et annulation",
                })}
              </h4>
              <p className="text-yellow-800 text-sm">
                {t("signupPlans.Freemium.modal.billing.description", {
                  default:
                    "Facturation mensuelle via PayPal. Annulation simple depuis votre compte PayPal à tout moment. Pas d'engagement à long terme.",
                })}
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setShowFreemiumModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                {t("signupPlans.Freemium.modal.buttons.cancel", {
                  default: "Annuler",
                })}
              </Button>
              <a
                href={paypalLinks.freemium}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleFreemiumPurchase}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t("signupPlans.Freemium.modal.buttons.subscribe", {
                  default: "S'abonner Freemium",
                })}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProModal = ({
  showProModal,
  setShowProModal,
  handleProPurchase,
  t,
}: {
  showProModal: boolean;
  setShowProModal: (show: boolean) => void;
  handleProPurchase: () => void;
  t: (key: string, options?: { [key: string]: any }) => string;
}) => {
  if (!showProModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("signupPlans.pro.modal.title", {
                default: "Offre Pro - Détails",
              })}
            </h2>
            <button
              onClick={() => setShowProModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-primary">20€</span>
                <span className="text-gray-600 text-lg">
                  {t("signupPlans.pro.modal.pricing", {
                    default: "mois",
                  })}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t("signupPlans.pro.modal.features.title", {
                  default: "Fonctionnalités Pro",
                })}
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.pro.modal.features.unlimited", {
                    default: "10 Agents, 1000 Tickets mois",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.pro.modal.features.voice", {
                    default: "Commandes vocales avancées",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.pro.modal.features.multilingual", {
                    default: "Support multilingue (FR/EN/AR)",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.pro.modal.features.appointments", {
                    default: "Planification de rendez-vous",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.pro.modal.features.priority", {
                    default: "Support prioritaire",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.pro.modal.features.analytics", {
                    default: "Statistiques avancées",
                  })}
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                {t("signupPlans.pro.modal.trial.title", {
                  default: "Essai à 1€ pour une semaine",
                })}
              </h4>
              <p className="text-blue-800 text-sm">
                {t("signupPlans.pro.modal.trial.description", {
                  default:
                    "Commencez votre essai d'une semaine pour seulement 1€. Annulez à tout moment avant la fin de la semaine pour éviter la facturation complète.",
                })}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">
                {t("signupPlans.pro.modal.billing.title", {
                  default: "Facturation et annulation",
                })}
              </h4>
              <p className="text-yellow-800 text-sm">
                {t("signupPlans.pro.modal.billing.description", {
                  default:
                    "Facturation mensuelle via PayPal. Annulation simple depuis votre compte PayPal à tout moment. Pas d'engagement à long terme.",
                })}
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setShowProModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                {t("signupPlans.pro.modal.buttons.cancel", {
                  default: "Annuler",
                })}
              </Button>
              <a
                href={paypalLinks.pro}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleProPurchase}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t("signupPlans.pro.modal.buttons.subscribe", {
                  default: "S'abonner Pro",
                })}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StandardModal = ({
  showStandardModal,
  setShowStandardModal,
  handleStandardPurchase,
  t,
}: {
  showStandardModal: boolean;
  setShowStandardModal: (show: boolean) => void;
  handleStandardPurchase: () => void;
  t: (key: string, options?: { [key: string]: any }) => string;
}) => {
  if (!showStandardModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("signupPlans.standard.modal.title", {
                default: "Offre Standard - Détails",
              })}
            </h2>
            <button
              onClick={() => setShowStandardModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-primary">10€</span>
                <span className="text-gray-600 text-lg">
                  {t("signupPlans.standard.modal.pricing", {
                    default: "mois",
                  })}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t("signupPlans.standard.modal.features.title", {
                  default: "Fonctionnalités Standard",
                })}
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.standard.modal.features.unlimited", {
                    default: "5 Agents, 500 Tickets mois",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.standard.modal.features.ia", {
                    default: "Fonctionnalités IA complètes",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.standard.modal.features.categorization", {
                    default: "Catégorisation automatique",
                  })}
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("signupPlans.standard.modal.features.sla", {
                    default: "SLA standard",
                  })}
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                {t("signupPlans.standard.modal.trial.title", {
                  default: "Essai à 1€ pour une semaine",
                })}
              </h4>
              <p className="text-blue-800 text-sm">
                {t("signupPlans.standard.modal.trial.description", {
                  default:
                    "Commencez votre essai d'une semaine pour seulement 1€. Annulez à tout moment avant la fin de la semaine pour éviter la facturation complète.",
                })}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">
                {t("signupPlans.standard.modal.billing.title", {
                  default: "Facturation et annulation",
                })}
              </h4>
              <p className="text-yellow-800 text-sm">
                {t("signupPlans.standard.modal.billing.description", {
                  default:
                    "Facturation mensuelle via PayPal. Annulation simple depuis votre compte PayPal à tout moment. Pas d'engagement à long terme.",
                })}
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowStandardModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                {t("signupPlans.standard.modal.buttons.cancel", { default: "Annuler" })}
              </Button>
              <a
                href={paypalLinks.standard}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleStandardPurchase}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t("signupPlans.standard.modal.buttons.subscribe", { default: "S'abonner Standard" })}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlanCard = ({
  plan,
  isSelected,
  onSelect,
  t,
}: {
  plan: string;
  isSelected: boolean;
  onSelect: (plan: string) => void;
  t: (key: string, options?: { [key: string]: any }) => string;
}) => {
  const plans = {
    freemium: {
      name: t("pricing.freemium.name"),
      price: t("pricing.freemium.price"),
      desc: t("pricing.freemium.desc"),
      features: [
        t("pricing.freemium.feature1"),
        t("pricing.freemium.feature2"),
        t("pricing.freemium.feature3"),
      ],
      buttonText: t("signupPlans.freemium.select", {
        default: "Sélectionner",
      }),
      popular: false,
    },
    standard: {
      name: t("pricing.standard.name"),
      price: t("pricing.standard.price"),
      desc: t("pricing.standard.desc"),
      features: [
        t("pricing.standard.feature1"),
        t("pricing.standard.feature2"),
        t("pricing.standard.feature3"),
        t("pricing.standard.feature4"),
      ],
      buttonText: t("signupPlans.standard.select", {
        default: "Sélectionner",
      }),
      popular: true,
    },
    pro: {
      name: t("pricing.pro.name"),
      price: t("pricing.pro.price"),
      desc: t("pricing.pro.desc"),
      features: [
        t("pricing.pro.feature1"),
        t("pricing.pro.feature2"),
        t("pricing.pro.feature3"),
        t("pricing.pro.feature4"),
      ],
      buttonText: t("signupPlans.pro.select", {
        default: "Voir les détails",
      }),
      popular: false,
    },
  };

  const planData = plans[plan as keyof typeof plans];

  return (
    <div
      className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? "border-primary bg-primary/5 shadow-lg"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      {planData.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
            {t("pricing.popular")}
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {planData.name}
        </h3>
        <div className="mb-2">
          <span className="text-3xl font-bold text-primary">
            {planData.price}
          </span>
          {plan !== "freemium" && (
            <span className="text-gray-600 ml-1">
              {t("pricing.perAgentPerMonth")}
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm">{planData.desc}</p>
      </div>

      <ul className="space-y-3 mb-6">
        {planData.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={() => onSelect(plan)}
        className={`w-full ${
          isSelected
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {planData.buttonText}
      </Button>
    </div>
  );
};

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Locale>("en");
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [secretCode, setSecretCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showFreemiumModal, setShowFreemiumModal] = useState(false);
  const [showStandardModal, setShowStandardModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);


  const { signUp, user } = useApp();
  const { t, language: currentAppLang } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const languageOptions: { value: Locale; label: string }[] = [
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
    { value: "ar", label: "العربية" },
  ];

  const roleOptions = [
    { value: UserRole.USER, label: t("userRole.user") },
    { value: UserRole.AGENT, label: t("userRole.agent") },
    { value: UserRole.MANAGER, label: t("userRole.manager") },
  ];

  useEffect(() => {
    setSelectedLanguage(currentAppLang);
  }, [currentAppLang]);


const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

  // 2. Les validations de base (champs vides, mots de passe) restent ici. C'est une bonne pratique.
    if (!email.trim() || !fullName.trim() || !password || !confirmPassword || !companyName.trim()) {
      setError(t("signup.error.allFieldsRequired"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("signup.error.passwordsDoNotMatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("signup.error.minCharsPassword"));
      return;
    }
    // Si le rôle est Manager, on s'assure que le champ du code n'est pas vide.
    // La VRAIE validation (si le code est bon) se fera sur le serveur.
    if (role === UserRole.MANAGER && !secretCode.trim()) {
      setError(t("signup.error.secretCodeRequiredManager"));
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    // 3. L'appel à signUp reste le même. C'est parfait.
    // On envoie toutes les données au serveur, y compris le secretCode.
    const result = await signUp(email.trim(), fullName.trim(), password, {
      lang: selectedLanguage,
      role: role,
      companyName: companyName.trim(),
      // On envoie le code SEULEMENT si le rôle est Manager.
      secretCode: role === UserRole.MANAGER ? secretCode.trim() : undefined,
    });

    setIsLoading(false);

    // 4. On fait confiance à la réponse du serveur.
    // Si le serveur dit que le code est mauvais, `result` contiendra un message d'erreur.
    if (result !== true) {
      // Le `result` contiendra le message d'erreur renvoyé par le serveur,
      // par exemple : "Code d'activation invalide ou déjà utilisé."
      setError(result); 
    } else {
      // Le serveur a tout validé, l'inscription est réussie !
      if (role === UserRole.MANAGER) {
        setSuccess(t("signup.success.emailSentManager", { email: email.trim() }));
      } else {
        setSuccess(t("signup.success.emailSent", { email: email.trim() }));
      }

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);

    if (plan === "pro") {
      setShowProModal(true);
      setShowStandardModal(false);
      setShowFreemiumModal(false);
    } else if (plan === "standard") {
      setShowStandardModal(true);
      setShowProModal(false);
      setShowFreemiumModal(false);
    } else if (plan === "freemium") {
      setShowFreemiumModal(true);
      setShowProModal(false);
      setShowStandardModal(false);
    } else {
      setShowProModal(false);
      setShowStandardModal(false);
      setShowFreemiumModal(false);
    }
  };

  const handleProPurchase = () => {
    setShowProModal(false);
    alert("✅ Abonnement Pro : Code envoyer par mail !");
  };

  const handleFreemiumPurchase = () => {
    setShowFreemiumModal(false);
    alert("✅ Abonnement Freemium : Code envoyer par mail !");
  };

  const handleStandardPurchase = () => {
    setShowStandardModal(false);
    alert("✅ Abonnement Standard : Code envoyer par mail !");
  };

  const offersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (role === UserRole.MANAGER && offersRef.current) {
      offersRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [role]);

  return (
    <Layout>
      {showProModal && (
        <ProModal
          showProModal={showProModal}
          setShowProModal={setShowProModal}
          handleProPurchase={handleProPurchase}
          t={t}
        />
      )}

      {showFreemiumModal && (
        <FreemiumModal
          showFreemiumModal={showFreemiumModal}
          setShowFreemiumModal={setShowFreemiumModal}
          handleFreemiumPurchase={handleFreemiumPurchase}
          t={t}
        />
      )}

      {showStandardModal && (
        <StandardModal
          showStandardModal={showStandardModal}
          setShowStandardModal={setShowStandardModal}
          handleStandardPurchase={handleStandardPurchase}
          t={t}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-surface rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <img
                  src="https://yt3.ggpht.com/vbfaZncvDLBv7B4Xo9mFggNozPaGAaGMkwciDaL-UtdLClEQmWB5blCibQacHzdrI1RL_5C9_g=s108-c-k-c0x00ffffff-no-rj"
                  alt="Nexus Support Hub Logo"
                  className="w-16 h-16 mx-auto mb-2 rounded-full object-cover"
                />
                <h1 className="text-3xl font-bold text-textPrimary">
                  {t("signup.title")}
                </h1>
                <p className="text-textSecondary mt-1">
                  {t("signup.subtitle")}
                </p>
              </div>

              {error && (
                <p className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-md border border-red-200">
                  {error}
                </p>
              )}

              {success && (
                <div className="mb-4 text-center text-green-600 bg-green-100 p-3 rounded-md border border-green-200">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold">Inscription réussie !</span>
                  </div>
                  <p className="text-sm">{success}</p>
                  <p className="text-xs mt-2 text-green-500">
                    Redirection vers la connexion...
                  </p>
                </div>
              )}

              {role === UserRole.MANAGER && !success && (
                <div className="mb-8" ref={offersRef}>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-textPrimary mb-2">
                      {t("signupPlans.title", {
                        default: "Choisissez votre plan",
                      })}
                    </h2>
                    <p className="text-textSecondary">
                      {t("signupPlans.subtitle", {
                        default:
                          "Sélectionnez le plan qui correspond le mieux aux besoins de votre équipe.",
                      })}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 border-l-4 border-yellow-400 rounded-lg p-6 mb-8 shadow-md text-center">
                    <p className="text-yellow-900 font-bold text-lg sm:text-xl">
                      Freemium : <span className="font-semibold">1€/mois</span> &nbsp;|&nbsp; 
                      Standard : <span className="font-semibold">1er mois 5€ ensuite 10€/mois</span> &nbsp;|&nbsp; 
                      Pro : <span className="font-semibold">1er mois 12€ ensuite 20€/mois</span>
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <PlanCard
                      plan="freemium"
                      isSelected={selectedPlan === "freemium"}
                      onSelect={handlePlanSelect}
                      t={t}
                    />
                    <PlanCard
                      plan="standard"
                      isSelected={selectedPlan === "standard"}
                      onSelect={handlePlanSelect}
                      t={t}
                    />
                    <PlanCard
                      plan="pro"
                      isSelected={selectedPlan === "pro"}
                      onSelect={handlePlanSelect}
                      t={t}
                    />
                  </div>
                </div>
              )}

              {!success && (
                <div className="max-w-md mx-auto">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                      label={t("signup.emailLabel")}
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                      }
                      placeholder={t("signup.emailPlaceholder")}
                      autoFocus
                      required
                      disabled={isLoading}
                    />
                    <Input
                      label={t("signup.fullNameLabel")}
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFullName(e.target.value)
                      }
                      placeholder={t("signup.fullNamePlaceholder")}
                      required
                      disabled={isLoading}
                    />
                    <Input
                      label={t("signup.passwordLabel")}
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                      placeholder={t("signup.passwordPlaceholder")}
                      required
                      disabled={isLoading}
                    />
                    <Input
                      label={t("signup.confirmPasswordLabel")}
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder={t("signup.confirmPasswordPlaceholder")}
                      required
                      disabled={isLoading}
                    />

                    <Select
                      label={t("signup.roleLabel")}
                      id="role"
                      value={role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setRole(e.target.value as UserRole)
                      }
                      options={roleOptions}
                      required
                      disabled={isLoading}
                    />

                    {role === UserRole.MANAGER && (
                      <div>
                        <div className="flex items-center gap-2">
                          <Input
                            label={t("activationKeyLabel")}
                            id="activationKey"
                            type="text"
                            value={secretCode}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setSecretCode(e.target.value)}
                            placeholder={t("activationKeyPlaceholder")}
                            required
                            disabled={isLoading}
                          />
                          <div className="relative group">
                            <button
                              type="button"
                              className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold"
                              tabIndex={0}
                            >
                              ?
                            </button>
                            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-white border border-slate-200 rounded shadow-lg text-xs text-slate-700 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition pointer-events-none group-hover:pointer-events-auto z-20">
                              {t("activationKey.help", {
                                default:
                                  "Pour obtenir le code d’activation, contactez le support Nexus ou consultez votre email de bienvenue après l’achat du plan.",
                              })}
                            </div>
                          </div>
                        </div>
                        <p
                          className={`mt-1 text-xs px-1 text-slate-500 ${
                            selectedLanguage === "ar" ? "text-right" : ""
                          }`}
                          dir={selectedLanguage === "ar" ? "rtl" : "ltr"}
                        >
                          {t("activationKeyInfo")}
                        </p>
                      </div>
                    )}

                    <div>
                      <Input
                        label={
                          role === UserRole.MANAGER
                            ? t("signup.companyNameLabel")
                            : t("signup.existingCompanyNameLabel")
                        }
                        id="companyName"
                        type="text"
                        value={companyName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setCompanyName(e.target.value)
                        }
                        placeholder={
                          role === UserRole.MANAGER
                            ? t("signup.companyNamePlaceholder")
                            : t("signup.existingCompanyNamePlaceholder")
                        }
                        required
                        disabled={isLoading}
                      />
                      <p className="mt-1 text-xs text-slate-500 px-1">
                        {role === UserRole.MANAGER
                          ? t("signup.companyNameHelp.manager", {
                              default:
                                "This name must be unique. Your team will use it to sign up and log in.",
                            })
                          : t("signup.companyNameHelp.employee", {
                              default:
                                "Enter the exact company name provided by your manager.",
                            })}
                      </p>
                    </div>

                    <Select
                      label={t("signup.languageLabel")}
                      id="language"
                      value={selectedLanguage}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSelectedLanguage(e.target.value as Locale)
                      }
                      options={languageOptions.map((opt) => ({
                        ...opt,
                        label: t(`language.${opt.value}`, {
                          default: opt.label,
                        }),
                      }))}
                      required
                      disabled={isLoading}
                    />

                    <Button
                      type="submit"
                      className="w-full !mt-8"
                      size="lg"
                      isLoading={isLoading}
                      disabled={isLoading}
                    >
                      {t("signup.signUpButton")}
                    </Button>
                  </form>
                </div>
              )}
              <div className="mt-6 text-sm text-center text-slate-500 space-y-2">
                <p>
                  {t("signup.alreadyHaveAccount")}{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:text-primary-dark"
                  >
                    {t("signup.signInLink")}
                  </Link>
                </p>
                <p>
                  <Link
                    to="/landing"
                    className="inline-flex items-center font-medium text-slate-600 hover:text-primary-dark"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 me-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("signup.backToHome", { default: "Back to Plans" })}
                  </Link>
                </p>
              </div>
              <p className="mt-4 text-xs text-center text-slate-400">
                {t("login.demoNotes.supabase.production")}
              </p>
              <div className="mt-6 pt-4 border-t border-slate-200 text-center">
                <Link
                  to="/legal"
                  className="text-xs text-slate-500 hover:text-primary hover:underline"
                >
                  {t("footer.legalLink", { default: "Legal & Documentation" })}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUpPage;