# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# import time

# router = APIRouter()

# # TEMP in-memory DB
# FOLDERS_DB = {}
# FOLDER_PRESENTATIONS = {}   # ⭐ folderId -> [presentation_ids]

# class FolderCreate(BaseModel):
#     name: str

# @router.post("/create")
# def create_folder(payload: FolderCreate):
#     folder_id = str(int(time.time() * 1000))
#     folder = {
#         "id": folder_id,
#         "name": payload.name,
#         "created_at": int(time.time())
#     }
#     FOLDERS_DB[folder_id] = folder
#     FOLDER_PRESENTATIONS[folder_id] = []  # ⭐ empty list for presentations
#     return folder

# @router.get("/all")
# def get_all_folders():
#     return list(FOLDERS_DB.values())

# @router.get("/{folder_id}")
# def get_folder(folder_id: str):
#     if folder_id not in FOLDERS_DB:
#         raise HTTPException(status_code=404, detail="Folder not found")

#     return {
#         "folder": FOLDERS_DB[folder_id],
#         "presentations": FOLDER_PRESENTATIONS.get(folder_id, [])
#     }

# @router.post("/{folder_id}/add")
# def add_presentation_to_folder(folder_id: str, data: dict):
#     pres_id = data.get("presentation_id")

#     if folder_id not in FOLDERS_DB:
#         raise HTTPException(status_code=404, detail="Folder not found")

#     FOLDER_PRESENTATIONS[folder_id].append(pres_id)

#     return {"success": True}

# @router.delete("/{folder_id}")
# def delete_folder(folder_id: str):
#     if folder_id not in FOLDERS_DB:
#         raise HTTPException(status_code=404, detail="Folder not found")
#     del FOLDERS_DB[folder_id]
#     del FOLDER_PRESENTATIONS[folder_id]
#     return {"success": True}


#2nd 

# app/api/folders.py
# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# import time
# from typing import Dict, List

# # ❗️Important: slides ka in-memory dict import kar rahe hain
# from app.api.slides import PRESENTATIONS  

# router = APIRouter()

# # TEMP in-memory DBs
# FOLDERS_DB: Dict[str, dict] = {}

# # folder -> list[presentation_id]
# FOLDER_PRESENTATIONS: Dict[str, List[str]] = {}


# # ---------- MODELS ----------

# class FolderCreate(BaseModel):
#     name: str

# class AssignPresentation(BaseModel):
#     folder_id: str
#     presentation_id: str


# # ---------- FOLDER CRUD ----------

# @router.post("/create")
# def create_folder(payload: FolderCreate):
#     folder_id = str(int(time.time() * 1000))
#     folder = {
#         "id": folder_id,
#         "name": payload.name,
#         "created_at": int(time.time()),
#     }
#     FOLDERS_DB[folder_id] = folder
#     # initialize empty list for this folder
#     FOLDER_PRESENTATIONS.setdefault(folder_id, [])
#     return folder


# @router.get("/all")
# def get_all_folders():
#     # return folders list
#     return list(FOLDERS_DB.values())


# @router.delete("/{folder_id}")
# def delete_folder(folder_id: str):
#     if folder_id not in FOLDERS_DB:
#         raise HTTPException(status_code=404, detail="Folder not found")

#     # delete folder + its mapping
#     del FOLDERS_DB[folder_id]
#     FOLDER_PRESENTATIONS.pop(folder_id, None)

#     return {"success": True}


# # ---------- ASSIGN PRESENTATION TO FOLDER ----------

# @router.post("/assign")
# def assign_presentation(payload: AssignPresentation):
#     folder_id = payload.folder_id
#     pres_id = payload.presentation_id

#     if folder_id not in FOLDERS_DB:
#         raise HTTPException(status_code=404, detail="Folder not found")

#     # (Optional) check: presentation exist?
#     if pres_id not in PRESENTATIONS:
#         # Agar tum DB use kar rahi ho to yahan DB check kar sakti ho
#         # abhi ke liye soft-check hi rehne dete hain
#         raise HTTPException(status_code=404, detail="Presentation not found")

