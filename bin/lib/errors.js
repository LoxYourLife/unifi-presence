class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.name = 'Unauthorized';
  }
}
class TwoFactorCodeRequired extends Error {
  constructor(message) {
    super(message);
    this.name = 'TwoFactorCodeRequired';
  }
}
class Timeout extends Error {
  constructor(message) {
    super(message);
    this.name = 'Timeout';
  }
}
class Disconnected extends Error {
  constructor(message) {
    super(message);
    this.name = 'Disconnected';
  }
}
class Restarting extends Error {
  constructor(message) {
    super(message);
    this.name = 'Restarting';
  }
}
module.exports = {
  Unauthorized,
  TwoFactorCodeRequired,
  Timeout,
  Disconnected,
  Restarting
};
