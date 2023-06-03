import { ImportObject } from "./interface";

export const DELETED_IMPORT: string = "DELLETED_IMPORT_CONSTANT";
export const GET_REPOSITORY_TOKEN_IMPORT_OBJ: ImportObject = {
  from: "@nestjs/typeorm",
  elements: ["getRepositoryToken"],
  isNameSpaceImport: false,
};
export const mockBlacklists: string[] = ["typeorm", "@nestjs/testing"];
