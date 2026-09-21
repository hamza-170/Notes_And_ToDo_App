"use strict";

/* =========================================================
   NOTESPace
   Professional Browser Notepad
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const NOTES_KEY = "notespace.notes.v1";
const SETTINGS_KEY = "notespace.settings.v1";


/* =========================================================
   DOM REFERENCES
========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const sidebar = $("#sidebar");
const notesList = $("#notesList");
const editorPanel = $("#editorPanel");
const editorContainer = $("#editorContainer");
const noNoteSelected = $("#noNoteSelected");

const newNoteBtn = $("#newNoteBtn");
const emptyNewNoteBtn = $("#emptyNewNoteBtn");
const welcomeNewNoteBtn = $("#welcomeNewNoteBtn");

const searchInput = $("#searchInput");
const clearSearchBtn = $("#clearSearchBtn");
const sortSelect = $("#sortSelect");

const viewTitle = $("#viewTitle");
const visibleCount = $("#visibleCount");

const allCount = $("#allCount");
const favoriteCount = $("#favoriteCount");
const archiveCount = $("#archiveCount");
const trashCount = $("#trashCount");

const emptyState = $("#emptyState");
const emptyTitle = $("#emptyTitle");
const emptyDescription = $("#emptyDescription");

const noteTitle = $("#noteTitle");
const noteContent = $("#noteContent");
const tagsInput = $("#tagsInput");

const createdDate = $("#createdDate");
const updatedDate = $("#updatedDate");

const favoriteBtn = $("#favoriteBtn");
const pinBtn = $("#pinBtn");
const colorSelect = $("#colorSelect");

const copyBtn = $("#copyBtn");
const duplicateBtn = $("#duplicateBtn");
const archiveBtn = $("#archiveBtn");
const deleteBtn = $("#deleteBtn");
const exportNoteBtn = $("#exportNoteBtn");
const printBtn = $("#printBtn");
const focusBtn = $("#focusBtn");

const saveStatus = $("#saveStatus");

const wordCount = $("#wordCount");
const charCount = $("#charCount");
const lineCount = $("#lineCount");

const decreaseFontBtn = $("#decreaseFontBtn");
const increaseFontBtn = $("#increaseFontBtn");
const fontSizeLabel = $("#fontSizeLabel");

const themeToggle = $("#themeToggle");
const themeIcon = $("#themeIcon");
const themeText = $("#themeText");

const backupBtn = $("#backupBtn");
const importBtn = $("#importBtn");
const fileInput = $("#fileInput");

const shortcutsBtn = $("#shortcutsBtn");
const shortcutsDialog = $("#shortcutsDialog");
const closeShortcutsBtn = $("#closeShortcutsBtn");

const findBtn = $("#findBtn");
const findPanel = $("#findPanel");
const findInput = $("#findInput");
const replaceInput = $("#replaceInput");
const findNextBtn = $("#findNextBtn");
const replaceBtn = $("#replaceBtn");
const replaceAllBtn = $("#replaceAllBtn");
const closeFindBtn = $("#closeFindBtn");
const findStatus = $("#findStatus");

const mobileMenuBtn = $("#mobileMenuBtn");
const mobileOverlay = $("#mobileOverlay");


/* =========================================================
   APPLICATION STATE
========================================================= */

let notes = [];

let selectedNoteId = null;

let currentView = "all";

let saveTimer = null;

let settings = {
    theme: "light",
    sort: "updated",
    fontSize: 16
};


/* =========================================================
   UTILITIES
========================================================= */

function generateId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 10)
    );
}


function escapeFileName(name) {
    return (
        name
            .trim()
            .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
            .replace(/\s+/g, " ")
            .substring(0, 80) ||
        "Untitled Note"
    );
}


function formatDate(timestamp) {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    }).format(date);
}


function formatShortDate(timestamp) {
    const date = new Date(timestamp);

    const now = new Date();

    const sameDay =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

    if (sameDay) {
        return new Intl.DateTimeFormat(undefined, {
            hour: "numeric",
            minute: "2-digit"
        }).format(date);
    }

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric"
    }).format(date);
}


function pluralize(number, singular, plural = `${singular}s`) {
    return `${number} ${number === 1 ? singular : plural}`;
}


function getSelectedNote() {
    return notes.find(
        (note) => note.id === selectedNoteId
    );
}


function downloadFile(fileName, content, mimeType) {
    const blob = new Blob(
        [content],
        {
            type: mimeType
        }
    );

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;

    document.body.appendChild(anchor);

    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
}


function normalizeTags(value) {
    const tags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

    return [...new Set(tags)].slice(0, 15);
}


/* =========================================================
   STORAGE
========================================================= */

function saveNotes() {
    localStorage.setItem(
        NOTES_KEY,
        JSON.stringify(notes)
    );
}


function saveSettings() {
    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );
}


