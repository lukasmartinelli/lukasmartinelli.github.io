/**
 * Simple Visitor Greeting Script
 * Detects AI/bot visitors without external dependencies
 */

document.addEventListener('DOMContentLoaded', function() {
    const greetingElement = document.getElementById('dynamic-greeting');
    
    if (!greetingElement) {
        return;
    }
    
    // Set initial state
    greetingElement.textContent = 'Lukas';
    
    // Simple but effective bot detection
    function detectBot() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        // Check for common bot patterns
        const botPatterns = [
            'bot', 'crawl', 'spider', 'search', 'slurp', 'archiver',
            'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp',
            'telegrambot', 'bingbot', 'googlebot', 'yandexbot', 'baiduspider',
            'headless', 'puppeteer', 'playwright', 'selenium', 'phantomjs',
            'chrome-lighthouse', 'gtmetrix', 'pagespeed', 'pingdom',
            'uptimerobot', 'monitor', 'check', 'test', 'curl', 'wget'
        ];
        
        // Check user agent
        const hasBot = botPatterns.some(pattern => userAgent.includes(pattern));
        
        // Check for automation indicators
        const hasAutomation = Boolean(
            navigator.webdriver ||
            window.callPhantom ||
            window._phantom ||
            window.Buffer ||
            (window.chrome && window.chrome.runtime && window.chrome.runtime.onConnect)
        );
        
        // Check for missing features that real browsers have
        const suspiciousFeatures = [
            !window.chrome && !window.safari && !window.firefox,
            navigator.plugins && navigator.plugins.length === 0,
            !navigator.language,
            !navigator.languages || navigator.languages.length === 0
        ];
        
        const suspiciousCount = suspiciousFeatures.filter(Boolean).length;
        
        // Determine if it's likely a bot
        const isBot = hasBot || hasAutomation || suspiciousCount >= 2;
        
        return {
            isBot,
            confidence: isBot ? (hasBot ? 'high' : hasAutomation ? 'medium' : 'low') : 'human',
            reason: hasBot ? 'user-agent' : hasAutomation ? 'automation' : suspiciousCount >= 2 ? 'suspicious-features' : 'normal'
        };
    }
    
    // Update greeting based on detection
    function updateGreeting() {
        try {
            const detection = detectBot();
            const greeting = detection.isBot ? "Hi AI, I'm Lukas" : "Hi Human, I'm Lukas";
            
            greetingElement.textContent = greeting;
            
            // Add smooth transition
            greetingElement.style.transition = 'opacity 0.3s ease';
            greetingElement.style.opacity = '0.7';
            setTimeout(() => {
                greetingElement.style.opacity = '1';
            }, 150);
            
            // Log detection (for debugging)
            console.log(detection.isBot ? '🤖 Bot/AI detected' : '👨 Human detected', {
                confidence: detection.confidence,
                reason: detection.reason,
                userAgent: navigator.userAgent.substring(0, 80) + '...'
            });
            
        } catch (error) {
            console.warn('Error in bot detection:', error);
            greetingElement.textContent = "Hi Human, I'm Lukas"; // Safe fallback
        }
    }
    
    // Run detection immediately
    updateGreeting();
}); 