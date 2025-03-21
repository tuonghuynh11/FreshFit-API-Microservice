import { sign } from "jsonwebtoken";
import config from "../configuration";
import { hashSync } from "bcryptjs";
import { generate } from "generate-password";
import axios from "axios";

export const getAccessToken = (userId: string) => {
  return sign({ iss: userId }, config.jwtAccessKey, { expiresIn: "1d" });
};

export const getRefreshToken = (userId: string) => {
  return sign({ iss: userId }, config.jwtRefreshKey, { expiresIn: "30d" });
};

export const validateEmail = (email: string) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-z]{2,6}$/;
  return regex.test(email);
};

export const getNameFromEmail = (email: string) => {
  if (email === "") {
    return "MarketNest User";
  }
  const name = email.split("@")[0];
  return name;
};

// min 8 characters and least one lowercase letter, uppercase letter, number and symbol.
export const validatePassword = (password: string) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/;
  return regex.test(password);
};

export const getHashPassword = (password: string) => {
  return hashSync(password, 12);
};

export const generateUniqueString = (length = 50) => {
  return generate({ length, numbers: true });
};

export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  // Create a shallow copy of the object
  const result = { ...obj };

  // Iterate over the keys to be omitted
  keys.forEach((key) => {
    // Delete the key from the result object if it exists
    if (key in result) {
      delete result[key];
    }
  });

  return result;
};
export const pick = <T extends object, K extends keyof T>(
  object: T,
  keys: K[]
): Pick<T, K> => {
  const result: Partial<T> = {};

  for (const key of keys) {
    if (key in object) {
      result[key] = object[key];
    }
  }

  return result as Pick<T, K>;
};

// Google Auth

/**
 * Hàm này thực hiện gửi yêu cầu lấy Google OAuth token dựa trên authorization code nhận được từ client-side.
 * @param {string} code - Authorization code được gửi từ client-side.
 * @returns {Object} - Đối tượng chứa Google OAuth token.
 */
export const getOauthGooleToken = async (code: string): Promise<any> => {
  const body = {
    code,
    client_id: config.google_client_id,
    client_secret: config.google_client_secret,
    redirect_uri: config.google_redirect_uri,
    grant_type: "authorization_code",
  };
  const { data } = await axios.post(
    "https://oauth2.googleapis.com/token",
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return data;
};

/**
 * Hàm này thực hiện gửi yêu cầu lấy thông tin người dùng từ Google dựa trên Google OAuth token.
 * @param {Object} tokens - Đối tượng chứa Google OAuth token.
 * @param {string} tokens.id_token - ID token được lấy từ Google OAuth.
 * @param {string} tokens.access_token - Access token được lấy từ Google OAuth.
 * @returns {Object} - Đối tượng chứa thông tin người dùng từ Google.
 */
export const getGoogleUser = async ({
  id_token,
  access_token,
}: {
  id_token: string;
  access_token: string;
}): Promise<any> => {
  const { data } = await axios.get(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    {
      params: {
        access_token,
        alt: "json",
      },
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    }
  );
  return data;
};
