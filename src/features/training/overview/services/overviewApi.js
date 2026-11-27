import { useCallback, useState } from "react";
import { apiFetch } from "../../../../shared/services/apiClient";

export const useGetClassOverview = () => {
  const [training, settraining] = useState([]);

  const GetTrainingOverview = useCallback(async () => {
    try {
      let response = await apiFetch(
        "/api/trainingoverview/showtrainingoverview",
        {
          method: "GET",
        },
      );
      if (response.ok) {
        let data = await response.json();
        settraining(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  return {
    training,
    GetTrainingOverview,
  };
};