function loadData() {
    try {
        const storedNotes = JSON.parse(
            localStorage.getItem(NOTES_KEY)
        );

        if (Array.isArray(storedNotes)) {
            notes = storedNotes.map(normalizeImportedNote);
        }
    } catch (error) {
        console.error("Unable to load notes:", error);
        notes = [];
    }


    try {
        const storedSettings = JSON.parse(
            localStorage.getItem(SETTINGS_KEY)
        );

        if (
            storedSettings &&
            typeof storedSettings === "object"
        ) {
            settings = {
                ...settings,
                ...storedSettings
            };
        }
    } catch (error) {
        console.error(
            "Unable to load settings:",
            error
        );
    }
}


function normalizeImportedNote(note = {}) {
    const now = Date.now();

    return {
        id:
            typeof note.id === "string"
                ? note.id
                : generateId(),

        title:
            typeof note.title === "string"
                ? note.title
                : "",

        content:
            typeof note.content === "string"
                ? note.content
                : "",

        tags:
            Array.isArray(note.tags)
                ? note.tags
                    .filter(
                        (tag) =>
                            typeof tag === "string"
                    )
                    .slice(0, 15)
                : [],

        isFavorite:
            Boolean(note.isFavorite),

        isPinned:
            Boolean(note.isPinned),

        isArchived:
            Boolean(note.isArchived),

        isTrashed:
            Boolean(note.isTrashed),

        deletedAt:
            Number(note.deletedAt) || null,

        color:
            [
                "default",
                "blue",
                "green",
                "amber",
                "rose",
                "purple"
            ].includes(note.color)
                ? note.color
                : "default",

        createdAt:
            Number(note.createdAt) || now,

        updatedAt:
            Number(note.updatedAt) || now
    };
}


/* =========================================================
   FIRST-TIME SAMPLE NOTE
========================================================= */

function createWelcomeNote() {
    if (notes.length > 0) return;

    const now = Date.now();

    notes.push({
        id: generateId(),

        title: "Welcome to NoteSpace",

        content:
`Welcome to your professional browser notepad.

Everything you write is automatically saved on this device.

Useful features:
• Create unlimited notes
• Search instantly
• Favorite important notes
• Pin notes to the top
• Organize with tags
• Archive old notes
• Restore notes from Trash
• Find and replace text
• Export notes as TXT
• Backup all notes as JSON
• Import TXT and JSON files
• Print notes
• Light and dark themes
• Adjustable editor font size
• Focus mode
• Keyboard shortcuts

Start writing by editing this note or creating a new one.`,

        tags: [
            "welcome",
            "notespace"
        ],

        isFavorite: true,
        isPinned: true,
        isArchived: false,
        isTrashed: false,
        deletedAt: null,

        color: "purple",

        createdAt: now,
        updatedAt: now
    });

    saveNotes();
}


/* =========================================================
   SETTINGS
========================================================= */

function applySettings() {

    /* Theme */

    document.documentElement.dataset.theme =
        settings.theme;

    if (settings.theme === "dark") {
        themeIcon.textContent = "☀";
        themeText.textContent = "Light mode";

        document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute(
                "content",
                "#131922"
            );
    } else {
        themeIcon.textContent = "☾";
        themeText.textContent = "Dark mode";

        document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute(
                "content",
                "#ffffff"
            );
    }


    /* Sort */

    sortSelect.value = settings.sort;


    /* Editor font */

    settings.fontSize = Math.max(
        12,
        Math.min(
            26,
            Number(settings.fontSize) || 16
        )
    );

    document.documentElement.style.setProperty(
        "--editor-font-size",
        `${settings.fontSize}px`
    );

    fontSizeLabel.textContent =
        `${settings.fontSize}px`;
}


/* =========================================================
   CREATE NOTE
========================================================= */

function createNewNote() {
    const now = Date.now();

    const note = {
        id: generateId(),

        title: "",
        content: "",
        tags: [],

        isFavorite: false,
        isPinned: false,
        isArchived: false,
        isTrashed: false,

        deletedAt: null,

        color: "default",

        createdAt: now,
        updatedAt: now
    };

    notes.unshift(note);

    saveNotes();

    currentView = "all";

    updateNavigation();

    selectedNoteId = note.id;

    render();

    openEditorOnMobile();

    requestAnimationFrame(() => {
        noteTitle.focus();
    });
}


/* =========================================================
   FILTER / SORT NOTES
========================================================= */

