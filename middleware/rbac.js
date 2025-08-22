// middleware/rbac.js
// Guards RBAC pour Chantiersync
// - suppose que authMiddleware a posé req.user = { id, role, enterprise_id }
// - rôles supportés: PLATFORM_ADMIN, TENANT_ADMIN, MANAGER, STAFF

const ROLES = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
};

// ----- Helpers -----
function isPlatformAdmin(user) {
  return user?.role === ROLES.PLATFORM_ADMIN;
}
function hasRole(user, allowed) {
  if (!user || !user.role) return false;
  const set = Array.isArray(allowed) ? allowed : [allowed];
  return set.includes(user.role);
}

// ----- Guards -----
/**
 * requireRole(['PLATFORM_ADMIN', 'TENANT_ADMIN'])
 * -> 403 si le rôle courant n'est pas dans la liste
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!hasRole(req.user, allowedRoles)) {
      return res.status(403).json({ error: 'Forbidden: role not allowed' });
    }
    return next();
  };
}

/**
 * requireSameEnterprise(getEnterpriseIdFromReq, opts)
 * - getEnterpriseIdFromReq(req) => l'enterprise_id de la ressource ciblée
 * - opts:
 *    - allowPlatformAdminGlobalRead: bool (def: true)
 *    - readOnly: bool (def: false)  // si true, autorise PLATFORM_ADMIN global même sur write
 *    - resourceLabel: string (pour messages d'erreur)
 *
 * Exemple d’usage (lecture index):
 *   router.get('/', auth, requireSameEnterprise(req => req.query.enterprise_id), handler)
 *
 * Exemple (resource par param):
 *   router.get('/:id', auth, requireSameEnterprise(async req => (await Site.findByPk(req.params.id))?.enterprise_id), handler)
 */
function requireSameEnterprise(getEnterpriseIdFromReq, opts = {}) {
  const {
    allowPlatformAdminGlobalRead = true,
    readOnly = false,
    resourceLabel = 'resource',
  } = opts;

  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      // PLATFORM_ADMIN → lecture globale autorisée si option true
      if (isPlatformAdmin(user) && allowPlatformAdminGlobalRead) {
        return next();
      }

      // Récupère le enterprise_id de la ressource
      const resEntId = await Promise.resolve(getEnterpriseIdFromReq(req));
      const userEntId = user.enterprise_id ?? null;

      if (!resEntId || !userEntId) {
        return res.status(403).json({
          error: `Forbidden: enterprise scope missing for ${resourceLabel}`,
        });
      }
      if (String(resEntId) !== String(userEntId)) {
        return res.status(403).json({
          error: `Forbidden: cross-tenant access denied for ${resourceLabel}`,
        });
      }

      // Si écriture et tu veux restreindre PLATFORM_ADMIN aussi, mets readOnly=false (défaut)
      return next();
    } catch (e) {
      return next(e);
    }
  };
}

/**
 * requireOwnership(getOwnerIdFromReq, opts)
 * - getOwnerIdFromReq(req) => l'id propriétaire de la ressource (ex: report.owner_id)
 * - opts:
 *    - allowedRolesAlso: string[] (rôles qui peuvent bypasser ownership, ex: ['TENANT_ADMIN','MANAGER'])
 *    - resourceLabel: string
 *
 * Exemple:
 *   router.patch('/:id', auth,
 *     requireOwnership(async req => (await Report.findByPk(req.params.id))?.owner_id, {
 *       allowedRolesAlso: ['TENANT_ADMIN','MANAGER']
 *     }),
 *     updateHandler);
 */
function requireOwnership(getOwnerIdFromReq, opts = {}) {
  const {
    allowedRolesAlso = [],
    resourceLabel = 'resource',
  } = opts;

  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      // Rôles qui bypassent l'ownership
      if (hasRole(user, allowedRolesAlso) || isPlatformAdmin(user)) {
        return next();
      }

      const ownerId = await Promise.resolve(getOwnerIdFromReq(req));
      if (!ownerId) {
        return res.status(404).json({ error: `${resourceLabel} not found` });
      }

      if (String(ownerId) !== String(user.id)) {
        return res.status(403).json({ error: 'Forbidden: not the owner' });
      }

      return next();
    } catch (e) {
      return next(e);
    }
  };
}

module.exports = {
  ROLES,
  hasRole,
  isPlatformAdmin,
  requireRole,
  requireSameEnterprise,
  requireOwnership,
};

