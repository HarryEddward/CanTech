"use client";

import { Sheet, SheetRef } from 'react-modal-sheet';
import { useState, useEffect, useRef } from 'react';
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements, 
  AddressElement, 
  LinkAuthenticationElement // IMPORTANTE: Para capturar el email
} from '@stripe/react-stripe-js';
import { stripePromise } from "@/lib/stripe/client";
import { convertToSubcurrency } from '@/utils/convertToSubcurrency';
import { useTransform } from 'framer-motion';
import { useLocale } from 'next-intl';
import { redirectUrl } from '@/utils/redirectUrl';
import { useCartStore } from '@/lib/store';

export default function CheckoutSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<SheetRef>(null);

  const { product } = useCartStore();
  // Aseguramos que el precio sea entero si la DB usa enteros (ej: centavos)
  const finalPrice = product ? (product.price * 1.21) : null;
  
  // Asumimos que amount en el componente padre es visual, 
  // pero para Stripe necesitamos el valor real basado en el producto
  const amountToCharge = finalPrice || 500; 

  const paddingBottom = useTransform(() => {
    return ref.current?.y?.get() ?? 0;
  });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-1/2 p-4 bg-blue-600 text-white rounded-md"
      >
        Pagar
      </button>
      <Sheet
        ref={ref}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        snapPoints={[0, 600, 1]}
        initialSnap={1}
      >
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content scrollStyle={{ paddingBottom }} disableDrag>
            <div className='px-4 pb-2'>
              <h3 className='w-full top-0 bg-white z-30 sticky text-5xl font-calistoga pb-4 border-b-2 border-slate-400 mb-6 text-slate-950'>
                Checkout
              </h3>
              
              <div className='space-y-6'>
                <Elements
                  stripe={stripePromise}
                  options={{
                    mode: 'payment',
                    amount: convertToSubcurrency(amountToCharge),
                    currency: 'eur'
                  }}
                >
                  {/* Pasamos el objeto producto entero o su ID para guardarlo en Prisma */}
                  {finalPrice && product && (
                    <CheckoutForm 
                      amount={finalPrice} 
                      productId={product.id} 
                    />
                  )}
                </Elements>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={() => setIsOpen(false)} />
      </Sheet>
    </>
  );
}

function CheckoutForm({ amount, productId }: { amount: number, productId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const locale = useLocale();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  // Estados para capturar datos del usuario
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const successRedirect = redirectUrl(locale, `/payment/success?amount=${amount}&productId=${productId}`);

  // 1. Carga inicial: Solo crea el intento (sin datos de usuario)
  useEffect(() => {
    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: convertToSubcurrency(amount), currency: 'eur' }),
    })
    .then((res) => res.json())
    .then((data) => {
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId); // Guardamos el ID para usarlo al pagar
    });
  }, [amount]);

  const handleSumbit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements || !email) {
      setErrorMessage("Por favor completa todos los campos.");
      setLoading(false);
      return;
    }

    // Validar campos de Stripe primero
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'Error en los datos de pago.');
      setLoading(false);
      return;
    }

    try {
      // 2. Paso Crítico: Sincronizar Prisma ANTES de confirmar el pago
      // Enviamos el email, teléfono y el ID del intento que ya creamos
      const syncResponse = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId, // Clave para actualizar
          amount: convertToSubcurrency(amount), // Necesario para la validación de orden
          email: email,
          phone: phone, // Capturado del AddressElement
          productId: productId
        }),
      });

      if (!syncResponse.ok) throw new Error('Error guardando el pedido');

      // 3. Confirmar pago en Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: successRedirect,
          receipt_email: email,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Error al procesar el pago.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMessage('Error conectando con el servidor.');
      setLoading(false);
    }
  };

  return (
    <form className='w-full flex flex-col gap-6' onSubmit={handleSumbit}>

      
      
      {/* Sección de Contacto (Email) - IMPORTANTE */}
      {clientSecret && (
        <div className='bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm'>
           <div className='flex items-center gap-3 mb-4'>
            <h2 className='text-2xl font-calistoga text-slate-800'>Contacto</h2>
          </div>
          <LinkAuthenticationElement 
            onChange={(e) => setEmail(e.value.email)}
          />
        </div>
      )}

      {/* Sección de Dirección de Envío */}
      {clientSecret && (
        <div className='bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            {/* ... icono ... */}
            <div>
              <h2 className='text-2xl font-calistoga text-slate-800'>Dirección de envío</h2>
            </div>
          </div>
          <AddressForm onPhoneChange={setPhone} />
        </div>
      )}

      {/* Sección de Método de Pago */}
      {clientSecret && (
        <div className='bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm'>
           {/* ... header ... */}
          <PaymentElement />
        </div>
      )}

      {/* Mensaje de Error */}
      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Botón de Pago */}
      <div className="sticky z-40 bottom-0 bg-white pt-4 pb-2 -mx-4 px-4 border-t-2 border-slate-200">
        <button
          type="submit"
          disabled={!stripe || loading}
          className='w-full font-calistoga bg-black text-4xl text-white p-6 rounded-xl ...'
        >
          {loading ? "Procesando..." : `Pagar €${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  )
}

function AddressForm({ onPhoneChange }: { onPhoneChange: (phone: string) => void }) {
  return (
    <div>
      
      <AddressElement 
        options={{
          allowedCountries: ['ES'],
          mode: 'shipping',
          defaultValues: {
            address: { city: "Pollença", postal_code: "07460", country: "ES", state: 'PM' }
          },
          fields: { phone: 'always' },
          validation: { phone: { required: 'always' } },
          display: { name: 'full' },
        }}
        onChange={(event) => {
          // Si el usuario introduce teléfono, lo subimos al estado
          if (event.value.phone) {
            onPhoneChange(event.value.phone);
          }
        }}
      />
    </div>
  );
}