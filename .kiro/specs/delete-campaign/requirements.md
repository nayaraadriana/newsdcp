# Requirements Document

## Introduction

This feature allows authenticated users to delete campaigns they have created. Deleting a campaign removes the campaign record and all associated data (recipients, opens, clicks, and tracked links) from the database. The feature includes a backend API endpoint with ownership authorization and a UI element on the stats page with a confirmation step to prevent accidental deletions.

## Glossary

- **Campaign_API**: The Next.js API route handler responsible for campaign deletion operations at `/api/campaigns/[campaignId]`
- **Stats_Page**: The client-side page at `/stats` that displays campaign listings and detailed statistics
- **Campaign_Owner**: The authenticated user whose `id` matches the `created_by` field of a campaign record
- **Cascade_Delete**: The process of removing a campaign and all its dependent records (recipients, opens, clicks, tracked_links) in a single transactional operation
- **Confirmation_Dialog**: A UI modal or prompt that requires explicit user confirmation before executing a destructive action

## Requirements

### Requirement 1: Delete Campaign API Endpoint

**User Story:** As a campaign owner, I want to delete a campaign via an API endpoint, so that I can remove campaigns I no longer need.

#### Acceptance Criteria

1. WHEN a DELETE request is received at `/api/campaigns/[campaignId]`, THE Campaign_API SHALL authenticate the request using the existing `withAuth` middleware
2. WHEN an authenticated user sends a DELETE request for a campaign they own, THE Campaign_API SHALL remove the campaign and all associated records (recipients, opens, clicks, tracked_links) from the database
3. WHEN an authenticated user sends a DELETE request for a campaign they own, THE Campaign_API SHALL return a 200 status code with a success message
4. IF an authenticated user sends a DELETE request for a campaign they do not own, THEN THE Campaign_API SHALL return a 403 status code with an error message
5. IF an authenticated user sends a DELETE request for a campaign that does not exist, THEN THE Campaign_API SHALL return a 404 status code with an error message
6. IF a database error occurs during deletion, THEN THE Campaign_API SHALL return a 500 status code with an error message

### Requirement 2: Cascade Deletion of Related Data

**User Story:** As a campaign owner, I want all tracking data associated with a campaign to be removed when I delete it, so that no orphaned records remain in the database.

#### Acceptance Criteria

1. WHEN a campaign is deleted, THE Campaign_API SHALL delete all records from the `clicks` table where `campaign_id` matches the deleted campaign
2. WHEN a campaign is deleted, THE Campaign_API SHALL delete all records from the `opens` table where `campaign_id` matches the deleted campaign
3. WHEN a campaign is deleted, THE Campaign_API SHALL delete all records from the `tracked_links` table where `campaign_id` matches the deleted campaign
4. WHEN a campaign is deleted, THE Campaign_API SHALL delete all records from the `recipients` table where `campaign_id` matches the deleted campaign
5. WHEN a campaign is deleted, THE Campaign_API SHALL delete dependent records before deleting the campaign record to maintain referential integrity

### Requirement 3: Delete Button on Stats Page

**User Story:** As a campaign owner, I want a delete button on the stats page, so that I can initiate campaign deletion from the UI.

#### Acceptance Criteria

1. THE Stats_Page SHALL display a delete button for each campaign in the campaign list
2. WHEN the delete button is clicked, THE Stats_Page SHALL display a Confirmation_Dialog asking the user to confirm the deletion
3. WHEN the user confirms the deletion in the Confirmation_Dialog, THE Stats_Page SHALL send a DELETE request to the Campaign_API
4. WHEN the Campaign_API returns a success response, THE Stats_Page SHALL remove the deleted campaign from the displayed list without requiring a full page reload
5. WHEN the Campaign_API returns a success response, THE Stats_Page SHALL clear the campaign details section if the deleted campaign was selected
6. IF the Campaign_API returns an error response, THEN THE Stats_Page SHALL display an error message to the user
7. WHEN the user cancels the deletion in the Confirmation_Dialog, THE Stats_Page SHALL close the dialog and take no further action

### Requirement 4: Authorization Enforcement

**User Story:** As a user, I want to be assured that only the campaign creator can delete a campaign, so that my campaigns are protected from unauthorized deletion.

#### Acceptance Criteria

1. WHEN a DELETE request is received, THE Campaign_API SHALL verify that the authenticated user's `id` matches the campaign's `created_by` field
2. IF an unauthenticated request is received, THEN THE Campaign_API SHALL return a 401 status code with an error message
3. THE Campaign_API SHALL perform the ownership check by querying the campaign record before attempting any deletion
