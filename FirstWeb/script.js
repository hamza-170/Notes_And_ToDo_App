"use strict";


/* ==========================================
   STORAGE
========================================== */

const NOTES_KEY =
    "notespace.notes.v2";

const SETTINGS_KEY =
    "notespace.settings.v1";



/* ==========================================
   DOM
========================================== */

const $ =
    (selector) =>
        document.querySelector(selector);


const $$ =
    (selector) =>
        document.querySelectorAll(selector);



const sidebar =
    $("#sidebar");

const notesList =
    $("#notesList");

const editorPanel =
    $("#editorPanel");

const editorContainer =
    $("#editorContainer");

const noNoteSelected =
    $("#noNoteSelected");



const newNoteBtn =
    $("#newNoteBtn");

const emptyNewNoteBtn =
    $("#emptyNewNoteBtn");

const welcomeNewNoteBtn =
    $("#welcomeNewNoteBtn");



const searchInput =
    $("#searchInput");

const clearSearchBtn =
    $("#clearSearchBtn");

const sortSelect =
    $("#sortSelect");



const viewTitle =
    $("#viewTitle");

const visibleCount =
    $("#visibleCount");



const allCount =
    $("#allCount");

const favoriteCount =
    $("#favoriteCount");

const archiveCount =
    $("#archiveCount");

const trashCount =
    $("#trashCount");



const emptyState =
    $("#emptyState");

const emptyTitle =
    $("#emptyTitle");

const emptyDescription =
    $("#emptyDescription");



const noteTitle =
    $("#noteTitle");

const noteContent =
    $("#noteContent");

const tagsInput =
    $("#tagsInput");



const noteTypeSelect =
    $("#noteTypeSelect");



const todoContainer =
    $("#todoContainer");

const todoInput =
    $("#todoInput");

const addTodoBtn =
    $("#addTodoBtn");

const todoList =
    $("#todoList");

const clearCompletedBtn =
    $("#clearCompletedBtn");

const taskCount =
    $("#taskCount");



const createdDate =
    $("#createdDate");

const updatedDate =
    $("#updatedDate");



const favoriteBtn =
    $("#favoriteBtn");

const pinBtn =
    $("#pinBtn");

const colorSelect =
    $("#colorSelect");



const copyBtn =
    $("#copyBtn");

const duplicateBtn =
    $("#duplicateBtn");

const archiveBtn =
    $("#archiveBtn");

const deleteBtn =
    $("#deleteBtn");

const exportNoteBtn =
    $("#exportNoteBtn");

const printBtn =
    $("#printBtn");

const focusBtn =
    $("#focusBtn");



const saveStatus =
    $("#saveStatus");



const wordCount =
    $("#wordCount");

const charCount =
    $("#charCount");

const lineCount =
    $("#lineCount");



const decreaseFontBtn =
    $("#decreaseFontBtn");

const increaseFontBtn =
    $("#increaseFontBtn");

const fontSizeLabel =
    $("#fontSizeLabel");



const themeToggle =
    $("#themeToggle");

const themeIcon =
    $("#themeIcon");

const themeText =
    $("#themeText");



const backupBtn =
    $("#backupBtn");

const importBtn =
    $("#importBtn");

const fileInput =
    $("#fileInput");



const shortcutsBtn =
    $("#shortcutsBtn");

const shortcutsDialog =
    $("#shortcutsDialog");

const closeShortcutsBtn =
    $("#closeShortcutsBtn");



const findBtn =
    $("#findBtn");

const findPanel =
    $("#findPanel");

const findInput =
    $("#findInput");

const replaceInput =
    $("#replaceInput");

const findNextBtn =
    $("#findNextBtn");

const replaceBtn =
    $("#replaceBtn");

const replaceAllBtn =
    $("#replaceAllBtn");

const closeFindBtn =
    $("#closeFindBtn");

const findStatus =
    $("#findStatus");



const mobileMenuBtn =
    $("#mobileMenuBtn");

const mobileOverlay =
    $("#mobileOverlay");



/* ==========================================
   STATE
========================================== */

let notes = [];

let selectedNoteId = null;

let currentView =
    "all";

let saveTimer = null;



let settings = {

    theme: "light",

    sort: "updated",

    fontSize: 16

};



/* ==========================================
   UTILITIES
========================================== */

function generateId() {

    if (
        typeof crypto !==
            "undefined" &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );

}



function getSelectedNote() {

    return notes.find(
        note =>
            note.id ===
            selectedNoteId
    );

}



function pluralize(
    number,
    singular,
    plural = `${singular}s`
) {

    return (
        `${number} ${
            number === 1
                ? singular
                : plural
        }`
    );

}



