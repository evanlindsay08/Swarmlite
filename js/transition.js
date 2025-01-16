document.addEventListener('DOMContentLoaded', function() {
    // Add transition class to body
    document.body.classList.add('fade-transition');

    // Handle all navigation clicks
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href], button[onclick*="location"]');
        if (!link) return;

        // Get target URL
        let targetUrl = link.href;
        if (!targetUrl && link.getAttribute('onclick')) {
            const onclickValue = link.getAttribute('onclick');
            const match = onclickValue.match(/window\.location\.href='([^']+)'/);
            if (match) targetUrl = match[1];
        }

        // Only handle internal navigation
        if (targetUrl && !targetUrl.startsWith('http')) {
            e.preventDefault();
            
            // Fade out
            document.body.classList.add('fade-out');

            // Navigate after fade
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 300);
        }
    });
}); 