export default (t) => ({
  required: [(v) => !!v || t('VALIDATION.REQUIRED')],
  topic: [(v) => /^[\w-]+((?:\/[\w-]+)+)?$/.test(v) || t('VALIDATION.INVALID_TOPIC')],
  ipAddress: [(v) => /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/.test(v) || t('VALIDATION.INVALID_IP')],
  port: [
    (v) => {
      const valid =
        v == null || /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/.test(v);
      return valid || t('VALIDATION.INVALID_PORT');
    }
  ]
});
