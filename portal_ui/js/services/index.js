/**
 * DealFlow360 - Services Index
 * Consolidated registry and factory for all frontend integration services.
 */
(function(root) {
  'use strict';

  // In Node environment, require modules if needed
  let PortalApiError = (root && root.DFApi && root.DFApi.PortalApiError);
  let TokenStore = (root && root.DFApi && root.DFApi.TokenStore);
  let QueryCache = (root && root.DFApi && root.DFApi.QueryCache);
  let ApiClient = (root && root.DFApi && root.DFApi.ApiClient);

  let AuthService = (root && root.DFServices && root.DFServices.AuthService);
  let QuoteService = (root && root.DFServices && root.DFServices.QuoteService);
  let QuoteDetailService = (root && root.DFServices && root.DFServices.QuoteDetailService);
  let NegotiationService = (root && root.DFServices && root.DFServices.NegotiationService);
  let CommentService = (root && root.DFServices && root.DFServices.CommentService);
  let RevisionService = (root && root.DFServices && root.DFServices.RevisionService);
  let ConfirmationService = (root && root.DFServices && root.DFServices.ConfirmationService);
  let NotificationService = (root && root.DFServices && root.DFServices.NotificationService);
  let StatusService = (root && root.DFServices && root.DFServices.StatusService);

  if (typeof require !== 'undefined') {
    PortalApiError = PortalApiError || require('../api/PortalApiError').PortalApiError;
    TokenStore = TokenStore || require('../api/TokenStore').TokenStore;
    QueryCache = QueryCache || require('../api/QueryCache').QueryCache;
    ApiClient = ApiClient || require('../api/ApiClient').ApiClient;

    AuthService = AuthService || require('./AuthService').AuthService;
    QuoteService = QuoteService || require('./QuoteService').QuoteService;
    QuoteDetailService = QuoteDetailService || require('./QuoteDetailService').QuoteDetailService;
    NegotiationService = NegotiationService || require('./NegotiationService').NegotiationService;
    CommentService = CommentService || require('./CommentService').CommentService;
    RevisionService = RevisionService || require('./RevisionService').RevisionService;
    ConfirmationService = ConfirmationService || require('./ConfirmationService').ConfirmationService;
    NotificationService = NotificationService || require('./NotificationService').NotificationService;
    StatusService = StatusService || require('./StatusService').StatusService;
  }

  /**
   * Factory to create an isolated, fully-configured integration client suite
   */
  function createPortalClient(options) {
    const opts = options || {};
    const tokenStore = opts.tokenStore || new TokenStore(opts);
    const cache = opts.cache || new QueryCache(opts);
    const client = new ApiClient(Object.assign({}, opts, { tokenStore, cache }));

    const auth = new AuthService(client);
    const quotes = new QuoteService(client);
    const quoteDetail = new QuoteDetailService(client);
    const negotiation = new NegotiationService(client);
    const comments = new CommentService(client);
    const revisions = new RevisionService(client);
    const confirmation = new ConfirmationService(client);
    const notifications = new NotificationService(client);
    const status = new StatusService(client, negotiation);

    return {
      client,
      tokenStore,
      cache,
      auth,
      quotes,
      quoteDetail,
      negotiation,
      comments,
      revisions,
      confirmation,
      notifications,
      status
    };
  }

  // Default singleton instance
  const defaultSuite = createPortalClient();

  const DFServices = Object.assign({
    // Classes
    PortalApiError,
    TokenStore,
    QueryCache,
    ApiClient,
    AuthService,
    QuoteService,
    QuoteDetailService,
    NegotiationService,
    CommentService,
    RevisionService,
    ConfirmationService,
    NotificationService,
    StatusService,
    createPortalClient
  }, defaultSuite);

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DFServices;
  } else {
    root.DFServices = DFServices;
  }
})(typeof window !== 'undefined' ? window : this);
