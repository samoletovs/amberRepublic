"""
Amber Republic — E2E smoke test using Playwright.
Tests the full game flow: title → start game → make choices → end turn.
Also captures screenshots for visual verification.
"""
from playwright.sync_api import sync_playwright
import os
import sys

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'test-screenshots')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

BASE_URL = "http://localhost:5173"
passed = 0
failed = 0


def screenshot(page, name):
    path = os.path.join(SCREENSHOTS_DIR, f'{name}.png')
    page.screenshot(path=path, full_page=True)
    print(f"  📸 Screenshot saved: {name}.png")


def check(condition, label):
    global passed, failed
    if condition:
        print(f"  ✅ {label}")
        passed += 1
    else:
        print(f"  ❌ {label}")
        failed += 1


def run_tests():
    global passed, failed

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Test on desktop viewport
        print("\n🖥️  DESKTOP TESTS (1280x800)")
        print("=" * 50)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto(BASE_URL)
        page.wait_for_load_state('networkidle')

        # --- Title Screen ---
        print("\n📋 Title Screen")
        check(page.title() != "", "Page has a title")
        check("Amber" in page.content(), "Title contains 'Amber'")
        check("Republic" in page.content(), "Title contains 'Republic'")
        check("Begin Your Decade" in page.content(), "Start button text present")
        check("1.86M" in page.content(), "Shows population stat")
        check("Latvia" in page.content(), "Mentions Latvia")
        screenshot(page, '01-title-desktop')

        # --- Start Game ---
        print("\n🎮 Starting Game")
        start_button = page.locator('button:has-text("Begin Your Decade")')
        check(start_button.is_visible(), "Start button is visible")
        start_button.click()
        page.wait_for_timeout(800)  # Wait for animations

        # --- Game Screen ---
        print("\n📊 Game Screen")
        check("Q1 Jan-Mar" in page.content() or "Q2 Apr-Jun" in page.content(), "Shows quarter info")
        check("2025" in page.content(), "Shows year 2025")
        check("Turn 1/40" in page.content(), "Shows turn counter")
        check("Score" in page.content(), "Shows score label")
        screenshot(page, '02-game-desktop')

        # Check for event cards
        event_cards = page.locator('.glass-card').all()
        check(len(event_cards) >= 3, f"Has event cards (found {len(event_cards)} glass-cards)")

        # Check for choice cards
        choice_cards = page.locator('.choice-card').all()
        check(len(choice_cards) >= 2, f"Has choice cards (found {len(choice_cards)})")

        # --- Make Choices ---
        print("\n🗳️  Making Choices")
        if len(choice_cards) >= 1:
            choice_cards[0].click()
            page.wait_for_timeout(300)
            screenshot(page, '03-choice-selected')
            check(True, "First choice clicked")

        # Select first choice in second event (if exists)
        # Find all choice-cards again after potential re-render
        all_choices = page.locator('.choice-card').all()
        if len(all_choices) >= 4:
            # Click 4th choice card (first choice of second event, approx)
            all_choices[3].click()
            page.wait_for_timeout(300)
            check(True, "Second event choice made")

        # --- End Turn ---
        print("\n⏭️  Ending Turn")
        end_button = page.locator('button:has-text("End Quarter")')
        if end_button.is_visible():
            end_button.click()
            page.wait_for_timeout(1000)
            check("Turn 2/40" in page.content(), "Advanced to turn 2")
            screenshot(page, '04-turn2-desktop')
        else:
            # Maybe not all choices made, try the "left" button
            check(False, "End Quarter button not ready (not all choices made)")

        # --- Check Narrative ---
        print("\n📜 Narrative Check")
        check("Last Quarter" in page.content() or "2025" in page.content(), "Shows some context after turn")

        # --- Feedback Button ---
        print("\n💬 Feedback Button")
        feedback_btn = page.locator('button:has-text("Feedback"), button:has-text("💬")')
        check(feedback_btn.first.is_visible(), "Feedback button is visible")

        page.close()

        # ---- Mobile tests ----
        print("\n\n📱 MOBILE TESTS (375x812 iPhone-like)")
        print("=" * 50)
        mobile_page = browser.new_page(viewport={"width": 375, "height": 812})
        mobile_page.goto(BASE_URL)
        mobile_page.wait_for_load_state('networkidle')

        print("\n📋 Mobile Title Screen")
        check("Amber" in mobile_page.content(), "Mobile: Title visible")
        screenshot(mobile_page, '05-title-mobile')

        # Start game on mobile
        mobile_start = mobile_page.locator('button:has-text("Begin Your Decade")')
        check(mobile_start.is_visible(), "Mobile: Start button visible")
        mobile_start.click()
        mobile_page.wait_for_timeout(800)

        print("\n📊 Mobile Game Screen")
        screenshot(mobile_page, '06-game-mobile')

        # Check indicator toggle exists on mobile
        indicator_toggle = mobile_page.locator('button:has-text("State of the Republic")')
        check(indicator_toggle.is_visible(), "Mobile: Indicator toggle visible")

        # Check bottom bar is present
        end_btn_mobile = mobile_page.locator('button:has-text("left"), button:has-text("End Quarter")')
        check(end_btn_mobile.first.is_visible(), "Mobile: Bottom action bar visible")

        # Check choice cards render on mobile
        mobile_choices = mobile_page.locator('.choice-card').all()
        check(len(mobile_choices) >= 2, f"Mobile: Choice cards render ({len(mobile_choices)} found)")

        mobile_page.close()
        browser.close()

    # --- Summary ---
    total = passed + failed
    print(f"\n{'=' * 50}")
    print(f"📊 RESULTS: {passed}/{total} passed, {failed} failed")
    print(f"{'=' * 50}")

    if failed > 0:
        print("⚠️  Some tests failed!")
        return 1
    else:
        print("✅ All tests passed!")
        return 0


if __name__ == "__main__":
    sys.exit(run_tests())
