/**
 * @file Config interface
 * @description Interface for the main config file
 * @author Espi <contact@espi.me>
 * @interface
 */

// Config options
export interface botConfig {
  token: string;
  owners: Array<string>;
  prefix: string;
  colors: colors;
  options: Record<string, unknown>;
  apikeys: Record<string, unknown>;
}

// Color config
interface colors extends Record<string, string> {
  general: string;
  success: string;
  error: string;
  other: string;
}
