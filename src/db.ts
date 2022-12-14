import { taskText } from "./server";
export interface DbItem {
  id: number;
  task: string;
  completed: boolean;
}

const db: DbItem[] = [];

/** Variable to keep incrementing id of database items */
let idCounter = 0;

/**
 * Adds in a single item to the database
 *
 * @param data - the item data to insert in
 * @returns the item added (with a newly created id)
 */
export const addDbItems = (data: taskText): DbItem => {
  const newItem: DbItem = {
    id: ++idCounter,
    task: data.task,
    completed: false,
  };
  db.unshift(newItem);
  return newItem;
};

/**
 * Deletes a database item with the given id
 *
 * @param id - the id of the database item to delete
 * @returns the deleted database item (if originally located),
 *  otherwise the string `"not found"`
 */
export const deleteDbItemById = (id: number): DbItem | "not found" => {
  const idxToDeleteAt = findIndexOfDbItemById(id);
  if (typeof idxToDeleteAt === "number") {
    const itemToDelete = getDbItemById(id);
    db.splice(idxToDeleteAt, 1); // .splice can delete from an array
    return itemToDelete;
  } else {
    return "not found";
  }
};

/**
 * Deletes all completed to-dos
 *
 * @returns an array of the deleted database items (if originally located),
 *  otherwise the string `"not found"`
 */
export const deleteCompletedItems = ():
  | DbItem[]
  | "no completed items found" => {
  const deletedItems: DbItem[] = [];
  for (let i = 0; i < db.length; i++) {
    if (db[i].completed === true) {
      const deletedItem = db.splice(Number(i), 1);
      deletedItems.push(deletedItem[0]);
      i--;
    }
  }
  if (deletedItems.length > 0) {
    return deletedItems;
  }
  return "no completed items found";
};

/**
 * Finds the index of a database item with a given id
 *
 * @param id - the id of the database item to locate the index of
 * @returns the index of the matching database item,
 *  otherwise the string `"not found"`
 */
const findIndexOfDbItemById = (id: number): number | "not found" => {
  const matchingIdx = db.findIndex((entry) => entry.id === id);
  // .findIndex returns -1 if not located
  if (matchingIdx !== -1) {
    return matchingIdx;
  } else {
    return "not found";
  }
};

/**
 * Find all database items
 * @returns all database items from the database
 */
export const getAllDbItems = (): DbItem[] => {
  return db;
};

/**
 * Locates a database item by a given id
 *
 * @param id - the id of the database item to locate
 * @returns the located database item (if found),
 *  otherwise the string `"not found"`
 */
export const getDbItemById = (id: number): DbItem | "not found" => {
  const maybeEntry = db.find((entry) => entry.id === id);
  if (maybeEntry) {
    return maybeEntry;
  } else {
    return "not found";
  }
};

/**
 * Applies a partial update to a database item for a given id
 *  based on the passed data
 *
 * @param id - the id of the database item to update
 * @param newData - the new data to overwrite
 * @returns the updated database item (if one is located),
 *  otherwise the string `"not found"`
 */
export const updateDbItemById = (
  id: number,
  newData: Partial<DbItem>
): DbItem | "not found" => {
  const idxOfEntry = findIndexOfDbItemById(id);
  // type guard against "not found"
  if (typeof idxOfEntry === "number") {
    return Object.assign(db[idxOfEntry], newData);
  } else {
    return "not found";
  }
};
