(function initManttoLabContext(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabContext = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabContext(root) {
  'use strict';

  let sequence = 0;

  function requestId() {
    try {
      if (root?.crypto && typeof root.crypto.randomUUID === 'function') {
        return `LAB-${root.crypto.randomUUID()}`;
      }
    } catch (_error) {}
    sequence += 1;
    return `LAB-${Date.now()}-${sequence}`;
  }

  function safeAuthCall(auth, method) {
    try {
      return auth && typeof auth[method] === 'function' ? auth[method]() : null;
    } catch (_error) {
      return null;
    }
  }

  function authSnapshot() {
    const auth = root?.ManttoLabAuth || root?.ManttoAuth || null;
    const actorUser = safeAuthCall(auth, 'getActorUser');
    const viewUser = safeAuthCall(auth, 'getViewUser');
    const user = safeAuthCall(auth, 'getUser') || viewUser || actorUser || null;
    let readOnly = false;
    try {
      readOnly = Boolean(auth && typeof auth.isViewingAs === 'function' && auth.isViewingAs());
    } catch (_error) {}
    return { actorUser, viewUser, user, readOnly };
  }

  function create(overrides) {
    const auth = authSnapshot();
    return Object.assign({
      requestId: requestId(),
      lab: true,
      lineage: 'LAB_DGB_V2',
      mode: 'DGB',
      productionConnectionsAllowed: false,
      actorUser: auth.actorUser,
      viewUser: auth.viewUser,
      user: auth.user,
      contextUser: auth.user,
      readOnly: auth.readOnly,
      viewerContext: auth.readOnly ? { active: true, readOnly: true } : { active: false, readOnly: false },
      informationAccess: null
    }, overrides || {});
  }

  return Object.freeze({ create, requestId, authSnapshot });
});