function getVisibleNotes() {

    let filtered = notes.filter((note) => {

        switch (currentView) {

            case "favorites":
                return (
                    note.isFavorite &&
                    !note.isArchived &&
                    !note.isTrashed
                );

            case "archive":
                return (
                    note.isArchived &&
                    !note.isTrashed
                );

            case "trash":
                return note.isTrashed;

            case "all":
            default:
                return (
                    !note.isArchived &&
                    !note.isTrashed
                );
        }
    });


    const query =
        searchInput.value
            .trim()
            .toLowerCase();

    if (query) {
        filtered = filtered.filter((note) => {

            const title =
                note.title.toLowerCase();

            const content =
                note.content.toLowerCase();

            const tags =
                note.tags
                    .join(" ")
                    .toLowerCase();

            return (
                title.includes(query) ||
                content.includes(query) ||
                tags.includes(query)
            );
        });
    }


    filtered.sort((a, b) => {

        if (currentView !== "trash") {

            if (
                a.isPinned &&
                !b.isPinned
            ) {
                return -1;
            }

            if (
                !a.isPinned &&
                b.isPinned
            ) {
                return 1;
            }

        }


        switch (settings.sort) {

            case "created":
                return (
                    b.createdAt -
                    a.createdAt
                );

            case "title":
                return (
                    (a.title || "Untitled Note")
                        .localeCompare(
                            b.title ||
                            "Untitled Note",
                            undefined,
                            {
                                sensitivity: "base"
                            }
                        )
                );

            case "oldest":
                return (
                    a.updatedAt -
                    b.updatedAt
                );

            case "updated":
            default:
                return (
                    b.updatedAt -
                    a.updatedAt
                );
        }

    });


    return filtered;
}


/* =========================================================
   RENDER
========================================================= */

function render() {
    updateCounts();
    renderNotesList();
    renderEditor();
    updateNavigation();
}


function renderNotesList() {

    const visibleNotes =
        getVisibleNotes();

    notesList.innerHTML = "";

    visibleCount.textContent =
        pluralize(
            visibleNotes.length,
            "note"
        );


    if (visibleNotes.length === 0) {
        emptyState.classList.remove("hidden");

        configureEmptyState();

        return;
    }

    emptyState.classList.add("hidden");


    visibleNotes.forEach((note) => {

        const card =
            document.createElement("article");

        card.className = "note-card";

        card.dataset.id = note.id;
        card.dataset.color = note.color;

        if (
            note.id === selectedNoteId
        ) {
            card.classList.add("active");
        }


        /* Top row */

        const top =
            document.createElement("div");

        top.className =
            "note-card-top";


        const title =
            document.createElement("div");

        title.className =
            "note-card-title";

        title.textContent =
            note.title.trim() ||
            "Untitled Note";


        const icons =
            document.createElement("div");

        icons.className =
            "note-card-icons";


        /* Pin */

        const pin =
            document.createElement("button");

        pin.className =
            "note-card-action pin";

        pin.title = note.isPinned
            ? "Unpin"
            : "Pin";

        pin.textContent = "♧";

        if (note.isPinned) {
            pin.classList.add("active");
        }

        pin.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();

                note.isPinned =
                    !note.isPinned;

                note.updatedAt =
                    Date.now();

                saveNotes();
                render();
            }
        );


        /* Favorite */

        const favorite =
            document.createElement("button");

        favorite.className =
            "note-card-action favorite";

        favorite.title =
            note.isFavorite
                ? "Remove favorite"
                : "Favorite";

        favorite.textContent =
            note.isFavorite
                ? "★"
                : "☆";

        if (note.isFavorite) {
            favorite.classList.add(
                "active"
            );
        }

        favorite.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();

                note.isFavorite =
                    !note.isFavorite;

                note.updatedAt =
                    Date.now();

                saveNotes();
                render();
            }
        );


        icons.append(
            pin,
            favorite
        );

        top.append(
            title,
            icons
        );


        /* Preview */

        const preview =
            document.createElement("div");

        preview.className =
            "note-card-preview";

        preview.textContent =
            note.content.trim() ||
            "No additional text";


        /* Bottom meta */

        const meta =
            document.createElement("div");

        meta.className =
            "note-card-meta";


        const tags =
            document.createElement("div");

        tags.className =
            "note-card-tags";

        note.tags
            .slice(0, 2)
            .forEach((tagText) => {

                const tag =
                    document.createElement("span");

                tag.className =
                    "note-tag";

                tag.textContent =
                    `#${tagText}`;

                tags.appendChild(tag);
            });


        const time =
            document.createElement("span");

        time.textContent =
            formatShortDate(
                currentView === "trash"
                    ? note.deletedAt ||
                      note.updatedAt
                    : note.updatedAt
            );


        meta.append(
            tags,
            time
        );


        card.append(
            top,
            preview,
            meta
        );


        card.addEventListener(
            "click",
            () => {
                selectNote(note.id);
            }
        );


        notesList.appendChild(card);
    });
}


/* =========================================================
   EMPTY STATE
========================================================= */

