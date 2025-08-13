
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
  onSuccess: (subscriptionID: string) => void;
  onError: (error: any) => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ planId, onSuccess, onError: onPaymentError }) => {
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
                style: {
                    shape: 'rect',
                    color: 'gold',
                    layout: 'vertical',
                    label: 'subscribe'
                },
                createSubscription: function(data: any, actions: any) {
                    return actions.subscription.create({
                        'plan_id': planId
                    });
                },
                onApprove: function(data: any, actions: any) {
                   if (data.subscriptionID) {
                       onSuccess(data.subscriptionID);
                   } else {
                       onPaymentError(new Error("No subscriptionID received from PayPal."));
                   }
                },
                onError: function(err: any) {
                    onPaymentError(err);
                },
                onCancel: function(data: any) {
                     console.log('PayPal subscription cancelled:', data);
                }
            }).render(paypalRef.current);
        } catch (e: any) {
            console.error("Failed to render PayPal buttons:", e);
            setError(t('paypal.error.renderFailed', {default: "Could not render PayPal buttons. Please try again later."}));
        }
    }
  }, [sdkReady, planId, t, onSuccess, onPaymentError]);

  if (error) {
    return <div className="text-center py-3 px-4 bg-red-100 text-red-700 font-semibold rounded-md text-sm">{error}</div>;
  }

  if (!sdkReady) {
    return <div className="flex justify-center items-center h-12"><LoadingSpinner size="md" /></div>;
  }
  
  return <div ref={paypalRef} id={`paypal-button-container-${planId}`}></div>;
}

export default PayPalButton;