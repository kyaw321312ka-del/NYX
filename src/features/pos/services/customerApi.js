import { useCallback, useState } from "react";
import { apiFetch } from "../../../shared/services/apiClient";

export const useGetCustomer = () => {
  const [Customers, setCustomers] = useState([]);

  const GetCustomer = useCallback(async () => {
    try {
      let reponse = await apiFetch("/api/customer/showcustomer", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (reponse.ok) {
        let data = await reponse.json();
        setCustomers(data);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  return {
    Customers,
    GetCustomer,
  };
};
