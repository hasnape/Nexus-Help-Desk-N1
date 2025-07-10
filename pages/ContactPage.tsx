import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../App";
import LoadingSpinner from "../components/LoadingSpinner";

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
  </svg>
);

const ContactPageContent: React.FC = () => {
  const { t } = useTranslation(["contact", "common"]);
  const { user } = useApp();
  const location = useLocation();

  // If user is logged in, link back to their dashboard, otherwise to the landing page.
  const backLinkDestination = user ? "/dashboard" : "/landing";
  const backLinkText = user
    ? t("common.actions.backToDashboard")
    : t("contact.backToHome");
  const emailAddress = t("contact.email.address");

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full mx-auto">
        <div className="mb-6">
          <Link
            to={backLinkDestination}
            state={{ from: location }}
            className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 me-2" />
            {backLinkText}
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
                {t("contact.title")}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base">
                {t("contact.subtitle")}
              </p>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Email Section */}
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <MailIcon className="w-6 h-6 text-primary mr-3" />
                  <h2 className="text-xl font-semibold text-slate-800">
                    {t("contact.email.title")}
                  </h2>
                </div>
                <p className="text-slate-600 mb-4">
                  {t("contact.email.description")}
                </p>
                <a
                  href={`mailto:${emailAddress}`}
                  className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm bg-white px-4 py-2 rounded-lg border border-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <MailIcon className="w-4 h-4 mr-2" />
                  {emailAddress}
                </a>
              </div>

              {/* Support Hours */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">
                  {t("contact.supportHours.title")}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      {t("contact.supportHours.weekdays")}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {t("contact.supportHours.weekdaysTime")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      {t("contact.supportHours.weekends")}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {t("contact.supportHours.weekendsTime")}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-sm text-slate-500">
                      {t("contact.supportHours.note")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                {t("contact.form.title")}
              </h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t("contact.form.firstName")}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={t("contact.form.firstNamePlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t("contact.form.lastName")}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={t("contact.form.lastNamePlaceholder")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("contact.form.email")}
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("contact.form.emailPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("contact.form.subject")}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("contact.form.subjectPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("contact.form.message")}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("contact.form.messagePlaceholder")}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors font-semibold"
                >
                  {t("contact.form.submit")}
                </button>
              </form>
            </div>

            {/* Additional Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                {t("contact.additionalInfo.title")}
              </h2>
              <div className="space-y-3">
                <p className="text-blue-700">
                  <strong>{t("contact.additionalInfo.responseTime")}:</strong>{" "}
                  {t("contact.additionalInfo.responseTimeValue")}
                </p>
                <p className="text-blue-700">
                  <strong>{t("contact.additionalInfo.languages")}:</strong>{" "}
                  {t("contact.additionalInfo.languagesValue")}
                </p>
                <p className="text-blue-700">
                  <strong>{t("contact.additionalInfo.urgentMatters")}:</strong>{" "}
                  {t("contact.additionalInfo.urgentMattersValue")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactPage: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ContactPageContent />
    </Suspense>
  );
};

export default ContactPage;
