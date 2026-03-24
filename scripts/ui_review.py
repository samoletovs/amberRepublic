"""
UI Review Script — Takes screenshots of every screen at desktop and mobile viewports.
Used as part of the deployment process to verify visual correctness.
"""
import os
import sys
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'test-screenshots')
BASE_URL = 'http://localhost:5173'

VIEWPORTS = {
    'desktop': {'width': 1440, 'height': 900},
    'mobile': {'width': 375, 'height': 812},
    'tablet': {'width': 768, 'height': 1024},
}

# Module-level list for collecting issues
issues_found = []

def take_screenshot(page, name, full_page=True):
    path = os.path.join(SCREENSHOTS_DIR, f'{name}.png')
    page.screenshot(path=path, full_page=full_page)
    print(f'  📸 {name}.png')

def review_title_screen(page, vp_name):
    """Screenshot the title screen."""
    page.goto(BASE_URL)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    take_screenshot(page, f'01-title-{vp_name}')

def review_game_screen(page, vp_name):
    """Click start, screenshot the game screen with events."""
    # Click start button
    page.click('text=Begin Your Decade in Power')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(800)
    
    # Full page screenshot
    take_screenshot(page, f'02-game-full-{vp_name}')
    
    # Screenshot just the header area
    header = page.locator('header').first
    if header.is_visible():
        header.screenshot(path=os.path.join(SCREENSHOTS_DIR, f'03-header-{vp_name}.png'))
        print(f'  📸 03-header-{vp_name}.png')

    # Mobile: toggle indicators panel
    if vp_name == 'mobile':
        toggle = page.locator('text=State of the Republic').first
        if toggle.is_visible():
            toggle.click()
            page.wait_for_timeout(300)
            take_screenshot(page, f'04-indicators-open-{vp_name}')
            toggle.click()
            page.wait_for_timeout(300)

    # Screenshot coalition bar area
    coalition = page.locator('text=Saeima').first
    if coalition.is_visible():
        coalition_card = coalition.locator('xpath=ancestor::div[contains(@class,"glass-card")]').first
        coalition_card.screenshot(path=os.path.join(SCREENSHOTS_DIR, f'05-coalition-{vp_name}.png'))
        print(f'  📸 05-coalition-{vp_name}.png')

    # Screenshot ratings bar
    ratings = page.locator('text=International Ratings').first
    if ratings.is_visible():
        ratings_card = ratings.locator('xpath=ancestor::div[contains(@class,"glass-card")]').first
        ratings_card.screenshot(path=os.path.join(SCREENSHOTS_DIR, f'06-ratings-{vp_name}.png'))
        print(f'  📸 06-ratings-{vp_name}.png')

    # Screenshot bottom bar
    bottom = page.locator('.fixed.bottom-0').first
    if bottom.is_visible():
        bottom.screenshot(path=os.path.join(SCREENSHOTS_DIR, f'07-bottom-bar-{vp_name}.png'))
        print(f'  📸 07-bottom-bar-{vp_name}.png')

def review_feedback_form(page, vp_name):
    """Open feedback and screenshot the form."""
    # Click feedback button
    feedback_btn = page.locator('text=💬').first
    if feedback_btn.is_visible():
        feedback_btn.click()
        page.wait_for_timeout(500)
        take_screenshot(page, f'08-feedback-form-{vp_name}')
        
        # Check if Cancel button is visible within the viewport (use JS for viewport-relative coords)
        btn_in_viewport = page.evaluate('''() => {
            const btn = document.querySelector('button');
            const buttons = [...document.querySelectorAll('button')];
            const cancelBtn = buttons.find(b => b.textContent?.trim() === 'Cancel');
            if (!cancelBtn) return { found: false };
            const rect = cancelBtn.getBoundingClientRect();
            return {
                found: true,
                bottom: rect.bottom,
                viewportHeight: window.innerHeight,
                outsideViewport: rect.bottom > window.innerHeight
            };
        }''')
        if btn_in_viewport.get('outsideViewport'):
            issues_found.append(
                f'[{vp_name}] Feedback form Cancel button below viewport '
                f'(bottom={btn_in_viewport["bottom"]:.0f}, viewport={btn_in_viewport["viewportHeight"]})'
            )
        
        # Close by dispatching click on backdrop (bypasses pointer interception)
        page.evaluate('document.querySelector(".fixed.inset-0.z-50")?.click()')
        page.wait_for_timeout(500)
        
        # Verify it actually closed
        if page.locator('.fixed.inset-0.z-50').count() > 0:
            # Fallback: press Escape  
            page.keyboard.press('Escape')
            page.wait_for_timeout(300)

