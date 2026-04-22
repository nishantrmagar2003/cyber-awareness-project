import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import api from "../../services/api";
import {
  getOrgBadgeStats,
  getOrgBadges,
  createOrgBadge,
  getGeneralBadgesList,
} from "../../services/orgBadge.service";
import "../../styles/badges.css";

function getBadgeIcon(iconName) {
  const iconMap = {
    "shield-check": "🛡️",
    award: "🏅",
    trophy: "🏆",
    star: "⭐",
    "key-round": "🔐",
    "user-lock": "👤",
    "mail-warning": "📧",
    "qr-code": "📱",
    "globe-lock": "🌐",
    smartphone: "📲",
    "message-circle-warning": "💬",
    "briefcase-shield": "💼",
  };

  return iconMap[iconName] || "🏅";
}

function getThemeClasses(themeColor, rarity) {
  const colorMap = {
    blue: "bdg-card--blue",
    green: "bdg-card--green",
    purple: "bdg-card--purple",
    red: "bdg-card--red",
    orange: "bdg-card--orange",
    cyan: "bdg-card--cyan",
    indigo: "bdg-card--indigo",
    pink: "bdg-card--pink",
    gold: "bdg-card--gold",
  };

  const rarityClassMap = {
    common: "bdg-rarity--common",
    rare: "bdg-rarity--rare",
    epic: "bdg-rarity--epic",
  };

  return {
    cardClass: colorMap[themeColor] || "bdg-card--blue",
    rarityClass: rarityClassMap[rarity] || "bdg-rarity--common",
  };
}

function countByRarity(badges, rarity) {
  return badges.filter(
    (badge) => String(badge.rarity || "").toLowerCase() === rarity
  ).length;
}

const EMPTY_FORM = {
  name: "",
  subtitle: "",
  description: "",
  module_id: "",
  topic_id: "",
  icon_name: "shield-check",
  theme_color: "blue",
  rarity: "common",
  xp_reward: 50,
};

function SummaryCard({ label, value, note, tone = "blue" }) {
  return (
    <div className={`bdg-stat-card bdg-stat-card--${tone}`}>
      <p className="bdg-stat-card__label">{label}</p>
      <h3 className="bdg-stat-card__value">{value}</h3>
      <p className="bdg-stat-card__note">{note}</p>
    </div>
  );
}

