NoteSpace — Notes & To-Do Web Application

NoteSpace is a browser-based productivity application that combines a notes manager and a to-do list in one clean workspace. It is built with HTML, CSS, and vanilla JavaScript, stores data in the browser using localStorage, uses GitHub Actions for Continuous Integration, and is deployed with GitHub Pages.

Live Demo

Live Application:
https://hamza-170.github.io/Notes_And_ToDo_App/

GitHub Repository:
https://github.com/hamza-170/Notes_And_ToDo_App

Features

Notes

Create and edit text notes

Add titles and tags

Choose note colors

Automatic saving

Created and updated timestamps

Find and replace inside notes

Word, character, and line counts

Adjustable font size

To-Do Lists

Create dedicated checklist-style to-do items

Add tasks quickly with the Enter key

Check and uncheck tasks

Delete individual tasks

Clear completed tasks

View remaining-task count and completion progress

Organization

Mark items as favorites

Pin important items to the top

Organize notes with tags and colors

Archive items without deleting them

Move items to Trash

Restore or permanently delete trashed items

Search titles, note content, tags, and task text

Sort by updated date, created date, title, or oldest

Productivity Tools

Copy note content

Duplicate items

Export items as TXT files

Print selected items

Focus mode

Keyboard shortcuts

Responsive layout for smaller screens

Light and dark themes

Backup & Import

Export the workspace as a JSON backup

Import NoteSpace JSON backups

Import TXT files

NoteSpace is intentionally backend-free. Notes and tasks are stored in the current browser/device, so using the backup feature is recommended when moving data between devices or keeping a separate copy.

Tech Stack

HTML5

CSS3

Vanilla JavaScript

Browser localStorage

Git & GitHub

GitHub Actions

GitHub Pages

Project Structure

Notes_And_ToDo_App/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── pages.yml
└── FirstWeb/
    ├── index.html
    ├── styles.css
    └── script.js

Run Locally

1. Clone the repository

git clone https://github.com/hamza-170/Notes_And_ToDo_App.git

2. Open the project

cd Notes_And_ToDo_App/FirstWeb

3. Run the application

Open index.html in your browser.

You can also use a local development server, for example with VS Code Live Server.

How to Use

Click New Note to create a normal text note.

Click New To-Do to create a checklist.

Use the sidebar to access All Notes, Favorites, Archive, and Trash.

Use search and sorting controls to find items quickly.

Use Import and Backup to move or preserve your data.

Use the theme control to switch between light and dark mode.

Continuous Integration

The project uses GitHub Actions to automatically validate the application whenever code is pushed to the main branch.

The CI workflow:

Checks out the repository.

Sets up Node.js 22.

Confirms that index.html, styles.css, and script.js exist in the FirstWeb folder.

Runs a JavaScript syntax check:

node --check FirstWeb/script.js

Marks the workflow successful only if all earlier checks pass.

During development, an intentional JavaScript syntax error was introduced to demonstrate CI failure. GitHub Actions detected the invalid JavaScript, and after the missing closing brace was restored, the next CI run passed successfully.

Deployment

Deployment is automated through a separate GitHub Actions workflow.

On pushes to main, the deployment workflow:

Checks out the repository

Configures GitHub Pages

Uploads the FirstWeb folder as the site artifact

Deploys it to the github-pages environment

The deployed application is available at:

https://hamza-170.github.io/Notes_And_ToDo_App/

DevOps Workflow

Local Development
       ↓
   Git Commit
       ↓
 Push to main
       ↓
GitHub Actions CI
       ↓
 GitHub Pages

This workflow keeps version control, automated validation, and deployment connected in a simple development pipeline.

Author

Hamza Rizwan Sheikh
Registration No: FA25-BCS-025

COMSATS University Islamabad, Wah Campus
Software Engineering — Assignment 01

Project Status

✅ Application completed
✅ GitHub repository configured
✅ Meaningful commit history
✅ CI workflow on pushes to main
✅ Automated file and JavaScript syntax checks
✅ Failed CI run demonstrated
✅ Successful CI run after fix
✅ GitHub Pages deployment completed