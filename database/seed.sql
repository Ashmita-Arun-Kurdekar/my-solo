-- Resource Allocation System: repeatable Power BI demo dataset
-- WARNING: This file rebuilds the application's data tables. Run it only in a
-- development/demo database. It creates exactly 250 employees, 30 departments,
-- 80 projects, 700 tasks, 150 resource allocations, 300 leave requests,
-- 600 attendance records, 200 performance reviews, and 150 notifications.

BEGIN;

DROP TABLE IF EXISTS notifications, performance_reviews, attendance, leave_requests,
  resource_allocations, project_members, tasks, projects, employees, departments,
  roles CASCADE;

CREATE TABLE roles (
  role_id INTEGER PRIMARY KEY,
  role_name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE departments (
  department_id SERIAL PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL UNIQUE,
  location VARCHAR(100) NOT NULL,
  annual_budget NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
  employee_id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  designation VARCHAR(100) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(role_id),
  department_id INTEGER NOT NULL REFERENCES departments(department_id),
  joining_date DATE NOT NULL,
  salary NUMERIC(12,2) NOT NULL CHECK (salary > 0),
  employment_status VARCHAR(20) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  project_id SERIAL PRIMARY KEY,
  project_name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  manager_id INTEGER NOT NULL REFERENCES employees(employee_id),
  department_id INTEGER NOT NULL REFERENCES departments(department_id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  budget NUMERIC(14,2) NOT NULL CHECK (budget > 0),
  completion_percentage NUMERIC(5,2) NOT NULL CHECK (completion_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (end_date >= start_date)
);

-- Legacy title and employee_id columns are retained because the current backend
-- uses them when it creates or edits a task.
CREATE TABLE tasks (
  task_id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  assigned_to INTEGER NOT NULL REFERENCES employees(employee_id),
  assigned_by INTEGER NOT NULL REFERENCES employees(employee_id),
  task_title TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id),
  description TEXT NOT NULL DEFAULT '',
  priority VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  completion_percentage NUMERIC(5,2) NOT NULL CHECK (completion_percentage BETWEEN 0 AND 100),
  assigned_date DATE NOT NULL,
  due_date DATE NOT NULL,
  completed_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (due_date >= assigned_date)
);

CREATE TABLE project_members (
  project_member_id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id),
  assigned_on DATE NOT NULL,
  UNIQUE (project_id, employee_id)
);

CREATE TABLE resource_allocations (
  allocation_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id),
  project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  allocation_percentage NUMERIC(5,2) NOT NULL CHECK (allocation_percentage BETWEEN 1 AND 100),
  allocation_start_date DATE NOT NULL,
  allocation_end_date DATE NOT NULL,
  billable BOOLEAN NOT NULL,
  allocation_status VARCHAR(20) NOT NULL,
  CHECK (allocation_end_date >= allocation_start_date)
);

CREATE TABLE leave_requests (
  leave_request_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id),
  leave_type VARCHAR(30) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL CHECK (days_requested > 0),
  status VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  requested_on DATE NOT NULL,
  approved_by INTEGER REFERENCES employees(employee_id),
  CHECK (end_date >= start_date)
);

CREATE TABLE attendance (
  attendance_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id),
  attendance_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  check_in TIME,
  check_out TIME,
  work_hours NUMERIC(4,2) NOT NULL CHECK (work_hours >= 0),
  UNIQUE (employee_id, attendance_date)
);

CREATE TABLE performance_reviews (
  review_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id),
  reviewer_id INTEGER NOT NULL REFERENCES employees(employee_id),
  review_period VARCHAR(30) NOT NULL,
  review_date DATE NOT NULL,
  rating NUMERIC(3,2) NOT NULL CHECK (rating BETWEEN 1 AND 5),
  goals_score NUMERIC(3,2) NOT NULL CHECK (goals_score BETWEEN 1 AND 5),
  collaboration_score NUMERIC(3,2) NOT NULL CHECK (collaboration_score BETWEEN 1 AND 5),
  comments TEXT NOT NULL
);

CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id),
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(30) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_projects_department ON projects(department_id);
CREATE INDEX idx_projects_manager ON projects(manager_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_leaves_employee ON leave_requests(employee_id);

INSERT INTO roles (role_id, role_name) VALUES
  (1, 'Admin'), (2, 'Manager'), (3, 'Employee');

INSERT INTO departments (department_name, location, annual_budget) VALUES
  ('Engineering', 'Bengaluru', 28000000), ('Product Management', 'Bengaluru', 15500000),
  ('Data Analytics', 'Pune', 18000000), ('Human Resources', 'Mumbai', 9500000),
  ('Finance', 'Mumbai', 14000000), ('Marketing', 'Gurugram', 16500000),
  ('Sales', 'Mumbai', 22000000), ('Customer Success', 'Pune', 12000000),
  ('Operations', 'Hyderabad', 14500000), ('Information Technology', 'Bengaluru', 25000000),
  ('Quality Assurance', 'Chennai', 13000000), ('Legal & Compliance', 'Mumbai', 11000000),
  ('Procurement', 'Hyderabad', 8000000), ('Business Development', 'Delhi', 13500000),
  ('Research & Development', 'Bengaluru', 24000000), ('Design', 'Pune', 11000000),
  ('Corporate Communications', 'Delhi', 7500000), ('Administration', 'Mumbai', 7000000),
  ('Training & Development', 'Chennai', 8500000), ('Security', 'Hyderabad', 9000000),
  ('Supply Chain', 'Ahmedabad', 16000000), ('Customer Support', 'Kochi', 10500000),
  ('Strategy', 'Bengaluru', 12500000), ('PMO', 'Pune', 11500000),
  ('Cloud Infrastructure', 'Hyderabad', 26000000), ('Cybersecurity', 'Bengaluru', 21000000),
  ('Mobile Engineering', 'Chennai', 19000000), ('International Business', 'Mumbai', 17000000),
  ('Facilities', 'Pune', 6500000), ('Sustainability', 'Delhi', 7200000);

INSERT INTO employees
  (full_name, email, password, phone, designation, role_id, department_id, joining_date, salary, employment_status)
SELECT
  CASE gs
    WHEN 1 THEN 'Aarav Mehta'
    ELSE (ARRAY['Aarav','Vivaan','Aditya','Arjun','Kabir','Reyansh','Rohan','Ishaan','Karthik','Siddharth','Ananya','Aditi','Priya','Kavya','Sneha','Ishita','Nisha','Meera','Riya','Pooja','Rahul','Vikram','Nikhil','Manish','Sanjay','Pranav','Harsh','Akash','Varun','Deepak'])[1 + ((gs - 1) % 30)] || ' ' ||
         (ARRAY['Sharma','Patel','Reddy','Iyer','Singh','Gupta','Nair','Kulkarni','Joshi','Verma','Khan','Das','Chatterjee','Menon','Bose','Agarwal','Jain','Mishra','Yadav','Rao','Pillai','Shetty','Bhat','Kumar','Saxena','Kapoor','Thakur','Malhotra','Sinha','Naidu'])[1 + ((gs * 7 - 1) % 30)]
  END,
  CASE WHEN gs = 1 THEN 'admin@resourceallocation.in' ELSE 'employee' || gs || '@resourceallocation.in' END,
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  '+91 ' || (7000000000 + gs * 731)::TEXT,
  CASE WHEN gs = 1 THEN 'System Administrator' WHEN gs <= 31 THEN
    (ARRAY['Engineering Manager','Product Manager','Delivery Manager','Analytics Manager','Operations Manager','HR Manager'])[1 + ((gs - 2) % 6)]
  ELSE (ARRAY['Software Engineer','Senior Software Engineer','Business Analyst','Data Analyst','QA Engineer','UX Designer','Account Executive','HR Executive','Financial Analyst','DevOps Engineer','Support Specialist','Project Coordinator'])[1 + ((gs - 32) % 12)] END,
  CASE WHEN gs = 1 THEN 1 WHEN gs <= 31 THEN 2 ELSE 3 END,
  1 + ((gs - 1) % 30),
  CURRENT_DATE - (60 + ((gs * 37) % 1825)),
  CASE WHEN gs = 1 THEN 2400000 WHEN gs <= 31 THEN 1100000 + ((gs % 8) * 125000) ELSE 420000 + ((gs * 17321) % 750000) END,
  CASE WHEN gs % 29 = 0 THEN 'On Notice' WHEN gs % 47 = 0 THEN 'Inactive' ELSE 'Active' END
FROM generate_series(1, 250) AS gs;

INSERT INTO projects
  (project_name, description, manager_id, department_id, start_date, end_date, status, budget, completion_percentage)
SELECT
  (ARRAY['Digital Transformation','Customer Portal','Analytics Modernization','Cloud Migration','Mobile Commerce','ERP Enhancement','Data Governance','Cyber Defense','Supply Chain Visibility','Employee Experience'])[1 + ((gs - 1) % 10)] || ' - Phase ' || (1 + ((gs - 1) / 10)),
  'Strategic initiative delivering measurable improvements in efficiency, customer experience, and operational insight.',
  2 + ((gs - 1) % 30),
  1 + ((gs * 3 - 1) % 30),
  CURRENT_DATE - (40 + ((gs * 17) % 520)),
  CURRENT_DATE + CASE WHEN gs % 5 = 0 THEN -((gs * 3) % 90) ELSE 30 + ((gs * 11) % 330) END,
  CASE WHEN gs % 5 = 0 THEN 'Completed' WHEN gs % 11 = 0 THEN 'On Hold' ELSE 'Active' END,
  1800000 + ((gs * 382791) % 12500000),
  CASE WHEN gs % 5 = 0 THEN 100 WHEN gs % 11 = 0 THEN 20 + ((gs * 7) % 45) ELSE 15 + ((gs * 13) % 75) END
FROM generate_series(1, 80) AS gs;

INSERT INTO project_members (project_id, employee_id, assigned_on)
SELECT project_id, employee_id, assigned_on
FROM (
  SELECT 1 + ((gs - 1) % 80) AS project_id,
         32 + ((gs * 11 - 1) % 219) AS employee_id,
         CURRENT_DATE - (20 + ((gs * 5) % 500)) AS assigned_on
  FROM generate_series(1, 400) AS gs
) members
ON CONFLICT (project_id, employee_id) DO NOTHING;

INSERT INTO tasks
  (project_id, assigned_to, assigned_by, task_title, title, employee_id, description, priority, status, completion_percentage, assigned_date, due_date, completed_date)
SELECT
  1 + ((gs - 1) % 80),
  32 + ((gs * 13 - 1) % 219),
  2 + (((gs - 1) % 80) % 30),
  (ARRAY['Design solution architecture','Build API integration','Prepare sprint backlog','Create dashboard prototype','Perform regression testing','Document business process','Configure cloud environment','Resolve production defect','Conduct stakeholder review','Optimize database query'])[1 + ((gs - 1) % 10)] || ' #' || gs,
  (ARRAY['Design solution architecture','Build API integration','Prepare sprint backlog','Create dashboard prototype','Perform regression testing','Document business process','Configure cloud environment','Resolve production defect','Conduct stakeholder review','Optimize database query'])[1 + ((gs - 1) % 10)] || ' #' || gs,
  32 + ((gs * 13 - 1) % 219),
  'Work item created for the project delivery plan, with measurable acceptance criteria and stakeholder review.',
  CASE WHEN gs % 20 = 0 THEN 'Critical' WHEN gs % 6 = 0 THEN 'High' WHEN gs % 3 = 0 THEN 'Medium' ELSE 'Low' END,
  CASE WHEN gs % 20 < 7 THEN 'Completed' WHEN gs % 20 < 13 THEN 'In Progress' WHEN gs % 20 < 17 THEN 'Pending' ELSE 'Delayed' END,
  CASE WHEN gs % 20 < 7 THEN 100 WHEN gs % 20 < 13 THEN 30 + ((gs * 7) % 60) WHEN gs % 20 < 17 THEN ((gs * 3) % 25) ELSE 10 + ((gs * 5) % 45) END,
  CURRENT_DATE - (10 + ((gs * 7) % 480)),
  CURRENT_DATE + CASE WHEN gs % 20 < 7 THEN -((gs * 3) % 120) WHEN gs % 20 >= 17 THEN -((gs * 5) % 70) ELSE 5 + ((gs * 11) % 180) END,
  CASE WHEN gs % 20 < 7 THEN CURRENT_DATE - ((gs * 2) % 90) ELSE NULL END
FROM generate_series(1, 700) AS gs;

INSERT INTO resource_allocations
  (employee_id, project_id, allocation_percentage, allocation_start_date, allocation_end_date, billable, allocation_status)
SELECT
  32 + ((gs * 17 - 1) % 219), 1 + ((gs * 5 - 1) % 80),
  25 + ((gs * 9) % 76), CURRENT_DATE - (15 + ((gs * 9) % 360)),
  CURRENT_DATE + CASE WHEN gs % 9 = 0 THEN -((gs * 2) % 45) ELSE 30 + ((gs * 5) % 240) END,
  gs % 7 <> 0,
  CASE WHEN gs % 9 = 0 THEN 'Released' WHEN gs % 7 = 0 THEN 'Planned' ELSE 'Active' END
FROM generate_series(1, 150) AS gs;

INSERT INTO leave_requests
  (employee_id, leave_type, start_date, end_date, days_requested, status, reason, requested_on, approved_by)
SELECT
  1 + ((gs * 19 - 1) % 250),
  (ARRAY['Casual Leave','Sick Leave','Earned Leave','Maternity Leave','Paternity Leave','Work From Home'])[1 + ((gs - 1) % 6)],
  CURRENT_DATE - ((gs * 13) % 540),
  CURRENT_DATE - ((gs * 13) % 540) + (1 + (gs % 5)),
  1 + (gs % 5),
  CASE WHEN gs % 10 < 6 THEN 'Approved' WHEN gs % 10 < 8 THEN 'Pending' ELSE 'Rejected' END,
  (ARRAY['Family commitment','Medical appointment','Festival travel','Personal work','Health recovery','Planned vacation'])[1 + ((gs * 3 - 1) % 6)],
  CURRENT_DATE - ((gs * 13) % 540) - (2 + (gs % 14)),
  CASE WHEN gs % 10 < 8 THEN 2 + ((gs - 1) % 30) ELSE NULL END
FROM generate_series(1, 300) AS gs;

INSERT INTO attendance (employee_id, attendance_date, status, check_in, check_out, work_hours)
SELECT
  1 + ((gs - 1) % 250), CURRENT_DATE - ((gs * 7) % 365),
  CASE WHEN gs % 20 = 0 THEN 'Absent' WHEN gs % 13 = 0 THEN 'Leave' WHEN gs % 9 = 0 THEN 'Half Day' WHEN gs % 7 = 0 THEN 'Work From Home' ELSE 'Present' END,
  CASE WHEN gs % 20 = 0 OR gs % 13 = 0 THEN NULL ELSE TIME '08:30' + ((gs % 91) || ' minutes')::INTERVAL END,
  CASE WHEN gs % 20 = 0 OR gs % 13 = 0 THEN NULL ELSE TIME '17:00' + ((gs % 121) || ' minutes')::INTERVAL END,
  CASE WHEN gs % 20 = 0 OR gs % 13 = 0 THEN 0 WHEN gs % 9 = 0 THEN 4.5 ELSE 7.5 + ((gs % 9) / 10.0) END
FROM generate_series(1, 600) AS gs;

INSERT INTO performance_reviews
  (employee_id, reviewer_id, review_period, review_date, rating, goals_score, collaboration_score, comments)
SELECT
  32 + ((gs * 7 - 1) % 219), 2 + ((gs - 1) % 30),
  CASE WHEN gs % 2 = 0 THEN 'H1 2026' ELSE 'H2 2025' END,
  CURRENT_DATE - ((gs * 5) % 360),
  2.5 + ((gs * 3) % 26) / 10.0, 2.4 + ((gs * 7) % 27) / 10.0, 2.6 + ((gs * 11) % 25) / 10.0,
  (ARRAY['Exceeded key delivery expectations and demonstrated ownership.','Consistently dependable contributor with strong collaboration.','Made good progress against goals; development plan is in place.','Delivered quality work while supporting cross-functional priorities.'])[1 + ((gs - 1) % 4)]
FROM generate_series(1, 200) AS gs;

INSERT INTO notifications (employee_id, title, message, notification_type, is_read, created_at)
SELECT
  1 + ((gs * 23 - 1) % 250),
  (ARRAY['Task deadline approaching','Allocation updated','Leave request status','Project milestone reached','Performance review available'])[1 + ((gs - 1) % 5)],
  'This is a system-generated update for your workspace. Please review the details and take action if required.',
  (ARRAY['Task','Allocation','Leave','Project','Performance'])[1 + ((gs - 1) % 5)],
  gs % 3 = 0,
  CURRENT_TIMESTAMP - ((gs * 19) || ' hours')::INTERVAL
FROM generate_series(1, 150) AS gs;

-- Keep sequence values correct if this file is adjusted to use explicit IDs later.
SELECT setval(pg_get_serial_sequence('departments', 'department_id'), (SELECT MAX(department_id) FROM departments));
SELECT setval(pg_get_serial_sequence('employees', 'employee_id'), (SELECT MAX(employee_id) FROM employees));
SELECT setval(pg_get_serial_sequence('projects', 'project_id'), (SELECT MAX(project_id) FROM projects));
SELECT setval(pg_get_serial_sequence('tasks', 'task_id'), (SELECT MAX(task_id) FROM tasks));

DO $$
DECLARE invalid_references INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM departments) <> 30 OR (SELECT COUNT(*) FROM employees) <> 250
     OR (SELECT COUNT(*) FROM projects) <> 80 OR (SELECT COUNT(*) FROM tasks) <> 700
     OR (SELECT COUNT(*) FROM resource_allocations) <> 150 OR (SELECT COUNT(*) FROM leave_requests) <> 300
     OR (SELECT COUNT(*) FROM attendance) <> 600 OR (SELECT COUNT(*) FROM performance_reviews) <> 200
     OR (SELECT COUNT(*) FROM notifications) <> 150 THEN
    RAISE EXCEPTION 'Seed row-count verification failed.';
  END IF;

  SELECT COUNT(*) INTO invalid_references
  FROM tasks t LEFT JOIN employees e ON e.employee_id = t.assigned_to
  WHERE e.employee_id IS NULL;
  IF invalid_references <> 0 THEN RAISE EXCEPTION 'Task employee foreign-key verification failed.'; END IF;
END $$;

COMMIT;

-- Successful run: the requested counts and dashboard-ready distribution summary.
SELECT 'departments' AS table_name, COUNT(*) AS row_count FROM departments
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL SELECT 'resource_allocations', COUNT(*) FROM resource_allocations
UNION ALL SELECT 'leave_requests', COUNT(*) FROM leave_requests
UNION ALL SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL SELECT 'performance_reviews', COUNT(*) FROM performance_reviews
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
ORDER BY table_name;

SELECT status, COUNT(*) AS task_count, ROUND(AVG(completion_percentage), 1) AS avg_completion
FROM tasks GROUP BY status ORDER BY status;
