import { useCallback, useState } from "react";
import { apiFetch } from "../../../../shared/services/apiClient";

export const useGetClassCustomer = () => {
  const [ClassCustomers, setClassCustomer] = useState([]);

  const GetClassCustomers = useCallback(async () => {
    try {
      let response = await apiFetch("/api/bookingcustomer/showcustomer", {
        method: "GET",
      });
      if (response.ok) {
        let data = await response.json();
        setClassCustomer(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  return {
    GetClassCustomers,
    ClassCustomers,
  };
};
