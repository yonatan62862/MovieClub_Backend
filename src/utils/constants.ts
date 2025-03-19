import { PopulateOptions } from "mongoose";

export const POST_POPULATE_FIELDS: PopulateOptions[] = [
  { path: "owner", select: "firstName lastName" },
  {
    path: "likes",
    select: "firstName lastName",
  },
];
