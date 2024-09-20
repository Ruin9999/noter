import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const notesTableSchema = v.object({
  description: v.string(),
  fileUrl: v.string(),
  fileId: v.string(),
  stars: v.float64(),
  downloads: v.float64(),
  tags: v.array(v.string()),
  title: v.string(),
  fulltext: v.string(), //We do fulltext search on only the title and description.
  userId: v.string(), //Notes must have a userId
})


export const userTableSchema = v.object({
  // userId: v.string(), 
  starredFileId: v.array(v.string()), 
  commentedFileId: v.array(v.string()), 
})

export const commentsTableSchema = v.object({
  userId: v.string(),
  fileId: v.string(), 
  content: v.string()
})

export default defineSchema({
  notes: defineTable(notesTableSchema).searchIndex("search_fulltext", {
    searchField: "fulltext",
  }),
  tags: defineTable({ tag: v.string() }).searchIndex("search_tags", {
    searchField: "tag",
  }),
  user: defineTable(userTableSchema),
  comments: defineTable(commentsTableSchema)

});

// "pnpx convex dev" to update schema 