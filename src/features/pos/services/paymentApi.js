import { useCallback, useContext, useState } from "react";
import { Context } from "../../../shared/hooks/AppContext";
import { apiFetch } from "../../../shared/services/apiClient";

export const useGetPayment = () => {
  const [Payment, setPayment] = useState([]);
  const [Tax, setTax] = useState([]);

  const { Length, setLength } = useContext(Context);

  const GetPayment = useCallback(async () => {
    try {
      let response = await apiFetch("/api/payment/showpayment", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        let data = await response.json();
        setLength(data.result.length);
        setPayment(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const GetTax = useCallback(async () => {
    try {
      let response = await apiFetch("/api/payment/showtax", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        let data = await response.json();
        setTax(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  return {
    Payment,
    GetPayment,
    Tax,
    GetTax,
  };
};
