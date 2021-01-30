/**
 * @file Exception
 * @description Handles various types of exceptions/errors
 * @module utils/exception
 */

import type { AxiosError } from "axios";

// Wraps around and handles Axios errors
export async function resError(err: AxiosError) {
  if (err.response) {
    throw new Error(`${err.response.status} \n\n Headers: ${err.response.headers} \n\n Data: ${err.response?.data}`);
  }
}