#     FOLDER_PRESENTATIONS.setdefault(folder_id, [])
#     if pres_id not in FOLDER_PRESENTATIONS[folder_id]:
#         FOLDER_PRESENTATIONS[folder_id].append(pres_id)

#     return {"success": True, "folder_id": folder_id, "presentation_id": pres_id}


# # ---------- GET ALL PRESENTATIONS INSIDE A FOLDER ----------

# @router.get("/{folder_id}/presentations")
# def get_folder_presentations(folder_id: str):
#     if folder_id not in FOLDERS_DB:
#         raise HTTPException(status_code=404, detail="Folder not found")

#     pres_ids = FOLDER_PRESENTATIONS.get(folder_id, [])

#     results = []
#     for pid in pres_ids:
#         slides = PRESENTATIONS.get(pid, [])
#         if not slides:
#             continue

#         first_slide = slides[0] if isinstance(slides, list) and slides else {}
#         design = first_slide.get("design", {}) if isinstance(first_slide, dict) else {}

#         results.append(
#             {
#                 "presentation_id": pid,
#                 "title": first_slide.get("title", "Untitled presentation"),
#                 "num_slides": len(slides),
#                 "edited_at": str(int(time.time() * 1000)),  # abhi ke liye "just now"
#                 "thumbnail": design.get("image_url"),
#             }
#         )

#     return results



from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import time
from app.api.slides import PRESENTATIONS

router = APIRouter()

# --------------------------
# In-memory folder database
# --------------------------
FOLDERS_DB = {}

class FolderCreate(BaseModel):
    name: str


# ---------------------------------------------------------
# CREATE FOLDER
# ---------------------------------------------------------
@router.post("/create")
def create_folder(payload: FolderCreate):
    folder_id = str(int(time.time() * 1000))

    FOLDERS_DB[folder_id] = {
        "id": folder_id,
        "name": payload.name,
        "created_at": int(time.time()),
        "presentations": []   # store IDs only
    }

    return FOLDERS_DB[folder_id]


# ---------------------------------------------------------
# GET ALL FOLDERS
# ---------------------------------------------------------
@router.get("/all")
def get_all_folders():
    return list(FOLDERS_DB.values())


# ---------------------------------------------------------
# ADD PRESENTATION ID TO FOLDER
# ---------------------------------------------------------
@router.post("/{folder_id}/add")
def add_presentation_to_folder(folder_id: str, payload: dict):

    presentation_id = payload.get("presentation_id")

    if folder_id not in FOLDERS_DB:
        raise HTTPException(status_code=404, detail="Folder not found")

    if presentation_id is None:
        raise HTTPException(400, "presentation_id missing")

    if "presentations" not in FOLDERS_DB[folder_id]:
        FOLDERS_DB[folder_id]["presentations"] = []

    if presentation_id not in FOLDERS_DB[folder_id]["presentations"]:
        FOLDERS_DB[folder_id]["presentations"].append(presentation_id)

    return {"success": True}



# ---------------------------------------------------------
# GET PRESENTATION IDS OF A FOLDER
# (Frontend will fetch details for each ID)
# ---------------------------------------------------------
@router.get("/{folder_id}/presentations")
def get_folder_presentations(folder_id: str):
    if folder_id not in FOLDERS_DB:
        raise HTTPException(404, "Folder not found")

    valid = []
    invalid = []

    for pid in FOLDERS_DB[folder_id]["presentations"]:
        if pid in PRESENTATIONS:
            valid.append(pid)
        else:
            invalid.append(pid)

    # auto cleanup invalid IDs
    if invalid:
        FOLDERS_DB[folder_id]["presentations"] = valid

    return {"presentation_ids": valid}


# ---------------------------------------------------------
# DELETE FOLDER
# ---------------------------------------------------------
@router.delete("/{folder_id}")
def delete_folder(folder_id: str):
    if folder_id not in FOLDERS_DB:
        raise HTTPException(status_code=404, detail="Folder not found")

    del FOLDERS_DB[folder_id]
    return {"success": True}
