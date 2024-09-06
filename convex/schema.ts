import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const notesTableSchema = v.object({
  description: v.string(),
  fileUrl: v.string(),
  fileId: v.string(),
  stars: v.float64(),
  tags: v.array(v.string()),
  title: v.string(),
  fulltext: v.string(),
  userId: v.string(), // notes must have an owner
})

export const userTableSchema = v.object({
  // userId: v.string(), 
  likedFileId: v.array(v.string()), 
  commentedFileId: v.array(v.string()), 
  // TODO change ratedFileID to StarredFileId
  ratedFileId: v.array(v.object({ fileid: v.string(), rating: v.int64() })) 
  //ratedFileId: [{fileid: string, rating: int}, {fileid: string, rating: int}, ...]
})

export const commentsTableSchema = v.object({
  // commentId: v.string(),
  userId: v.string(), //comments must have an owner
  fileId: v.string(), //comments must be tagged to a file
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