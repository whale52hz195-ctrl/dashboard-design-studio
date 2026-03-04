import { hybridAPI } from './hybridAPI';

// Re-export all functions from hybridAPI
export const getAPIConfigs = hybridAPI.getAPIConfigs;
export const getAPIConfig = hybridAPI.getAPIConfig;
export const updateAPIConfig = hybridAPI.updateAPIConfig;
export const toggleAPIStatus = hybridAPI.toggleAPIStatus;
export const switchAPIMode = hybridAPI.switchAPIMode;
export const testAPIConnection = hybridAPI.testAPIConnection;
export const getAPIStats = hybridAPI.getAPIStats;
