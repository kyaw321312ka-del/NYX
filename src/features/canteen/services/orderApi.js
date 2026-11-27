import { useCallback, useState } from "react";
import { apiFetch } from "../../../shared/services/apiClient";

export const useGetClassOrder = () => {
  const [ClassOrders, setClassOrders] = useState([]);

  const GetOrder = useCallback(async () => {
    try {
      let response = await apiFetch("/api/canteenorder/showcanteenorder", {
        method: "GET",
      });
      if (response.ok) {
        let data = await response.json();
        setClassOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  return {
    GetOrder,
    ClassOrders,
  };
};