function formatDate(timestamp) {

    if (!timestamp) {
        return "";
    }


    return new Intl
        .DateTimeFormat(
            undefined,
            {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        )
        .format(
            new Date(timestamp)
        );

}



function formatShortDate(timestamp) {

    if (!timestamp) {
        return "";
    }


    const date =
        new Date(timestamp);


    return new Intl
        .DateTimeFormat(
            undefined,
            {
                month: "short",
                day: "numeric"
            }
        )
        .format(date);

}



function normalizeTags(value) {

    return [
        ...new Set(
            value
                .split(",")
                .map(
                    tag =>
                        tag.trim()
                )
                .filter(Boolean)
        )
    ].slice(0, 15);

}



function downloadFile(
    filename,
    content,
    type
) {

    const blob =
        new Blob(
            [content],
            {
                type
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        filename;


    document.body
        .appendChild(link);


    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );

}



function safeFilename(name) {

    return (
        name
            .replace(
                /[<>:"/\\|?*]/g,
                "-"
            )
            .trim()
            .substring(0, 70)
        ||
        "Untitled Note"
    );

}



/* ==========================================
   NORMALIZE NOTE DATA
========================================== */

function normalizeNote(note = {}) {

    const now =
        Date.now();


    return {

        id:
            typeof note.id ===
            "string"
                ? note.id
                : generateId(),


        title:
            typeof note.title ===
            "string"
                ? note.title
                : "",


        content:
            typeof note.content ===
            "string"
                ? note.content
                : "",


        type:
            note.type === "todo"
                ? "todo"
                : "note",


        tasks:
            Array.isArray(
                note.tasks
            )
                ? note.tasks.map(
                    task => ({
                        id:
                            task.id ||
                            generateId(),

                        text:
                            typeof task.text ===
                            "string"
                                ? task.text
                                : "",

                        done:
                            Boolean(
                                task.done
                            )
                    })
                )
                : [],


        tags:
            Array.isArray(
                note.tags
            )
                ? note.tags
                : [],


        isFavorite:
            Boolean(
                note.isFavorite
            ),


        isPinned:
            Boolean(
                note.isPinned
            ),


        isArchived:
            Boolean(
                note.isArchived
            ),


        isTrashed:
            Boolean(
                note.isTrashed
            ),


        deletedAt:
            Number(
                note.deletedAt
            ) || null,


        color:
            [
                "default",
                "blue",
                "green",
                "amber",
                "rose",
                "purple"
            ].includes(
                note.color
            )
                ? note.color
                : "default",


        createdAt:
            Number(
                note.createdAt
            ) || now,


        updatedAt:
            Number(
                note.updatedAt
            ) || now

    };

}



/* ==========================================
   STORAGE
========================================== */

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

    /*
     Try new version first.
    */

    let stored =
        localStorage.getItem(
            NOTES_KEY
        );


    /*
     Load old version if user
     already had the previous app.
    */

    if (!stored) {

        stored =
            localStorage.getItem(
                "notespace.notes.v1"
            );

    }


    try {

        const parsed =
            JSON.parse(stored);


        if (
            Array.isArray(parsed)
        ) {

            notes =
                parsed.map(
                    normalizeNote
                );

        }

    } catch {

        notes = [];

    }



    try {

        const storedSettings =
            JSON.parse(
                localStorage.getItem(
                    SETTINGS_KEY
                )
            );


        if (storedSettings) {

            settings = {

                ...settings,

                ...storedSettings

            };

        }

    } catch {

        // Use defaults

    }

}



/* ==========================================
   WELCOME NOTE
========================================== */

function createWelcomeNote() {

    if (
        notes.length > 0
    ) {
        return;
    }


    const now =
        Date.now();


    notes.push({

        id:
            generateId(),

        title:
            "Welcome to NoteSpace",

        content:
`Welcome to your notepad.

You can now create normal notes or To-Do Lists.

Use the Note / To-Do List dropdown in the editor toolbar to change the note type.`,

        type:
            "note",

        tasks: [],

        tags: [
            "welcome"
        ],

        isFavorite:
            true,

        isPinned:
            true,

        isArchived:
            false,

        isTrashed:
            false,

        deletedAt:
            null,

        color:
            "default",

        createdAt:
            now,

        updatedAt:
            now

    });


    saveNotes();

}



/* ==========================================
   SETTINGS
========================================== */

function applySettings() {

    document
        .documentElement
        .dataset
        .theme =
            settings.theme;


    if (
        settings.theme ===
        "dark"
    ) {

        themeIcon.textContent =
            "☀";

        themeText.textContent =
            "Light mode";

    } else {

        themeIcon.textContent =
            "☾";

        themeText.textContent =
            "Dark mode";

    }


    sortSelect.value =
        settings.sort;


    settings.fontSize =
        Math.max(
            12,
            Math.min(
                26,
                Number(
                    settings.fontSize
                ) || 16
            )
        );


    document
        .documentElement
        .style
        .setProperty(
            "--editor-font-size",
            `${settings.fontSize}px`
        );


    fontSizeLabel.textContent =
        `${settings.fontSize}px`;

}



/* ==========================================
   CREATE NOTE
========================================== */

function createNewNote() {

    flushCurrentNote();


    const now =
        Date.now();


    const note = {

        id:
            generateId(),

        title:
            "",

        content:
            "",

        type:
            "note",

        tasks:
            [],

        tags:
            [],

        isFavorite:
            false,

        isPinned:
            false,

        isArchived:
            false,

        isTrashed:
            false,

        deletedAt:
            null,

        color:
            "default",

        createdAt:
            now,

        updatedAt:
            now

    };


    notes.unshift(note);


    currentView =
        "all";


    selectedNoteId =
        note.id;


    saveNotes();

    render();

    openEditorOnMobile();


    requestAnimationFrame(
        () => {

            noteTitle.focus();

        }
    );

}



/* ==========================================
   FILTER NOTES
========================================== */

function getVisibleNotes() {

    let filtered =
        notes.filter(
            note => {

                if (
                    currentView ===
                    "favorites"
                ) {

                    return (
                        note.isFavorite &&
                        !note.isArchived &&
                        !note.isTrashed
                    );

                }


                if (
                    currentView ===
                    "archive"
                ) {

                    return (
                        note.isArchived &&
                        !note.isTrashed
                    );

                }


                if (
                    currentView ===
                    "trash"
                ) {

                    return (
                        note.isTrashed
                    );

                }


                return (
                    !note.isArchived &&
                    !note.isTrashed
                );

            }
        );



    const query =
        searchInput.value
            .trim()
            .toLowerCase();



    if (query) {

        filtered =
            filtered.filter(
                note => {

                    const tasks =
                        note.tasks
                            .map(
                                task =>
                                    task.text
                            )
                            .join(" ")
                            .toLowerCase();


                    return (

                        note.title
                            .toLowerCase()
                            .includes(query)

                        ||

                        note.content
                            .toLowerCase()
                            .includes(query)

                        ||

                        note.tags
                            .join(" ")
                            .toLowerCase()
                            .includes(query)

                        ||

                        tasks.includes(
                            query
                        )

                    );

                }
            );

    }



    filtered.sort(
        (a, b) => {

            if (
                currentView !==
                "trash"
            ) {

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


            switch (
                settings.sort
            ) {

                case "created":

                    return (
                        b.createdAt -
                        a.createdAt
                    );


                case "oldest":

                    return (
                        a.updatedAt -
                        b.updatedAt
                    );


                case "title":

                    return (
                        (
                            a.title ||
                            "Untitled"
                        )
                        .localeCompare(
                            b.title ||
                            "Untitled"
                        )
                    );


                default:

                    return (
                        b.updatedAt -
                        a.updatedAt
                    );

            }

        }
    );


    return filtered;

}



/* ==========================================
   RENDER
========================================== */

function render() {

    updateCounts();

    updateNavigation();

    renderNotesList();

    renderEditor();

}



/* ==========================================
   NOTE LIST
========================================== */

function getNotePreview(note) {

    if (
        note.type ===
        "todo"
    ) {

        if (
            note.tasks.length ===
            0
        ) {

            return "Empty to-do list";

        }


        const completed =
            note.tasks.filter(
                task =>
                    task.done
            ).length;


        return (
            `${completed}/${note.tasks.length} completed - ` +
            note.tasks
                .map(
                    task =>
                        task.text
                )
                .join(", ")
        );

    }


    return (
        note.content.trim() ||
        "No additional text"
    );

}



function renderNotesList() {

    const visibleNotes =
        getVisibleNotes();


    notesList.innerHTML =
        "";


    visibleCount.textContent =
        pluralize(
            visibleNotes.length,
            "note"
        );


    if (
        visibleNotes.length ===
        0
    ) {

        emptyState
            .classList
            .remove(
                "hidden"
            );

        configureEmptyState();

        return;

    }


    emptyState
        .classList
        .add(
            "hidden"
        );



    visibleNotes.forEach(
        note => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "note-card";


            if (
                note.id ===
                selectedNoteId
            ) {

                card.classList.add(
                    "active"
                );

            }



            const top =
                document.createElement(
                    "div"
                );

            top.className =
                "note-card-top";



            const title =
                document.createElement(
                    "div"
                );

            title.className =
                "note-card-title";


            title.textContent =
                (
                    note.type ===
                    "todo"
                        ? "☑ "
                        : ""
                ) +
                (
                    note.title.trim() ||
                    "Untitled Note"
                );



            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "note-card-icons";



            const pin =
                document.createElement(
                    "button"
                );

            pin.className =
                "note-card-action";


            if (
                note.isPinned
            ) {

                pin.classList.add(
                    "active"
                );

            }


            pin.textContent =
                "♧";


            pin.onclick =
                event => {

                    event.stopPropagation();

                    note.isPinned =
                        !note.isPinned;

                    note.updatedAt =
                        Date.now();

                    saveNotes();

                    render();

                };



            const favorite =
                document.createElement(
                    "button"
                );

            favorite.className =
                "note-card-action favorite";


            if (
                note.isFavorite
            ) {

                favorite.classList.add(
                    "active"
                );

            }


            favorite.textContent =
                note.isFavorite
                    ? "★"
                    : "☆";


            favorite.onclick =
                event => {

                    event.stopPropagation();

                    note.isFavorite =
                        !note.isFavorite;

                    note.updatedAt =
                        Date.now();

                    saveNotes();

                    render();

                };



            actions.append(
                pin,
                favorite
            );


            top.append(
                title,
                actions
            );



            const preview =
                document.createElement(
                    "div"
                );

            preview.className =
                "note-card-preview";

            preview.textContent =
                getNotePreview(
                    note
                );



            const meta =
                document.createElement(
                    "div"
                );

            meta.className =
                "note-card-meta";



            const tags =
                document.createElement(
                    "div"
                );

            tags.className =
                "note-card-tags";



            note.tags
                .slice(0, 2)
                .forEach(
                    tagText => {

                        const tag =
                            document
                                .createElement(
                                    "span"
                                );


                        tag.className =
                            "note-tag";


                        tag.textContent =
                            `#${tagText}`;


                        tags.appendChild(
                            tag
                        );

                    }
                );



            const date =
                document.createElement(
                    "span"
                );

            date.textContent =
                formatShortDate(
                    note.updatedAt
                );


            meta.append(
                tags,
                date
            );


            card.append(
                top,
                preview,
                meta
            );


            card.onclick =
                () => {

                    selectNote(
                        note.id
                    );

                };


            notesList.appendChild(
                card
            );

        }
    );

}



/* ==========================================
   EMPTY STATE
========================================== */

function configureEmptyState() {

    if (
        searchInput.value.trim()
    ) {

        emptyTitle.textContent =
            "No matching notes";

        emptyDescription.textContent =
            "Try another search.";

        emptyNewNoteBtn
            .classList
            .add(
                "hidden"
            );

        return;

    }


    emptyNewNoteBtn
        .classList
        .remove(
            "hidden"
        );


    if (
        currentView ===
        "favorites"
    ) {

        emptyTitle.textContent =
            "No favorites";

        emptyDescription.textContent =
            "Favorite notes will appear here.";

    } else if (
        currentView ===
        "archive"
    ) {

        emptyTitle.textContent =
            "Archive is empty";

        emptyDescription.textContent =
            "Archived notes will appear here.";

    } else if (
        currentView ===
        "trash"
    ) {

        emptyTitle.textContent =
            "Trash is empty";

        emptyDescription.textContent =
            "Deleted notes will appear here.";

        emptyNewNoteBtn
            .classList
            .add(
                "hidden"
            );

    } else {

        emptyTitle.textContent =
            "No notes yet";

        emptyDescription.textContent =
            "Create a note to start writing.";

    }

}



/* ==========================================
   SELECT NOTE
========================================== */

function selectNote(id) {

    flushCurrentNote();


    selectedNoteId =
        id;


    render();

    openEditorOnMobile();

}



/* ==========================================
   EDITOR
========================================== */

function renderEditor() {

    const note =
        getSelectedNote();


    if (!note) {

        editorContainer
            .classList
            .add(
                "hidden"
            );


        noNoteSelected
            .classList
            .remove(
                "hidden"
            );


        return;

    }


    noNoteSelected
        .classList
        .add(
            "hidden"
        );


    editorContainer
        .classList
        .remove(
            "hidden"
        );



    noteTitle.value =
        note.title;


    noteContent.value =
        note.content;


    tagsInput.value =
        note.tags.join(", ");


    noteTypeSelect.value =
        note.type;


    colorSelect.value =
        note.color;



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


    favoriteBtn
        .classList
        .toggle(
            "favorite-active",
            note.isFavorite
        );


    pinBtn
        .classList
        .toggle(
            "active",
            note.isPinned
        );



    const disabled =
        note.isTrashed;


    noteTitle.disabled =
        disabled;

    noteContent.disabled =
        disabled;

    tagsInput.disabled =
        disabled;

    noteTypeSelect.disabled =
        disabled;

    colorSelect.disabled =
        disabled;

    todoInput.disabled =
        disabled;

    addTodoBtn.disabled =
        disabled;



    if (
        note.isTrashed
    ) {

        archiveBtn.textContent =
            "↶";

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
                ? "Unarchive"
                : "Archive";


        deleteBtn.title =
            "Move to Trash";

    }



    renderNoteType();

    updateStatistics();

}



/* ==========================================
   NOTE / TODO TYPE
========================================== */

function renderNoteType() {

    const note =
        getSelectedNote();


    if (!note) {
        return;
    }


    if (
        note.type ===
        "todo"
    ) {

        noteContent
            .classList
            .add(
                "hidden"
            );


        todoContainer
            .classList
            .remove(
                "hidden"
            );


        wordCount
            .classList
            .add(
                "hidden"
            );


        charCount
            .classList
            .add(
                "hidden"
            );


        lineCount
            .classList
            .add(
                "hidden"
            );


        taskCount
            .classList
            .remove(
                "hidden"
            );


        findBtn.disabled =
            true;


        closeFindPanel();

        renderTodoList();

    } else {

        noteContent
            .classList
            .remove(
                "hidden"
            );


        todoContainer
            .classList
            .add(
                "hidden"
            );


        wordCount
            .classList
            .remove(
                "hidden"
            );


        charCount
            .classList
            .remove(
                "hidden"
            );


        lineCount
            .classList
            .remove(
                "hidden"
            );


        taskCount
            .classList
            .add(
                "hidden"
            );


        findBtn.disabled =
            false;

    }

}



/* ==========================================
   SWITCH NOTE TYPE
========================================== */

function changeNoteType() {

    const note =
        getSelectedNote();


    if (
        !note ||
        note.isTrashed
    ) {

        return;

    }


    note.type =
        noteTypeSelect.value;


    note.updatedAt =
        Date.now();


    saveNotes();

    renderEditor();

    renderNotesList();


    if (
        note.type ===
        "todo"
    ) {

        todoInput.focus();

    } else {

        noteContent.focus();

    }

}



/* ==========================================
   TO-DO FUNCTIONS
========================================== */

function addTodo() {

    const note =
        getSelectedNote();


    if (
        !note ||
        note.type !==
        "todo" ||
        note.isTrashed
    ) {

        return;

    }


    const text =
        todoInput.value.trim();


    if (!text) {
        return;
    }


    note.tasks.push({

        id:
            generateId(),

        text,

        done:
            false

    });


    todoInput.value =
        "";


    note.updatedAt =
        Date.now();


    saveNotes();

    renderTodoList();

    renderNotesList();

    updateStatistics();


    updatedDate.textContent =
        `Updated ${formatDate(
            note.updatedAt
        )}`;

}



function toggleTodo(taskId) {

    const note =
        getSelectedNote();


    if (!note) {
        return;
    }


    const task =
        note.tasks.find(
            task =>
                task.id ===
                taskId
        );


    if (!task) {
        return;
    }


    task.done =
        !task.done;


    note.updatedAt =
        Date.now();


    saveNotes();

    renderTodoList();

    renderNotesList();

    updateStatistics();

}



function deleteTodo(taskId) {

    const note =
        getSelectedNote();


    if (!note) {
        return;
    }


    note.tasks =
        note.tasks.filter(
            task =>
                task.id !==
                taskId
        );


    note.updatedAt =
        Date.now();


    saveNotes();

    renderTodoList();

    renderNotesList();

    updateStatistics();

}



function clearCompletedTodos() {

    const note =
        getSelectedNote();


    if (!note) {
        return;
    }


    note.tasks =
        note.tasks.filter(
            task =>
                !task.done
        );


    note.updatedAt =
        Date.now();


    saveNotes();

    renderTodoList();

    renderNotesList();

    updateStatistics();

}



function renderTodoList() {

    const note =
        getSelectedNote();


    todoList.innerHTML =
        "";


    if (
        !note ||
        note.type !==
        "todo"
    ) {

        return;

    }



    if (
        note.tasks.length ===
        0
    ) {

        const message =
            document.createElement(
                "p"
            );


        message.textContent =
            "No tasks yet.";


        todoList.appendChild(
            message
        );

    }



    note.tasks.forEach(
        task => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "todo-item";


            if (
                task.done
            ) {

                item.classList.add(
                    "completed"
                );

            }



            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";


            checkbox.checked =
                task.done;


            checkbox.disabled =
                note.isTrashed;


            checkbox.addEventListener(
                "change",
                () => {

                    toggleTodo(
                        task.id
                    );

                }
            );



            const text =
                document.createElement(
                    "span"
                );


            text.className =
                "todo-item-text";


            text.textContent =
                task.text;



            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "todo-delete-btn";


            deleteButton.textContent =
                "Delete";


            deleteButton.disabled =
                note.isTrashed;


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteTodo(
                        task.id
                    );

                }
            );



            item.append(
                checkbox,
                text,
                deleteButton
            );


            todoList.appendChild(
                item
            );

        }
    );



    const completed =
        note.tasks.filter(
            task =>
                task.done
        ).length;


    clearCompletedBtn.disabled =
        (
            completed === 0 ||
            note.isTrashed
        );

}



