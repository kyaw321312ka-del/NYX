import { useCallback, useState } from "react";
import { apiFetch } from "../../../shared/services/apiClient";

export const useGetOrder = () => {
  const [MOrders, setMOrders] = useState([]);
  const [LOrders, setLOrders] = useState([]);
  const [OrderHeader, setOrderHeader] = useState([]);

  const GetMobileOrders = useCallback(async () => {
    try {
      let reponse = await apiFetch("/api/order/showmobileorder", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (reponse.ok) {
        let data = await reponse.json();
        setMOrders(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const GetLocalOrders = useCallback(async () => {
    try {
      let response = await apiFetch("/api/order/showadminorder", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        let data = await response.json();
        setLOrders(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const GetOrderHeader = useCallback(async () => {
    try {
      let response = await apiFetch("/api/order/totalResult", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        let data = await response.json();
        setOrderHeader(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);
  return {
    MOrders,
    GetMobileOrders,
    LOrders,
    GetLocalOrders,
    OrderHeader,
    GetOrderHeader,
  };
};
