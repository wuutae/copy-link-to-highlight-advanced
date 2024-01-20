// Receive message from service_worker.js
chrome.runtime.onMessage.addListener(messageHandler);

const createTextFragment = (selection) => {
    const result = exports.generateFragment(selection);
    let url = `${location.origin}${location.pathname}${location.search}${
        location.hash ? location.hash : '#'
    }`;
    if (result.status === 0) {
        const fragment = result.fragment;
        const prefix = fragment.prefix ?
            `${encodeURIComponent(fragment.prefix)}-,` : '';
        const suffix = fragment.suffix ?
            `,-${encodeURIComponent(fragment.suffix)}` : '';
        const textStart = encodeURIComponent(fragment.textStart);
        const textEnd = fragment.textEnd ?
            `,${encodeURIComponent(fragment.textEnd)}` : '';
        url = `${url}:~:text=${prefix}${textStart}${textEnd}${suffix}`;
    }
    return url;
};

function copyTextToClipboard(text) {
    const copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    document.body.appendChild(copyFrom);
    copyFrom.select();  // Range is cleared
    document.execCommand('copy');
    copyFrom.blur();
    document.body.removeChild(copyFrom);
}

// show tooltip
function showTooltip(x, y, text) {
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = 2147483647;
    tooltip.id = "tooltip";
    tooltip.innerText = text;

    tooltip.style.alignItems = 'center';
    tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
    tooltip.style.color = 'white';
    tooltip.style.fontSize = '12px';
    tooltip.style.padding = '5px 10px';
    tooltip.style.borderRadius = '15px';
    tooltip.style.transition = 'opacity 0.3s ease';
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;

    document.body.appendChild(tooltip);
    // tooltip.style.left = `${x - tooltip.offsetWidth}px`;

    window.setTimeout(function () {
        tooltip.style.opacity = '0';
        window.setTimeout(function () {
            document.body.removeChild(tooltip);
        }, 300);
    }, 300);
}


async function messageHandler(request, sender, sendResponse) {
    // Handle "copy-format-" command
    const match = request.message.match(/copy-format-(\d+)/)
    if (match) {
        const selection = window.getSelection();
        const text = selection.toString()
        if (!text) return;

        const number = parseInt(match[1], 10);
        const linkToHighlight = createTextFragment(selection);
        let clipContent = `[${text}](${linkToHighlight})`;

        await chrome.storage.sync.get(["formats"]).then((result) => {
            if (result.formats) {
                const formatData = result.formats[number - 1];
                if (formatData) {
                    clipContent = formatData.replaceAll("{{text}}", text)
                        .replaceAll("{{link}}", linkToHighlight)
                        .replaceAll("{{\\n}}", "\n");
                }
            }
        });

        const range = selection.getRangeAt(0);
        copyTextToClipboard(clipContent);

        // Restore selection
        selection.removeAllRanges();
        selection.addRange(range);

        // Tooltip
        const rect = range.getBoundingClientRect();
        const x = rect.left + window.scrollX;
        const y = rect.bottom + window.scrollY;
        showTooltip(x, y, `Copied with format ${number}`);
    }
}
