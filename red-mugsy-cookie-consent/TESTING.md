# Testing Checklist

Functionality
- [ ] Banner appears on first visit only
- [ ] Accept All enables all and hides banner
- [ ] Reject Non-Essential disables optional cookies
- [ ] Customize opens preferences page
- [ ] Preferences toggles persist correctly (365 days)
- [ ] GA loads only when analytics consent = true

Browsers
- [ ] Chrome, Firefox, Safari, Edge (latest 2)
- [ ] iOS Safari, Android Chrome

Accessibility
- [ ] Keyboard navigable (Tab/Enter)
- [ ] Screen reader announces banner
- [ ] ARIA roles and labels on buttons
- [ ] Contrast meets WCAG AA
- [ ] Focus outlines visible

Edge cases
- [ ] Clearing cookies shows banner again
- [ ] Browser blocking cookies degrades gracefully
- [ ] Old consent cookie is handled (re-set on next action)

