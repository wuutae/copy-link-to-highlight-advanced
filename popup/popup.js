const formatInputs =
    document.querySelectorAll("#format-input-container input[type=text]");

// Load format data from sync storage
chrome.storage.sync.get(["formats"]).then((result) => {
    const formats = result.formats || [];
    updateFormatInputs(formats);
    formats.length === 0 && initStorage()  // init storage
});

// Save input data to sync storage
const saveInputData = () => {
    const formats = [];
    formatInputs.forEach((input) => {
        formats.push(input.value);
    });
    chrome.storage.sync.set({ formats: formats }).then(() => {
        console.log("saved to sync storage");
    });
};

function updateFormatInputs(formats) {
    formats.forEach((format, index) => {
        formatInputs[index].value = format;
    });
}

function initStorage() {
    const initFormats = [
        "[{{text}}]({{link}})",
        "{{link}}",
        "selected text: {{text}}, link: {{link}}",
        "{{text}}{{\\n}}{{link}}",
    ];

    chrome.storage.sync.set({formats: initFormats}).then(() => {
        updateFormatInputs(initFormats);
        console.log("initialized sync storage");
    });
}

// Add event listener to save button
document.querySelector("#save").addEventListener("click", saveInputData);

// // Add event listener to init button
// document.querySelector("#init").addEventListener("click", () => {
//     chrome.storage.sync.clear().then(() => {
//         console.log('cleared sync storage');
//     });
// });
