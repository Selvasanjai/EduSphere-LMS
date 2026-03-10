# 🧪 COURSE EDIT FEATURE - QUICK TEST GUIDE

**Date**: March 10, 2026  
**Feature**: Edit Course Options After Video Upload  
**Status**: ✅ IMPLEMENTED & READY TO TEST

---

## 🎯 WHAT'S NEW - QUICK OVERVIEW

You now have **two new ways to edit courses**:

1. **"Videos" Button** on course cards in "My Courses"
   - Direct navigation to video management page
   - Click to go straight to upload/manage videos

2. **"Edit Course" Button** on video management page
   - Edit course details while managing videos
   - No need to navigate back and forth
   - Modal form opens with all course details

---

## 🚀 QUICK TEST (5 MINUTES)

### **Test 1: Videos Button Navigation**
```
1. Go to: Dashboard → Staff → My Courses
2. See course cards with action buttons:
   [Videos] [Edit] [Delete]
3. Click [Videos] button
4. ✅ Should navigate to video management page
5. See page title: "📹 Manage Videos"
6. See course name in subtitle
```

### **Test 2: Edit Course From Video Page**
```
1. On video management page, look at header
2. See TWO buttons: [Edit Course] [+ Add Video]
3. Click [Edit Course]
4. ✅ Modal should appear with form
5. See fields:
   - Course Title (text input)
   - Description (textarea)
   - Category (text input)
   - Level (dropdown: beginner/intermediate/advanced)
   - Duration (number input)
```

### **Test 3: Edit and Save**
```
1. In Edit Course modal, change title:
   FROM: "Web Development"
   TO:   "Advanced Web Development"
2. Click [✓ Save Changes] button
3. ✅ Modal closes
4. ✅ Page header shows new title
5. Success message appears (toast)
```

### **Test 4: Cancel Without Saving**
```
1. Click [Edit Course] button
2. Change title to "New Title"
3. Click [Cancel] button
4. ✅ Modal closes WITHOUT saving
5. Old title still displays in header
```

### **Test 5: Close Modal with X Button**
```
1. Click [Edit Course] button
2. See [X] button in top-right corner
3. Click [X]
4. ✅ Modal closes without saving
5. Form data reverts to original
```

---

## 📍 WHERE TO FIND IT

### **Location 1: My Courses Page**
```
Dashboard → Staff Dashboard → My Courses
            (or click "Courses" in sidebar)

Action Buttons on Each Course Card:
┌──────────────────────────────┐
│     Course Name              │
│  Description...              │
│  [Category] [Level]          │
│  [Videos] [Edit] [Delete]    │ ← NEW
└──────────────────────────────┘
```

### **Location 2: Video Management Page**
```
Dashboard → Staff → My Courses → Click [Videos]

Page Header:
📹 Manage Videos          [Edit Course] [+ Add Video]
(Course Name)                    ↑ NEW
                          In the top-right!
```

---

## ✨ WORKFLOW EXAMPLES

### **Scenario A: Create Course, Upload Videos, Edit Details**
```
1. Dashboard → My Courses
2. Click [Create Course] button
3. Fill form: Title, Description, Category, Level, Duration
4. Click [Create] → Course created (Pending Admin Approval)
5. See new course card with [Videos] [Edit] [Delete]
6. Click [Videos] button → Video management page opens
7. Click [Add Video] → Upload first video
8. Realize you want to change course level
9. Click [Edit Course] button → Modal opens
10. Change Level from "beginner" to "intermediate"
11. Click [Save Changes] → Modal closes, change saved
12. Continue adding more videos
✅ All in one workflow, no navigation back-and-forth!
```

### **Scenario B: Batch Edit Course After Video Upload**
```
1. Already in video management page with videos uploaded
2. Want to update course description
3. Click [Edit Course] button
4. Edit description: "Add more details about what students learn"
5. Click [Save Changes]
6. Modal closes instantly
7. Continue managing videos or add more
✅ Quick edit without leaving the page!
```

### **Scenario C: Quick Navigation from Course List**
```
1. In My Courses page, see multiple courses
2. For Course A: Click [Videos] to manage videos
3. For Course B: Click [Edit] to change details
4. For Course C: Click [Delete] to remove it
✅ Clear action buttons, easy navigation!
```

---

## 🔍 WHAT TO VERIFY

### **Button Presence**
- [ ] "Videos" button shows on course cards (My Courses page)
- [ ] "Edit Course" button shows in video page header
- [ ] "Add Video" button still works
- [ ] Three buttons don't crowd the layout

### **Navigation**
- [ ] Clicking "Videos" goes to video management page
- [ ] Button shows video icon + text "Videos"
- [ ] "Edit Course" button accessible from video page

