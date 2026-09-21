"use strict";


/* =========================================================
   STORAGE
========================================================= */

const NOTES_KEY =
    "notespace.notes.v3";

const SETTINGS_KEY =
    "notespace.settings.v1";



/* =========================================================
   DOM HELPERS
========================================================= */

const $ =
    selector =>
        document.querySelector(
            selector
        );


const $$ =
    selector =>
        document.querySelectorAll(
            selector
        );



/* =========================================================
   ELEMENTS
========================================================= */

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

const newTodoBtn =
    $("#newTodoBtn");

const emptyNewNoteBtn =
    $("#emptyNewNoteBtn");

const emptyNewTodoBtn =
    $("#emptyNewTodoBtn");

const welcomeNewNoteBtn =
    $("#welcomeNewNoteBtn");

const welcomeNewTodoBtn =
    $("#welcomeNewTodoBtn");



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

const editorTypeBadge =
    $("#editorTypeBadge");



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

const todoProgressText =
    $("#todoProgressText");

const todoProgressBar =
    $("#todoProgressBar");

const remainingTasks =
    $("#remainingTasks");



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



const findBtn =
    $("#findBtn");

const copyBtn =
    $("#copyBtn");

const duplicateBtn =
    $("#duplicateBtn");

const exportNoteBtn =
    $("#exportNoteBtn");

const printBtn =
    $("#printBtn");

const archiveBtn =
    $("#archiveBtn");

const deleteBtn =
    $("#deleteBtn");

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

const taskCount =
    $("#taskCount");



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



const importBtn =
    $("#importBtn");

const backupBtn =
    $("#backupBtn");

const fileInput =
    $("#fileInput");



const shortcutsBtn =
    $("#shortcutsBtn");

const shortcutsDialog =
    $("#shortcutsDialog");

const closeShortcutsBtn =
    $("#closeShortcutsBtn");



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

const mobileBackBtn =
    $("#mobileBackBtn");

const mobileOverlay =
    $("#mobileOverlay");



/* =========================================================
   STATE
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
   HELPERS
========================================================= */