function configureEmptyState() {

    const query =
        searchInput.value.trim();

    if (query) {
        emptyTitle.textContent =
            "No matching notes";

        emptyDescription.textContent =
            "Try a different search term.";

        emptyNewNoteBtn.classList.add(
            "hidden"
        );

        return;
    }


    emptyNewNoteBtn.classList.remove(
        "hidden"
    );


    switch (currentView) {

        case "favorites":
            emptyTitle.textContent =
                "No favorites";

            emptyDescription.textContent =
                "Favorite a note to keep it easy to find.";

            break;


        case "archive":
            emptyTitle.textContent =
                "Archive is empty";

            emptyDescription.textContent =
                "Archived notes will appear here.";

            break;


        case "trash":
            emptyTitle.textContent =
                "Trash is empty";

            emptyDescription.textContent =
                "Deleted notes will appear here.";

            emptyNewNoteBtn.classList.add(
                "hidden"
            );

            break;


        default:
            emptyTitle.textContent =
                "No notes yet";

            emptyDescription.textContent =
                "Create a note to start writing.";
    }
}


/* =========================================================
   SELECT NOTE
========================================================= */

function selectNote(id) {

    flushCurrentNote();

    selectedNoteId = id;

    render();

    openEditorOnMobile();
}


/* =========================================================
   EDITOR
========================================================= */

function renderEditor() {

    const note =
        getSelectedNote();

    if (!note) {

        editorContainer.classList.add(
            "hidden"
        );

        noNoteSelected.classList.remove(
            "hidden"
        );

        return;
    }


    noNoteSelected.classList.add(
        "hidden"
    );

    editorContainer.classList.remove(
        "hidden"
    );


    noteTitle.value =
        note.title;

    noteContent.value =
        note.content;

    tagsInput.value =
        note.tags.join(", ");


    createdDate.textContent =
        `Created ${formatDate(
            note.createdAt
        )}`;

    updatedDate.textContent =
        `Updated ${formatDate(
            note.updatedAt
        )}`;


    favoriteBtn.textContent =
        note.isFavorite
            ? "★"
            : "☆";

    favoriteBtn.classList.toggle(
        "favorite-active",
        note.isFavorite
    );


    pinBtn.classList.toggle(
        "active",
        note.isPinned
    );


    colorSelect.value =
        note.color;


    if (note.isTrashed) {

        archiveBtn.textContent = "↶";
        archiveBtn.title =
            "Restore note";

        deleteBtn.title =
            "Delete permanently";

    } else {

        archiveBtn.textContent =
            note.isArchived
                ? "↶"
                : "▣";

        archiveBtn.title =
            note.isArchived
                ? "Unarchive note"
                : "Archive note";

        deleteBtn.title =
            "Move to Trash";
    }


    noteTitle.disabled =
        note.isTrashed;

    noteContent.disabled =
        note.isTrashed;

    tagsInput.disabled =
        note.isTrashed;

    colorSelect.disabled =
        note.isTrashed;


    updateTextStatistics();
}


/* =========================================================
   AUTOSAVE
========================================================= */

function queueSave() {

    const note =
        getSelectedNote();

    if (
        !note ||
        note.isTrashed
    ) {
        return;
    }


    saveStatus.textContent =
        "Saving...";

    saveStatus.classList.add(
        "saving"
    );


    clearTimeout(saveTimer);

    saveTimer = setTimeout(
        () => {
            flushCurrentNote();
        },
        450
    );
}


function flushCurrentNote() {

    clearTimeout(saveTimer);

    const note =
        getSelectedNote();

    if (
        !note ||
        note.isTrashed
    ) {
        return;
    }


    const newTitle =
        noteTitle.value;

    const newContent =
        noteContent.value;

    const newTags =
        normalizeTags(
            tagsInput.value
        );


    const changed =
        note.title !== newTitle ||
        note.content !== newContent ||
        JSON.stringify(note.tags) !==
        JSON.stringify(newTags);


    if (!changed) {

        saveStatus.textContent =
            "Saved";

        saveStatus.classList.remove(
            "saving"
        );

        return;
    }


    note.title =
        newTitle;

    note.content =
        newContent;

    note.tags =
        newTags;

    note.updatedAt =
        Date.now();


    saveNotes();


    saveStatus.textContent =
        "Saved";

    saveStatus.classList.remove(
        "saving"
    );


    updatedDate.textContent =
        `Updated ${formatDate(
            note.updatedAt
        )}`;


    renderNotesList();
    updateCounts();
}


/* =========================================================
   TEXT STATS
========================================================= */

function updateTextStatistics() {

    const content =
        noteContent.value;

    const trimmed =
        content.trim();

    const words =
        trimmed
            ? trimmed
                .split(/\s+/)
                .filter(Boolean)
                .length
            : 0;

    const characters =
        content.length;

    const lines =
        content.length
            ? content.split(/\n/).length
            : 1;


    wordCount.textContent =
        pluralize(
            words,
            "word"
        );

    charCount.textContent =
        pluralize(
            characters,
            "character"
        );

    lineCount.textContent =
        pluralize(
            lines,
            "line"
        );
}


