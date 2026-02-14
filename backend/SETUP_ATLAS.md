# MongoDB Atlas Vector Search Setup

The ASTU SmartDesk backend uses MongoDB Atlas Vector Search for its RAG (Retrieval-Augmented Generation) chatbot. This requires a specific search index to be created on your MongoDB Atlas collection.

## Prerequisite
- You must be using **MongoDB Atlas** (cloud version), as Vector Search is not available in standard local MongoDB Community Edition.
- Your cluster tier must be M10 or higher (or M0 Sandbox for testing, though limits apply).

## Steps to Create Index

1.  **Log in to MongoDB Atlas**.
2.  Navigate to your **Cluster**.
3.  Click on the **"Atlas Search"** tab (or "Search & Intelligence").
4.  Click **"Create Search Index"**.
5.  Select **"JSON Editor"**.
6.  Select your **Database** and **Collection**:
    - Database: `test` (or whatever your DB name is in `.env`)
    - Collection: `documents`
7.  Enter the **Index Name**: `vector_search` (This exact name is used in `backend/models/Document.ts`).
8.  Paste the following JSON configuration:

```json
{
  "fields": [
    {
      "numDimensions": 1024,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    },
    {
      "path": "category",
      "type": "filter"
    },
    {
      "path": "isPublic",
      "type": "filter"
    }
  ]
}
```

9.  Click **"Next"** and then **"Create Search Index"**.
10. Wait for the status to change to **Active** (usually takes a minute).

## Troubleshooting

- **Error: "Index not found"**: Ensure the index name is exactly `vector_search`.
- **Error: "Invalid embedding dimensions"**: The configuration uses 1024 dimensions because we are using the `voyage-3-large` model. If you switch embedding models, you must update `numDimensions` here and in the code.

