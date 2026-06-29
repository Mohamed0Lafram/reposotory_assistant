import chromadb

DB_PATH = "/home/mohamed/Documents/mohamed/REPOSOTORY INFORMATION/vector_db/chroma_bge_db"
client = chromadb.PersistentClient(path=DB_PATH)

collections = client.list_collections()
print("Available collections:", [c.name for c in collections])

if collections:
    col = collections[0]
    print(f"\nInspecting collection: {col.name}")
    sample = col.get(limit=1, include=["documents", "metadatas"])
    if sample['ids']:
        print("Sample ID:", sample['ids'][0])
        print("Document preview:", sample['documents'][0][:200])
        print("Metadata:", sample['metadatas'][0])
else:
    print("No collections – the database is empty.")