import { useEffect, useMemo, useState } from "react";
import { getStudentBadges } from "../../services/reward.service";
import { getMyOrgBadges } from "../../services/orgBadge.service";
import "../../styles/badges.css";

function getBadgeIcon(iconName) {
  const iconMap = {
    "shield-check": "🛡️",
    "key-round": "🔐",
    "user-lock": "👤",
    "mail-warning": "📧",
    "qr-code": "📱",
    "globe-lock": "🌐",
    smartphone: "📲",
    "message-circle-warning": "💬",
    "briefcase-shield": "💼",
    award: "🏅",
    trophy: "🏆",
    star: "⭐",
  };

  return iconMap[iconName] || "🏅";
}

function countByRarity(badges, rarity) {
  return badges.filter(
    (badge) => String(badge.rarity || "").toLowerCase() === rarity
  ).length;
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getBadgeThemeClass(themeColor = "blue") {
  const color = String(themeColor).toLowerCase();

  const map = {
    blue: "student-badge-card--blue",
    green: "student-badge-card--green",
    purple: "student-badge-card--purple",
    red: "student-badge-card--red",
    orange: "student-badge-card--orange",
    cyan: "student-badge-card--cyan",
    indigo: "student-badge-card--indigo",
    pink: "student-badge-card--pink",
    gold: "student-badge-card--gold",
  };

  return map[color] || "student-badge-card--blue";
}

function getRarityClass(rarity = "common") {
  const value = String(rarity).toLowerCase();

  const map = {
    common: "student-badge-rarity--common",
    rare: "student-badge-rarity--rare",
    epic: "student-badge-rarity--epic",
  };

  return map[value] || "student-badge-rarity--common";
}

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = getStoredUser();
  const role = String(user?.role || "").toLowerCase();
  const isOrgStudent = role === "org_student";

  useEffect(() => {
    loadBadges();
  }, []);

  async function loadBadges() {
    try {
      setLoading(true);

      const data = isOrgStudent
        ? await getMyOrgBadges()
        : await getStudentBadges();

      setBadges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Badge page load error:", err);
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    return {
      total: badges.length,
      common: countByRarity(badges, "common"),
      rare: countByRarity(badges, "rare"),
      epic: countByRarity(badges, "epic"),
      totalXp: badges.reduce(
        (sum, badge) => sum + Number(badge.xp_reward || 0),
        0
      ),
    };
  }, [badges]);

  if (loading) {
    return (
      <div className="student-badges-page">
        <div className="student-badges-wrap">
          <div className="student-badges-loading">
            <p>Loading badges...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-badges-page">
      <div className="student-badges-wrap">
        <section className="student-badges-hero">
          <div className="student-badges-hero__content">
            <p className="student-badges-eyebrow">Achievement Center</p>
            <h1 className="student-badges-title">My Badges</h1>
            <p className="student-badges-subtitle">
              {isOrgStudent
                ? "Rewards unlocked from your organization cybersecurity learning progress."
                : "Rewards unlocked from your cybersecurity learning progress."}
            </p>
          </div>

          <div className="student-badges-stats">
            <div className="student-badges-stat-card">
              <span>Total</span>
              <strong>{stats.total}</strong>
            </div>

            <div className="student-badges-stat-card">
              <span>Common</span>
              <strong>{stats.common}</strong>
            </div>

            <div className="student-badges-stat-card student-badges-stat-card--rare">
              <span>Rare</span>
              <strong>{stats.rare}</strong>
            </div>

            <div className="student-badges-stat-card student-badges-stat-card--xp">
              <span>Total XP</span>
              <strong>{stats.totalXp}</strong>
            </div>
          </div>
        </section>

        {badges.length === 0 ? (
          <div className="student-badges-empty">
            <div className="student-badges-empty__icon">🏅</div>
            <h2>No badges earned yet</h2>
            <p>
              {isOrgStudent
                ? "Complete your organization modules and topics to unlock badges here."
                : "Complete topics to unlock badges here."}
            </p>
          </div>
        ) : (
          <>
            <section className="student-badges-grid">
              {badges.map((badge) => (
                <article
                  key={badge.student_badge_id || badge.badge_id || badge.id}
                  className={`student-badge-card ${getBadgeThemeClass(
                    badge.theme_color
                  )}`}
                >
                  <div className="student-badge-card__top">
                    <div className="student-badge-card__icon">
                      {getBadgeIcon(badge.icon_name)}
                    </div>

                    <span
                      className={`student-badge-rarity ${getRarityClass(
                        badge.rarity
                      )}`}
                    >
                      {badge.rarity || "common"}
                    </span>
                  </div>

                  <div className="student-badge-card__header">
                    <h2>{badge.title_text || badge.subtitle || badge.name}</h2>
                    <p>{badge.subtitle || badge.name}</p>
                  </div>

                  <div className="student-badge-card__body">
                    <p className="student-badge-description">
                      {badge.description || "No description"}
                    </p>

                    <div className="student-badge-meta">
                      <div className="student-badge-meta__item">
                        <span>XP Reward</span>
                        <strong>+{badge.xp_reward || 0} XP</strong>
                      </div>

                      <div className="student-badge-meta__item">
                        <span>Earned On</span>
                        <strong>
                          {badge.awarded_at
                            ? new Date(badge.awarded_at).toLocaleDateString()
                            : "N/A"}
                        </strong>
                      </div>
                    </div>

                    <div className="student-badge-footer">
                      <span className="student-badge-footer__status">
                        Unlocked
                      </span>
                      <span className="student-badge-footer__label">
                        Achievement
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <section className="student-badges-summary">
              <div>
                <h3>Achievement Summary</h3>
                <p>
                  Keep completing your learning path to unlock the remaining rewards.
                </p>
              </div>

              <div className="student-badges-summary__chips">
                <span>{stats.common} Common</span>
                <span>{stats.rare} Rare</span>
                <span>{stats.epic} Epic</span>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}