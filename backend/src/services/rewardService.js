const { pool } = require('../config/db');

/*
==================================================
UTILITY FUNCTIONS
==================================================
*/

async function awardBadge(studentId, badgeType, referenceId) {
    // prevent duplicate badge
    const [existing] = await pool.query(
        `SELECT id FROM student_badges sb
         JOIN badges b ON sb.badge_id = b.id
         WHERE sb.student_id = ?
         AND b.badge_type = ?
         AND b.reference_id = ?`,
        [studentId, badgeType, referenceId]
    );

    if (existing.length > 0) return;

    const [badge] = await pool.query(
        `SELECT id FROM badges
         WHERE badge_type = ?
         AND reference_id = ?`,
        [badgeType, referenceId]
    );

    if (badge.length === 0) return;

    await pool.query(
        `INSERT INTO student_badges (student_id, badge_id)
         VALUES (?, ?)`,
        [studentId, badge[0].id]
    );
}

async function awardCertificate(studentId, type, referenceId) {
    const [existing] = await pool.query(
        `SELECT id FROM certificates
         WHERE student_id = ?
         AND certificate_type = ?
         AND reference_id = ?`,
        [studentId, type, referenceId]
    );

    if (existing.length > 0) return;

    const certificateNo = `CERT-${Date.now()}-${studentId}`;

    await pool.query(
        `INSERT INTO certificates
        (student_id, certificate_no, file_path, certificate_type, reference_id)
        VALUES (?, ?, ?, ?, ?)`,
        [
            studentId,
            certificateNo,
            `/certificates/${certificateNo}.pdf`,
            type,
            referenceId
        ]
    );
}

/*
==================================================
TOPIC REWARD
==================================================
*/

async function checkTopicReward(studentId, topicId) {
    const [progress] = await pool.query(
        `SELECT status, best_quiz_score
         FROM topic_progress
         WHERE student_id = ?
         AND topic_id = ?`,
        [studentId, topicId]
    );

    if (progress.length === 0) return;

    if (progress[0].status === 'completed') {
        await awardBadge(studentId, 'topic', topicId);
    }
}

/*
==================================================
MODULE REWARD
==================================================
*/

async function checkModuleReward(studentId, moduleId) {
    const [topics] = await pool.query(
        `SELECT t.id
         FROM topics t
         WHERE t.module_id = ?`,
        [moduleId]
    );

    if (topics.length === 0) return;

    const [completed] = await pool.query(
        `SELECT COUNT(*) as count
         FROM topic_progress
         WHERE student_id = ?
         AND topic_id IN (
             SELECT id FROM topics WHERE module_id = ?
         )
         AND status = 'completed'`,
        [studentId, moduleId]
    );

    if (completed[0].count === topics.length) {
        await awardBadge(studentId, 'module', moduleId);
        await awardCertificate(studentId, 'module', moduleId);
    }
}

/*
==================================================
FINAL REWARD
==================================================
*/

async function checkFinalReward(studentId) {
    const [modules] = await pool.query(
        `SELECT COUNT(*) as total FROM modules`
    );

    const [completed] = await pool.query(
        `SELECT COUNT(*) as total
         FROM student_modules
         WHERE student_id = ?
         AND status = 'completed'`,
        [studentId]
    );

    if (completed[0].total === modules[0].total) {
        await awardBadge(studentId, 'final', 0);
        await awardCertificate(studentId, 'final', 0);
    }
}

/*
==================================================
ORGANIZATION REWARD
==================================================
*/

async function checkOrganizationReward(studentId) {
    const [user] = await pool.query(
        `SELECT organization_id FROM users WHERE id = ?`,
        [studentId]
    );

    if (!user[0] || !user[0].organization_id) return;

    const orgId = user[0].organization_id;

    const [rules] = await pool.query(
        `SELECT passing_score, modules_required
         FROM organization_rules
         WHERE organization_id = ?`,
        [orgId]
    );

    if (rules.length === 0) return;

    const required = rules[0].modules_required;

    const [completed] = await pool.query(
        `SELECT COUNT(*) as total
         FROM student_modules
         WHERE student_id = ?
         AND status = 'completed'`,
        [studentId]
    );

    if (completed[0].total >= required) {
        await awardCertificate(studentId, 'organization', orgId);
    }
}

/*
==================================================
MAIN ENTRY POINT
==================================================
*/

async function processRewards(studentId, topicId = null, moduleId = null) {

    if (topicId) {
        await checkTopicReward(studentId, topicId);
    }

    if (moduleId) {
        await checkModuleReward(studentId, moduleId);
    }

    await checkFinalReward(studentId);
    await checkOrganizationReward(studentId);
}

module.exports = {
    processRewards
};