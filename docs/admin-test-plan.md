# Admin Panel Test Plan

## 1. Access Control (RBAC)
- [ ] Attempt to access `/boss` as a non-logged-in user. Expected: Redirect to `/login`.
- [ ] Attempt to access `/boss` as a standard user. Expected: Redirect to `/dashboard`.
- [ ] Attempt to access `/boss` as an admin user. Expected: Access granted.

## 2. Dashboard
- [ ] Verify metrics cards load correctly.
- [ ] Check if the charts (if any) display data.

## 3. User Management
- [ ] List users: Ensure all users are listed with correct roles and plans.
- [ ] Filter users: Test searching or filtering (if implemented).
- [ ] Update Status:
    - Change user status to "Suspended". Verify db update and UI reflection.
    - Change user status back to "Active".
- [ ] View User Details: Click on a user to view details.
- [ ] Change Plan:
    - Open user details.
    - Click "Change Plan", select new plan, and save.
    - Verify user's plan is updated.

## 4. Plan Management
- [ ] List Plans: Ensure plans are listed.
- [ ] Create Plan:
    - Click "Create Plan".
    - Fill form: Name="Test Plan", MaxCalendars=5, SyncFreq=30.
    - Submit.
    - Verify plan appears in the list.
- [ ] Edit Plan:
    - Click "Edit" on a plan.
    - Change details (e.g., name or active status) and save.
    - Verify changes are reflected.

## 5. Payments
- [ ] List Payments: Ensure payment history is visible.
- [ ] Add Manual Payment:
    - Click "Add Payment".
    - Select User, Amount=50, Mode="Cash", Status="Completed", Notes="Test".
    - Submit.
    - Verify payment appears in the list with the correct status.

## 6. Audit Logs
- [ ] Perform an action (e.g., update user status).
- [ ] Go to "Audit Logs" page.
- [ ] Verify the action is logged with correct Admin ID and details.
