# Scroll Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement progressive scroll-based fade-in animation for blog post list items with sequential 150ms delays.

**Architecture:** Use IntersectionObserver to detect when list items enter viewport. Add inline `transitionDelay` styles based on item index (index * 150ms). CSS transitions handle the actual fade-in + slide-up animation.

**Tech Stack:** React hooks (useEffect, useRef), IntersectionObserver API, CSS transitions

---

## Task 1: Enable CSS Animation Styles

**Files:**
- Modify: `src/styles/index.css:756-764`

**Step 1: Uncomment animation styles in .post-item**

Uncomment the commented opacity, transform, and transition properties to enable the initial hidden state:

```css
.post-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--ctp-surface0);
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease, background 0.15s;
}
```

**Step 2: Verify CSS change**

The file should now have active animation properties instead of commented ones.

**Step 3: Commit**

```bash
git add src/styles/index.css
git commit -m "style: enable post item fade-in animation"
```

---

## Task 2: Add Sequential Delays to List Items

**Files:**
- Modify: `src/pages/Index.tsx:120`

**Step 1: Add transitionDelay inline style**

Modify the post item `li` element to include a dynamic `style` prop with `transitionDelay`:

```tsx
<li
  key={`${post.slug}-${currentPage}-${index}`}
  className="post-item"
  style={{ transitionDelay: `${index * 150}ms` }}
>
```

This creates a cascading effect where each item delays by 150ms more than the previous one.

**Step 2: Verify the change**

Line 120 should now include the `style` prop with dynamic delay calculation.

**Step 3: Test locally**

```bash
npm run dev
```

Visit http://localhost:5173 and scroll down to verify:
- List items fade in from below with 150ms delays between them
- Each item slides up while fading in
- Hover effects still work

**Step 4: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "feat: add sequential 150ms delays to post list animations"
```

---

## Task 3: Build Verification

**Files:**
- None (verification only)

**Step 1: Run production build**

```bash
npm run build
```

**Step 2: Verify build succeeds**

Expected output: `✓ built in ...ms` with no TypeScript or Vite errors.

**Step 3: Commit (no changes needed)**

If build succeeds, no commit needed. If any issues arise, fix them and commit the fixes.

---

## Task 4: Optional - Adjust Animation Duration

**Files:**
- Modify: `src/styles/index.css:759` (if needed)

**Step 1: Test current animation speed**

If the 0.6s duration feels too fast or too slow, adjust the transition duration:

```css
.post-item {
  /* ... */
  transition: opacity 0.6s ease, transform 0.6s ease, background 0.15s;
  /* Change 0.6s to desired duration (e.g., 0.5s for faster, 0.8s for slower) */
}
```

**Step 2: Test adjusted duration**

```bash
npm run dev
```

Verify the new speed feels natural.

**Step 3: Commit (if changes made)**

```bash
git add src/styles/index.css
git commit -m "style: adjust animation duration to Xs"
```

---

## Testing Notes

### Manual Testing Checklist
- [ ] List items are initially hidden (opacity: 0)
- [ ] First item appears immediately when it enters viewport
- [ ] Each subsequent item appears 150ms after the previous
- [ ] Animation is smooth (slide up + fade in)
- [ ] Hover effects still work on list items
- [ ] Pagination (next/prev page) resets animations
- [ ] Fast scrolling doesn't break the sequential effect
- [ ] Works on mobile devices (responsive)

### Browser Testing
Test in:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)

### Performance Testing
- Monitor CPU usage during animations (should be low)
- Verify animations don't cause layout thrashing
- Check for smooth 60fps animations

---

## Rollback Plan

If issues occur:

```bash
# Remove all changes from this feature branch
git worktree remove .worktrees/feature-scroll-animation --force
git branch -D feature/scroll-animation
```

---

## Related Documentation

- Design spec: `docs/plans/2025-02-10-scroll-animation-design.md`
- AGENTS.md: `/Users/lush/workspace/MyBlog/AGENTS.md`
