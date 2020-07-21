class CopyFunc{
    constructor(){ }

    copy(toCopy, successCallback){
        // Copy room code to clipboard
        const fallback = (text) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
            } catch (err) {
                console.error('Error copying text');
            }

            document.body.removeChild(textArea);
        }

        if (!navigator.clipboard) {
            fallback(toCopy);
            return;
        }
        navigator.clipboard.writeText(toCopy).then(successCallback);
    }
}