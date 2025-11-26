"use client";

import { Sheet, SheetRef } from 'react-modal-sheet';
import { useState, useEffect, useRef } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from "@/lib/stripe/client";
import { convertToSubcurrency } from '@/utils/convertToSubcurrency';
import { useTransform } from 'framer-motion';
import { useLocale } from 'next-intl';
import { redirectUrl } from '@/utils/redirectUrl';


export default function CheckoutSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<SheetRef>(null);

  const amount: number = 500;

  const paddingBottom = useTransform(() => {
    return ref.current?.y.get() ?? 0;
  });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Open Checkout
      </button>
      <Sheet
        ref={ref}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        snapPoints={[0, 500, 1]}
        initialSnap={1}
      >
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content
          scrollStyle={{ paddingBottom }}
          
          // 💡 Recommendation: disable drag for the content so that it doesn't interfere with scrolling
          disableDrag
          >
            <div className='p-2'>
              <Elements
              stripe={stripePromise}
              options={{
                mode: 'payment',
                amount: convertToSubcurrency(amount),
                currency: 'eur'
              }}
              >
                <CheckoutForm amount={amount}/>
              </Elements>

            </div>
            
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={() => setIsOpen(false)} />
      </Sheet>
    </>
  );
}

function CheckoutForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();

  const locale = useLocale();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(false);

  
  const successRedirect = redirectUrl(locale, `/success?amount=${amount}`);

  useEffect(() => {
    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: convertToSubcurrency(amount), currency: 'eur' }),
    })
    .then((res) => res.json())
    .then((data) => setClientSecret(data.clientSecret))
  }, [amount]);


  const handleSumbit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    };

    const { error: submitError } = await elements.submit();
    
    if (submitError) {
      setErrorMessage(submitError.message || 'An unexpected error occurred.');
      setLoading(false);
      
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: successRedirect
      },
    });


    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <form onSubmit={handleSumbit}>
      { clientSecret && <PaymentElement /> }
      { errorMessage && <div>{errorMessage}</div> }
      <button
      type="submit"
      disabled={!stripe || loading}
      className='w-full bg-black text-white flex-col justify-center items-center pt-6 text-center'>
        {loading ? "Processing..." : `Pay ${amount / 100}€`}
      </button>
    </form>
  )

}