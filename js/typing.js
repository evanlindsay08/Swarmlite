// Clear any existing listeners
const oldTypingTitle = document.getElementById('typing-title');
if (oldTypingTitle) {
    const newTypingTitle = oldTypingTitle.cloneNode(false);
    oldTypingTitle.parentNode.replaceChild(newTypingTitle, oldTypingTitle);
}

document.addEventListener('DOMContentLoaded', function() {
    const typingTitle = document.getElementById('typing-title');
    if (typingTitle) {
        // Ensure we start fresh
        typingTitle.innerHTML = '';
        
        const text = ">_ SwarmLite";
        let i = 0;
        let isTyping = false;

        function typeWriter() {
            if (isTyping) return;
            isTyping = true;

            if (i < text.length) {
                typingTitle.innerHTML = text.slice(0, i + 1);
                i++;
                isTyping = false;
                setTimeout(typeWriter, 150);
            }
        }

        // Start typing after a small delay
        setTimeout(typeWriter, 500);
    }
}); 