/* ==========================================
   SAVE NORMAL NOTE
========================================== */

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


    clearTimeout(
        saveTimer
    );


    saveTimer =
        setTimeout(
            flushCurrentNote,
            400
        );

}



function flushCurrentNote() {

    clearTimeout(
        saveTimer
    );


    const note =
        getSelectedNote();


    if (
        !note ||
        note.isTrashed
    ) {

        return;

    }


    const title =
        noteTitle.value;


    const tags =
        normalizeTags(
            tagsInput.value
        );


    const content =
        noteContent.value;



    const changed =
        note.title !== title
        ||
        note.content !== content
        ||
        JSON.stringify(
            note.tags
        ) !==
        JSON.stringify(
            tags
        );



    if (changed) {

        note.title =
            title;


        note.content =
            content;


        note.tags =
            tags;


        note.updatedAt =
            Date.now();


        saveNotes();

    }


    saveStatus.textContent =
        "Saved";


    if (changed) {

        updatedDate.textContent =
            `Updated ${formatDate(
                note.updatedAt
            )}`;


        renderNotesList();

        updateCounts();

    }

}



/* ==========================================
   STATISTICS
========================================== */

function updateStatistics() {

    const note =
        getSelectedNote();


    if (!note) {
        return;
    }


    if (
        note.type ===
        "todo"
    ) {

        const completed =
            note.tasks.filter(
                task =>
                    task.done
            ).length;


        taskCount.textContent =
            `${completed}/${note.tasks.length} completed`;


        return;

    }


    const content =
        noteContent.value;


    const trimmed =
        content.trim();


    const words =
        trimmed
            ? trimmed
                .split(/\s+/)
                .length
            : 0;


    const characters =
        content.length;


    const lines =
        content
            ? content
                .split("\n")
                .length
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



/* ==========================================
   COUNTS
========================================== */

function updateCounts() {

    allCount.textContent =
        notes.filter(
            note =>
                !note.isArchived &&
                !note.isTrashed
        ).length;


    favoriteCount.textContent =
        notes.filter(
            note =>
                note.isFavorite &&
                !note.isArchived &&
                !note.isTrashed
        ).length;


    archiveCount.textContent =
        notes.filter(
            note =>
                note.isArchived &&
                !note.isTrashed
        ).length;


    trashCount.textContent =
        notes.filter(
            note =>
                note.isTrashed
        ).length;

}



/* ==========================================
   NAVIGATION
========================================== */

function updateNavigation() {

    $$(".nav-item")
        .forEach(
            button => {

                button.classList
                    .toggle(
                        "active",
                        button.dataset
                            .view ===
                            currentView
                    );

            }
        );


    const titles = {

        all:
            "All Notes",

        favorites:
            "Favorites",

        archive:
            "Archive",

        trash:
            "Trash"

    };


    viewTitle.textContent =
        titles[
            currentView
        ];

}



function changeView(view) {

    flushCurrentNote();


    currentView =
        view;


    const visible =
        getVisibleNotes();


    if (
        !visible.some(
            note =>
                note.id ===
                selectedNoteId
        )
    ) {

        selectedNoteId =
            null;

    }


    closeSidebar();

    render();

}



/* ==========================================
   FAVORITE / PIN
========================================== */

function toggleFavorite() {

    const note =
        getSelectedNote();


    if (!note) {
        return;
    }


    note.isFavorite =
        !note.isFavorite;


    note.updatedAt =
        Date.now();


    saveNotes();

    render();

}



function togglePin() {

    const note =
        getSelectedNote();


    if (!note) {
        return;
    }


    note.isPinned =
        !note.isPinned;


    note.updatedAt =
        Date.now();


    saveNotes();

    render();

}



/* ==========================================
   ARCHIVE
========================================== */

function archiveOrRestore() {

    const note =
        getSelectedNote();


    if (!note) {
        return;
    }



    if (
        note.isTrashed
    ) {

        note.isTrashed =
            false;


        note.isArchived =
            false;


        note.deletedAt =
            null;


        currentView =
            "all";

    } else {

        note.isArchived =
            !note.isArchived;

    }


    note.updatedAt =
        Date.now();


    saveNotes();


    selectedNoteId =
        null;


    render();

}



/* ==========================================
   DELETE
========================================== */

function deleteSelectedNote() {

    const note =
        getSelectedNote();


    if (!note) {
        return;
    }



    if (
        note.isTrashed
    ) {

        const confirmed =
            confirm(
                "Permanently delete this note?"
            );


        if (!confirmed) {
            return;
        }


        notes =
            notes.filter(
                item =>
                    item.id !==
                    note.id
            );

    } else {

        note.isTrashed =
            true;


        note.isArchived =
            false;


        note.deletedAt =
            Date.now();


        note.updatedAt =
            Date.now();

    }


    selectedNoteId =
        null;


    saveNotes();

    render();

    closeEditorOnMobile();

}



/* ==========================================
   DUPLICATE
========================================== */

function duplicateSelectedNote() {

    flushCurrentNote();


    const source =
        getSelectedNote();


    if (!source) {
        return;
    }


    const now =
        Date.now();


    const duplicate =
        JSON.parse(
            JSON.stringify(
                source
            )
        );


    duplicate.id =
        generateId();


    duplicate.title =
        `${
            source.title ||
            "Untitled Note"
        } Copy`;


    duplicate.tasks =
        source.tasks.map(
            task => ({

                ...task,

                id:
                    generateId()

            })
        );


    duplicate.isPinned =
        false;


    duplicate.isArchived =
        false;


    duplicate.isTrashed =
        false;


    duplicate.deletedAt =
        null;


    duplicate.createdAt =
        now;


    duplicate.updatedAt =
        now;


    notes.unshift(
        duplicate
    );


    selectedNoteId =
        duplicate.id;


    currentView =
        "all";


    saveNotes();

    render();

}



/* ==========================================
   COPY
========================================== */

async function copySelectedNote() {

    flushCurrentNote();


    const note =
        getSelectedNote();


    if (!note) {
        return;
    }


    let text =
        `${note.title || "Untitled Note"}\n\n`;


    if (
        note.type ===
        "todo"
    ) {

        text +=
            note.tasks
                .map(
                    task =>
                        `${task.done ? "[x]" : "[ ]"} ${task.text}`
                )
                .join("\n");

    } else {

        text +=
            note.content;

    }


    try {

        await navigator
            .clipboard
            .writeText(
                text
            );


        copyBtn.textContent =
            "✓";


        setTimeout(
            () => {

                copyBtn.textContent =
                    "⧉";

            },
            800
        );

    } catch {

        alert(
            "Could not copy note."
        );

    }

}



/* ==========================================
   EXPORT
========================================== */

function exportSelectedNote() {

    flushCurrentNote();


    const note =
        getSelectedNote();


    if (!note) {
        return;
    }


    let body =
        `${note.title || "Untitled Note"}\n\n`;


    if (
        note.type ===
        "todo"
    ) {

        body +=
            note.tasks
                .map(
                    task =>
                        `${task.done ? "[x]" : "[ ]"} ${task.text}`
                )
                .join("\n");

    } else {

        body +=
            note.content;

    }


    if (
        note.tags.length
    ) {

        body +=
            `\n\nTags: ${
                note.tags.join(", ")
            }`;

    }


    downloadFile(

        `${safeFilename(
            note.title ||
            "Untitled Note"
        )}.txt`,

        body,

        "text/plain"

    );

}



/* ==========================================
   BACKUP
========================================== */

function backupAllNotes() {

    flushCurrentNote();


    const backup = {

        app:
            "NoteSpace",

        version:
            2,

        exportedAt:
            new Date()
                .toISOString(),

        notes

    };


    downloadFile(

        "notespace-backup.json",

        JSON.stringify(
            backup,
            null,
            2
        ),

        "application/json"

    );

}



/* ==========================================
   IMPORT
========================================== */

function importFile(file) {

    if (!file) {
        return;
    }


    const reader =
        new FileReader();



    reader.onload =
        () => {

            const text =
                String(
                    reader.result ||
                    ""
                );


            if (
                file.name
                    .toLowerCase()
                    .endsWith(
                        ".json"
                    )
            ) {

                try {

                    const data =
                        JSON.parse(
                            text
                        );


                    const imported =
                        Array.isArray(
                            data
                        )
                            ? data
                            : data.notes;


                    if (
                        !Array.isArray(
                            imported
                        )
                    ) {

                        throw new Error(
                            "Invalid backup"
                        );

                    }


                    const normalized =
                        imported.map(
                            item => {

                                const note =
                                    normalizeNote(
                                        item
                                    );


                                note.id =
                                    generateId();


                                note.tasks =
                                    note.tasks.map(
                                        task => ({

                                            ...task,

                                            id:
                                                generateId()

                                        })
                                    );


                                return note;

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
                        normalized[0]
                            ?.id ||
                        selectedNoteId;


                    render();


                    alert(
                        `${normalized.length} note(s) imported.`
                    );

                } catch {

                    alert(
                        "Invalid JSON backup."
                    );

                }


                return;

            }



            const now =
                Date.now();


            const importedNote = {

                id:
                    generateId(),

                title:
                    file.name
                        .replace(
                            /\.txt$/i,
                            ""
                        ),

                content:
                    text,

                type:
                    "note",

                tasks:
                    [],

                tags:
                    [
                        "imported"
                    ],

                isFavorite:
                    false,

                isPinned:
                    false,

                isArchived:
                    false,

                isTrashed:
                    false,

                deletedAt:
                    null,

                color:
                    "default",

                createdAt:
                    now,

                updatedAt:
                    now

            };


            notes.unshift(
                importedNote
            );


            selectedNoteId =
                importedNote.id;


            currentView =
                "all";


            saveNotes();

            render();

        };


    reader.readAsText(
        file
    );

}



/* ==========================================
   FIND / REPLACE
========================================== */

function openFindPanel() {

    const note =
        getSelectedNote();


    if (
        !note ||
        note.type ===
        "todo"
    ) {

        return;

    }


    findPanel
        .classList
        .remove(
            "hidden"
        );


    findInput.focus();

}



function closeFindPanel() {

    findPanel
        .classList
        .add(
            "hidden"
        );


    findStatus.textContent =
        "";

}



function findNext() {

    const query =
        findInput.value;


    if (!query) {
        return;
    }


    const content =
        noteContent.value;


    let index =
        content
            .toLowerCase()
            .indexOf(
                query.toLowerCase(),
                noteContent.selectionEnd
            );


    if (
        index ===
        -1
    ) {

        index =
            content
                .toLowerCase()
                .indexOf(
                    query.toLowerCase()
                );

    }


    if (
        index ===
        -1
    ) {

        findStatus.textContent =
            "Not found";

        return;

    }


    noteContent.focus();


    noteContent.setSelectionRange(

        index,

        index +
        query.length

    );


    findStatus.textContent =
        "Found";

}



function replaceCurrent() {

    const query =
        findInput.value;


    if (!query) {
        return;
    }


    const selected =
        noteContent.value
            .substring(
                noteContent.selectionStart,
                noteContent.selectionEnd
            );


    if (
        selected
            .toLowerCase() ===
        query
            .toLowerCase()
    ) {

        noteContent.setRangeText(

            replaceInput.value,

            noteContent.selectionStart,

            noteContent.selectionEnd,

            "end"

        );


        queueSave();

        updateStatistics();

    }


    findNext();

}



function replaceAll() {

    const query =
        findInput.value;


    if (!query) {
        return;
    }


    const escaped =
        query.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const regex =
        new RegExp(
            escaped,
            "gi"
        );


    const matches =
        noteContent.value.match(
            regex
        );


    if (!matches) {

        findStatus.textContent =
            "No matches";

        return;

    }


    noteContent.value =
        noteContent.value.replace(

            regex,

            replaceInput.value

        );


    findStatus.textContent =
        `${matches.length} replaced`;


    queueSave();

    updateStatistics();

}



/* ==========================================
   FONT SIZE
========================================== */

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



/* ==========================================
   THEME
========================================== */

function toggleTheme() {

    settings.theme =
        settings.theme ===
        "dark"
            ? "light"
            : "dark";


    saveSettings();

    applySettings();

}



/* ==========================================
   FOCUS
========================================== */

function toggleFocusMode() {

    document.body
        .classList
        .toggle(
            "focus-mode"
        );

}



/* ==========================================
   MOBILE
========================================== */

function openSidebar() {

    sidebar
        .classList
        .add(
            "open"
        );


    mobileOverlay
        .classList
        .add(
            "active"
        );

}



function closeSidebar() {

    sidebar
        .classList
        .remove(
            "open"
        );


    mobileOverlay
        .classList
        .remove(
            "active"
        );

}



function openEditorOnMobile() {

    if (
        window.matchMedia(
            "(max-width: 650px)"
        ).matches
    ) {

        editorPanel
            .classList
            .add(
                "mobile-open"
            );

    }

}



function closeEditorOnMobile() {

    editorPanel
        .classList
        .remove(
            "mobile-open"
        );

}



/* ==========================================
   EVENTS
========================================== */

[
    newNoteBtn,
    emptyNewNoteBtn,
    welcomeNewNoteBtn
].forEach(
    button => {

        button.addEventListener(
            "click",
            createNewNote
        );

    }
);



$$(".nav-item")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    changeView(
                        button.dataset
                            .view
                    );

                }
            );

        }
    );



