import { useCallback, useState } from "react";

export const useGetCustomer = () => {
  const [Customers, setCustomers] = useState([]);

  const GetCustomer = useCallback(async () => {
    try {
      let reponse = await fetch((import.meta.env.VITE_BASE_URL + "/api/customer/showcustomer"), {
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
