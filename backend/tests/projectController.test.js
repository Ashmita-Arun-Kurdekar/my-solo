const test = require('node:test');
const assert = require('node:assert/strict');

const projectController = require('../src/controllers/projectController');

test('normalizeProjectPayload trims values and converts ids', () => {
  const normalized = projectController.normalizeProjectPayload({
    project_name: '  Alpha  ',
    description: '  Build UI  ',
    manager_id: '7',
    department_id: '3',
    start_date: '2026-01-01',
    end_date: '2026-02-01',
    status: '  Active  ',
  });

  assert.equal(normalized.project_name, 'Alpha');
  assert.equal(normalized.description, 'Build UI');
  assert.equal(normalized.manager_id, 7);
  assert.equal(normalized.department_id, 3);
  assert.equal(normalized.status, 'Active');
});

test('authorizeProjectAccess allows admins, managers, and employees to read projects', () => {
  assert.equal(projectController.authorizeProjectAccess({ role_id: 1 }, 'read'), true);
  assert.equal(projectController.authorizeProjectAccess({ role_id: 2 }, 'read'), true);
  assert.equal(projectController.authorizeProjectAccess({ role_id: 3 }, 'read'), true);
  assert.equal(projectController.authorizeProjectAccess({ role_id: 3 }, 'write'), false);
});
