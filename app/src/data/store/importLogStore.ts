import { ImportLogRecord } from '../../features/import/domain/summaryPack';

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

let logStore: ImportLogRecord[] = [];

export const appendImportLog = (log: ImportLogRecord) => {
  logStore.unshift(deepClone(log));
};

export const getImportLogStore = (): ImportLogRecord[] => deepClone(logStore);

export const resetImportLogStore = () => {
  logStore = [];
};
