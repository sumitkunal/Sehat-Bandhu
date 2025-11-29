import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_dummy");

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage("Payment succeeded! Processing booking...");

                    // Check for pending booking
                    const pendingBooking = localStorage.getItem("pendingBooking");
                    if (pendingBooking) {
                        const bookingData = JSON.parse(pendingBooking);
                        const token = localStorage.getItem("token");

                        fetch(`${backendUrl}/book`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": token ? `Bearer ${token}` : ""
                            },
                            body: JSON.stringify(bookingData),
                        })
                            .then(async (res) => {
                                const data = await res.json();
                                if (res.ok) {
                                    setMessage("Payment succeeded! Appointment booked successfully.");
                                    localStorage.removeItem("pendingBooking");
                                    setTimeout(() => navigate("/appointments"), 2000);
                                } else {
                                    setMessage(`Payment succeeded, but booking failed: ${data.error || "Unknown error"}`);
                                }
                            })
                            .catch((err) => {
                                console.error("Booking error:", err);
                                setMessage("Payment succeeded, but booking failed due to network error.");
                            });
                    } else {
                        setMessage("Payment succeeded!");
                        setTimeout(() => navigate("/appointments"), 2000);
                    }
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: window.location.origin + "/payment",
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "An unexpected error occurred.");
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    const handleSkip = async () => {
        setIsLoading(true);
        setMessage("Skipping payment... Processing booking...");

        const pendingBooking = localStorage.getItem("pendingBooking");
        if (pendingBooking) {
            const bookingData = JSON.parse(pendingBooking);
            const token = localStorage.getItem("token");

            try {
                const res = await fetch(`${backendUrl}/book`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token ? `Bearer ${token}` : ""
                    },
                    body: JSON.stringify(bookingData),
                });

                const data = await res.json();
                if (res.ok) {
                    setMessage("Booking successful! (Payment skipped)");
                    localStorage.removeItem("pendingBooking");
                    setTimeout(() => navigate("/appointments"), 2000);
                } else {
                    setMessage(`Booking failed: ${data.error || "Unknown error"}`);
                }
            } catch (err) {
                console.error("Booking error:", err);
                setMessage("Booking failed due to network error.");
            }
        } else {
            setMessage("No pending booking found.");
        }
        setIsLoading(false);
    };

    const paymentElementOptions = {
        layout: "tabs" as const,
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <form id="payment-form" onSubmit={handleSubmit}>
                <PaymentElement id="payment-element" options={paymentElementOptions} />
                <button disabled={isLoading || !stripe || !elements} id="submit" className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50">
                    <span id="button-text">
                        {isLoading ? <div className="spinner" id="spinner">Processing...</div> : "Pay now"}
                    </span>
                </button>
            </form>

            <div className="mt-4 border-t pt-4">
                <button
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    Skip Payment (Test Mode)
                </button>
            </div>

            {/* Show any error or success messages */}
            {message && <div id="payment-message" className="mt-4 text-center text-sm text-gray-700">{message}</div>}
        </div>
    );
}

export default function Payment() {
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        fetch(`${backendUrl}/create-payment-intent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: [{ id: "xl-tshirt" }], amount: 5000, currency: "inr" }), // Amount in smallest currency unit (5000 paise = ₹50)
        })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret));
    }, []);

    const appearance = {
        theme: 'stripe' as const,
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Test Payment
                    </h2>
                </div>
                {clientSecret && (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm />
                    </Elements>
                )}
            </div>
        </div>
    );
}