/* =========================================================
   COUNTS
========================================================= */

function updateCounts() {

    allCount.textContent =
        notes.filter(
            (note) =>
                !note.isArchived &&
                !note.isTrashed
        ).length;

    favoriteCount.textContent =
        notes.filter(
            (note) =>
                note.isFavorite &&
                !note.isArchived &&
                !note.isTrashed
        ).length;

    archiveCount.textContent =
        notes.filter(
            (note) =>
                note.isArchived &&
                !note.isTrashed
        ).length;

    trashCount.textContent =
        notes.filter(
            (note) =>
                note.isTrashed
        ).length;
}


/* =========================================================
   NAVIGATION
========================================================= */

function updateNavigation() {

    $$(".nav-item").forEach(
        (button) => {

            button.classList.toggle(
                "active",
                button.dataset.view ===
                currentView
            );

        }
    );


    const titles = {
        all: "All Notes",
        favorites: "Favorites",
        archive: "Archive",
        trash: "Trash"
    };

    viewTitle.textContent =
        titles[currentView] ||
        "Notes";
}


function changeView(view) {

    flushCurrentNote();

    currentView = view;

    const current =
        getSelectedNote();

    if (current) {

        const matchesView =
            getVisibleNotes().some(
                (note) =>
                    note.id ===
                    current.id
            );

        if (!matchesView) {
            selectedNoteId = null;
        }

    }

    closeSidebar();

    render();
}


/* =========================================================
   FAVORITE
========================================================= */

function toggleFavorite() {

    const note =
        getSelectedNote();

    if (!note) return;

    note.isFavorite =
        !note.isFavorite;

    note.updatedAt =
        Date.now();

    saveNotes();

    render();
}


/* =========================================================
   PIN
========================================================= */

function togglePin() {

    const note =
        getSelectedNote();

    if (
        !note ||
        note.isTrashed
    ) {
        return;
    }

    note.isPinned =
        !note.isPinned;

    note.updatedAt =
        Date.now();

    saveNotes();

    render();
}


/* =========================================================
   ARCHIVE / RESTORE
========================================================= */

function archiveOrRestore() {

    const note =
        getSelectedNote();

    if (!note) return;


    if (note.isTrashed) {

        note.isTrashed = false;
        note.isArchived = false;
        note.deletedAt = null;

        note.updatedAt =
            Date.now();

        currentView = "all";

        saveNotes();

        render();

        return;
    }


    note.isArchived =
        !note.isArchived;

    note.updatedAt =
        Date.now();

    saveNotes();

    selectedNoteId = null;

    render();
}


/* =========================================================
   DELETE / TRASH
========================================================= */

