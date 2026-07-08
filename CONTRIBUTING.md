# Contribute to the documentation

Thank you for your interest in contributing to the Continuum documentation. This guide will help you get started.

## How to contribute

### Option 1: Edit directly on GitHub

1. Navigate to the page you want to edit
2. Click the "Edit this file" button (the pencil icon)
3. Make your changes and submit a pull request

### Option 2: Local development

1. Fork and clone this repository
2. Install the Mintlify CLI: `npm i -g mint`
3. Create a branch for your changes
4. Make changes
5. Run `mint dev` from the repository root
6. Preview your changes at `http://localhost:3000`
7. Commit your changes and submit a pull request

The project's authoring conventions (terminology, style, frontmatter, components) live in
[`AGENTS.md`](AGENTS.md). Read it before writing.

## Writing guidelines

- **Document the shipped product**: only write about features that exist today. When unsure, leave it out.
- **Use active voice**: "Run the command" not "The command should be run"
- **Address the reader directly**: use "you" instead of "the user"
- **Keep sentences concise**: one idea per sentence
- **Sentence case headings**: `## How the canvas works`
- **Consistent terminology**: use the product's real names (see `AGENTS.md`); don't alternate synonyms

## Pre-publish checklist

- [ ] Frontmatter has both `title` and `description`
- [ ] Page is registered in `docs.json` navigation
- [ ] If you renamed or moved a page, you added a `redirects` entry in `docs.json`
- [ ] Headings are sentence case; terminology matches `AGENTS.md`
- [ ] No images or external image URLs (visuals arrive in the branding pass)
- [ ] `mint broken-links` passes
