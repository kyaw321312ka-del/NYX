import { useCallback, useState } from "react";

export const useGetClassOverview = () => {
  const [training, settraining] = useState([]);

  const GetTrainingOverview = useCallback(async () => {
    try {
      let response = await fetch(
        (import.meta.env.VITE_BASE_URL + "/api/trainingoverview/showtrainingoverview"),
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
