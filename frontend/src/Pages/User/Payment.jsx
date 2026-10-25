import { useEffect, useState, useCallback } from "react";
import { useRazorpay } from "react-razorpay";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import { getCheckout } from "../../Redux/ActionCreators/CheckoutActionCreators";
import Breadcrum from "../../Components/Breadcrum";

export default function Payment() {
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { Razorpay } = useRazorpay();
  const navigate = useNavigate();
  const { _id } = useParams();
  const dispatch = useDispatch();
  const allCheckouts = useSelector((state) => state.CheckoutStateData);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      if (_id && _id !== "-1") {
        let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/checkout/${_id}`, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "authorization": localStorage.getItem("token")
          }
        });
        let res = await response.json();
        if (res.result === "Done" && res.data) {
          setCheckout(res.data);
          setLoading(false);
          return;
        }
      }

      dispatch(getCheckout());
    } catch (err) {
      console.error("Error fetching order for payment:", err);
      setErrorMessage("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  }, [_id, dispatch]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!checkout && allCheckouts && allCheckouts.length > 0) {
      const match = _id === "-1" ? allCheckouts[0] : allCheckouts.find((item) => item._id === _id);
      if (match) {
        setCheckout(match);
      }
    }
  }, [allCheckouts, _id, checkout]);

  const initPayment = (data) => {
    if (!data) return;
    const options = {
      key: import.meta.env.VITE_APP_RPKEYID,
      amount: data.amount,
      currency: "INR",
      order_id: data.id || data._id,
      prefill: {
        name: checkout?.deliveryAddress?.name || localStorage.getItem("name") || "",
        email: checkout?.deliveryAddress?.email || "",
        contact: checkout?.deliveryAddress?.phone || ""
      },
      handler: async (response) => {
        try {
          const item = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            checkid: checkout._id
          };
          let verifyRes = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/checkout/verify-order`, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "authorization": localStorage.getItem("token")
            },
            body: JSON.stringify(item)
          });
          let result = await verifyRes.json();
          if (result.result === "Done") {
            dispatch(getCheckout());
            navigate("/order-confirmation");
          } else {
            alert(result.reason || "Payment signature verification failed");
          }
        } catch (error) {
          console.error("Payment handler error:", error);
          alert("Error processing payment verification.");
        }
      },
      theme: {
        color: "#e53935"
      }
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
  };

  const handlePayment = async () => {
    if (!checkout || !checkout._id) {
      alert("Order information is not available.");
      return;
    }
    try {
      let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/checkout/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": localStorage.getItem("token")
        },
        body: JSON.stringify({
          checkid: checkout._id,
          amount: checkout.total
        })
      });
      let res = await response.json();
      if (res.result === "Done" && res.data) {
        initPayment(res.data);
      } else {
        alert(res.reason || "Failed to initialize payment gateway.");
      }
    } catch (error) {
      console.error("Handle payment error:", error);
      alert("Network error connecting to payment gateway.");
    }
  };

  return (
    <>
      <Breadcrum
        title="Online Payment"
        description="Enjoy fast, secure, and hassle-free payments through Razorpay at PizzaHub. Complete your purchases using UPI, credit cards, debit cards, net banking, or digital wallets with advanced security."
      />

      <div className="container my-5">
        <h4 className="text-center border border-primary p-2">Pay With Razorpay</h4>
        {loading ? (
          <div className="text-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading order details...</p>
          </div>
        ) : errorMessage ? (
          <div className="alert alert-danger text-center">{errorMessage}</div>
        ) : checkout ? (
          <div className="card p-4 mx-auto" style={{ maxWidth: "500px" }}>
            <h5 className="mb-3">Order Summary</h5>
            <p className="mb-1"><strong>Order ID:</strong> {checkout._id}</p>
            <p className="mb-1"><strong>Total Amount:</strong> &#8377;{checkout.total}</p>
            <p className="mb-3"><strong>Status:</strong> {checkout.orderStatus}</p>
            <button onClick={handlePayment} className="btn btn-primary w-100 py-2">
              Pay (&#8377;{checkout.total}) With Razorpay
            </button>
          </div>
        ) : (
          <div className="alert alert-warning text-center">No order found to process payment.</div>
        )}
      </div>
    </>
  );
}