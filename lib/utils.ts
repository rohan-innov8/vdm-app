import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TEAM_MEMBERS = [
  'Bram', 'Jacques', 'Bennie', 'David',
  'Johannes', 'Fred', 'Williem', 'Timot', 'Tapi'
];