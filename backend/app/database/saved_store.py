import os
import json
from pathlib import Path

class SavedStore:
    def __init__(self):
        # Resolve data path
        current_dir = Path(__file__).resolve().parent
        self.file_path = current_dir / "saved_recommendations.json"
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        if not self.file_path.exists():
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.file_path, "w") as f:
                json.dump({"bookmarks": []}, f, indent=4)

    def load_bookmarks(self):
        self._ensure_file_exists()
        try:
            with open(self.file_path, "r") as f:
                data = json.load(f)
                return data.get("bookmarks", [])
        except Exception as e:
            print(f"[SavedStore] Error loading bookmarks: {e}")
            return []

    def save_bookmarks(self, bookmarks):
        try:
            with open(self.file_path, "w") as f:
                json.dump({"bookmarks": bookmarks}, f, indent=4)
            return True
        except Exception as e:
            print(f"[SavedStore] Error saving bookmarks: {e}")
            return False

    def add_bookmark(self, item: dict):
        bookmarks = self.load_bookmarks()
        
        # Check if already bookmarked
        item_id = item.get("track_id") or item.get("artist_name")
        if not item_id:
            return False
            
        for b in bookmarks:
            b_id = b.get("track_id") or b.get("artist_name")
            if b_id == item_id:
                return False  # Already exists
                
        bookmarks.append(item)
        return self.save_bookmarks(bookmarks)

    def remove_bookmark(self, item_id: str):
        bookmarks = self.load_bookmarks()
        new_bookmarks = []
        removed = False
        
        for b in bookmarks:
            b_id = b.get("track_id") or b.get("artist_name")
            if b_id == item_id:
                removed = True
            else:
                new_bookmarks.append(b)
                
        if removed:
            self.save_bookmarks(new_bookmarks)
        return removed

# Singleton instance
saved_store = SavedStore()
