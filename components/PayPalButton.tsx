import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from './LoadingSpinner';

declare global {
  interface Window {
    paypal: any;
  }
}

interface PayPalButtonProps {
  planId: string;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ planId }) => {
  const { t } = useLanguage();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the PayPal SDK script has loaded
    if (window.paypal) {
      setSdkReady(true);
    } else {
        // Simple check if the script is on the page, but not yet loaded
        const script = document.querySelector('script[src*="paypal.com/sdk/js"]');
        if (script) {
             script.addEventListener('load', () => setSdkReady(true));
        } else {
            setError(t('paypal.error.sdkNotLoaded', {default: "PayPal SDK could not be loaded. Please refresh the page."}));
        }
    }
  }, [t]);

  useEffect(() => {
    if (sdkReady && paypalRef.current) {
        // Clear the container in case of re-renders
        paypalRef.current.innerHTML = ''; 

        try {
            window.paypal.Buttons({
                createSubscription: function(data: any, actions: any) {
                    return actions.subscription.create({
                        'plan_id': planId
                    });
                },
                onApprove: function(data: any, actions: any) {
                    // This function is called when the user successfully approves the subscription in the PayPal popup.
                    // 'data.subscriptionID' is the unique identifier for the subscription.
                    // In a real application, you would send this subscriptionID to your backend server.
                    // Your server would then verify the subscription status with PayPal and update the user's plan in your database.
                    alert(t('paypal.onApprove.alert', { subscriptionId: data.subscriptionID }));
                    // e.g., fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ subscriptionID: data.subscriptionID }) });
                },
                onError: function(err: any) {
                    // This function is called for any errors that occur during the subscription process.
                    console.error('PayPal Subscription Error:', err);
                    setError(t('paypal.error.generic', {default: "An error occurred with the PayPal transaction. Please try again."}));
                },
                onCancel: function(data: any) {
                    // This function is called when the user closes the PayPal popup without completing the subscription.
                     console.log('PayPal subscription cancelled:', data);
                }
            }).render(paypalRef.current);
        } catch (e: any) {
            console.error("Failed to render PayPal buttons:", e);
            setError(t('paypal.error.renderFailed', {default: "Could not render PayPal buttons. Please try again later."}));
        }
    }
  }, [sdkReady, planId, t]);

  if (error) {
    return <div className="text-center py-3 px-4 bg-red-100 text-red-700 font-semibold rounded-md text-sm">{error}</div>;
  }

  if (!sdkReady) {
    return <div className="flex justify-center items-center h-12"><LoadingSpinner size="md" /></div>;
  }
  
  return <div ref={paypalRef} id={`paypal-button-container-${planId}`}></div>;
};

export default PayPalButton;