function generateId() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID ===
        "function"
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .slice(2)
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
    amount,
    singular,
    plural = `${singular}s`
) {

    return (
        `${amount} ${
            amount === 1
                ? singular
                : plural
        }`
    );

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


    const now =
        new Date();


    const sameDay =

        date.getFullYear() ===
        now.getFullYear()

        &&

        date.getMonth() ===
        now.getMonth()

        &&

        date.getDate() ===
        now.getDate();


    if (sameDay) {

        return new Intl
            .DateTimeFormat(
                undefined,
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            )
            .format(date);

    }


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



function safeFilename(name) {

    return (
        name
            .trim()
            .replace(
                /[<>:"/\\|?*]/g,
                "-"
            )
            .replace(
                /\s+/g,
                " "
            )
            .slice(0, 80)
        ||
        "Untitled"
    );

}



function downloadFile(
    filename,
    content,
    mime
) {

    const blob =
        new Blob(
            [content],
            {
                type: mime
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


    link.href =
        url;

    link.download =
        filename;


    document.body
        .appendChild(
            link
        );


    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );

}



/* =========================================================
   DATA NORMALIZATION
========================================================= */

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
                ?
                note.tasks.map(
                    task => ({

                        id:
                            typeof task.id ===
                            "string"
                                ? task.id
                                : generateId(),

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
                :
                [],

        tags:
            Array.isArray(
                note.tags
            )
                ?
                note.tags
                    .filter(
                        tag =>
                            typeof tag ===
                            "string"
                    )
                    .slice(0, 15)
                :
                [],

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
                ?
                note.color
                :
                "default",

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

    /*
        Try current version first.
        Then migrate older versions.
    */

    let raw =
        localStorage.getItem(
            NOTES_KEY
        );


    if (!raw) {

        raw =
            localStorage.getItem(
                "notespace.notes.v2"
            );

    }


    if (!raw) {

        raw =
            localStorage.getItem(
                "notespace.notes.v1"
            );

    }


    try {

        const parsed =
            JSON.parse(raw);


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


        if (
            storedSettings &&
            typeof storedSettings ===
            "object"
        ) {

            settings = {

                ...settings,

                ...storedSettings

            };

        }

    } catch {

        // Keep default settings.

    }


    saveNotes();

}



/* =========================================================
   INITIAL NOTE
========================================================= */

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
`Welcome to your notes and task workspace.

Use “New Note” when you want to write text.

Use “New To-Do” when you want to create a checklist.

Everything is saved automatically on this device.`,

        type:
            "note",

        tasks:
            [],

        tags:
            [
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
            "purple",

        createdAt:
            now,

        updatedAt:
            now

    });


    saveNotes();

}



/* =========================================================
   SETTINGS
========================================================= */

function applySettings() {

    document
        .documentElement
        .dataset
        .theme =
            settings.theme;


    themeIcon.textContent =
        settings.theme === "dark"
            ? "☀"
            : "☾";


    themeText.textContent =
        settings.theme === "dark"
            ? "Light mode"
            : "Dark mode";


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



/* =========================================================
   CREATE ITEMS
========================================================= */

function createNewItem(
    type = "note"
) {

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
            type === "todo"
                ? "todo"
                : "note",

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


    notes.unshift(
        note
    );


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



/* =========================================================
   FILTERING
========================================================= */

function getVisibleNotes() {

    let filtered =
        notes.filter(
            note => {

                switch (
                    currentView
                ) {

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

                        return (
                            note.isTrashed
                        );


                    default:

                        return (
                            !note.isArchived &&
                            !note.isTrashed
                        );

                }

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


                case "title":

                    return (
                        (
                            a.title ||
                            "Untitled"
                        )
                            .localeCompare(
                                b.title ||
                                "Untitled",
                                undefined,
                                {
                                    sensitivity:
                                        "base"
                                }
                            )
                    );


                case "oldest":

                    return (
                        a.updatedAt -
                        b.updatedAt
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



/* =========================================================
   MAIN RENDER
========================================================= */

function render() {

    updateCounts();

    updateNavigation();

    renderNotesList();

    renderEditor();

}



/* =========================================================
   NOTE LIST
========================================================= */

function renderNotesList() {

    const visible =
        getVisibleNotes();


    notesList.innerHTML =
        "";


    visibleCount.textContent =
        pluralize(
            visible.length,
            "item"
        );



    if (
        visible.length ===
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



    visible.forEach(
        note => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "note-card";


            card.dataset.color =
                note.color;


            if (
                note.id ===
                selectedNoteId
            ) {

                card.classList.add(
                    "active"
                );

            }



            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "note-card-header";



            const titleGroup =
                document.createElement(
                    "div"
                );


            titleGroup.className =
                "note-card-title-group";



            const typeBadge =
                document.createElement(
                    "span"
                );


            typeBadge.className =
                "note-type-badge";


            if (
                note.type ===
                "todo"
            ) {

                typeBadge.classList.add(
                    "todo"
                );


                typeBadge.textContent =
                    "TO-DO";

            } else {

                typeBadge.textContent =
                    "NOTE";

            }



            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "note-card-title";


            title.textContent =
                note.title.trim() ||
                (
                    note.type ===
                    "todo"
                        ? "Untitled To-Do"
                        : "Untitled Note"
                );


            titleGroup.append(
                typeBadge,
                title
            );



            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "note-card-actions";



            const pin =
                document.createElement(
                    "button"
                );


            pin.className =
                "note-card-action pin";


            pin.textContent =
                "♧";


            pin.title =
                note.isPinned
                    ? "Unpin"
                    : "Pin";


            if (
                note.isPinned
            ) {

                pin.classList.add(
                    "active"
                );

            }


            pin.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    note.isPinned =
                        !note.isPinned;


                    note.updatedAt =
                        Date.now();


                    saveNotes();

                    render();

                }
            );



            const favorite =
                document.createElement(
                    "button"
                );


            favorite.className =
                "note-card-action favorite";


            favorite.textContent =
                note.isFavorite
                    ? "★"
                    : "☆";


            favorite.title =
                note.isFavorite
                    ? "Remove favorite"
                    : "Favorite";


            if (
                note.isFavorite
            ) {

                favorite.classList.add(
                    "active"
                );

            }


            favorite.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    note.isFavorite =
                        !note.isFavorite;


                    note.updatedAt =
                        Date.now();


                    saveNotes();

                    render();

                }
            );


            actions.append(
                pin,
                favorite
            );


            header.append(
                titleGroup,
                actions
            );



            const preview =
                document.createElement(
                    "div"
                );


            preview.className =
                "note-card-preview";


            if (
                note.type ===
                "todo"
            ) {

                preview.textContent =
                    note.tasks.length
                        ?
                        note.tasks
                            .slice(0, 3)
                            .map(
                                task =>
                                    task.text
                            )
                            .join(" • ")
                        :
                        "No tasks yet.";

            } else {

                preview.textContent =
                    note.content.trim() ||
                    "No additional text.";

            }



            card.append(
                header,
                preview
            );



            if (
                note.type ===
                "todo"
            ) {

                const completed =
                    note.tasks.filter(
                        task =>
                            task.done
                    ).length;


                const total =
                    note.tasks.length;


                const percent =
                    total
                        ?
                        Math.round(
                            completed /
                            total *
                            100
                        )
                        :
                        0;


                const progress =
                    document.createElement(
                        "div"
                    );


                progress.className =
                    "note-mini-progress";


                progress.innerHTML =
                    `
                    <div class="note-mini-progress-row">
                        <span>${completed}/${total} completed</span>
                        <span>${percent}%</span>
                    </div>

                    <div class="mini-progress-track">
                        <div
                            class="mini-progress-bar"
                            style="width:${percent}%"
                        ></div>
                    </div>
                    `;


                card.appendChild(
                    progress
                );

            }



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
                            document.createElement(
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



            const time =
                document.createElement(
                    "span"
                );


            time.className =
                "note-card-time";


            time.textContent =
                formatShortDate(
                    currentView ===
                    "trash"
                        ?
                        note.deletedAt ||
                        note.updatedAt
                        :
                        note.updatedAt
                );


            meta.append(
                tags,
                time
            );


            card.appendChild(
                meta
            );


            card.addEventListener(
                "click",
                () => {

                    selectNote(
                        note.id
                    );

                }
            );


            notesList.appendChild(
                card
            );

        }
    );

}



/* =========================================================
   EMPTY STATE
========================================================= */

function configureEmptyState() {

    const searching =
        Boolean(
            searchInput.value.trim()
        );


    if (searching) {

        emptyTitle.textContent =
            "No results found";


        emptyDescription.textContent =
            "Try searching with a different word or tag.";


        emptyNewNoteBtn
            .classList
            .add(
                "hidden"
            );


        emptyNewTodoBtn
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


    emptyNewTodoBtn
        .classList
        .remove(
            "hidden"
        );



    switch (
        currentView
    ) {

        case "favorites":

            emptyTitle.textContent =
                "No favorites";


            emptyDescription.textContent =
                "Mark an important note or to-do as a favorite.";

            break;


        case "archive":

            emptyTitle.textContent =
                "Archive is empty";


            emptyDescription.textContent =
                "Items you archive will appear here.";

            break;


        case "trash":

            emptyTitle.textContent =
                "Trash is empty";


            emptyDescription.textContent =
                "Deleted items will appear here.";


            emptyNewNoteBtn
                .classList
                .add(
                    "hidden"
                );


            emptyNewTodoBtn
                .classList
                .add(
                    "hidden"
                );

            break;


        default:

            emptyTitle.textContent =
                "Your workspace is empty";


            emptyDescription.textContent =
                "Create a note for writing or a to-do list for tasks.";

    }

}



/* =========================================================
   SELECT NOTE
========================================================= */

function selectNote(id) {

    flushCurrentNote();


    selectedNoteId =
        id;


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
            "Restore";


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



/* =========================================================
   NOTE TYPE
========================================================= */

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

        editorTypeBadge.textContent =
            "TO-DO LIST";


        editorTypeBadge
            .classList
            .add(
                "todo"
            );


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

        editorTypeBadge.textContent =
            "NOTE";


        editorTypeBadge
            .classList
            .remove(
                "todo"
            );


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



/* =========================================================
   CHANGE NOTE TYPE
========================================================= */

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



/* =========================================================
   TO-DO
========================================================= */

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

    updateUpdatedDate();

}



function toggleTodo(taskId) {

    const note =
        getSelectedNote();


    if (!note) {

        return;

    }


    const task =
        note.tasks.find(
            item =>
                item.id ===
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

    updateUpdatedDate();

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

    updateUpdatedDate();

}



function clearCompletedTodos() {

    const note =
        getSelectedNote();


    if (!note) {

        return;

    }


    const hasCompleted =
        note.tasks.some(
            task =>
                task.done
        );


    if (!hasCompleted) {

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

    updateUpdatedDate();

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



    const completed =
        note.tasks.filter(
            task =>
                task.done
        ).length;


    const total =
        note.tasks.length;


    const remaining =
        total -
        completed;


    const percent =
        total
            ?
            Math.round(
                completed /
                total *
                100
            )
            :
            0;



    todoProgressText.textContent =
        `${completed} of ${total} completed`;


    todoProgressBar.style.width =
        `${percent}%`;


    remainingTasks.textContent =

        total === 0
            ?
            "No tasks yet"
            :
            remaining === 0
                ?
                "Everything completed"
                :
                `${pluralize(
                    remaining,
                    "task"
                )} remaining`;



    if (
        total === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "todo-empty";


        empty.textContent =
            "No tasks yet. Add your first task above.";


        todoList.appendChild(
            empty
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


            checkbox.className =
                "todo-check";


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
                "×";


            deleteButton.title =
                "Delete task";


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


    clearCompletedBtn.disabled =
        (
            completed === 0 ||
            note.isTrashed
        );

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


    saveStatus
        .classList
        .add(
            "saving"
        );


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



    const newTitle =
        noteTitle.value;


    const newContent =
        noteContent.value;


    const newTags =
        normalizeTags(
            tagsInput.value
        );



    const changed =

        note.title !==
        newTitle

        ||

        note.content !==
        newContent

        ||

        JSON.stringify(
            note.tags
        ) !==
        JSON.stringify(
            newTags
        );



    if (changed) {

        note.title =
            newTitle;


        note.content =
            newContent;


        note.tags =
            newTags;


        note.updatedAt =
            Date.now();


        saveNotes();

        renderNotesList();

        updateCounts();

        updateUpdatedDate();

    }


    saveStatus.textContent =
        "Saved";


    saveStatus
        .classList
        .remove(
            "saving"
        );

}



/* =========================================================
   STATS
========================================================= */

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
            ?
            trimmed
                .split(/\s+/)
                .filter(Boolean)
                .length
            :
            0;


    const characters =
        content.length;


    const lines =
        content.length
            ?
            content
                .split("\n")
                .length
            :
            1;



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



function updateUpdatedDate() {

    const note =
        getSelectedNote();


    if (!note) {

        return;

    }


    updatedDate.textContent =
        `Updated ${formatDate(
            note.updatedAt
        )}`;

}



/* =========================================================
   COUNTERS
========================================================= */

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



/* =========================================================
   NAVIGATION
========================================================= */

function updateNavigation() {

    $$(".nav-item")
        .forEach(
            button => {

                button.classList
                    .toggle(
                        "active",
                        button.dataset.view ===
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


    if (
        selectedNoteId
    ) {

        const stillVisible =
            getVisibleNotes()
                .some(
                    note =>
                        note.id ===
                        selectedNoteId
                );


        if (!stillVisible) {

            selectedNoteId =
                null;

        }

    }


    closeSidebar();

    render();

}



/* =========================================================
   FAVORITE / PIN
========================================================= */

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


        note.updatedAt =
            Date.now();


        currentView =
            "all";


        saveNotes();

        render();

        return;

    }



    note.isArchived =
        !note.isArchived;


    note.updatedAt =
        Date.now();


    selectedNoteId =
        null;


    saveNotes();

    render();

}



/* =========================================================
   DELETE
========================================================= */

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
                `Permanently delete "${
                    note.title ||
                    "Untitled"
                }"?`
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



/* =========================================================
   DUPLICATE
========================================================= */

function duplicateSelectedNote() {

    flushCurrentNote();


    const original =
        getSelectedNote();


    if (
        !original ||
        original.isTrashed
    ) {

        return;

    }


    const now =
        Date.now();


    const copy =
        normalizeNote(
            JSON.parse(
                JSON.stringify(
                    original
                )
            )
        );


    copy.id =
        generateId();


    copy.title =
        `${
            original.title ||
            "Untitled"
        } Copy`;


    copy.tasks =
        original.tasks.map(
            task => ({

                ...task,

                id:
                    generateId()

            })
        );


    copy.isPinned =
        false;


    copy.isArchived =
        false;


    copy.isTrashed =
        false;


    copy.deletedAt =
        null;


    copy.createdAt =
        now;


    copy.updatedAt =
        now;


    notes.unshift(
        copy
    );


    currentView =
        "all";


    selectedNoteId =
        copy.id;


    saveNotes();

    render();

}



/* =========================================================
   COPY
========================================================= */

function buildPlainText(
    note
) {

    let text =
        `${
            note.title ||
            (
                note.type ===
                "todo"
                    ?
                    "Untitled To-Do"
                    :
                    "Untitled Note"
            )
        }\n\n`;


    if (
        note.type ===
        "todo"
    ) {

        text +=
            note.tasks
                .map(
                    task =>
                        `${
                            task.done
                                ? "[x]"
                                : "[ ]"
                        } ${task.text}`
                )
                .join("\n");

    } else {

        text +=
            note.content;

    }


    if (
        note.tags.length
    ) {

        text +=
            `\n\nTags: ${
                note.tags.join(", ")
            }`;

    }


    return text;

}



async function copySelectedNote() {

    flushCurrentNote();


    const note =
        getSelectedNote();


    if (!note) {

        return;

    }


    const text =
        buildPlainText(
            note
        );


    try {

        await navigator.clipboard
            .writeText(
                text
            );


        const original =
            copyBtn.textContent;


        copyBtn.textContent =
            "✓";


        setTimeout(
            () => {

                copyBtn.textContent =
                    original;

            },
            800
        );

    } catch {

        alert(
            "Unable to copy this item."
        );

    }

}



/* =========================================================
   EXPORT
========================================================= */

function exportSelectedNote() {

    flushCurrentNote();


    const note =
        getSelectedNote();


    if (!note) {

        return;

    }


    downloadFile(

        `${
            safeFilename(
                note.title ||
                (
                    note.type ===
                    "todo"
                        ?
                        "Untitled To-Do"
                        :
                        "Untitled Note"
                )
            )
        }.txt`,

        buildPlainText(
            note
        ),

        "text/plain;charset=utf-8"

    );

}



/* =========================================================
   BACKUP
========================================================= */

function backupAllNotes() {

    flushCurrentNote();


    const backup = {

        application:
            "NoteSpace",

        version:
            3,

        exportedAt:
            new Date()
                .toISOString(),

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

                    const parsed =
                        JSON.parse(
                            text
                        );


                    const imported =
                        Array.isArray(
                            parsed
                        )
                            ?
                            parsed
                            :
                            parsed.notes;


                    if (
                        !Array.isArray(
                            imported
                        )
                    ) {

                        throw new Error(
                            "Invalid backup."
                        );

                    }


                    const normalized =
                        imported.map(
                            note => {

                                const item =
                                    normalizeNote(
                                        note
                                    );


                                item.id =
                                    generateId();


                                item.tasks =
                                    item.tasks.map(
                                        task => ({

                                            ...task,

                                            id:
                                                generateId()

                                        })
                                    );


                                return item;

                            }
                        );


                    notes = [

                        ...normalized,

                        ...notes

                    ];


                    currentView =
                        "all";


                    selectedNoteId =
                        normalized[0]
                            ?.id ||
                        selectedNoteId;


                    saveNotes();

                    render();


                    alert(
                        `${normalized.length} item(s) imported successfully.`
                    );

                } catch {

                    alert(
                        "This is not a valid NoteSpace backup."
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


            currentView =
                "all";


            selectedNoteId =
                importedNote.id;


            saveNotes();

            render();

        };


    reader.readAsText(
        file
    );

}



/* =========================================================
   FIND / REPLACE
========================================================= */

function openFindPanel() {

    const note =
        getSelectedNote();


    if (
        !note ||
        note.type !==
        "note"
    ) {

        return;

    }


    findPanel
        .classList
        .remove(
            "hidden"
        );


    findInput.focus();

    findInput.select();

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

        findStatus.textContent =
            "Enter text";

        return;

    }


    const content =
        noteContent.value;


    const source =
        content.toLowerCase();


    const needle =
        query.toLowerCase();


    let index =
        source.indexOf(
            needle,
            noteContent.selectionEnd
        );


    if (
        index === -1
    ) {

        index =
            source.indexOf(
                needle
            );

    }


    if (
        index === -1
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
        selected.toLowerCase() ===
        query.toLowerCase()
    ) {

        noteContent
            .setRangeText(

                replaceInput.value,

                noteContent.selectionStart,

                noteContent.selectionEnd,

                "end"

            );


        queueSave();

        updateStatistics();

    } else {

        findNext();

    }

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
        noteContent.value
            .match(
                regex
            );


    if (!matches) {

        findStatus.textContent =
            "No matches";

        return;

    }


    noteContent.value =
        noteContent.value
            .replace(

                regex,

                replaceInput.value

            );


    findStatus.textContent =
        `${matches.length} replaced`;


    queueSave();

    updateStatistics();

}



/* =========================================================
   THEME / FONT / FOCUS
========================================================= */

function toggleTheme() {

    settings.theme =
        settings.theme ===
        "dark"
            ?
            "light"
            :
            "dark";


    saveSettings();

    applySettings();

}



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



function toggleFocusMode() {

    document.body
        .classList
        .toggle(
            "focus-mode"
        );


    focusBtn
        .classList
        .toggle(
            "active",
            document.body
                .classList
                .contains(
                    "focus-mode"
                )
        );

}



/* =========================================================
   MOBILE
========================================================= */

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
            "(max-width: 680px)"
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



/* =========================================================
   EVENTS
========================================================= */


/* CREATE */

newNoteBtn
    .addEventListener(
        "click",
        () =>
            createNewItem(
                "note"
            )
    );


newTodoBtn
    .addEventListener(
        "click",
        () =>
            createNewItem(
                "todo"
            )
    );


emptyNewNoteBtn
    .addEventListener(
        "click",
        () =>
            createNewItem(
                "note"
            )
    );


emptyNewTodoBtn
    .addEventListener(
        "click",
        () =>
            createNewItem(
                "todo"
            )
    );


welcomeNewNoteBtn
    .addEventListener(
        "click",
        () =>
            createNewItem(
                "note"
            )
    );


welcomeNewTodoBtn
    .addEventListener(
        "click",
        () =>
            createNewItem(
                "todo"
            )
    );



/* NAVIGATION */

$$(".nav-item")
    .forEach(
        button => {

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



/* EDITOR */

noteTitle
    .addEventListener(
        "input",
        queueSave
    );


noteContent
    .addEventListener(
        "input",
        () => {

            queueSave();

            updateStatistics();

        }
    );


tagsInput
    .addEventListener(
        "input",
        queueSave
    );


noteTypeSelect
    .addEventListener(
        "change",
        changeNoteType
    );



/* TODO */

addTodoBtn
    .addEventListener(
        "click",
        addTodo
    );


todoInput
    .addEventListener(
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



/* FAVORITE / PIN */

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



/* COLOR */

colorSelect
    .addEventListener(
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



/* ACTIONS */

copyBtn
    .addEventListener(
        "click",
        copySelectedNote
    );


duplicateBtn
    .addEventListener(
        "click",
        duplicateSelectedNote
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



/* SEARCH */

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


            searchInput.focus();

            renderNotesList();

        }
    );



/* SORT */

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



/* THEME */

themeToggle
    .addEventListener(
        "click",
        toggleTheme
    );



/* FONT */

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



/* IMPORT / BACKUP */

backupBtn
    .addEventListener(
        "click",
        backupAllNotes
    );


importBtn
    .addEventListener(
        "click",
        () =>
            fileInput.click()
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



/* FIND */

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


findInput
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                findNext();

            }

        }
    );



/* SHORTCUT DIALOG */

shortcutsBtn
    .addEventListener(
        "click",
        () =>
            shortcutsDialog
                .showModal()
    );


closeShortcutsBtn
    .addEventListener(
        "click",
        () =>
            shortcutsDialog
                .close()
    );


shortcutsDialog
    .addEventListener(
        "click",
        event => {

            if (
                event.target ===
                shortcutsDialog
            ) {

                shortcutsDialog
                    .close();

            }

        }
    );



/* MOBILE */

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


mobileBackBtn
    .addEventListener(
        "click",
        closeEditorOnMobile
    );



/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document
    .addEventListener(
        "keydown",
        event => {

            const control =
                event.ctrlKey ||
                event.metaKey;



            /* CTRL + SHIFT + N */

            if (
                control &&
                event.shiftKey &&
                event.key
                    .toLowerCase() ===
                    "n"
            ) {

                event.preventDefault();

                createNewItem(
                    "todo"
                );

                return;

            }



            /* CTRL + N */

            if (
                control &&
                !event.shiftKey &&
                event.key
                    .toLowerCase() ===
                    "n"
            ) {

                event.preventDefault();

                createNewItem(
                    "note"
                );

                return;

            }



            /* CTRL + S */

            if (
                control &&
                event.key
                    .toLowerCase() ===
                    "s"
            ) {

                event.preventDefault();

                flushCurrentNote();

                return;

            }



            /* CTRL + K */

            if (
                control &&
                event.key
                    .toLowerCase() ===
                    "k"
            ) {

                event.preventDefault();

                searchInput.focus();

                searchInput.select();

                return;

            }



            /* CTRL + F */

            if (
                control &&
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



            /* CTRL + SHIFT + F */

            if (
                control &&
                event.shiftKey &&
                event.key
                    .toLowerCase() ===
                    "f"
            ) {

                event.preventDefault();

                toggleFavorite();

                return;

            }



            /* ESC */

            if (
                event.key ===
                "Escape"
            ) {

                if (
                    !findPanel
                        .classList
                        .contains(
                            "hidden"
                        )
                ) {

                    closeFindPanel();

                    return;

                }


                if (
                    document.body
                        .classList
                        .contains(
                            "focus-mode"
                        )
                ) {

                    toggleFocusMode();

                    return;

                }


                closeEditorOnMobile();

            }

        }
    );



/* =========================================================
   SAFE SAVE
========================================================= */

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



/* =========================================================
   INITIALIZE
========================================================= */

function initializeApp() {

    loadData();

    createWelcomeNote();

    applySettings();


    const first =
        notes
            .filter(
                note =>
                    !note.isArchived &&
                    !note.isTrashed
            )
            .sort(
                (a, b) =>
                    b.updatedAt -
                    a.updatedAt
            )[0];


    if (first) {

        selectedNoteId =
            first.id;

    }


    render();

}


initializeApp();