### **Edit Modal**
- [ ] Modal appears when clicking "Edit Course"
- [ ] Modal has all 5 fields: Title, Description, Category, Level, Duration
- [ ] Form is pre-filled with current course data
- [ ] "Save Changes" button is present
- [ ] "Cancel" button is present
- [ ] Close button (X) in top-right corner works

### **Functionality**
- [ ] Can edit title and see change after save
- [ ] Can edit description and see change after save
- [ ] Can edit category
- [ ] Can change level (beginner → intermediate → advanced)
- [ ] Can edit duration (hours)
- [ ] Changes actually save to database (check MongoDB or refresh page)

### **Error Handling**
- [ ] Leaving required fields empty shows error
- [ ] Error toast appears at top-right
- [ ] Can't save with empty title/description/category

### **UI/UX**
- [ ] Modal looks clean and professional
- [ ] Buttons are properly styled
- [ ] Colors match the app theme
- [ ] Responsive on mobile/tablet
- [ ] No console errors (F12 → Console tab)

---

## 📱 RESPONSIVE TEST

### **Desktop (1920x1080)**
- [ ] All buttons visible in row: [Videos] [Edit] [Delete]
- [ ] Modal displays properly, not cut off
- [ ] All form fields visible

### **Tablet (768px)**
- [ ] Buttons might wrap: [Videos] [Edit]
                          [Delete]
- [ ] Modal still readable
- [ ] Form fields stack if needed

### **Mobile (375px)**
- [ ] Buttons stack vertically with proper spacing
- [ ] Modal scrollable if height > screen
- [ ] Touch targets large enough (40px+ height)

---

## 🐛 TROUBLESHOOTING

### **"Edit Course" button not showing**
- Check if you're on the video management page
- Should have URL: `.../staff/videos/{courseId}`
- Try refreshing page (Ctrl+R or Cmd+R)

### **Modal not appearing when clicking "Edit Course"**
- Check browser console for errors (F12)
- Make sure JavaScript is enabled
- Try a different browser

### **Changes not saving**
- Check console for API errors (red messages)
- Verify backend is running (port 5001)
- MongoDB should be connected
- Check if staff user owns the course

### **"Videos" button missing from course cards**
- Make sure you're on "My Courses" page
- Only shows courses you created
- If no courses, create one first

---

## 🎥 TESTING CHECKLIST

### **Basic Functionality**
- [ ] Navigate with "Videos" button works
- [ ] "Edit Course" modal opens
- [ ] Form pre-filled with course data
- [ ] Can change any field
- [ ] Changes save on click "Save Changes"
- [ ] Modal closes after save
- [ ] Success message appears

### **Advanced Testing**
- [ ] Edit multiple courses in succession
- [ ] Edit same course twice
- [ ] Cancel edit without saving
- [ ] Close modal with X button
- [ ] Refresh page - changes persist
- [ ] Check MongoDB - data actually saved

### **Error Cases**
- [ ] Try saving with empty title → Error shown
- [ ] Try saving with empty description → Error shown
- [ ] Try saving with empty category → Error shown
- [ ] Network error (turn off wifi) → Error handled

### **UI/UX Testing**
- [ ] Buttons have hover effects
- [ ] Modal has nice styling
- [ ] Form is easy to use
- [ ] No console warnings
- [ ] Works on mobile

---

## 📊 TEST RESULTS TEMPLATE

```
TEST DATE: [Date]
TESTER: [Your Name]
BROWSER: [Chrome/Firefox/Safari/Edge]
DEVICE: [Desktop/Tablet/Mobile]

✅ PASSED:
- [Feature working]
- [Feature working]

❌ FAILED:
- [Issue found]
- [Issue found]

NOTES:
[Any observations]
```

---

## 🎉 COMPLETE TEST EXAMPLE

**Step-by-step complete test (10 minutes)**:

```
1. Login to dashboard
2. Go to Staff Dashboard
3. Click "My Courses" or "Courses" in sidebar
4. See course cards
5. Check action buttons: [Videos] [Edit] [Delete] ✓
6. Click [Videos] on a course
7. Land on video management page ✓
8. See page title: "📹 Manage Videos" ✓
9. See button: [Edit Course] [+ Add Video] ✓
10. Click [Edit Course]
11. Modal appears with form ✓
12. See 5 fields pre-filled ✓
13. Change: Course Level to "Advanced"
14. Click [Save Changes]
15. Modal closes ✓
16. Success toast appears ✓
17. Page updates with changes ✓
18. Click [Edit Course] again
19. Verify new level is saved ✓
20. Click [Cancel]
21. Modal closes without changes ✓

RESULT: ✅ ALL TESTS PASSED!
```

---

## ✅ YOU'RE READY TO TEST!

The feature is fully implemented and ready. Follow this guide to verify everything works as expected!

---

*Last Updated: March 10, 2026*  
*Status: READY FOR TESTING ✅*
