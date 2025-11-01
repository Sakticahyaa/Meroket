# Claude Code Rules for Meroket Project

## Conversation Log Protocol

### When to Update
- Update `conversation_log.txt` after EVERY user prompt and completion
- Start a new session entry when user asks to "analyze the project" at session start

### Log Format
```
[HH:MM] USER: <exact user prompt>
RESULT: <compact summary of what was accomplished, files modified, key changes>
```

### Guidelines
- Keep results concise but informative
- Include: files created/modified, features added, tech details, important notes
- Use compact technical language that future Claude can understand
- Timestamp format: 24-hour [HH:MM]
- Always append to end of file before "END OF LOG" marker

### Session Header Format
```
SESSION: YYYY-MM-DD
==================================================
```

### Example Entry
```
[14:23] USER: add dark mode toggle
RESULT: Added DarkModeToggle.tsx component, integrated into App.tsx, created useDarkMode hook, stored preference in localStorage. Updated Tailwind config for dark mode support.
```

## Auto-Update Trigger
When user says "analyze the project" or similar at session start:
1. Create new session header with current date
2. Log the analyze request
3. Update log after every subsequent prompt in that session
4. No need to ask - just do it automatically

## Critical Rules
- NEVER skip logging a prompt-response pair
- ALWAYS update before finishing response to user
- Keep log in sync with actual work completed
