// =========================================================
// STATE
// =========================================================

let messages = [];


// =========================================================
// ELEMENTS
// =========================================================

const input =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const chatContainer =
    document.getElementById("chatContainer");

const newChatBtn =
    document.getElementById("newChatBtn");


// =========================================================
// ENTER TO SEND
// SHIFT + ENTER = NEW LINE
// =========================================================

input.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// =========================================================
// AUTO RESIZE
// =========================================================

input.addEventListener(
    "input",
    function () {

        this.style.height = "auto";

        this.style.height =
            Math.min(
                this.scrollHeight,
                150
            ) + "px";

    }
);


// =========================================================
// SEND BUTTON
// =========================================================

sendButton.addEventListener(
    "click",
    sendMessage
);


// =========================================================
// SUGGESTIONS
// =========================================================

function attachSuggestionEvents() {

    document
        .querySelectorAll(".suggestion")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    input.value =
                        this.dataset.text;

                    input.focus();

                    input.dispatchEvent(
                        new Event("input")
                    );

                }
            );

        });

}


attachSuggestionEvents();


// =========================================================
// SEND MESSAGE
// =========================================================

async function sendMessage() {

    const text =
        input.value.trim();

    if (!text) {
        return;
    }


    // Hide welcome screen

    const welcome =
        document.getElementById("welcome");

    if (welcome) {
        welcome.remove();
    }


    // Save user message

    messages.push({

        role: "user",

        content: text

    });


    addMessage(
        "user",
        text
    );


    // Clear input

    input.value = "";

    input.style.height = "auto";


    // Disable button

    sendButton.disabled = true;


    // Show typing

    const typingId =
        addTyping();


    try {

        const response =
            await fetch(
                "/chat",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        messages: messages
                    })

                }
            );


        const data =
            await response.json();


        removeTyping(typingId);


        if (!response.ok) {

            addMessage(
                "assistant",
                "❌ " +
                (
                    data.error ||
                    "Something went wrong."
                )
            );

            return;
        }


        // Save assistant message

        messages.push({

            role: "assistant",

            content: data.response

        });


        addMessage(
            "assistant",
            data.response
        );

    }

    catch (error) {

        console.error(error);

        removeTyping(typingId);

        addMessage(
            "assistant",
            "❌ Unable to connect to Jagangpt server."
        );

    }

    finally {

        sendButton.disabled = false;

        input.focus();

    }

}


// =========================================================
// ADD MESSAGE
// =========================================================

function addMessage(role, text) {

    const message =
        document.createElement("div");


    message.className =
        "message " + role;


    const avatar =
        document.createElement("div");


    avatar.className =
        "message-avatar";


    avatar.textContent =
        role === "user"
            ? "You"
            : "✦";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    if (role === "assistant") {

        if (
            typeof marked !== "undefined"
        ) {

            content.innerHTML =
                marked.parse(text);

        } else {

            content.textContent =
                text;

        }

    } else {

        content.textContent =
            text;

    }


    message.appendChild(avatar);

    message.appendChild(content);


    chatContainer.appendChild(message);


    if (role === "assistant") {

        addCodeCopyButtons(content);

    }


    scrollToBottom();

}


// =========================================================
// CODE COPY
// =========================================================

function addCodeCopyButtons(container) {

    const blocks =
        container.querySelectorAll("pre");


    blocks.forEach(function (block) {

        const button =
            document.createElement("button");


        button.className =
            "copy-code";


        button.textContent =
            "Copy";


        button.addEventListener(
            "click",
            async function () {

                const code =
                    block.querySelector("code");


                if (!code) {
                    return;
                }


                try {

                    await navigator.clipboard.writeText(
                        code.innerText
                    );

                    button.textContent =
                        "Copied!";

                    setTimeout(
                        function () {

                            button.textContent =
                                "Copy";

                        },
                        1500
                    );

                }

                catch (error) {

                    console.error(error);

                }

            }
        );


        block.appendChild(button);

    });

}


// =========================================================
// TYPING
// =========================================================

function addTyping() {

    const id =
        "typing-" + Date.now();


    const message =
        document.createElement("div");


    message.id = id;

    message.className =
        "message assistant";


    message.innerHTML = `

        <div class="message-avatar">
            ✦
        </div>

        <div class="message-content">

            <div class="typing">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;


    chatContainer.appendChild(message);

    scrollToBottom();


    return id;

}


// =========================================================
// REMOVE TYPING
// =========================================================

function removeTyping(id) {

    const element =
        document.getElementById(id);


    if (element) {
        element.remove();
    }

}


// =========================================================
// NEW CHAT
// =========================================================

newChatBtn.addEventListener(
    "click",
    newChat
);


function newChat() {

    messages = [];


    chatContainer.innerHTML = `

        <div
            class="welcome"
            id="welcome"
        >

            <div class="welcome-logo">
                ✦
            </div>

            <h1>
                What can I help with?
            </h1>

            <p>
                Ask anything, build anything,
                learn anything.
            </p>

            <div class="suggestions">

                <button
                    class="suggestion"
                    data-text="Write a Python program for me"
                >
                    <span>💻</span>

                    <div>
                        <strong>Write some code</strong>
                        <small>Build and debug programs</small>
                    </div>
                </button>


                <button
                    class="suggestion"
                    data-text="Explain a topic to me in simple words"
                >
                    <span>🧠</span>

                    <div>
                        <strong>Explain something</strong>
                        <small>Learn difficult topics simply</small>
                    </div>
                </button>


                <button
                    class="suggestion"
                    data-text="Help me create a software project"
                >
                    <span>✨</span>

                    <div>
                        <strong>Create a project</strong>
                        <small>Turn ideas into projects</small>
                    </div>
                </button>


                <button
                    class="suggestion"
                    data-text="Teach me Python from basics"
                >
                    <span>📚</span>

                    <div>
                        <strong>Help me learn</strong>
                        <small>Learn step by step</small>
                    </div>
                </button>

            </div>

        </div>

    `;


    attachSuggestionEvents();


    input.value = "";

    input.style.height = "auto";

    input.focus();

}


// =========================================================
// SCROLL
// =========================================================

function scrollToBottom() {

    chatContainer.scrollTo({

        top: chatContainer.scrollHeight,

        behavior: "smooth"

    });

}