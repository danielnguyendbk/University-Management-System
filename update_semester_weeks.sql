-- Drop the update trigger temporarily to avoid intermediate conflict validation
DROP TRIGGER IF EXISTS trg_class_sessions_no_overlap_update;

START TRANSACTION;

-- Step 1: Shift existing sessions 10000 days into the future to completely avoid any transient unique constraint violations
UPDATE class_sessions 
SET session_date = DATE_ADD(session_date, INTERVAL 10000 DAY) 
WHERE semester_week_id IN (SELECT semester_week_id FROM semester_weeks WHERE semester_id = 4);

-- Step 2: Shift them back by 9993 days (10000 - 7), resulting in exactly a +7 days net shift
UPDATE class_sessions 
SET session_date = DATE_SUB(session_date, INTERVAL 9993 DAY) 
WHERE semester_week_id IN (SELECT semester_week_id FROM semester_weeks WHERE semester_id = 4);

-- Delete old weeks for semester 4
DELETE FROM semester_weeks WHERE semester_id = 4;

-- Insert new weeks 23 to 46 for semester 4
INSERT INTO semester_weeks (semester_id, week_no, start_date, end_date, is_break, created_at, updated_at) VALUES
(4, 23, '2026-01-12', '2026-01-18', 0, NOW(), NOW()),
(4, 24, '2026-01-19', '2026-01-25', 0, NOW(), NOW()),
(4, 25, '2026-01-26', '2026-02-01', 0, NOW(), NOW()),
(4, 26, '2026-02-02', '2026-02-08', 0, NOW(), NOW()),
(4, 27, '2026-02-09', '2026-02-15', 0, NOW(), NOW()),
(4, 28, '2026-02-16', '2026-02-22', 0, NOW(), NOW()),
(4, 29, '2026-02-23', '2026-03-01', 0, NOW(), NOW()),
(4, 30, '2026-03-02', '2026-03-08', 0, NOW(), NOW()),
(4, 31, '2026-03-09', '2026-03-15', 0, NOW(), NOW()),
(4, 32, '2026-03-16', '2026-03-22', 0, NOW(), NOW()),
(4, 33, '2026-03-23', '2026-03-29', 0, NOW(), NOW()),
(4, 34, '2026-03-30', '2026-04-05', 0, NOW(), NOW()),
(4, 35, '2026-04-06', '2026-04-12', 0, NOW(), NOW()),
(4, 36, '2026-04-13', '2026-04-19', 0, NOW(), NOW()),
(4, 37, '2026-04-20', '2026-04-26', 0, NOW(), NOW()),
(4, 38, '2026-04-27', '2026-05-03', 0, NOW(), NOW()),
(4, 39, '2026-05-04', '2026-05-10', 0, NOW(), NOW()),
(4, 40, '2026-05-11', '2026-05-17', 0, NOW(), NOW()),
(4, 41, '2026-05-18', '2026-05-24', 0, NOW(), NOW()),
(4, 42, '2026-05-25', '2026-05-31', 0, NOW(), NOW()),
(4, 43, '2026-06-01', '2026-06-07', 0, NOW(), NOW()),
(4, 44, '2026-06-08', '2026-06-14', 0, NOW(), NOW()),
(4, 45, '2026-06-15', '2026-06-21', 0, NOW(), NOW()),
(4, 46, '2026-06-22', '2026-06-28', 0, NOW(), NOW());

-- Re-link existing class sessions to the new semester_week_id based on dates
UPDATE class_sessions cs
JOIN semester_weeks sw ON sw.semester_id = 4 AND cs.session_date >= sw.start_date AND cs.session_date <= sw.end_date
SET cs.semester_week_id = sw.semester_week_id;

COMMIT;

-- Recreate the update trigger
DELIMITER //
CREATE TRIGGER trg_class_sessions_no_overlap_update
BEFORE UPDATE ON class_sessions
FOR EACH ROW
BEGIN
    IF NEW.room_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM class_sessions cs
        WHERE cs.session_id <> OLD.session_id
          AND cs.session_date = NEW.session_date
          AND cs.room_id = NEW.room_id
          AND cs.session_status <> 'cancelled'
          AND NOT (NEW.slot_end < cs.slot_start OR NEW.slot_start > cs.slot_end)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room schedule overlap in class_sessions';
    END IF;

    IF NEW.lecturer_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM class_sessions cs
        WHERE cs.session_id <> OLD.session_id
          AND cs.session_date = NEW.session_date
          AND cs.lecturer_id = NEW.lecturer_id
          AND cs.session_status <> 'cancelled'
          AND NOT (NEW.slot_end < cs.slot_start OR NEW.slot_start > cs.slot_end)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lecturer schedule overlap in class_sessions';
    END IF;

    IF EXISTS (
        SELECT 1 FROM class_sessions cs
        WHERE cs.session_id <> OLD.session_id
          AND cs.session_date = NEW.session_date
          AND cs.section_id = NEW.section_id
          AND cs.session_status <> 'cancelled'
          AND NOT (NEW.slot_end < cs.slot_start OR NEW.slot_start > cs.slot_end)
          AND (cs.practice_group_no = 0 OR NEW.practice_group_no = 0 OR cs.practice_group_no = NEW.practice_group_no)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Section schedule overlap in class_sessions';
    END IF;
END //
DELIMITER ;
