# Cursor Configuration

This directory contains Cursor IDE configuration files for the DebtAway project.

## Settings Overview

The `settings.json` file configures Cursor to require manual confirmation for AI-generated code changes and terminal commands. Key settings include:

### AI Code Generation Confirmations
- `cursor.chat.alwaysShowConfirmationBeforeApplyingEdits`: Always show confirmation dialog before applying AI edits
- `cursor.chat.confirmBeforeApplyingAnyEdit`: Require confirmation for any AI-generated edit
- `cursor.ai.requireManualApproval`: Require manual approval for all AI operations
- `cursor.ai.showDiffBeforeApply`: Show diff view before applying changes

### Terminal Command Confirmations  
- `cursor.terminal.confirmAICommands`: Confirm AI-generated terminal commands
- `cursor.cmd.confirmBeforeExecution`: Require confirmation before executing commands
- `cursor.cmd.requireApprovalForTerminalCommands`: Require approval for terminal commands

### Autocomplete Settings
- `cursor.autocomplete.acceptOnTab`: Disabled automatic acceptance on Tab
- `cursor.autocomplete.acceptOnEnter`: Disabled automatic acceptance on Enter
- `cursor.autocomplete.showConfirmationDialog`: Show confirmation dialog for autocomplete

### Editor Behavior
- `editor.acceptSuggestionOnEnter`: Disabled automatic suggestion acceptance
- `editor.quickSuggestions`: Disabled automatic quick suggestions
- `diffEditor.renderSideBySide`: Show diffs side-by-side for better review

## Usage

After restarting Cursor, you should see confirmation dialogs when:
1. AI suggests code changes via chat
2. AI generates terminal commands
3. Autocomplete suggestions are triggered
4. Any AI tool attempts to modify files

Click "Accept" to apply changes or "Cancel" to reject them.
