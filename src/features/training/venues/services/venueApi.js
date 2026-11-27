import { useCallback, useState } from "react";
import { apiFetch } from "../../../../shared/services/apiClient";

export const useGetClassVenue = () => {
  const [Venue, setVenue] = useState([]);
  const [Courts, setCourts] = useState([]);

  const GetCourts = useCallback(async (id) => {
    if (!id) return console.log("id ma par lo return ");
    console.log("api calling");
    try {
      let response = await apiFetch(
        `/api/venue/showcourt/${id}`,
        {
          method: "GET",
        },
      );
      if (response.ok) {
        let data = await response.json();
        console.log("api calling completed");
        setCourts(data);
      } else {
        console.log("fail api calling");
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const GetVenue = useCallback(async (ID) => {
    try {
      let response = await apiFetch("/api/venue/showvenue", {
        method: "GET",
      });
      if (response.ok) {
        let data = await response.json();
        setVenue(data);
        if (data && data.data && data.data.length > 0) {
          let id = data.data[0].id;
          if (ID) {
            await GetCourts(ID);
          } else {
            await GetCourts(id);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  return {
    GetVenue,
    Venue,
    GetCourts,
    Courts,
  };
};
