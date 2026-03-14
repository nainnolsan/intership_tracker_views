# Frontend Expected API Contract (via API Gateway)

All requests must go through API Gateway base URL:
- `VITE_API_GATEWAY_URL`
- Example: `https://api-gateway.example.com`

Namespace used by this frontend module:
- `/api/internships`

## 1) Dashboard
### GET `/api/internships/dashboard/metrics`
Response:
```json
{
  "totalApplied": 32,
  "totalOnlineAssessments": 14,
  "totalInterviews": 7,
  "totalOffers": 2,
  "totalRejected": 11,
  "conversionRate": 6.25
}
```

### GET `/api/internships/dashboard/funnel`
Response:
```json
{
  "nodes": [{ "name": "Applied" }, { "name": "OA" }, { "name": "Interview" }, { "name": "Offer" }, { "name": "Rejected" }],
  "links": [
    { "source": 0, "target": 1, "value": 14 },
    { "source": 1, "target": 2, "value": 7 },
    { "source": 2, "target": 3, "value": 2 },
    { "source": 2, "target": 4, "value": 4 },
    { "source": 0, "target": 4, "value": 7 }
  ]
}
```

## 2) Applications
### GET `/api/internships/applications`
Query params supported by UI:
- `stage`
- `company`
- `roleType`
- `fromDate`
- `toDate`
- `q`

Response:
```json
[
  {
    "id": "app_1",
    "company": "Stripe",
    "roleTitle": "Software Engineer Intern",
    "roleType": "Internship",
    "stage": "Interview",
    "appliedAt": "2026-02-02",
    "lastUpdatedAt": "2026-03-13T10:00:00.000Z",
    "location": "Remote",
    "source": "LinkedIn",
    "salaryRange": "$45-$55/hr",
    "notes": "Behavioral complete",
    "contactEmail": "recruiting@stripe.com"
  }
]
```

### POST `/api/internships/applications`
Request body:
```json
{
  "company": "Datadog",
  "roleTitle": "Backend Engineer",
  "roleType": "FullTime",
  "stage": "Applied",
  "appliedAt": "2026-03-12",
  "location": "NYC",
  "source": "Company Career Site",
  "salaryRange": "$120k-$150k",
  "notes": "Need visa sponsorship",
  "contactEmail": "talent@datadog.com"
}
```
Response: created `ApplicationDTO`

### PATCH `/api/internships/applications/:id`
Request body: partial `CreateApplicationDTO`
Response: updated `ApplicationDTO`

## 3) Pipeline
### GET `/api/internships/pipeline`
Response:
```json
[
  {
    "stage": "Applied",
    "total": 10,
    "applications": []
  }
]
```

## 4) Analytics
### GET `/api/internships/analytics/overview`
Response:
```json
{
  "daily": [{ "date": "2026-03-01", "applied": 2, "interview": 1, "offer": 0 }],
  "stageDistribution": [{ "stage": "Applied", "value": 10 }]
}
```

## 5) Email Center
### GET `/api/internships/emails`
Response:
```json
{
  "connectors": [
    { "provider": "gmail", "connected": false, "authUrl": "/oauth/gmail" },
    { "provider": "outlook", "connected": true, "lastSyncAt": "2026-03-13T12:00:00.000Z" }
  ],
  "threads": [
    {
      "id": "mail_1",
      "subject": "Next steps",
      "company": "Stripe",
      "snippet": "Please choose an interview slot",
      "receivedAt": "2026-03-10T18:00:00.000Z",
      "stageHint": "Interview"
    }
  ]
}
```

### POST `/api/internships/emails/connect/:provider`
- `provider`: `gmail` | `outlook`

Response:
```json
{
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

## Notes
- Frontend does not call internal auth-service or other internal services directly.
- Any new endpoint must be documented in this file before frontend usage.
