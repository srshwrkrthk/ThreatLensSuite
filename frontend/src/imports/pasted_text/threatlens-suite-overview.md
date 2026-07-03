IMPORTANT:
Do NOT redesign or replace the existing UI.
Preserve the entire current design system, component hierarchy, animations, spacing, typography, colors, glassmorphism, gradients, sidebar, dashboard cards, charts, cursor effects, transitions, and responsiveness.

This is an existing production-quality cybersecurity dashboard.
I only want to EXTEND it while maintaining 100% visual consistency.

---------------------------------------------------------
PROJECT
---------------------------------------------------------

ThreatLens is now a cybersecurity suite, not just a Website Security Scanner.

The application should support THREE security tools:

1. Website Security Scanner
2. Password Security Analyzer
3. URL Phishing Analyzer

The current Website Scanner already exists.
Do NOT modify its workflow or layout except where necessary.

---------------------------------------------------------
HOME PAGE
---------------------------------------------------------

Replace the single Website Scanner hero with a professional tool selector.

At the top of the hero section create three premium glass tabs.

🌐 Website Scanner
🔒 Password Analyzer
🎣 URL Analyzer

Requirements:

• Rounded pill buttons
• Glassmorphic style
• Smooth hover animation
• Active tab glow
• Sliding active indicator
• Apple-like motion
• Preserve existing color palette

Switching tabs must animate smoothly using fade + slide transitions.

Do NOT reload the page.

---------------------------------------------------------
WEBSITE SCANNER
---------------------------------------------------------

Leave this almost exactly as it is.

Input:
Website URL

Button:
Analyze Website

Existing scanning animation stays unchanged.

Existing dashboard stays unchanged.

---------------------------------------------------------
PASSWORD ANALYZER
---------------------------------------------------------

When the Password Analyzer tab is selected:

Replace ONLY the hero input section.

Input:

Password

Use password field.

Include:

• Show / Hide password button
• Password strength preview while typing
• Animated strength bar
• Character counter

Button:

Analyze Password

When clicked:

Reuse the EXACT same scanning animation already used by Website Scanner.

Scanning steps become:

Checking password entropy...

Checking dictionary words...

Checking leaked password patterns...

Checking keyboard sequences...

Checking repeated characters...

Generating security recommendations...

Do NOT create a new scanning screen.
Reuse the existing one.

---------------------------------------------------------
PASSWORD RESULTS
---------------------------------------------------------

Create a dashboard using the SAME design language as Website Results.

Replace website-specific widgets with password widgets.

Cards:

Overall Score

Strength Grade

Entropy

Estimated Crack Time

Character Diversity

Dictionary Match

Keyboard Pattern Detection

Repeated Characters

Sequential Characters

Leaked Password Check

Suggestions

Use animated circular score exactly like Website Scanner.

Use radar chart for:

Entropy

Length

Complexity

Uniqueness

Dictionary Resistance

Reuse donut chart.

Donut categories:

Strong Features

Weaknesses

Recommendations

Below that create Findings panel.

Severity colors:

Green

Yellow

Red

Cards should animate in sequentially.

---------------------------------------------------------
URL PHISHING ANALYZER
---------------------------------------------------------

When URL Analyzer tab is selected:

Hero input becomes URL.

Placeholder:

https://example.com

Button:

Analyze URL

Reuse existing scanning animation.

Scanning steps become:

Checking domain...

Checking redirects...

Checking SSL...

Checking suspicious keywords...

Checking TLD...

Checking homograph attacks...

Checking URL length...

Generating phishing score...

---------------------------------------------------------
URL RESULTS
---------------------------------------------------------

Reuse dashboard.

Replace website widgets with:

Overall Threat Score

Risk Level

SSL

Domain Age

Redirect Count

Suspicious Keywords

URL Length

IP Address Usage

WHOIS

Registrar

Homograph Detection

Final Recommendation

Reuse radar chart.

Reuse donut chart.

Reuse Findings cards.

---------------------------------------------------------
ANIMATIONS
---------------------------------------------------------

Do NOT remove any existing animations.

Add:

Smooth page transitions

Glass hover effects

Animated score counter

Animated progress ring

Cards stagger into view

Fade transitions

Spring motion

Loading pulse

Mouse glow remains

Background bubbles remain

Particles remain

Everything should feel like Apple + Linear + Arc Browser.

---------------------------------------------------------
TECHNICAL
---------------------------------------------------------

Do NOT remove any React components.

Do NOT rewrite architecture.

Only extend existing components.

Keep TypeScript.

Keep responsiveness.

Do NOT replace existing charts.

Reuse all reusable components wherever possible.

Do NOT break backend integration.

The backend already provides three endpoints:

POST /scan-website

POST /check-password

POST /analyze-url

The UI only needs to expose these three modes.

Maintain the same professional aesthetic throughout.