noteTitle.addEventListener(
    "input",
    queueSave
);


noteContent.addEventListener(
    "input",
    () => {

        queueSave();

        updateStatistics();

    }
);


tagsInput.addEventListener(
    "input",
    queueSave
);



noteTypeSelect.addEventListener(
    "change",
    changeNoteType
);



addTodoBtn.addEventListener(
    "click",
    addTodo
);



todoInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            addTodo();

        }

    }
);



clearCompletedBtn
    .addEventListener(
        "click",
        clearCompletedTodos
    );



favoriteBtn
    .addEventListener(
        "click",
        toggleFavorite
    );



pinBtn
    .addEventListener(
        "click",
        togglePin
    );



colorSelect
    .addEventListener(
        "change",
        () => {

            const note =
                getSelectedNote();


            if (!note) {
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



archiveBtn
    .addEventListener(
        "click",
        archiveOrRestore
    );



deleteBtn
    .addEventListener(
        "click",
        deleteSelectedNote
    );



duplicateBtn
    .addEventListener(
        "click",
        duplicateSelectedNote
    );



copyBtn
    .addEventListener(
        "click",
        copySelectedNote
    );



exportNoteBtn
    .addEventListener(
        "click",
        exportSelectedNote
    );



printBtn
    .addEventListener(
        "click",
        () => {

            flushCurrentNote();

            window.print();

        }
    );



focusBtn
    .addEventListener(
        "click",
        toggleFocusMode
    );



searchInput
    .addEventListener(
        "input",
        () => {

            clearSearchBtn
                .classList
                .toggle(
                    "hidden",
                    !searchInput.value
                );


            renderNotesList();

        }
    );



clearSearchBtn
    .addEventListener(
        "click",
        () => {

            searchInput.value =
                "";


            clearSearchBtn
                .classList
                .add(
                    "hidden"
                );


            renderNotesList();

        }
    );



sortSelect
    .addEventListener(
        "change",
        () => {

            settings.sort =
                sortSelect.value;


            saveSettings();

            renderNotesList();

        }
    );



themeToggle
    .addEventListener(
        "click",
        toggleTheme
    );



increaseFontBtn
    .addEventListener(
        "click",
        () =>
            changeFontSize(1)
    );



decreaseFontBtn
    .addEventListener(
        "click",
        () =>
            changeFontSize(-1)
    );



backupBtn
    .addEventListener(
        "click",
        backupAllNotes
    );



importBtn
    .addEventListener(
        "click",
        () => {

            fileInput.click();

        }
    );



fileInput
    .addEventListener(
        "change",
        () => {

            importFile(
                fileInput.files[0]
            );


            fileInput.value =
                "";

        }
    );



shortcutsBtn
    .addEventListener(
        "click",
        () => {

            shortcutsDialog
                .showModal();

        }
    );



closeShortcutsBtn
    .addEventListener(
        "click",
        () => {

            shortcutsDialog
                .close();

        }
    );



findBtn
    .addEventListener(
        "click",
        openFindPanel
    );



closeFindBtn
    .addEventListener(
        "click",
        closeFindPanel
    );



findNextBtn
    .addEventListener(
        "click",
        findNext
    );



replaceBtn
    .addEventListener(
        "click",
        replaceCurrent
    );



replaceAllBtn
    .addEventListener(
        "click",
        replaceAll
    );



mobileMenuBtn
    .addEventListener(
        "click",
        openSidebar
    );



mobileOverlay
    .addEventListener(
        "click",
        closeSidebar
    );



/* ==========================================
   KEYBOARD SHORTCUTS
========================================== */

document.addEventListener(
    "keydown",
    event => {

        const ctrl =
            event.ctrlKey ||
            event.metaKey;



        if (
            ctrl &&
            event.key
                .toLowerCase() ===
                "n"
        ) {

            event.preventDefault();

            createNewNote();

            return;

        }



        if (
            ctrl &&
            event.key
                .toLowerCase() ===
                "s"
        ) {

            event.preventDefault();

            flushCurrentNote();

            return;

        }



        if (
            ctrl &&
            event.key
                .toLowerCase() ===
                "k"
        ) {

            event.preventDefault();

            searchInput.focus();

            return;

        }



        if (
            ctrl &&
            !event.shiftKey &&
            event.key
                .toLowerCase() ===
                "f"
        ) {

            const note =
                getSelectedNote();


            if (
                note &&
                note.type ===
                "note"
            ) {

                event.preventDefault();

                openFindPanel();

            }

            return;

        }



        if (
            ctrl &&
            event.shiftKey &&
            event.key
                .toLowerCase() ===
                "f"
        ) {

            event.preventDefault();

            toggleFavorite();

            return;

        }



        if (
            ctrl &&
            event.key
                .toLowerCase() ===
                "e"
        ) {

            event.preventDefault();

            exportSelectedNote();

            return;

        }



        if (
            event.key ===
            "Escape"
        ) {

            closeFindPanel();


            if (
                document.body
                    .classList
                    .contains(
                        "focus-mode"
                    )
            ) {

                toggleFocusMode();

            }

        }

    }
);



/* ==========================================
   SAVE BEFORE LEAVING
========================================== */

window.addEventListener(
    "beforeunload",
    flushCurrentNote
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



/* ==========================================
   INITIALIZE
========================================== */

function initializeApp() {

    loadData();

    createWelcomeNote();

    applySettings();


    const firstNote =
        notes
            .filter(
                note =>
                    !note.isTrashed &&
                    !note.isArchived
            )
            .sort(
                (a, b) =>
                    b.updatedAt -
                    a.updatedAt
            )[0];


    if (firstNote) {

        selectedNoteId =
            firstNote.id;

    }


    render();

}



initializeApp();