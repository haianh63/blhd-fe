import axios from "axios";
import { BASE_URL } from "../utils";
const login = async ({ username, password }) => {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        username,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return data;
  } catch (error) {
    console.log(`There is an error: ${error}`);
    throw error;
  }
};

export { login };