def review_game_with_choices(page, vp_name):
    """Make choices and screenshot."""
    # Click first choice of first event
    choices = page.locator('.choice-card')
    if choices.count() > 0:
        choices.first.click()
        page.wait_for_timeout(300)
        take_screenshot(page, f'09-choice-selected-{vp_name}')

    # Select all remaining choices (pick first option for each event)
    # Each event card has choices; pick the first one in each
    event_cards = page.locator('.glass-card.fade-in')
    for i in range(event_cards.count()):
        card = event_cards.nth(i)
        card_choices = card.locator('.choice-card')
        if card_choices.count() > 0:
            card_choices.first.click()
            page.wait_for_timeout(100)

    page.wait_for_timeout(300)
    take_screenshot(page, f'10-all-choices-{vp_name}')

    # Click End Quarter (use force to bypass any overlay remnants)
    end_btn = page.locator('text=End Quarter')
    if end_btn.count() > 0:
        end_btn.scroll_into_view_if_needed()
        page.wait_for_timeout(200)
        end_btn.click(force=True)
        page.wait_for_timeout(800)
        take_screenshot(page, f'11-after-turn-{vp_name}')

def run_review():
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    
    # Clean old screenshots
    for f in os.listdir(SCREENSHOTS_DIR):
        if f.endswith('.png'):
            os.remove(os.path.join(SCREENSHOTS_DIR, f))

    issues_found.clear()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        for vp_name, vp in VIEWPORTS.items():
            print(f'\n🖥️  Reviewing at {vp_name} ({vp["width"]}x{vp["height"]})')
            context = browser.new_context(viewport=vp)
            page = context.new_page()
            
            # 1. Title screen
            review_title_screen(page, vp_name)
            
            # 2. Game screen
            review_game_screen(page, vp_name)
            
            # 3. Feedback form
            review_feedback_form(page, vp_name)
            
            # 4. Game with choices
            review_game_with_choices(page, vp_name)
            
            # Check for visual issues
            # Check if elements overflow viewport
            overflow = page.evaluate('''() => {
                const issues = [];
                document.querySelectorAll('*').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.right > window.innerWidth + 5) {
                        issues.push(`${el.tagName}.${el.className.split(' ')[0]} overflows right by ${Math.round(rect.right - window.innerWidth)}px`);
                    }
                });
                return issues.slice(0, 10);
            }''')
            if overflow:
                for o in overflow:
                    issues_found.append(f'[{vp_name}] Overflow: {o}')
            
            # Check for overlapping elements in the coalition bar area
            overlap_check = page.evaluate('''() => {
                const issues = [];
                // Check coalition bar majority line positioning
                const coalitionBar = document.querySelector('.glass-card');
                if (coalitionBar) {
                    const barEl = coalitionBar.querySelector('.flex.h-4');
                    const lineEl = coalitionBar.querySelector('.relative.-mt-4');
                    if (barEl && lineEl) {
                        const barRect = barEl.getBoundingClientRect();
                        const lineRect = lineEl.getBoundingClientRect();
                        // The majority line should align with the bar, not overlap other content
                        if (lineRect.top < barRect.top) {
                            issues.push(`Majority line (top: ${lineRect.top}) starts above bar (top: ${barRect.top})`);
                        }
                    }
                }
                return issues;
            }''')
            if overlap_check:
                for o in overlap_check:
                    issues_found.append(f'[{vp_name}] Layout: {o}')

            context.close()
        
        browser.close()

    print(f'\n{"=" * 50}')
    print(f'📸 Screenshots saved to: {SCREENSHOTS_DIR}/')
    if issues_found:
        print(f'\n⚠️  Issues found:')
        for issue in issues_found:
            print(f'  - {issue}')
    else:
        print(f'\n✅ No automated issues detected')
    print(f'{"=" * 50}')
    
    return len(issues_found)

if __name__ == '__main__':
    sys.exit(run_review())
