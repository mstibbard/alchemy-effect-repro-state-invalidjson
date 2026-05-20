# Alchemy Effect Repro Context

This context describes the task API used to reproduce Alchemy, Cloudflare, and Effect integration behaviour.

## Language

**Task**:
A persisted work item with an id, title, and completion state. A Task starts incomplete when it is created.
_Avoid_: Todo, item

**Task operation**:
A use-case action over Tasks, currently create, get, and list. Task operations own Task defaults and task-level behaviour; storage only saves and loads Tasks.
_Avoid_: Repository operation, transport handler

## Example Dialogue

Developer: "When a Task is created, where does the incomplete default live?"

Domain expert: "That belongs to the Task operation. KV storage should save the Task it is given."

Developer: "Should HTTP and RPC each decide which Task errors can happen?"

Domain expert: "No. They adapt the same Task operation interface to different transports."
