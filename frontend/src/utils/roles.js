export function normalizeRole(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[-_]/g, "");
}

export function matchesRole(userRole, expectedRole) {
  const normalizedUserRole = normalizeRole(userRole);
  const expectedRoles = Array.isArray(expectedRole) ? expectedRole : [expectedRole];

  return expectedRoles.some((role) => {
    const normalizedExpectedRole = normalizeRole(role);

    if (normalizedExpectedRole === normalizedUserRole) {
      return true;
    }

    if (
      normalizedExpectedRole === "generaluser" &&
      normalizedUserRole === "orgstudent"
    ) {
      return true;
    }

    if (
      normalizedExpectedRole === "orgstudent" &&
      normalizedUserRole === "generaluser"
    ) {
      return true;
    }

    return false;
  });
}
