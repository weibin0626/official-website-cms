# E2E Integration Test Report

**Project:** Official Website CMS v2.0.0
**Test Date:** 2026-05-26
**QA Engineer:** Edward (严过关)

---

## Test Summary

| Metric | Value |
|--------|-------|
| Total Tests | 22 |
| Passed | 14 |
| Failed | 8 |
| Pass Rate | 63.64% |

---

## Test Results

### Health

| Test Name | Status | Details |
|-----------|--------|---------|
| Health endpoint | ✓ PASS | Status: ok |

### Auth

| Test Name | Status | Details |
|-----------|--------|---------|
| Login with valid credentials | ✓ PASS | Token received |
| Login with wrong password | ✓ PASS | Correctly rejected |
| Login with non-existent user | ✓ PASS | Correctly rejected |
| Get current user with valid token | ✓ PASS | User: admin |
| Get current user without token | ✓ PASS | Correctly rejected |
| Logout | ✓ PASS | Success |

### RBAC

| Test Name | Status | Details |
|-----------|--------|---------|
| Get user permissions | ✓ PASS | Found 30 permissions |
| List roles | ✗ FAIL | Status: 400 |

### Sites

| Test Name | Status | Details |
|-----------|--------|---------|
| List sites | ✓ PASS | Found 3 sites |
| Get site by ID | ✓ PASS | Site: 春阳教育集团 |
| Create new site | ✓ PASS | Site created |
| Update site | ✓ PASS | Updated successfully |

### Users

| Test Name | Status | Details |
|-----------|--------|---------|
| List users | ✓ PASS | Found 0 users |
| Create new user | ✓ PASS | User created |

### Nodes

| Test Name | Status | Details |
|-----------|--------|---------|
| List nodes (tree) | ✗ FAIL | Status: 404 |
| Create root node | ✗ FAIL | Status: 404 |

### Articles

| Test Name | Status | Details |
|-----------|--------|---------|
| List articles | ✗ FAIL | Status: 404 |
| Create article (DRAFT) | ✗ FAIL | Status: 404, Code: 4040 |

### Portal

| Test Name | Status | Details |
|-----------|--------|---------|
| GET /portal/home | ✗ FAIL | Status: 404 |
| GET /portal/articles | ✗ FAIL | Status: 404 |
| GET /portal/banners | ✗ FAIL | Status: 404 |

---

## Failed Tests

- [RBAC] List roles: Status: 400
- [Nodes] List nodes (tree): Status: 404
- [Nodes] Create root node: Status: 404
- [Articles] List articles: Status: 404
- [Articles] Create article (DRAFT): Status: 404, Code: 4040
- [Portal] GET /portal/home: Status: 404
- [Portal] GET /portal/articles: Status: 404
- [Portal] GET /portal/banners: Status: 404

---

*Report generated: 2026-05-26T03:03:45.762Z*