function deleteSelectedNote() {

    const note =
        getSelectedNote();

    if (!note) return;


    /* Permanent delete */

    if (note.isTrashed) {

        const confirmed =
            window.confirm(
                `Permanently delete "${
                    note.title ||
                    "Untitled Note"
                }"?\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }


        notes =
            notes.filter(
                (item) =>
                    item.id !==
                    note.id
            );

        selectedNoteId = null;

        saveNotes();

        render();

        closeEditorOnMobile();

        return;
    }


    /* Move to trash */

    note.isTrashed = true;
    note.isArchived = false;

    note.deletedAt =
        Date.now();

    note.updatedAt =
        Date.now();

    selectedNoteId = null;

    saveNotes();

    render();

    closeEditorOnMobile();
}


/* =========================================================
   DUPLICATE
========================================================= */

function duplicateSelectedNote() {

    flushCurrentNote();

    const source =
        getSelectedNote();

    if (
        !source ||
        source.isTrashed
    ) {
        return;
    }


    const now = Date.now();

    const duplicate = {
        ...source,

        id: generateId(),

        title:
            `${source.title || "Untitled Note"} Copy`,

        isPinned: false,
        isArchived: false,
        isTrashed: false,
        deletedAt: null,

        createdAt: now,
        updatedAt: now
    };


    duplicate.tags =
        [...source.tags];


    notes.unshift(
        duplicate
    );

    currentView = "all";
    selectedNoteId =
        duplicate.id;

    saveNotes();

    render();

    noteTitle.focus();
}


/* =========================================================
   COPY NOTE
========================================================= */

async function copySelectedNote() {

    flushCurrentNote();

    const note =
        getSelectedNote();

    if (!note) return;


    const text =
        [
            note.title || "Untitled Note",
            "",
            note.content
        ].join("\n");


    try {

        await navigator.clipboard.writeText(
            text
        );

        temporaryButtonText(
            copyBtn,
            "✓",
            1000
        );

    } catch {

        /* Fallback */

        const textarea =
            document.createElement(
                "textarea"
            );

        textarea.value = text;

        document.body.appendChild(
            textarea
        );

        textarea.select();

        document.execCommand(
            "copy"
        );

        textarea.remove();

        temporaryButtonText(
            copyBtn,
            "✓",
            1000
        );
    }
}


function temporaryButtonText(
    element,
    value,
    delay
) {

    const original =
        element.textContent;

    element.textContent =
        value;

    setTimeout(() => {
        element.textContent =
            original;
    }, delay);
}


/* =========================================================
   EXPORT CURRENT NOTE
========================================================= */

function exportSelectedNote() {

    flushCurrentNote();

    const note =
        getSelectedNote();

    if (!note) return;


    const contents =
`${note.title || "Untitled Note"}

${note.content}

${note.tags.length
    ? `Tags: ${note.tags.join(", ")}`
    : ""}`;


    downloadFile(
        `${escapeFileName(
            note.title ||
            "Untitled Note"
        )}.txt`,

        contents.trimEnd(),

        "text/plain;charset=utf-8"
    );
}


/* =========================================================
   BACKUP ALL NOTES
========================================================= */

function backupAllNotes() {

    flushCurrentNote();

    const backup = {
        app: "NoteSpace",

        version: 1,

        exportedAt:
            new Date().toISOString(),

        notes
    };


    const date =
        new Date()
            .toISOString()
            .slice(0, 10);


    downloadFile(
        `notespace-backup-${date}.json`,

        JSON.stringify(
            backup,
            null,
            2
        ),

        "application/json"
    );
}


/* =========================================================
   IMPORT
========================================================= */

function importFile(file) {

    if (!file) return;


    const reader =
        new FileReader();


    reader.onload = () => {

        const text =
            String(reader.result || "");


        /* JSON */

        if (
            file.name
                .toLowerCase()
                .endsWith(".json")
        ) {

            try {

                const parsed =
                    JSON.parse(text);

                let importedNotes;


                if (
                    Array.isArray(parsed)
                ) {
                    importedNotes =
                        parsed;

                } else if (
                    parsed &&
                    Array.isArray(
                        parsed.notes
                    )
                ) {
                    importedNotes =
                        parsed.notes;

                } else {
                    throw new Error(
                        "No valid notes array found."
                    );
                }


                const normalized =
                    importedNotes.map(
                        (note) => {

                            const imported =
                                normalizeImportedNote(
                                    note
                                );

                            /*
                             Prevent ID collisions.
                            */

                            if (
                                notes.some(
                                    (existing) =>
                                        existing.id ===
                                        imported.id
                                )
                            ) {
                                imported.id =
                                    generateId();
                            }

                            return imported;
                        }
                    );


                notes = [
                    ...normalized,
                    ...notes
                ];

                saveNotes();

                currentView =
                    "all";

                selectedNoteId =
                    normalized[0]?.id ||
                    selectedNoteId;

                render();


                window.alert(
                    `${normalized.length} note(s) imported successfully.`
                );

            } catch (error) {

                window.alert(
                    "The selected JSON file is not a valid NoteSpace backup."
                );

                console.error(
                    error
                );
            }

            return;
        }


        /* TXT */

        const now =
            Date.now();

        const fileName =
            file.name
                .replace(
                    /\.txt$/i,
                    ""
                );


        const note = {
            id: generateId(),

            title:
                fileName ||
                "Imported Note",

            content: text,

            tags: [
                "imported"
            ],

            isFavorite: false,
            isPinned: false,
            isArchived: false,
            isTrashed: false,

            deletedAt: null,

            color: "default",

            createdAt: now,
            updatedAt: now
        };


        notes.unshift(note);

        currentView = "all";
        selectedNoteId =
            note.id;

        saveNotes();

        render();
    };


    reader.onerror = () => {
        window.alert(
            "Unable to read that file."
        );
    };


    reader.readAsText(file);
}


/* =========================================================
   FIND AND REPLACE
========================================================= */

function openFindPanel() {

    const note =
        getSelectedNote();

    if (!note) return;

    findPanel.classList.remove(
        "hidden"
    );

    findInput.focus();

    findInput.select();
}


function closeFindPanel() {

    findPanel.classList.add(
        "hidden"
    );

    findStatus.textContent = "";
}


function findNext() {

    const query =
        findInput.value;

    if (!query) {
        findStatus.textContent =
            "Enter text to find";

        return;
    }


    const content =
        noteContent.value;

    const source =
        content.toLowerCase();

    const needle =
        query.toLowerCase();


    let start =
        noteContent.selectionEnd;


    let index =
        source.indexOf(
            needle,
            start
        );


    /* Wrap around */

    if (index === -1) {
        index =
            source.indexOf(
                needle,
                0
            );
    }


    if (index === -1) {

        findStatus.textContent =
            "Not found";

        return;
    }


    noteContent.focus();

    noteContent.setSelectionRange(
        index,
        index + query.length
    );


    findStatus.textContent =
        "Found";
}


function replaceCurrent() {

    const query =
        findInput.value;

    if (!query) return;


    const selectedText =
        noteContent.value.substring(
            noteContent.selectionStart,
            noteContent.selectionEnd
        );


    if (
        selectedText.toLowerCase() ===
        query.toLowerCase()
    ) {

        const start =
            noteContent.selectionStart;

        noteContent.setRangeText(
            replaceInput.value,
            noteContent.selectionStart,
            noteContent.selectionEnd,
            "end"
        );

        noteContent.setSelectionRange(
            start,
            start +
            replaceInput.value.length
        );

        updateTextStatistics();
        queueSave();

        findStatus.textContent =
            "Replaced";

        findNext();

    } else {

        findNext();
    }
}


function replaceAll() {

    const query =
        findInput.value;

    if (!query) return;


    const original =
        noteContent.value;

    const escapedQuery =
        query.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

    const regex =
        new RegExp(
            escapedQuery,
            "gi"
        );


    const matches =
        original.match(regex);


    if (!matches) {

        findStatus.textContent =
            "No matches";

        return;
    }


    noteContent.value =
        original.replace(
            regex,
            replaceInput.value
        );


    updateTextStatistics();

    queueSave();


    findStatus.textContent =
        `${matches.length} replaced`;
}


/* =========================================================
   PRINT
========================================================= */

function printSelectedNote() {

    flushCurrentNote();

    if (!getSelectedNote()) return;

    window.print();
}


/* =========================================================
   FONT SIZE
========================================================= */

function changeFontSize(amount) {

    settings.fontSize =
        Math.max(
            12,
            Math.min(
                26,
                settings.fontSize +
                amount
            )
        );

    saveSettings();

    applySettings();
}


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    settings.theme =
        settings.theme ===
        "dark"
            ? "light"
            : "dark";

    saveSettings();

    applySettings();
}


/* =========================================================
   FOCUS MODE
========================================================= */

function toggleFocusMode() {

    document.body.classList.toggle(
        "focus-mode"
    );

    focusBtn.classList.toggle(
        "active",
        document.body.classList.contains(
            "focus-mode"
        )
    );
}


/* =========================================================
   MOBILE
========================================================= */

function openSidebar() {

    sidebar.classList.add(
        "open"
    );

    mobileOverlay.classList.add(
        "active"
    );
}


function closeSidebar() {

    sidebar.classList.remove(
        "open"
    );

    mobileOverlay.classList.remove(
        "active"
    );
}


function openEditorOnMobile() {

    if (
        window.matchMedia(
            "(max-width: 650px)"
        ).matches
    ) {
        editorPanel.classList.add(
            "mobile-open"
        );
    }
}


function closeEditorOnMobile() {

    editorPanel.classList.remove(
        "mobile-open"
    );
}


/* =========================================================
   EVENT LISTENERS
========================================================= */


/* New note */

[
    newNoteBtn,
    emptyNewNoteBtn,
    welcomeNewNoteBtn
].forEach((button) => {

    button.addEventListener(
        "click",
        createNewNote
    );

});


/* Navigation */

$$(".nav-item").forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                changeView(
                    button.dataset.view
                );

            }
        );

    }
);


/* Editor input */

noteTitle.addEventListener(
    "input",
    () => {
        queueSave();
    }
);


noteContent.addEventListener(
    "input",
    () => {
        updateTextStatistics();
        queueSave();
    }
);


tagsInput.addEventListener(
    "input",
    queueSave
);


/* Favorite */

favoriteBtn.addEventListener(
    "click",
    toggleFavorite
);


/* Pin */

pinBtn.addEventListener(
    "click",
    togglePin
);


/* Color */

colorSelect.addEventListener(
    "change",
    () => {

        const note =
            getSelectedNote();

        if (
            !note ||
            note.isTrashed
        ) {
            return;
        }

        note.color =
            colorSelect.value;

        note.updatedAt =
            Date.now();

        saveNotes();

        renderNotesList();
    }
);


/* Archive / restore */

archiveBtn.addEventListener(
    "click",
    archiveOrRestore
);


/* Delete */

deleteBtn.addEventListener(
    "click",
    deleteSelectedNote
);


/* Duplicate */

duplicateBtn.addEventListener(
    "click",
    duplicateSelectedNote
);


/* Copy */

copyBtn.addEventListener(
    "click",
    copySelectedNote
);


/* Export */

exportNoteBtn.addEventListener(
    "click",
    exportSelectedNote
);


/* Print */

printBtn.addEventListener(
    "click",
    printSelectedNote
);


/* Focus */

focusBtn.addEventListener(
    "click",
    toggleFocusMode
);


/* Search */

searchInput.addEventListener(
    "input",
    () => {

        clearSearchBtn.classList.toggle(
            "hidden",
            !searchInput.value
        );

        renderNotesList();
    }
);


clearSearchBtn.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        clearSearchBtn.classList.add(
            "hidden"
        );

        searchInput.focus();

        renderNotesList();
    }
);


/* Sort */

sortSelect.addEventListener(
    "change",
    () => {

        settings.sort =
            sortSelect.value;

        saveSettings();

        renderNotesList();
    }
);


/* Theme */

themeToggle.addEventListener(
    "click",
    toggleTheme
);


/* Font size */

increaseFontBtn.addEventListener(
    "click",
    () => changeFontSize(1)
);

decreaseFontBtn.addEventListener(
    "click",
    () => changeFontSize(-1)
);


/* Backup */

backupBtn.addEventListener(
    "click",
    backupAllNotes
);


/* Import */

importBtn.addEventListener(
    "click",
    () => {
        fileInput.click();
    }
);


fileInput.addEventListener(
    "change",
    () => {

        importFile(
            fileInput.files[0]
        );

        /*
         Allow selecting the same file again later.
        */

        fileInput.value = "";
    }
);


/* Shortcuts dialog */

shortcutsBtn.addEventListener(
    "click",
    () => {

        if (
            typeof shortcutsDialog.showModal ===
            "function"
        ) {
            shortcutsDialog.showModal();
        }

    }
);


closeShortcutsBtn.addEventListener(
    "click",
    () => {
        shortcutsDialog.close();
    }
);


shortcutsDialog.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            shortcutsDialog
        ) {
            shortcutsDialog.close();
        }

    }
);


/* Find */

findBtn.addEventListener(
    "click",
    openFindPanel
);


closeFindBtn.addEventListener(
    "click",
    closeFindPanel
);


findNextBtn.addEventListener(
    "click",
    findNext
);


replaceBtn.addEventListener(
    "click",
    replaceCurrent
);


replaceAllBtn.addEventListener(
    "click",
    replaceAll
);


findInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {
            event.preventDefault();
            findNext();
        }

    }
);


/* Mobile sidebar */

mobileMenuBtn.addEventListener(
    "click",
    openSidebar
);


mobileOverlay.addEventListener(
    "click",
    closeSidebar
);


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        const control =
            event.ctrlKey ||
            event.metaKey;


        /*
         Ctrl / Cmd + N
         New note
        */

        if (
            control &&
            event.key.toLowerCase() === "n"
        ) {

            event.preventDefault();

            createNewNote();

            return;
        }


        /*
         Ctrl / Cmd + S
         Save
        */

        if (
            control &&
            event.key.toLowerCase() === "s"
        ) {

            event.preventDefault();

            flushCurrentNote();

            saveStatus.textContent =
                "Saved";

            return;
        }


        /*
         Ctrl / Cmd + K
         Search notes
        */

        if (
            control &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            searchInput.focus();
            searchInput.select();

            return;
        }


        /*
         Ctrl / Cmd + F
         Find inside current note
        */

        if (
            control &&
            !event.shiftKey &&
            event.key.toLowerCase() === "f"
        ) {

            const note =
                getSelectedNote();

            if (note) {
                event.preventDefault();
                openFindPanel();
            }

            return;
        }


        /*
         Ctrl / Cmd + Shift + F
         Favorite
        */

        if (
            control &&
            event.shiftKey &&
            event.key.toLowerCase() === "f"
        ) {

            event.preventDefault();

            toggleFavorite();

            return;
        }


        /*
         Ctrl / Cmd + E
         Export
        */

        if (
            control &&
            event.key.toLowerCase() === "e"
        ) {

            event.preventDefault();

            exportSelectedNote();

            return;
        }


        /*
         Escape
        */

        if (
            event.key === "Escape"
        ) {

            if (
                !findPanel.classList.contains(
                    "hidden"
                )
            ) {
                closeFindPanel();
                return;
            }


            if (
                document.body.classList.contains(
                    "focus-mode"
                )
            ) {
                toggleFocusMode();
                return;
            }


            if (
                window.matchMedia(
                    "(max-width: 650px)"
                ).matches
            ) {
                closeEditorOnMobile();
            }

        }

    }
);


/* =========================================================
   DATA SAFETY EVENTS
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {
        flushCurrentNote();
    }
);


document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "hidden"
        ) {
            flushCurrentNote();
        }

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeApp() {

    loadData();

    createWelcomeNote();

    applySettings();


    /*
     Select the newest available regular note.
    */

    const initialNote =
        notes
            .filter(
                (note) =>
                    !note.isTrashed &&
                    !note.isArchived
            )
            .sort(
                (a, b) =>
                    b.updatedAt -
                    a.updatedAt
            )[0];


    if (initialNote) {
        selectedNoteId =
            initialNote.id;
    }


    render();
}


initializeApp();