function BadgeCard({ badge, readOnly = false }) {
  const theme = getThemeClasses(
    String(badge.theme_color || "").toLowerCase(),
    String(badge.rarity || "").toLowerCase()
  );

  const title = badge.title_text || badge.name || "Badge";
  const subtitle = badge.subtitle || badge.name || "-";
  const description = badge.description || "No description";
  const awardedCount = Number(
    badge.earned_count ?? badge.awarded_count ?? 0
  );
  const xpReward = Number(badge.xp_reward || 0);

  return (
    <div className={`bdg-card ${theme.cardClass}`}>
      <div className="bdg-card__top-panel">
        <div className="bdg-card__top">
          <div className="bdg-card__icon-wrap">{getBadgeIcon(badge.icon_name)}</div>

          <div className="bdg-card__chips">
            <span className={`bdg-rarity-chip ${theme.rarityClass}`}>
              {String(badge.rarity || "common").toUpperCase()}
            </span>
          </div>
        </div>

        <div className="bdg-card__hero">
          <h3 className="bdg-card__title">{title}</h3>
          <p className="bdg-card__subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="bdg-card__body">
        <p className="bdg-card__desc">{description}</p>

        <div className="bdg-card__metrics">
          <div className="bdg-card__metric">
            <span className="bdg-card__metric-label">XP Reward</span>
            <strong className="bdg-card__metric-value bdg-card__metric-value--xp">
              +{xpReward} XP
            </strong>
          </div>

          <div className="bdg-card__metric">
            <span className="bdg-card__metric-label">
              {readOnly ? "Awarded" : "Awarded"}
            </span>
            <strong className="bdg-card__metric-value">{awardedCount}</strong>
          </div>
        </div>

        {!readOnly && (
          <div className="bdg-card__meta">
            <p>
              <span>Module:</span> {badge.module_name || "-"}
            </p>
            <p>
              <span>Topic:</span> {badge.topic_name || "-"}
            </p>
          </div>
        )}

        <div className="bdg-card__footer">
          <span className="bdg-ready-chip">
            {readOnly ? "General Badge" : "Unlocked"}
          </span>

          <span className="bdg-card__footer-type">
            {readOnly ? "Read Only" : "Achievement"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [generalBadges, setGeneralBadges] = useState([]);
  const [stats, setStats] = useState({
    totalGeneralEarnedBadges: 0,
    totalOrgEarnedBadges: 0,
    totalOrgBadgeDefinitions: 0,
    totalEarnedBadges: 0,
  });
  const [orgModules, setOrgModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    loadPage();
  }, []);

  const selectedModule = useMemo(() => {
    return (
      orgModules.find((m) => Number(m.id) === Number(form.module_id)) || null
    );
  }, [orgModules, form.module_id]);

  const moduleTopics = useMemo(() => {
    return Array.isArray(selectedModule?.topics) ? selectedModule.topics : [];
  }, [selectedModule]);

  const badgeStats = useMemo(() => {
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

  async function loadPage() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [statsData, badgeRows, modulesRes, generalBadgeRows] =
        await Promise.all([
          getOrgBadgeStats(),
          getOrgBadges(),
          api.get("/modules"),
          getGeneralBadgesList(),
        ]);

      const modulesData = Array.isArray(modulesRes?.data?.data)
        ? modulesRes.data.data
        : Array.isArray(modulesRes?.data)
        ? modulesRes.data
        : [];

      const filteredModules = modulesData.filter(
        (module) =>
          String(module.audience_type || "").toLowerCase() === "organization"
      );

      setStats({
        totalGeneralEarnedBadges:
          Number(statsData?.totalGeneralEarnedBadges || 0),
        totalOrgEarnedBadges: Number(statsData?.totalOrgEarnedBadges || 0),
        totalOrgBadgeDefinitions: Number(
          statsData?.totalOrgBadgeDefinitions || 0
        ),
        totalEarnedBadges: Number(statsData?.totalEarnedBadges || 0),
      });

      setBadges(Array.isArray(badgeRows) ? badgeRows : []);
      setGeneralBadges(Array.isArray(generalBadgeRows) ? generalBadgeRows : []);
      setOrgModules(filteredModules);
    } catch (error) {
      console.error("Load badge page error:", error);
      setBadges([]);
      setGeneralBadges([]);
      setOrgModules([]);
      setErrorMessage("Failed to load badge page");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setErrorMessage("");
    setSuccessMessage("");
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function closeModal() {
    if (submitting) return;
    setOpen(false);
    setForm(EMPTY_FORM);
  }

  function validateForm() {
    if (!form.name.trim()) {
      setErrorMessage("Badge name is required.");
      return false;
    }

    if (!form.module_id) {
      setErrorMessage("Please select a module.");
      return false;
    }

    const xpReward = Number(form.xp_reward);
    if (Number.isNaN(xpReward) || xpReward < 0) {
      setErrorMessage("XP reward must be 0 or more.");
      return false;
    }

    return true;
  }

  async function handleCreateBadge() {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!validateForm()) return;

      await createOrgBadge({
        name: form.name.trim(),
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        module_id: Number(form.module_id),
        topic_id: form.topic_id ? Number(form.topic_id) : null,
        icon_name: form.icon_name,
        theme_color: form.theme_color,
        rarity: form.rarity,
        xp_reward: Number(form.xp_reward || 0),
        display_order: 0,
      });

      setSuccessMessage("Organization badge created successfully.");
      closeModal();
      await loadPage();
    } catch (error) {
      console.error("Create org badge error:", error);
      setErrorMessage(
        error?.response?.data?.message || "Failed to create badge"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bdg-page">
      <PageHeader
        title="Badges Management"
        subtitle="Create and manage organization badges"
        action={
          <button onClick={openCreateModal} className="bdg-primary-btn">
            Create Badge
          </button>
        }
      />

      {errorMessage && (
        <div className="bdg-alert bdg-alert--error">{errorMessage}</div>
      )}

      {successMessage && (
        <div className="bdg-alert bdg-alert--success">{successMessage}</div>
      )}

      <div className="bdg-summary-grid">
        <SummaryCard
          label="Org Badges"
          value={loading ? "..." : badgeStats.total}
          note="Organization badge definitions currently available."
          tone="blue"
        />
        <SummaryCard
          label="General Earned"
          value={loading ? "..." : stats.totalGeneralEarnedBadges}
          note="General student badges already awarded."
          tone="green"
        />
        <SummaryCard
          label="Org Earned"
          value={loading ? "..." : stats.totalOrgEarnedBadges}
          note="Organization badges already awarded."
          tone="indigo"
        />
        <SummaryCard
          label="Total XP"
          value={loading ? "..." : badgeStats.totalXp}
          note="Total XP currently configured in org badges."
          tone="amber"
        />
        <SummaryCard
          label="Common"
          value={loading ? "..." : badgeStats.common}
          note="Common rarity org badges."
          tone="slate"
        />
        <SummaryCard
          label="Rare"
          value={loading ? "..." : badgeStats.rare}
          note="Rare rarity org badges."
          tone="violet"
        />
        <SummaryCard
          label="Epic"
          value={loading ? "..." : badgeStats.epic}
          note="Epic rarity org badges."
          tone="rose"
        />
        <SummaryCard
          label="Total Earned"
          value={loading ? "..." : stats.totalEarnedBadges}
          note="Overall earned badges count."
          tone="emerald"
        />
      </div>

      <section className="bdg-section-card">
        <div className="bdg-section-header">
          <h2 className="bdg-section-title">Organization Badges</h2>
          <p className="bdg-section-subtitle">
            Real organization badge cards linked to premium modules or topics.
          </p>
        </div>

        {badges.length === 0 ? (
          <div className="bdg-empty-state">
            <div className="bdg-empty-state__icon">🏅</div>
            <h3 className="bdg-empty-state__title">No organization badges yet</h3>
            <p className="bdg-empty-state__text">
              Create your first organization badge.
            </p>
          </div>
        ) : (
          <div className="bdg-grid">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}
      </section>

      <section className="bdg-section-card">
        <div className="bdg-section-header">
          <h2 className="bdg-section-title">General Student Badges</h2>
          <p className="bdg-section-subtitle">
            Read-only list of general badges earned by general students.
          </p>
        </div>

        {generalBadges.length === 0 ? (
          <div className="bdg-empty-state">
            <h3 className="bdg-empty-state__title">No general badges found</h3>
          </div>
        ) : (
          <div className="bdg-grid">
            {generalBadges.map((badge) => (
              <BadgeCard key={`general-${badge.id}`} badge={badge} readOnly />
            ))}
          </div>
        )}
      </section>

      <Modal isOpen={open} onClose={closeModal} title="Create Organization Badge">
        <div className="bdg-modal-form">
          <div>
            <label className="bdg-modal-label">Badge Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Incident Response Starter"
              className="bdg-modal-input"
            />
          </div>

          <div>
            <label className="bdg-modal-label">Subtitle</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="e.g. Incident Response Awareness Badge"
              className="bdg-modal-input"
            />
          </div>

          <div>
            <label className="bdg-modal-label">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Awarded for completing this module or topic."
              className="bdg-modal-input bdg-modal-textarea"
            />
          </div>

          <div>
            <label className="bdg-modal-label">Module</label>
            <select
              value={form.module_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  module_id: e.target.value,
                  topic_id: "",
                })
              }
              className="bdg-modal-input"
            >
              <option value="">Select module</option>
              {orgModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="bdg-modal-label">Topic</label>
            <select
              value={form.topic_id}
              onChange={(e) => setForm({ ...form, topic_id: e.target.value })}
              className="bdg-modal-input"
              disabled={!form.module_id}
            >
              <option value="">No topic (make module badge)</option>
              {moduleTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>

          <div className="bdg-modal-grid">
            <div>
              <label className="bdg-modal-label">Icon</label>
              <select
                value={form.icon_name}
                onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
                className="bdg-modal-input"
              >
                <option value="shield-check">Shield</option>
                <option value="award">Award</option>
                <option value="trophy">Trophy</option>
                <option value="star">Star</option>
                <option value="key-round">Key</option>
                <option value="user-lock">User Lock</option>
                <option value="mail-warning">Mail Warning</option>
                <option value="qr-code">QR Code</option>
                <option value="globe-lock">Globe Lock</option>
                <option value="smartphone">Smartphone</option>
                <option value="message-circle-warning">Message Warning</option>
                <option value="briefcase-shield">Briefcase Shield</option>
              </select>
            </div>

            <div>
              <label className="bdg-modal-label">Theme Color</label>
              <select
                value={form.theme_color}
                onChange={(e) => setForm({ ...form, theme_color: e.target.value })}
                className="bdg-modal-input"
              >
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="red">Red</option>
                <option value="orange">Orange</option>
                <option value="cyan">Cyan</option>
                <option value="indigo">Indigo</option>
                <option value="pink">Pink</option>
                <option value="gold">Gold</option>
              </select>
            </div>
          </div>

          <div className="bdg-modal-grid">
            <div>
              <label className="bdg-modal-label">Rarity</label>
              <select
                value={form.rarity}
                onChange={(e) => setForm({ ...form, rarity: e.target.value })}
                className="bdg-modal-input"
              >
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
              </select>
            </div>

            <div>
              <label className="bdg-modal-label">XP Reward</label>
              <input
                type="number"
                min="0"
                value={form.xp_reward}
                onChange={(e) => setForm({ ...form, xp_reward: e.target.value })}
                className="bdg-modal-input"
              />
            </div>
          </div>

          <div className="bdg-modal-actions">
            <button
              onClick={handleCreateBadge}
              disabled={submitting}
              className="bdg-primary-btn bdg-primary-btn--full"
            >
              {submitting ? "Creating..." : "Create Badge"}
            </button>

            <button
              onClick={closeModal}
              disabled={submitting}
              className="bdg-secondary-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}